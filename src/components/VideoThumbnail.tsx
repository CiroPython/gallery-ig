import React, { useState } from "react";
import {
  AspectRatio,
  Box,
  Center,
  Icon,
  chakra,
} from "@chakra-ui/react";
import { FaPlayCircle } from "react-icons/fa";

const Video = chakra("video");
const IconPlay = chakra(FaPlayCircle as any);
interface VideoThumbnailProps {
  url: string;
  thumbnail: string;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ url, thumbnail }) => {
  const [playing, setPlaying] = useState(false);

  return (
    <AspectRatio ratio={16 / 9} w="100%">
      {!playing ? (
        <Box
          as="button"
          onClick={() => setPlaying(true)}
          bgImage={`url(${thumbnail})`}
          bgSize="cover"
          position="center"
          w="100%"
          h="100%"
        >
          <Center inset="0">
          
            <Icon boxSize={12} color="white">
                <IconPlay/>
            </Icon>
          </Center>
        </Box>
      ) : (
        <Video
          controls
          
          muted
          playsInline
          objectFit="contain"
          w="100%"
          h="100%"
        >
          <source src={url} type="video/mp4" />
          Il tuo browser non supporta il video HTML5.
        </Video>
      )}
    </AspectRatio>
  );
};

export default VideoThumbnail;
