// src/pages/EditPostPage.tsx
import React, { useEffect, useState } from "react";
import {
  Flex,
  Box,
  Heading,
  VStack,
  Input,
  Textarea,
  Button,
  Spinner,
  FileUpload,
  chakra,
  Image,
  Icon,
  Switch,
  HStack,
} from "@chakra-ui/react";
import { Field } from "@chakra-ui/react";
import { LuFileImage } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import { showToast } from "../components/Toaster";
import { useUser } from "../context/UserContext";
import { db, storage } from "../firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

const LuFileIcon = chakra(LuFileImage as any);

export const EditPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useUser();
  const navigate = useNavigate();
  const toast = showToast;

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isGated, setIsGated] = useState(false);
  const [fileBlob, setFileBlob] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [thumbnailBlob, setThumbnailBlob] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  // Carica i dati esistenti
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const ref = doc(db, "posts", id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        toast({ title: "Post non trovato", status: "error" });
        return navigate("/");
      }
      const data = snap.data();
      setTitle(data.title);
      setDescription(data.description || "");
      setIsGated(data.isGated ?? false);
      setFileUrl(data.mediaUrl);
      setThumbnailUrl(data.thumbnailUrl);
      setLoading(false);
    };
    load();
  }, [id, navigate, toast]);

  // Preview quando cambio media
  useEffect(() => {
    if (!fileBlob) return;
    const u = URL.createObjectURL(fileBlob);
    setFileUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [fileBlob]);

  if (authLoading || loading) {
    return (
      <Flex w="full" h="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      return toast({ title: "Inserisci un titolo", status: "warning" });
    }

    try {
      let mediaUrl = fileUrl;
      let thumbUrl = thumbnailUrl;

      // Se ho scelto un nuovo media
      if (fileBlob) {
        const mRef = storageRef(
          storage,
          `posts/${user?.uid}/${Date.now()}-${fileBlob.name}`
        );
        await uploadBytes(mRef, fileBlob);
        mediaUrl = await getDownloadURL(mRef);
      }

      // Se video e ho scelto thumbnail
      if (fileBlob?.type.startsWith("video/") && thumbnailBlob) {
        const tRef = storageRef(
          storage,
          `posts/${user?.uid}/thumb-${Date.now()}-${thumbnailBlob.name}`
        );
        await uploadBytes(tRef, thumbnailBlob);
        thumbUrl = await getDownloadURL(tRef);
      }

      // Aggiorno Firestore
      await updateDoc(doc(db, "posts", id!), {
        title: title.trim(),
        description: description.trim() || null,
        isGated,
        mediaUrl,
        thumbnailUrl: thumbUrl,
        updatedAt: serverTimestamp(),
      });

      toast({ title: "Post aggiornato!", status: "success" });
      navigate(`/post/${id}`);
    } catch (err: any) {
      toast({ title: "Errore", description: err.message, status: "error" });
    }
  };

  return (
    <Flex
      w="full"
      align="center"
      justify="center"
      bg="gray.50"
      minH="100vh"
      p={4}
    >
      <Box w="full" maxW="md" bg="white" p={6} boxShadow="md" borderRadius="lg">
        <VStack gap={4} align="stretch">
          <Heading size="md" textAlign="center">
            Modifica post
          </Heading>

          {/* Preview del Media */}
          {fileUrl && (
            <Image
              src={fileUrl}
              alt="Anteprima"
              borderRadius="md"
              maxH="300px"
              objectFit="cover"
            />
          )}

          {/* Cambia Media */}
          <Field.Root>
            <Field.Label>Nuovo media (opzionale)</Field.Label>
            <FileUpload.Root
              accept="image/*,video/*"
              onFileAccept={({ files }: any) => {
                setFileBlob(files[0]);
                if (files[0].type.startsWith("video/")) {
                  setThumbnailBlob(null);
                  setThumbnailUrl("");
                }
              }}
            >
              <FileUpload.HiddenInput />
              <FileUpload.Trigger asChild {...({} as any)}>
                <Button variant="outline" size="md">
                  <Icon as={LuFileIcon} /> Seleziona file
                </Button>
              </FileUpload.Trigger>
            </FileUpload.Root>
          </Field.Root>

          {/* Thumbnail se video */}
          {fileBlob?.type.startsWith("video/") && (
            <Field.Root>
              <Field.Label>Thumbnail video</Field.Label>
              <FileUpload.Root
                accept="image/*"
                onFileAccept={({ files }: any) => {
                  setThumbnailBlob(files[0]);
                  setThumbnailUrl(URL.createObjectURL(files[0]));
                }}
              >
                <FileUpload.HiddenInput />
                <FileUpload.Trigger asChild {...({} as any)}>
                  <Button variant="outline" size="md">
                    <Icon as={LuFileIcon} /> Seleziona thumbnail
                  </Button>
                </FileUpload.Trigger>
              </FileUpload.Root>
              {thumbnailUrl && (
                <Image
                  src={thumbnailUrl}
                  alt="Anteprima thumbnail"
                  boxSize="150px"
                  mt={2}
                  objectFit="cover"
                  borderRadius="md"
                />
              )}
            </Field.Root>
          )}

          {/* Titolo */}
          <Field.Root required>
            <Field.Label>Titolo</Field.Label>
            <Input
              placeholder="Titolo del post"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field.Root>

          {/* Descrizione */}
          <Field.Root>
            <Field.Label>Descrizione</Field.Label>
            <Textarea
              placeholder="Descrivi il post…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              resize="vertical"
            />
          </Field.Root>

          {/* Privacy */}
          <Field.Root>
            <Switch.Root
              checked={isGated}
              onCheckedChange={({ checked }: any) => setIsGated(checked)}
              colorPalette="teal"
              size="md"
            >
              <Switch.HiddenInput />
              <Switch.Control />
              <Switch.Label>Solo utenti registrati</Switch.Label>
            </Switch.Root>
          </Field.Root>

          {/* Pulsanti */}
          <HStack gap={3}>
            <Button colorPalette="teal" flex="1" onClick={handleSubmit}>
              Salva modifiche
            </Button>
            <Button variant="outline" flex="1" onClick={() => navigate(-1)}>
              Annulla
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Flex>
  );
};
