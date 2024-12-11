import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuth } from "./AuthContext";
import { LogBox } from 'react-native';

import LoginScreen from "./screens/LoginScreen";
