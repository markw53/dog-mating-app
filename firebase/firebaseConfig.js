import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDK-zsIdQxhyINpuA4Ib60zSnlyVQOQl0s",
  authDomain: "dog-mating-app-33e2d.firebaseapp.com",
  projectId: "dog-mating-app-33e2d",
  storageBucket: "dog-mating-app-33e2d.firebasestorage.app",
  messagingSenderId: "28611880357",
  appId: "1:28611880357:web:1a4889f3a759d7e0d1744c",
  measurementId: "G-2SBHDFLE44"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, db, auth, storage, analytics };
