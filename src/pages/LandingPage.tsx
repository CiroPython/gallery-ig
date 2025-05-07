// src/pages/LandingPage.tsx
import React from "react";
import { VStack, Box } from "@chakra-ui/react";

import { PostsGrid } from "../components/PostsGrid";

export const LandingPage: React.FC = () => (
  <Box w="full" mt={4}>
    <PostsGrid />
  </Box>
);
