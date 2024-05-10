import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Head>
        <title>ChatYoutube</title>
        <link
          rel="shortcut icon"
          href="https://www.youtube.com/s/desktop/92fdfad2/img/favicon.ico"
          type="image/x-icon"
        ></link>
      </Head>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}
