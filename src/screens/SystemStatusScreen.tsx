import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { checkApi } from '../services/api';

export default function SystemStatusScreen() {
  const [status, setStatus] = useState<any>(null);

  const fetchStatus = async () => {
    try {
      const data = await checkApi();
      setStatus(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <View>
      <Text>Estado del sistema</Text>
      <Button title="Actualizar" onPress={fetchStatus} />
      <Text>Health: {status?.health ? JSON.stringify(status.health) : '...'}</Text>
    </View>
  );
}
