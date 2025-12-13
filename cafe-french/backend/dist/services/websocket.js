"use strict";
// WebSocket Service for real-time features
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const ws_1 = require("ws");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class WebSocketService {
    constructor(wss) {
        this.clients = new Map();
        this.wss = wss;
        this.initialize();
    }
    initialize() {
        this.wss.on('connection', (ws, req) => {
            const sessionId = this.generateSessionId();
            ws.on('message', (message) => {
                try {
                    const parsed = JSON.parse(message.toString());
                    this.handleMessage(ws, sessionId, parsed);
                }
                catch (error) {
                    this.sendError(ws, 'Invalid message format');
                }
            });
            ws.on('close', () => {
                this.clients.delete(sessionId);
            });
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.clients.delete(sessionId);
            });
            // Send connection confirmation
            this.send(ws, {
                type: 'connection_status',
                data: { connected: true, sessionId }
            });
        });
    }
    handleMessage(ws, sessionId, message) {
        switch (message.type) {
            case 'authenticate':
                this.handleAuth(ws, sessionId, message.data);
                break;
            case 'typing':
                this.handleTyping(sessionId, message.data);
                break;
            case 'ping':
                this.send(ws, { type: 'pong', data: { timestamp: Date.now() } });
                break;
            default:
                this.sendError(ws, `Unknown message type: ${message.type}`);
        }
    }
    handleAuth(ws, sessionId, data) {
        try {
            const secret = process.env.JWT_SECRET || 'default-secret';
            const decoded = jsonwebtoken_1.default.verify(data.token, secret);
            this.clients.set(sessionId, {
                ws,
                userId: decoded.userId,
                sessionId
            });
            this.send(ws, {
                type: 'authenticated',
                data: { userId: decoded.userId }
            });
        }
        catch (error) {
            this.sendError(ws, 'Authentication failed');
        }
    }
    handleTyping(sessionId, data) {
        const client = this.clients.get(sessionId);
        if (!client)
            return;
        // Could broadcast to other users in same conversation if needed
    }
    // Public methods
    /**
     * Send a message to a specific user
     */
    sendToUser(userId, message) {
        for (const client of this.clients.values()) {
            if (client.userId === userId) {
                this.send(client.ws, message);
            }
        }
    }
    /**
     * Broadcast typing indicator
     */
    sendTypingIndicator(userId, isTyping) {
        this.sendToUser(userId, {
            type: 'typing_indicator',
            data: { isTyping }
        });
    }
    /**
     * Send conversation message in real-time
     */
    sendConversationMessage(userId, message) {
        this.sendToUser(userId, {
            type: 'conversation_message',
            data: message
        });
    }
    /**
     * Send pronunciation feedback
     */
    sendPronunciationFeedback(userId, feedback) {
        this.sendToUser(userId, {
            type: 'pronunciation_feedback',
            data: feedback
        });
    }
    /**
     * Send progress update
     */
    sendProgressUpdate(userId, progress) {
        this.sendToUser(userId, {
            type: 'progress_update',
            data: progress
        });
    }
    // Private helpers
    send(ws, message) {
        if (ws.readyState === ws_1.WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }
    sendError(ws, errorMessage) {
        this.send(ws, {
            type: 'error',
            data: { message: errorMessage }
        });
    }
    generateSessionId() {
        return `ws_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
}
exports.WebSocketService = WebSocketService;
//# sourceMappingURL=websocket.js.map