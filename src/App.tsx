// src/App.tsx
import React, { useEffect } from "react";
import {
  ChakraProvider,
  defaultSystem,
  Box,
  FileUpload,
  useFileUpload,
} from "@chakra-ui/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AppHeader } from "./components/AppHeader";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { ToastProvider } from "@chakra-ui/toast";
import { UserProvider } from "./context/UserContext";
import { CreatePostPage } from "./pages/CreatePostPage";
import PostPage from "./pages/PostPage";
import { InstallBanner } from "./components/InstallBanner";
import { IosInstallBanner } from "./components/IosInstallBanner";
import { SavedPostsPage } from "./pages/SavedPostsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { EditProfilePage } from "./pages/EditProfilePage";
import { EditPostPage } from "./pages/EditPostPage";
import { VerificationRequestsPage } from "./pages/VerificationRequestsPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";

function App() {
    // 🔥 Hack iOS PWA:
    useEffect(() => {
      const noop = () => { /* just a dummy touch listener */ };
      // listener NON-passive per sbloccare focus/input su iOS PWA
      document.addEventListener("touchstart", noop, false);
      return () => document.removeEventListener("touchstart", noop);
    }, []);
  return (
    <ChakraProvider value={defaultSystem}>
      <UserProvider>
        <BrowserRouter>
          {/* Header sempre visibile */}
          <AppHeader />

          {/* Spazio in cima per non far scorrere il contenuto sotto l’header */}
          <Box pt={{ base: "56px", md: "50px" }}>
            <Routes>
              {/* Home / Landing */}
              <Route path="/" element={<LandingPage />} />

              {/* Login / Registrazione */}
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />
              <Route path="/createpost" element={<CreatePostPage />} />
              <Route path="/post/:id" element={<PostPage />} />
              <Route path="/saved" element={<SavedPostsPage />} />
              <Route path="/profile/:id" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<EditProfilePage />} />
              <Route path="/post/:id/edit" element={<EditPostPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route
                path="/admin/requests"
                element={<VerificationRequestsPage />}
              />
              {/* Redirect per qualsiasi altra rotta */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
          <InstallBanner />
          <IosInstallBanner />
        </BrowserRouter>
        <ToastProvider /> {/* ← monta qui il container */}
      </UserProvider>
    </ChakraProvider>
  );
}

export default App;
