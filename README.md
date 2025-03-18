# my-worker-app

这是一个基于Cloudflare Workers的应用程序，提供联系表单和API服务。

## 相关链接

- [1. Cloudflare Workers 入门指南](https://developers.cloudflare.com/workers/get-started/guide/)
- [2. Cloudflare Workers Env](https://developers.cloudflare.com/workers/configuration/environment-variables/)
- [3. Resend](https://resend.com/)
- [4. Zoho Mail](https://mailadmin.zoho.com/)

## 本地开发

1. 安装依赖：

   ```
   npm install
   ```

2. 配置本地环境变量：

   - 复制并编辑`.dev.vars.example`文件为`.dev.vars`
   - 填入所需的API密钥和其他配置

3. 启动本地开发服务器：

   ```
   npm run dev
   ```

4. 访问本地API：
   - http://localhost:8787/v1/contact
   - http://localhost:8787/v1/simple-test
   - 其他API端点...

## 部署到Cloudflare Workers

1. 确保已安装并登录wrangler CLI：

   ```
   npm install -g wrangler
   wrangler login
   ```

2. 配置环境变量和密钥：
   ```
   wrangler secret put RESEND_API_KEY
   wrangler secret put NODEMAILER_PASSWORD
   wrangler secret put API_SECRET
   ```
3. 配置其他环境变量：

   - 在Cloudflare控制台中设置`CONTACT_TO_EMAIL`和`NODEMAILER_USER`等非敏感信息
   - 或者在wrangler.toml文件中更新[vars]部分

4. 如果使用KV存储，需要创建KV命名空间：

   ```
   wrangler kv:namespace create "RATE_LIMIT"
   ```

   然后更新wrangler.toml中的KV命名空间ID

5. 部署应用：
   ```
   npm run deploy
   ```

## 故障排除

如果部署后API无法工作，请检查：

1. 环境变量是否正确配置
2. Cloudflare Workers日志查看错误信息
3. 尝试访问简化测试接口 `/v1/simple-test` 检查基本功能
4. 确保KV命名空间（如果使用）已正确绑定
5. 检查API密钥是否有效

## API端点

- `GET /v1/simple-test` - 简单测试接口
- `POST /v1/contact` - 联系表单处理
- `GET /v1/api/users` - 用户数据API
- `GET /v1/api/products` - 产品数据API
