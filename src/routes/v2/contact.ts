import nodemailer from "nodemailer";
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

      let toEmails = [];
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

      const sendEmail = await nodemailer.createTransport({
        host: "smtp.qq.com", //SMTP服务器地址
        port: 465, //端口号，通常为465，587，994，不同的邮件客户端端口号可能不一样
        secure: true, //如果端口是465，就为true;如果是其它就填false
        auth: {
          user: env.NODEMAILER_USER, //邮箱账号，填写已开启SMTP服务的邮箱地址即可
          pass: env.NODEMAILER_PASSWORD, // "zvrvmqavbcnnbhaa", //邮箱密码，不同的邮件系统可能机制不一样，QQ邮箱和网易邮箱为邮箱授权码
        },
      });

      const emailMessage = {
        from: env.NODEMAILER_USER,
        to: env.CONTACT_TO_EMAIL,
        subject: "[Contact] - Test Email",
        html: `<div>
          <h1>Contact Form</h1>
          <p>Name: ${name}</p>
          <p>Email: ${email}</p>
          <p>Message: ${message}</p>
        </div>`,
      };

      const resEmail = await sendEmail.sendMail(emailMessage);

      console.log("handleContact send email result", resEmail);

      // 这里可以添加表单验证和处理逻辑
      if (resEmail) {
        return genResponse({
          status: 200,
          data: {
            message: "SUCCESS",
          },
        });
      } else {
        return genResponse({
          status: 500,
          data: {
            message: "FAILED",
          },
        });
      }
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
