"use strict";
// Café French Backend - Main Entry Point
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsService = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const ws_1 = require("ws");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const auth_1 = require("./middleware/auth");
// Routes
const auth_2 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const lessons_1 = __importDefault(require("./routes/lessons"));
const conversation_1 = __importDefault(require("./routes/conversation"));
const pronunciation_1 = __importDefault(require("./routes/pronunciation"));
const srs_1 = __importDefault(require("./routes/srs"));
const mistakes_1 = __importDefault(require("./routes/mistakes"));
const progress_1 = __importDefault(require("./routes/progress"));
const content_1 = __importDefault(require("./routes/content"));
const speech_1 = __importDefault(require("./routes/speech"));
// Services
const database_1 = require("./services/database");
const websocket_1 = require("./services/websocket");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const PORT = process.env.PORT || 3000;
// Create HTTP server for WebSocket support
const server = (0, http_1.createServer)(app);
exports.server = server;
// Initialize WebSocket server
const wss = new ws_1.WebSocketServer({ server, path: '/ws' });
const wsService = new websocket_1.WebSocketService(wss);
exports.wsService = wsService;
// Initialize database
const db = database_1.DatabaseService.getInstance();
db.initialize();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use(rateLimiter_1.rateLimiter);
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        name: 'Café French API'
    });
});
// API Routes
app.use('/api/auth', auth_2.default);
app.use('/api/user', auth_1.authMiddleware, user_1.default);
app.use('/api/lessons', auth_1.authMiddleware, lessons_1.default);
app.use('/api/conversation', auth_1.authMiddleware, conversation_1.default);
app.use('/api/pronunciation', auth_1.authMiddleware, pronunciation_1.default);
app.use('/api/srs', auth_1.authMiddleware, srs_1.default);
app.use('/api/mistakes', auth_1.authMiddleware, mistakes_1.default);
app.use('/api/progress', auth_1.authMiddleware, progress_1.default);
app.use('/api/content', auth_1.authMiddleware, content_1.default);
app.use('/api/speech', auth_1.authMiddleware, speech_1.default);
// Error handling
app.use(errorHandler_1.errorHandler);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`
        }
    });
});
// Start server
server.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ☕ Café French API Server                                  ║
║                                                              ║
║   Version: 2.0.0                                             ║
║   Port: ${PORT}                                                 ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║                                                              ║
║   Ready to help you learn French! 🇫🇷                         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        db.close();
        process.exit(0);
    });
});
//# sourceMappingURL=index.js.map