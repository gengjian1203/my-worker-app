export function genResponse(params: {
  status?: number;
  headers?: Record<string, string>;
  data?: {
    code: string;
    [key: string]: any;
  };
}) {
  const {
    status = 200,
    headers = { "Content-Type": "application/json" },
    data = {
      code: "SUCCESS",
    },
  } = params || {};

  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}
