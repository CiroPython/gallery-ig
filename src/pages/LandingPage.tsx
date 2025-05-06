// src/pages/LandingPage.tsx
import React from "react";
import { VStack, Box } from "@chakra-ui/react";

import { PostsGrid } from "../components/PostsGrid";

export const LandingPage: React.FC = () => (
  <Box pt={{ base: "36px", md: "60px" }}>
    <VStack gap={0}>
      <PostsGrid />
    </VStack>
  </Box>
);
