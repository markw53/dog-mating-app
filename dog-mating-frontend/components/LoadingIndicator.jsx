import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";

const LoadingIndicator = ({ title, size = "large", style, textStyle}) => {
  return (
    <View style={[styles.center, style]}>
      <ActivityIndicator size={size} color="#24565C" />
      <Text style={textStyle}>Loading {title}...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoadingIndicator;
