import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import authRoutes from './controllers/authController';
import notificationRoutes from './controllers/notificationController';
import preferenceRoutes from './controllers/preferenceController';
import { errorHandler } from './middleware/errorMiddleware';

const prisma = new PrismaClient();
const app = express();

app.set('prisma', prisma);
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use(errorHandler);

export default app;
