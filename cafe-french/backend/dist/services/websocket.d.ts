import { WebSocketServer } from 'ws';
interface WSMessage {
    type: string;
    data: any;
}
declare class WebSocketService {
    private wss;
    private clients;
    constructor(wss: WebSocketServer);
    private initialize;
    private handleMessage;
    private handleAuth;
    private handleTyping;
    /**
     * Send a message to a specific user
     */
    sendToUser(userId: string, message: WSMessage): void;
    /**
     * Broadcast typing indicator
     */
    sendTypingIndicator(userId: string, isTyping: boolean): void;
    /**
     * Send conversation message in real-time
     */
    sendConversationMessage(userId: string, message: any): void;
    /**
     * Send pronunciation feedback
     */
    sendPronunciationFeedback(userId: string, feedback: any): void;
    /**
     * Send progress update
     */
    sendProgressUpdate(userId: string, progress: any): void;
    private send;
    private sendError;
    private generateSessionId;
}
export { WebSocketService };
//# sourceMappingURL=websocket.d.ts.map