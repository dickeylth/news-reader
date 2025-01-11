import { Redis } from '@upstash/redis';

export class RedisCacheService {
  private redis: Redis;
  private readonly CACHE_TTL = 60 * 60 * 24 * 7; // 7天缓存

  constructor() {
    this.redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }

  async getSummary(keys: string[] | number[]): Promise<string | null> {
    const key = keys.map(String).sort().join(',');
    return this.redis.get<string>(key);
  }

  async setSummary(keys: string[] | number[], summary: string): Promise<void> {
    const key = keys.map(String).sort().join(',');
    await this.redis.set(key, summary, {
      ex: this.CACHE_TTL
    });
  }
} 