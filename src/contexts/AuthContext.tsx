import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User as FirebaseUser, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: 'admin' | 'superadmin') => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}



export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    // Login universal: todos los usuarios (incluido admin) usan Firebase Auth y perfil en Firestore
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    setCurrentUser(user);

    // Buscar el perfil en la colección 'users'
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      setUserProfile(userDoc.data() as User);
    } else {
      setUserProfile(null);
    }
  };

  const register = async (email: string, password: string, name: string, role: 'admin' | 'superadmin') => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    const userProfile: User = {
      id: user.uid,
      email,
      name,
      role,
      createdAt: new Date()
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
  };

  const logout = async () => {
    // If it's the default admin, just clear the state
    if (currentUser?.uid === 'default-admin-uid') {
      setCurrentUser(null);
      setUserProfile(null);
      return;
    }
    
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as User);
        } else {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};