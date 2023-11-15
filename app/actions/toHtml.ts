"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `You are an expert tailwind developer. A user will provide you with a
 low-fidelity wireframe of an application and you will return 
 a single html file that uses tailwind to create the website. Use creative license to make the application more fleshed out.
if you need to insert an image, use placehold.co to create a placeholder image. Respond only with the html file.`;

export async function toHtml(imageUrl: string) {
  try {
    const {
      choices: [
        {
          message: { content },
        },
      ],
    } = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
            {
              type: "text",
              text: "Turn this into a single html file using tailwind.",
            },
          ],
        },
      ],
    });
    if (!content) throw new Error("No content returned from OpenAI");
    const start = content.indexOf("<!DOCTYPE html>");
    const end = content.indexOf("</html>");
    const html = content.slice(start, end + "</html>".length);
    return html;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
