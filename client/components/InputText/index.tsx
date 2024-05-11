import React from "react";
import * as C from "@chakra-ui/react";
import { FormControl } from "../FormControl";

interface InputTextProps extends C.InputProps {
  label: string;
  helpText?: string;
  w?: string;
}

export const InputText = ({ label, w, helpText, ...props }: InputTextProps) => {
  return (
    <FormControl label={label} w={w}>
      <C.Input
        fontSize="12px"
        size={"sm"}
        borderColor="gray.600"
        bg="gray.900"
        _focus={{ ring: "none" }}
        w={w}
        {...props}
      />
      {!!helpText && (
        <C.Text pt="1" fontSize="10px" color="red.400">
          {helpText}
        </C.Text>
      )}
    </FormControl>
  );
};
