/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { handleContact as handleV1Contact } from "./routes/v1/contact";
import { handleProducts as handleV1Products } from "./routes/v1/products";
import { handleTest as handleV1Test } from "./routes/v1/test";
import { handleUsers as handleV1Users } from "./routes/v1/users";
import { genResponse } from "./utils/genResponse";

interface Env {
  // 在这里定义环境变量
  RATE_LIMIT: KVNamespace;
  API_SECRET: string;
  RESEND_API_KEY: string;
  CONTACT_TO_EMAIL: string;
  NODEMAILER_USER: string;
  NODEMAILER_PASSWORD: string;
}

// 处理CORS的辅助函数
function handleCors(request: Request): Response | null {
  // 处理预检请求
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
        "Access-Control-Max-Age": "86400",
      },
    });
  }
  return null;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    console.log("收到请求：", request.method, url.pathname);

    // 处理CORS预检请求
    const corsResponse = handleCors(request);
    if (corsResponse) {
      return corsResponse;
    }

    // 验证签名
    // if (!verifySignature(request, env.API_SECRET)) {
    // 	return new Response(JSON.stringify({ error: 'Invalid signature' }), {
    // 		status: 401,
    // 		headers: { 'Content-Type': 'application/json' },
    // 	});
    // }

    // 路由处理
    if (url.pathname.startsWith("/v1/test")) {
      return handleV1Test(request, env, ctx);
    }

    if (url.pathname.startsWith("/v1/contact")) {
      return handleV1Contact(request, env, ctx);
    }

    if (url.pathname.startsWith("/v1/api/users")) {
      return handleV1Users(request, env, ctx);
    }

    if (url.pathname.startsWith("/v1/api/products")) {
      return handleV1Products(request, env, ctx);
    }

    // 404 处理
    return genResponse({
      status: 404,
      data: {
        message: "NOT_FOUND",
      },
    });
  },
} satisfies ExportedHandler<Env>;
