import {
    Drawer,
    IconButton,
    Input,
    VStack,
    HStack,
    Avatar,
    Box,
    Text,
    Button,
    Spinner,
    chakra,
  } from "@chakra-ui/react";
  import { FaRegComment, FaPaperPlane } from "react-icons/fa";
  import { useState, useEffect } from "react";
  import { getFunctions, httpsCallable } from "firebase/functions";
  import {
    collection,
    onSnapshot,
    orderBy,
    query,
  } from "firebase/firestore";
  import { db } from "../firebase";
  import { useUser } from "../context/UserContext";
  const CommentIcon = chakra(FaRegComment as any);
  const PaperIcon = chakra(FaPaperPlane as any);
  export const CommentDrawer = ({ postId }: { postId: string }) => {
    const { user,profile } = useUser();
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const functions = getFunctions();
    
    // Carica commenti live
    useEffect(() => {
      if (!postId) return;
      const q = query(
        collection(db, "posts", postId, "comments"),
        orderBy("createdAt", "asc")
      );
      const unsub = onSnapshot(q, (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setComments(list);
        setFetching(false);
      });
      return () => unsub();
    }, [postId]);
  
    // Invia commento
    const handleSubmit = async () => {
      if (!user || !comment.trim()) return;
      const addComment = httpsCallable(functions, "addComment");
      try {
        setLoading(true);
        await addComment({ postId, text: comment,username: profile?.username });
        setComment("");
      } catch (err) {
        console.error("Errore commento:", err);
      } finally {
        setLoading(false);
      }
    };
    const deleteComment = httpsCallable(functions, "deleteComment");

    const handleDeleteComment = async (commentId: string) => {
      const confirm = window.confirm("Sei sicuro di voler eliminare il commento?");
      if (!confirm) return;
      try {
        await deleteComment({ postId, commentId });
      } catch (err) {
        console.error("Errore eliminazione:", err);
      }
    };
    return (
      <Drawer.Root placement="bottom">
        <Drawer.Backdrop />
        <Drawer.Trigger asChild>
          <IconButton
            
            aria-label="Apri commenti"
            variant="ghost"
            size="sm"
            _hover={{
              bg:  "red.100",
              color: "red.600" ,
            }}
            _active={{
              transform: "scale(0.8)",
              color: "red.600" ,
            }}
            transition="all 0.2s"
          ><CommentIcon /></IconButton>
        </Drawer.Trigger>
        <Drawer.Positioner>
          <Drawer.Content
            borderTopRadius="2xl"
            height="80vh"
            display="flex"
            flexDirection="column"
          >
            <Drawer.CloseTrigger />
            <Drawer.Header textAlign="center" borderBottomWidth="1px">
              <Drawer.Title>Commenti</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body overflowY="auto" flex="1">
              {fetching ? (
                <Box pt={10} textAlign="center">
                  <Spinner />
                </Box>
              ) : comments.length === 0 ? (
                <Box pt={10} textAlign="center">
                  <Text fontWeight="bold">Ancora nessun commento</Text>
                  <Text fontSize="sm" color="gray.500">
                    Avvia la conversazione.
                  </Text>
                </Box>
              ) : (
                <VStack align="start" gap={4}>
                  {comments.map((c) => (
                   <Box w="100%">
    <HStack justify="space-between" align="start" w="100%">
      <HStack align="start">
        <Avatar.Root size="sm">
          <Avatar.Fallback>
            {c.username?.charAt(0).toUpperCase() ?? "U"}
          </Avatar.Fallback>
          {c.photoURL && <Avatar.Image src={c.photoURL} alt={c.username} />}
        </Avatar.Root>
        <Box>
          <Text fontWeight="bold" fontSize="sm">
            {c.username}
          </Text>
          <Text fontSize="sm">{c.text}</Text>
        </Box>
      </HStack>
  
      {user?.uid === c.uid && (
        <Button
          size="xs"
          variant="ghost"
          colorScheme="red"
          onClick={() => handleDeleteComment(c.id)}
        >
          Elimina
        </Button>
      )}
    </HStack>
  </Box>
  
       
                  ))}
          
                </VStack>
              )}
            </Drawer.Body>
            <Drawer.Footer borderTopWidth="1px">
              <HStack w="100%">
                <Input
                  placeholder="Aggiungi un commento..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  fontSize="16px"
                  disabled={!user}
                />
                <Button
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={!user || comment.trim() === ""}
                >
                  <PaperIcon />
                </Button>
              </HStack>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    );
  };
  