// src/components/PostOptionsDrawer.tsx
import {
  Drawer,
  Button,
  VStack,
  Text,
  chakra,
  IconButton,
} from "@chakra-ui/react";
import { FaEllipsisH } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useDisclosure } from "@chakra-ui/react";

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

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(v: { open: any }) => (v.open ? onOpen() : onClose())}
      closeOnOutsideClick
      placement="bottom"
    >
      <Drawer.Backdrop />
      <Drawer.Trigger asChild>
        <IconButton aria-label="Opzioni post" variant="ghost" size="sm">
          <OptionsIcon />
        </IconButton>
      </Drawer.Trigger>
      <Drawer.Positioner>
        <Drawer.Content
          borderTopRadius="xl"
          maxH="80vh"
          display="flex"
          flexDirection="column"
        >
          <Drawer.CloseTrigger />
          <Drawer.Header borderBottomWidth="1px">
            <Drawer.Title textAlign="center">Opzioni post</Drawer.Title>
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
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
};
