import React, { useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Box, Stack, IconButton, chakra } from "@chakra-ui/react";
import {
  FaPlay,
  FaPause,
  FaExpand,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";

const PlayIcon = chakra(FaPlay as any);
const PauseIcon = chakra(FaPause as any);
const ExpandIcon = chakra(FaExpand as any);
const VolumeOffIcon = chakra(FaVolumeMute as any);
const VolumeOnIcon = chakra(FaVolumeUp as any);

interface VideoPlayerProps {
  src: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlayPause = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      console.log(playerRef);
      playerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen((prev) => !prev);
  };

  return (
    <Box w="100%" h="100vh" mt="1.5" ref={playerRef} bg="black">
      <ReactPlayer
        ref={playerRef}
        url={src}
        playing={isPlaying}
        controls={true}
        loop
        width="100%"
        height="100%"
        playsinline
        style={{ objectFit: "cover" }}
      />
    </Box>
  );
};
