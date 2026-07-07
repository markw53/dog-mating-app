import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import { ageInYears } from '../utils/age';

const isDev = process.env.NODE_ENV !== 'production';

// `age` is a computed field so API responses keep their shape without a
// stored column that would go stale as dogs get older
const prisma = new PrismaClient({
  log: isDev ? ['error', 'warn'] : ['error'],
}).$extends({
  result: {
    dog: {
      age: {
        needs: { dateOfBirth: true },
        compute(dog) {
          return ageInYears(dog.dateOfBirth);
        },
      },
    },
  },
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
