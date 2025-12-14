// Café French Backend - Main Entry Point

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { authMiddleware } from './middleware/auth';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import lessonRoutes from './routes/lessons';
import conversationRoutes from './routes/conversation';
import pronunciationRoutes from './routes/pronunciation';
import srsRoutes from './routes/srs';
import mistakesRoutes from './routes/mistakes';
import progressRoutes from './routes/progress';
import contentRoutes from './routes/content';
import speechRoutes from './routes/speech';

// Services
import { DatabaseService } from './services/database';
import { WebSocketService } from './services/websocket';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server for WebSocket support
const server = createServer(app);

// Initialize WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });
const wsService = new WebSocketService(wss);

// Initialize database
const db = DatabaseService.getInstance();
db.initialize();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(rateLimiter);

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
app.use('/api/auth', authRoutes);
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/lessons', authMiddleware, lessonRoutes);
app.use('/api/conversation', authMiddleware, conversationRoutes);
app.use('/api/pronunciation', authMiddleware, pronunciationRoutes);
app.use('/api/srs', authMiddleware, srsRoutes);
app.use('/api/mistakes', authMiddleware, mistakesRoutes);
app.use('/api/progress', authMiddleware, progressRoutes);
app.use('/api/content', authMiddleware, contentRoutes);
app.use('/api/speech', authMiddleware, speechRoutes);

// Error handling
app.use(errorHandler);

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

export { app, server, wsService };
