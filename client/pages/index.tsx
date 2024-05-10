import React, { useState } from "react";
import * as Chakra from "@chakra-ui/react";
import { InputText } from "../components/InputText";
import { Button } from "../components/Button";
import axios from "axios";

export const PageMain = () => {
  const [state, setState] = useState({
    videoUrl: "",
    videoId: "",
    apiKey: "",
    isLoading: false,
  });

  const onChange = (key: string, value: string) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const onLoading = (boolean: boolean) => {
    setState((prev) => ({ ...prev, isLoading: boolean }));
  };

  const onExtractVideoId = async () => {
    try {
      onLoading(true);
      const { data } = await api.post(
        `/extract-id-from-youtube-video`,
        {
          url: state.videoUrl,
        },
        {
          headers: {
            api_key: state.apiKey,
          },
        }
      );
      const videoId = data.data.video_id;
      onChange("videoId", videoId);
    } catch (e: any) {
      alert("Something went wrong");
    } finally {
      onLoading(false);
    }
  };

  console.log("state", state);

  return (
    <Chakra.VStack
      bg="gray.900"
      w="full"
      minH="100vh"
      align="center"
      color="gray.50"
      spacing="8"
      px="8"
    >
      <Chakra.HStack
        w="full"
        maxW="720px"
        h="15vh"
        align="center"
        justify="space-between"
        borderBottom="1px"
        borderBottomColor="gray.600"
      >
        <Chakra.Text>YouTube Video Chat</Chakra.Text>
        <InputText
          value={state.apiKey}
          onChange={(e) => onChange("apiKey", e.target.value)}
          type="password"
          w="200px"
          label="Gemini API Key"
        />
      </Chakra.HStack>

      <Chakra.VStack w="720px">
        {!!state.videoId && (
          <Chakra.AspectRatio ratio={16 / 9} width="100%">
            <iframe
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${state.videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
            ></iframe>
          </Chakra.AspectRatio>
        )}
        <Chakra.HStack w="full" align="flex-end" spacing="8">
          <InputText
            value={state.videoUrl}
            onChange={(e) => onChange("videoUrl", e.target.value)}
            w="full"
            label="Link do vídeo"
          />
          <Button isLoading={state.isLoading} onClick={onExtractVideoId}>
            Carregar Video
          </Button>
        </Chakra.HStack>
      </Chakra.VStack>
    </Chakra.VStack>
  );
};

const api = axios.create({
  baseURL: "/api",
});
