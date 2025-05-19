import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import { useUser } from "../context/UserContext";
import { PostsGrid } from "../components/PostsGrid";

export const LandingPage: React.FC = () => {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login"); // O qualsiasi rotta tu usi per il login
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return null; // o uno Spinner se preferisci
  }

  return (
    <Box w="full" mt={4}>
      <PostsGrid />
    </Box>
  );
};
