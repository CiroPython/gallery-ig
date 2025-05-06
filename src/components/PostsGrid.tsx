// src/components/PostsGrid.tsx
import React, { useEffect, useState } from "react";
import {
  SimpleGrid,
  Box,
  Image,
  Center,
  chakra,
  Spinner,
} from "@chakra-ui/react";
import type { Post } from "../data";

import { FaLock } from "react-icons/fa";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase";
const LockIcon = chakra(FaLock as any);
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
      {posts.map((post: Post) => (
        <Box
          key={post.id}
          position="relative"
          cursor="pointer"
          onClick={() => {
            if (post.isGated && !user) {
              return;
            } else {
              navigate(`/post/${post.id}`);
            }
          }}
        >
          {post.mediaType === "video" ? (
            <Video
              src={post.mediaUrl}
              autoPlay
              muted
              loop
              playsInline
              style={{
                objectFit: "contain",
                width: "100%",
                height: "100%",
                display: "block",
              }}
            />
          ) : (
            <Image
              src={post.mediaUrl}
              alt=""
              style={{
                objectFit: "contain",
                width: "100%",
                height: "100%",
                display: "block",
              }}
            />
          )}

          {post.isGated && !user ? (
            <Center position="absolute" inset="0" bg="rgba(0,0,0,0.5)">
              <LockIcon boxSize={6} color="white" />
            </Center>
          ) : null}
        </Box>
      ))}
    </SimpleGrid>
  );
};
