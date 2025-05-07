import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Like / Unlike Post
export const likePost = functions.https.onCall(
  async (data, context) => {
    const uid = context.auth?.uid;
    if (!uid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Devi essere loggato"
      );
    }
    const {postId} = data;
    const likeRef = db
      .collection("posts")
      .doc(postId)
      .collection("likes")
      .doc(uid);
    await likeRef.set({createdAt:admin.firestore.FieldValue.serverTimestamp()});
    await db
      .collection("posts")
      .doc(postId)
      .update({likesCount:admin.firestore.FieldValue.increment(1)});
    return {success:true};
  }
);

export const unlikePost = functions.https.onCall(
  async (data, context) => {
    const uid = context.auth?.uid;
    if (!uid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Devi essere loggato"
      );
    }
    const {postId} = data;
    const likeRef = db
      .collection("posts")
      .doc(postId)
      .collection("likes")
      .doc(uid);
    await likeRef.delete();
    await db
      .collection("posts")
      .doc(postId)
      .update({likesCount:admin.firestore.FieldValue.increment(-1)});
    return {success:true};
  }
);

// Commenti: Crea, Modifica, Elimina
export const addComment = functions.https.onCall(
  async (data, context) => {
    const uid = context.auth?.uid;
    if (!uid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Devi essere loggato"
      );
    }
    const {postId,text,username} = data;
    const commentsRef = db
      .collection("posts")
      .doc(postId)
      .collection("comments");
    const snap = await commentsRef.add({
      uid,
      text,
      username,
      createdAt:admin.firestore.FieldValue.serverTimestamp(),
    });
    return {success:true,commentId:snap.id};
  }
);

export const editComment = functions.https.onCall(
  async (data, context) => {
    const uid = context.auth?.uid;
    if (!uid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Devi essere loggato"
      );
    }
    const {postId,commentId,newText} = data;
    const commentRef = db
      .collection("posts")
      .doc(postId)
      .collection("comments")
      .doc(commentId);
    const snap = await commentRef.get();
    if (!snap.exists||snap.data()?.uid!==uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Non puoi modificare questo commento"
      );
    }
    await commentRef.update({
      text:newText,
      editedAt:admin.firestore.FieldValue.serverTimestamp(),
    });
    return {success:true};
  }
);

export const deleteComment = functions.https.onCall(
  async (data, context) => {
    const uid = context.auth?.uid;
    if (!uid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Devi essere loggato"
      );
    }
    const {postId,commentId} = data;
    const commentRef = db
      .collection("posts")
      .doc(postId)
      .collection("comments")
      .doc(commentId);
    const snap = await commentRef.get();
    if (!snap.exists||snap.data()?.uid!==uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Non puoi eliminare questo commento"
      );
    }
    await commentRef.delete();
    return {success:true};
  }
);

// Save / Unsave Post
export const savePost = functions.https.onCall(
  async (data, context) => {
    const uid = context.auth?.uid;
    if (!uid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Devi essere loggato"
      );
    }
    const {postId} = data;
    await db
      .collection("users")
      .doc(uid)
      .collection("savedPosts")
      .doc(postId)
      .set({savedAt:admin.firestore.FieldValue.serverTimestamp()});
    return {success:true};
  }
);

export const unsavePost = functions.https.onCall(
  async (data, context) => {
    const uid = context.auth?.uid;
    if (!uid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Devi essere loggato"
      );
    }
    const {postId} = data;
    await db
      .collection("users")
      .doc(uid)
      .collection("savedPosts")
      .doc(postId)
      .delete();
    return {success:true};
  }
);
