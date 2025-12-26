import { Request, Response, NextFunction } from 'express';
import { chatService } from '../services/chat.service.js';
import { ChatRequest, AppError } from '../types/index.js';

/**
 * Chat Controller - Handles HTTP requests for chat operations
 */
export class ChatController {
  /**
   * POST /chat/message
   * Process a new message and return AI response
   */
  async sendMessage(
    req: Request<{}, {}, ChatRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { message, sessionId } = req.body;

      // Input validation
      if (typeof message !== 'string') {
        throw new AppError(400, 'Message must be a string');
      }

      const result = await chatService.processMessage(message, sessionId);

      res.json({
        reply: result.reply,
        sessionId: result.sessionId,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /chat/:sessionId
   * Retrieve conversation history
   */
  async getConversation(
    req: Request<{ sessionId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        throw new AppError(400, 'Session ID is required');
      }

      const result = await chatService.getConversation(sessionId);

      if (!result) {
        throw new AppError(404, 'Conversation not found');
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /health
   * Health check endpoint
   */
  async healthCheck(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const chatController = new ChatController();
