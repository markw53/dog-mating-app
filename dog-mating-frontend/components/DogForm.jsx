// DogForm.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { db } from '../firebaseConfig';
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
        const dogsRef = collection(db, 'dogs');
        await addDoc(dogsRef, dog);
        alert('Dog added successfully!');
    };

    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Name"
                value={dog.name}
                onChangeText={(text) => setDog({ ...dog, name: text })}
            />
            {/* Other input fields */}
            <Button title="Submit" onPress={handleSubmit} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
});

export default DogForm;
