import { Module, Global } from '@nestjs/common';

import { RedisService } from './redis.service';
import { createClient, RedisClientType } from 'redis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (): Promise<RedisClientType> => {
        const client: RedisClientType = createClient({
          url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
        });

        client.on('error', (err: Error) => {
          console.error('Redis connection error:', err.message);
        });

        await client.connect();
        return client;
      },
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
