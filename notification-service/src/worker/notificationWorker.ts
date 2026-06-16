import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { redisConnection } from '../services/queueService';
import { sendEmail, sendSms, sendWhatsApp } from '../utils/notificationChannels';
import { buildNotificationHtml } from '../utils/emailTemplates';

const prisma = new PrismaClient();

export const startNotificationWorker = async () => {
  const worker = new Worker(
    'notifications',
    async (job: Job) => {
      const { notificationId, userId, type, channel, payload } = job.data;

      const [notification, user] = await Promise.all([
        prisma.notification.findUnique({ where: { id: notificationId } }),
        prisma.user.findUnique({ where: { id: userId } }),
      ]);

      // ✅ Sirf notification check karo — user null ho sakta hai guest booking mein
      if (!notification) {
        throw new Error(`Notification ${notificationId} not found`);
      }

      const template = buildNotificationHtml(type, payload as Record<string, any>);

      try {
        if (channel === 'sms') {
          const toPhone = (payload as any).customerPhone || user?.phone;
          if (!toPhone) throw new Error('Recipient phone number is missing for SMS');
          await sendSms(toPhone, payload as Record<string, any>);

        } else if (channel === 'whatsapp') {
          // ✅ payload.customerPhone pehle try karo, phir user.phone
          const toPhone = (payload as any).customerPhone || user?.phone;
          if (!toPhone) throw new Error('Recipient phone number is missing for WhatsApp');
          await sendWhatsApp(toPhone, payload as Record<string, any>);

        } else {
          // default: email
          const toEmail = (payload as any).customerEmail || user?.email;
          if (!toEmail) throw new Error('Recipient email is missing');
          await sendEmail(toEmail, template.subject, template.html);
        }

        await prisma.notification.update({
          where: { id: notificationId },
          data: { status: 'sent', sentAt: new Date(), retries: job.attemptsMade },
        });

        console.log(`[Worker] Notification ${notificationId} sent via ${channel}`);

      } catch (error: any) {
        const message = error?.message || 'Unknown send error';
        await prisma.notification.update({
          where: { id: notificationId },
          data: { status: 'failed', error: message, retries: job.attemptsMade },
        });
        console.error(`[Worker] Notification ${notificationId} failed: ${message}`);
        throw error;
      }
    },
    {
      connection: redisConnection,
      autorun: true,
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => console.log(`[Worker] Job ${job.id} completed`));
  worker.on('failed', (job, err) => console.error(`[Worker] Job ${job?.id} failed:`, err.message));

  console.log('[Worker] Notification worker started');
  return worker;
};