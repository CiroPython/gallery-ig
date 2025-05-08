// src/pages/ProfilePage.tsx
import {
  Box,
  Text,
  VStack,
  Avatar,
  Button,
  SimpleGrid,
  chakra,
  Spinner,
  Center,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";
import { VerificationRequestDrawer } from "../components/VerificationRequestDrawer";
import { FaCheckCircle } from "react-icons/fa";
import { ShareProfileDrawer } from "../components/ShareProfileDrawer";
const CheckIcon = chakra(FaCheckCircle as any);
export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useUser();
  const [profileData, setProfileData] = useState<{
    username: string;
    email: string;
    bio?: string;
    photoUrl?: string;
    verified?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const ref = doc(db, "users", user.uid);
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
  }, [user]);

  if (authLoading || loading || !profileData) {
    return (
      <Center mt={8}>
        <Spinner size="lg" />
      </Center>
    );
  }

  return (
    <Box pt={{ base: "60px" }} px={4}>
      <VStack gap={4} textAlign="center" w="full">
        {/* Avatar e nome */}
        <VStack gap={2}>
          <Avatar.Root size="2xl">
            <Avatar.Fallback name={profileData.username} />
            <Avatar.Image
              src={profileData.photoUrl}
              alt={profileData.username}
            />
          </Avatar.Root>
          <Text fontWeight="bold" fontSize="xl">
            {profileData.username}
            {/*
            Se profile.verified === true → icona blu e NON cliccabile
            Altrimenti → drawer di richiesta verifica
          */}
            {profileData.verified ? (
              <IconButton
                aria-label="Richiedi verifica"
                variant="ghost"
                size="sm"
              >
                <CheckIcon color="blue.400" boxSize={4} />
              </IconButton>
            ) : (
              <VerificationRequestDrawer />
            )}
          </Text>

          <Text fontSize="sm" color="gray.500">
            {profileData.email}
          </Text>
          {profileData.bio && (
            <Text fontSize="sm" color="gray.600">
              {profileData.bio}
            </Text>
          )}
        </VStack>

        {/* Azioni */}
        <HStack gap={4}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/profile/edit")}
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
            Modifica profilo
          </Button>
          <ShareProfileDrawer postUrl={`https://daciro.club/profile/${id}`} />
        </HStack>
      </VStack>

      {/* Divider con tab futura (per reel / salvati ecc.) */}
      <Box borderTopWidth="1px" mt={4} />

      {/* Placeholder per grid post/funzioni future */}
      <SimpleGrid columns={3} gap={1} mt={2}>
        <h2>User Post - Coming soon...</h2>
      </SimpleGrid>
    </Box>
  );
};
