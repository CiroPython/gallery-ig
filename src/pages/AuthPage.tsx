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
import { useTranslation } from "react-i18next";

export const AuthPage: React.FC = () => {
  // toggle login / register
  const { t } = useTranslation();
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
        title: t("password"),
        description: t("toast.wrong_password"),
        status: "error",
      });
      return;
    }
    if (!regUsername) {
      showToast({
        title: "Username",
        description: t("toast.insert_username"),
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
        description: t("toast.signup_success"),
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
                  placeholder={t("email")}
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  size="lg"
                  rounded="md"
                  bg="gray.100"
                />
                <Input
                  placeholder={t("password")}
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
                  loadingText={t("enter_button")}
                >
                  {t("enter_button")}
                </Button>

                <Link
                  color="blue.500"
                  fontSize="sm"
                  onClick={() => navigate("/forgot-password")}
                >
                  {t("lost_password")}
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
                  placeholder={t("email")}
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  size="lg"
                  rounded="md"
                  bg="gray.100"
                />
                <Input
                  placeholder={t("password")}
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  size="lg"
                  rounded="md"
                  bg="gray.100"
                />
                <Input
                  placeholder={t("confirm_password")}
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
                  loadingText={t("register_button")}
                >
                  {t("register_button")}
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
                {t("no_account")}
                <Link color="blue.500" onClick={() => setIsRegister(true)}>
                  {t("no_account_button")}
                </Link>
              </>
            ) : (
              <>
                {t("already_member")}{" "}
                <Link color="blue.500" onClick={() => setIsRegister(false)}>
                  {t("already_member_button")}
                </Link>
              </>
            )}
          </Text>
        </Box>
      </VStack>
    </Center>
  );
};
