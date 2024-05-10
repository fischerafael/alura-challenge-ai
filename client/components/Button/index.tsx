import React from "react";
import * as C from "@chakra-ui/react";

interface ButtonProps extends C.ButtonProps {
  children: React.ReactNode;
}

export const Button = ({ children, ...props }: ButtonProps) => {
  return (
    <C.Button
      colorScheme="gray"
      borderRadius="full"
      fontSize="sm"
      size={"sm"}
      px="8"
      fontWeight="semi-bold"
      {...props}
    >
      {children}
    </C.Button>
  );
};
