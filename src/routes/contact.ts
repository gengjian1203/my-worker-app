import { genResponse } from "../utils/genResponse";

export async function handleContact(request: Request): Promise<Response> {
  try {
    // 简单的联系表单处理逻辑
    if (request.method === "POST") {
      const formData = await request.json();

	  console.log(formData);

      // 这里可以添加表单验证和处理逻辑
      if (1 === 1) {
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
