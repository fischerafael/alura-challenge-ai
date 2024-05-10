import * as C from "@chakra-ui/react";
import { FormControl } from "../FormControl";

interface InputTextAreaProps extends C.TextareaProps {
  label: string;
  helpText?: string;
  w?: string;
}

export const InputTextArea = ({
  label,
  helpText,
  w,
  ...props
}: InputTextAreaProps) => {
  return (
    <FormControl w={w} label={label}>
      <C.Textarea
        fontSize="12px"
        size={"sm"}
        borderColor="gray.600"
        bg="gray.900"
        w={w}
        _focus={{ ring: "none" }}
        {...props}
      />
    </FormControl>
  );
};
