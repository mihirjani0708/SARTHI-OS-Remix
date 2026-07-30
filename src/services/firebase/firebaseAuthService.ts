/**
 * firebaseAuthService.ts
 * Firebase Authentication service supporting Email/Password, Google Sign-In, and Phone Auth.
 * Prepared for clean integration without breaking existing session mechanisms.
 */
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../../config/firebase';

export class FirebaseAuthService {
  /** Sign in with Email and Password */
  public async loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
    const credential = await signInWithEmailAndPassword(auth, email, pass);
    return credential.user;
  }

  /** Register new account with Email and Password */
  public async registerWithEmail(email: string, pass: string): Promise<FirebaseUser> {
    const credential = await createUserWithEmailAndPassword(auth, email, pass);
    return credential.user;
  }

  /** Sign in with Google OAuth Popup */
  public async signInWithGoogle(): Promise<FirebaseUser> {
    const result = await signInWithPopup(auth, googleAuthProvider);
    return result.user;
  }

  /** Initiate Phone Number Auth verification */
  public async sendPhoneVerificationCode(
    phoneNumber: string,
    recaptchaContainerId: string
  ): Promise<ConfirmationResult> {
    const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
      size: 'invisible',
    });
    return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  }

  /** Sign out current Firebase session */
  public async logout(): Promise<void> {
    await firebaseSignOut(auth);
  }

  /** Subscribe to Firebase Auth state changes */
  public onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  /** Get currently active Firebase User */
  public getCurrentFirebaseUser(): FirebaseUser | null {
    return auth.currentUser;
  }
}

export const firebaseAuthService = new FirebaseAuthService();
