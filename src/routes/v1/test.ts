import { genResponse } from "../../utils/genResponse";

export async function handleTest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const { method, url } = request;
  
  console.log("handleTest 接收到请求", method, url);
  
  try {
    // 只返回简单的JSON响应
    return genResponse({
      status: 200,
      data: {
        message: "SIMPLE_TEST_SUCCESS",
        method,
        url,
        timestamp: new Date().toISOString(),
        // 返回部分环境信息(不包含敏感信息)
        env_keys: Object.keys(env),
        has_resend_key: !!env.RESEND_API_KEY,
        has_contact_email: !!env.CONTACT_TO_EMAIL,
      },
    });
  } catch (error) {
    console.error("简单测试接口出错:", error);
    return genResponse({
      status: 500,
      data: {
        message: "SIMPLE_TEST_ERROR",
        error: error instanceof Error ? error.message : "Unknown error"
      },
    });
  }
} 