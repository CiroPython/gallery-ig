// src/pages/ProfilePage.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  VStack,
  Avatar,
  Button,
  SimpleGrid,
  Spinner,
  Center,
  HStack,
  AspectRatio,
  Image,
} from "@chakra-ui/react";
import { useUser } from "../context/UserContext";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  DocumentData,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";
import { VerificationRequestDrawer } from "../components/VerificationRequestDrawer";
import { ShareProfileDrawer } from "../components/ShareProfileDrawer";
import { FaCheckCircle, FaLock, FaVideo, FaImage } from "react-icons/fa";
import { chakra as chakraFactory } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

const CheckIcon = FaCheckCircle;
const LockIcon = chakraFactory(FaLock as any);
const VideoIcon = chakraFactory(FaVideo as any);
const ImageIcon = chakraFactory(FaImage as any);

interface Post {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  mediaType?: "video" | "image";
  isGated?: boolean;
  createdAt: { seconds: number };
  authorId: string;
}

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useUser();
  const [profileData, setProfileData] = useState<{
    username: string;
    email: string;
    bio?: string;
    photoUrl?: string;
    verified?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Carica il profilo di `id`
  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      const ref = doc(db, "users", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setProfileData({
          username: data.username,
          email: data.email,
          bio: data.bio,
          photoUrl: data.photoUrl,
          verified: data.verified,
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [id]);

  // Carica i post di `id`, ordinati per createdAt desc
  useEffect(() => {
    if (!id) return;
    const fetchPosts = async () => {
      const q = query(
        collection(db, "posts"),
        where("createdBy", "==", id),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);

      const loaded = snap.docs.map((d): Post => {
        const data = d.data() as DocumentData;
        return {
          id: d.id,
          title: data.title as string,
          description: data.description as string,
          imageUrl: data.mediaUrl as string | undefined,
          thumbnailUrl: data.thumbnailUrl as string | undefined,
          mediaType: data.mediaType as "video" | "image" | undefined,
          isGated: data.isGated as boolean | undefined,
          createdAt: data.createdAt as any,
          authorId: data.authorId as string,
        };
      });

      setPosts(loaded);
    };
    fetchPosts();
  }, [id]);

  // Spinner fino a quando non ho né auth né profilo
  if (authLoading || loading || !profileData) {
    return (
      <Center mt={8}>
        <Spinner size="lg" />
      </Center>
    );
  }

  const isOwner = user?.uid === id;
  console.log(posts);
  return (
    <Box pt={{ base: "60px" }} px={4}>
      <VStack gap={4} textAlign="center" w="full">
        {/* Avatar e nome */}
        <VStack gap={2}>
          <Avatar.Root size="2xl" cursor="pointer">
            <Avatar.Image
              src={profileData.photoUrl}
              alt={profileData.username.charAt(0)}
              {...({} as any)}
            />
            <Avatar.Fallback name={profileData.username.charAt(0)} />
          </Avatar.Root>
          <HStack gap={2}>
            <Text fontWeight="bold" fontSize="xl">
              {profileData.username}
            </Text>
            {profileData.verified ? (
              // Se utente verificato: icona NON cliccabile
              <CheckIcon color="blue" size="20px" />
            ) : (
              // Altrimenti drawer per richiesta verifica
              isOwner && <VerificationRequestDrawer />
            )}
          </HStack>

          {profileData.bio && (
            <Text fontSize="sm" color="gray.600">
              {profileData.bio}
            </Text>
          )}
        </VStack>

        {/* Azioni: Modifica solo se sono owner */}
        {isOwner && (
          <HStack gap={4}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/profile/edit")}
              _hover={{ bg: "red.100", color: "red.600" }}
              _active={{ transform: "scale(0.8)", color: "red.600" }}
              transition="all 0.2s"
            >
              {t("edit_profile_button")}
            </Button>
            <ShareProfileDrawer postUrl={`https://daciro.club/profile/${id}`} />
          </HStack>
        )}

        {/* Se non owner, solo share */}
        {!isOwner && (
          <ShareProfileDrawer postUrl={`https://daciro.club/profile/${id}`} />
        )}
      </VStack>

      {/* Separator */}
      <Box borderTopWidth="1px" mt={4} />

      {/* Grid dei post */}
      <SimpleGrid columns={[2, 2, 3]} gap={4} mt={2}>
        {posts.length === 0 ? (
          <Text color="gray.500" gridColumn="1 / -1">
            {t("no_posts_yet")}
          </Text>
        ) : (
          posts.map((post) => (
            <Box
              key={post.id}
              cursor="pointer"
              onClick={() => navigate(`/post/${post.id}`)}
            >
              <AspectRatio ratio={1} w="100%">
                <Box position="relative" w="full" h="full">
                  <Image
                    src={
                      post.mediaType === "video"
                        ? post.thumbnailUrl
                        : post.imageUrl
                    }
                    alt={post.title}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                  />

                  {/* Icona play o immagine */}
                  <Center position="absolute" inset="0" zIndex={2}>
                    {post.mediaType === "video" ? (
                      <VideoIcon boxSize={6} color="white" />
                    ) : (
                      <ImageIcon boxSize={6} color="white" />
                    )}
                  </Center>

                  {/* Overlay semi-trasparente */}
                  <Box
                    position="absolute"
                    inset="0"
                    bg="blackAlpha.400"
                    zIndex={1}
                  />

                  {/* Lock se gated e non loggato */}
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
          ))
        )}
      </SimpleGrid>
    </Box>
  );
};
