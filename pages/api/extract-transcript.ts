import { YoutubeLoader } from "langchain/document_loaders/web/youtube";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { description, title, transcript } = await extractTranscript(
      req.body.id
    );

    return res.status(200).json({
      data: { title, description, transcript },
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

const extractTranscript = async (id: string, language: string = "pt") => {
  const loader = YoutubeLoader.createFromUrl(`https://youtu.be/${id}`, {
    language,
    addVideoInfo: true,
  });

  const response = await loader.load();
  const data = response[0];
  const transcript = data.pageContent;
  const title = data.metadata.title;
  const description = data.metadata.description;

  return { transcript, title, description };
};
