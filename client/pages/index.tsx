import * as Chakra from "@chakra-ui/react";
import * as Icon from "react-icons/hi";
import axios from "axios";
import { useState } from "react";
import { Button } from "../components/Button";
import { InputText } from "../components/InputText";
import { InputTextArea } from "../components/InputTextArea";
import { join } from "path";

interface IState {
  videoUrl: string;
  videoId: string;
  apiKey: string;
  isLoading: boolean;
  videoLanguage: string;
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
  videoLanguage: "",
  videoTranscript: "",
  videoTitle: "",
  videoDescription: "",
  isOpenVideoDetails: false,
  query: "",
  responses: [],
};

export const PageMain = () => {
  const toast = Chakra.useToast();

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

  const onSetDefaultMessage = (message: string) => {
    onChange("query", message);
  };

  const onExtractVideoId = async () => {
    try {
      onLoading(true);
      const { videoId } = await services.extractIdFromYoutubeVideo(
        state.videoUrl,
        state.apiKey
      );

      const { description, title, transcript } =
        await services.extractTranscript(videoId, state.videoLanguage);

      onChange("videoId", videoId);
      onChange("videoTranscript", transcript);
      onChange("videoTitle", title);
      onChange("videoDescription", description);
      toast({
        title: "Successo!",
        description:
          "Transcrição do video carregada com sucesso. Você já pode começar a conversar com ele!",
        colorScheme: "green",
        position: "top",
      });
    } catch (e: any) {
      const error = e?.response?.data?.error || e.message;
      toast({
        title: "Ooops",
        description: error,
        colorScheme: "red",
        position: "top",
      });
    } finally {
      onLoading(false);
    }
  };

  const videoChars = countChars(
    state.videoTranscript,
    state.videoDescription,
    state.videoTitle
  );

  const isBelowMax = videoChars < 24000;
  const isValidChat = isBelowMax && !!state.query.length && !!state.apiKey;
  const isDisabledChat = !isValidChat;
  const maxHelp = isBelowMax
    ? ""
    : `${videoChars}/25000 - O limite de tokens é superior ao suportado no momento. Tente com um vídeo mais curto`;

  const onChatShort = async (
    apiKey: string,
    query: string,
    title: string,
    description: string,
    transcript: string
  ) => {
    const { response } = await services.chat(
      state.apiKey,
      state.query,
      state.videoTitle,
      state.videoDescription,
      state.videoTranscript
    );
    return { response };
  };

  const onChatLong = async () => {
    const descriptions = utils.splitChunks(state.videoTranscript);

    console.log("[chunksDescription]", descriptions);
  };

  const onChat = async (e: any) => {
    e.preventDefault();
    try {
      onLoading(true);
      // await onChatLong();
      // return;
      const { response } = await onChatShort(
        state.apiKey,
        state.query,
        state.videoTitle,
        state.videoDescription,
        state.videoTranscript
      );
      onAddResponse(state.query, "user");
      onAddResponse(response, "model");
      onChange("query", "");
      toast({
        title: "Successo!",
        description: "Mensagem respondida com successo!",
        colorScheme: "green",
        duration: 1000,
        position: "top",
      });
    } catch (e: any) {
      const error = e?.response?.data?.error || e.message;
      toast({
        title: "Ooops",
        description: error,
        colorScheme: "red",
        position: "top",
      });
    } finally {
      onLoading(false);
    }
  };

  const isSugVisible = state.responses.length === 0;

  return (
    <Chakra.VStack
      bg="gray.900"
      w="full"
      minH="100vh"
      align="center"
      color="gray.50"
      spacing="8"
      p="8"
      pt="0"
    >
      <Chakra.HStack
        w="full"
        maxW="720px"
        h="15vh"
        align="center"
        justify="space-between"
      >
        <Chakra.Text
          fontWeight="bold"
          bgGradient="linear(to-l, red.400, blue.400)"
          bgClip="text"
        >
          TalkToYouTube
        </Chakra.Text>
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

        <Chakra.HStack w="full" align="flex-end" spacing="4">
          <InputText
            value={state.videoUrl}
            onChange={(e) => onChange("videoUrl", e.target.value)}
            w="full"
            label="Link do vídeo"
            isDisabled={!state.apiKey}
            borderRadius="full"
            h="34px"
            helpText={maxHelp}
          />
          <Chakra.VStack h="24px">
            {!!state.isOpenVideoDetails && (
              <Chakra.Icon
                as={Icon.HiOutlineEye}
                onClick={onToggleVideoDetails}
                color="gray.600"
                cursor="pointer"
              />
            )}
            {!state.isOpenVideoDetails && (
              <Chakra.Icon
                as={Icon.HiOutlineEyeOff}
                onClick={onToggleVideoDetails}
                color="gray.600"
                cursor="pointer"
              />
            )}
          </Chakra.VStack>
          <Chakra.VStack h="24px">
            <Chakra.Icon
              as={Icon.HiOutlineRefresh}
              onClick={onReset}
              color="gray.600"
              cursor="pointer"
            />
          </Chakra.VStack>
          <Button
            isLoading={state.isLoading}
            onClick={onExtractVideoId}
            isDisabled={!state.apiKey}
          >
            Carregar
          </Button>
        </Chakra.HStack>
        {state.isOpenVideoDetails && (
          <Chakra.VStack w="full" align="flex-end" spacing="4" py="8">
            <InputText
              value={state.videoTitle}
              w="full"
              label="Título do Vìdeo"
              borderRadius="full"
            />
            <InputText
              value={state.videoDescription}
              w="full"
              label="Descrição do Vìdeo"
              borderRadius="full"
            />
            <InputTextArea
              value={state.videoTranscript}
              w="full"
              label={`Transcrição do Vìdeo (${countChars(
                state.videoTranscript,
                state.videoDescription,
                state.videoTitle
              )}/25000)`}
              borderRadius="16"
            />
          </Chakra.VStack>
        )}
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
            alignSelf="flex-end"
          >
            Limpar Chat
          </Button>
        </Chakra.VStack>
      )}

      {!!state.videoTranscript && (
        <Chakra.VStack w="full" maxW="720px" spacing="8">
          {isSugVisible && (
            <Chakra.VStack spacing="2" align="flex-start" w="full" maxW="560px">
              <Chakra.Text fontSize="xs" color="gray.500">
                Sugestões de perguntas
              </Chakra.Text>
              <Chakra.Grid
                gridTemplateColumns={["1fr", "1fr 1fr", "1fr 1fr 1fr"]}
                gap="4"
              >
                {[
                  "Quais são os assuntos principais do vídeo?",
                  " Resuma o conteúdo do vídeo",
                  "Qual é o tema central do vídeo?",
                ].map((sug) => (
                  <Chakra.HStack
                    p="4"
                    border="1px"
                    borderColor="gray.600"
                    borderRadius="16"
                    key={sug}
                    _hover={{ bgGradient: "linear(to-r, gray.700, gray.800)" }}
                    cursor="pointer"
                    onClick={() => onSetDefaultMessage(sug)}
                  >
                    <Chakra.Text color="gray.500" textAlign="center">
                      {sug}
                    </Chakra.Text>
                  </Chakra.HStack>
                ))}
              </Chakra.Grid>
            </Chakra.VStack>
          )}
          <Chakra.VStack
            align="flex-end"
            spacing="4"
            as="form"
            w="full"
            onSubmit={onChat}
          >
            <InputTextArea
              value={state.query}
              onChange={(e) => onChange("query", e.target.value)}
              w="full"
              label="Pergunte qualquer coisa sobre o vídeo"
              isDisabled={!state.apiKey}
              borderRadius="16"
              h="34px"
            />

            <Button
              isLoading={state.isLoading}
              type="submit"
              // isDisabled={isDisabledChat}
            >
              Enviar
            </Button>
          </Chakra.VStack>
        </Chakra.VStack>
      )}

      <Chakra.Text fontSize="xs" color="gray.600">
        Developed during 'Imersão Alura' by{" "}
        <a target="_blank" href="https://github.com/fischerafael">
          @fischerafael
        </a>
      </Chakra.Text>
    </Chakra.VStack>
  );
};

const countChars = (
  description: string = "",
  title: string = "",
  transcript: string = ""
) => {
  return description.length + title.length + transcript.length;
};

const api = axios.create({
  baseURL: "/api",
});

const services = {
  extractIdFromYoutubeVideo: async (url: string, apiKey: string) => {
    const { data: dataVideoId } = await api.post(
      `/extract-id-from-youtube-video`,
      {
        url,
      },
      {
        headers: {
          api_key: apiKey,
        },
      }
    );
    return { videoId: dataVideoId.data.video_id };
  },
  extractTranscript: async (videoId: string, languageCode: string) => {
    const { data: dataTranscript } = await api.post(`/extract-transcript`, {
      id: videoId,
      language: languageCode,
    });

    const data = dataTranscript.data;

    return {
      transcript: data.transcript,
      title: data.title,
      description: data.description,
    };
  },
  chat: async (
    apiKey: string,
    query: string,
    title: string,
    description: string,
    transcript: string
  ) => {
    const { data: dataQueryResponse } = await api.post(
      `/chat`,
      {
        query: query,
        title: title,
        description: description,
        transcript: transcript,
      },
      {
        headers: {
          api_key: apiKey,
        },
      }
    );
    return { response: dataQueryResponse.data.response };
  },
  detectLanguage: async (apiKey: string, transcript: string) => {
    const { data } = await api.post(
      `/detect-language`,
      {
        transcript: transcript,
      },
      {
        headers: {
          api_key: apiKey,
        },
      }
    );
    return { languageCode: data.data.language };
  },
};

export const utils = {
  splitChunks: (text: string, maxLen: number = 20000): string[] => {
    const chunks: string[] = [];
    let posicaoInicial = 0;

    while (posicaoInicial < text.length) {
      let tamanhoChunk = Math.min(maxLen, text.length - posicaoInicial);
      let chunk = "";

      for (let i = 0; i < tamanhoChunk; i++) {
        chunk += text[posicaoInicial + i];
      }

      chunks.push(chunk);
      posicaoInicial += tamanhoChunk;
    }

    return chunks;
  },
};
