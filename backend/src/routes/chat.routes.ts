import { Router } from 'express';
import { chatController } from '../controllers/chat.controller.js';

const router = Router();

router.post('/message', (req, res, next) => {
  chatController.sendMessage(req, res, next);
});

router.get('/:sessionId', (req, res, next) => {
  chatController.getConversation(req, res, next);
});

export default router;
