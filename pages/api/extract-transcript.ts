import type { NextApiRequest, NextApiResponse } from "next";
import { YoutubeLoader } from "langchain/document_loaders/web/youtube";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const loader = YoutubeLoader.createFromUrl(req.body.url, {
      language: "pt",
      addVideoInfo: true,
    });

    const response = await loader.load();
    const data = response[0];
    const transcript = data.pageContent;
    const title = data.metadata.title;
    const description = data.metadata.description;

    return res.status(200).json({
      data: { title, description, transcript },
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
