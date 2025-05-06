// src/App.tsx
import React from "react";
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

function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <UserProvider>
        <BrowserRouter>
          {/* Header sempre visibile */}
          <AppHeader />

          {/* Spazio in cima per non far scorrere il contenuto sotto l’header */}
          <Box pt={{ base: "36px", md: "50px" }}>
            <Routes>
              {/* Home / Landing */}
              <Route path="/" element={<LandingPage />} />

              {/* Login / Registrazione */}
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />
              <Route path="/createpost" element={<CreatePostPage />} />
              {/* Redirect per qualsiasi altra rotta */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </BrowserRouter>
        <ToastProvider /> {/* ← monta qui il container */}
      </UserProvider>
    </ChakraProvider>
  );
}

export default App;
