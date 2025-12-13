// WebSocket Service for real-time features

import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';

interface WSClient {
  ws: WebSocket;
  userId: string;
  sessionId: string;
}

interface WSMessage {
  type: string;
  data: any;
}

class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, WSClient> = new Map();

  constructor(wss: WebSocketServer) {
    this.wss = wss;
    this.initialize();
  }

  private initialize(): void {
    this.wss.on('connection', (ws: WebSocket, req: any) => {
      const sessionId = this.generateSessionId();
      
      ws.on('message', (message: string) => {
        try {
          const parsed: WSMessage = JSON.parse(message.toString());
          this.handleMessage(ws, sessionId, parsed);
        } catch (error) {
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

  private handleMessage(ws: WebSocket, sessionId: string, message: WSMessage): void {
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

  private handleAuth(ws: WebSocket, sessionId: string, data: { token: string }): void {
    try {
      const secret = process.env.JWT_SECRET || 'default-secret';
      const decoded = jwt.verify(data.token, secret) as { userId: string };
      
      this.clients.set(sessionId, {
        ws,
        userId: decoded.userId,
        sessionId
      });

      this.send(ws, {
        type: 'authenticated',
        data: { userId: decoded.userId }
      });
    } catch (error) {
      this.sendError(ws, 'Authentication failed');
    }
  }

  private handleTyping(sessionId: string, data: { conversationId: string; isTyping: boolean }): void {
    const client = this.clients.get(sessionId);
    if (!client) return;

    // Could broadcast to other users in same conversation if needed
  }

  // Public methods

  /**
   * Send a message to a specific user
   */
  sendToUser(userId: string, message: WSMessage): void {
    for (const client of this.clients.values()) {
      if (client.userId === userId) {
        this.send(client.ws, message);
      }
    }
  }

  /**
   * Broadcast typing indicator
   */
  sendTypingIndicator(userId: string, isTyping: boolean): void {
    this.sendToUser(userId, {
      type: 'typing_indicator',
      data: { isTyping }
    });
  }

  /**
   * Send conversation message in real-time
   */
  sendConversationMessage(userId: string, message: any): void {
    this.sendToUser(userId, {
      type: 'conversation_message',
      data: message
    });
  }

  /**
   * Send pronunciation feedback
   */
  sendPronunciationFeedback(userId: string, feedback: any): void {
    this.sendToUser(userId, {
      type: 'pronunciation_feedback',
      data: feedback
    });
  }

  /**
   * Send progress update
   */
  sendProgressUpdate(userId: string, progress: any): void {
    this.sendToUser(userId, {
      type: 'progress_update',
      data: progress
    });
  }

  // Private helpers

  private send(ws: WebSocket, message: WSMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: WebSocket, errorMessage: string): void {
    this.send(ws, {
      type: 'error',
      data: { message: errorMessage }
    });
  }

  private generateSessionId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

export { WebSocketService };
