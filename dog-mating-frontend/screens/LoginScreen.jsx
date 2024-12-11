import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from "react-native";
import RoundedButton from "../components/Button";
import Footer from "../components/Footer";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth } from "../../dog-mating-backend/firebaseConfig";
import { useAuth } from "../AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLogIn, setIsLogIn] = useState(false);
  const [isGuestLogIn, setIsGuestLogIn] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    const retrieveUserSession = async () => {
      try {
        const user = await AsyncStorage.getItem("user");
        if (user) {
          console.log("Retrieved user session:", JSON.parse(user));
          // Optionally navigate the user to the app's home screen
          navigation.navigate("Home");
        }
      } catch (error) {
        console.error("Error retrieving user session", error);
      }
    };
  
    retrieveUserSession();
  }, []);
 
  const handleLogin = () => {
    setIsLogIn(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Logged in successfully");
        const user = userCredential.user;
        saveUserSession(user); // Save user session
        setIsLogIn(false);
      })
      .catch((err) => {
        setIsLogIn(false);
        setError(err.message);
      });
  };

  const handleGuestLogin = () => {
    const guestEmail = "guest@dog-mating-app.com";
    const guestPassword = "guest123";
    setIsGuestLogIn(true);

    signInWithEmailAndPassword(auth, guestEmail, guestPassword)
    .then((userCredential) => {
      console.log("Guest logged in successfully");
      const user = userCredential.user;
      saveUserSession(user); // Save guest session
      setIsGuestLogIn(false);
    })
    .catch((err) => {
      setIsGuestLogIn(false);
      setError(err.message);
    });
  };

  const handleForgetPassword = () => {
    if (!email) {
      Alert.alert(
        "Forgot Password",
        "Please enter your email address to reset your password."
      );
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert(
          "Password Reset",
          "A password reset email has been sent to your email address."
        );
      })
      .catch((err) => {
        Alert.alert("Error", err.message);
      });
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;

      console.log("Google Login Successful");
      console.log("User Details:", user);
    } catch (err) {
      setError(err.message);
      console.error("Google Login Error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.appName}>Dog Mate</Text>
        <Text style={styles.tagline}>Find the Perfect Match for Your Dog</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholderTextColor="#888"
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#888"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity onPress={handleForgetPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <RoundedButton
          title={isLogIn ? "Logging in..." : "Log In"}
          onPress={handleLogin}
          style={styles.loginButton}
          textStyle={styles.buttonText}
        />

        <RoundedButton
          title="Login with Google"
          onPress={handleGoogleLogin}
          style={styles.googleButton}
          textStyle={styles.buttonText}
        />

        <View style={styles.linkRowContainer}>
          <TouchableOpacity onPress={handleGuestLogin} style={styles.guestLink}>
            <Text style={styles.guestText}>
              {isGuestLogIn ? "Signing In..." : "Sign in as Guest"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("SignUp")}
            style={styles.signupLink}
          >
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Footer text="© 2024 Dog Mate App" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7"
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20
  },
  forgotPasswordText: {
    marginTop: 10,
    fontSize: 14,
    color: "#4A90E2",
    textDecorationLine: "underline",
    textAlign: "right"
  },
  appName: {
    fontSize: 60,
    fontFamily: "DancingScript-Bold",
    fontWeight: "bold",
    color: "#24565C",
    textAlign: "center",
    marginVertical: 20
  },
  tagline: {
    fontSize: 24,
    fontFamily: "DancingScript-Bold",
    color: "#24565C",
    textAlign: "center",
    marginBottom: 30
  },
  inputContainer: {
    marginVertical: 30
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
    fontSize: 16
  },
  loginButton: {
    backgroundColor: "#24565C",
    borderRadius: 10,
    marginVertical: 10,
    paddingVertical: 10
  },
  googleButton: {
    backgroundColor: "#DB4437",
    borderRadius: 10,
    marginVertical: 10,
    paddingVertical: 10
  },
  signupButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 10,
    marginVertical: 10,
    paddingVertical: 10
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FFF"
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    paddingHorizontal: 10
  },
  linkRowContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 10
  },
  guestLink: {
    marginRight: 20
  },
  signupLink: {
    alignItems: "flex-end"
  },
  guestText: {
    color: "#24565C",
    fontSize: 14,
    textDecorationLine: "underline"
  },
  signupText: {
    color: "#4A90E2",
    fontSize: 14,
    textDecorationLine: "underline"
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center"
  }
});
