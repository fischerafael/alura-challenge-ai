import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const context = `
        Título do vídeo:
        ${req.body.title}
        
        Descrição do vídeo:
        ${req.body.description}

        Transcrição do Vídeo:
        ${req.body.transcript}
        `;
    const response = await queryVideo(
      req.headers.api_key as string,
      req.body.query,
      context
    );
    return res.status(200).json({
      data: { response },
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";
// const MODEL_NAME = "gemini-1.5-pro-latest";
const MODEL_NAME = "gemini-1.0-pro";

async function queryVideo(apiKey: string, query: string, context: string) {
  const genAI = new GoogleGenerativeAI(apiKey);

  const generationConfig = {
    temperature: 0,
    topK: 0,
    topP: 0.95,
    maxOutputTokens: 800,
  };

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig,
  });

  const assistantPrompt = `
        Você é um chatbot muito prestativo, que responde perguntas do usuário acerca de um derminado contexto, que será fornecido a seguir.
        Não responsa nenhuma pergunta que não tenha relação com esse contexto. Se a pergunta não for relacionada a ele, diga que não tem capacidade de responder.
        Se você não encontrar a resposta para a pergunta do usuário nesse contexto, diga que não tem informações suficientes para você responder.

        contexto: ${context}
    `;

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: assistantPrompt }],
      },
      {
        role: "model",
        parts: [
          {
            text: `Ok, irei fazer como o requisitado!`,
          },
        ],
      },
      //   {
      //     role: "user",
      //     parts: [{ text: "Hello, I have 2 dogs in my house." }],
      //   },
      //   {
      //     role: "model",
      //     parts: [{ text: "Great to meet you. What would you like to know?" }],
      //   },
    ],
    generationConfig: {
      maxOutputTokens: 10000,
    },
  });

  const userMessage = `
        ${query}
    `;

  const result = await chat.sendMessage(userMessage);
  const response = await result.response;
  const text = response.text();
  return text;
}
