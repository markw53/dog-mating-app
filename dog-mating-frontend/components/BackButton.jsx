import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const BackButton = ({ title, style, onPress, textStyle }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, style]}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  text: {
    color: "#24565C",
    fontSize: 16,
  },
});

export default BackButton;
