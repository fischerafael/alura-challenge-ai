import React, { useRef, useState } from "react";
import * as Chakra from "@chakra-ui/react";
import { InputText } from "../components/InputText";
import { Button } from "../components/Button";
import axios, { AxiosError } from "axios";
import { InputTextArea } from "../components/InputTextArea";

interface IState {
  videoUrl: string;
  videoId: string;
  apiKey: string;
  isLoading: boolean;
  videoTranscript: string;
  videoTitle: string;
  videoDescription: string;
  isOpenVideoDetails: boolean;
  query: string;

  responses: { content: string; role: "user" | "model" }[];
}

const initialState: IState = {
  videoUrl: "",
  videoId: "",
  apiKey: "",
  isLoading: false,
  videoTranscript: "",
  videoTitle: "",
  videoDescription: "",
  isOpenVideoDetails: false,
  query: "",
  responses: [],
};

export const PageMain = () => {
  const [state, setState] = useState(initialState);

  const ref = useRef<any>();

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

  const onCleanChat = () => {
    setState((prev) => ({ ...prev, responses: [] }));
  };

  const onAddResponse = (newResponse: string, role: "model" | "user") => {
    setState((prev) => ({
      ...prev,
      responses: [
        ...prev.responses,
        {
          content: newResponse,
          role: role,
        },
      ],
    }));
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

  const onQueryVideo = async (e: any) => {
    e.preventDefault();
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
      onAddResponse(state.query, "user");
      onAddResponse(response, "model");
      onChange("query", "");
    } catch (e: any) {
      const error = e?.response?.data?.error || e.message;

      alert(`Ooops! ${error}`);
    } finally {
      onLoading(false);
    }
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
        h="10vh"
        align="center"
        justify="space-between"
        borderBottom="1px"
        borderBottomColor="gray.600"
      >
        <Chakra.Text>TalkToYouTube</Chakra.Text>
        <InputText
          value={state.apiKey}
          onChange={(e) => onChange("apiKey", e.target.value)}
          type="password"
          w="200px"
          label="Gemini API Key"
          borderRadius="full"
        />
      </Chakra.HStack>

      <Chakra.VStack maxW="720px" w="full">
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

      {state.responses.length !== 0 && (
        <Chakra.VStack w="full" maxW="720px" gap="8">
          {state.responses.map((res) => {
            const paragraphs = res.content.split("\n");
            const paragraphsJSX = paragraphs.map((p, index) => (
              <Chakra.Text w="full" key={index}>
                {p}
              </Chakra.Text>
            ));
            return (
              <Chakra.HStack
                key={res.content}
                w="full"
                spacing="8"
                align="flex-start"
                p="8"
                bg="gray.800"
                borderRadius="16"
              >
                {res.role === "model" && (
                  <Chakra.Avatar
                    color="gray.50"
                    size="sm"
                    bg="gray.600"
                    name="Gemini"
                  />
                )}
                <Chakra.VStack w="full">{paragraphsJSX}</Chakra.VStack>

                {res.role === "user" && (
                  <Chakra.Avatar
                    color="gray.50"
                    bg="gray.600"
                    size="sm"
                    name="Usuário"
                  />
                )}
              </Chakra.HStack>
            );
          })}
          <Button
            background="transparent"
            border="1px"
            borderColor="gray.600"
            color="gray.600"
            isLoading={state.isLoading}
            onClick={onCleanChat}
            size="xs"
            px="4"
          >
            Limpar Chat
          </Button>
        </Chakra.VStack>
      )}

      {!!state.videoTranscript && (
        <Chakra.HStack
          w="full"
          align="flex-end"
          spacing="4"
          maxW="720px"
          as="form"
          onSubmit={onQueryVideo}
        >
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
            type="submit"
            isDisabled={!state.apiKey}
          >
            Enviar
          </Button>
        </Chakra.HStack>
      )}

      <Chakra.Text fontSize="xs" color="gray.50">
        Developed during 'Imersão Alura' by{" "}
        <a target="_blank" href="https://github.com/fischerafael">
          @fischerafael
        </a>
      </Chakra.Text>
    </Chakra.VStack>
  );
};

const api = axios.create({
  baseURL: "/api",
});
