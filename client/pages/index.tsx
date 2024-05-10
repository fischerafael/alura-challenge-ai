import React, { useState } from "react";
import * as Chakra from "@chakra-ui/react";
import { InputText } from "../components/InputText";
import { Button } from "../components/Button";
import axios, { AxiosError } from "axios";
import { InputTextArea } from "../components/InputTextArea";

const initialState = {
  videoUrl: "",
  videoId: "",
  apiKey: "",
  isLoading: false,
  videoTranscript: "",
  videoTitle: "",
  videoDescription: "",
  isOpenVideoDetails: false,
  query: "",
  response: "",
};

export const PageMain = () => {
  const [state, setState] = useState(initialState);

  const onChange = (key: string, value: string) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const onLoading = (boolean: boolean) => {
    setState((prev) => ({ ...prev, isLoading: boolean }));
  };

  const onToggleVideoDetails = () => {
    setState((prev) => ({
      ...prev,
      isOpenVideoDetails: !prev.isOpenVideoDetails,
    }));
  };

  const onReset = () => {
    setState((prev) => ({ ...initialState, apiKey: prev.apiKey }));
  };

  const onExtractVideoId = async () => {
    try {
      onLoading(true);
      const { data: dataVideoId } = await api.post(
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
      const videoId = dataVideoId.data.video_id;

      const { data: dataTranscript } = await api.post(`/extract-transcript`, {
        id: videoId,
      });

      console.log("[data]", dataTranscript);

      onChange("videoId", videoId);
      onChange("videoTranscript", dataTranscript.data.transcript);
      onChange("videoTitle", dataTranscript.data.title);
      onChange("videoDescription", dataTranscript.data.description);
    } catch (e: any) {
      const error = e?.response?.data?.error || e.message;

      alert(`Ooops! ${error}`);
    } finally {
      onLoading(false);
    }
  };

  const onQueryVideo = async () => {
    try {
      onLoading(true);
      const { data: dataQueryResponse } = await api.post(
        `/chat`,
        {
          query: state.query,
          title: state.videoTitle,
          description: state.videoDescription,
          transcript: state.videoTranscript,
        },
        {
          headers: {
            api_key: state.apiKey,
          },
        }
      );
      const response = dataQueryResponse.data.response;
      onChange("response", response);
    } catch (e: any) {
      const error = e?.response?.data?.error || e.message;

      alert(`Ooops! ${error}`);
    } finally {
      onLoading(false);
    }
  };

  const resetResposne = () => {
    onChange("response", "");
    onChange("query", "");
  };

  return (
    <Chakra.VStack
      bg="gray.900"
      w="full"
      minH="100vh"
      align="center"
      color="gray.50"
      spacing="8"
      p="8"
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

        {state.isOpenVideoDetails && (
          <Chakra.VStack w="full" align="flex-end" spacing="0">
            <InputText
              value={state.videoTitle}
              w="full"
              label="Título do Vìdeo"
              //   isDisabled
            />
            <InputText
              value={state.videoDescription}
              w="full"
              label="Descrição do Vìdeo"
              //   isDisabled
            />
            <InputTextArea
              value={state.videoTranscript}
              w="full"
              label="Transcrição do Vìdeo"
              //   isDisabled
            />
          </Chakra.VStack>
        )}

        <Chakra.HStack w="full" align="flex-end" spacing="4">
          <InputText
            value={state.videoUrl}
            onChange={(e) => onChange("videoUrl", e.target.value)}
            w="full"
            label="Link do vídeo"
            isDisabled={!state.apiKey}
            borderRadius="full"
            h="34px"
          />
          <Button
            isLoading={state.isLoading}
            onClick={onExtractVideoId}
            isDisabled={!state.apiKey}
          >
            Carregar Vídeo
          </Button>
        </Chakra.HStack>

        <Chakra.HStack w="full" justify="center">
          <Button
            background="transparent"
            border="1px"
            borderColor="gray.600"
            color="gray.600"
            isLoading={state.isLoading}
            onClick={onToggleVideoDetails}
            size="xs"
            px="4"
          >
            {state.isOpenVideoDetails ? "Ocultar Detalhes" : "Ver Detalhes"}
          </Button>
          <Button
            background="transparent"
            border="1px"
            borderColor="gray.600"
            color="gray.600"
            isLoading={state.isLoading}
            onClick={onReset}
            size="xs"
            px="4"
          >
            Limpar Vídeo
          </Button>
        </Chakra.HStack>
      </Chakra.VStack>

      {!state.response && (
        <Chakra.HStack w="full" align="flex-end" spacing="4" maxW="720px">
          <InputTextArea
            value={state.query}
            onChange={(e) => onChange("query", e.target.value)}
            w="full"
            label="Pergunte qualquer coisa sobre o vídeo"
            isDisabled={!state.apiKey}
            borderRadius="8"
            h="34px"
          />
          <Button
            isLoading={state.isLoading}
            onClick={onQueryVideo}
            isDisabled={!state.apiKey}
          >
            Enviar
          </Button>
        </Chakra.HStack>
      )}

      {!!state.response && (
        <Chakra.VStack w="full" maxW="720px">
          <Chakra.Text>{state.response}</Chakra.Text>
          <Button
            isLoading={state.isLoading}
            onClick={resetResposne}
            isDisabled={!state.apiKey}
          >
            Ask Another Question
          </Button>
        </Chakra.VStack>
      )}
    </Chakra.VStack>
  );
};

const api = axios.create({
  baseURL: "/api",
});
