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

  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}
