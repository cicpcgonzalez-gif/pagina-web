import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { login, verifyAccount, resendVerificationCode } from '../services/api';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [code, setCode] = useState('');

  const handleLogin = async () => {
    try {
      await login({ email, password });
      navigation.replace('RafflesScreen');
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message;
      if (msg.includes('verificar') || msg.includes('confirmar') || msg.includes('no verificada')) {
        setIsVerifying(true);
        Alert.alert('Cuenta no verificada', 'Por favor ingresa el código que enviamos a tu correo.');
      } else {
        Alert.alert('Error', msg);
      }
    }
  };

  const handleVerify = async () => {
    try {
      await verifyAccount(email, code);
      Alert.alert('Éxito', 'Cuenta verificada. Ahora puedes iniciar sesión.');
      setIsVerifying(false);
      setCode('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleResend = async () => {
    try {
      await resendVerificationCode(email);
      Alert.alert('Enviado', 'Se ha enviado un nuevo código a tu correo.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (isVerifying) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verificar Cuenta</Text>
        <Text style={styles.subtitle}>Ingresa el código enviado a {email}</Text>
        <TextInput
          style={styles.input}
          placeholder="Código de 6 dígitos"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
        />
        <Button title="Verificar" onPress={handleVerify} />
        <TouchableOpacity onPress={handleResend} style={styles.linkButton}>
          <Text style={styles.linkText}>Reenviar código</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsVerifying(false)} style={styles.linkButton}>
          <Text style={styles.linkText}>Volver al Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Entrar" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  subtitle: { fontSize: 14, marginBottom: 20, textAlign: 'center', color: '#666' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
  linkButton: { marginTop: 15, alignItems: 'center' },
  linkText: { color: 'blue' }
});
