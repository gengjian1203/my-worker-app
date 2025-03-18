interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

// 模拟数据库
let products: Product[] = [
  { id: "1", name: "商品1", price: 99.99, description: "这是商品1的描述" },
  { id: "2", name: "商品2", price: 199.99, description: "这是商品2的描述" },
];

export async function handleProducts(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const method = request.method;
  const url = new URL(request.url);
  const productId = url.pathname.split("/").pop();

  switch (method) {
    case "GET":
      if (productId) {
        // 获取单个商品
        const product = products.find((p) => p.id === productId);
        if (!product) {
          return new Response(JSON.stringify({ error: "Product not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify(product), {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        // 获取所有商品
        return new Response(JSON.stringify(products), {
          headers: { "Content-Type": "application/json" },
        });
      }

    case "POST":
      const newProduct = (await request.json()) as Omit<Product, "id">;
      const id = String(products.length + 1);
      const productToAdd: Product = { ...newProduct, id };
      products.push(productToAdd);
      return new Response(JSON.stringify(productToAdd), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });

    case "PUT":
      if (!productId) {
        return new Response(JSON.stringify({ error: "Product ID is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const updatedProduct = (await request.json()) as Partial<Product>;
      const index = products.findIndex((p) => p.id === productId);
      if (index === -1) {
        return new Response(JSON.stringify({ error: "Product not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      products[index] = { ...products[index], ...updatedProduct };
      return new Response(JSON.stringify(products[index]), {
        headers: { "Content-Type": "application/json" },
      });

    case "DELETE":
      if (!productId) {
        return new Response(JSON.stringify({ error: "Product ID is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const deleteIndex = products.findIndex((p) => p.id === productId);
      if (deleteIndex === -1) {
        return new Response(JSON.stringify({ error: "Product not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      products = products.filter((p) => p.id !== productId);
      return new Response(null, { status: 204 });

    default:
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
  }
}
