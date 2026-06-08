


import { createClient } from 'redis';
import env from './env';


export const redisClient = createClient({
  url: env.REDIS_URL || 'redis://127.0.0.1:6379',
});

redisClient.on('error', (error: any) =>
  console.log('Redis client error', error)
);

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('Redis connected successfully! 🎉');
  }
};