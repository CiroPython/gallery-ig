// src/pages/SavedPostsPage.tsx
import {
  SimpleGrid,
  Box,
  Image,
  Center,
  Spinner,
  chakra,
  Text,
} from "@chakra-ui/react";
import { FaVideo, FaImage, FaLock } from "react-icons/fa";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Post } from "../data";

const LockIcon = chakra(FaLock as any);
const VideoIcon = chakra(FaVideo as any);
const ImageIcon = chakra(FaImage as any);

export const SavedPostsPage: React.FC = () => {
  const { user, loading: authLoading } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchSavedPosts = async () => {
      try {
        const savedRef = collection(db, "users", user.uid, "savedPosts");
        const savedDocs = await getDocs(savedRef);

        const postsData: Post[] = [];

        for (const docSnap of savedDocs.docs) {
          const postId = docSnap.id;
          const postDoc = await getDoc(doc(db, "posts", postId));
          if (postDoc.exists()) {
            const data = postDoc.data();
            postsData.push({
              id: postId,
              mediaUrl: data.mediaUrl,
              mediaType: data.mediaType,
              isGated: data.isGated,
              title: data.title,
              description: data.description,
              thumbnailUrl: data.thumbnailUrl,
              likesCount: data.likesCount,
            });
          }
        }

        setPosts(postsData);
      } catch (err) {
        console.error("Errore recupero salvati:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [user]);

  if (loading || authLoading) {
    return (
      <Center mt={8}>
        <Spinner size="xl" />
      </Center>
    );
  }

  return posts.length > 0 ? (
    <SimpleGrid
      mt={6} // 👈 margine dall'alto
      columns={{ base: 2, sm: 3, md: 4 }}
      gap={{ base: 1, sm: 2, md: 4 }}
      px={4}
      pb={8}
    >
      {posts.map((post) => (
        <Box
          key={post.id}
          position="relative"
          cursor="pointer"
          onClick={() => navigate(`/post/${post.id}`)}
        >
          {post.mediaType === "video" ? (
            <>
              <Center position="absolute" inset="0" bg="rgba(0,0,0,0.5)">
                <VideoIcon boxSize={8} color="white" />
              </Center>
              <Image
                src={post.thumbnailUrl}
                alt=""
                objectFit="cover"
                w="100%"
                h="100%"
              />
            </>
          ) : (
            <>
              <Center position="absolute" inset="0" bg="rgba(0,0,0,0.5)">
                <ImageIcon boxSize={8} color="white" />
              </Center>
              <Image
                src={post.mediaUrl}
                alt=""
                objectFit="cover"
                w="100%"
                h="100%"
              />
            </>
          )}

          {post.isGated && !user && (
            <Center position="absolute" inset="0" bg="rgba(0,0,0,0.5)">
              <LockIcon boxSize={10} color="white" />
            </Center>
          )}
        </Box>
      ))}
    </SimpleGrid>
  ) : (
    <Center py={24} px={6}>
      <Box textAlign="center">
        <Text fontSize="lg" color="gray.600" fontWeight="medium">
          Nessun post salvato
        </Text>
        <Text fontSize="sm" color="gray.500" mt={2}>
          Quando salvi un post, apparirà qui.
        </Text>
      </Box>
    </Center>
  );
};
