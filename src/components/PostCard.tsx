// src/components/PostCard.tsx
import {
  Box,
  Avatar,
  Text,
  HStack,
  VStack,
  IconButton,
  Image,
  chakra,
  Float,
  Circle,
} from "@chakra-ui/react";
import { FaHeart, FaBookmark, FaEllipsisH } from "react-icons/fa";
import { getRelativeTime } from "../utils/getRelativeTime";

import { getFunctions, httpsCallable } from "firebase/functions";
import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // o da dove importi il db
import { CommentDrawer } from "./CommentDrawer";
import { ShareDrawer } from "./ShareDrawer";
import { PostOptionsDrawer } from "./PostOptionsDrawer";
import { VideoPlayer } from "./VideoPlayer";
import { ZoomableImage } from "./ZoomableImage";
const HeartIcon = chakra(FaHeart as any);
const SaveIcon = chakra(FaBookmark as any);
const OptionsIcon = chakra(FaEllipsisH as any);

export const PostCard = ({ post, id }: { post: any; id: any }) => {
  const functions = getFunctions();
  const { user } = useUser();
  const [liked, setLiked] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [liveLikes, setLiveLikes] = useState<number>(post.likesCount || 0);
  const [isProcessingLike, setIsProcessingLike] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    const savedRef = doc(db, "users", user.uid, "savedPosts", id);
    getDoc(savedRef).then((docSnap) => {
      if (docSnap.exists()) {
        setIsSaved(true);
      }
    });
  }, [user, id]);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "posts", id), (snap) => {
      const data = snap.data();
      if (data?.likesCount !== undefined) {
        setLiveLikes(data.likesCount);
      }
    });
    return () => unsub();
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;

    const likeDocRef = doc(db, "posts", id, "likes", user.uid);
    getDoc(likeDocRef).then((docSnap) => {
      if (docSnap.exists()) {
        setLiked(true);
      }
    });
  }, [user, id]);

  const toggleSave = async () => {
    if (!user || saving) return;

    const savePost = httpsCallable(functions, "savePost");
    const unsavePost = httpsCallable(functions, "unsavePost");

    setSaving(true);
    try {
      if (isSaved) {
        await unsavePost({ postId: id });
        setIsSaved(false);
      } else {
        await savePost({ postId: id });
        setIsSaved(true);
      }
    } catch (err: any) {
      console.error("Errore Firebase:", err.message || err);
    } finally {
      setSaving(false);
    }
  };

  const handleLike = async () => {
    if (!user || isProcessingLike) return;

    setIsProcessingLike(true);
    if (!user) return alert("Devi essere loggato per mettere mi piace");

    const likePost = httpsCallable(functions, "likePost");
    const unlikePost = httpsCallable(functions, "unlikePost");

    try {
      if (liked) {
        await unlikePost({ postId: id });
      } else {
        await likePost({ postId: id });
      }
      setLiked(!liked);
    } catch (err) {
      console.error("Errore like:", err);
    } finally {
      setIsProcessingLike(false);
    }
  };
  return (
    <Box
      borderRadius="md"
      bg="white"
      boxShadow="base"
      maxW="md"
      mx="auto"
      mb={6}
      overflow="hidden"
      pt={{ base: "26px", md: "30px" }}
    >
      {/* Header */}
      <HStack justify="space-between" px={4} py={3}>
        <HStack>
          <Avatar.Root colorPalette="green" variant="subtle">
            <Avatar.Fallback name="Ciro Rivieccio" />
            <Float placement="bottom-end" offsetX="1" offsetY="1">
              <Circle
                bg="green.500"
                size="8px"
                outline="0.2em solid"
                outlineColor="bg"
              />
            </Float>
          </Avatar.Root>
          <Text fontWeight="bold">{post.title}</Text>
        </HStack>
        <PostOptionsDrawer postId={id} isOwner={user?.uid === post.createdBy} />
      </HStack>

      {/* Media */}
      <Box w="100%" h="auto">
        {post.mediaType === "video" ? (
          <VideoPlayer src={post.mediaUrl} width={"100%"} />
        ) : (
          <ZoomableImage src={post.mediaUrl} alt="Post"></ZoomableImage>
        )}
      </Box>

      {/* Actions */}
      <HStack justify="space-between" px={4} py={2}>
        <HStack gap={2}>
          <IconButton
            aria-label="Like"
            variant="ghost"
            onClick={handleLike}
            disabled={!user || isProcessingLike}
            size="sm"
          >
            {" "}
            <HeartIcon color={liked ? "red.500" : "black"} />
          </IconButton>

          <CommentDrawer postId={id} />
          <ShareDrawer postUrl={`https://ciro-ig.web.app/posts/${id}`} />
        </HStack>
        <IconButton
          aria-label="Salva"
          variant="ghost"
          size="sm"
          onClick={toggleSave}
          disabled={!user || saving}
        >
          <SaveIcon color={isSaved ? "blue.500" : "black"} />
        </IconButton>
      </HStack>

      {/* Description */}
      <VStack px={4} align="start" gap={1} pb={3}>
        <Text fontWeight="bold" fontSize="sm">
          {liveLikes} Mi piace
        </Text>
        <Text fontSize="sm">{post.description}</Text>

        <Text fontSize="xs" color="gray.500">
          {post.createdAt?.seconds &&
            getRelativeTime(new Date(post.createdAt.seconds * 1000))}
        </Text>
      </VStack>
    </Box>
  );
};
