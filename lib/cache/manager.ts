import { Redis } from '@upstash/redis';

let redisInstance: Redis | null = null;

function getRedis(): Redis {
  if (!redisInstance) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error('Missing Upstash Redis environment variables');
    }

    redisInstance = new Redis({
      url,
      token,
    });
  }

  return redisInstance;
}

export class CacheManager {
  /**
   * 获取或设置缓存
   * @param key 缓存键
   * @param ttl 过期时间（秒）
   * @param fetcher 数据获取函数
   */
  async getOrSet<T>(
    key: string,
    ttl: number,
    fetcher: () => Promise<T>
  ): Promise<T> {
    try {
      const redis = getRedis();

      // 尝试从缓存获取
      const cached = await redis.get<T>(key);
      if (cached !== null) {
        console.log(`✅ 缓存命中: ${key}`);
        return cached;
      }

      console.log(`❌ 缓存未命中: ${key}, 调用 fetcher`);

      // 缓存未命中，调用 fetcher 获取数据
      const data = await fetcher();

      // 存入缓存
      await redis.setex(key, ttl, data as any);

      return data;
    } catch (error) {
      console.warn(`⚠️ 缓存操作失败: ${key}`, error);
      // 如果缓存失败，仍然调用 fetcher 返回数据
      return fetcher();
    }
  }

  /**
   * 直接获取缓存
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const redis = getRedis();
      return await redis.get<T>(key);
    } catch (error) {
      console.warn(`⚠️ 缓存读取失败: ${key}`, error);
      return null;
    }
  }

  /**
   * 直接设置缓存
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const redis = getRedis();
      if (ttl) {
        await redis.setex(key, ttl, value as any);
      } else {
        await redis.set(key, value as any);
      }
    } catch (error) {
      console.warn(`⚠️ 缓存设置失败: ${key}`, error);
    }
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<void> {
    try {
      const redis = getRedis();
      await redis.del(key);
    } catch (error) {
      console.warn(`⚠️ 缓存删除失败: ${key}`, error);
    }
  }

  /**
   * 批量删除缓存（模糊匹配）
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const redis = getRedis();
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.warn(`⚠️ 缓存批量删除失败: ${pattern}`, error);
    }
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    try {
      const redis = getRedis();
      await redis.flushdb();
    } catch (error) {
      console.warn(`⚠️ 缓存清空失败`, error);
    }
  }

  /**
   * 获取缓存大小
   */
  async size(): Promise<number> {
    try {
      const redis = getRedis();
      const keys = await redis.keys('*');
      return keys.length;
    } catch (error) {
      console.warn(`⚠️ 获取缓存大小失败`, error);
      return 0;
    }
  }
}

export const cacheManager = new CacheManager();
