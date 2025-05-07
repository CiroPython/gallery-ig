import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { Box, Button, Text } from "@chakra-ui/react";

export const InstallBanner = () => {
  const { showPrompt, installApp } = useInstallPrompt();

  if (!showPrompt) return null;

  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      bg="white"
      borderTop="1px solid #ddd"
      p={4}
      textAlign="center"
      zIndex={1000}
      shadow="md"
    >
      <Text mb={2}>Vuoi aggiungere questa app alla schermata Home?</Text>
      <Button colorScheme="blue" onClick={installApp}>
        Installa
      </Button>
    </Box>
  );
};
