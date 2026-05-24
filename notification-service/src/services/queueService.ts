import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

// Bypassing the .env file to guarantee a connection
const connection = new IORedis("rediss://default:gQAAAAAAAXPdAAIgcDJjODU5YTZmMzBhMTU0MjQyOTU4NDI1MzdmOGQ5NDFmNQ@unbiased-lark-95197.upstash.io:6379", {
    maxRetriesPerRequest: null 
});

export const notificationQueue = new Queue('notifications', { connection });