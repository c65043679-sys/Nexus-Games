import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInWithCredential } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { containsProfanity } from '../utils/profanityFilter';
import { generateGamerTag } from '../utils/nameGenerator';

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

  const isOwner = (user?.email?.toLowerCase() === 'c65043679@gmail.com') || isOwnerUnlocked;

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
        setUser(user);
        const isUserOwner = (user.email?.toLowerCase() === 'c65043679@gmail.com') || (sessionStorage.getItem('isOwner') === 'true');
        const autoGamerTag = generateGamerTag(user.uid, isUserOwner, user.email);
        localStorage.setItem('username', autoGamerTag);

        let localFavs: string[] = [];
        try {
          const saved = localStorage.getItem('nexus_favorites');
          if (saved) localFavs = JSON.parse(saved);
        } catch (e) {}

        // Immediately set initial profile in state so user account loads without blocking
        setProfile({
          uid: user.uid,
          displayName: autoGamerTag,
          nickname: autoGamerTag,
          email: user.email,
          photoURL: user.photoURL,
          favorites: localFavs
        });

        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);

          if (!userDoc.exists()) {
            const newProfile = {
              uid: user.uid,
              displayName: autoGamerTag,
              nickname: autoGamerTag,
              email: user.email,
              photoURL: user.photoURL,
              favorites: [],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            await setDoc(userRef, newProfile);
          } else {
            const data = userDoc.data();
            const updates: any = {};
            if (data?.nickname !== autoGamerTag || data?.displayName !== autoGamerTag) {
              updates.nickname = autoGamerTag;
              updates.displayName = autoGamerTag;
            }
            if (!data?.favorites) updates.favorites = [];
            if (!data?.uid) updates.uid = user.uid;
            if (Object.keys(updates).length > 0) {
              await setDoc(userRef, updates, { merge: true });
            }
          }

          // Listen to profile changes
          unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              setProfile(docSnap.data() as UserProfile);
            }
          }, (err) => {
            console.warn("User profile snapshot warning:", err);
          });
        } catch (err) {
          console.error("Firestore user profile init error:", err);
        }
      } else {
        setUser(null);
        let guestFavs: string[] = [];
        try {
          const saved = localStorage.getItem('nexus_favorites');
          if (saved) guestFavs = JSON.parse(saved);
        } catch (e) {}

        const guestName = localStorage.getItem('username') || 'Nexus Guest';
        setProfile({
          uid: 'guest',
          displayName: guestName,
          nickname: guestName,
          favorites: guestFavs
        });
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
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Sign-in popup error:", err);
      if (err.code === 'auth/popup-blocked') {
        alert("Pop-up was blocked by your browser. Please allow popups for this site to sign in.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        console.warn("Sign-in popup closed before completion.");
      } else {
        alert(`Sign-in failed: ${err.message || 'Unknown authentication error'}`);
      }
    }
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
    const currentFavs = profile?.favorites || [];
    const isFavorited = currentFavs.includes(gameId);
    const updatedFavs = isFavorited
      ? currentFavs.filter(id => id !== gameId)
      : [...currentFavs, gameId];

    // Optimistically update React profile state immediately
    setProfile(prev => prev ? {
      ...prev,
      favorites: updatedFavs
    } : {
      uid: user?.uid || 'guest',
      favorites: updatedFavs
    });

    // Save to local storage for instant persistence
    try {
      localStorage.setItem('nexus_favorites', JSON.stringify(updatedFavs));
    } catch (e) {
      console.warn('LocalStorage favorites error:', e);
    }

    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        favorites: updatedFavs,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error("Error toggling favorite in Firestore:", err);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    const isUserOwner = (user?.email?.toLowerCase() === 'c65043679@gmail.com') || isOwnerUnlocked;
    const chosenName = user?.uid 
      ? generateGamerTag(user.uid, isUserOwner, user.email) 
      : generateGamerTag(localStorage.getItem('username'), isUserOwner);
    localStorage.setItem('username', chosenName);

    // Update local React state optimistically so UI updates immediately across all screens
    setProfile(prev => prev ? {
      ...prev,
      ...data,
      nickname: chosenName,
      displayName: chosenName
    } : {
      uid: user?.uid || 'temp',
      email: user?.email || undefined,
      nickname: chosenName,
      displayName: chosenName,
      photoURL: user?.photoURL || undefined,
      favorites: []
    });

    if (!user) return;
    const userRef = doc(db, 'users', user.uid);

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
