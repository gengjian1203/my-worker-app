import { Resend } from "resend";
import { genResponse } from "../../utils/genResponse";

export async function handleContact(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const { method, body, headers } = request;

  console.log("handleContact", request);

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
    if (method === "POST") {
      const formData = await request.json();
      const { name = "", email = "", message = "" } = formData as { name: string; email: string; message: string };

      console.log("handleContact formData", formData);

      if (!name || !email || !message) {
        return genResponse({
          status: 400,
          data: {
            message: "INVALID_REQUEST",
          },
        });
      }
      if (!env.NODEMAILER_USER || !env.NODEMAILER_PASSWORD || !env.CONTACT_TO_EMAIL) {
        return genResponse({
          status: 500,
          data: {
            message: "ENV_ERROR",
          },
        });
      }

      const resend = new Resend(env.RESEND_API_KEY);
      const toEmails = JSON.parse(env.CONTACT_TO_EMAIL);

      const resEmail = await resend.emails.send({
        from: "gengjian@slexmb.wecom.work",
        to: toEmails,
        subject: "[Contact] - Test Email",
        html: `<div>
          <h1>Contact Form</h1>
          <p>Name: ${name}</p>
          <p>Email: ${email}</p>
          <p>Message: ${message}</p>
        </div>`,
      });
      const { data, error } = resEmail || {};

      // 这里可以添加表单验证和处理逻辑
      if (error === null) {
        return genResponse({
          status: 200,
          data: {
            message: "SUCCESS",
          },
        });
      }

      return genResponse({
        status: 500,
        data: {
          message: "FAILED",
          error,
        },
      });
    }

    return genResponse({
      status: 405,
      data: {
        message: "METHOD_NOT_ALLOWED",
      },
    });
  } catch (error) {
    return genResponse({
      status: 500,
      data: {
        message: "FAILED",
      },
    });
  }
}
