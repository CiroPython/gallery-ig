// src/contexts/UserContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

// Tipi del profilo aggiuntivo in Firestore
export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  permissions: string;
}

// Tipi esposti dal Context
interface IUserContext {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<IUserContext | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sottoscrizione AuthState
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (usr) => {
      setUser(usr);
      if (usr) {
        // carica il profilo da Firestore
        const ref = doc(db, "users", usr.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        } else {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Funzione di login
  const login = async (email: string, pass: string) => {
    setLoading(true);
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    // profile sarà aggiornato automaticamente dall’onAuthStateChanged
    setLoading(false);
  };

  // Funzione di registrazione
  const register = async (email: string, pass: string, username: string) => {
    setLoading(true);
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = cred.user.uid;
    // crea profilo vuoto in Firestore
    const profileData: UserProfile = {
      uid,
      username,
      email,
      permissions: "user",
    };
    await setDoc(doc(db, "users", uid), profileData);
    // profile sarà caricato da onAuthStateChanged
    setLoading(false);
  };

  // Funzione di logout
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <UserContext.Provider
      value={{ user, profile, loading, login, register, logout }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Hook per consumare il context
export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within UserProvider");
  }
  return ctx;
};
