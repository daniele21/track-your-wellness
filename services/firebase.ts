import * as firebaseNs from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// The UMD compat build, when imported as a module, can place the
// firebase namespace on the .default property. We detect and use the
// correct object.
const firebase = (firebaseNs as any).default ?? firebaseNs;


const firebaseConfig = {
  apiKey: "AIzaSyDr0QGQcRAKFD0XATTNxCgtt2qzccvyEUQ",
  authDomain: "track-your-habits-1218.firebaseapp.com",
  projectId: "track-your-habits-1218",
  storageBucket: "track-your-habits-1218.firebasestorage.app",
  messagingSenderId: "546400421470",
  appId: "1:546400421470:web:5ab3b9e5039ea084e796cf"
};

// Initialize Firebase, preventing re-initialization
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}


// Use v8 compat API for both Firestore and Authentication.
export const db = firebase.firestore();
export const auth = firebase.auth();
export { firebase };
