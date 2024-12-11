import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Button,
  Image
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "../../AuthContext";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WEATHER_API_KEY } from "@env";

const Header = ({ title, style, textStyle }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [weather, setWeather] = useState(null);
  const { setUser } = useAuth();
  // const navigation = useNavigation();

  const WEATHER_CACHE_KEY = "weather_data";
  const WEATHER_CACHE_EXPIRY_KEY = "weather_cache_expiry";

  const fetchWeather = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permission to access location was denied");
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const API_KEY = WEATHER_API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
      const response = await axios.get(url);

      const weatherData = {
        temp: response.data.main.temp,
        icon: `http://openweathermap.org/img/wn/${response.data.weather[0].icon}.png`,
        description: response.data.weather[0].description,
        timestamp: Date.now()
      };

      await AsyncStorage.setItem(
        WEATHER_CACHE_KEY,
        JSON.stringify(weatherData)
      );
      await AsyncStorage.setItem(
        WEATHER_CACHE_EXPIRY_KEY,
        Date.now().toString()
      );

      setWeather(weatherData);
    } catch (error) {
      console.error("Weather error: ", error);
    }
  };

  const getCachedWeather = async () => {
    try {
      const cachedWeather = await AsyncStorage.getItem(WEATHER_CACHE_KEY);
      const cacheExpiry = await AsyncStorage.getItem(WEATHER_CACHE_EXPIRY_KEY);

      if (cachedWeather && cacheExpiry) {
        const parsedWeather = JSON.parse(cachedWeather);
        const parsedExpiry = parseInt(cacheExpiry, 10);
        const currentTime = Date.now();

        if (currentTime - parsedExpiry < 10 * 60 * 1000) {
          setWeather(parsedWeather);
        } else {
          fetchWeather();
        }
      } else {
        fetchWeather();
      }
    } catch (error) {
      console.error("Error fetching cached weather:", error);
      fetchWeather();
    }
  };

  useEffect(() => {
    getCachedWeather();
  }, []);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        console.log("User logged out");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <View style={[styles.header, style]}>
      <Text style={[styles.title, textStyle]}>{title}</Text>

      {/* Weather display */}
      {weather ? (
        <View style={styles.weatherContainer}>
          <Image source={{ uri: weather.icon }} style={styles.weatherIcon} />
          <Text style={styles.tempText}>{weather.temp}°C</Text>
        </View>
      ) : (
        <Text style={styles.loadingText}>Loading weather...</Text>
      )}

      <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
        <Ionicons name="menu" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleMenu}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.menu}>
            <Button title="Logout" onPress={handleLogout} />
            <Button title="Close" onPress={toggleMenu} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: "100%",
    marginTop: 0,
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: "#24565C",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row"
  },
  title: {
    color: "#FFFFFF",
    fontSize: 35,
    fontWeight: "bold",
    fontFamily: "DancingScript-Bold",
  },
  weatherContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  weatherIcon: {
    width: 30,
    height: 30,
    marginRight: 10
  },
  tempText: {
    color: "#fff",
    fontSize: 16
  },
  loadingText: {
    color: "#fff",
    fontSize: 16
  },
  menuButton: {
    padding: 10
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  menu: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    width: 250
  }
});

export default Header;
