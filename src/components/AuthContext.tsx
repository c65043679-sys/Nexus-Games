import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInWithCredential } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  loginAsAdmin: (password: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem('isAdmin') === 'true';
  });

  useEffect(() => {
    // Expose handleCredentialResponse to window for GSI callback
    (window as any).handleCredentialResponse = async (response: any) => {
      try {
        // Decode the secret token Google sends back (as requested by user)
        if ((window as any).jwt_decode) {
          const userToken = (window as any).jwt_decode(response.credential);
          console.log("GSI User decoded:", userToken);
          
          // Save their name in the browser as requested
          localStorage.setItem("username", userToken.name);
          localStorage.setItem("userpic", userToken.picture);
        }

        const credential = GoogleAuthProvider.credential(response.credential);
        await signInWithCredential(auth, credential);
      } catch (err) {
        console.error("GSI Login Error:", err);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Sync user profile to Firestore
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            displayName: user.displayName || 'Nexus Explorer',
            email: user.email,
            photoURL: user.photoURL,
            createdAt: serverTimestamp(),
          });
        }
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('isAdmin');
    localStorage.removeItem("username");
    localStorage.removeItem("userpic");
    return signOut(auth);
  };

  const loginAsAdmin = (password: string) => {
    if (password === '280511') {
      setIsAdmin(true);
      sessionStorage.setItem('isAdmin', 'true');
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signIn, logout, loginAsAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
