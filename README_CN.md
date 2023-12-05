## 这是一个使用 tldraw 和 gpt-4-vision API 来根据你绘制的线框生成 HTML 的应用程序。

我目前正在开发一个托管版本的 draw-a-ui。你可以在 draw-a-ui.com 加入等待名单。它的核心将始终是开源的，并在这里提供。

## 应用程序演示

这个应用程序通过将当前画布的 SVG 转换为 PNG，并将该 PNG 发送给 gpt-4-vision，并指示返回一个带有 tailwind 的单个 HTML 文件来工作。

免责声明：这是一个演示，不适用于生产环境。它没有任何授权，所以如果你部署它，你会破产。

## 入门
这是一个 Next.js 应用程序。要开始，请在项目根目录运行以下命令。你将需要一个具有 GPT-4 Vision API 访问权限的 OpenAI API 密钥。

注意这使用 Next.js 14，需要 node 版本高于 18.17。在此了解更多。

```bash
echo "OPENAI_API_KEY=sk-your-key" > .env.local
npm install
npm run dev
```
在浏览器中打开 http://localhost:3000 查看结果。