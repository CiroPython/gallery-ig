// src/components/PostOptionsDrawer.tsx
import {
  Drawer,
  Button,
  VStack,
  chakra,
  IconButton,
  Box,
} from "@chakra-ui/react";
import { FaEllipsisH } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useDisclosure } from "@chakra-ui/react";
import { forwardRef } from "react";

const OptionsIcon = chakra(FaEllipsisH as any);

interface Props {
  postId: string;
  isOwner: boolean;
}

export const PostOptionsDrawer = ({ postId, isOwner }: Props) => {
  const { open, onOpen, onClose } = useDisclosure();
  const functions = getFunctions();
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      const deletePost = httpsCallable(functions, "deletePost");
      await deletePost({ postId });
      onClose();
    } catch (err) {
      console.error("Errore eliminazione post:", err);
    }
  };

  if (!isOwner) return null;
  // Wrapper per Drawer.Content con Chakra Box
  const DrawerContentWrapper = forwardRef<
    HTMLDivElement,
    React.ComponentProps<typeof Box>
  >(({ children, ...props }, ref) => (
    <Drawer.Content>
      <Box ref={ref} {...props}>
        {children}
      </Box>
    </Drawer.Content>
  ));

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(v: { open: any }) => (v.open ? onOpen() : onClose())}
      closeOnOutsideClick
      placement="bottom"
    >
      <Drawer.Backdrop />
      <Drawer.Trigger asChild {...({} as any)}>
        <IconButton aria-label="Opzioni post" variant="ghost" size="sm">
          <OptionsIcon />
        </IconButton>
      </Drawer.Trigger>
      <Drawer.Positioner>
        <DrawerContentWrapper
          borderTopRadius="xl"
          maxH="80vh"
          display="flex"
          flexDirection="column"
        >
          <Drawer.CloseTrigger />
          <Drawer.Header borderBottomWidth="1px">
            <Drawer.Title textAlign="center" {...({} as any)}>
              Opzioni post
            </Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            <VStack gap={4} mt={4}>
              <Button
                w="full"
                onClick={() => {
                  navigate(`/post/${postId}/edit`);
                  onClose();
                }}
              >
                Modifica
              </Button>
              <Button w="full" colorPalette="red" onClick={handleDelete}>
                Elimina
              </Button>
            </VStack>
          </Drawer.Body>
        </DrawerContentWrapper>
      </Drawer.Positioner>
    </Drawer.Root>
  );
};
