// src/components/PostCard.tsx
import {
  Box,
  Avatar,
  Text,
  Input,
  HStack,
  VStack,
  IconButton,
  Image,
  chakra,
  Float,
  Circle,
} from "@chakra-ui/react";
import {
  FaHeart,
  FaRegComment,
  FaPaperPlane,
  FaBookmark,
  FaEllipsisH,
} from "react-icons/fa";
import { getRelativeTime } from "../utils/getRelativeTime";

import { Post } from "../data";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // o da dove importi il db
import { CommentDrawer } from "./CommentDrawer";
const HeartIcon = chakra(FaHeart  as any);
const CommentIcon = chakra(FaRegComment  as any);
const ShareIcon = chakra(FaPaperPlane  as any);
const SaveIcon = chakra(FaBookmark  as any);
const OptionsIcon = chakra(FaEllipsisH  as any);
const PaperIcon = chakra(FaPaperPlane  as any);


export const PostCard = ({ post,id }: { post: any,id:any }) => {
  const functions = getFunctions();
   const { user, profile, logout } = useUser();
   const [liked, setLiked] = useState(false);
const [likesCount, setLikesCount] = useState(post.likesCount);
const [comment, setComment] = useState("");
const addComment = httpsCallable(functions, "addComment");
console.log(post)

useEffect(() => {
  if (!user || !id) return;

  const likeDocRef = doc(db, "posts", id, "likes", user.uid);
  getDoc(likeDocRef).then((docSnap) => {
    if (docSnap.exists()) {
      setLiked(true);
    }
  });
}, [user, id]);
const handleSubmitComment = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user || !comment.trim()) return;

  try {
    await addComment({ postId: id, text: comment });
    setComment("");
    // TODO: opzionalmente aggiorna la lista dei commenti
  } catch (err) {
    console.error("Errore invio commento:", err);
  }
};
const handleLike = async () => {
  if (!user) return alert("Devi essere loggato per mettere mi piace");

  const likePost = httpsCallable(functions, "likePost");
  const unlikePost = httpsCallable(functions, "unlikePost");


  try {
    if (liked) {
      await unlikePost({ postId: id });
      setLikesCount((c: number) => c - 1);
    } else {
      await likePost({ postId: id });
      setLikesCount((c: number) => c + 1);
    }
    setLiked(!liked);
  } catch (err) {
    console.error("Errore like:", err);
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
        <IconButton
          aria-label="More"
          variant="ghost"
          size="sm"
        
        ><OptionsIcon /></IconButton>
      </HStack>

      {/* Media */}
      <Box w="100%" h="auto">
        {post.mediaType === "video" ? (
          <chakra.video
            src={post.mediaUrl}
            controls
            autoPlay
            muted
            loop
            playsInline
            w="100%"
            objectFit="cover"
          />
        ) : (
          <Image src={post.mediaUrl} alt="Post" w="100%" objectFit="cover" />
        )}
      </Box>

      {/* Actions */}
      <HStack justify="space-between" px={4} py={2}>
        <HStack gap={2}>
          <IconButton
            aria-label="Like"
            variant="ghost"
            onClick={handleLike}
  disabled={!user}

            size="sm">     <HeartIcon color={liked ? "red.500" : "black"} /></IconButton>
      
      
      <CommentDrawer postId={id} />
          <IconButton
            aria-label="Share"
            variant="ghost"
            size="sm"
            
          ><ShareIcon /></IconButton>
        </HStack>
        <IconButton
          aria-label="Save"
          variant="ghost"
          size="sm"
       
        ><SaveIcon /></IconButton>
      </HStack>

      {/* Description */}
      <VStack px={4} align="start" gap={1} pb={3}>
        <Text fontWeight="bold" fontSize="sm">
          {post.likesCount} Mi piace
        </Text>
        <Text fontSize="sm">
         
          {post.description}
        </Text>
     
        <Text fontSize="xs" color="gray.500">
  {post.createdAt?.seconds && getRelativeTime(new Date(post.createdAt.seconds * 1000))}
</Text>

      </VStack>
    </Box>
  );
};
