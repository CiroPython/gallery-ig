// src/components/PostsGrid.tsx
import React, { useEffect, useState } from "react";
import {
  SimpleGrid,
  Box,
  Image,
  Center,
  chakra,
  Spinner,
  AspectRatio,
} from "@chakra-ui/react";
import type { Post } from "../data";

import { FaLock } from "react-icons/fa";
import { FaVideo } from "react-icons/fa";
import { FaImage } from "react-icons/fa6";

import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase";
const LockIcon = chakra(FaLock as any);
const VideoIcon = chakra(FaVideo as any);
const ImageIcon = chakra(FaImage as any);

const Video = chakra("video");
export const PostsGrid: React.FC = () => {
  const { user, loading: authLoading, profile } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          mediaUrl: data.mediaUrl,
          isGated: data.isGated,
          mediaType: data.mediaType,
          thumbnailUrl: data.thumbnailUrl,
          description: data.description,
          title: data.title,
          likesCount: data.likesCount,
        } as Post;
      });
      setPosts(docs);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading || authLoading) {
    return (
      <Center mt={8}>
        <Spinner size="xl" />
      </Center>
    );
  }

  console.log("posts:", posts); // <-- verifica che non sia []
  return (
    <SimpleGrid
      columns={{ base: 2, sm: 3, md: 4 }}
      gap={{ base: 1, sm: 2, md: 4 }}
      p={4}
    >
      {posts.map((post) => (
        <Box
          key={post.id}
          cursor="pointer"
          onClick={() => navigate(`/post/${post.id}`)}
        >
          <AspectRatio ratio={1} w="100%">
            <Box position="relative" w="full" h="full">
              <Image
                src={
                  post.mediaType === "video" ? post.thumbnailUrl : post.mediaUrl
                }
                alt="Post media"
                w="100%"
                h="100%"
                objectFit="cover"
              />

              <Center position="absolute" inset="0" zIndex={2}>
                {post.mediaType === "video" ? (
                  <VideoIcon boxSize={6} color="white" />
                ) : (
                  <ImageIcon boxSize={6} color="white" />
                )}
              </Center>
              {/* Overlay grigio trasparente */}
              <Box
                position="absolute"
                inset="0"
                bg="blackAlpha.400" // grigio scuro trasparente
                zIndex={1}
              />
              {post.isGated && !user && (
                <Center
                  position="absolute"
                  inset="0"
                  bg="rgba(0,0,0,0.5)"
                  zIndex={3}
                >
                  <LockIcon boxSize={10} color="white" />
                </Center>
              )}
            </Box>
          </AspectRatio>
        </Box>
      ))}
    </SimpleGrid>
  );
};
