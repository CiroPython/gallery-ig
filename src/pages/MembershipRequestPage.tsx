// src/pages/MembershipRequestPage.tsx
import React, { useState, useEffect } from "react";
import {
  Flex,
  Box,
  Heading,
  VStack,
  Button,
  Spinner,
  Input,
  Textarea,
  chakra,
  NumberInput,
  FileUpload,
  Field,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { storage, db } from "../firebase";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { showToast } from "../components/Toaster";

export const MembershipRequestPage: React.FC = () => {
  const { user, loading: authLoading } = useUser();
  const navigate = useNavigate();

  // stati del form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [estimated, setEstimated] = useState<string>(""); // mantiene stringa

  const [foundVia, setFoundVia] = useState("");
  const [why, setWhy] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docPreview, setDocPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // se non loggato, forziamo il login
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  // preview del documento
  useEffect(() => {
    if (!docFile) {
      setDocPreview("");
      return;
    }
    const url = URL.createObjectURL(docFile);
    setDocPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [docFile]);

  const handleSubmit = async () => {
    // validiamo e convertiamo estimated in numero
    const estNum = parseInt(estimated, 10);
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !dob ||
      isNaN(estNum) ||
      estNum > 31 ||
      !foundVia.trim() ||
      !why.trim() ||
      !docFile ||
      !user
    ) {
      showToast({
        title: "Completa tutti i campi correttamente",
        status: "warning",
      });
      return;
    }

    setSubmitting(true);
    try {
      // 1) upload del documento
      const path = `memberships/${user.uid}/${Date.now()}-${docFile.name}`;
      const storageReference = storageRef(storage, path);
      await uploadBytes(storageReference, docFile);
      const documentUrl = await getDownloadURL(storageReference);

      // 2) salva la richiesta in Firestore
      await addDoc(collection(db, "membershipRequests"), {
        userId: user.uid,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dob,
        estimatedMonthly: estNum,
        documentUrl,
        foundVia: foundVia.trim(),
        reason: why.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
      });

      showToast({
        title: "Richiesta inviata",
        description: "Ti contatteremo a breve.",
        status: "success",
      });

      // reset form
      setFirstName("");
      setLastName("");
      setDob("");
      setEstimated("");
      setFoundVia("");
      setWhy("");
      setDocFile(null);
    } catch (err: any) {
      showToast({
        title: "Errore",
        description: err.message || "Impossibile inviare la richiesta.",
        status: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <Flex align="center" justify="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Flex bg="gray.50" minH="100vh" p={4} align="center" justify="center">
      <Box bg="white" p={6} borderRadius="lg" boxShadow="md" w="full" maxW="md">
        <VStack gap={6} align="stretch">
          <Heading size="md" textAlign="center">
            Richiesta Membership
          </Heading>

          {/* Nome */}
          <Field.Root required>
            <Field.Label>Nome</Field.Label>
            <Input
              placeholder="Il tuo nome"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Field.Root>

          {/* Cognome */}
          <Field.Root required>
            <Field.Label>Cognome</Field.Label>
            <Input
              placeholder="Il tuo cognome"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Field.Root>

          {/* Data di nascita */}
          <Field.Root required>
            <Field.Label>Data di Nascita</Field.Label>
            <Input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </Field.Root>

          {/* Consumo mensile stimato */}
          <Field.Root required>
            <Field.Label>Consumo mensile stimato (max 31 gr)</Field.Label>
            <NumberInput.Root
  value={[estimated]}
  onValueChange={(values: any[]) => {
    const newValue = values[0];
    setEstimated(newValue);
  }}
  max={31}
  w="full"
>
  <NumberInput.Control w="full">
    <NumberInput.Input placeholder="0" />
  </NumberInput.Control>
  <NumberInput.Scrubber />
</NumberInput.Root>

          </Field.Root>

          {/* Foto del Documento */}
          <Field.Root required>
            <Field.Label>Foto del Documento</Field.Label>
            <FileUpload.Root
              accept="image/*,application/pdf"
              onFileAccept={({ files }:any) => setDocFile(files[0] ?? null)}
            >
              <FileUpload.HiddenInput />
              <FileUpload.Trigger asChild>
                <Button w="full" variant="outline">
                  Seleziona file
                </Button>
              </FileUpload.Trigger>
            </FileUpload.Root>
            {docPreview && (
              <chakra.img
                src={docPreview}
                alt="Anteprima documento"
                mt={2}
                maxH="150px"
                objectFit="contain"
                w="full"
                borderRadius="md"
              />
            )}
          </Field.Root>

          {/* Come ci hai trovati? */}
          <Field.Root required>
            <Field.Label>Come ci hai trovati?</Field.Label>
            <Input
              placeholder="Es. Social, passaparola..."
              value={foundVia}
              onChange={(e) => setFoundVia(e.target.value)}
            />
          </Field.Root>

          {/* Perché vuoi diventare membro */}
          <Field.Root required>
            <Field.Label>
              Perché vuoi diventare membro del nostro club?
            </Field.Label>
            <Textarea
              resize="vertical"
              placeholder="Scrivi qui..."
              value={why}
              onChange={(e) => setWhy(e.target.value)}
            />
          </Field.Root>

          <Button
            colorScheme="teal"
            onClick={handleSubmit}
            loading={submitting}
          >
            Invia Richiesta
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
};
