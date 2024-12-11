import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import DefaultImage from "../assets/placeholder.png"

const Card = ({ title, content, style, onPress, time, image, date, votes }) => {
  const [imageUri, setImageUri] = useState(image);
  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, style]}>
      {image && (
        <Image
          source={imageUri ? { uri: imageUri } : DefaultImage}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageUri(null)}
        />
      )}
      {title && <Text style={styles.title}>{title}</Text>}
      {time && <Text style={styles.time}>{time}</Text>}
      {date && <Text style={styles.time}>{date}</Text>}
      {votes && <Text style={styles.content}>Votes: {votes}</Text>}
      {content && <Text style={styles.content}>{content}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 8,
  },
  image: {
    width: "100%", 
    height: 150,   
    borderRadius: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  content: {
    fontSize: 14
  },
  time: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: "right",
  }
});

export default Card;
