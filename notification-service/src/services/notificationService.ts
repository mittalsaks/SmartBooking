import { PrismaClient, Notification } from '@prisma/client';
import { notificationQueue } from './queueService';

type PayloadData = Record<string, any>;

interface NotificationInput {
  userId: number;
  type: string;
  channel?: string;
  payload?: PayloadData;
}

export const sendNotification = async (prisma: PrismaClient, input: NotificationInput): Promise<Notification[]> => {
  const user = await prisma.user.findUnique({ where: { id: input.userId }, include: { preferences: true } });
  if (!user) {
    throw new Error('Target user not found');
  }

  const channels = input.channel ? [input.channel] : user.preferences?.notificationChannels || ['email'];
  const notifications: Notification[] = [];

  for (const channel of channels) {
    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        channel,
        payload: input.payload || {},
      },
    });

    await notificationQueue.add('send-notification', {
      notificationId: notification.id,
      userId: input.userId,
      type: input.type,
      channel,
      payload: input.payload || {},
    }, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: true,
      removeOnFail: false,
    });

    notifications.push(notification);
  }

  return notifications;
};
