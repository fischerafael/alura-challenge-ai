import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const language = await languageDetection(
      req.headers.api_key as string,
      req.body.transcript
    );
    return res.status(200).json({
      data: { language: language },
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

async function languageDetection(apiKey: string, transcript: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
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
    { text: "input: olá, como vai" },
    { text: "output: pt" },
    { text: "input: hello, how are you" },
    { text: "output: en" },
    { text: "input: bonjour, comment ça va" },
    { text: "output: fr" },
    { text: "input: buongiorno, ma che" },
    { text: "output: it" },
    { text: `input: ${transcript}` },
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

// const supportedLanguagesCode: string[] = [
//   "aa",
//   "af",
//   "sq",
//   "am",
//   "ar",
//   "hy",
//   "as",
//   "az",
//   "eu",
//   "bn",
//   "be",
//   "bs",
//   "bg",
//   "ca",
//   "ceb",
//   "cs",
//   "zh-CN",
//   "zh-TW",
//   "si",
//   "ko",
//   "hr",
//   "da",
//   "sk",
//   "sl",
//   "es",
//   "eo",
//   "et",
//   "fi",
//   "fr",
//   "gl",
//   "cy",
//   "ka",
//   "el",
//   "gu",
//   "ha",
//   "he",
//   "hi",
//   "hu",
//   "ig",
//   "id",
//   "en",
//   "ga",
//   "is",
//   "it",
//   "ja",
//   "jv",
//   "kn",
//   "kk",
//   "km",
//   "ky",
//   "lo",
//   "la",
//   "lv",
//   "lt",
//   "lb",
//   "mk",
//   "ml",
//   "mg",
//   "mt",
//   "mi",
//   "mr",
//   "mn",
//   "me",
//   "my",
//   "ne",
//   "nl",
//   "no",
//   "or",
//   "pa",
//   "fa",
//   "pl",
//   "pt-BR",
//   "pt-PT",
//   "qu",
//   "ro",
//   "ru",
//   "sm",
//   "sr",
//   "st",
//   "sn",
//   "sd",
//   "si",
//   "sk",
//   "sl",
//   "so",
//   "es",
//   "su",
//   "sw",
//   "sv",
//   "tl",
//   "tg",
//   "ta",
//   "te",
//   "th",
//   "tr",
//   "tk",
//   "uk",
//   "ur",
//   "uz",
//   "vi",
//   "xh",
//   "yi",
//   "zu",
// ];
