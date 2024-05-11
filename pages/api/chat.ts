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
    const response = await chatWithVideo(
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

async function chatWithVideo(apiKey: string, query: string, context: string) {
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
        Você é um chatbot muito prestativo, que responde perguntas do usuário acerca de um determinado conteúdo de um vídeo, que será fornecido a seguir.
        Não responda nenhuma pergunta que não tenha relação com o conteúdo do vídeo. Se a pergunta não for relacionada a ele, diga que não encontrou a resposta para isso no vídeo.
        Se você não encontrar a resposta para a pergunta do usuário nesse contexto, diga que não encontrou a resposta para isso no vídeo.

        conteúdo do vídeo: ${context}
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
    ],
    generationConfig: {
      maxOutputTokens: 10000,
    },
  });

  const count = assistantPrompt.length;

  if (count > 25000)
    throw new Error(
      "Vídeo muito longo ou com muito conteúdo. Tente um mais curto"
    );

  const userMessage = query;

  const result = await chat.sendMessage(userMessage);
  const response = await result.response;
  const text = response.text();
  return text;
}
