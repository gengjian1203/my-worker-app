interface RateLimitConfig {
  keyLimit: string;
  maxRequests: number; // 最大请求次数
  windowSeconds: number; // 时间窗口（秒）
}

export async function checkRateLimit(
  request: Request,
  env: Env,
  config: RateLimitConfig = { keyLimit: "ratelimit", maxRequests: 6, windowSeconds: 60 }
): Promise<{ allowed: boolean; remaining: number }> {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const key = `${config.keyLimit}:${ip}`;

  // 获取当前计数
  const current = await env.RATE_LIMIT.get(key);
  const count = current ? parseInt(current) : 0;

  if (count >= config.maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  // 如果是第一次请求，设置过期时间
  if (count === 0) {
    await env.RATE_LIMIT.put(key, "1", {
      expirationTtl: config.windowSeconds,
    });
  } else {
    // 增加计数
    await env.RATE_LIMIT.put(key, (count + 1).toString(), {
      expirationTtl: config.windowSeconds,
    });
  }

  return { allowed: true, remaining: config.maxRequests - (count + 1) };
}
