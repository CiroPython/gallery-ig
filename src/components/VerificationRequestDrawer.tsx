// src/components/VerificationRequestDrawer.tsx
import React, { useEffect, useState } from "react";
import {
  Drawer,
  Button,
  VStack,
  IconButton,
  Text,
  Box,
  Spinner,
  chakra,
} from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";
import { FileUpload } from "@chakra-ui/react";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { storage, db } from "../firebase";
import { useUser } from "../context/UserContext";
import { showToast } from "./Toaster";

const CheckIcon = chakra(FaCheckCircle as any);

export const VerificationRequestDrawer: React.FC = () => {
  const { user } = useUser();
  const functions = getFunctions();

  const [isOpen, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [hasPending, setHasPending] = useState<boolean>(false);

  // 1) Check pending request on mount / user change
  useEffect(() => {
    if (!user) return;
    (async () => {
      const q = query(
        collection(db, "verificationRequests"),
        where("userId", "==", user.uid),
        where("status", "==", "pending")
      );
      const snap = await getDocs(q);
      setHasPending(!snap.empty);
    })();
  }, [user]);
  const open = () => setOpen(true);
  const close = () => {
    if (!uploading) {
      setFile(null);
      setOpen(false);
    }
  };

  const handleFileAccept = ({ files }: { files: File[] }) => {
    setFile(files[0] ?? null);
  };

  const handleSubmit = async () => {
    if (!user || !file) return;
    setUploading(true);
    try {
      // 1) carica su Storage
      const path = `verifications/${user.uid}/${Date.now()}-${file.name}`;
      const ref = storageRef(storage, path);
      await uploadBytes(ref, file);
      const url = await getDownloadURL(ref);

      // 2) salva richiesta in Firestore
      await addDoc(collection(db, "verificationRequests"), {
        userId: user.uid,
        docUrl: url,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      showToast({
        title: "Richiesta inviata",
        description: "Ti faremo sapere a breve.",
        status: "success",
        duration: 5000,
      });
      close();
    } catch (err: any) {
      console.error(err);
      showToast({
        title: "Errore",
        description: err.message || "Impossibile inviare la richiesta.",
        status: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(o: any) => (o ? open() : close())}
      placement="bottom"
      closeOnOutsideClick
    >
      <Drawer.Backdrop />
      <Drawer.Trigger asChild>
        <IconButton aria-label="Richiedi verifica" variant="ghost" size="sm">
          <CheckIcon color="gray.400" boxSize={5} />
        </IconButton>
      </Drawer.Trigger>
      <Drawer.Positioner>
        <Drawer.Content borderTopRadius="2xl" maxH="70vh">
          <Drawer.CloseTrigger />
          <Drawer.Header borderBottomWidth="1px" textAlign="center">
            <Drawer.Title>Verifica account</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            <VStack gap={4} mt={2}>
              {hasPending ? (
                <Text textAlign="center">
                  La tua richiesta di verifica è stata inviata, avrai il tuo
                  esito in 24-48h.
                </Text>
              ) : (
                <>
                  <Text>
                    Carica foto di un documento (es. carta d’identità) per
                    richiedere la verifica.
                  </Text>
                  <Text fontSize={"9px"} color="grey">
                    Una volta verificato il tuo account avrai accesso ad altri
                    contenuti esclusivi ad utenti verificati e in piú avrai
                    l'opzione di aggiungere post alla nostra galleria.
                  </Text>
                  <Box w="full">
                    <FileUpload.Root
                      accept="image/*,application/pdf"
                      onFileAccept={handleFileAccept}
                    >
                      <FileUpload.HiddenInput />
                      <FileUpload.Trigger asChild>
                        <Button w="full" variant="outline">
                          Seleziona file
                        </Button>
                      </FileUpload.Trigger>
                      {file && (
                        <Box
                          mt={2}
                          p={2}
                          borderWidth="1px"
                          borderRadius="md"
                          fontSize="sm"
                          wordBreak="break-all"
                        >
                          📄 <strong>{file.name}</strong> (
                          {Math.round(file.size / 1024)} KB)
                        </Box>
                      )}
                    </FileUpload.Root>
                  </Box>
                </>
              )}
            </VStack>
          </Drawer.Body>
          <Drawer.Footer borderTopWidth="1px">
            <Button
              variant="outline"
              onClick={close}
              mr={2}
              disabled={uploading}
            >
              Annulla
            </Button>
            {!hasPending && (
              <Button
                colorScheme="teal"
                onClick={handleSubmit}
                loading={uploading}
                disabled={!file || uploading}
              >
                Invia richiesta
              </Button>
            )}
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
};
