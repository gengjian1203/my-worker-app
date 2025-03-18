import { Resend } from "resend";
import { genResponse } from "../utils/genResponse";

export async function handleContact(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  try {
    // 检查请求频率限制
    //   const rateLimit = await checkRateLimit(request, env, { keyLimit: "contactlimit", maxRequests: 6, windowSeconds: 60 });
    //   if (!rateLimit.allowed) {
    //     return new Response(
    //       JSON.stringify({
    //         error: "请求过于频繁，请稍后再试",
    //         remaining: rateLimit.remaining,
    //       }),
    //       {
    //         status: 429,
    //         headers: {
    //           "Content-Type": "application/json",
    //           "X-RateLimit-Remaining": rateLimit.remaining.toString(),
    //         },
    //       }
    //     );
    //   }

    // 简单的联系表单处理逻辑
    if (request.method === "POST") {
      const formData = await request.json();

      console.log(formData);

      const resend = new Resend(env.RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: "noreply@example.com",
        to: ["test@example.com"],
        subject: "Test Email",
        html: "<div>Hello, world!</div>",
      });

      // 这里可以添加表单验证和处理逻辑
      if (error === null) {
        return genResponse({
          status: 200,
          data: {
            code: "SUCCESS",
          },
        });
      } else {
        return genResponse({
          status: 500,
          data: {
            code: "FAILED",
            error,
          },
        });
      }
    }

    return genResponse({
      status: 405,
      data: {
        code: "METHOD_NOT_ALLOWED",
      },
    });
  } catch (error) {
    return genResponse({
      status: 500,
      data: {
        code: "FAILED",
      },
    });
  }
}
