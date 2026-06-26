import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const isDev = process.env.NODE_ENV !== 'production';

const prisma = new PrismaClient({
  log: isDev ? ['error', 'warn'] : ['error'],
});

export const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('PostgreSQL connected');
  } catch (error: any) {
    logger.error({ err: error }, 'Database connection error');
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await prisma.$disconnect();
};

export default prisma;
