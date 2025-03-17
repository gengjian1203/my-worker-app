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

import { verifySignature } from './utils/signature';
import { handleUsers } from './routes/users';
import { handleContact } from './routes/contact';
import { handleProducts } from './routes/products';
import { checkRateLimit } from './utils/rateLimit';

interface Env {
	// 在这里定义环境变量
	API_SECRET: string;
	RATE_LIMIT: KVNamespace;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// 验证签名
		// if (!verifySignature(request, env.API_SECRET)) {
		// 	return new Response(JSON.stringify({ error: 'Invalid signature' }), {
		// 		status: 401,
		// 		headers: { 'Content-Type': 'application/json' },
		// 	});
		// }

		// 路由处理
		if (url.pathname.startsWith('/v1/contact')) {
			// 检查请求频率限制
			const rateLimit = await checkRateLimit(request, env, { keyLimit: 'contactlimit', maxRequests: 6, windowSeconds: 60 });
			if (!rateLimit.allowed) {
				return new Response(
					JSON.stringify({
						error: '请求过于频繁，请稍后再试',
						remaining: rateLimit.remaining,
					}),
					{
						status: 429,
						headers: {
							'Content-Type': 'application/json',
							'X-RateLimit-Remaining': rateLimit.remaining.toString(),
						},
					}
				);
			}

			return handleContact(request);
		}

		if (url.pathname.startsWith('/v1/api/users')) {
			return handleUsers(request);
		}

		if (url.pathname.startsWith('/v1/api/products')) {
			return handleProducts(request);
		}

		// 404 处理
		return new Response(JSON.stringify({ error: 'Not Found' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' },
		});
	},
} satisfies ExportedHandler<Env>;
