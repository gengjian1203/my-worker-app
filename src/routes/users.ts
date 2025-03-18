interface User {
  id: string;
  name: string;
  email: string;
}

// 模拟数据库
let users: User[] = [
  { id: "1", name: "张三", email: "zhangsan@example.com" },
  { id: "2", name: "李四", email: "lisi@example.com" },
];

export async function handleUsers(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const method = request.method;
  const url = new URL(request.url);
  const userId = url.pathname.split("/").pop();

  switch (method) {
    case "GET":
      if (userId) {
        // 获取单个用户
        const user = users.find((u) => u.id === userId);
        if (!user) {
          return new Response(JSON.stringify({ error: "User not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify(user), {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        // 获取所有用户
        return new Response(JSON.stringify(users), {
          headers: { "Content-Type": "application/json" },
        });
      }

    case "POST":
      const newUser = (await request.json()) as Omit<User, "id">;
      const id = String(users.length + 1);
      const userToAdd: User = { ...newUser, id };
      users.push(userToAdd);
      return new Response(JSON.stringify(userToAdd), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });

    case "PUT":
      if (!userId) {
        return new Response(JSON.stringify({ error: "User ID is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const updatedUser = (await request.json()) as Partial<User>;
      const index = users.findIndex((u) => u.id === userId);
      if (index === -1) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      users[index] = { ...users[index], ...updatedUser };
      return new Response(JSON.stringify(users[index]), {
        headers: { "Content-Type": "application/json" },
      });

    case "DELETE":
      if (!userId) {
        return new Response(JSON.stringify({ error: "User ID is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const deleteIndex = users.findIndex((u) => u.id === userId);
      if (deleteIndex === -1) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      users = users.filter((u) => u.id !== userId);
      return new Response(null, { status: 204 });

    default:
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
  }
}
