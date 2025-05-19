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
  Center,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FaHeart,
  FaBookmark,
  FaEllipsisH,
  FaLock,
  FaRegComment,
  FaExpand,
} from "react-icons/fa";
import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import {
  writeBatch,
  doc,
  serverTimestamp,
  getDoc,
  onSnapshot,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { CommentDrawer } from "./CommentDrawer";

import { PostOptionsDrawer } from "./PostOptionsDrawer";
import { VideoPlayer } from "./VideoPlayer";
import { ZoomableImage } from "./ZoomableImage";
import { getRelativeTime } from "../utils/getRelativeTime";
import { useNavigate } from "react-router-dom";

const HeartIcon = chakra(FaHeart as any);
const SaveIcon = chakra(FaBookmark as any);
const ExpandIcon = chakra(FaExpand as any);
const LockIcon = chakra(FaLock as any);
const CommentIcon = chakra(FaRegComment as any);
export const PostCard = ({ post, id }: { post: any; id: any }) => {
  const { user } = useUser();
  const [liked, setLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authorData, setAuthorData] = useState<any>();
  const [liveLikes, setLiveLikes] = useState<number>(post.likesCount || 0);
  const [isProcessingLike, setIsProcessingLike] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { open, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const descriptionPreviewLimit = 80;
  const isDescriptionLong = post.description?.length > descriptionPreviewLimit;
  const displayedDescription = showFullDescription
    ? post.description
    : post.description?.slice(0, descriptionPreviewLimit);
  useEffect(() => {
    if (!user || !id) return;
    const savedRef = doc(db, "users", user.uid, "savedPosts", id);
    getDoc(savedRef).then((docSnap) => {
      if (docSnap.exists()) setIsSaved(true);
    });
  }, [user, id]);

  useEffect(() => {
    if (!user || !post.createdBy) return;
    const savedRef = doc(db, "users", post.createdBy);
    getDoc(savedRef).then((docSnap) => {
      if (docSnap.exists()) setAuthorData(docSnap.data());
    });
  }, [user, post.createdBy]);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "posts", id), (snap) => {
      const data = snap.data();
      if (data?.likesCount !== undefined) setLiveLikes(data.likesCount);
    });
    return () => unsub();
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    const likeDocRef = doc(db, "posts", id, "likes", user.uid);
    getDoc(likeDocRef).then((docSnap) => {
      if (docSnap.exists()) setLiked(true);
    });
  }, [user, id]);

  const toggleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    setIsSaved((prev) => !prev);
    const saveRef = doc(db, "users", user.uid, "savedPosts", id);
    try {
      if (isSaved) await deleteDoc(saveRef);
      else await setDoc(saveRef, { savedAt: serverTimestamp() });
    } catch (err) {
      setIsSaved((prev) => !prev);
      console.error("Errore save client-side:", err);
      alert("Non ho potuto aggiornare i preferiti, riprova.");
    } finally {
      setSaving(false);
    }
  };

  const handleLike = async () => {
    if (!user || isProcessingLike) return;
    setIsProcessingLike(true);
    setLiked((prev) => !prev);
    setLiveLikes((c) => c + (liked ? -1 : 1));

    try {
      const batch = writeBatch(db);
      const likeRef = doc(db, "posts", id, "likes", user.uid);
      const postRef = doc(db, "posts", id);

      if (liked) {
        batch.delete(likeRef);
        batch.update(postRef, { likesCount: liveLikes - 1 });
      } else {
        batch.set(likeRef, { userId: user.uid, createdAt: serverTimestamp() });
        batch.update(postRef, { likesCount: liveLikes + 1 });
      }

      await batch.commit();
    } catch (err) {
      setLiked((prev) => !prev);
      setLiveLikes((c) => c + (liked ? 1 : -1));
      console.error("Errore like:", err);
      alert("Non ho potuto aggiornare il like, riprova.");
    } finally {
      setIsProcessingLike(false);
    }
  };

  const isLocked = post.isGated && !user;

  // Style Reels if it's a video
  if (post.mediaType === "video") {
    return (
      <Box position="relative" w="100%" h="100vh" overflow="hidden" bg="black">
        <VideoPlayer src={post.mediaUrl} />
        <Stack
          position="absolute"
          right={4}
          top="50%"
          transform="translateY(-50%)"
          gap={4}
          align="center"
          zIndex={2}
        >
          <IconButton
            aria-label="Like"
            variant="ghost"
            onClick={handleLike}
            disabled={!user || isProcessingLike}
            size="lg"
          >
            <HeartIcon color={liked ? "red.500" : "white"} boxSize={6} />
          </IconButton>
          <Text mt="-6" fontSize="10px" color="white">
            {liveLikes} Mi piace
          </Text>
          <IconButton
            aria-label="Commenta"
            variant="ghost"
            onClick={onOpen}
            size="lg"
            color="white"
          >
            <CommentIcon />
          </IconButton>
        </Stack>

        <Box position="absolute" bottom={8} left={4} zIndex={2} color="white">
          <HStack>
            <Avatar.Root size={"sm"}>
              <Avatar.Fallback name="Segun Adebayo" />
              <Avatar.Image
                onClick={() => navigate(`/profile/${post?.createdBy}`)}
                src={authorData?.photoUrl}
                {...({} as any)}
              />
            </Avatar.Root>

            <Text
              fontWeight="bold"
              onClick={() => navigate(`/profile/${post?.createdBy}`)}
            >
              {authorData?.username}
            </Text>
          </HStack>
          <Text mt={1}>{post.title}</Text>
          <Text mt={1} fontSize={"14px"}>
            {displayedDescription}
            {isDescriptionLong && (
              <Text
                as="span"
                color="gray.300"
                cursor="pointer"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {" "}
                {showFullDescription ? "..Mostra meno" : "...Altro"}
              </Text>
            )}
          </Text>
          <Text fontSize="xs" color="gray.300">
            {post.createdAt?.seconds &&
              getRelativeTime(new Date(post.createdAt.seconds * 1000))}
          </Text>
        </Box>
        <CommentDrawer postId={id} isOpen={open} onClose={onClose} />
      </Box>
    );
  }

  // Standard layout for images
  return (
    <Box
      borderRadius="md"
      bg="white"
      boxShadow="base"
      maxW="md"
      mx="auto"
      mb={6}
      overflow="hidden"
    >
      <HStack justify="space-between" px={4} py={3}>
        <HStack>
          <Avatar.Root size={"sm"}>
            <Avatar.Fallback name="Segun Adebayo" />
            <Avatar.Image
              onClick={() => navigate(`/profile/${post?.createdBy}`)}
              src={authorData?.photoUrl}
              {...({} as any)}
            />
          </Avatar.Root>

          <Text
            onClick={() => navigate(`/profile/${post?.createdBy}`)}
            fontWeight="bold"
          >
            {authorData?.username}
          </Text>
        </HStack>
        <PostOptionsDrawer postId={id} isOwner={user?.uid === post.createdBy} />
      </HStack>

      <Box w="100%" h="auto">
        {isLocked ? (
          <Center
            position="relative"
            w="100%"
            h="auto"
            bg="blackAlpha.700"
            flexDir="column"
          >
            <LockIcon boxSize={10} color="white" mb={2} />
            <Text color="white" fontSize="sm" textAlign="center" px={4}>
              Questo contenuto è bloccato!
              <br />
              Per accedere al contenuto iscriviti!
            </Text>
          </Center>
        ) : (
          <ZoomableImage src={post.mediaUrl} alt={post.title} />
        )}
      </Box>

      <HStack justify="space-between" px={4} py={2}>
        <HStack>
          <IconButton
            aria-label="Like"
            variant="ghost"
            onClick={handleLike}
            disabled={!user || isProcessingLike}
            size="sm"
          >
            <HeartIcon color={liked ? "red.500" : "black"} />
          </IconButton>
          <IconButton
            aria-label="Commenta"
            variant="ghost"
            onClick={onOpen}
            size="lg"
            color="black"
          >
            <CommentIcon />
          </IconButton>
        </HStack>
        <IconButton
          aria-label="Save"
          variant="ghost"
          size="sm"
          onClick={toggleSave}
          disabled={!user || saving}
        >
          <SaveIcon color={isSaved ? "blue.500" : "black"} />
        </IconButton>
      </HStack>

      <VStack px={4} align="start" pb={3}>
        <Text fontWeight="bold" fontSize="sm">
          {liveLikes} Mi piace
        </Text>
        <Text fontSize="md">{post.title}</Text>
        <Text fontSize="sm">{post.description}</Text>
        <Text fontSize="xs" color="gray.500">
          {post.createdAt?.seconds &&
            getRelativeTime(new Date(post.createdAt.seconds * 1000))}
        </Text>
      </VStack>
      <CommentDrawer postId={id} isOpen={open} onClose={onClose} />
    </Box>
  );
};
