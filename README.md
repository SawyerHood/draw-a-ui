# draw-a-ui

This is an app that uses tldraw and the gpt-4-vision api to generate html based on a wireframe you draw.

> I'm currently working on a hosted version of draw-a-ui. You can join the waitlist at [draw-a-ui.com](https://draw-a-ui.com). The core of it will always be open source and available here.

![A demo of the app](./demo.gif)

This works by just taking the current canvas SVG, converting it to a PNG, and sending that png to gpt-4-vision with instructions to return a single html file with tailwind.

> Disclaimer: This is a demo and is not intended for production use. It doesn't have any auth so you will go broke if you deploy it.

## Getting Started

This is a Next.js app. Write with TypeScript language. To get started run the following commands in the root directory of the project. You will need an OpenAI API key with access to the GPT-4 Vision API.

> Note this uses Next.js 14 and requires a version of `node` greater than 18.17. [Read more here](https://nextjs.org/docs/pages/building-your-application/upgrading/version-14).

```bash
echo "OPENAI_API_KEY=sk-your-key" > .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
