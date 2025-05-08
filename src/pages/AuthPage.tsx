// src/pages/AuthPage.tsx
import React, { useState } from "react";
import {
  Center,
  Box,
  VStack,
  Image,
  Input,
  Button,
  Text,
  Link,
} from "@chakra-ui/react";

import { showToast } from "../components/Toaster";

import logo from "../assets/logo.png";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export const AuthPage: React.FC = () => {
  // toggle login / register
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // register state
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);

      navigate("/");
      // ← qui redirect alla home
    } catch (err: any) {
      showToast({
        title: "Errore nel login!",
        description: "Errore.",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (regPassword !== regConfirm) {
      showToast({
        title: "Password!",
        description: "Le password non coincidono.",
        status: "error",
      });
      return;
    }
    if (!regUsername) {
      showToast({
        title: "Username",
        description: "Inserisci uno username",
        status: "error",
      });
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        regEmail,
        regPassword
      );
      const uid = cred.user.uid;
      // salva utente in Firestore
      await setDoc(doc(db, "users", uid), {
        uid,
        username: regUsername,
        email: regEmail,
        permissions: "user",
        verified: false,
      });

      showToast({
        title: "ok",
        description: "Registrazione avvenuta!",
        status: "success",
      });
      setIsRegister(false);
    } catch (err: any) {
      showToast({
        title: "error",
        description: err.message,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center minH="100vh" w="100%" bg="#fafafa" p={4}>
      <VStack gap={4} w="full" maxW="400px">
        {/* Card principale */}
        <Box
          w="full"
          bg="white"
          p={{ base: 6, md: 10 }}
          rounded="2xl"
          boxShadow="lg"
        >
          <VStack gap={6}>
            <Image src={logo} alt="Logo" boxSize="100px" />

            {/* Form login o register */}
            {!isRegister ? (
              <>
                <Input
                  placeholder="Email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  size="lg"
                  rounded="md"
                  bg="gray.100"
                />
                <Input
                  placeholder="Password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  size="lg"
                  rounded="md"
                  bg="gray.100"
                />
                <Button
                  w="full"
                  colorScheme="blue"
                  size="lg"
                  onClick={handleLogin}
                  loading={loading}
                  loadingText="Accedi"
                >
                  Accedi
                </Button>

                <Link color="blue.500" fontSize="sm" onClick={() => navigate("/forgot-password")}>
                  Password dimenticata?
                </Link>
              </>
            ) : (
              <>
                <Input
                  placeholder="Username"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  size="lg"
                  rounded="md"
                  bg="gray.100"
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  size="lg"
                  rounded="md"
                  bg="gray.100"
                />
                <Input
                  placeholder="Password"
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  size="lg"
                  rounded="md"
                  bg="gray.100"
                />
                <Input
                  placeholder="Conferma Password"
                  type="password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  size="lg"
                  rounded="md"
                  bg="gray.100"
                />
                <Button
                  w="full"
                  colorScheme="green"
                  size="lg"
                  onClick={handleRegister}
                  loading={loading}
                  loadingText="Iscrizione..."
                >
                  Iscriviti
                </Button>
              </>
            )}
          </VStack>
        </Box>

        {/* Card bottom per switch login/register */}
        <Box w="full" bg="white" p={4} rounded="xl" boxShadow="md">
          <Text textAlign="center" fontSize="md">
            {!isRegister ? (
              <>
                Non hai un account?{" "}
                <Link color="blue.500" onClick={() => setIsRegister(true)}>
                  Iscriviti
                </Link>
              </>
            ) : (
              <>
                Hai già un account?{" "}
                <Link color="blue.500" onClick={() => setIsRegister(false)}>
                  Accedi
                </Link>
              </>
            )}
          </Text>
        </Box>
      </VStack>
    </Center>
  );
};
