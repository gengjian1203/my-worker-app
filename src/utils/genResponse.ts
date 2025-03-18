export function genResponse(params: {
  status?: number;
  headers?: Record<string, string>;
  data?: {
    message: string;
    [key: string]: any;
  };
}) {
  const {
    status = 200,
    headers = { "Content-Type": "application/json" },
    data = {
      code: 200,
      message: "SUCCESS",
    },
  } = params || {};

  data.code = status;

  // 添加CORS头部
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Access-Control-Allow-Origin", "*");
  responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key");

  return new Response(JSON.stringify(data), {
    status,
    headers: responseHeaders,
  });
}
