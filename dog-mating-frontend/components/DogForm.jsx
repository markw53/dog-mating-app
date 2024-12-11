// DogForm.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { db } from '../firebaseConfig.js';  // Ensure this is the correct path
import { collection, addDoc } from 'firebase/firestore';

const DogForm = () => {
    const [dog, setDog] = useState({
        name: '',
        breed: '',
        colour: '',
        dateOfBirth: '',
        dnaResults: '',
        eyeTests: '',
        hipScores: { left: '', right: '', total: '' },
        elbowScores: { left: '', right: '', total: '' },
        inbreedingCoefficient: '',
        estimatedBreedingValues: { hip: '', elbow: '' },
    });

    const handleSubmit = async () => {
        try {
            const dogsRef = collection(db, 'dogs');
            await addDoc(dogsRef, dog);
            alert('Dog added successfully!');
        } catch (error) {
            console.error('Error adding dog: ', error);
            alert('Error adding dog');
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Name"
                value={dog.name}
                onChangeText={(text) => setDog({ ...dog, name: text })}
            />
            {/* Add other input fields for breed, colour, etc. */}
            <Button title="Submit" onPress={handleSubmit} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
});

export default DogForm;
