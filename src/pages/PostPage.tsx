// src/pages/PostPage.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, DocumentData, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

import { PostCard } from "../components/PostCard";

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState<DocumentData | undefined>([]);
  const [idPost, setIdPost] = useState<string>();

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
  console.log("post page " + idPost);
  return (
    <>
      {" "}
      <PostCard post={post} id={idPost} />{" "}
    </>
  );
}
