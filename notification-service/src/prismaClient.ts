import 'dotenv/config'; // Forces the .env to load first!
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;