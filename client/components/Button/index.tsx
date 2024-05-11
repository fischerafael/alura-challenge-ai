import React from "react";
import * as C from "@chakra-ui/react";

interface ButtonProps extends C.ButtonProps {
  children: React.ReactNode;
}

export const Button = ({ children, ...props }: ButtonProps) => {
  return (
    <C.Button
      bg="transparent"
      border="1px"
      borderColor="gray.600"
      _hover={{ bgGradient: "linear(to-r, gray.700, gray.800)" }}
      color="gray.400"
      borderRadius="full"
      fontSize="xs"
      size={"sm"}
      px="8"
      letterSpacing="1px"
      fontWeight="semi-bold"
      {...props}
    >
      {children}
    </C.Button>
  );
};
