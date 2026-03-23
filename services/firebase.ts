import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDP-tNH9zolDbobLOGEsopOiHsNP6rqw9I",
  authDomain: "plant-it-2bb85.firebaseapp.com",
  projectId: "plant-it-2bb85",
  storageBucket: "plant-it-2bb85.firebasestorage.app",
  messagingSenderId: "571953829875",
  appId: "1:571953829875:web:08bf59dc04bc86f6aba486"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

export default app;