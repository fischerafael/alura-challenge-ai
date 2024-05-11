import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { summarization } = await reduceTranscript(
      req.body.id,
      req.body.language
    );

    return res.status(200).json({
      data: { summarization },
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

const reduceTranscript = async (id: string, message: string) => {
  const summarization = "";

  return { summarization };
};
