// src/pages/PostPage.tsx
import { useParams } from "react-router-dom";
import { PostCard } from "../components/PostCard";
import { useEffect, useState } from "react";
import { collection, doc, DocumentData, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { Post } from "../data";
import { db } from "../firebase";

export default function PostPage() {
  const { id } = useParams();
     const [post, setPost] = useState<DocumentData | undefined>([]);
     const  [idPost,setIdPost] = useState<string>();
  // carica i dettagli del post con questo id
  useEffect(() => {
    if (!id) return;
  
    const docRef = doc(db, "posts", id);
    setIdPost(docRef.id);
  
    const unsub = onSnapshot(docRef, (snap) => {
      const data = snap.data();
      if (data) setPost(data);
    });
  
    return () => unsub();
  }, [id]);


  if (!post) return <div>Loading…</div>;

  return (
    <PostCard
      post={post}
      id={idPost}
      // se vuoi, gestisci qui eventuale onClick secondario
    />
  );
}
