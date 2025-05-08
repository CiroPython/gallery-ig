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
} from "@chakra-ui/react";
import { FaHeart, FaBookmark, FaEllipsisH, FaLock } from "react-icons/fa";
import { getRelativeTime } from "../utils/getRelativeTime";

import { getFunctions, httpsCallable } from "firebase/functions";
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

import { db } from "../firebase"; // o da dove importi il db
import { CommentDrawer } from "./CommentDrawer";
import { ShareDrawer } from "./ShareDrawer";
import { PostOptionsDrawer } from "./PostOptionsDrawer";
import { VideoPlayer } from "./VideoPlayer";
import { ZoomableImage } from "./ZoomableImage";
const HeartIcon = chakra(FaHeart as any);
const SaveIcon = chakra(FaBookmark as any);
const OptionsIcon = chakra(FaEllipsisH as any);
const LockIcon = chakra(FaLock as any);
export const PostCard = ({ post, id }: { post: any; id: any }) => {
  const { user } = useUser();
  const [liked, setLiked] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authorData, setAuthorData] = useState<any>();
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
    if (!user || !post.createdBy) return;
    const savedRef = doc(db, "users", post.createdBy);
    getDoc(savedRef).then((docSnap) => {
      if (docSnap.exists()) {
        setAuthorData(docSnap.data());
      }
    });
  }, [user, post.createdBy]);
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
    setSaving(true);

    // optimistic UI
    setIsSaved((prev) => !prev);

    const saveRef = doc(db, "users", user.uid, "savedPosts", id);

    try {
      if (isSaved) {
        // togli dai preferiti
        await deleteDoc(saveRef);
      } else {
        // salva come preferito
        await setDoc(saveRef, { savedAt: serverTimestamp() });
      }
    } catch (err) {
      console.error("Errore save client-side:", err);
      // rollback UI
      setIsSaved((prev) => !prev);
      alert("Non ho potuto aggiornare i preferiti, riprova.");
    } finally {
      setSaving(false);
    }
  };

  // Funzione "like" client-side con batch + optimistic UI
  const handleLike = async () => {
    if (!user || isProcessingLike) return;
    setIsProcessingLike(true);

    // optimistic UI
    setLiked((prev) => !prev);
    setLiveLikes((c) => c + (liked ? -1 : +1));

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
      console.log(err);
      console.error("Errore like:", err);
      // rollback
      setLiked((prev) => !prev);
      setLiveLikes((c) => c + (liked ? +1 : -1));
      alert("Non ho potuto aggiornare il like, riprova.");
    } finally {
      setIsProcessingLike(false);
    }
  };

  const isLocked = post.isGated && !user;
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
            <Avatar.Image src={authorData?.photoUrl} />
            <Float placement="bottom-end" offsetX="1" offsetY="1">
              <Circle
                bg="green.500"
                size="8px"
                outline="0.2em solid"
                outlineColor="bg"
              />
            </Float>
          </Avatar.Root>
          <Text fontSize="16px" fontWeight={"bold"}>
            {authorData?.username}
          </Text>
        </HStack>
        <PostOptionsDrawer postId={id} isOwner={user?.uid === post.createdBy} />
      </HStack>

      {/* Media */}
      <Box w="100%" h="auto">
        {isLocked ? (
          <>
            <Image
              src={post.thumbnailUrl}
              alt="Anteprima post bloccato"
              w="100%"
              objectFit="cover"
            />
            <Center
              position="absolute"
              inset="0"
              bg="rgba(0, 0, 0, 0.78)"
              zIndex={3}
              flexDirection="column"
              justifyContent="center"
            >
              {/* Icona in alto */}
              <LockIcon boxSize={10} color="white" mb={2} />

              {/* Testo subito sotto, bianco e centrato */}
              <Text color="white" fontSize="sm" textAlign="center" px={4}>
                Questo contenuto è bloccato!
                <br />
                Per accedere al contenuto iscriviti!
              </Text>
            </Center>
          </>
        ) : post.mediaType === "video" ? (
          <VideoPlayer src={post.mediaUrl} width="100%" />
        ) : (
          <ZoomableImage src={post.mediaUrl} alt={post.title} />
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
            _hover={{
              bg: "red.100",
              color: "red.600",
            }}
            _active={{
              transform: "scale(0.8)",
              color: "red.600",
            }}
            transition="all 0.2s"
          >
            {" "}
            <HeartIcon color={liked ? "red.500" : "black"} />
          </IconButton>

          <CommentDrawer postId={id} />
          <ShareDrawer postUrl={`https://daciro.club/posts/${id}`} />
        </HStack>
        <IconButton
          aria-label="Salva"
          variant="ghost"
          size="sm"
          onClick={toggleSave}
          disabled={!user || saving}
          _hover={{
            bg: "red.100",
            color: "red.600",
          }}
          _active={{
            transform: "scale(0.8)",
            color: "red.600",
          }}
          transition="all 0.2s"
        >
          <SaveIcon color={isSaved ? "blue.500" : "black"} />
        </IconButton>
      </HStack>

      {/* Description */}
      <VStack px={4} align="start" gap={1} pb={3}>
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
    </Box>
  );
};
