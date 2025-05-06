import React from "react";
import { Box, Text, HStack, IconButton, chakra } from "@chakra-ui/react";
import { createStandaloneToast } from "@chakra-ui/toast";
import { FiX } from "react-icons/fi";
const FiXicon = chakra(FiX as any);
// 1) crea la coppia toast + container
const { toast, ToastContainer } = createStandaloneToast();

// 2) esporta il container da montare in App.tsx
export const Toaster: React.FC = () => <ToastContainer />;

// 3) helper per mostrare i toast con grafica custom
interface ShowToastProps {
  title: string;
  description?: string;
  status?: "info" | "success" | "warning" | "error" | "loading";
  duration?: number;
}
export function showToast({
  title,
  description,
  status = "info",
  duration = 3000,
}: ShowToastProps) {
  toast({
    // posizionamento fisso in alto al centro
    position: "bottom-right",
    duration,
    isClosable: true,
    render: ({ onClose }) => {
      // scegli il colore di header in base allo status
      const headerBg =
        status === "success"
          ? "green.500"
          : status === "error"
          ? "red.500"
          : status === "warning"
          ? "orange.500"
          : "blue.500";

      return (
        <Box
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          boxShadow="lg"
          overflow="hidden"
          w="300px"
        >
          {/* header colorato */}
          <HStack
            bg={headerBg}
            px={4}
            py={2}
            justify="space-between"
            align="center"
          >
            <Text color="white" fontSize="sm" fontWeight="bold">
              {title}
            </Text>
            <IconButton
              aria-label="Close"
              size="sm"
              variant="ghost"
              onClick={() => onClose()}
            >
              <FiXicon />
            </IconButton>
          </HStack>

          {/* descrizione */}
          {description && (
            <Box px={4} py={3}>
              <Text fontSize="sm" color="gray.700">
                {description}
              </Text>
            </Box>
          )}
        </Box>
      );
    },
  });
}
