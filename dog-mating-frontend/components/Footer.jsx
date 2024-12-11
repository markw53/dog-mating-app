import { View, Text, StyleSheet } from 'react-native';

const Footer = ({ text, style, textStyle }) => {
  return (
    <View style={[styles.footer, style]}>
      <Text style={[styles.text, textStyle]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    paddingTop: 30,
    paddingBottom: 35,
    paddingHorizontal: 5,
    backgroundColor: '#CCD6D5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#24565C',
    fontSize: 14,
  },
});

export default Footer;