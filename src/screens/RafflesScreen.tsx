import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, FlatList, TextInput, StyleSheet } from 'react-native';
import { listRaffles, createRaffle } from '../services/api';

export default function RafflesScreen() {
  const [raffles, setRaffles] = useState<any[]>([]);
  const [newRaffleName, setNewRaffleName] = useState('');
  const [newRaffleDescription, setNewRaffleDescription] = useState('');

  const fetchRaffles = async () => {
    try {
      const data = await listRaffles();
      setRaffles(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCreate = async () => {
    try {
      await createRaffle({ title: newRaffleName, description: newRaffleDescription });
      setNewRaffleName('');
      fetchRaffles();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    fetchRaffles();
  }, []);

  return (
    <View>
      <Text>Rifas</Text>
      <FlatList
        data={raffles}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => <Text>{item.name || item.title}</Text>}
      />
      <TextInput
        placeholder="Nombre de la rifa"
        value={newRaffleName}
        onChangeText={setNewRaffleName}
        style={styles.input}
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción de la rifa"
        value={newRaffleDescription}
        onChangeText={setNewRaffleDescription}
      />
      <Button title="Crear rifa" onPress={handleCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 6
  }
});
