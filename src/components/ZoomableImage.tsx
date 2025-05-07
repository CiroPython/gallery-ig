import React from "react";
import { Image, chakra } from "@chakra-ui/react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

// se vuoi wrapparlo in chakra
const ChakraZoom = chakra(Zoom as any);

export const ZoomableImage = ({ src, alt }: { src: string; alt?: string }) => (
  <Zoom>
    <Image src={src} alt={alt} maxW="100%" borderRadius="md" cursor="zoom-in" />
  </Zoom>
);
