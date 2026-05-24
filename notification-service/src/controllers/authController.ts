import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();

const createToken = (userId: number) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

router.post('/register', async (req: Request, res: Response) => {
  const prisma = req.app.get('prisma') as PrismaClient;
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });

  const preferences = await prisma.userPreference.create({
    data: {
      userId: user.id,
    },
  });

  return res.status(201).json({
    token: createToken(user.id),
    user: { id: user.id, email: user.email, name: user.name },
    preferences,
  });
});

router.post('/login', async (req: Request, res: Response) => {
  const prisma = req.app.get('prisma') as PrismaClient;
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  return res.json({
    token: createToken(user.id),
    user: { id: user.id, email: user.email, name: user.name },
  });
});

export default router;
