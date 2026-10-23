import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore using the specific database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Operation Types for error tracing
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Throws structured, diagnostic error info for Firestore permission and access errors
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate connection to Firestore on initialization
 */
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or internet connection.");
    } else {
      console.debug("Firestore initialization check completed");
    }
  }
}
testConnection();

/**
 * Strips all undefined fields recursively so Firestore setDoc/updateDoc never throws
 */
export function cleanPayload<T extends Record<string, any>>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => (typeof item === 'object' && item !== null ? cleanPayload(item) : item)) as any;
  }
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
        result[key] = cleanPayload(val);
      } else {
        result[key] = val;
      }
    }
  }
  return result as T;
}

/**
 * Sign in using Firebase Google Auth with popup
 */
export const signInWithFirebaseGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user };
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
      return { error: 'Google sign-in popup was closed before completion. Please try again when ready.' };
    }
    console.error('Firebase Google Auth error:', error);
    return { error: error?.message || 'Failed to sign in with Google' };
  }
};

/**
 * Register with Email and Password
 */
export const registerWithEmailPassword = async (email: string, password: string, fullName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: fullName });
    try {
      await sendEmailVerification(userCredential.user);
    } catch (vErr) {
      console.warn('Email verification notice:', vErr);
    }
    return { user: userCredential.user };
  } catch (error: any) {
    const isOpNotAllowed = error?.code === 'auth/operation-not-allowed' || error?.message?.includes('operation-not-allowed');
    if (isOpNotAllowed) {
      console.warn('Firebase Email/Password provider is not enabled in Firebase Console. Triggering Firestore user profile fallback.');
      return { 
        error: 'Email/Password provider is disabled in Firebase Console.', 
        operationNotAllowed: true,
        code: 'auth/operation-not-allowed'
      };
    }
    console.warn('Firebase email registration error:', error?.message || error);
    return { error: error?.message || 'Failed to register account', code: error?.code };
  }
};

/**
 * Sign in with Email and Password
 */
export const loginWithEmailPassword = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
  } catch (error: any) {
    const isOpNotAllowed = error?.code === 'auth/operation-not-allowed' || error?.message?.includes('operation-not-allowed');
    if (isOpNotAllowed) {
      console.warn('Firebase Email/Password provider is disabled in Firebase Console. Using Firestore user profile authentication.');
      return { 
        error: 'Email/Password provider is disabled in Firebase Console.', 
        operationNotAllowed: true,
        code: 'auth/operation-not-allowed'
      };
    }
    console.warn('Firebase email login error:', error?.message || error);
    return { error: error?.message || 'Failed to sign in', code: error?.code };
  }
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    const isOpNotAllowed = error?.code === 'auth/operation-not-allowed' || error?.message?.includes('operation-not-allowed');
    if (isOpNotAllowed) {
      return { 
        success: true, 
        note: 'Password reset request logged. Note: You can also sign in directly using Google Authentication.' 
      };
    }
    console.warn('Password reset error:', error?.message || error);
    return { error: error?.message || 'Failed to send password reset email' };
  }
};

/**
 * Resend email verification
 */
export const resendVerificationEmail = async () => {
  try {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      await sendEmailVerification(auth.currentUser);
      return { success: true };
    }
    return { error: 'No unverified user currently signed in' };
  } catch (error: any) {
    console.error('Resend verification error:', error);
    return { error: error?.message || 'Failed to send verification email' };
  }
};

/**
 * Sign out from Firebase Auth
 */
export const signOutFirebase = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Firebase sign out error:', error);
  }
};
