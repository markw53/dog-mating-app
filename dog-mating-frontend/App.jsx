import "react-native-get-random-values";
import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { AuthProvider } from "./AuthContext";
import MainApp from "./MainApp";
import * as Font from "expo-font";

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      await Font.loadAsync({
      "DancingScript-Bold": require("./assets/fonts/DancingScript-Bold.ttf"),
    });
    setFontsLoaded(true);
    })();
  }, []);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
