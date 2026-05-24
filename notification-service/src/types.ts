import { Request } from 'express';
import { PrismaClient, User } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: User;
  prisma: PrismaClient;
}
