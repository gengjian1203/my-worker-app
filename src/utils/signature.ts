import md5 from "blueimp-md5";

export function verifySignature(request: Request, secret: string): boolean {
  const method = request.method;
  const url = new URL(request.url);

  const signature = request.headers.get("X-Signature");
  if (!signature) return false;

  const timestamp = request.headers.get("X-Timestamp");
  if (!timestamp) return false;

  // 验证时间戳是否在5分钟内
  // const now = Date.now();
  // const requestTime = parseInt(timestamp);
  // if (Math.abs(now - requestTime) > 5 * 60 * 1000) return false;

  // 获取请求体
  const body = request.body;
  if (!body) return false;

  // 计算签名 - md5 直接返回 hex 字符串
  const message = `${timestamp}${body}`;
  const calculatedSignature = md5(message);

  // 比较签名
  return calculatedSignature === signature;
}
