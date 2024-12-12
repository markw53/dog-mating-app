import "react-native-gesture-handler"; // Required for React Navigation
import "react-native-get-random-values"; // Required for UUID or random values
import "react-native-reanimated"; // Required for animations
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/LoginScreen"; // Adjust the path to your LoginScreen
// import HomeScreen from "./screens/HomeScreen"; // Adjust to your HomeScreen or placeholder

const Stack = createStackNavigator();

export default function MainApp() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "Home", // Header title
            headerStyle: { backgroundColor: "#2C7A7B" }, // Header style
            headerTintColor: "#FFF", // Header text color
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
