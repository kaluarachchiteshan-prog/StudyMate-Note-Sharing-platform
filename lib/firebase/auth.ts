import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  UserCredential
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './config';
import { INITIAL_USER } from '../mockData';
import { UserProfile } from '@/types';

export async function loginWithEmail(email: string, pass: string) {
  if (isFirebaseConfigured && auth) {
    return await signInWithEmailAndPassword(auth, email, pass);
  }
  // Mock login fallback
  return {
    user: {
      uid: INITIAL_USER.uid,
      email: email || INITIAL_USER.email,
      displayName: INITIAL_USER.displayName,
      photoURL: INITIAL_USER.photoURL,
    }
  };
}

export async function signUpWithEmail(email: string, pass: string, name: string) {
  if (isFirebaseConfigured && auth) {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    return cred;
  }
  // Mock signup fallback
  return {
    user: {
      uid: `user_${Date.now()}`,
      email,
      displayName: name || 'Nimal Perera',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    }
  };
}

export async function loginWithGoogle() {
  if (isFirebaseConfigured && auth && googleProvider) {
    return await signInWithPopup(auth, googleProvider);
  }
  // Mock Google Login fallback
  return {
    user: {
      uid: 'user_google_mock',
      email: 'scholar.google@uom.lk',
      displayName: 'Nimal Perera (Google User)',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    }
  };
}

export async function logoutUser() {
  if (isFirebaseConfigured && auth) {
    await firebaseSignOut(auth);
  }
  return true;
}
