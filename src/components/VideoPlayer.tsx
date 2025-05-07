import React from "react";
import ReactPlayer from "react-player";

interface VideoPlayerProps {
  src: string;
  width?: string;
  height?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  width = "100%",
  height = "100%",
}) => (
  <div style={{ position: "relative", paddingTop: "56.25%" /* 16:9 */ }}>
    <ReactPlayer
      url={src}
      controls
      width="100%"
      height="100%"
      style={{ position: "absolute", top: 0, left: 0 }}
    />
  </div>
);
