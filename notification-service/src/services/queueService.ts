import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// FIX: was hardcoding the Redis URL directly in source code
// (credentials exposed in git + breaks when token rotates)
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error('REDIS_URL environment variable is not set');
}

export const redisConnection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null, // required by BullMQ
  enableReadyCheck: false,    // required for Upstash (serverless Redis)
  lazyConnect: false,
});

redisConnection.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message);
});

redisConnection.on('connect', () => {
  console.log('[Redis] Connected to Upstash');
});

export const notificationQueue = new Queue('notifications', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 100 }, // keep last 100 completed jobs for debugging
    removeOnFail: false,              // keep failed jobs so you can inspect them
  },
});