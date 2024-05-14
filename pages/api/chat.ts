import { chatWithVideoGeminiImplementation } from "@/server/use-cases/chat-with-video";
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
    const response = await chatWithVideoGeminiImplementation({
      apiKey: req.headers.api_key as string,
      context: context,
      query: req.body.query,
    });
    return res.status(200).json({
      data: { response },
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
