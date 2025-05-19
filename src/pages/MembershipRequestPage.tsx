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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
        title: t("complete_field_error"),
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
        title: t("title_toast_membership"),
        description: t("description_toast_membership"),
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
        description: err.message || t("error_toast_membership"),
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
            <Field.Label>{t("membership.name")}</Field.Label>
            <Input
              placeholder={t("membership.name")}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Field.Root>

          {/* Cognome */}
          <Field.Root required>
            <Field.Label>{t("membership.surname")}</Field.Label>
            <Input
              placeholder={t("membership.surname")}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Field.Root>

          {/* Data di nascita */}
          <Field.Root required>
            <Field.Label>{t("membership.date_birth")}</Field.Label>
            <Input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </Field.Root>

          {/* Consumo mensile stimato */}
          <Field.Root required>
            <Field.Label>{t("membership.estimated_consumption")}</Field.Label>
            <NumberInput.Root
              value={[estimated]}
              onValueChange={(values: any[]) => {
                const newValue = values[0];
                setEstimated(newValue);
              }}
              max={31}
              w="full"
            >
              <NumberInput.Control w="full" {...({} as any)}>
                <NumberInput.Input placeholder="0" {...({} as any)} />
              </NumberInput.Control>
              <NumberInput.Scrubber />
            </NumberInput.Root>
          </Field.Root>

          {/* Foto del Documento */}
          <Field.Root required>
            <Field.Label>{t("membership.photo_id")}</Field.Label>
            <FileUpload.Root
              accept="image/*,application/pdf"
              onFileAccept={({ files }: any) => setDocFile(files[0] ?? null)}
            >
              <FileUpload.HiddenInput />
              <FileUpload.Trigger asChild {...({} as any)}>
                <Button w="full" variant="outline">
                  {t("select_file")}
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
            <Field.Label>{t("membership.how_find_us")}</Field.Label>
            <Input
              placeholder="Es. Social, Google..."
              value={foundVia}
              onChange={(e) => setFoundVia(e.target.value)}
            />
          </Field.Root>

          {/* Perché vuoi diventare membro */}
          <Field.Root required>
            <Field.Label>{t("membership.why_member")}</Field.Label>
            <Textarea
              resize="vertical"
              placeholder="Write here..."
              value={why}
              onChange={(e) => setWhy(e.target.value)}
            />
          </Field.Root>

          <Button
            colorScheme="teal"
            onClick={handleSubmit}
            loading={submitting}
          >
            {t("membership.send_request")}
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
};
