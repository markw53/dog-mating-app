import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";  // Firebase configuration
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);  // To hold the current user info
  const [loading, setLoading] = useState(true);  // To handle loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Assuming you have an endpoint to fetch user data by email
        axios
          .get(`https://[project-id].firebaseio.com/api/users/email/${currentUser.email}`)
          .then((response) => {
            const userId = response.data.userId;  // Adjust as needed
            setUser({
              email: currentUser.email,
              uid: currentUser.uid,
              userId,  // Store user ID for later use
            });
          })
          .catch((error) => {
            console.error("Error fetching user ID:", error);
            setUser({
              email: currentUser.email,
              uid: currentUser.uid,
              userId: null,  // Default userId if not found
            });
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        // If no user is logged in, reset the user state
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();  // Clean up the listener on component unmount
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);  // Custom hook to access authentication context
}
