import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ message: 'Missing authorization token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: number };
    const prisma = req.app.get('prisma');
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    req.prisma = prisma;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
