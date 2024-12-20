import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "react-native-async-storage/async-storage";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

if (!AsyncStorage) {
  console.warn("AsyncStorage is not available in this environment. Using fallback.");
  AsyncStorage = require("redux-persist").createWebStorage("local");
}

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
const auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage), });

export { auth, db, storage };
