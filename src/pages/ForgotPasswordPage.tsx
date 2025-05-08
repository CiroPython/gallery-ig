// src/pages/ForgotPasswordPage.tsx
import React, { useState } from "react";
import {
  Center,
  Box,
  VStack,
  Input,
  Button,
  Text,
  Link,

} from "@chakra-ui/react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/Toaster";

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleReset = async () => {
    if (!email) {
      showToast({ title: "Inserisci la tua email", status: "error", });
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      showToast({
        title: "Email inviata",
        description: "Controlla la tua casella per il link di reset.",
        status: "success",
    
      });
      navigate("/login");
    } catch (err: any) {
        showToast({
        title: "Errore",
        description: err.message || "Impossibile inviare l'email.",
        status: "error",

      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center minH="100vh" w="100%" bg="#fafafa" p={4}>
      <VStack gap={4} w="full" maxW="400px">
        <Box
          w="full"
          bg="white"
          p={{ base: 6, md: 10 }}
          rounded="2xl"
          boxShadow="lg"
        >
          <VStack gap={6}>
            <Text fontSize="2xl" fontWeight="bold">
              Reimposta password
            </Text>
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="lg"
              rounded="md"
              bg="gray.100"
            />
            <Button
              w="full"
              colorScheme="blue"
              size="lg"
              onClick={handleReset}
              loading={loading}
              loadingText="Invio..."
            >
              Invia link di reset
            </Button>
            <Link color="blue.500" fontSize="sm" onClick={() => navigate("/login")}>
              Torna al login
            </Link>
          </VStack>
        </Box>
      </VStack>
    </Center>
  );
};
