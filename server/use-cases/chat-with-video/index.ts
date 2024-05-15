import { GoogleGenerativeAI } from "@google/generative-ai";

enum GEMINI_MODELS {
  PRO_1_0 = "gemini-1.0-pro",
  PRO_1_5 = "gemini-1.5-pro-latest",
}

interface Input {
  apiKey: string;
  query: string;
  context: string;
  model?: string;
}

interface ChatWithVideo {
  (input: Input): Promise<string>;
}

export const chatWithVideoGeminiImplementation: ChatWithVideo = async ({
  apiKey,
  context,
  model = GEMINI_MODELS.PRO_1_0,
  query,
}) => {
  const genAI = new GoogleGenerativeAI(apiKey);

  const generationConfig = {
    temperature: 0,
    topK: 0,
    topP: 0.95,
    maxOutputTokens: 800,
  };

  const llm = genAI.getGenerativeModel({
    model: model,
    generationConfig,
  });

  const assistantPrompt = `
        Você é um chatbot muito prestativo, que responde perguntas do usuário acerca de um determinado conteúdo de um vídeo, que será fornecido a seguir.
        Não responda nenhuma pergunta que não tenha relação com o conteúdo do vídeo. Se a pergunta não for relacionada a ele, diga que não encontrou a resposta para isso no vídeo.
        Se você não encontrar a resposta para a pergunta do usuário nesse contexto, diga que não encontrou a resposta para isso no vídeo.
        ---
        Conteúdo do vídeo:
        ${context}
    `;

  const chat = llm.startChat({
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
};
