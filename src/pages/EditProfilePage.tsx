// src/pages/EditProfilePage.tsx
import {
  Box,
  VStack,
  Heading,
  Input,
  Button,
  Textarea,
  Avatar,
  Center,
} from "@chakra-ui/react";
import { useUser } from "../context/UserContext";
import { useEffect, useRef, useState } from "react";
import { db, storage } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { showToast } from "../components/Toaster";
export const EditProfilePage: React.FC = () => {
  const { user } = useUser();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setUsername(data.username || "");
        setBio(data.bio || "");
        setPhotoUrl(data.photoUrl || "");
      }
    };
    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let updatedPhotoUrl = photoUrl;
      if (newFile) {
        const ref = storageRef(storage, `avatars/${user.uid}`);
        await uploadBytes(ref, newFile);
        updatedPhotoUrl = await getDownloadURL(ref);
      }

      await updateDoc(doc(db, "users", user.uid), {
        username,
        bio,
        photoUrl: updatedPhotoUrl,
      });
      showToast({
        title: "Profilo aggiornato!",
        status: "success",
      });
    } catch (err) {
      console.error(err);
      showToast({
        title: "Errore",
        description: "Impossibile aggiornare il profilo",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  return (
    <Box maxW="md" mx="auto" py={6} px={4}>
      <VStack gap={5}>
        <Heading size="md">Modifica profilo</Heading>

        <Center>
          <Avatar.Root
            size="2xl"
            cursor="pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Avatar.Image src={photoPreview || photoUrl} alt={username} />
            <Avatar.Fallback name={username} />
          </Avatar.Root>
        </Center>
        <Input
          type="file"
          accept="image/*"
          display="none"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Textarea
          placeholder="Biografia"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <Button colorPalette="blue" onClick={handleSave} loading={loading}>
          Salva modifiche
        </Button>
      </VStack>
    </Box>
  );
};
