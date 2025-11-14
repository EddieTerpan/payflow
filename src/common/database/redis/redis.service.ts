import { Injectable, Inject } from '@nestjs/common';
import type { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly client: RedisClientType,
  ) {}

  async get<T = unknown>(key: string): Promise<T | null> {
    const val = await this.client.get(key);
    if (!val) return null;

    try {
      return JSON.parse(val) as T;
    } catch {
      return val as unknown as T;
    }
  }

  async set(key: string, value: unknown, ttlSec?: number): Promise<void> {
    const data = JSON.stringify(value);
    if (ttlSec) {
      await this.client.setEx(key, ttlSec, data);
    } else {
      await this.client.set(key, data);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
