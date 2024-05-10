import React, { useState } from "react";
import * as Chakra from "@chakra-ui/react";
import { InputText } from "../components/InputText";
import { Button } from "../components/Button";

export const PageMain = () => {
  const [state, setState] = useState({
    videoUrl: "",
    apiKey: "",
  });

  const onChange = (key: string, value: string) => {
    setState((prev) => ({ ...prev, [key]: value }));
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

      <Chakra.VStack maxW="720px">
        <InputText
          value={state.videoUrl}
          onChange={(e) => onChange("videoUrl", e.target.value)}
          w="full"
          label="Link do vídeo"
        />
        <Button>Carregar Video</Button>
      </Chakra.VStack>
    </Chakra.VStack>
  );
};
