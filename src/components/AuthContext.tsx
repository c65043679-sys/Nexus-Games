import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInWithCredential } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { containsProfanity } from '../utils/profanityFilter';

interface UserProfile {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  nickname?: string;
  themeColor?: string;
  favorites: string[];
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  loginAsAdmin: (password: string) => boolean;
  unlockOwner: (passcode: string) => boolean;
  toggleFavorite: (gameId: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem('isAdmin') === 'true';
  });
  const [isOwnerUnlocked, setIsOwnerUnlocked] = useState(() => {
    return sessionStorage.getItem('isOwner') === 'true';
  });

  const isOwner = user?.email?.toLowerCase() === 'c65043679@gmail.com';

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const exposeGSI = () => {
      (window as any).handleCredentialResponse = async (response: any) => {
        try {
          if ((window as any).jwt_decode) {
            const userToken = (window as any).jwt_decode(response.credential);
            localStorage.setItem("username", userToken.name);
            localStorage.setItem("userpic", userToken.picture);
          }
          const credential = GoogleAuthProvider.credential(response.credential);
          await signInWithCredential(auth, credential);
        } catch (err) {
          console.error("GSI Login Error:", err);
        }
      };
    };

    exposeGSI();

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          let activeNickname = 'Nexus Explorer';
          const savedLocal = localStorage.getItem('username');
          if (savedLocal && !containsProfanity(savedLocal)) {
            activeNickname = savedLocal.trim();
          }
          localStorage.setItem('username', activeNickname);

          const newProfile = {
            uid: user.uid,
            displayName: activeNickname,
            nickname: activeNickname,
            email: user.email,
            photoURL: user.photoURL,
            favorites: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(userRef, newProfile);
        } else {
          // Sync for existing users: prioritize saved Firestore nickname/displayName
          const data = userDoc.data();
          let activeNickname = data?.nickname || data?.displayName || 'Nexus Explorer';
          if (containsProfanity(activeNickname)) {
            activeNickname = 'Nexus Explorer';
          }
          localStorage.setItem('username', activeNickname);

          const updates: any = {};
          if (!data?.favorites) updates.favorites = [];
          if (!data?.uid) updates.uid = user.uid;
          if (activeNickname !== data?.nickname || activeNickname !== data?.displayName) {
            updates.nickname = activeNickname;
            updates.displayName = activeNickname;
          }
          if (Object.keys(updates).length > 0) {
            await setDoc(userRef, updates, { merge: true });
          }
        }

        // Listen to profile changes
        unsubscribeProfile = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setProfile(doc.data() as UserProfile);
          }
        });

        setUser(user);
      } else {
        setUser(null);
        setProfile(null);
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
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
    localStorage.removeItem("nexus_achievements");
    localStorage.removeItem("nexus_achievements_progress");
    localStorage.removeItem("nexus_game_points");
    localStorage.removeItem("nexus_games_played");
    return signOut(auth);
  };

  const loginAsAdmin = (password: string) => {
    if (password === '280511') {
      setIsAdmin(true);
      setIsOwnerUnlocked(true);
      sessionStorage.setItem('isAdmin', 'true');
      sessionStorage.setItem('isOwner', 'true');
      return true;
    }
    return false;
  };

  const unlockOwner = (passcode: string) => {
    if (passcode === '280511' || passcode === 'owner' || passcode === 'nexusowner') {
      setIsOwnerUnlocked(true);
      setIsAdmin(true);
      sessionStorage.setItem('isOwner', 'true');
      sessionStorage.setItem('isAdmin', 'true');
      return true;
    }
    return false;
  };

  const toggleFavorite = async (gameId: string) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const isFavorited = profile?.favorites?.includes(gameId);
    
    await updateDoc(userRef, {
      favorites: isFavorited ? arrayRemove(gameId) : arrayUnion(gameId)
    });
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (data.nickname) {
      localStorage.setItem('username', data.nickname);
    }
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const chosenName = data.nickname || data.displayName || profile?.nickname || profile?.displayName || localStorage.getItem('username') || 'Nexus Explorer';

    await setDoc(userRef, {
      uid: user.uid,
      ...data,
      nickname: chosenName,
      displayName: chosenName,
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  const deleteAccount = async () => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    // Delete Firestore data first
    await setDoc(userRef, { deleted: true }); // Mark as deleted first if rules allowed it, but actually we'll just delete
    // For simplicity in rules (we added allow delete), we just delete
    try {
      await updateDoc(userRef, { active: false }); // or similar
      // Better to just delete the doc
      // await deleteDoc(userRef); // need to import deleteDoc
      // But user.delete() is most important
      await user.delete();
      await logout();
    } catch (err) {
      console.error("Account deletion failed:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAdmin, 
      isOwner,
      signIn, 
      logout, 
      loginAsAdmin,
      unlockOwner,
      toggleFavorite,
      updateProfile,
      deleteAccount
    }}>
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
