import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, FlatList, TextInput } from 'react-native';
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
      setNewName('');
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
        keyExtractor={item => item.id}
        renderItem={({ item }) => <Text>{item.name}</Text>}
      />
      <TextInput
        placeholder="Nombre de la rifa"
        value={newRaffleName}
        onChangeText={setNewRaffleName}
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
