import { Redis } from '@upstash/redis';
import type { RequestEvent } from '@builder.io/qwik-city';

export class RedisCacheService {
  private redis: Redis;
  private readonly CACHE_TTL = 60 * 60 * 24 * 7; // 7天缓存

  constructor(requestEvent: RequestEvent) {
    this.redis = new Redis({
      url: requestEvent.env.get('KV_REST_API_URL')!,
      token: requestEvent.env.get('KV_REST_API_TOKEN')!,
    });
  }

  private generateKey(commentIds: number[]): string {
    return `summary:${commentIds.sort().join(',')}`;
  }

  async getSummary(commentIds: number[]): Promise<string | null> {
    const key = this.generateKey(commentIds);
    return this.redis.get<string>(key);
  }

  async setSummary(commentIds: number[], summary: string): Promise<void> {
    const key = this.generateKey(commentIds);
    await this.redis.set(key, summary, {
      ex: this.CACHE_TTL
    });
  }
} 