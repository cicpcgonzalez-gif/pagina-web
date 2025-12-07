import 'react-native-gesture-handler';
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Animated,
  Modal
} from 'react-native';
import { LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { API_URL } from './config';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const palette = {
  primary: '#7c3aed',
  secondary: '#d97706',
  accent: '#22d3ee',
  text: '#e2e8f0',
  subtext: '#cbd5e1',
  muted: '#94a3b8',
  border: 'rgba(255,255,255,0.12)',
  background: '#0b1224',
  surface: 'rgba(255,255,255,0.06)'
};

const APP_NAME = 'MegaRifas';
const APP_TAGLINE = 'Rifas premium con confianza.';

const MOTIVATION_LINES = [
  'Afinando tus sorteos en segundos...',
  'Generando buena suerte y buen diseño...',
  'Sincronizando rifas premium...',
  'Cargando beneficios VIP y promos...',
  'Listando premios para el siguiente ganador...',
  'Preparando una experiencia impecable...'
];

const SECURE_KEYS = {
  access: 'mr_accessToken',
  refresh: 'mr_refreshToken'
};

const getProjectId = () => Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId || null;
const formatTicketNumber = (value) => String(value ?? '').padStart(5, '0');

const setSecureItem = async (key, value) => {
  if (!value) return SecureStore.deleteItemAsync(key);
  return SecureStore.setItemAsync(key, value);
};

const getSecureItem = (key) => SecureStore.getItemAsync(key);
const deleteSecureItem = (key) => SecureStore.deleteItemAsync(key);

function FilledButton({ title, onPress, disabled, loading, icon }) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.button, { opacity: isDisabled ? 0.7 : 1 }]}
      activeOpacity={0.85}
    >
      {loading ? <ActivityIndicator color="#fff" style={{ marginRight: 8 }} /> : icon ? <View style={{ marginRight: 8 }}>{icon}</View> : null}
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

function OutlineButton({ title, onPress, disabled, icon }) {
  const isDisabled = disabled;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.button, styles.secondaryButton, { opacity: isDisabled ? 0.7 : 1 }]}
      activeOpacity={0.85}
    >
      {icon ? <View style={{ marginRight: 8 }}>{icon}</View> : null}
      <Text style={styles.secondaryText}>{title}</Text>
    </TouchableOpacity>
  );
}

// Minimal API helper with token support and auto-refresh
function useApi(accessToken, refreshToken, persistTokens) {
  const call = useCallback(
    async (path, options = {}) => {
      const headers = {
        Accept: 'application/json',
        ...(options.headers || {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
      };

      // Set JSON content type when sending a body and none provided
      const hasBody = options.body !== undefined;
      if (hasBody && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

      const res = await fetch(`${API_URL}${path}`, { ...options, headers });
      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        data = null;
      }

      // Attempt silent refresh on 401 once
      if (res.status === 401 && refreshToken) {
        try {
          const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          });
          const refreshData = await refreshRes.json();
          if (refreshRes.ok && refreshData.accessToken) {
            await persistTokens(refreshData.accessToken, refreshData.refreshToken || refreshToken, refreshData.user);
            return call(path, options);
          }
        } catch (err) {
          // swallow and return original response
        }
      }

      return { res, data };
    },
    [accessToken, refreshToken, persistTokens]
  );

  return call;
}

const HeroBanner = () => (
  <View style={{ padding: 20, paddingTop: 28, backgroundColor: palette.background, borderBottomWidth: 1, borderBottomColor: palette.border }}>
    <Text style={{ fontSize: 28, fontWeight: '800', color: palette.text }}>{APP_NAME}</Text>
    <Text style={{ fontSize: 16, color: palette.muted, marginTop: 4 }}>{APP_TAGLINE}</Text>
  </View>
);

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [twofaNeeded, setTwofaNeeded] = useState(false);
  const [twofaUserId, setTwofaUserId] = useState(null);
  const [twofaCode, setTwofaCode] = useState('');
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const heroAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    address: '',
    dob: '',
    cedula: '',
    phone: ''
  });
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    Animated.timing(heroAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true
    }).start();
  }, [heroAnim]);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || 'No se pudo iniciar sesión';
        const lower = String(msg).toLowerCase();
        if (res.status === 401 && (lower.includes('verific') || lower.includes('confirmar tu cuenta'))) {
          setShowVerification(true);
          setVerifyEmail(form.email);
          setVerifyMessage('');
          Alert.alert('Verifica tu cuenta', msg);
          setLoading(false);
          return;
        }
        throw new Error(msg);
      }
      if (data.require2fa) {
        setTwofaNeeded(true);
        setTwofaUserId(data.userId);
        Alert.alert('Código enviado', data.message || 'Revisa tu correo.');
      } else {
            await onAuth(data.accessToken, data.refreshToken, data.user, rememberMe);
        if (data.securityCode) Alert.alert('Código de seguridad', String(data.securityCode));
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo registrar');
      Alert.alert('Verifica tu correo', data.message || 'Revisa tu bandeja para activar la cuenta.');
      setShowVerification(true);
      setVerifyEmail(form.email);
      setVerifyMessage('');
      setMode('login');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    if (!verifyEmail || !verifyCode) {
      setError('Ingresa tu email y el código.');
      return;
    }
    setVerifyLoading(true);
    setError('');
    setVerifyMessage('');
    try {
      const res = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyEmail, code: verifyCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Código incorrecto');
      setVerifyMessage(data.message || 'Cuenta verificada. Inicia sesión.');
      Alert.alert('Cuenta verificada', 'Ahora puedes iniciar sesión.');
      setShowVerification(false);
      setMode('login');
    } catch (err) {
      setError(err.message);
    }
    setVerifyLoading(false);
  };

  const handleResend = async () => {
    if (!verifyEmail) {
      setError('Ingresa tu email para reenviar el código.');
      return;
    }
    setResendLoading(true);
    setError('');
    setVerifyMessage('');
    try {
      const res = await fetch(`${API_URL}/auth/verify/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo reenviar');
      setVerifyMessage(data.message || 'Código reenviado. Revisa tu correo.');
    } catch (err) {
      setError(err.message);
    }
    setResendLoading(false);
  };

  const handleRecovery = async () => {
    if (!recoveryEmail) {
      setError('Ingresa tu correo para recuperarlo.');
      return;
    }
    setRecoveryLoading(true);
    setError('');
    setRecoveryMessage('');
    try {
      const res = await fetch(`${API_URL}/auth/password/reset/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar la recuperación');
      setRecoveryMessage(data.message || 'Hemos enviado instrucciones a tu correo.');
    } catch (err) {
      setError(err.message);
    }
    setRecoveryLoading(false);
  };

  const verify2fa = async () => {
    if (!twofaUserId || !twofaCode) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/2fa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: twofaUserId, code: twofaCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Código incorrecto');
          await onAuth(data.accessToken, data.refreshToken, data.user, rememberMe);
      if (data.securityCode) Alert.alert('Código de seguridad', String(data.securityCode));
      setTwofaNeeded(false);
      setTwofaCode('');
      setTwofaUserId(null);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const submit = () => {
    if (twofaNeeded) return verify2fa();
    if (mode === 'login') return handleLogin();
    return handleRegister();
  };

  const pressIn = () => Animated.spring(buttonScale, { toValue: 0.97, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();

  const renderVerification = () => (
    <SafeAreaView style={[styles.container, { backgroundColor: '#0b1224' }]}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=60' }}
        style={{ flex: 1 }}
        blurRadius={12}
      >
        <View style={styles.overlay} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={[styles.scroll, { justifyContent: 'center' }]}>            
            <Animated.View style={{ opacity: heroAnim, transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
              <Text style={styles.heroTitle}>MegaRifas</Text>
              <Text style={styles.heroTagline}>Tu suerte comienza aquí. ¡Cree, participa y gana!</Text>
            </Animated.View>
            <View style={[styles.card, styles.glassCard]}>
              <TextInput
                style={[styles.input, styles.inputSoft]}
                placeholder="Email"
                autoCapitalize="none"
                autoComplete="off"
                textContentType="none"
                value={verifyEmail}
                onChangeText={setVerifyEmail}
                placeholderTextColor="#cbd5e1"
              />
              <TextInput
                style={[styles.input, styles.inputSoft]}
                placeholder="Código de 6 dígitos"
                keyboardType="numeric"
                value={verifyCode}
                onChangeText={setVerifyCode}
                placeholderTextColor="#cbd5e1"
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              {verifyMessage ? <Text style={styles.successText}>{verifyMessage}</Text> : null}
              <FilledButton
                title={verifyLoading ? 'Verificando...' : 'Confirmar cuenta'}
                onPress={handleVerify}
                disabled={verifyLoading}
                icon={<Ionicons name="shield-checkmark-outline" size={18} color="#fff" />}
              />
              <OutlineButton
                title={resendLoading ? 'Reenviando...' : 'Reenviar código'}
                onPress={handleResend}
                disabled={resendLoading}
                icon={<Ionicons name="mail-outline" size={18} color={palette.primary} />}
              />
              <TouchableOpacity
                onPress={() => {
                  setShowVerification(false);
                  setError('');
                  setVerifyMessage('');
                }}
                style={{ marginTop: 8, alignItems: 'center' }}
              >
                <Text style={styles.link}>Volver a iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );

  const renderLogin = () => (
    <SafeAreaView style={[styles.container, { backgroundColor: '#0b1224' }]}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1496317899792-9d7dbcd928a1?auto=format&fit=crop&w=1600&q=80' }}
        style={{ flex: 1 }}
        blurRadius={7}
      >
        <View style={styles.overlay} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={[styles.scroll, { justifyContent: 'center', minHeight: '100%' }]}>            
            <Animated.View style={{ opacity: heroAnim, transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }}>
              <Text style={styles.heroTitle}>MegaRifas</Text>
              <Text style={styles.heroTagline}>Tu suerte comienza aquí. ¡Cree, participa y gana!</Text>
            </Animated.View>

            {mode === 'login' ? (
              <View style={[styles.card, styles.glassCard]}>
                <TextInput
                  style={[styles.input, styles.inputSoft]}
                  placeholder="Correo electrónico"
                  autoCapitalize="none"
                  autoComplete="off"
                  textContentType="emailAddress"
                  value={form.email}
                  onChangeText={(v) => handleChange('email', v)}
                  placeholderTextColor="#cbd5e1"
                />
                <TextInput
                  style={[styles.input, styles.inputSoft]}
                  placeholder="Contraseña"
                  secureTextEntry
                  autoComplete="off"
                  textContentType="password"
                  value={form.password}
                  onChangeText={(v) => handleChange('password', v)}
                  placeholderTextColor="#cbd5e1"
                />

                {twofaNeeded ? (
                  <View style={{ marginTop: 4 }}>
                    <TextInput placeholder="Código de 6 dígitos" value={twofaCode} onChangeText={setTwofaCode} style={[styles.input, styles.inputSoft]} keyboardType="numeric" />
                  </View>
                ) : null}

                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                {recoveryMessage ? <Text style={styles.successText}>{recoveryMessage}</Text> : null}

                <TouchableOpacity
                  style={styles.rememberRow}
                  onPress={() => setRememberMe((v) => !v)}
                >
                  <Ionicons name={rememberMe ? 'checkbox' : 'square-outline'} size={18} color="#e2e8f0" />
                  <Text style={styles.rememberText}>Mantener la cuenta abierta</Text>
                </TouchableOpacity>

                <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={submit}
                    onPressIn={pressIn}
                    onPressOut={pressOut}
                    style={styles.primaryButton}
                    disabled={loading}
                  >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{twofaNeeded ? 'Verificar código' : 'Entrar'}</Text>}
                  </TouchableOpacity>
                </Animated.View>

                {!twofaNeeded ? (
                  <TouchableOpacity style={[styles.linkItem, { marginTop: 12 }]} onPress={() => setShowRecovery(true)}>
                    <Ionicons name="help-circle-outline" size={16} color="#e2e8f0" />
                    <Text style={styles.link}>¿Olvidaste tu usuario o contraseña?</Text>
                  </TouchableOpacity>
                ) : null}

                <View style={styles.linksRow}>
                  <TouchableOpacity onPress={() => setMode('register')} style={styles.linkItem}>
                    <Ionicons name="person-add-outline" size={16} color="#e2e8f0" />
                    <Text style={styles.link}>Crear cuenta</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={[styles.card, styles.glassCard]}>
                <TextInput
                  style={[styles.input, styles.inputSoft]}
                  placeholder="Correo electrónico"
                  autoCapitalize="none"
                  autoComplete="off"
                  textContentType="emailAddress"
                  value={form.email}
                  onChangeText={(v) => handleChange('email', v)}
                  placeholderTextColor="#cbd5e1"
                />
                <TextInput
                  style={[styles.input, styles.inputSoft]}
                  placeholder="Contraseña"
                  secureTextEntry
                  autoComplete="off"
                  textContentType="password"
                  value={form.password}
                  onChangeText={(v) => handleChange('password', v)}
                  placeholderTextColor="#cbd5e1"
                />
                <TextInput style={[styles.input, styles.inputSoft]} placeholder="Nombre" value={form.firstName} onChangeText={(v) => handleChange('firstName', v)} placeholderTextColor="#cbd5e1" />
                <TextInput style={[styles.input, styles.inputSoft]} placeholder="Apellido" value={form.lastName} onChangeText={(v) => handleChange('lastName', v)} placeholderTextColor="#cbd5e1" />
                <TextInput style={[styles.input, styles.inputSoft]} placeholder="Dirección" value={form.address} onChangeText={(v) => handleChange('address', v)} placeholderTextColor="#cbd5e1" />
                <TextInput style={[styles.input, styles.inputSoft]} placeholder="Fecha de nacimiento (YYYY-MM-DD)" value={form.dob} onChangeText={(v) => handleChange('dob', v)} placeholderTextColor="#cbd5e1" />
                <TextInput style={[styles.input, styles.inputSoft]} placeholder="Cédula" value={form.cedula} onChangeText={(v) => handleChange('cedula', v)} keyboardType="numeric" placeholderTextColor="#cbd5e1" />
                <TextInput style={[styles.input, styles.inputSoft]} placeholder="Teléfono" value={form.phone} onChangeText={(v) => handleChange('phone', v)} keyboardType="phone-pad" placeholderTextColor="#cbd5e1" />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <FilledButton
                  title={loading ? 'Procesando...' : 'Registrarme'}
                  onPress={submit}
                  disabled={loading}
                  icon={<Ionicons name="person-add-outline" size={18} color="#fff" />}
                />
                <View style={styles.linksRow}>
                  <TouchableOpacity onPress={() => setMode('login')} style={styles.linkItem}>
                    <Ionicons name="log-in-outline" size={16} color="#e2e8f0" />
                    <Text style={styles.link}>Ya tengo cuenta</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );

  const renderRecovery = () => (
    <SafeAreaView style={[styles.container, { backgroundColor: '#0b1224' }]}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?auto=format&fit=crop&w=1600&q=80' }}
        style={{ flex: 1 }}
        blurRadius={7}
      >
        <View style={styles.overlay} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={[styles.scroll, { justifyContent: 'center', minHeight: '100%' }]}>            
            <Animated.View style={{ opacity: heroAnim, transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
              <Text style={styles.heroTitle}>Recupera tu acceso</Text>
              <Text style={styles.heroTagline}>Enviamos un enlace seguro a tu correo.</Text>
            </Animated.View>
            <View style={[styles.card, styles.glassCard]}>
              <TextInput
                style={[styles.input, styles.inputSoft]}
                placeholder="Correo registrado"
                autoCapitalize="none"
                autoComplete="off"
                textContentType="none"
                value={recoveryEmail}
                onChangeText={setRecoveryEmail}
                placeholderTextColor="#cbd5e1"
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              {recoveryMessage ? <Text style={styles.successText}>{recoveryMessage}</Text> : null}
              <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleRecovery}
                  onPressIn={pressIn}
                  onPressOut={pressOut}
                  style={styles.primaryButton}
                  disabled={recoveryLoading}
                >
                  {recoveryLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Enviar instrucciones</Text>}
                </TouchableOpacity>
              </Animated.View>
              <TouchableOpacity style={[styles.linkItem, { marginTop: 12 }]} onPress={() => { setShowRecovery(false); setError(''); setRecoveryMessage(''); }}>
                <Ionicons name="arrow-back-outline" size={16} color="#e2e8f0" />
                <Text style={styles.link}>Volver a iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );

  if (showVerification) return renderVerification();
  if (showRecovery) return renderRecovery();
  return renderLogin();
}

      function CreateRaffleCard({ api, onCreated }) {
        const [title, setTitle] = useState('');
        const [price, setPrice] = useState('');
        const [description, setDescription] = useState('');
        const [creating, setCreating] = useState(false);

        const create = async () => {
          if (!title || !price) return Alert.alert('Faltan datos', 'Ingresa titulo y precio.');
          const priceNumber = Number(price);
          if (Number.isNaN(priceNumber) || priceNumber <= 0) return Alert.alert('Precio invalido', 'El precio debe ser mayor a 0.');
          setCreating(true);
          const { res, data } = await api('/raffles', {
            method: 'POST',
            body: JSON.stringify({ title, price: priceNumber, description })
          });
          if (res.ok) {
            Alert.alert('Listo', 'Rifa creada correctamente.');
            setTitle('');
            setPrice('');
            setDescription('');
            onCreated?.();
          } else {
            Alert.alert('Ups', data.error || 'No se pudo crear la rifa.');
          }
          setCreating(false);
        };

        return (
          <View style={styles.card}>
            <Text style={styles.section}>Crear rifa</Text>
            <TextInput placeholder="Titulo" value={title} onChangeText={setTitle} style={styles.input} />
            <TextInput placeholder="Precio" value={price} onChangeText={setPrice} style={styles.input} keyboardType="numeric" />
            <TextInput placeholder="Descripcion" value={description} onChangeText={setDescription} style={styles.input} />
            <FilledButton
              title="Crear"
              onPress={create}
              loading={creating}
              disabled={creating}
              icon={<Ionicons name="add-circle-outline" size={18} color="#fff" />}
            />
          </View>
        );
      }

      function ProgressBar({ progress = 0, color = palette.primary }) {
        const pct = Math.min(100, Math.max(0, Math.round(progress * 100)));
        return (
          <View style={{ height: 10, backgroundColor: '#e2e8f0', borderRadius: 999, overflow: 'hidden', marginVertical: 6 }}>
            <View style={{ width: `${pct}%`, backgroundColor: color, height: '100%' }} />
          </View>
        );
      }

      function RafflesHomeScreen({ navigation, api }) {
        const [raffles, setRaffles] = useState([]);
        const [loading, setLoading] = useState(false);
        const [supportVisible, setSupportVisible] = useState(false);
        const [supportMessage, setSupportMessage] = useState('');
        const heroAnim = useRef(new Animated.Value(0)).current;
        const banners = [
          {
            id: 'promo1',
            title: 'Jackpot dorado',
            text: 'Duplica tus tickets hoy',
            image: 'https://images.unsplash.com/photo-1496318447583-f524534e9ce1?auto=format&fit=crop&w=1200&q=80'
          },
          {
            id: 'promo2',
            title: 'Rifas VIP',
            text: 'Acceso exclusivo para miembros',
            image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80'
          }
        ];

        const load = useCallback(async () => {
          setLoading(true);
          const { res, data } = await api('/raffles');
          if (res.ok && Array.isArray(data)) {
            const activeOnly = data.filter((r) => r.status !== 'closed');
            setRaffles(activeOnly);
          }
          setLoading(false);
        }, [api]);

        useFocusEffect(
          useCallback(() => {
            load();
          }, [load])
        );

        useEffect(() => {
          Animated.timing(heroAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
        }, [heroAnim]);

        return (
          <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
              <Animated.View
                style={{
                  opacity: heroAnim,
                  transform: [
                    {
                      translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] })
                    }
                  ]
                }}
              >
                <View style={styles.heroCardHome}>
                  <View style={styles.heroPillRow}>
                    <View style={styles.heroPill}>
                      <Ionicons name="sparkles" size={14} color="#fbbf24" />
                      <Text style={styles.heroPillText}>Rifas activas</Text>
                    </View>
                    <TouchableOpacity onPress={load} style={styles.heroPillAlt}>
                      <Ionicons name="refresh" size={14} color={palette.text} />
                      <Text style={styles.heroPillText}>Actualizar</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.heroHeading}>Gana en grande, juega seguro.</Text>
                  <Text style={styles.heroSub}>Promos en vivo y sorteos verificados en tiempo real.</Text>
                  <View style={styles.heroStatsRow}>
                    <View style={styles.statCard}>
                      <Text style={styles.statLabel}>Activas</Text>
                      <Text style={styles.statValue}>{raffles.length}</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statLabel}>Jackpot</Text>
                      <Text style={styles.statValue}>
                        VES {raffles.reduce((m, r) => Math.max(m, Number(r.price) || 0), 0)}
                      </Text>
                    </View>
                  </View>
                </View>
              </Animated.View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {banners.map((b) => (
                  <TouchableOpacity key={b.id} style={styles.bannerCard} activeOpacity={0.9}>
                    <ImageBackground source={{ uri: b.image }} style={styles.bannerBg} imageStyle={{ borderRadius: 16 }}>
                      <View style={styles.bannerOverlay} />
                      <View style={{ padding: 14 }}>
                        <Text style={{ color: '#fef3c7', fontWeight: '800', fontSize: 12 }}>{b.title.toUpperCase()}</Text>
                        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 4 }}>{b.text}</Text>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.sectionRow}>
                <Text style={styles.section}>Rifas activas</Text>
                <Text style={styles.sectionHint}>Tarjetas limpias, sin complicaciones.</Text>
              </View>

              {loading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator color={palette.primary} size="large" />
                  <Text style={styles.muted}>Cargando rifas...</Text>
                </View>
              ) : (
                <FlatList
                  data={raffles}
                  keyExtractor={(item) => String(item.id)}
                  scrollEnabled={false}
                  renderItem={({ item, index }) => {
                    const stats = item.stats || {};
                    return (
                      <View
                        style={[
                          styles.card,
                          styles.raffleCard,
                          {
                            borderColor: item.style?.themeColor || 'rgba(124,58,237,0.3)'
                          }
                        ]}
                      >
                        <View style={styles.raffleTopRow}>
                          <View style={{ flex: 1 }}>
                            <View style={styles.pillRow}>
                              <Text style={[styles.pill, styles.softPill]}>
                                <Ionicons name="pricetag" size={14} color={palette.text} /> {String(index + 1).padStart(2, '0')}
                              </Text>
                              {item.style?.headline ? <Text style={styles.ghostPill}>{item.style.headline}</Text> : null}
                            </View>
                            <Text style={styles.itemTitle}>{item.title}</Text>
                            {item.organizerId ? <Text style={styles.muted}>Organizador: {item.organizerId}</Text> : null}
                          </View>
                          <View style={styles.priceBadgePrimary}>
                            <Ionicons name="trophy-outline" size={16} color="#fbbf24" />
                            <Text style={styles.priceBadgeText}>VES {item.price}</Text>
                          </View>
                        </View>
                        <Text style={styles.muted}>{item.description}</Text>
                        {item.style?.bannerImage ? (
                          <Image source={{ uri: item.style.bannerImage }} style={styles.bannerImage} resizeMode="cover" />
                        ) : null}
                        <View style={{ marginVertical: 6 }}>
                          <ProgressBar progress={stats.progress || 0} color={item.style?.accentColor || palette.accent} />
                          <Text style={styles.muted}>
                            {stats.sold || 0} vendidos · {stats.remaining ?? 0} disponibles
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <OutlineButton
                            title="Ver"
                            onPress={() => navigation.navigate('RaffleDetail', { raffle: item })}
                            icon={<Ionicons name="eye-outline" size={18} color={palette.primary} />}
                          />
                          <FilledButton
                            title="Comprar"
                            onPress={() => navigation.navigate('RaffleDetail', { raffle: item })}
                            icon={<Ionicons name="cart-outline" size={18} color="#fff" />}
                          />
                        </View>
                      </View>
                    );
                  }}
                  ListEmptyComponent={<Text style={styles.muted}>No hay rifas activas.</Text>}
                />
              )}
            </ScrollView>
            <Modal visible={supportVisible} transparent animationType="slide" onRequestClose={() => setSupportVisible(false)}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
                <View style={[styles.card, { borderTopLeftRadius: 16, borderTopRightRadius: 16 }]}> 
                  <View style={styles.sectionRow}>
                    <Text style={styles.section}>Ayuda rápida</Text>
                    <TouchableOpacity onPress={() => setSupportVisible(false)}>
                      <Ionicons name="close" size={20} color={palette.text} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.muted}>FAQs rápidas:</Text>
                  {[
                    '¿Cómo valido mi pago? → El admin revisa y te notificamos en minutos.',
                    '¿Cuándo se asignan los números? → Solo tras validar el pago.',
                    '¿Qué pasa si se rechaza? → Puedes reenviar comprobante o elegir otra rifa.'
                  ].map((faq) => (
                    <View key={faq} style={styles.receiptCard}>
                      <Text style={styles.muted}>{faq}</Text>
                    </View>
                  ))}
                  <Text style={styles.section}>Contacto directo</Text>
                  {raffles[0]?.support ? (
                    <Text style={styles.muted}>
                      WhatsApp: {raffles[0].support.whatsapp || '—'} · Instagram: {raffles[0].support.instagram || '—'} · Correo: {raffles[0].support.email || '—'}
                    </Text>
                  ) : (
                    <Text style={styles.muted}>El organizador no ha configurado datos de contacto.</Text>
                  )}
                  <TextInput
                    style={styles.input}
                    placeholder="Cuéntanos tu problema"
                    value={supportMessage}
                    onChangeText={setSupportMessage}
                    multiline
                  />
                  <FilledButton
                    title="Enviar mensaje"
                    onPress={() => {
                      setSupportVisible(false);
                      setSupportMessage('');
                      Alert.alert('Enviado', 'Hemos registrado tu mensaje. Te responderemos pronto.');
                    }}
                    icon={<Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" />}
                  />
                </View>
              </View>
            </Modal>
          </SafeAreaView>
        );
      }

      function RaffleDetailScreen({ route, api }) {
        const { raffle } = route.params;
        const [quantity, setQuantity] = useState('1');
        const [current] = useState(raffle);
        const [buying, setBuying] = useState(false);
        const [manualRef, setManualRef] = useState('');
        const [manualNote, setManualNote] = useState('');
        const [manualProof, setManualProof] = useState(null);
        const [manualLoading, setManualLoading] = useState(false);
        const [paymentStep, setPaymentStep] = useState(1);
        const [assignedNumbers, setAssignedNumbers] = useState([]);
        const numbersAnim = useRef(new Animated.Value(0)).current;
        const [supportVisible, setSupportVisible] = useState(false);
        const [supportMessage, setSupportMessage] = useState('');
        const stats = current?.stats || {};

        const purchase = async () => {
          const qty = Number(quantity);
          if (Number.isNaN(qty) || qty <= 0) return Alert.alert('Cantidad invalida', 'Ingresa una cantidad mayor a 0.');
          setBuying(true);
          const { res, data } = await api(`/raffles/${current.id}/purchase`, {
            method: 'POST',
            body: JSON.stringify({ quantity: qty })
          });
          if (res.ok) {
            const nums = Array.isArray(data.numbers) ? data.numbers : [];
            setAssignedNumbers(nums);
            numbersAnim.setValue(0);
            Animated.spring(numbersAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();
            const positive = nums.length <= 1 ? '¡Tu número ya está en juego!' : '¡Tus números ya están en juego!';
            Alert.alert('Compra confirmada', `${positive}\nNúmeros: ${nums.map(formatTicketNumber).join(', ')}`);
            setPaymentStep(1);
            setManualProof(null);
          } else {
            Alert.alert('Ups', data.error || 'No se pudo completar la compra.');
          }
          setBuying(false);
        };

        const pickProof = async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) return Alert.alert('Permiso requerido', 'Autoriza el acceso a la galería.');
          const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7 });
          if (!result.canceled && result.assets?.length) {
            const asset = result.assets[0];
            setManualProof({ uri: asset.uri, base64: asset.base64 });
          }
        };

        const submitManualPayment = async () => {
          const qty = Number(quantity);
          if (Number.isNaN(qty) || qty <= 0) return Alert.alert('Cantidad invalida', 'Ingresa una cantidad mayor a 0.');
          if (!manualProof?.base64) return Alert.alert('Falta comprobante', 'Adjunta la captura del pago.');
          setManualLoading(true);
          const { res, data } = await api(`/raffles/${current.id}/manual-payments`, {
            method: 'POST',
            body: JSON.stringify({
              quantity: qty,
              reference: manualRef,
              note: manualNote,
              proof: `data:image/jpeg;base64,${manualProof.base64}`
            })
          });
          if (res.ok) {
            Alert.alert('Enviado', 'Pago pendiente de aprobación. Te avisaremos cuando se validen tus números.');
            setManualRef('');
            setManualNote('');
            setManualProof(null);
            setPaymentStep(1);
          } else {
            Alert.alert('Ups', data.error || 'No se pudo registrar el pago.');
          }
          setManualLoading(false);
        };

        return (
          <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
              <Text style={styles.title}>{current.title}</Text>
              <View style={styles.card}>
                {current.organizerId ? <Text style={styles.muted}>Organizador: {current.organizerId}</Text> : null}
                <Text style={styles.muted}>
                  Precio VES {current.price} • Vendidos {stats.sold || 0} • Disponibles {stats.remaining ?? 0}
                </Text>
                {current.support ? (
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.section}>Soporte</Text>
                    {current.support.whatsapp ? <Text style={styles.muted}>WhatsApp: {current.support.whatsapp}</Text> : null}
                    {current.support.instagram ? <Text style={styles.muted}>Instagram: {current.support.instagram}</Text> : null}
                    {current.support.email ? <Text style={styles.muted}>Correo: {current.support.email}</Text> : null}
                  </View>
                ) : null}
                <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholder="Cantidad" />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <OutlineButton title={buying ? 'Procesando...' : 'Comprar'} onPress={purchase} disabled={buying} icon={<Ionicons name="card-outline" size={18} color={palette.primary} />} />
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.sectionRow}>
                  <Text style={styles.section}>Pago móvil guiado</Text>
                  <TouchableOpacity onPress={() => setSupportVisible(true)} style={[styles.pill, { backgroundColor: 'rgba(34,211,238,0.14)' }]}> 
                    <Ionicons name="help-circle-outline" size={16} color={palette.accent} />
                    <Text style={{ color: palette.text, fontWeight: '700' }}>Ayuda</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.muted}>2 pasos: completa datos y sube comprobante. Asignamos números aleatorios 1-10000 tras validar.</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginVertical: 10 }}>
                  {[1, 2].map((step) => (
                    <View
                      key={step}
                      style={[
                        styles.pill,
                        {
                          backgroundColor: paymentStep === step ? palette.primary : 'rgba(255,255,255,0.06)',
                          color: paymentStep === step ? '#fff' : palette.text
                        }
                      ]}
                    >
                      <Text style={{ color: paymentStep === step ? '#fff' : palette.text, fontWeight: '800' }}>Paso {step}</Text>
                    </View>
                  ))}
                </View>

                {paymentStep === 1 ? (
                  <>
                    <TextInput style={styles.input} value={manualRef} onChangeText={setManualRef} placeholder="Referencia" />
                    <TextInput style={styles.input} value={manualNote} onChangeText={setManualNote} placeholder="Nota" />
                    <OutlineButton
                      title="Continuar"
                      onPress={() => setPaymentStep(2)}
                      icon={<Ionicons name="arrow-forward-outline" size={18} color={palette.primary} />}
                    />
                  </>
                ) : (
                  <>
                    <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={pickProof} activeOpacity={0.85}>
                      <Ionicons name="image-outline" size={18} color={palette.primary} />
                      <Text style={[styles.secondaryText, { marginLeft: 8 }]}>Adjuntar captura</Text>
                    </TouchableOpacity>
                    {manualProof?.uri ? <Image source={{ uri: manualProof.uri }} style={styles.proofImage} /> : <Text style={styles.muted}>Aún no has seleccionado imagen.</Text>}
                    <Text style={styles.muted}>Cantidad: {quantity} · Ref: {manualRef || '—'}</Text>
                    <FilledButton
                      title={manualLoading ? 'Enviando...' : 'Enviar comprobante'}
                      onPress={submitManualPayment}
                      loading={manualLoading}
                      disabled={manualLoading}
                      icon={<Ionicons name="cloud-upload-outline" size={18} color="#fff" />}
                    />
                    <OutlineButton
                      title="Volver al paso 1"
                      onPress={() => setPaymentStep(1)}
                      icon={<Ionicons name="arrow-back-outline" size={18} color={palette.primary} />}
                    />
                  </>
                )}
              </View>

              {assignedNumbers.length ? (
                <Animated.View
                  style={[
                    styles.card,
                    styles.glassCard,
                    {
                      transform: [
                        {
                          scale: numbersAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] })
                        }
                      ],
                      opacity: numbersAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] })
                    }
                  ]}
                >
                  <Text style={styles.section}>Números asignados</Text>
                  <Text style={styles.muted}>{assignedNumbers.length === 1 ? '¡Tu número ya está en juego!' : '¡Tus números ya están en juego!'}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
                    {assignedNumbers.map((n) => (
                      <View key={n} style={styles.ticketGlow}>
                        <Text style={{ color: '#0b1224', fontWeight: '900' }}>#{formatTicketNumber(n)}</Text>
                      </View>
                    ))}
                  </View>
                </Animated.View>
              ) : null}
            </ScrollView>
          </SafeAreaView>
        );
      }

      function MyRafflesScreen({ api }) {
        const [items, setItems] = useState([]);
        const [loading, setLoading] = useState(false);

        const load = useCallback(async () => {
          setLoading(true);
          const { res, data } = await api('/me/raffles');
          if (res.ok && Array.isArray(data)) setItems(data);
          setLoading(false);
        }, [api]);

        useFocusEffect(
          useCallback(() => {
            load();
          }, [load])
        );

        return (
          <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
              <Text style={styles.title}>Mis rifas</Text>
              {loading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator color={palette.primary} size="large" />
                  <Text style={styles.muted}>Cargando...</Text>
                </View>
              ) : (
                <FlatList
                  data={items}
                  keyExtractor={(item) => item?.raffle?.id || item?.raffleId || String(Math.random())}
                  scrollEnabled={false}
                  renderItem={({ item }) => {
                    const progress = item.raffle?.stats?.progress || 0;
                    const isWinner = !!item.isWinner;
                    const status = isWinner ? 'Ganador' : item.status || 'Activo';
                    return (
                      <View style={[styles.card, styles.myRaffleCard]}>
                        <View style={styles.rowBetween}>
                          <View style={{ flex: 1, paddingRight: 8 }}>
                            <Text style={styles.itemTitle}>{item.raffle?.title || 'Rifa'}</Text>
                            <Text style={styles.muted}>{item.raffle?.description}</Text>
                          </View>
                          <View style={[styles.statusChip, isWinner ? styles.statusWinner : null]}>
                            <Ionicons name={isWinner ? 'trophy' : 'sparkles'} size={16} color={isWinner ? '#fbbf24' : palette.accent} />
                            <Text style={styles.statusChipText}>{status}</Text>
                          </View>
                        </View>
                        <View style={styles.ticketRow}>
                          <View style={styles.ticketBadge}>
                            <Ionicons name="ticket-outline" size={16} color="#f8fafc" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.muted}>Números</Text>
                            <Text style={{ color: '#e2e8f0', fontWeight: '800' }}>
                              {Array.isArray(item.numbers)
                                ? item.numbers.map(formatTicketNumber).join(', ')
                                : item.numbers
                                ? formatTicketNumber(item.numbers)
                                : '—'}
                            </Text>
                          </View>
                          <View style={styles.miniBadge}>
                            <Text style={{ color: '#fbbf24', fontWeight: '800' }}>{Math.round(progress * 100)}%</Text>
                          </View>
                        </View>
                        <ProgressBar progress={progress} color={isWinner ? '#fbbf24' : palette.accent} />
                        <View style={styles.rowBetween}>
                          <Text style={styles.muted}>Estado: {status}</Text>
                          <TouchableOpacity onPress={() => navigation.navigate('RaffleDetail', { raffle: item.raffle })}>
                            <Text style={styles.link}>Ver rifa</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  }}
                  ListEmptyComponent={<Text style={styles.muted}>No tienes rifas compradas.</Text>}
                />
              )}
            </ScrollView>
          </SafeAreaView>
        );
      }

      function ProfileScreen({ api, onUserUpdate, pushToken, setPushToken }) {
        const [profile, setProfile] = useState(null);
        const [loading, setLoading] = useState(false);
        const [tickets, setTickets] = useState([]);
        const [payments, setPayments] = useState([]);
        const [saving, setSaving] = useState(false);
        const achievements = [
          { id: 'ach1', label: 'Explorador', icon: 'planet' },
          { id: 'ach2', label: 'Jugador fiel', icon: 'sparkles' },
          { id: 'ach3', label: 'VIP', icon: 'diamond' }
        ];

        const load = useCallback(async () => {
          setLoading(true);
          const [{ res: r1, data: d1 }, { res: r2, data: d2 }, { res: r3, data: d3 }] = await Promise.all([
            api('/me'),
            api('/me/tickets'),
            api('/me/payments')
          ]);
          if (r1.ok) setProfile(d1);
          if (r2.ok && Array.isArray(d2)) setTickets(d2);
          if (r3.ok && Array.isArray(d3)) setPayments(d3);
          setLoading(false);
        }, [api]);

        useFocusEffect(
          useCallback(() => {
            load();
          }, [load])
        );

        const pickAvatar = async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) return Alert.alert('Permiso requerido', 'Autoriza el acceso a la galería.');
          const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.6 });
          if (!result.canceled && result.assets?.length) {
            const asset = result.assets[0];
            setProfile((p) => ({ ...p, avatar: `data:image/jpeg;base64,${asset.base64}` }));
          }
        };

        const saveProfile = async () => {
          if (!profile) return;
          setSaving(true);
          const { res, data } = await api('/me', {
            method: 'PATCH',
            body: JSON.stringify({ phone: profile.phone, address: profile.address, avatar: profile.avatar })
          });
          if (res.ok) {
            setProfile(data);
            onUserUpdate?.(data);
            Alert.alert('Listo', 'Perfil actualizado');
          } else {
            Alert.alert('Ups', data.error || 'No se pudo guardar');
          }
          setSaving(false);
        };

        const showReceipt = (item) => {
          Alert.alert(
            'Recibo',
            `Rifa: ${item.raffleTitle || ''}\nTicket: ${item.number ? formatTicketNumber(item.number) : '—'}\nEstado: ${item.status}\nFecha: ${item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}\nVía: ${item.via || ''}`
          );
        };

        return (
          <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
              <Text style={styles.title}>Mi perfil</Text>
              {loading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator color={palette.primary} size="large" />
                  <Text style={styles.muted}>Cargando perfil...</Text>
                </View>
              ) : profile ? (
                <>
                  <View style={[styles.card, styles.profileHeader]}> 
                    <View style={styles.avatarGlow}>
                      <View style={styles.avatarRing}>
                        {profile.avatar ? (
                          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
                        ) : (
                          <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center' }]}>
                            <Ionicons name="person" size={36} color={palette.subtext} />
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={{ alignItems: 'center', gap: 4 }}>
                      <Text style={styles.itemTitle}>{profile.firstName} {profile.lastName}</Text>
                      <Text style={styles.muted}>{profile.email}</Text>
                      <View style={styles.pillRow}>
                        <Text style={styles.ghostPill}>Nivel seguro</Text>
                        <Text style={[styles.ghostPill, { backgroundColor: 'rgba(34,211,238,0.15)' }]}>+ Tickets</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.editButton} onPress={() => Alert.alert('Editar perfil', 'Actualiza tus datos en la sección de contacto')} activeOpacity={0.9}>
                      <Ionicons name="create-outline" size={16} color="#0b1224" />
                      <Text style={styles.editButtonText}>Editar perfil</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.secondaryButton, { marginTop: 8 }]} onPress={pickAvatar} activeOpacity={0.85}>
                      <Ionicons name="image-outline" size={18} color={palette.primary} />
                      <Text style={[styles.secondaryText, { marginLeft: 8 }]}>Cambiar foto</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.card, styles.glassCard]}>
                    <Text style={styles.section}>Datos de contacto</Text>
                    <Text style={styles.muted}>Información privada para notificarte sobre premios y compras.</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Teléfono"
                      value={profile.phone || ''}
                      onChangeText={(v) => setProfile((p) => ({ ...p, phone: v }))}
                      keyboardType="phone-pad"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Dirección"
                      value={profile.address || ''}
                      onChangeText={(v) => setProfile((p) => ({ ...p, address: v }))}
                    />
                    <FilledButton title={saving ? 'Guardando...' : 'Guardar cambios'} onPress={saveProfile} loading={saving} disabled={saving} icon={<Ionicons name="save-outline" size={18} color="#fff" />} />
                  </View>

                  <View style={[styles.card, styles.glassCard]}>
                    <Text style={styles.section}>Historial de pagos</Text>
                    {payments.length === 0 ? <Text style={styles.muted}>No tienes pagos registrados.</Text> : null}
                    {payments.map((p) => {
                      const amount = p.amount ?? p.total ?? (p.price && p.quantity ? Number(p.price) * Number(p.quantity) : null);
                      return (
                        <View key={p.id || p.reference} style={styles.receiptCard}>
                          <View style={styles.rowBetween}>
                            <Text style={styles.itemTitle}>{p.raffleTitle || p.raffleId || 'Pago'}</Text>
                            <Text style={styles.ghostPill}>{p.status || 'pendiente'}</Text>
                          </View>
                          <Text style={styles.muted}>Monto: {amount !== null && amount !== undefined ? `VES ${amount}` : '—'}</Text>
                          <Text style={styles.muted}>Ref: {p.reference || '—'}</Text>
                          <Text style={styles.muted}>Fecha: {p.createdAt ? new Date(p.createdAt).toLocaleString() : '—'}</Text>
                          {p.numbers ? (
                            <Text style={styles.muted}>
                              Números: {Array.isArray(p.numbers) ? p.numbers.map(formatTicketNumber).join(', ') : p.numbers}
                            </Text>
                          ) : null}
                          {p.via ? <Text style={styles.muted}>Vía: {p.via}</Text> : null}
                          {p.note ? <Text style={styles.muted}>{p.note}</Text> : null}
                        </View>
                      );
                    })}
                  </View>

                  <View style={[styles.card, styles.glassCard]}>
                    <Text style={styles.section}>Alertas y notificaciones</Text>
                    <Text style={styles.muted}>Activa avisos cuando validen tu pago o una rifa esté por cerrar.</Text>
                    <FilledButton
                      title={pushToken ? 'Notificaciones activas' : 'Activar notificaciones'}
                      onPress={async () => {
                        const { status } = await Notifications.requestPermissionsAsync();
                        if (status !== 'granted') return Alert.alert('Permiso requerido', 'Activa las notificaciones para avisarte.');
                        const projectId = getProjectId();
                        if (!projectId) {
                          Alert.alert('Config faltante', 'Agrega un projectId de EAS para registrar push tokens.');
                          return;
                        }
                        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
                        setPushToken(tokenData?.data || null);
                        Alert.alert('Notificaciones', 'Listo, recibirás avisos de validación y cierres.');
                      }}
                      icon={<Ionicons name="notifications-outline" size={18} color="#fff" />}
                    />
                    {pushToken ? <Text style={styles.muted}>Token registrado.</Text> : null}
                  </View>

                  <View style={[styles.card, styles.glassCard]}>
                    <Text style={styles.section}>Historial de tickets</Text>
                    {tickets.length === 0 ? <Text style={styles.muted}>No tienes tickets aún.</Text> : null}
                    {tickets.map((item) => (
                      <TouchableOpacity key={item.id} style={styles.receiptCard} onPress={() => showReceipt(item)}>
                        <View style={styles.rowBetween}>
                          <Text style={styles.itemTitle}>{item.raffleTitle || item.raffleId}</Text>
                          <Text style={styles.ghostPill}>{item.status}</Text>
                        </View>
                        <Text style={styles.muted}>Ticket: {item.number ? formatTicketNumber(item.number) : '—'}</Text>
                        <Text style={styles.muted}>Fecha: {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}</Text>
                        <Text style={styles.link}>Ver recibo</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={[styles.card, styles.glassCard]}>
                    <Text style={styles.section}>Logros</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                      {achievements.map((a) => (
                        <View key={a.id} style={styles.badge}>
                          <Ionicons name={a.icon} size={16} color="#fbbf24" />
                          <Text style={{ color: palette.text, fontWeight: '700', marginTop: 4 }}>{a.label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={[styles.card, styles.glassCard]}>
                    <Text style={styles.section}>Ranking activo</Text>
                    <Text style={styles.muted}>Reconocemos a quienes más participan.</Text>
                    {[
                      { id: 'r1', name: 'Top 1', score: '42 tickets' },
                      { id: 'r2', name: 'Top 2', score: '31 tickets' },
                      { id: 'r3', name: 'Tu posición', score: `${tickets.length} tickets` }
                    ].map((row) => (
                      <View key={row.id} style={styles.receiptCard}>
                        <Text style={styles.itemTitle}>{row.name}</Text>
                        <Text style={styles.muted}>{row.score}</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <Text>No se encontró el perfil.</Text>
              )}
            </ScrollView>
          </SafeAreaView>
        );
      }

      function WalletScreen({ api }) {
        const [refreshing, setRefreshing] = useState(false);
        const [balance, setBalance] = useState(0);
        const movements = [
          { id: 'TX-98231', label: 'Recarga', amount: 120, type: 'in', status: 'approved' },
          { id: 'TX-98232', label: 'Compra de rifa', amount: -25, type: 'out', status: 'approved' },
          { id: 'TX-98233', label: 'Recarga', amount: 60, type: 'in', status: 'pending' }
        ];
        const chartData = [140, 90, 180, 80, 160, 120];

        const loadWallet = useCallback(async () => {
          setRefreshing(true);
          const { res, data } = await api('/wallet');
          if (res.ok) setBalance(data.balance || 0);
          setRefreshing(false);
        }, [api]);

        useFocusEffect(
          useCallback(() => {
            loadWallet();
          }, [loadWallet])
        );

        return (
          <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
              <Text style={styles.title}>Wallet</Text>

              <View style={styles.balanceCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={styles.section}>Saldo disponible</Text>
                    <Text style={styles.balanceValue}>VES {balance.toFixed(2)}</Text>
                  </View>
                  <View style={styles.circleAccent}>
                    <Ionicons name="wallet-outline" size={22} color="#fbbf24" />
                  </View>
                </View>
                <View style={styles.ctaRow}>
                  <TouchableOpacity style={styles.ctaButtonPrimary} activeOpacity={0.9}>
                    <Ionicons name="add" size={18} color="#0b1224" />
                    <Text style={styles.ctaButtonPrimaryText}>Recargar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.ctaButtonGhost} activeOpacity={0.9}>
                    <Ionicons name="arrow-down" size={18} color="#e2e8f0" />
                    <Text style={styles.ctaButtonGhostText}>Retirar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.ctaButtonGhost} onPress={loadWallet} activeOpacity={0.9}>
                    <Ionicons name="refresh" size={18} color="#e2e8f0" />
                    <Text style={styles.ctaButtonGhostText}>{refreshing ? '...' : 'Actualizar'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                  <View style={styles.statTile}> 
                    <Text style={styles.statLabel}>Ingresos</Text>
                    <Text style={styles.statValue}>VES 180</Text>
                  </View>
                  <View style={styles.statTile}> 
                    <Text style={styles.statLabel}>Gastos</Text>
                    <Text style={[styles.statValue, { color: '#f97316' }]}>VES 85</Text>
                  </View>
                  <View style={styles.statTile}> 
                    <Text style={styles.statLabel}>Tickets</Text>
                    <Text style={styles.statValue}>12</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.card, styles.glassCard]}>
                <Text style={styles.section}>Actividad</Text>
                <View style={styles.chartRow}>
                  {chartData.map((v, idx) => (
                    <View key={idx} style={[styles.chartBar, { height: v / 2, backgroundColor: idx % 2 === 0 ? '#22d3ee' : '#7c3aed' }]} />
                  ))}
                </View>
                <View style={{ marginTop: 8 }}>
                  {movements.map((m) => (
                    <View key={m.id} style={styles.movementRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={[styles.movementBadge, { backgroundColor: m.type === 'in' ? 'rgba(16,185,129,0.15)' : 'rgba(248,113,113,0.15)', borderColor: m.type === 'in' ? 'rgba(16,185,129,0.35)' : 'rgba(248,113,113,0.35)' }]}> 
                          <Ionicons name={m.type === 'in' ? 'arrow-up' : 'arrow-down'} size={16} color={m.type === 'in' ? '#10b981' : '#f87171'} />
                        </View>
                        <View>
                          <Text style={styles.itemTitle}>{m.label}</Text>
                          <Text style={styles.muted}>ID: {m.id} · {m.type === 'in' ? 'Entrada' : 'Salida'}</Text>
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: m.type === 'in' ? '#10b981' : '#f87171', fontWeight: '800' }}>{m.type === 'in' ? '+' : '-'}VES {Math.abs(m.amount)}</Text>
                        <Text style={[styles.statusPill, m.status === 'approved' ? styles.statusApproved : m.status === 'pending' ? styles.statusPending : styles.statusRejected]}>{m.status}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        );
      }

function AdminScreen({ api }) {
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [actingId, setActingId] = useState(null);
  const [styleForm, setStyleForm] = useState({ raffleId: '', bannerImage: '', themeColor: '#2563eb', accentColor: '#10b981', headline: '', ctaText: '' });
  const [styleLoading, setStyleLoading] = useState(false);
  const [raffles, setRaffles] = useState([]);
  const [selectedRaffle, setSelectedRaffle] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketFilters, setTicketFilters] = useState({ raffleId: '', status: '', from: '', to: '' });
  const [raffleForm, setRaffleForm] = useState({ id: null, title: '', price: '', description: '', totalTickets: '', startDate: '', endDate: '', securityCode: '' });
  const [savingRaffle, setSavingRaffle] = useState(false);
  const [closingId, setClosingId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [supportForm, setSupportForm] = useState({ whatsapp: '', instagram: '', facebook: '', tiktok: '', website: '', email: '' });
  const [paymentForm, setPaymentForm] = useState({ bank: '', phone: '', cedula: '' });
  const [savingSupport, setSavingSupport] = useState(false);
  const [securityStatus, setSecurityStatus] = useState({ active: false, updatedAt: null });
  const [securityLoading, setSecurityLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    const { res, data } = await api('/me');
    if (res.ok) {
      setProfile(data);
      const sup = data.support || {};
      setSupportForm({
        whatsapp: sup.whatsapp || '',
        instagram: sup.instagram || '',
        facebook: sup.facebook || '',
        tiktok: sup.tiktok || '',
        website: sup.website || '',
        email: sup.email || data.email || ''
      });
    }
    setProfileLoading(false);
  }, [api]);

  const loadRaffles = useCallback(async () => {
    const { res, data } = await api('/admin/raffles');
    if (res.ok && Array.isArray(data)) {
      setRaffles(data);
      if (!selectedRaffle && data.length) {
        const first = data[0];
        setSelectedRaffle(first);
        setStyleForm({
          raffleId: first.id,
          bannerImage: first.style?.bannerImage || '',
          themeColor: first.style?.themeColor || '#2563eb',
          accentColor: first.style?.accentColor || '#10b981',
          headline: first.style?.headline || '',
          ctaText: first.style?.ctaText || ''
        });
      }
    }
  }, [api, selectedRaffle]);

  const loadSecurityStatus = useCallback(async () => {
    setSecurityLoading(true);
    const { res, data } = await api('/admin/security-code');
    if (res.ok) setSecurityStatus(data);
    setSecurityLoading(false);
  }, [api]);

  const loadManualPayments = useCallback(async () => {
    setLoadingPayments(true);
    const { res, data } = await api('/admin/manual-payments');
    if (res.ok) setPayments(Array.isArray(data) ? data : []);
    setLoadingPayments(false);
  }, [api]);

  const loadTickets = useCallback(async () => {
    setTicketsLoading(true);
    const params = new URLSearchParams();
    if (ticketFilters.raffleId) params.append('raffleId', ticketFilters.raffleId);
    if (ticketFilters.status) params.append('status', ticketFilters.status);
    if (ticketFilters.from) params.append('from', ticketFilters.from);
    if (ticketFilters.to) params.append('to', ticketFilters.to);
    const query = params.toString() ? `?${params.toString()}` : '';
    const { res, data } = await api(`/admin/tickets${query}`);
    if (res.ok && Array.isArray(data)) setTickets(data);
    setTicketsLoading(false);
  }, [api, ticketFilters]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
      loadSecurityStatus();
      loadManualPayments();
      loadRaffles();
      loadTickets();
    }, [loadProfile, loadSecurityStatus, loadManualPayments, loadRaffles, loadTickets])
  );

  const saveSupport = async () => {
    setSavingSupport(true);
    const { res, data } = await api('/me', {
      method: 'PATCH',
      body: JSON.stringify({ support: supportForm, paymentMobile: paymentForm })
    });
    if (res.ok) {
      setProfile(data);
      Alert.alert('Listo', 'Datos de soporte guardados.');
    } else {
      Alert.alert('Ups', data.error || 'No se pudo guardar.');
    }
    setSavingSupport(false);
  };

  const processPayment = async (id, action) => {
    setActingId(id);
    const { res, data } = await api(`/admin/manual-payments/${id}/${action}`, { method: 'POST' });
    if (res.ok) {
      Alert.alert('Listo', action === 'approve' ? 'Pago aprobado y numeros asignados.' : 'Pago rechazado.');
      loadManualPayments();
      loadTickets();
    } else {
      Alert.alert('Ups', data.error || 'No se pudo procesar.');
    }
    setActingId(null);
  };

  const updateStyle = async () => {
    if (!styleForm.raffleId) return Alert.alert('Falta rifa', 'Selecciona una rifa.');
    setStyleLoading(true);
    const { res, data } = await api(`/raffles/${styleForm.raffleId}/style`, {
      method: 'PATCH',
      body: JSON.stringify(styleForm)
    });
    if (res.ok) {
      Alert.alert('Estilo actualizado');
    } else {
      Alert.alert('Ups', data.error || 'No se pudo actualizar el estilo.');
    }
    setStyleLoading(false);
  };

  const exportTickets = async () => {
    setTicketsLoading(true);
    const params = new URLSearchParams();
    if (ticketFilters.raffleId) params.append('raffleId', ticketFilters.raffleId);
    if (ticketFilters.status) params.append('status', ticketFilters.status);
    if (ticketFilters.from) params.append('from', ticketFilters.from);
    if (ticketFilters.to) params.append('to', ticketFilters.to);
    params.append('format', 'csv');
    const query = params.toString() ? `?${params.toString()}` : '';
    const { res, data } = await api(`/admin/tickets${query}`, { method: 'GET', headers: { Accept: 'text/csv' } }, false);
    if (res.ok) {
      Alert.alert('Exportado', 'CSV generado. Revisa la consola para copiarlo.');
      // eslint-disable-next-line no-console
      console.log('CSV tickets:\n', data);
    } else {
      Alert.alert('Ups', data.error || 'No se pudo exportar.');
    }
    setTicketsLoading(false);
  };

  const pickBanner = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permiso requerido', 'Autoriza el acceso a la galería.');
    const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7 });
    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      setStyleForm((s) => ({ ...s, bannerImage: `data:image/jpeg;base64,${asset.base64}` }));
    }
  };

  const editRaffle = (raffle) => {
    setRaffleForm({
      id: raffle.id,
      title: raffle.title || '',
      price: String(raffle.price || ''),
      description: raffle.description || '',
      totalTickets: raffle.totalTickets ? String(raffle.totalTickets) : '',
      startDate: raffle.startDate ? raffle.startDate.slice(0, 10) : '',
      endDate: raffle.endDate ? raffle.endDate.slice(0, 10) : ''
    });
  };

  const resetRaffleForm = () => {
    setRaffleForm({ id: null, title: '', price: '', description: '', totalTickets: '', startDate: '', endDate: '', securityCode: '' });
  };

  const submitRaffle = async () => {
    if (!raffleForm.title || !raffleForm.price) return Alert.alert('Faltan datos', 'Ingresa titulo y precio.');
    const payload = {
      title: raffleForm.title,
      price: Number(raffleForm.price),
      description: raffleForm.description,
      totalTickets: raffleForm.totalTickets ? Number(raffleForm.totalTickets) : undefined,
      startDate: raffleForm.startDate,
      endDate: raffleForm.endDate,
      securityCode: raffleForm.securityCode
    };
    setSavingRaffle(true);
    const endpoint = raffleForm.id ? `/admin/raffles/${raffleForm.id}` : '/raffles';
    const method = raffleForm.id ? 'PATCH' : 'POST';
    const { res, data } = await api(endpoint, { method, body: JSON.stringify(payload) });
    if (res.ok) {
      Alert.alert('Listo', raffleForm.id ? 'Rifa actualizada.' : 'Rifa creada.');
      resetRaffleForm();
      loadRaffles();
      loadTickets();
    } else {
      Alert.alert('Ups', data.error || 'No se pudo guardar.');
    }
    setSavingRaffle(false);
  };

  const regenerateSecurityCode = async () => {
    setRegenerating(true);
    const { res, data } = await api('/admin/security-code/regenerate', { method: 'POST' });
    if (res.ok) {
      Alert.alert('Nuevo código', `Código: ${data.code}\nGuárdalo y no lo compartas.`);
      setSecurityStatus({ active: true, updatedAt: Date.now() });
    } else {
      Alert.alert('Ups', data.error || 'No se pudo regenerar.');
    }
    setRegenerating(false);
  };

  const closeRaffle = async (raffleId) => {
    setClosingId(raffleId);
    const { res, data } = await api(`/raffles/${raffleId}/close`, { method: 'POST' });
    if (res.ok) {
      Alert.alert('Rifa cerrada', `Ticket ganador: ${data.winner?.number ? formatTicketNumber(data.winner.number) : '—'}`);
      loadRaffles();
      loadTickets();
    } else {
      Alert.alert('Ups', data.error || 'No se pudo cerrar la rifa.');
    }
    setClosingId(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Perfil Admin</Text>

        <View style={styles.card}>
          <Text style={styles.section}>Contacto y soporte</Text>
          {profileLoading ? <ActivityIndicator color={palette.primary} /> : null}
          <TextInput style={styles.input} placeholder="Whatsapp" value={supportForm.whatsapp} onChangeText={(v) => setSupportForm((s) => ({ ...s, whatsapp: v }))} />
          <TextInput style={styles.input} placeholder="Instagram" value={supportForm.instagram} onChangeText={(v) => setSupportForm((s) => ({ ...s, instagram: v }))} />
          <TextInput style={styles.input} placeholder="Facebook" value={supportForm.facebook} onChangeText={(v) => setSupportForm((s) => ({ ...s, facebook: v }))} />
          <TextInput style={styles.input} placeholder="TikTok" value={supportForm.tiktok} onChangeText={(v) => setSupportForm((s) => ({ ...s, tiktok: v }))} />
          <TextInput style={styles.input} placeholder="Web o enlace" value={supportForm.website} onChangeText={(v) => setSupportForm((s) => ({ ...s, website: v }))} />
          <TextInput style={styles.input} placeholder="Correo de soporte" value={supportForm.email} onChangeText={(v) => setSupportForm((s) => ({ ...s, email: v }))} />
          <Text style={[styles.section, { marginTop: 6 }]}>Pago móvil (admin)</Text>
          <TextInput style={styles.input} placeholder="Banco" value={paymentForm.bank} onChangeText={(v) => setPaymentForm((s) => ({ ...s, bank: v }))} />
          <TextInput style={styles.input} placeholder="Teléfono" value={paymentForm.phone} onChangeText={(v) => setPaymentForm((s) => ({ ...s, phone: v }))} keyboardType="phone-pad" />
          <TextInput style={styles.input} placeholder="Cédula" value={paymentForm.cedula} onChangeText={(v) => setPaymentForm((s) => ({ ...s, cedula: v }))} />
          <FilledButton
            title={savingSupport ? 'Guardando...' : 'Guardar soporte'}
            onPress={saveSupport}
            loading={savingSupport}
            disabled={savingSupport}
            icon={<Ionicons name="save-outline" size={18} color="#fff" />}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Código de seguridad</Text>
          {securityLoading ? <ActivityIndicator color={palette.primary} /> : null}
          <Text style={styles.muted}>Usa este código para crear rifas y recuperar tu cuenta. Guárdalo y no lo compartas.</Text>
          <Text style={styles.muted}>Estado: {securityStatus.active ? 'Activo' : 'No configurado'}</Text>
          <Text style={styles.muted}>Actualizado: {securityStatus.updatedAt ? new Date(securityStatus.updatedAt).toLocaleString() : '—'}</Text>
          <FilledButton
            title={regenerating ? 'Generando...' : 'Regenerar código'}
            onPress={regenerateSecurityCode}
            loading={regenerating}
            disabled={regenerating}
            icon={<Ionicons name="shield-checkmark-outline" size={18} color="#fff" />}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Gestionar rifas</Text>
          <TextInput style={styles.input} placeholder="Titulo" value={raffleForm.title} onChangeText={(v) => setRaffleForm((s) => ({ ...s, title: v }))} />
          <TextInput style={styles.input} placeholder="Precio" value={raffleForm.price} onChangeText={(v) => setRaffleForm((s) => ({ ...s, price: v }))} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Descripcion" value={raffleForm.description} onChangeText={(v) => setRaffleForm((s) => ({ ...s, description: v }))} />
          <TextInput style={styles.input} placeholder="Total tickets" value={raffleForm.totalTickets} onChangeText={(v) => setRaffleForm((s) => ({ ...s, totalTickets: v }))} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Inicio (YYYY-MM-DD)" value={raffleForm.startDate} onChangeText={(v) => setRaffleForm((s) => ({ ...s, startDate: v }))} />
          <TextInput style={styles.input} placeholder="Cierre (YYYY-MM-DD)" value={raffleForm.endDate} onChangeText={(v) => setRaffleForm((s) => ({ ...s, endDate: v }))} />
          <TextInput style={styles.input} placeholder="Código de seguridad" value={raffleForm.securityCode} onChangeText={(v) => setRaffleForm((s) => ({ ...s, securityCode: v }))} secureTextEntry />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <FilledButton
              title={savingRaffle ? 'Guardando...' : raffleForm.id ? 'Actualizar rifa' : 'Crear rifa'}
              onPress={submitRaffle}
              loading={savingRaffle}
              disabled={savingRaffle}
              icon={<Ionicons name={raffleForm.id ? 'create-outline' : 'add-circle-outline'} size={18} color="#fff" />}
            />
            {raffleForm.id ? (
              <OutlineButton title="Nueva" onPress={resetRaffleForm} icon={<Ionicons name="refresh-outline" size={18} color={palette.primary} />} />
            ) : null}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Rifas y progreso</Text>
          {raffles.map((r) => {
            const stats = r.stats || {};
            return (
              <View key={r.id} style={[styles.card, { borderColor: '#e2e8f0' }]}> 
                <View style={styles.rowBetween}>
                  <Text style={styles.itemTitle}>{r.title}</Text>
                  <Text style={[styles.pill, { backgroundColor: '#e2e8f0', color: palette.text }]}>{r.status}</Text>
                </View>
                <Text style={styles.muted}>${r.price} · Tickets {stats.sold || 0}/{stats.capacity || 0}</Text>
                <ProgressBar progress={stats.progress || 0} color={r.style?.accentColor || palette.primary} />
                <Text style={styles.muted}>Disponible: {stats.remaining ?? 0} • Inicio: {r.startDate ? r.startDate.slice(0, 10) : '—'} • Cierre: {r.endDate ? r.endDate.slice(0, 10) : '—'}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                  <OutlineButton title="Editar" onPress={() => editRaffle(r)} icon={<Ionicons name="create-outline" size={18} color={palette.primary} />} />
                  {r.status === 'active' ? (
                    <FilledButton
                      title={closingId === r.id ? 'Cerrando...' : 'Cerrar y sortear'}
                      onPress={() => closeRaffle(r.id)}
                      loading={closingId === r.id}
                      disabled={closingId === r.id}
                      icon={<Ionicons name="lock-closed-outline" size={18} color="#fff" />}
                    />
                  ) : null}
                </View>
              </View>
            );
          })}
          {raffles.length === 0 ? <Text>No hay rifas creadas.</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Pagos manuales</Text>
          {loadingPayments ? (
            <ActivityIndicator color={palette.primary} />
          ) : (
            <FlatList
              data={payments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[styles.card, { borderColor: '#f59e0b' }]}> 
                  <View style={styles.rowBetween}>
                    <Text style={styles.itemTitle}>Rifa: {item.raffleId}</Text>
                    <Text style={[styles.pill, { backgroundColor: '#fef3c7', color: '#b45309' }]}>{item.status}</Text>
                  </View>
                  <Text style={styles.muted}>Usuario: {item.userId}</Text>
                  <Text>Cantidad: {item.quantity}</Text>
                  {item.reference ? <Text>Ref: {item.reference}</Text> : null}
                  {item.note ? <Text style={styles.muted}>{item.note}</Text> : null}
                  {item.proof ? (
                    <TouchableOpacity onPress={() => Alert.alert('Comprobante', 'Revisa el enlace en consola.') }>
                      <Text style={styles.link}>Ver comprobante (base64)</Text>
                    </TouchableOpacity>
                  ) : null}
                  {item.status === 'pending' && (
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                      <FilledButton
                        title={actingId === item.id ? 'Aprobando...' : 'Aprobar'}
                        onPress={() => processPayment(item.id, 'approve')}
                        loading={actingId === item.id}
                        disabled={actingId === item.id}
                        icon={<Ionicons name="checkmark-circle-outline" size={18} color="#fff" />}
                      />
                      <OutlineButton
                        title="Rechazar"
                        onPress={() => processPayment(item.id, 'reject')}
                        disabled={actingId === item.id}
                        icon={<Ionicons name="close-circle-outline" size={18} color={palette.primary} />}
                      />
                    </View>
                  )}
                  {item.numbers ? <Text style={styles.muted}>Asignados: {item.numbers.map(formatTicketNumber).join(', ')}</Text> : null}
                </View>
              )}
              ListEmptyComponent={<Text>No hay pagos manuales.</Text>}
            />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Personalizar estilo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            {raffles.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[
                  styles.pill,
                  {
                    marginRight: 8,
                    backgroundColor: selectedRaffle?.id === r.id ? palette.primary : '#e2e8f0',
                    color: selectedRaffle?.id === r.id ? '#fff' : palette.text
                  }
                ]}
                onPress={() => {
                  setSelectedRaffle(r);
                  setStyleForm({
                    raffleId: r.id,
                    bannerImage: r.style?.bannerImage || '',
                    themeColor: r.style?.themeColor || '#2563eb',
                    accentColor: r.style?.accentColor || '#10b981',
                    headline: r.style?.headline || '',
                    ctaText: r.style?.ctaText || ''
                  });
                }}
              >
                <Text style={{ color: selectedRaffle?.id === r.id ? '#fff' : palette.text }}>{r.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={pickBanner} activeOpacity={0.85}>
            <Ionicons name="image-outline" size={18} color={palette.primary} />
            <Text style={[styles.secondaryText, { marginLeft: 8 }]}>Subir imagen desde galería</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Color principal (#2563eb)"
            value={styleForm.themeColor}
            onChangeText={(v) => setStyleForm((s) => ({ ...s, themeColor: v }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Color acento (#10b981)"
            value={styleForm.accentColor}
            onChangeText={(v) => setStyleForm((s) => ({ ...s, accentColor: v }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Titular / headline"
            value={styleForm.headline}
            onChangeText={(v) => setStyleForm((s) => ({ ...s, headline: v }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Texto CTA"
            value={styleForm.ctaText}
            onChangeText={(v) => setStyleForm((s) => ({ ...s, ctaText: v }))}
          />
          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            {['#2563eb', '#10b981', '#f97316', '#7c3aed', '#ef4444'].map((color) => (
              <TouchableOpacity
                key={color}
                style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: color, marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0' }}
                onPress={() => setStyleForm((s) => ({ ...s, themeColor: color }))}
              />
            ))}
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            {['#10b981', '#22c55e', '#f59e0b', '#6366f1', '#06b6d4'].map((color) => (
              <TouchableOpacity
                key={color}
                style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: color, marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0' }}
                onPress={() => setStyleForm((s) => ({ ...s, accentColor: color }))}
              />
            ))}
          </View>
          <FilledButton
            title={styleLoading ? 'Guardando...' : 'Guardar estilo'}
            onPress={updateStyle}
            loading={styleLoading}
            disabled={styleLoading}
            icon={<Ionicons name="color-palette-outline" size={18} color="#fff" />}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Tickets vendidos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            <TouchableOpacity
              style={[styles.pill, { marginRight: 8, backgroundColor: ticketFilters.status === '' ? palette.primary : '#e2e8f0', color: ticketFilters.status === '' ? '#fff' : palette.text }]}
              onPress={() => setTicketFilters((f) => ({ ...f, status: '' }))}
            >
              <Text style={{ color: ticketFilters.status === '' ? '#fff' : palette.text }}>Todos</Text>
            </TouchableOpacity>
            {['approved', 'pending', 'rejected'].map((st) => (
              <TouchableOpacity
                key={st}
                style={[styles.pill, { marginRight: 8, backgroundColor: ticketFilters.status === st ? palette.primary : '#e2e8f0', color: ticketFilters.status === st ? '#fff' : palette.text }]}
                onPress={() => setTicketFilters((f) => ({ ...f, status: st }))}
              >
                <Text style={{ color: ticketFilters.status === st ? '#fff' : palette.text }}>{st}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            {raffles.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[styles.pill, { marginRight: 8, backgroundColor: ticketFilters.raffleId === r.id ? palette.primary : '#e2e8f0', color: ticketFilters.raffleId === r.id ? '#fff' : palette.text }]}
                onPress={() => setTicketFilters((f) => ({ ...f, raffleId: f.raffleId === r.id ? '' : r.id }))}
              >
                <Text style={{ color: ticketFilters.raffleId === r.id ? '#fff' : palette.text }}>{r.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TextInput
            style={styles.input}
            placeholder="Desde (YYYY-MM-DD)"
            value={ticketFilters.from}
            onChangeText={(v) => setTicketFilters((f) => ({ ...f, from: v }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Hasta (YYYY-MM-DD)"
            value={ticketFilters.to}
            onChangeText={(v) => setTicketFilters((f) => ({ ...f, to: v }))}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <FilledButton title={ticketsLoading ? 'Cargando...' : 'Aplicar filtros'} onPress={loadTickets} loading={ticketsLoading} disabled={ticketsLoading} icon={<Ionicons name="filter-outline" size={18} color="#fff" />} />
            <OutlineButton title="Exportar CSV" onPress={exportTickets} disabled={ticketsLoading} icon={<Ionicons name="download-outline" size={18} color={palette.primary} />} />
          </View>
          {ticketsLoading ? (
            <ActivityIndicator color={palette.primary} style={{ marginTop: 12 }} />
          ) : (
            <FlatList
              data={tickets}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[styles.card, { borderColor: '#cbd5e1' }]}> 
                  <Text style={styles.itemTitle}>Rifa: {item.raffleTitle || item.raffleId}</Text>
                  <Text style={styles.muted}>Ticket: {item.number ? formatTicketNumber(item.number) : '—'}</Text>
                  <Text style={styles.muted}>Estado: {item.status}</Text>
                  {item.buyer ? (
                    <Text style={styles.muted}>
                      Comprador: {item.buyer.firstName} {item.buyer.lastName} • {item.buyer.cedula} • {item.buyer.phone}
                    </Text>
                  ) : null}
                  <Text style={styles.muted}>Fecha: {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}</Text>
                </View>
              )}
              ListEmptyComponent={<Text>No hay tickets asignados.</Text>}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SuperAdminScreen({ api }) {
  const [branding, setBranding] = useState({ title: '', tagline: '', primaryColor: '', secondaryColor: '', logoUrl: '', bannerUrl: '', policies: '' });
  const [modules, setModules] = useState(null);
  const [users, setUsers] = useState([]);
  const [savingBranding, setSavingBranding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mailLogs, setMailLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [createForm, setCreateForm] = useState({ email: '', password: '', role: 'user', firstName: '', lastName: '', active: true });
  const [creating, setCreating] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [s1, s2, s3, s4] = await Promise.all([
      api('/superadmin/settings'),
      api('/superadmin/audit/users'),
      api('/superadmin/mail/logs'),
      api('/superadmin/audit/actions')
    ]);
    if (s1.res.ok) {
      setBranding((b) => ({ ...b, ...(s1.data.branding || {}) }));
      setModules(s1.data.modules || {});
    }
    if (s2.res.ok && Array.isArray(s2.data)) setUsers(s2.data);
    if (s3.res.ok && Array.isArray(s3.data)) setMailLogs(s3.data);
    if (s4.res.ok && Array.isArray(s4.data)) setAuditLogs(s4.data);
    setLoading(false);
  }, [api]);

  const createAccount = async () => {
    if (!createForm.email || !createForm.password) return Alert.alert('Faltan datos', 'Ingresa email y contraseña.');
    if (createForm.password.length < 8) return Alert.alert('Contraseña corta', 'Debe tener al menos 8 caracteres.');
    setCreating(true);
    const { res, data } = await api('/superadmin/users', {
      method: 'POST',
      body: JSON.stringify({
        email: createForm.email,
        password: createForm.password,
        role: createForm.role,
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        active: createForm.active
      })
    });
    if (res.ok) {
      Alert.alert('Cuenta creada', `Usuario ${data?.email || createForm.email}`);
      setCreateForm({ email: '', password: '', role: 'user', firstName: '', lastName: '', active: true });
      loadAll();
    } else {
      Alert.alert('Ups', data?.error || 'No se pudo crear la cuenta');
    }
    setCreating(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  const saveBranding = async () => {
    setSavingBranding(true);
    const { res, data } = await api('/superadmin/settings/branding', { method: 'PATCH', body: JSON.stringify(branding) });
    if (res.ok) {
      setBranding(data.branding || branding);
      Alert.alert('Listo', 'Branding actualizado');
    } else {
      Alert.alert('Ups', data.error || 'No se pudo guardar');
    }
    setSavingBranding(false);
  };

  const toggleModule = async (role, key) => {
    const next = { ...(modules || {}) };
    next[role] = { ...(next[role] || {}), [key]: !next[role]?.[key] };
    setModules(next);
    await api('/superadmin/settings/modules', { method: 'PATCH', body: JSON.stringify({ modules: next }) });
  };

  const updateUserStatus = async (id, patch) => {
    const { res } = await api(`/superadmin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify(patch) });
    if (res.ok) loadAll();
  };

  const reset2fa = async (id) => {
    await api(`/superadmin/users/${id}/reset-2fa`, { method: 'POST' });
    loadAll();
  };

  const revokeSessions = async (id) => {
    await api(`/superadmin/users/${id}/revoke-sessions`, { method: 'POST' });
    loadAll();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Superadmin</Text>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color={palette.primary} size="large" />
            <Text style={styles.muted}>Cargando ajustes...</Text>
          </View>
        ) : (
          <>
            <View style={[styles.card, styles.superCard]}>
              <View style={styles.sectionRow}>
                <View style={styles.sectionIconCircle}>
                  <Ionicons name="color-palette-outline" size={16} color="#fbbf24" />
                </View>
                <View>
                  <Text style={styles.section}>Branding</Text>
                  <Text style={styles.sectionHint}>Define colores, logo y mensajes visibles en la app.</Text>
                </View>
              </View>
              {['title', 'tagline', 'primaryColor', 'secondaryColor', 'logoUrl', 'bannerUrl', 'policies'].map((field) => (
                <TextInput
                  key={field}
                  style={styles.input}
                  placeholder={field}
                  value={branding[field] || ''}
                  onChangeText={(v) => setBranding((b) => ({ ...b, [field]: v }))}
                  autoCapitalize="none"
                />
              ))}
              <View style={styles.bannerPreview}>
                {branding.bannerUrl ? (
                  <ImageBackground source={{ uri: branding.bannerUrl }} style={styles.bannerPreviewImage} imageStyle={{ borderRadius: 12 }}>
                    <View style={styles.bannerOverlay} />
                    <Text style={{ color: '#fff', fontWeight: '800', position: 'absolute', bottom: 10, left: 12 }}>Vista previa banner</Text>
                  </ImageBackground>
                ) : (
                  <Text style={styles.muted}>Sube un banner o coloca un URL para previsualizar.</Text>
                )}
              </View>
              <FilledButton title={savingBranding ? 'Guardando...' : 'Guardar branding'} onPress={saveBranding} disabled={savingBranding} />
            </View>

            <View style={[styles.card, styles.superCard]}>
              <View style={styles.sectionRow}>
                <View style={styles.sectionIconCircle}>
                  <Ionicons name="person-add-outline" size={16} color="#22d3ee" />
                </View>
                <View>
                  <Text style={styles.section}>Crear cuenta</Text>
                  <Text style={styles.sectionHint}>Usuarios o admins desde el panel.</Text>
                </View>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={createForm.email}
                onChangeText={(v) => setCreateForm((s) => ({ ...s, email: v }))}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={createForm.firstName}
                onChangeText={(v) => setCreateForm((s) => ({ ...s, firstName: v }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Apellido"
                value={createForm.lastName}
                onChangeText={(v) => setCreateForm((s) => ({ ...s, lastName: v }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={createForm.password}
                onChangeText={(v) => setCreateForm((s) => ({ ...s, password: v }))}
                secureTextEntry
              />
              <Text style={styles.muted}>Mínimo 8 caracteres. Se validará correo único.</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                {['user', 'admin'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[styles.pill, { backgroundColor: createForm.role === role ? palette.primary : 'rgba(255,255,255,0.06)' }]}
                    onPress={() => setCreateForm((s) => ({ ...s, role }))}
                  >
                    <Text style={{ color: createForm.role === role ? '#fff' : palette.text }}>{role}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.sectionRow}>
                <Text style={styles.muted}>Cuenta activa al crear</Text>
                <Switch value={createForm.active} onValueChange={(v) => setCreateForm((s) => ({ ...s, active: v }))} />
              </View>
              <FilledButton title={creating ? 'Creando...' : 'Crear cuenta'} onPress={createAccount} disabled={creating} icon={<Ionicons name="shield-outline" size={18} color="#fff" />} />
            </View>

            <View style={[styles.card, styles.superCard]}>
              <View style={styles.sectionRow}>
                <View style={styles.sectionIconCircle}>
                  <Ionicons name="grid-outline" size={16} color="#22d3ee" />
                </View>
                <View>
                  <Text style={styles.section}>Módulos por rol</Text>
                  <Text style={styles.sectionHint}>Activa o desactiva accesos por perfil.</Text>
                </View>
              </View>
              {modules
                ? Object.entries(modules).map(([role, items]) => (
                    <View key={role} style={{ marginBottom: 10 }}>
                      <Text style={styles.itemTitle}>{role}</Text>
                      {Object.entries(items || {}).map(([key, val]) => (
                        <View key={key} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={styles.moduleChip}>
                              <Ionicons name="shield-outline" size={14} color={palette.accent} />
                            </View>
                            <Text style={styles.muted}>{key}</Text>
                          </View>
                          <Switch value={!!val} onValueChange={() => toggleModule(role, key)} />
                        </View>
                      ))}
                    </View>
                  ))
                : null}
            </View>

            <View style={[styles.card, styles.superCard]}>
              <View style={styles.sectionRow}>
                <View style={styles.sectionIconCircle}>
                  <Ionicons name="shield-checkmark-outline" size={16} color="#fbbf24" />
                </View>
                <View>
                  <Text style={styles.section}>Auditoría de cuentas</Text>
                  <Text style={styles.sectionHint}>Seguimiento visual de actividad y acciones rápidas.</Text>
                </View>
              </View>
              {users.map((u) => (
                <View key={u.id} style={styles.auditRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{u.email}</Text>
                    <Text style={styles.muted}>Rol: {u.role} · Verificado: {u.verified ? 'Sí' : 'No'} · Activo: {u.active ? 'Sí' : 'No'}</Text>
                    <Text style={styles.muted}>Última actividad: {u.lastActivity ? new Date(u.lastActivity).toLocaleString() : '—'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                    <OutlineButton title={u.active ? 'Desactivar' : 'Activar'} onPress={() => updateUserStatus(u.id, { active: !u.active })} />
                    <OutlineButton title={u.verified ? 'Marcar no verificado' : 'Verificar'} onPress={() => updateUserStatus(u.id, { verified: !u.verified })} />
                    <OutlineButton title="Reset 2FA" onPress={() => reset2fa(u.id)} />
                    <OutlineButton title="Revocar sesiones" onPress={() => revokeSessions(u.id)} />
                  </View>
                </View>
              ))}
            </View>

            <View style={[styles.card, styles.superCard]}>
              <View style={styles.sectionRow}>
                <View style={styles.sectionIconCircle}>
                  <Ionicons name="mail-outline" size={16} color="#22d3ee" />
                </View>
                <View>
                  <Text style={styles.section}>Log de correo</Text>
                  <Text style={styles.sectionHint}>Últimos envíos y estado.</Text>
                </View>
              </View>
              {mailLogs.map((m) => (
                <View key={m.id} style={styles.auditChip}>
                  <Text style={styles.itemTitle}>{m.subject}</Text>
                  <Text style={styles.muted}>{`${new Date(m.timestamp).toLocaleString()} · ${m.status} · ${m.to}`}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.card, styles.superCard]}>
              <View style={styles.sectionRow}>
                <View style={styles.sectionIconCircle}>
                  <Ionicons name="list-outline" size={16} color="#fbbf24" />
                </View>
                <View>
                  <Text style={styles.section}>Auditoría</Text>
                  <Text style={styles.sectionHint}>Creación de cuentas, pagos validados y asignación de rifas.</Text>
                </View>
              </View>
              {auditLogs.map((log) => (
                <View key={log.id} style={styles.auditChip}>
                  <Text style={styles.itemTitle}>{log.action}</Text>
                  <Text style={styles.muted}>
                    {new Date(log.timestamp).toLocaleString()} · {log.userEmail || 'sistema'} · {log.entity || ''}
                  </Text>
                  {log.detail ? <Text style={styles.muted}>{log.detail}</Text> : null}
                </View>
              ))}
              {auditLogs.length === 0 ? <Text style={styles.muted}>Sin registros aún.</Text> : null}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function RafflesStack({ api }) {
  const InnerStack = createNativeStackNavigator();
  return (
    <InnerStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerTitleStyle: { color: palette.text, fontWeight: '800' },
        headerTintColor: palette.primary
      }}
    >
      <InnerStack.Screen name="RafflesHome" options={{ title: 'Rifas' }}>
        {(props) => <RafflesHomeScreen {...props} api={api} />}
      </InnerStack.Screen>
      <InnerStack.Screen name="RaffleDetail" options={{ title: 'Detalle' }}>
        {(props) => <RaffleDetailScreen {...props} api={api} />}
      </InnerStack.Screen>
    </InnerStack.Navigator>
  );
}

function TabsNavigator({ api, user, onUserUpdate, modulesConfig, pushToken, setPushToken }) {
  const cfg =
    modulesConfig || {
      user: { raffles: true, wallet: true, profile: true },
      admin: { raffles: true },
      superadmin: { audit: true, branding: true, modules: true }
    };
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.subtext,
        tabBarStyle: { backgroundColor: '#0f172a', borderTopColor: 'rgba(255,255,255,0.08)' },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Rifas: 'pricetag-outline',
            Wallet: 'wallet-outline',
            'Mis Rifas': 'trophy-outline',
            Perfil: 'person-circle-outline',
            Admin: 'settings-outline'
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        }
      })}
    >
      {cfg?.user?.raffles !== false && (
        <Tabs.Screen name="Rifas">
          {() => <RafflesStack api={api} />}
        </Tabs.Screen>
      )}
      {cfg?.user?.wallet !== false && (
        <Tabs.Screen name="Wallet">
          {() => <WalletScreen api={api} />}
        </Tabs.Screen>
      )}
      {cfg?.user?.raffles !== false && (
        <Tabs.Screen name="Mis Rifas">
          {() => <MyRafflesScreen api={api} user={user} />}
        </Tabs.Screen>
      )}
      {cfg?.user?.profile !== false && (
        <Tabs.Screen name="Perfil">
          {() => <ProfileScreen api={api} user={user} onUserUpdate={onUserUpdate} pushToken={pushToken} setPushToken={setPushToken} />}
        </Tabs.Screen>
      )}
      {(user?.role === 'admin' || user?.role === 'organizer') && cfg?.admin?.raffles !== false && (
        <Tabs.Screen name="Admin">
          {() => <AdminScreen api={api} />}
        </Tabs.Screen>
      )}
      {user?.role === 'superadmin' && cfg?.superadmin?.audit !== false && (
        <Tabs.Screen name="Superadmin">
          {() => <SuperAdminScreen api={api} />}
        </Tabs.Screen>
      )}
    </Tabs.Navigator>
  );
}

export default function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [user, setUser] = useState(null);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [rememberEnabled, setRememberEnabled] = useState(false);
  const [modulesConfig, setModulesConfig] = useState({ user: { raffles: true, wallet: true, profile: true }, admin: { raffles: true }, superadmin: { audit: true, branding: true, modules: true } });
  const [pushToken, setPushToken] = useState(null);

  const persistTokens = useCallback(
    async (at, rt, usr, opts = {}) => {
      const remember = opts.remember ?? rememberEnabled;
      setAccessToken(at || null);
      setRefreshToken(rt || null);
      setUser(usr || null);

      if (remember) {
        await AsyncStorage.setItem('rememberMe', 'true');
        if (at) await setSecureItem(SECURE_KEYS.access, at);
        if (rt) await setSecureItem(SECURE_KEYS.refresh, rt);
        if (usr) await AsyncStorage.setItem('user', JSON.stringify(usr));
      } else {
        await AsyncStorage.multiRemove(['rememberMe', 'user']);
        await deleteSecureItem(SECURE_KEYS.access);
        await deleteSecureItem(SECURE_KEYS.refresh);
      }
    },
    [rememberEnabled]
  );

  const updateUserProfile = useCallback(async (usr) => {
    setUser(usr);
    await AsyncStorage.setItem('user', JSON.stringify(usr));
  }, []);

  const api = useApi(accessToken, refreshToken, persistTokens);

  useEffect(() => {
    if (!accessToken) {
      setModulesConfig(null);
      return;
    }
    (async () => {
      const { res, data } = await api('/modules');
      if (res.ok) setModulesConfig(data);
    })();
  }, [accessToken, api]);

  useEffect(() => {
    (async () => {
      const remember = (await AsyncStorage.getItem('rememberMe')) === 'true';
      setRememberEnabled(remember);
      if (remember) {
        const storedAccess = (await getSecureItem(SECURE_KEYS.access)) || (await AsyncStorage.getItem('accessToken'));
        const storedRefresh = (await getSecureItem(SECURE_KEYS.refresh)) || (await AsyncStorage.getItem('refreshToken'));
        const storedUser = await AsyncStorage.getItem('user');
        if (storedAccess) setAccessToken(storedAccess);
        if (storedRefresh) setRefreshToken(storedRefresh);
        if (storedUser) setUser(JSON.parse(storedUser));
      } else {
        await AsyncStorage.multiRemove(['user']);
        await deleteSecureItem(SECURE_KEYS.access);
        await deleteSecureItem(SECURE_KEYS.refresh);
      }
      setBootstrapped(true);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;
      const projectId = getProjectId();
      if (!projectId) {
        console.warn('Falta projectId de EAS para registrar push tokens.');
        return;
      }
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      setPushToken(tokenData?.data || null);
    })();
  }, []);

  useEffect(() => {
    if (!pushToken || !accessToken) return;
    (async () => {
      try {
        await api('/me/push-token', { method: 'POST', body: JSON.stringify({ token: pushToken }) });
      } catch (_err) {
        // Silenciar errores de registro de token
      }
    })();
  }, [pushToken, accessToken, api]);

  const handleAuth = async (at, rt, usr, remember) => {
    setRememberEnabled(!!remember);
    await persistTokens(at, rt, usr, { remember });
  };

  const logout = async () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setRememberEnabled(false);
    await AsyncStorage.multiRemove(['rememberMe', 'user']);
    await deleteSecureItem(SECURE_KEYS.access);
    await deleteSecureItem(SECURE_KEYS.refresh);
  };

  const loadingPhrase = useMemo(() => MOTIVATION_LINES[Math.floor(Math.random() * MOTIVATION_LINES.length)], []);

  if (!bootstrapped)
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: palette.text }}>{APP_NAME}</Text>
          <Text style={{ fontSize: 16, color: palette.subtext, textAlign: 'center' }}>{APP_TAGLINE}</Text>
          <ActivityIndicator color={palette.primary} size="large" style={{ marginTop: 8 }} />
          <Text style={{ color: palette.muted, marginTop: 4 }}>{loadingPhrase}</Text>
        </View>
      </SafeAreaView>
    );

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: palette.background },
          headerTitleStyle: { color: palette.text, fontWeight: '800' },
          headerTintColor: palette.primary
        }}
      >
        {accessToken ? (
          <Stack.Screen
            name="Main"
            options={{
              title: APP_NAME,
              headerRight: () => (
                <TouchableOpacity onPress={logout} style={{ paddingHorizontal: 8 }}>
                  <Ionicons name="log-out-outline" size={22} color={palette.primary} />
                </TouchableOpacity>
              )
            }}
          >
            {() => (
              <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
                <HeroBanner />
                <View style={{ flex: 1 }}>
                  <TabsNavigator
                    api={api}
                    user={user}
                    onUserUpdate={updateUserProfile}
                    modulesConfig={modulesConfig}
                    pushToken={pushToken}
                    setPushToken={setPushToken}
                  />
                </View>
              </SafeAreaView>
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Auth" options={{ headerShown: false }}>
            {() => <AuthScreen onAuth={handleAuth} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  scroll: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '800', color: palette.text, marginBottom: 12 },
  section: { fontSize: 16, fontWeight: '800', color: palette.text, marginBottom: 8 },
  card: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: 16, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  input: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', borderRadius: 12, padding: 14, marginBottom: 10, backgroundColor: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 16 },
  inputSoft: { borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.08)' },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: palette.primary, padding: 12, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: palette.border },
  secondaryText: { color: palette.primary, fontWeight: '700' },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)', color: palette.text, fontWeight: '700', alignSelf: 'flex-start' },
  muted: { color: palette.muted },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { fontSize: 16, fontWeight: '700', color: palette.text },
  link: { color: '#e2e8f0', marginTop: 6, fontWeight: '700' },
  loaderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  adminBadge: { color: '#f59e0b', fontWeight: '700', marginTop: 4 },
  bannerImage: { width: '100%', height: 160, borderRadius: 10, marginVertical: 8 },
  proofImage: { width: '100%', height: 180, borderRadius: 10, marginVertical: 8 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#e2e8f0', marginBottom: 8 },
  receiptCard: { borderWidth: 1, borderColor: palette.border, borderRadius: 10, padding: 10, marginBottom: 8 }
  ,overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,12,24,0.55)' },
  heroTitle: { fontSize: 34, fontWeight: '900', color: '#e2e8f0', textAlign: 'center' },
  heroTagline: { fontSize: 16, color: '#cbd5e1', textAlign: 'center', marginTop: 6, marginBottom: 16, lineHeight: 22 },
  glassCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  primaryButton: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', shadowColor: '#2563eb', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  rememberText: { color: '#cbd5e1', fontSize: 13 },
  linksRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, gap: 12 },
  linkItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorText: { color: '#fca5a5', marginTop: 4, fontWeight: '600' },
  successText: { color: '#a7f3d0', marginTop: 4, fontWeight: '600' },
  bannerCard: { width: 240, marginRight: 12 },
  bannerBg: { height: 140, borderRadius: 16, overflow: 'hidden' },
  bannerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(12,16,32,0.55)' },
  priceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  actionChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  medal: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(251,191,36,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  avatarRing: { padding: 4, borderRadius: 56, borderWidth: 2, borderColor: '#7c3aed' },
  badge: { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: palette.border, borderWidth: 1, borderRadius: 12, padding: 10, alignItems: 'center', width: 100 },
  balanceCard: { backgroundColor: 'rgba(15,23,42,0.9)', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 12 },
  balanceValue: { fontSize: 34, fontWeight: '900', color: '#fbbf24', marginTop: 4 },
  circleAccent: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(124,58,237,0.25)', alignItems: 'center', justifyContent: 'center' },
  ctaRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  ctaButtonPrimary: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, backgroundColor: '#fbbf24' },
  ctaButtonPrimaryText: { color: '#0b1224', fontWeight: '800' },
  ctaButtonGhost: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  ctaButtonGhostText: { color: '#e2e8f0', fontWeight: '700' },
  statTile: { flex: 1, padding: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginVertical: 10 },
  chartBar: { width: 26, borderRadius: 10, backgroundColor: '#22d3ee' },
  movementRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  movementBadge: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  statusPill: { marginTop: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, textTransform: 'uppercase', fontSize: 12, fontWeight: '800', color: '#e2e8f0', alignSelf: 'flex-end' },
  statusApproved: { backgroundColor: 'rgba(16,185,129,0.18)', borderColor: 'rgba(16,185,129,0.35)', borderWidth: 1 },
  statusPending: { backgroundColor: 'rgba(251,191,36,0.18)', borderColor: 'rgba(251,191,36,0.35)', borderWidth: 1 },
  statusRejected: { backgroundColor: 'rgba(248,113,113,0.18)', borderColor: 'rgba(248,113,113,0.35)', borderWidth: 1 },
  heroCardHome: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 18, marginBottom: 14 },
  heroPillRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  heroPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(124,58,237,0.18)' },
  heroPillAlt: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: palette.border },
  heroPillText: { color: palette.text, fontWeight: '700' },
  heroHeading: { fontSize: 22, fontWeight: '900', color: palette.text, marginBottom: 6 },
  heroSub: { color: palette.subtext, marginBottom: 10 },
  heroStatsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' },
  statLabel: { color: palette.muted, fontSize: 12 },
  statValue: { color: '#fbbf24', fontSize: 20, fontWeight: '900' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  sectionHint: { color: palette.muted, fontSize: 12 },
  raffleCard: { borderWidth: 1, borderColor: 'rgba(124,58,237,0.2)', backgroundColor: 'rgba(255,255,255,0.04)' },
  raffleTopRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 6 },
  pillRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  softPill: { backgroundColor: 'rgba(124,58,237,0.12)' },
  ghostPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)', color: '#c7d2fe', fontWeight: '700' },
  priceBadgePrimary: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(15,23,42,0.85)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  priceBadgeText: { color: '#fff', fontWeight: '800' },
  myRaffleCard: { borderWidth: 1, borderColor: 'rgba(34,211,238,0.25)', backgroundColor: 'rgba(12,18,36,0.9)' },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(34,211,238,0.12)', borderWidth: 1, borderColor: 'rgba(34,211,238,0.4)' },
  statusWinner: { backgroundColor: 'rgba(251,191,36,0.16)', borderColor: 'rgba(251,191,36,0.45)' },
  statusChipText: { color: '#e2e8f0', fontWeight: '700' },
  ticketRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 8 },
  ticketBadge: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(124,58,237,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(124,58,237,0.35)' },
  miniBadge: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, backgroundColor: 'rgba(251,191,36,0.12)', borderWidth: 1, borderColor: 'rgba(251,191,36,0.3)' },
  ticketGlow: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, backgroundColor: '#fbbf24', shadowColor: '#fbbf24', shadowOpacity: 0.45, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  profileHeader: { alignItems: 'center', backgroundColor: 'rgba(12,18,36,0.9)', borderColor: 'rgba(255,255,255,0.1)' },
  avatarGlow: { padding: 6, borderRadius: 64, backgroundColor: 'rgba(124,58,237,0.14)', marginBottom: 8 },
  editButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fbbf24', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginTop: 10 },
  editButtonText: { color: '#0b1224', fontWeight: '800' },
  superCard: { backgroundColor: 'rgba(12,18,36,0.92)', borderColor: 'rgba(255,255,255,0.08)' },
  sectionIconCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  bannerPreview: { marginVertical: 8 },
  bannerPreviewImage: { height: 140, borderRadius: 12, overflow: 'hidden' },
  moduleChip: { width: 28, height: 28, borderRadius: 10, backgroundColor: 'rgba(34,211,238,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(34,211,238,0.3)' },
  auditRow: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)', paddingVertical: 10 },
  auditChip: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }
});
