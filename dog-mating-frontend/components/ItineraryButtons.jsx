import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const ItineraryButton = ({ title, onPress, style, textStyle, isActive=true }) => {
  const buttonStyleCondition = isActive ? [styles.button, styles.activeButton, style] : [styles.button, styles.inactiveButton, style]

  const textStyleCondition = isActive ? [styles.text, styles.activeText, textStyle] : [styles.text, styles.inactiveText, textStyle]
  return (
    <TouchableOpacity onPress={onPress} style={buttonStyleCondition}>
      <Text style={textStyleCondition}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#24565C",
  },
  inactiveButton: {
    backgroundColor: "#CCD6D4",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
  activeText: {
    color: "white",
  },
  inactiveText: {
    color: "#24565C",
  },
});

export default ItineraryButton;