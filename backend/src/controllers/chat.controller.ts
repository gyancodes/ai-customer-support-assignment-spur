import { Request, Response, NextFunction } from 'express';
import { chatService } from '../services/chat.service.js';
import { ChatRequest, AppError } from '../types/index.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(str: string): boolean {
  return UUID_REGEX.test(str);
}

export class ChatController {
  async sendMessage(
    req: Request<{}, {}, ChatRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { message, sessionId } = req.body ?? {};

      if (!req.body || typeof req.body !== 'object') {
        throw new AppError(400, 'Request body is required');
      }

      if (message === undefined || message === null) {
        throw new AppError(400, 'Message is required');
      }

      if (typeof message !== 'string') {
        throw new AppError(400, 'Message must be a string');
      }

      if (sessionId !== undefined && sessionId !== null) {
        if (typeof sessionId !== 'string') {
          throw new AppError(400, 'Session ID must be a string');
        }
        if (sessionId.trim() && !isValidUUID(sessionId.trim())) {
          throw new AppError(400, 'Invalid session ID format');
        }
      }

      const result = await chatService.processMessage(
        message, 
        sessionId?.trim() || undefined
      );

      res.json({
        reply: result.reply,
        sessionId: result.sessionId,
      });
    } catch (error) {
      next(error);
    }
  }

  async getConversation(
    req: Request<{ sessionId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId || typeof sessionId !== 'string') {
        throw new AppError(400, 'Session ID is required');
      }

      const trimmedSessionId = sessionId.trim();
      if (!trimmedSessionId) {
        throw new AppError(400, 'Session ID cannot be empty');
      }

      if (!isValidUUID(trimmedSessionId)) {
        throw new AppError(400, 'Invalid session ID format');
      }

      const result = await chatService.getConversation(trimmedSessionId);

      if (!result) {
        throw new AppError(404, 'Conversation not found');
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

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

export const chatController = new ChatController();
