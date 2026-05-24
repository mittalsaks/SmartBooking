import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { AuthenticatedRequest } from '../types';
import { sendNotification } from '../services/notificationService';

const router = Router();

router.post('/send', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const prisma = req.app.get('prisma');
  const { userId, type, payload, channel } = req.body;

  if (!userId || !type) {
    return res.status(400).json({ message: 'userId and type are required' });
  }

  const notifications = await sendNotification(prisma, {
    userId,
    type,
    payload,
    channel,
  });

  res.status(201).json(notifications);
});

router.get('/history', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const prisma = req.app.get('prisma');
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(notifications);
});

export default router;
