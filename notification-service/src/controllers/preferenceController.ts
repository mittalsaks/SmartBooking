import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const prisma = req.app.get('prisma');
  const preference = await prisma.userPreference.findUnique({
    where: { userId: req.user!.id },
  });

  res.json(preference || {});
});

router.put('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const prisma = req.app.get('prisma');
  const { notificationChannels, notificationTypes } = req.body;

  const preference = await prisma.userPreference.upsert({
    where: { userId: req.user!.id },
    update: {
      notificationChannels,
      notificationTypes,
    },
    create: {
      userId: req.user!.id,
      notificationChannels,
      notificationTypes,
    },
  });

  res.json(preference);
});

export default router;
