// src/pages/CreatePostPage.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  VStack,
  Input,
  Textarea,
  Switch,
  Button,
  Spinner,
  FileUpload,
  chakra,
  Image,
  Icon,
  Text,
} from "@chakra-ui/react";
import { LuFileImage } from "react-icons/lu";
import { showToast } from "../components/Toaster"; // nostro toaster custom
import { useUser } from "../context/UserContext";
import { storage, db } from "../firebase";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

// Importiamo il composable Field (sostituto di FormControl/FormLabel)
import { Field } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

const LuFileIcon = chakra(LuFileImage as any);
// Preview + delete per FileUpload

export const CreatePostPage: React.FC = () => {
  const { user, loading: authLoading } = useUser();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isGated, setIsGated] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [fileBlob, setFileBlob] = useState<File | null>(null);
  const [thumbnailBlob, setThumbnailBlob] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  // 1) Start the FileUpload store (max 1 file)
  // quando FileUpload.Root invoca onChange
  const { t } = useTranslation();
  // genera preview ogni volta che fileBlob cambia
  useEffect(() => {
    if (!fileBlob) {
      setFileUrl("");
      return;
    }
    const url = URL.createObjectURL(fileBlob);
    setFileUrl(url);
    if (fileBlob?.type?.startsWith("video/")) {
      setThumbnailBlob(null);
      setThumbnailUrl("");
    }
    return () => {
      URL.revokeObjectURL(url);
      setFileUrl("");
    };
  }, [fileBlob]);
  // 2) check autenticazione
  if (authLoading) return <Spinner size="xl" />;
  if (!user) {
    showToast({ title: "Devi essere loggato", status: "error" });
    window.location.href = "/login";
    return null;
  }

  // quando FileUpload.Root invoca onChange
  const handleFileChange = (payload: {
    files: File[];
    fileRejections: any[];
  }) => {
    console.log("Ricevuti:", payload.files);
    const f = payload.files[0] ?? null;
    setFileBlob(f);
  };
  console.log("File Blob" + fileBlob);
  const handleSubmit = async () => {
    if (!fileBlob) {
      showToast({
        title: "Seleziona un’immagine o un video",
        status: "warning",
      });
      return;
    }

    if (!title.trim()) {
      showToast({ title: "Inserisci un titolo", status: "warning" });
      return;
    }

    setUploading(true);
    try {
      const isVideo = fileBlob.type.startsWith("video/");
      const ref = storageRef(
        storage,
        `posts/${user.uid}/${Date.now()}-${fileBlob.name}`
      );
      await uploadBytes(ref, fileBlob);
      const mediaUrl = await getDownloadURL(ref);
      let finalThumbnailUrl = mediaUrl; // di default è l'immagine

      if (isVideo && thumbnailBlob) {
        const thumbRef = storageRef(
          storage,
          `posts/${user.uid}/thumb-${Date.now()}-${thumbnailBlob.name}`
        );
        await uploadBytes(thumbRef, thumbnailBlob);
        finalThumbnailUrl = await getDownloadURL(thumbRef);
      }
      await addDoc(collection(db, "posts"), {
        mediaUrl,
        mediaType: isVideo ? "video" : "image",
        title: title.trim(),
        description: description.trim() || null,
        isGated,
        likesCount: 0,
        commentsCount: 0,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        thumbnailUrl: finalThumbnailUrl,
      });

      showToast({ title: "Post creato!", status: "success" });
      // reset form
      setTitle("");
      setDescription("");
      setIsGated(false);
      setFileBlob(null);
      setFileUrl("");
    } catch (err: any) {
      showToast({ title: "Errore", description: err.message, status: "error" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" py={6} px={4} mt={"8em"}>
      <Box w="full" maxW="md" bg="white" p={6} boxShadow="md" borderRadius="lg">
        <VStack gap={4} align="stretch">
          <Heading size="md" textAlign="center">
            {t("create_new_post_title")}
          </Heading>

          {/* Upload immagine/video */}
          <Field.Root>
            <Field.Label> {t("image_or_video")}</Field.Label>

            <FileUpload.Root
              accept="image/*,video/*"
              onFileAccept={handleFileChange}
            >
              <FileUpload.HiddenInput />
              <FileUpload.Trigger asChild {...({} as any)}>
                <Button variant="outline" size="md">
                  <Icon as={LuFileIcon}></Icon>
                  {t("select_file")}
                </Button>
              </FileUpload.Trigger>
              {fileBlob && (
                <Box
                  mt={3}
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  bg="gray.50"
                  fontSize="sm"
                  textAlign="left"
                  wordBreak="break-all"
                >
                  <Text>
                    {fileBlob.type.startsWith("video/")
                      ? "🎥 Video:"
                      : "🖼️ Immagine:"}{" "}
                    <strong>{fileBlob.name}</strong>
                  </Text>
                  <Text color="gray.500" fontSize="xs">
                    {Math.round(fileBlob.size / 1024)} KB
                  </Text>
                </Box>
              )}
              {fileBlob?.type.startsWith("video/") && (
                <Field.Root required>
                  <Field.Label>Anteprima del video *</Field.Label>
                  <FileUpload.Root
                    accept="image/*"
                    onFileAccept={({ files }: any) => {
                      const f = files[0];
                      setThumbnailBlob(f);
                      const url = URL.createObjectURL(f);
                      setThumbnailUrl(url);
                    }}
                  >
                    <FileUpload.HiddenInput />

                    <FileUpload.Trigger asChild {...({} as any)}>
                      <Button variant="outline" size="md">
                        <Icon as={LuFileIcon} /> {t("select_image")}
                      </Button>
                    </FileUpload.Trigger>
                  </FileUpload.Root>

                  {thumbnailUrl && (
                    <Image
                      src={thumbnailUrl}
                      alt="Anteprima Thumbnail"
                      boxSize="150px"
                      mt={3}
                      borderRadius="md"
                      objectFit="cover"
                      mx="auto"
                    />
                  )}
                </Field.Root>
              )}

              {/* preview + delete automatici */}
              {fileUrl && !fileBlob?.type.startsWith("video/") && (
                <Image
                  src={fileUrl}
                  alt="Anteprima"
                  boxSize="200px"
                  objectFit="cover"
                  borderRadius="md"
                  mt={4}
                  mx="auto"
                />
              )}
            </FileUpload.Root>
          </Field.Root>

          {/* Titolo */}
          <Field.Root required>
            <Field.Label>{t("title_post")} *</Field.Label>
            <Input
              placeholder={t("title_post")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field.Root>

          {/* Descrizione */}
          <Field.Root>
            <Field.Label>{t("description_post")} *</Field.Label>
            <Textarea
              placeholder={t("description_post")}
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
              <Switch.Label>{t("only_member_switch")}</Switch.Label>
            </Switch.Root>
          </Field.Root>

          {/* Bottone Crea */}
          <Button
            colorPalette="teal"
            onClick={handleSubmit}
            loading={uploading}
          >
            {t("create_post_button")}
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};
