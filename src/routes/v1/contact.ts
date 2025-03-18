import { Resend } from "resend";
import { genResponse } from "../../utils/genResponse";

export async function handleContact(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const { method, body, headers } = request;

  console.log("handleContact 请求开始处理", method, request.url);

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
      console.log("处理POST请求");

      // 检查请求类型和内容
      console.log("请求Content-Type:", headers.get("Content-Type"));

      let formData;
      try {
        formData = await request.json();
        console.log("解析的请求数据:", JSON.stringify(formData));
      } catch (parseError) {
        console.error("解析请求数据失败:", parseError);
        return genResponse({
          status: 400,
          data: {
            message: "INVALID_JSON",
            error: parseError instanceof Error ? parseError.message : "Unknown parsing error",
          },
        });
      }

      const { name = "", email = "", message = "" } = formData as { name: string; email: string; message: string };

      console.log("处理表单数据:", { name, email, message });

      if (!name || !email || !message) {
        console.log("表单数据验证失败: 缺少必要字段");
        return genResponse({
          status: 400,
          data: {
            message: "INVALID_REQUEST",
            details: { name: !name, email: !email, message: !message },
          },
        });
      }

      if (!env.CONTACT_TO_EMAIL || !env.RESEND_API_KEY) {
        console.log(`环境变量缺失 hasContactToEmail: ${!!env.CONTACT_TO_EMAIL}, hasResendApiKey: ${!!env.RESEND_API_KEY}`);

        return genResponse({
          status: 500,
          data: {
            message: "ENV_ERROR",
          },
        });
      }

      let toEmails;
      try {
        toEmails = JSON.parse(env.CONTACT_TO_EMAIL);
        console.log("解析的收件人邮箱:", toEmails);
      } catch (jsonError) {
        console.error("CONTACT_TO_EMAIL JSON解析错误:", jsonError, env.CONTACT_TO_EMAIL);
        return genResponse({
          status: 500,
          data: {
            message: "CONTACT_TO_EMAIL_PARSE_ERROR",
            error: jsonError instanceof Error ? jsonError.message : "Unknown JSON parse error",
          },
        });
      }

      console.log("准备发送邮件");
      try {
        if (!env.RESEND_API_KEY) {
          console.error("RESEND_API_KEY 缺失");
          return genResponse({
            status: 500,
            data: {
              message: "RESEND_API_KEY_MISSING",
            },
          });
        }

        const resend = new Resend(env.RESEND_API_KEY);
        console.log("使用的发件人:", "gengjian@slexmb.wecom.work", "收件人:", toEmails);

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

        console.log("邮件发送结果:", JSON.stringify(resEmail));
        const { data, error } = resEmail || {};

        if (error === null) {
          console.log("邮件发送成功");
          return genResponse({
            status: 200,
            data: {
              message: "SUCCESS",
            },
          });
        }

        console.error("邮件发送失败:", error);
        return genResponse({
          status: 500,
          data: {
            message: "EMAIL_SEND_FAILED",
            error,
          },
        });
      } catch (emailError) {
        console.error("发送邮件过程中发生错误:", emailError);
        return genResponse({
          status: 500,
          data: {
            message: "EMAIL_ERROR",
            error: emailError instanceof Error ? emailError.message : "Unknown email error",
          },
        });
      }
    }

    console.log("不支持的HTTP方法:", method);
    return genResponse({
      status: 405,
      data: {
        message: "METHOD_NOT_ALLOWED",
      },
    });
  } catch (error) {
    console.error("处理请求过程中发生未捕获的错误:", error);
    return genResponse({
      status: 500,
      data: {
        message: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
}
