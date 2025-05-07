import {
    Box,
    Button,
    Text,
    HStack,
    Icon,
    chakra,
  } from "@chakra-ui/react";
  import { useIosInstallPrompt } from "../hooks/useIosInstallPrompt";
  import { IoShareOutline } from "react-icons/io5";
  import { motion, AnimatePresence } from "framer-motion";
  const ShareIcon = chakra(IoShareOutline as any);
  const MotionBox = motion(Box);
  
  export const IosInstallBanner = () => {
    const { showIosPrompt, dismissPrompt } = useIosInstallPrompt();
  
    return (
      <AnimatePresence>
        {showIosPrompt && (
          <MotionBox
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            bg="white"
            p={4}
            borderTopRadius="xl"
            boxShadow="lg"
            mx="auto"
            maxW="md"
            mb="env(safe-area-inset-bottom)"
            position="fixed"
            bottom={0}
            left={0}
            right={0}
            zIndex={9999}
          >
            <HStack justify="center" gap={2}>
              <Icon boxSize={6} ><ShareIcon/></Icon>
              <Text fontSize="sm" textAlign="center">
                Per installare questa app, premi <strong>Condividi</strong> e poi <strong>“Aggiungi alla schermata Home”</strong>.
              </Text>
            </HStack>
  
            <HStack justify="center" mt={3}>
              <Button size="sm" onClick={dismissPrompt} variant="outline">
                Non mostrare più
              </Button>
            </HStack>
          </MotionBox>
        )}
      </AnimatePresence>
    );
  };
  