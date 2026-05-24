import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import IORedis from 'ioredis';
import { sendEmail, sendSms, sendWhatsApp } from '../utils/notificationChannels';
import { buildNotificationHtml } from '../utils/emailTemplates';

const prisma = new PrismaClient();

// Create a guaranteed, direct connection to Upstash for this worker
const workerConnection = new IORedis("rediss://default:gQAAAAAAAXPdAAIgcDJjODU5YTZmMzBhMTU0MjQyOTU4NDI1MzdmOGQ5NDFmNQ@unbiased-lark-95197.upstash.io:6379", {
    maxRetriesPerRequest: null
});

export const startNotificationWorker = async () => {
  new Worker('notifications', async (job: Job) => {
    const { notificationId, userId, type, channel, payload } = job.data;
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!notification || !user) {
      throw new Error('Notification or user missing');
    }

    const template = buildNotificationHtml(type, payload as Record<string, any>);
    const subject = template.subject;
    const body = template.html;
    const targetPhone = user.phone;

    try {
      if (channel === 'sms') {
        if (!targetPhone) throw new Error('Recipient phone number is missing');
        await sendSms(targetPhone, payload as Record<string, any>);
      } else if (channel === 'whatsapp') {
        if (!targetPhone) throw new Error('Recipient phone number is missing');
        await sendWhatsApp(targetPhone, payload as Record<string, any>);
      } else {
        await sendEmail(user.email, subject, body);
      }

      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'sent',
          sentAt: new Date(),
          retries: job.attemptsMade,
        },
      });
    } catch (error: any) {
      const message = error?.message || 'Unknown send error';
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'failed',
          error: message,
          retries: job.attemptsMade,
        },
      });
      throw error;
    }
  }, {
    connection: workerConnection, // <-- NOW USING THE DIRECT CONNECTION
    autorun: true,
  });
};