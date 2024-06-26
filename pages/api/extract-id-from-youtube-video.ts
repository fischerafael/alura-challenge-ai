import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const video_id = await extractIdFromYoutubeVideo(
      req.body.url,
      req.headers.api_key as string
    );
    return res.status(200).json({
      data: { video_id: video_id },
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";

const MODEL_NAME = "gemini-1.0-pro";
// const API_KEY = process.env.GEMINI_API_KEY;

async function extractIdFromYoutubeVideo(url: string, apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0,
    topK: 0,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const parts = [
    { text: "você é especialista em extrair o id de vídeos do youtube" },
    {
      text: "input: https://www.youtube.com/watch?v=90NAf1ANJ0E&ab_channel=Alura",
    },
    { text: "output: 90NAf1ANJ0E" },
    { text: "input: https://youtu.be/90NAf1ANJ0E?si=Gh45Q1Kbzdi7A5Tl" },
    { text: "output: 90NAf1ANJ0E" },
    {
      text: "input: https://www.youtube.com/watch?v=CLbaMfS0xZw&ab_channel=CatFactoryLofi",
    },
    { text: "output: CLbaMfS0xZw" },
    { text: "input: https://youtu.be/CLbaMfS0xZw?si=2YCBaKVzEfTEMaPQ" },
    { text: "output: CLbaMfS0xZw" },
    {
      text: `input: ${url}`,
    },
    { text: "output: " },
  ];

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig,
    safetySettings,
  });

  const response = result.response;
  return response.text();
}
