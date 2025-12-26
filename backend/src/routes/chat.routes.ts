import { Router } from 'express';
import { chatController } from '../controllers/chat.controller.js';

const router = Router();

/**
 * Chat Routes
 * 
 * POST /chat/message - Send a message and receive AI response
 * GET /chat/:sessionId - Get conversation history
 */

// Send a message
router.post('/message', (req, res, next) => {
  chatController.sendMessage(req, res, next);
});

// Get conversation history
router.get('/:sessionId', (req, res, next) => {
  chatController.getConversation(req, res, next);
});

export default router;
