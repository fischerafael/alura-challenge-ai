import * as C from "@chakra-ui/react";
import React from "react";

export const FormControl = ({
  label,
  helpText,
  children,
  w = "fit-content",
}: {
  label: string;
  children: React.ReactNode;
  helpText?: string;
  w?: string;
}) => {
  return (
    <C.FormControl w={w} as={C.VStack} align="flex-start" spacing="0">
      <C.FormLabel
        borderColor="gray.600"
        fontWeight="regular"
        fontSize="xs"
        w="full"
      >
        {label}
      </C.FormLabel>
      {children}
      {helpText && (
        <C.FormHelperText fontSize="xs">{helpText}</C.FormHelperText>
      )}
    </C.FormControl>
  );
};
