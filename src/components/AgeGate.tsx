// src/components/AgeGate.tsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  Portal,
  Button,
  Text,
  HStack,
  VStack,
  chakra,
} from "@chakra-ui/react";

// La radice del Dialog
const AgeDialog = chakra(Dialog.Root);

export const AgeGate: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Al primo mount controlla in localStorage
  useEffect(() => {
    const verified = localStorage.getItem("ageVerified");
    if (verified !== "true") {
      setIsOpen(true);
    }
  }, []);

  const handleYes = () => {
    localStorage.setItem("ageVerified", "true");
    setIsOpen(false);
  };

  const handleNo = () => {
    // reindirizza lontano dal sito
    window.location.href = "https://www.google.com/";
  };

  return (
    <AgeDialog open={isOpen} onOpenChange={(o: any) => !o && setIsOpen(true)}>
      <Dialog.Backdrop />

      <Portal>
        <Dialog.Positioner>
          <Dialog.Content
            bg="white"
            borderRadius="lg"
            maxW="xs"
            w="full"
            p={6}
            textAlign="center"
          >
            <Dialog.CloseTrigger /> {/* opzionale, ma lo nascondiamo via CSS */}
            <Dialog.Header mb={4}>
              <Text fontSize="xl" fontWeight="bold">
                Verifica età
              </Text>
            </Dialog.Header>
            <Dialog.Body>
              <Text mb={6}>
                Devi avere almeno <strong>18 anni</strong> per accedere a questo sito.
              </Text>
              <HStack gap={4} justify="center">
                <Button colorScheme="teal" onClick={handleYes}>
                  Sì, ho 18+
                </Button>
                <Button variant="outline" onClick={handleNo}>
                  No, esci
                </Button>
              </HStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </AgeDialog>
  );
};
