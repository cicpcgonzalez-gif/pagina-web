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
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { ENV } from './src/config/env';

const API_URL = ENV.apiUrl;

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const palette = {
  primary: '#A855F7', // Neon Purple
  secondary: '#FFD700', // Electric Gold
  accent: '#14B8A6', // Cyan Teal
  text: '#F8FAFC', // White Bone
  subtext: '#94A3B8', // Blue Gray
  muted: '#64748B', // Darker Gray
  border: 'rgba(255,255,255,0.1)',
  background: '#0F172A', // Deep Void
  surface: '#1E293B', // Surface
  inputBg: '#334155', // Input Background
  success: '#10b981',
  error: '#ef4444'
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

// --- TOAST SYSTEM ---
const ToastContext = React.createContext();
const useToast = () => React.useContext(ToastContext);

const Toast = ({ message, type, onHide }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true })
    ]).start(() => onHide());
  }, []);

  const bgColors = {
    success: 'rgba(16, 185, 129, 0.95)',
    error: 'rgba(239, 68, 68, 0.95)',
    info: 'rgba(59, 130, 246, 0.95)'
  };

  return (
    <Animated.View style={{
      position: 'absolute',
      top: 60,
      left: 20,
      right: 20,
      backgroundColor: bgColors[type] || bgColors.info,
      padding: 16,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
      opacity,
      zIndex: 9999,
      transform: [{ translateY: opacity.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }]
    }}>
      <Ionicons name={type === 'success' ? 'checkmark-circle' : type === 'error' ? 'alert-circle' : 'information-circle'} size={24} color="#fff" style={{ marginRight: 12 }} />
      <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15, flex: 1 }}>{message}</Text>
    </Animated.View>
  );
};

const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onHide={() => setToast(null)} />}
    </ToastContext.Provider>
  );
};

// --- VISUAL COMPONENTS ---
const DashboardChart = ({ data, title }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <View style={styles.card}>
      <Text style={styles.section}>{title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 150, gap: 8, paddingTop: 20 }}>
        {data.map((item, index) => (
          <View key={index} style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ 
              width: '100%', 
              height: `${(item.value / max) * 100}%`, 
              backgroundColor: index % 2 === 0 ? palette.primary : palette.secondary,
              borderRadius: 4,
              minHeight: 4
            }} />
            <Text style={{ color: palette.muted, fontSize: 10, marginTop: 4 }}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const QRCodePlaceholder = ({ value }) => {
  const seed = (value || 'SEED').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const blocks = Array.from({ length: 64 }).map((_, i) => (seed + i) % 3 !== 0);
  
  return (
    <View style={{ padding: 10, backgroundColor: '#fff', borderRadius: 8, alignSelf: 'center', marginVertical: 10 }}>
      <View style={{ width: 120, height: 120, flexDirection: 'row', flexWrap: 'wrap' }}>
        {blocks.map((filled, i) => (
          <View key={i} style={{ 
            width: '12.5%', 
            height: '12.5%', 
            backgroundColor: filled ? '#000' : '#fff' 
          }} />
        ))}
        <View style={{ position: 'absolute', top: 0, left: 0, width: 30, height: 30, borderWidth: 4, borderColor: '#000' }} />
        <View style={{ position: 'absolute', top: 0, right: 0, width: 30, height: 30, borderWidth: 4, borderColor: '#000' }} />
        <View style={{ position: 'absolute', bottom: 0, left: 0, width: 30, height: 30, borderWidth: 4, borderColor: '#000' }} />
      </View>
      <Text style={{ textAlign: 'center', color: '#000', fontSize: 10, marginTop: 4, fontWeight: '700' }}>{value}</Text>
    </View>
  );
};

function FilledButton({ title, onPress, disabled, loading, icon }) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress && onPress();
      }}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={{ width: '100%', borderRadius: 12, overflow: 'hidden', opacity: isDisabled ? 0.7 : 1 }}
    >
      <LinearGradient
        colors={['#7c3aed', '#4f46e5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14 }}
      >
        {loading ? <ActivityIndicator color="#fff" style={{ marginRight: 8 }} /> : icon ? <View style={{ marginRight: 8 }}>{icon}</View> : null}
        <Text style={[styles.buttonText, { fontSize: 16, letterSpacing: 0.5 }]}>{title}</Text>
      </LinearGradient>
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

const HeroBanner = ({ compact = false }) => (
  <View style={{ alignItems: 'center', paddingVertical: compact ? 10 : 20 }}>
    <Text style={{ 
      fontSize: compact ? 28 : 42, 
      fontWeight: '900', 
      color: palette.text, 
      letterSpacing: 2,
      textTransform: 'uppercase',
      textShadowColor: palette.primary,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 15
    }}>
      MEGA <Text style={{ color: palette.secondary }}>RIFAS</Text>
    </Text>
    {!compact && (
      <Text style={{ 
        color: palette.subtext, 
        fontSize: 14, 
        marginTop: 4, 
        letterSpacing: 1,
        fontWeight: '500'
      }}>
        PREMIUM EXPERIENCE
      </Text>
    )}
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
  const [showPassword, setShowPassword] = useState(false);
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
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || 'No se pudo iniciar sesión';
        throw new Error(msg);
      }

      if (data.require2FA) {
        setTwofaNeeded(true);
        setTwofaUserId(data.email);
        Alert.alert('Seguridad', 'Se ha enviado un código de seguridad a tu correo.');
        setLoading(false);
        return;
      }

      // Adaptar respuesta del backend simple al formato esperado por la App
      const token = data.token || data.accessToken;
      // SIMULACIÓN: Forzamos rol superadmin si el email es el del admin, para que el usuario vea los cambios
      const user = data.user || { 
        email: form.email, 
        name: 'Usuario', 
        role: form.email.includes('admin') ? 'superadmin' : 'user',
        firstName: 'Admin',
        lastName: 'User'
      }; 

      
      await onAuth(token, token, user, rememberMe);
      
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo registrar');
      
      Alert.alert('Registro exitoso', 'Revisa tu correo para el código de activación.');
      setVerifyEmail(form.email);
      setShowVerification(true);
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
      const res = await fetch(`${API_URL}/verify-email`, {
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
      const res = await fetch(`${API_URL}/auth/2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: twofaUserId, code: twofaCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Código incorrecto');
          await onAuth(data.token, data.token, data.user, rememberMe);
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
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <LinearGradient
        colors={[palette.background, '#1e1b4b', palette.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={[styles.scroll, { justifyContent: 'center' }]}>            
            <Animated.View style={{ opacity: heroAnim, transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
              <View style={{ marginBottom: 40 }}>
                <HeroBanner />
              </View>
            </Animated.View>
            <View style={[styles.card, { backgroundColor: 'rgba(30, 41, 59, 0.7)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 }]}>
              <TextInput
                style={[styles.input, { backgroundColor: palette.inputBg, borderColor: 'transparent' }]}
                placeholder="Email"
                autoCapitalize="none"
                autoComplete="off"
                textContentType="none"
                value={verifyEmail}
                onChangeText={setVerifyEmail}
                placeholderTextColor={palette.muted}
              />
              <TextInput
                style={[styles.input, { backgroundColor: palette.inputBg, borderColor: 'transparent' }]}
                placeholder="Código de 6 dígitos"
                keyboardType="numeric"
                value={verifyCode}
                onChangeText={setVerifyCode}
                placeholderTextColor={palette.muted}
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
      </LinearGradient>
    </SafeAreaView>
  );

  const renderLogin = () => (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <LinearGradient
        colors={[palette.background, '#1e1b4b', palette.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={[styles.scroll, { justifyContent: 'center', minHeight: '100%' }]}>            
            <Animated.View style={{ opacity: heroAnim, transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }}>
              <View style={{ marginBottom: 40 }}>
                <HeroBanner />
                <Text style={{ color: 'red', textAlign: 'center', fontSize: 20, fontWeight: 'bold' }}>DEBUG: V2 - CAMBIOS CARGADOS</Text>
              </View>
            </Animated.View>

            {mode === 'login' ? (
              <View style={[styles.card, { backgroundColor: 'rgba(30, 41, 59, 0.7)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 }]}>
                <TextInput
                  style={[styles.input, { backgroundColor: palette.inputBg, borderColor: 'transparent' }]}
                  placeholder="Correo electrónico"
                  autoCapitalize="none"
                  autoComplete="off"
                  textContentType="emailAddress"
                  value={form.email}
                  onChangeText={(v) => handleChange('email', v)}
                  placeholderTextColor={palette.muted}
                />
                <View style={{ position: 'relative' }}>
                  <TextInput
                    style={[styles.input, { backgroundColor: palette.inputBg, borderColor: 'transparent', paddingRight: 50 }]}
                    placeholder="Contraseña"
                    secureTextEntry={!showPassword}
                    autoComplete="off"
                    textContentType="password"
                    value={form.password}
                    onChangeText={(v) => handleChange('password', v)}
                    placeholderTextColor={palette.muted}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 14, top: 14 }}
                  >
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color="#cbd5e1" />
                  </TouchableOpacity>
                </View>

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
                <View style={{ marginBottom: 20, alignItems: 'center' }}>
                  <LinearGradient
                    colors={['#4f46e5', '#7c3aed']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: '100%',
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.2)',
                      shadowColor: '#000',
                      shadowOpacity: 0.3,
                      shadowRadius: 10,
                      shadowOffset: { width: 0, height: 5 },
                      elevation: 8
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View>
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>MEMBER ID</Text>
                        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 4 }}>
                          {form.firstName || 'NOMBRE'} {form.lastName || 'APELLIDO'}
                        </Text>
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 2 }}>
                          C.I: {form.cedula || '00000000'}
                        </Text>
                      </View>
                      <Ionicons name="qr-code-outline" size={40} color="rgba(255,255,255,0.5)" />
                    </View>
                    <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <View>
                        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: '700' }}>VALIDO PARA</Text>
                        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>TODOS LOS SORTEOS</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: '#fbbf24', fontSize: 10, fontWeight: '800' }}>PREMIUM ACCESS</Text>
                      </View>
                    </View>
                  </LinearGradient>
                  <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 8, textAlign: 'center' }}>
                    Esta información aparecerá en tus tickets de compra.
                  </Text>
                </View>

                <Text style={{ color: '#e2e8f0', fontSize: 14, fontWeight: '700', marginBottom: 10, marginTop: 4 }}>Datos de Acceso</Text>
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
                <View style={{ position: 'relative' }}>
                  <TextInput
                    style={[styles.input, styles.inputSoft, { paddingRight: 50 }]}
                    placeholder="Contraseña"
                    secureTextEntry={!showPassword}
                    autoComplete="off"
                    textContentType="password"
                    value={form.password}
                    onChangeText={(v) => handleChange('password', v)}
                    placeholderTextColor="#cbd5e1"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 14, top: 14 }}
                  >
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color="#cbd5e1" />
                  </TouchableOpacity>
                </View>

                <Text style={{ color: '#e2e8f0', fontSize: 14, fontWeight: '700', marginBottom: 10, marginTop: 10 }}>Información Personal</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TextInput style={[styles.input, styles.inputSoft, { flex: 1 }]} placeholder="Nombre" value={form.firstName} onChangeText={(v) => handleChange('firstName', v)} placeholderTextColor="#cbd5e1" />
                  <TextInput style={[styles.input, styles.inputSoft, { flex: 1 }]} placeholder="Apellido" value={form.lastName} onChangeText={(v) => handleChange('lastName', v)} placeholderTextColor="#cbd5e1" />
                </View>
                <TextInput style={[styles.input, styles.inputSoft]} placeholder="Cédula de Identidad" value={form.cedula} onChangeText={(v) => handleChange('cedula', v)} keyboardType="numeric" placeholderTextColor="#cbd5e1" />
                <TextInput style={[styles.input, styles.inputSoft]} placeholder="Fecha de nacimiento (YYYY-MM-DD)" value={form.dob} onChangeText={(v) => handleChange('dob', v)} placeholderTextColor="#cbd5e1" />
                
                <Text style={{ color: '#e2e8f0', fontSize: 14, fontWeight: '700', marginBottom: 10, marginTop: 10 }}>Contacto</Text>
                <TextInput style={[styles.input, styles.inputSoft]} placeholder="Teléfono Móvil" value={form.phone} onChangeText={(v) => handleChange('phone', v)} keyboardType="phone-pad" placeholderTextColor="#cbd5e1" />
                <TextInput style={[styles.input, styles.inputSoft]} placeholder="Dirección de Habitación" value={form.address} onChangeText={(v) => handleChange('address', v)} placeholderTextColor="#cbd5e1" />
                
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <View style={{ marginTop: 12 }}>
                  <FilledButton
                    title={loading ? 'Creando perfil...' : 'Generar mi ID de Jugador'}
                    onPress={submit}
                    disabled={loading}
                    icon={<Ionicons name="card-outline" size={18} color="#fff" />}
                  />
                </View>
                <View style={styles.linksRow}>
                  <TouchableOpacity onPress={() => setMode('login')} style={styles.linkItem}>
                    <Ionicons name="log-in-outline" size={16} color="#e2e8f0" />
                    <Text style={styles.link}>Ya tengo cuenta</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <View style={{ marginTop: 40, alignItems: 'center', paddingBottom: 20 }}>
              <Text style={{ color: palette.muted, fontSize: 12, fontWeight: '600' }}>Desarrollado por Quantic Solution C.A.</Text>
              <Text style={{ color: palette.muted, fontSize: 10, marginTop: 2, opacity: 0.7 }}>RIF-j408537010</Text>
              <Text style={{ color: palette.muted, fontSize: 10, marginTop: 2, opacity: 0.5 }}>v1.0.0</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );

  const renderRecovery = () => (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <LinearGradient
        colors={[palette.background, '#1e1b4b', palette.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={[styles.scroll, { justifyContent: 'center', minHeight: '100%' }]}>            
            <Animated.View style={{ opacity: heroAnim, transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
              <Text style={styles.heroTitle}>Recupera tu acceso</Text>
              <Text style={styles.heroTagline}>Enviamos un enlace seguro a tu correo.</Text>
            </Animated.View>
            <View style={[styles.card, { backgroundColor: 'rgba(30, 41, 59, 0.7)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 }]}>
              <TextInput
                style={[styles.input, { backgroundColor: palette.inputBg, borderColor: 'transparent' }]}
                placeholder="Correo registrado"
                autoCapitalize="none"
                autoComplete="off"
                textContentType="none"
                value={recoveryEmail}
                onChangeText={setRecoveryEmail}
                placeholderTextColor={palette.muted}
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
                <Ionicons name="arrow-back-outline" size={16} color={palette.text} />
                <Text style={styles.link}>Volver a iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );

  const renderTwofa = () => (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <LinearGradient
        colors={[palette.background, '#1e1b4b', palette.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={[styles.scroll, { justifyContent: 'center' }]}>            
            <View style={[styles.card, { backgroundColor: 'rgba(30, 41, 59, 0.7)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 }]}>
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <Ionicons name="shield-checkmark" size={48} color={palette.secondary} />
                <Text style={{ color: palette.text, fontSize: 20, fontWeight: 'bold', marginTop: 10 }}>Verificación de Seguridad</Text>
                <Text style={{ color: palette.subtext, textAlign: 'center', marginTop: 5 }}>
                  Hemos enviado un código a tu correo de administrador.
                </Text>
              </View>
              <TextInput
                style={[styles.input, { backgroundColor: palette.inputBg, borderColor: 'transparent', textAlign: 'center', fontSize: 24, letterSpacing: 5 }]}
                placeholder="000000"
                keyboardType="numeric"
                maxLength={6}
                value={twofaCode}
                onChangeText={setTwofaCode}
                placeholderTextColor={palette.muted}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <FilledButton
                title={loading ? 'Verificando...' : 'Verificar Acceso'}
                onPress={verify2fa}
                disabled={loading}
                icon={<Ionicons name="lock-open-outline" size={18} color="#fff" />}
              />
              <TouchableOpacity
                onPress={() => {
                  setTwofaNeeded(false);
                  setTwofaCode('');
                  setError('');
                }}
                style={{ marginTop: 16, alignItems: 'center' }}
              >
                <Text style={styles.link}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );

  if (twofaNeeded) return renderTwofa();
  if (showVerification) return renderVerification();
  if (showRecovery) return renderRecovery();
  return renderLogin();
}

      function CreateRaffleCard({ api, onCreated }) {
        const [title, setTitle] = useState('');
        const [price, setPrice] = useState('');
        const [description, setDescription] = useState('');
        const [lottery, setLottery] = useState('');
        const [showLotteryModal, setShowLotteryModal] = useState(false);
        const [creating, setCreating] = useState(false);

        const LOTTERIES = [
          'Super Gana (Lotería del Táchira)',
          'Triple Táchira',
          'Triple Zulia',
          'Triple Caracas',
          'Triple Caliente',
          'Triple Zamorano',
          'La Ricachona',
          'La Ruca',
          'El Terminalito / La Granjita'
        ];

        const create = async () => {
          if (!title || !price || !lottery) return Alert.alert('Faltan datos', 'Ingresa titulo, precio y selecciona una lotería.');
          const priceNumber = Number(price);
          if (Number.isNaN(priceNumber) || priceNumber <= 0) return Alert.alert('Precio invalido', 'El precio debe ser mayor a 0.');
          setCreating(true);
          const { res, data } = await api('/raffles', {
            method: 'POST',
            body: JSON.stringify({ title, ticketPrice: priceNumber, description, lottery })
          });
          if (res.ok) {
            Alert.alert('Listo', 'Rifa creada correctamente.');
            setTitle('');
            setPrice('');
            setDescription('');
            setLottery('');
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
            
            <TouchableOpacity onPress={() => setShowLotteryModal(true)} style={[styles.input, { justifyContent: 'center' }]}>
               <Text style={{ color: lottery ? '#fff' : '#94a3b8' }}>{lottery || 'Seleccionar Lotería'}</Text>
               <Ionicons name="chevron-down-outline" size={20} color="#94a3b8" style={{ position: 'absolute', right: 12 }} />
            </TouchableOpacity>

            <Modal visible={showLotteryModal} transparent animationType="fade">
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 }}>
                <View style={{ backgroundColor: '#1e293b', borderRadius: 16, padding: 20, maxHeight: '80%' }}>
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>Selecciona una Lotería</Text>
                  <ScrollView>
                    {LOTTERIES.map((l) => (
                      <TouchableOpacity key={l} onPress={() => { setLottery(l); setShowLotteryModal(false); }} style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Ionicons name="ticket-outline" size={18} color="#fbbf24" />
                        <Text style={{ color: '#e2e8f0', fontSize: 16 }}>{l}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity onPress={() => setShowLotteryModal(false)} style={{ marginTop: 16, alignItems: 'center', padding: 10 }}>
                    <Text style={{ color: '#f472b6', fontWeight: 'bold' }}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

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

      function PublicProfileModal({ visible, onClose, userId, api }) {
        const [profile, setProfile] = useState(null);
        const [loading, setLoading] = useState(false);

        useEffect(() => {
          if (visible && userId) {
            setLoading(true);
            api(`/users/public/${userId}`).then(({ res, data }) => {
              if (res.ok) setProfile(data);
              setLoading(false);
            });
          } else {
            setProfile(null);
          }
        }, [visible, userId]);

        return (
          <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 }}>
              <View style={[styles.card, { backgroundColor: palette.background, maxHeight: '80%' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close" size={24} color={palette.text} />
                  </TouchableOpacity>
                </View>
                {loading ? (
                  <ActivityIndicator color={palette.primary} size="large" />
                ) : profile ? (
                  <ScrollView>
                    <View style={{ alignItems: 'center', marginBottom: 16 }}>
                      {profile.avatar ? (
                        <Image source={{ uri: profile.avatar }} style={{ width: 100, height: 100, borderRadius: 50 }} />
                      ) : (
                        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' }}>
                          <Ionicons name="person" size={48} color={palette.muted} />
                        </View>
                      )}
                      <Text style={[styles.title, { marginTop: 12 }]}>{profile.name}</Text>
                      {profile.verified && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16,185,129,0.1)', padding: 4, borderRadius: 4, marginTop: 4 }}>
                          <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                          <Text style={{ color: '#10b981', fontSize: 12, fontWeight: 'bold' }}>Verificado</Text>
                        </View>
                      )}
                      <Text style={styles.muted}>{profile.role === 'admin' || profile.role === 'superadmin' ? 'Administrador' : 'Usuario'}</Text>
                    </View>

                    {profile.bio && <Text style={{ color: palette.text, textAlign: 'center', marginBottom: 16 }}>{profile.bio}</Text>}

                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
                      {profile.stats ? (
                        <>
                          <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: palette.primary, fontWeight: 'bold', fontSize: 18 }}>{profile.stats.raffles || 0}</Text>
                            <Text style={styles.muted}>Rifas</Text>
                          </View>
                          <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: palette.primary, fontWeight: 'bold', fontSize: 18 }}>{profile.stats.prizes || 0}</Text>
                            <Text style={styles.muted}>Premios</Text>
                          </View>
                        </>
                      ) : (
                        <>
                          <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: palette.primary, fontWeight: 'bold', fontSize: 18 }}>{profile._count?.tickets || 0}</Text>
                            <Text style={styles.muted}>Tickets</Text>
                          </View>
                          <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: palette.primary, fontWeight: 'bold', fontSize: 18 }}>{profile._count?.announcements || 0}</Text>
                            <Text style={styles.muted}>Anuncios</Text>
                          </View>
                        </>
                      )}
                    </View>

                    {profile.socials && (
                      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
                        {profile.socials.whatsapp && (
                          <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${profile.socials.whatsapp}`)}>
                            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                          </TouchableOpacity>
                        )}
                        {profile.socials.instagram && (
                          <TouchableOpacity onPress={() => Linking.openURL(`https://instagram.com/${profile.socials.instagram}`)}>
                            <Ionicons name="logo-instagram" size={24} color="#E1306C" />
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </ScrollView>
                ) : (
                  <Text style={{ color: palette.text, textAlign: 'center' }}>No se pudo cargar el perfil.</Text>
                )}
              </View>
            </View>
          </Modal>
        );
      }

      function Announcements({ api, onShowProfile }) {
        const [items, setItems] = useState([]);
        const [loading, setLoading] = useState(false);

        const load = useCallback(async () => {
          setLoading(true);
          const { res, data } = await api('/announcements');
          if (res.ok) setItems(data);
          setLoading(false);
        }, [api]);

        useFocusEffect(useCallback(() => { load(); }, [load]));

        const react = async (id, type) => {
          const { res, data } = await api(`/announcements/${id}/react`, { method: 'POST', body: JSON.stringify({ type }) });
          if (res.ok) load(); 
        };

        if (loading && !items.length) return <ActivityIndicator color={palette.primary} />;

        return (
          <View>
            <Text style={styles.section}>Novedades</Text>
            {items.map(item => (
              <View key={item.id} style={[styles.card, { marginBottom: 12 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <TouchableOpacity onPress={() => onShowProfile(item.adminId)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {item.admin?.avatar ? (
                      <Image source={{ uri: item.admin.avatar }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} />
                    ) : (
                      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: palette.surface, marginRight: 8 }} />
                    )}
                    <View>
                      <Text style={{ color: palette.text, fontWeight: 'bold' }}>{item.admin?.name || 'Admin'}</Text>
                      <Text style={{ color: palette.muted, fontSize: 10 }}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
                
                <Text style={{ color: palette.text, fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>{item.title}</Text>
                <Text style={{ color: palette.subtext, marginBottom: 8 }}>{item.content}</Text>
                
                {item.imageUrl && (
                  <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: 150, borderRadius: 8, marginBottom: 8 }} resizeMode="cover" />
                )}

                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <TouchableOpacity onPress={() => react(item.id, 'LIKE')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="thumbs-up-outline" size={18} color={palette.muted} />
                    <Text style={styles.muted}>{item._count?.reactions || 0}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => react(item.id, 'HEART')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="heart-outline" size={18} color={palette.muted} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      }

      function WinnersScreen({ api }) {
        const [winners, setWinners] = useState([]);
        const [loading, setLoading] = useState(false);

        const load = useCallback(async () => {
          setLoading(true);
          const { res, data } = await api('/winners');
          if (res.ok) setWinners(data);
          setLoading(false);
        }, [api]);

        useFocusEffect(useCallback(() => { load(); }, [load]));

        return (
          <SafeAreaView style={{ flex: 1 }}>
            <LinearGradient
              colors={[palette.background, '#0f172a', '#1e1b4b']}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
            <ScrollView contentContainerStyle={styles.scroll}>
              <Text style={styles.title}>Muro de la Fama 🏆</Text>
              <Text style={styles.muted}>Nuestros ganadores reales y felices.</Text>
              
              {loading ? (
                <ActivityIndicator color={palette.primary} style={{ marginTop: 20 }} />
              ) : (
                <View style={{ marginTop: 16 }}>
                  {winners.map((w) => (
                    <View key={w.id} style={[styles.card, { marginBottom: 16 }]}>
                      {w.photoUrl ? (
                        <Image source={{ uri: w.photoUrl }} style={{ width: '100%', height: 250, borderRadius: 12, marginBottom: 12 }} resizeMode="cover" />
                      ) : null}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        {w.user?.avatar ? (
                          <Image source={{ uri: w.user.avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                        ) : (
                          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="person" size={20} color={palette.muted} />
                          </View>
                        )}
                        <View>
                          <Text style={styles.itemTitle}>{w.user?.name || 'Ganador'}</Text>
                          <Text style={styles.muted}>{new Date(w.drawDate).toLocaleDateString()}</Text>
                        </View>
                      </View>
                      <Text style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>Premio: {w.prize || w.raffle?.title}</Text>
                      {w.testimonial ? (
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8 }}>
                          <Text style={{ color: palette.text, fontStyle: 'italic' }}>"{w.testimonial}"</Text>
                        </View>
                      ) : null}
                    </View>
                  ))}
                  {winners.length === 0 && <Text style={styles.muted}>Aún no hay ganadores registrados.</Text>}
                </View>
              )}
            </ScrollView>
            </LinearGradient>
          </SafeAreaView>
        );
      }

      function RafflesHomeScreen({ navigation, api }) {
        const [raffles, setRaffles] = useState([]);
        const [loading, setLoading] = useState(false);
        const [supportVisible, setSupportVisible] = useState(false);
        const [supportMessage, setSupportMessage] = useState('');
        const [viewProfileId, setViewProfileId] = useState(null);
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
          <SafeAreaView style={{ flex: 1 }}>
            <LinearGradient
              colors={[palette.background, '#0f172a', '#1e1b4b']}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
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
                <View style={{ marginBottom: 16, borderRadius: 16, overflow: 'hidden' }}>
                  <HeroBanner compact />
                </View>

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

              <Announcements api={api} onShowProfile={setViewProfileId} />

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
                            {item.organizerId ? (
                              <TouchableOpacity onPress={() => setViewProfileId(item.creatorId || item.organizerId)}>
                                <Text style={[styles.muted, { textDecorationLine: 'underline', color: palette.accent }]}>
                                  Organizador: {item.organizerId}
                                </Text>
                              </TouchableOpacity>
                            ) : null}
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
            <PublicProfileModal visible={!!viewProfileId} userId={viewProfileId} onClose={() => setViewProfileId(null)} api={api} />
            </LinearGradient>
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
        const [bankDetails, setBankDetails] = useState(null);
        const stats = current?.stats || {};
        const style = current?.style || {};
        const themeColor = style.themeColor || palette.primary;
        const [viewProfileId, setViewProfileId] = useState(null);

        useEffect(() => {
          api('/admin/bank-details').then(({ res, data }) => {
            if (res.ok && data.bankDetails) setBankDetails(data.bankDetails);
          });
        }, []);

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
              {style.bannerImage ? (
                <Image source={{ uri: style.bannerImage }} style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 16 }} resizeMode="cover" />
              ) : null}
              
              <Text style={[styles.title, { color: themeColor }]}>{current.title}</Text>
              
              {style.terms ? (
                <View style={[styles.card, { borderColor: themeColor, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.02)' }]}>
                  <Text style={[styles.section, { color: themeColor }]}>Información Importante</Text>
                  <Text style={styles.muted}>{style.terms}</Text>
                </View>
              ) : null}

              <View style={styles.card}>
                {current.organizerId ? (
                  <TouchableOpacity onPress={() => setViewProfileId(current.creatorId || current.organizerId)}>
                    <Text style={[styles.muted, { textDecorationLine: 'underline', color: palette.accent }]}>
                      Organizador: {current.organizerId}
                    </Text>
                  </TouchableOpacity>
                ) : null}
                <Text style={styles.muted}>
                  Precio VES {current.price} • Vendidos {stats.sold || 0} • Disponibles {stats.remaining ?? 0}
                </Text>
                
                {(style.whatsapp || style.instagram || current.support) && (
                  <View style={{ marginTop: 8, flexDirection: 'row', gap: 10 }}>
                    {style.whatsapp ? (
                      <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${style.whatsapp}`)} style={[styles.pill, { backgroundColor: '#25D366' }]}>
                        <Ionicons name="logo-whatsapp" size={16} color="#fff" />
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>WhatsApp</Text>
                      </TouchableOpacity>
                    ) : null}
                    {style.instagram ? (
                      <TouchableOpacity onPress={() => Linking.openURL(`https://instagram.com/${style.instagram}`)} style={[styles.pill, { backgroundColor: '#E1306C' }]}>
                        <Ionicons name="logo-instagram" size={16} color="#fff" />
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Instagram</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                )}

                <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholder="Cantidad (Aleatoria)" />

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <OutlineButton title={buying ? 'Procesando...' : 'Comprar con Saldo'} onPress={purchase} disabled={buying} icon={<Ionicons name="wallet-outline" size={18} color={themeColor} />} />
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.sectionRow}>
                  <Text style={[styles.section, { color: themeColor }]}>Pago móvil guiado</Text>
                  <TouchableOpacity onPress={() => setSupportVisible(true)} style={[styles.pill, { backgroundColor: 'rgba(34,211,238,0.14)' }]}> 
                    <Ionicons name="help-circle-outline" size={16} color={palette.accent} />
                    <Text style={{ color: palette.text, fontWeight: '700' }}>Ayuda</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.muted}>2 pasos: completa datos y sube comprobante. Asignamos números aleatorios 1-10000 tras validar.</Text>
                
                {bankDetails && (
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, marginVertical: 8 }}>
                    <Text style={{ color: '#fbbf24', fontWeight: 'bold', marginBottom: 4 }}>Datos para el pago:</Text>
                    <Text style={styles.muted}>Banco: <Text style={{ color: '#fff' }}>{bankDetails.bank}</Text></Text>
                    <Text style={styles.muted}>Teléfono: <Text style={{ color: '#fff' }}>{bankDetails.phone}</Text></Text>
                    <Text style={styles.muted}>Cédula: <Text style={{ color: '#fff' }}>{bankDetails.cedula}</Text></Text>
                    {bankDetails.type && <Text style={styles.muted}>Tipo: <Text style={{ color: '#fff' }}>{bankDetails.type}</Text></Text>}
                    {bankDetails.account && <Text style={styles.muted}>Cuenta: <Text style={{ color: '#fff' }}>{bankDetails.account}</Text></Text>}
                  </View>
                )}

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
                    <TextInput style={styles.input} value={manualRef} onChangeText={setManualRef} placeholder="Referencia (últimos 4 dígitos)" />
                    <TextInput style={styles.input} value={manualNote} onChangeText={setManualNote} placeholder="Nota (opcional)" />
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
                    <Text style={[styles.muted, { fontSize: 12, color: '#fbbf24', marginVertical: 4 }]}>
                      ⚠️ Importante: La captura debe mostrar claramente la FECHA y la REFERENCIA del pago.
                    </Text>
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
                  <TouchableOpacity 
                    style={[styles.button, { backgroundColor: '#25D366', marginTop: 12 }]}
                    onPress={() => Linking.openURL(`https://wa.me/${current.support?.whatsapp || ''}?text=Hola, ya tengo mis tickets para la rifa ${current.title}: ${assignedNumbers.map(formatTicketNumber).join(', ')}`)}
                  >
                    <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                    <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 8 }}>Confirmar por WhatsApp</Text>
                  </TouchableOpacity>
                </Animated.View>
              ) : null}
            </ScrollView>
            <PublicProfileModal visible={!!viewProfileId} userId={viewProfileId} onClose={() => setViewProfileId(null)} api={api} />
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
          <SafeAreaView style={{ flex: 1 }}>
            <LinearGradient
              colors={[palette.background, '#0f172a', '#1e1b4b']}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
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
                        <QRCodePlaceholder value={item.serialNumber || `TICKET-${item.id || '000'}`} />
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
            </LinearGradient>
          </SafeAreaView>
        );
      }

      function ProfileScreen({ api, onUserUpdate, pushToken, setPushToken }) {
        const [profile, setProfile] = useState(null);
        const [loading, setLoading] = useState(false);
        const [tickets, setTickets] = useState([]);
        const [payments, setPayments] = useState([]);
        const [saving, setSaving] = useState(false);
        const [passwordForm, setPasswordForm] = useState({ current: '', new: '' });
        const [changingPassword, setChangingPassword] = useState(false);
        const [showPassword, setShowPassword] = useState(false);

        const achievements = useMemo(() => {
          if (!profile) return [];
          const list = [];
          if (tickets.length > 0) list.push({ id: 'ach1', label: 'Explorador', icon: 'planet' });
          if (tickets.length >= 5) list.push({ id: 'ach2', label: 'Jugador fiel', icon: 'sparkles' });
          if (profile.referrals?.length >= 5) list.push({ id: 'ach3', label: 'Influencer', icon: 'people' });
          if (payments.reduce((acc, p) => acc + (p.amount || 0), 0) > 100) list.push({ id: 'ach4', label: 'Magnate', icon: 'diamond' });
          return list;
        }, [profile, tickets, payments]);

        const load = useCallback(async () => {
          setLoading(true);
          const [{ res: r1, data: d1 }, { res: r2, data: d2 }, { res: r3, data: d3 }, { res: r4, data: d4 }] = await Promise.all([
            api('/me'),
            api('/me/tickets'),
            api('/me/payments'),
            api('/me/referrals')
          ]);
          if (r1.ok) {
            // Merge referral data if available
            const user = d1;
            if (r4.ok) {
              user.referrals = d4.referrals;
              user.referralCode = d4.code;
            }
            setProfile(user);
          }
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
            body: JSON.stringify({ 
              phone: profile.phone, 
              address: profile.address, 
              avatar: profile.avatar,
              socials: profile.socials 
            })
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

        const changePassword = async () => {
          if (!passwordForm.current || !passwordForm.new) return Alert.alert('Faltan datos', 'Ingresa ambas contraseñas.');
          setChangingPassword(true);
          const { res, data } = await api('/me/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword: passwordForm.current, newPassword: passwordForm.new })
          });
          if (res.ok) {
            Alert.alert('Éxito', 'Contraseña actualizada.');
            setPasswordForm({ current: '', new: '' });
            setShowPassword(false);
          } else {
            Alert.alert('Error', data.error || 'No se pudo cambiar la contraseña.');
          }
          setChangingPassword(false);
        };

        const showReceipt = (item) => {
          Alert.alert(
            'Recibo',
            `Rifa: ${item.raffleTitle || ''}\nTicket: ${item.number ? formatTicketNumber(item.number) : '—'}\nSerial: ${item.serialNumber || '—'}\nEstado: ${item.status}\nFecha: ${item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}\nVía: ${item.via || ''}`
          );
        };

        return (
          <SafeAreaView style={{ flex: 1 }}>
            <LinearGradient
              colors={[palette.background, '#0f172a', '#1e1b4b']}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
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
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.itemTitle}>{profile.firstName} {profile.lastName}</Text>
                        {profile.verified && <Ionicons name="checkmark-circle" size={18} color="#3b82f6" />}
                      </View>
                      <Text style={styles.muted}>{profile.email}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginVertical: 4 }}>
                        <Ionicons name="id-card-outline" size={14} color="#fbbf24" />
                        <Text style={{ color: '#fbbf24', fontWeight: '700', fontSize: 12 }}>ID: {profile.publicId || '—'}</Text>
                      </View>
                      <View style={styles.pillRow}>
                        <Text style={styles.ghostPill}>Nivel seguro</Text>
                        {tickets.length > 0 && <Text style={[styles.ghostPill, { backgroundColor: 'rgba(34,211,238,0.15)' }]}>+ Tickets</Text>}
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
                    <Text style={[styles.muted, { marginTop: 8 }]}>Redes Sociales (Opcional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Instagram (Usuario)"
                      value={profile.socials?.instagram || ''}
                      onChangeText={(v) => setProfile((p) => ({ ...p, socials: { ...p.socials, instagram: v } }))}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Facebook (Enlace o Usuario)"
                      value={profile.socials?.facebook || ''}
                      onChangeText={(v) => setProfile((p) => ({ ...p, socials: { ...p.socials, facebook: v } }))}
                    />
                    <FilledButton title={saving ? 'Guardando...' : 'Guardar cambios'} onPress={saveProfile} loading={saving} disabled={saving} icon={<Ionicons name="save-outline" size={18} color="#fff" />} />
                  </View>

                  <View style={[styles.card, styles.glassCard]}>
                    <TouchableOpacity style={styles.rowBetween} onPress={() => setShowPassword(!showPassword)}>
                      <Text style={styles.section}>Seguridad</Text>
                      <Ionicons name={showPassword ? "chevron-up" : "chevron-down"} size={20} color={palette.text} />
                    </TouchableOpacity>
                    
                    {showPassword && (
                      <View style={{ marginTop: 12 }}>
                        <Text style={styles.muted}>Cambiar contraseña</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Contraseña actual"
                          secureTextEntry
                          value={passwordForm.current}
                          onChangeText={(v) => setPasswordForm(s => ({ ...s, current: v }))}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Nueva contraseña"
                          secureTextEntry
                          value={passwordForm.new}
                          onChangeText={(v) => setPasswordForm(s => ({ ...s, new: v }))}
                        />
                        <FilledButton 
                          title={changingPassword ? 'Actualizando...' : 'Actualizar contraseña'} 
                          onPress={changePassword} 
                          loading={changingPassword} 
                          disabled={changingPassword}
                          icon={<Ionicons name="lock-closed-outline" size={18} color="#fff" />}
                        />
                      </View>
                    )}
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
                    <Text style={styles.section}>Invita y Gana</Text>
                    <Text style={styles.muted}>Comparte tu código con amigos. Ambos ganan beneficios.</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 8 }}>
                      <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 8, alignItems: 'center' }}>
                        <Text style={{ color: '#fbbf24', fontWeight: '900', fontSize: 18, letterSpacing: 2 }}>{profile.referralCode || 'Cargando...'}</Text>
                      </View>
                      <TouchableOpacity 
                        style={[styles.button, { width: 50, height: 50, padding: 0, justifyContent: 'center', alignItems: 'center' }]}
                        onPress={() => {
                          if (profile.referralCode) {
                            Clipboard.setStringAsync(profile.referralCode);
                            Alert.alert('Copiado', 'Código copiado al portapapeles.');
                          }
                        }}
                      >
                        <Ionicons name="copy-outline" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.muted}>Referidos: {profile.referrals?.length || 0}</Text>
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
                        <Text style={[styles.muted, { fontSize: 10, color: '#94a3b8' }]}>Serial: {item.serialNumber || '—'}</Text>
                        <Text style={styles.muted}>Fecha: {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}</Text>
                        <Text style={styles.link}>Ver recibo</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={[styles.card, styles.glassCard]}>
                    <Text style={styles.section}>Logros</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                      {achievements.length === 0 ? <Text style={styles.muted}>Aún no tienes logros. ¡Participa para ganar!</Text> : null}
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
            </LinearGradient>
          </SafeAreaView>
        );
      }

      function WalletScreen({ api }) {
        const [refreshing, setRefreshing] = useState(false);
        const [balance, setBalance] = useState(0);
        const [movements, setMovements] = useState([]);
        const [topupAmount, setTopupAmount] = useState('');
        const [showTopup, setShowTopup] = useState(false);
        const { showToast } = useToast();

        const chartData = [140, 90, 180, 80, 160, 120];

        const loadWallet = useCallback(async () => {
          setRefreshing(true);
          const { res, data } = await api('/wallet');
          if (res.ok) {
            setBalance(data.balance || 0);
            setMovements(data.transactions || []);
          }
          setRefreshing(false);
        }, [api]);

        const handleTopup = async () => {
          if (!topupAmount || isNaN(topupAmount) || Number(topupAmount) <= 0) {
            return showToast('Monto inválido', 'error');
          }
          const { res, data } = await api('/wallet/topup', {
            method: 'POST',
            body: JSON.stringify({ amount: topupAmount })
          });
          if (res.ok) {
            showToast('Recarga exitosa', 'success');
            setTopupAmount('');
            setShowTopup(false);
            loadWallet();
          } else {
            showToast(data.error || 'Error al recargar', 'error');
          }
        };

        useFocusEffect(
          useCallback(() => {
            loadWallet();
          }, [loadWallet])
        );

        return (
          <SafeAreaView style={{ flex: 1 }}>
            <LinearGradient
              colors={[palette.background, '#0f172a', '#1e1b4b']}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
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
                  <TouchableOpacity style={styles.ctaButtonPrimary} onPress={() => setShowTopup(!showTopup)} activeOpacity={0.9}>
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

                {showTopup && (
                  <View style={{ marginTop: 16, backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12 }}>
                    <Text style={{ color: '#e2e8f0', marginBottom: 8, fontWeight: '700' }}>Monto a recargar (VES)</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TextInput 
                        style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                        placeholder="0.00" 
                        keyboardType="numeric"
                        value={topupAmount}
                        onChangeText={setTopupAmount}
                      />
                      <TouchableOpacity onPress={handleTopup} style={{ backgroundColor: '#10b981', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' }}>
                        <Ionicons name="checkmark" size={24} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                  <View style={styles.statTile}> 
                    <Text style={styles.statLabel}>Ingresos</Text>
                    <Text style={styles.statValue}>VES {movements.filter(m => m.type === 'deposit').reduce((acc, m) => acc + m.amount, 0).toFixed(0)}</Text>
                  </View>
                  <View style={styles.statTile}> 
                    <Text style={styles.statLabel}>Gastos</Text>
                    <Text style={[styles.statValue, { color: '#f97316' }]}>VES {Math.abs(movements.filter(m => m.type === 'purchase').reduce((acc, m) => acc + m.amount, 0)).toFixed(0)}</Text>
                  </View>
                  <View style={styles.statTile}> 
                    <Text style={styles.statLabel}>Tickets</Text>
                    <Text style={styles.statValue}>{movements.filter(m => m.type === 'purchase').length}</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.card, styles.glassCard]}>
                <Text style={styles.section}>Actividad Reciente</Text>
                <View style={{ marginTop: 8 }}>
                  {movements.length === 0 ? (
                    <Text style={styles.muted}>No hay movimientos recientes.</Text>
                  ) : (
                    movements.map((m) => (
                      <View key={m.id} style={styles.movementRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <View style={[styles.movementBadge, { backgroundColor: m.type === 'deposit' ? 'rgba(16,185,129,0.15)' : 'rgba(248,113,113,0.15)', borderColor: m.type === 'deposit' ? 'rgba(16,185,129,0.35)' : 'rgba(248,113,113,0.35)' }]}> 
                            <Ionicons name={m.type === 'deposit' ? 'arrow-up' : 'arrow-down'} size={16} color={m.type === 'deposit' ? '#10b981' : '#f87171'} />
                          </View>
                          <View>
                            <Text style={styles.itemTitle}>{m.reference || (m.type === 'deposit' ? 'Recarga' : 'Compra')}</Text>
                            <Text style={styles.muted}>{new Date(m.createdAt).toLocaleDateString()} · {m.type === 'deposit' ? 'Entrada' : 'Salida'}</Text>
                          </View>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{ color: m.type === 'deposit' ? '#10b981' : '#f87171', fontWeight: '800' }}>{m.type === 'deposit' ? '+' : ''}VES {m.amount.toFixed(2)}</Text>
                          <Text style={[styles.statusPill, m.status === 'approved' ? styles.statusApproved : m.status === 'pending' ? styles.statusPending : styles.statusRejected]}>{m.status}</Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>
            </ScrollView>
            </LinearGradient>
          </SafeAreaView>
        );
      }

function AdminScreen({ api }) {
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [actingId, setActingId] = useState(null);
  const [styleForm, setStyleForm] = useState({ raffleId: null, bannerImage: '', themeColor: '#2563eb', terms: '', whatsapp: '', instagram: '' });
  const [savingStyle, setSavingStyle] = useState(false);
  const [styleLoading, setStyleLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [raffles, setRaffles] = useState([]);
  const [selectedRaffle, setSelectedRaffle] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketFilters, setTicketFilters] = useState({ raffleId: '', status: '', from: '', to: '' });
  const [raffleForm, setRaffleForm] = useState({ id: null, title: '', price: '', description: '', totalTickets: '', startDate: '', endDate: '', securityCode: '', lottery: '' });
  const [savingRaffle, setSavingRaffle] = useState(false);
  const [showLotteryModal, setShowLotteryModal] = useState(false);

  const LOTTERIES = [
    'Super Gana (Lotería del Táchira)',
    'Triple Táchira',
    'Triple Zulia',
    'Triple Caracas',
    'Triple Caliente',
    'Triple Zamorano',
    'La Ricachona',
    'La Ruca',
    'El Terminalito / La Granjita'
  ];
  const [closingId, setClosingId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [supportForm, setSupportForm] = useState({ whatsapp: '', instagram: '', facebook: '', tiktok: '', website: '', email: '' });
  const [paymentForm, setPaymentForm] = useState({ bank: '', phone: '', cedula: '' });
  const [savingSupport, setSavingSupport] = useState(false);
  const [securityStatus, setSecurityStatus] = useState({ active: false, updatedAt: null });
  const [securityLoading, setSecurityLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', imageUrl: '' });
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [winnerForm, setWinnerForm] = useState({ raffleId: '', ticketNumber: '', winnerName: '', prize: '', testimonial: '', photoUrl: '' });
  const [savingWinner, setSavingWinner] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [pushForm, setPushForm] = useState({ title: '', body: '' });
  const [sendingPush, setSendingPush] = useState(false);

  // Lottery Control State
  const [lotteryCheck, setLotteryCheck] = useState({ raffleId: '', number: '' });
  const [lotteryWinner, setLotteryWinner] = useState(null);
  const [checkingWinner, setCheckingWinner] = useState(false);
  const winnerAnim = useRef(new Animated.Value(0)).current;

  const sendPushBroadcast = async () => {
    if (!pushForm.title || !pushForm.body) return Alert.alert('Faltan datos', 'Título y mensaje requeridos.');
    setSendingPush(true);
    const { res, data } = await api('/admin/push/broadcast', {
      method: 'POST',
      body: JSON.stringify(pushForm)
    });
    if (res.ok) {
      Alert.alert('Enviado', data.message || 'Notificación enviada.');
      setPushForm({ title: '', body: '' });
    } else {
      Alert.alert('Error', data.error || 'No se pudo enviar.');
    }
    setSendingPush(false);
  };

  const checkWinner = async () => {
    if (!lotteryCheck.raffleId || !lotteryCheck.number) return Alert.alert('Faltan datos', 'Selecciona rifa y número.');
    setCheckingWinner(true);
    setLotteryWinner(null);
    winnerAnim.setValue(0);

    // Simulate "searching" delay for dramatic effect
    setTimeout(async () => {
      // Search in local tickets first if loaded, else fetch
      // We use the existing tickets list if it matches the raffle, otherwise we might need to fetch
      // For now, let's assume the admin selects the raffle and we load tickets for it, or we fetch specifically.
      // Since we don't have a specific endpoint for "get owner of ticket X", we'll use the list.
      
      let foundTicket = null;
      
      // If tickets are already loaded for this raffle, search there
      if (ticketFilters.raffleId === lotteryCheck.raffleId && tickets.length > 0) {
        foundTicket = tickets.find(t => String(t.number) === String(lotteryCheck.number));
      } else {
        // Fetch tickets for this raffle to find the winner
        const { res, data } = await api(`/admin/tickets?raffleId=${lotteryCheck.raffleId}`);
        if (res.ok && Array.isArray(data)) {
           foundTicket = data.find(t => String(t.number) === String(lotteryCheck.number));
        }
      }

      setCheckingWinner(false);
      
      if (foundTicket) {
        setLotteryWinner(foundTicket);
        Animated.spring(winnerAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true
        }).start();
      } else {
        Alert.alert('Sin resultados', 'No hay ticket vendido con ese número.');
      }
    }, 1500);
  };

  const announceWinner = () => {
    if (!lotteryWinner) return;
    const buyer = lotteryWinner.buyer || lotteryWinner.user || {};
    const name = buyer.firstName ? `${buyer.firstName} ${buyer.lastName}` : buyer.name || 'Anónimo';
    
    setWinnerForm({
      raffleId: lotteryCheck.raffleId,
      ticketNumber: String(lotteryWinner.number),
      winnerName: name,
      prize: '', // To be filled
      testimonial: '',
      photoUrl: ''
    });
    
    Alert.alert('Listo', 'Datos precargados en el formulario de abajo. Completa el premio y la foto.');
  };

  const proceedAnnouncement = () => {
    setConfirmModalVisible(false);
    announceWinner();
  };

  const changePassword = async () => {
    if (!passwordForm.current || !passwordForm.new) return Alert.alert('Faltan datos', 'Ingresa ambas contraseñas.');
    setChangingPassword(true);
    const { res, data } = await api('/me/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword: passwordForm.current, newPassword: passwordForm.new })
    });
    if (res.ok) {
      Alert.alert('Éxito', 'Contraseña actualizada.');
      setPasswordForm({ current: '', new: '' });
      setShowPassword(false);
    } else {
      Alert.alert('Error', data.error || 'No se pudo cambiar la contraseña.');
    }
    setChangingPassword(false);
  };

  const pickWinnerImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permiso requerido', 'Autoriza el acceso a la galería.');
    const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7 });
    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      setWinnerForm((s) => ({ ...s, photoUrl: `data:image/jpeg;base64,${asset.base64}` }));
    }
  };

  const submitWinner = async () => {
    if (!winnerForm.raffleId || !winnerForm.winnerName || !winnerForm.prize) return Alert.alert('Faltan datos', 'Rifa, Nombre y Premio son obligatorios.');
    setSavingWinner(true);
    const { res, data } = await api('/admin/winners', {
      method: 'POST',
      body: JSON.stringify(winnerForm)
    });
    if (res.ok) {
      Alert.alert('Listo', 'Ganador publicado en el Muro de la Fama.');
      setWinnerForm({ raffleId: '', ticketNumber: '', winnerName: '', prize: '', testimonial: '', photoUrl: '' });
    } else {
      Alert.alert('Error', data.error || 'No se pudo publicar.');
    }
    setSavingWinner(false);
  };

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

  const processPayment = async (id, action, reason = null) => {
    setActingId(id);
    const { res, data } = await api(`/admin/verify-payment/${id}`, { 
      method: 'POST',
      body: JSON.stringify({ action, reason })
    });
    if (res.ok) {
      Alert.alert('Listo', action === 'approve' ? 'Pago aprobado y tickets generados.' : 'Pago rechazado.');
      loadManualPayments();
      loadTickets();
    } else {
      Alert.alert('Error', data.error || 'No se pudo procesar.');
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
      endDate: raffle.endDate ? raffle.endDate.slice(0, 10) : '',
      lottery: raffle.lottery || ''
    });
  };

  const saveStyle = async () => {
    if (!selectedRaffle) return;
    setSavingStyle(true);
    const payload = {
      style: {
        bannerImage: styleForm.bannerImage,
        themeColor: styleForm.themeColor,
        terms: styleForm.terms,
        whatsapp: styleForm.whatsapp,
        instagram: styleForm.instagram
      }
    };
    const { res, data } = await api(`/admin/raffles/${selectedRaffle.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
    if (res.ok) {
      Alert.alert('Listo', 'Estilo actualizado.');
      loadRaffles();
    } else {
      Alert.alert('Error', data.error || 'No se pudo guardar estilo.');
    }
    setSavingStyle(false);
  };

  const resetRaffleForm = () => {
    setRaffleForm({ id: null, title: '', price: '', description: '', totalTickets: '', startDate: '', endDate: '', securityCode: '', lottery: '' });
  };

  const submitRaffle = async () => {
    if (!raffleForm.title || !raffleForm.price || !raffleForm.lottery) return Alert.alert('Faltan datos', 'Ingresa titulo, precio y selecciona una lotería.');
    const payload = {
      title: raffleForm.title,
      price: Number(raffleForm.price),
      description: raffleForm.description,
      totalTickets: raffleForm.totalTickets ? Number(raffleForm.totalTickets) : undefined,
      startDate: raffleForm.startDate,
      endDate: raffleForm.endDate,
      securityCode: raffleForm.securityCode,
      lottery: raffleForm.lottery
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

  const createAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.content) return Alert.alert('Faltan datos', 'Título y contenido requeridos.');
    setSavingAnnouncement(true);
    const { res, data } = await api('/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(announcementForm)
    });
    if (res.ok) {
      Alert.alert('Listo', 'Anuncio publicado.');
      setAnnouncementForm({ title: '', content: '', imageUrl: '' });
    } else {
      Alert.alert('Error', data.error || 'No se pudo publicar.');
    }
    setSavingAnnouncement(false);
  };

  const pickAnnouncementImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permiso requerido', 'Autoriza el acceso a la galería.');
    const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7 });
    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      setAnnouncementForm((s) => ({ ...s, imageUrl: `data:image/jpeg;base64,${asset.base64}` }));
    }
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
    <LinearGradient colors={['#0F172A', '#1E1B4B']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Perfil Admin</Text>

        <View style={styles.card}>
          <TouchableOpacity style={styles.rowBetween} onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.section}>Mi Cuenta (Seguridad)</Text>
            <Ionicons name={showPassword ? "chevron-up" : "chevron-down"} size={20} color={palette.text} />
          </TouchableOpacity>
          
          {showPassword && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.muted}>Cambiar contraseña de administrador</Text>
              <TextInput
                style={styles.input}
                placeholder="Contraseña actual"
                secureTextEntry
                value={passwordForm.current}
                onChangeText={(v) => setPasswordForm(s => ({ ...s, current: v }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Nueva contraseña"
                secureTextEntry
                value={passwordForm.new}
                onChangeText={(v) => setPasswordForm(s => ({ ...s, new: v }))}
              />
              <FilledButton 
                title={changingPassword ? 'Actualizando...' : 'Actualizar contraseña'} 
                onPress={changePassword} 
                loading={changingPassword} 
                disabled={changingPassword}
                icon={<Ionicons name="lock-closed-outline" size={18} color="#fff" />}
              />
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Notificaciones Push (Masivas)</Text>
          <Text style={styles.muted}>Envía una alerta a todos los usuarios con la app instalada.</Text>
          <TextInput style={styles.input} placeholder="Título (ej. ¡Nueva Rifa!)" value={pushForm.title} onChangeText={(v) => setPushForm(s => ({ ...s, title: v }))} />
          <TextInput style={styles.input} placeholder="Mensaje (ej. Gana un iPhone hoy...)" value={pushForm.body} onChangeText={(v) => setPushForm(s => ({ ...s, body: v }))} />
          <FilledButton
            title={sendingPush ? 'Enviando...' : 'Enviar a todos'}
            onPress={sendPushBroadcast}
            loading={sendingPush}
            disabled={sendingPush}
            icon={<Ionicons name="notifications-outline" size={18} color="#fff" />}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Configuración de Empresa (Público)</Text>
          <Text style={styles.muted}>Estos datos de contacto son visibles para los usuarios.</Text>
          {profileLoading ? <ActivityIndicator color={palette.primary} /> : null}
          <TextInput style={styles.input} placeholder="Whatsapp" value={supportForm.whatsapp} onChangeText={(v) => setSupportForm((s) => ({ ...s, whatsapp: v }))} />
          <TextInput style={styles.input} placeholder="Instagram" value={supportForm.instagram} onChangeText={(v) => setSupportForm((s) => ({ ...s, instagram: v }))} />
          <TextInput style={styles.input} placeholder="Facebook" value={supportForm.facebook} onChangeText={(v) => setSupportForm((s) => ({ ...s, facebook: v }))} />
          <TextInput style={styles.input} placeholder="TikTok" value={supportForm.tiktok} onChangeText={(v) => setSupportForm((s) => ({ ...s, tiktok: v }))} />
          <TextInput style={styles.input} placeholder="Web o enlace" value={supportForm.website} onChangeText={(v) => setSupportForm((s) => ({ ...s, website: v }))} />
          <TextInput style={styles.input} placeholder="Correo de soporte" value={supportForm.email} onChangeText={(v) => setSupportForm((s) => ({ ...s, email: v }))} />
          <FilledButton
            title={savingSupport ? 'Guardando...' : 'Guardar soporte'}
            onPress={saveSupport}
            loading={savingSupport}
            disabled={savingSupport}
            icon={<Ionicons name="save-outline" size={18} color="#fff" />}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Datos Bancarios (Para recibir pagos)</Text>
          <Text style={styles.muted}>Estos datos se mostrarán a los usuarios al elegir "Pago Manual".</Text>
          <TextInput style={styles.input} placeholder="Banco (ej. Banesco)" value={paymentForm.bank} onChangeText={(v) => setPaymentForm((s) => ({ ...s, bank: v }))} />
          <TextInput style={styles.input} placeholder="Teléfono (ej. 0414...)" value={paymentForm.phone} onChangeText={(v) => setPaymentForm((s) => ({ ...s, phone: v }))} keyboardType="phone-pad" />
          <TextInput style={styles.input} placeholder="Cédula / RIF (ej. V-123...)" value={paymentForm.cedula} onChangeText={(v) => setPaymentForm((s) => ({ ...s, cedula: v }))} />
          <TextInput style={styles.input} placeholder="Tipo de cuenta (ej. Corriente)" value={paymentForm.type} onChangeText={(v) => setPaymentForm((s) => ({ ...s, type: v }))} />
          <TextInput style={styles.input} placeholder="Número de cuenta (20 dígitos)" value={paymentForm.account} onChangeText={(v) => setPaymentForm((s) => ({ ...s, account: v }))} keyboardType="numeric" maxLength={20} />
          <FilledButton
            title={savingSupport ? 'Guardando...' : 'Guardar datos bancarios'}
            onPress={async () => {
              setSavingSupport(true);
              const { res, data } = await api('/admin/bank-details', {
                method: 'PUT',
                body: JSON.stringify({ bankDetails: paymentForm })
              });
              if (res.ok) Alert.alert('Listo', 'Datos bancarios actualizados.');
              else Alert.alert('Error', data.error || 'No se pudo guardar.');
              setSavingSupport(false);
            }}
            loading={savingSupport}
            disabled={savingSupport}
            icon={<Ionicons name="card-outline" size={18} color="#fff" />}
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
          <Text style={styles.section}>Control de Sorteo (En Vivo)</Text>
          <Text style={styles.muted}>Selecciona la rifa y escribe el número ganador de la lotería.</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {raffles.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => setLotteryCheck(s => ({ ...s, raffleId: r.id }))}
                  style={[
                    styles.badge, 
                    { 
                      backgroundColor: lotteryCheck.raffleId === r.id ? palette.primary : 'rgba(255,255,255,0.05)',
                      borderColor: lotteryCheck.raffleId === r.id ? palette.primary : palette.border,
                      width: 'auto',
                      minWidth: 100
                    }
                  ]}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>{r.title}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>{r.endDate ? r.endDate.slice(0,10) : 'Sin fecha'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: palette.subtext, marginBottom: 6, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>Número Ganador</Text>
              <TextInput
                style={[styles.input, { fontSize: 24, fontWeight: '900', textAlign: 'center', letterSpacing: 4, height: 60, backgroundColor: 'rgba(0,0,0,0.3)', borderColor: palette.accent }]}
                placeholder="00000"
                placeholderTextColor="rgba(255,255,255,0.1)"
                keyboardType="numeric"
                maxLength={5}
                value={lotteryCheck.number}
                onChangeText={(v) => setLotteryCheck(s => ({ ...s, number: v }))}
              />
            </View>
            <TouchableOpacity
              onPress={checkWinner}
              disabled={checkingWinner}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: checkingWinner ? palette.muted : palette.accent,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: palette.accent,
                shadowOpacity: 0.5,
                shadowRadius: 10,
                elevation: 10,
                marginTop: 18
              }}
            >
              {checkingWinner ? <ActivityIndicator color="#000" /> : <Ionicons name="search" size={28} color="#000" />}
            </TouchableOpacity>
          </View>

          {lotteryWinner && (
            <Animated.View style={{ 
              opacity: winnerAnim,
              transform: [{ scale: winnerAnim }],
              backgroundColor: 'rgba(251, 191, 36, 0.1)', 
              borderColor: '#fbbf24', 
              borderWidth: 1, 
              borderRadius: 16, 
              padding: 16,
              alignItems: 'center',
              marginBottom: 16
            }}>
              <Text style={{ color: '#fbbf24', fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 8 }}>¡TENEMOS GANADOR!</Text>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#fbbf24', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Ionicons name="trophy" size={40} color="#000" />
              </View>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>
                {lotteryWinner.buyer?.firstName || lotteryWinner.user?.name || 'Usuario'} {lotteryWinner.buyer?.lastName || ''}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 16 }}>
                Ticket #{formatTicketNumber(lotteryWinner.number)} • {lotteryWinner.buyer?.phone || lotteryWinner.user?.email}
              </Text>
              
              <TouchableOpacity 
                onPress={announceWinner}
                style={{ 
                  backgroundColor: '#fbbf24', 
                  paddingHorizontal: 20, 
                  paddingVertical: 10, 
                  borderRadius: 999,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Text style={{ color: '#000', fontWeight: '800' }}>ANUNCIAR OFICIALMENTE</Text>
                <Ionicons name="megaphone-outline" size={18} color="#000" />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Gestionar rifas</Text>
          <TextInput style={styles.input} placeholder="Titulo" value={raffleForm.title} onChangeText={(v) => setRaffleForm((s) => ({ ...s, title: v }))} />
          <TextInput style={styles.input} placeholder="Precio" value={raffleForm.price} onChangeText={(v) => setRaffleForm((s) => ({ ...s, price: v }))} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Descripcion" value={raffleForm.description} onChangeText={(v) => setRaffleForm((s) => ({ ...s, description: v }))} />
          
          <TouchableOpacity onPress={() => setShowLotteryModal(true)} style={[styles.input, { justifyContent: 'center' }]}>
               <Text style={{ color: raffleForm.lottery ? '#fff' : '#94a3b8' }}>{raffleForm.lottery || 'Seleccionar Lotería'}</Text>
               <Ionicons name="chevron-down-outline" size={20} color="#94a3b8" style={{ position: 'absolute', right: 12 }} />
          </TouchableOpacity>

          <Modal visible={showLotteryModal} transparent animationType="fade">
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 }}>
              <View style={{ backgroundColor: '#1e293b', borderRadius: 16, padding: 20, maxHeight: '80%' }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>Selecciona una Lotería</Text>
                <ScrollView>
                  {LOTTERIES.map((l) => (
                    <TouchableOpacity key={l} onPress={() => { setRaffleForm(s => ({...s, lottery: l})); setShowLotteryModal(false); }} style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Ionicons name="ticket-outline" size={18} color="#fbbf24" />
                      <Text style={{ color: '#e2e8f0', fontSize: 16 }}>{l}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity onPress={() => setShowLotteryModal(false)} style={{ marginTop: 16, alignItems: 'center' }}>
                  <Text style={{ color: '#ef4444', fontSize: 16 }}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

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
          <Text style={styles.section}>Publicar Novedad</Text>
          <TextInput style={styles.input} placeholder="Título" value={announcementForm.title} onChangeText={(v) => setAnnouncementForm(s => ({...s, title: v}))} />
          <TextInput style={[styles.input, { height: 80 }]} placeholder="Contenido" multiline value={announcementForm.content} onChangeText={(v) => setAnnouncementForm(s => ({...s, content: v}))} />
          
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={pickAnnouncementImage}>
            <Ionicons name="image-outline" size={18} color={palette.primary} />
            <Text style={[styles.secondaryText, { marginLeft: 8 }]}>Imagen (Opcional)</Text>
          </TouchableOpacity>
          {announcementForm.imageUrl ? (
            <Image source={{ uri: announcementForm.imageUrl }} style={{ width: '100%', height: 120, borderRadius: 8, marginVertical: 8 }} resizeMode="cover" />
          ) : null}

          <FilledButton
            title={savingAnnouncement ? 'Publicando...' : 'Publicar'}
            onPress={createAnnouncement}
            loading={savingAnnouncement}
            disabled={savingAnnouncement}
            icon={<Ionicons name="megaphone-outline" size={18} color="#fff" />}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Publicar Ganador (Muro de la Fama)</Text>
          <TextInput style={styles.input} placeholder="ID de Rifa (Opcional)" value={winnerForm.raffleId} onChangeText={(v) => setWinnerForm(s => ({...s, raffleId: v}))} />
          <TextInput style={styles.input} placeholder="Número de Ticket" value={winnerForm.ticketNumber} onChangeText={(v) => setWinnerForm(s => ({...s, ticketNumber: v}))} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Nombre del Ganador" value={winnerForm.winnerName} onChangeText={(v) => setWinnerForm(s => ({...s, winnerName: v}))} />
          <TextInput style={styles.input} placeholder="Premio Ganado" value={winnerForm.prize} onChangeText={(v) => setWinnerForm(s => ({...s, prize: v}))} />
          <TextInput style={[styles.input, { height: 60 }]} placeholder="Testimonio (Opcional)" multiline value={winnerForm.testimonial} onChangeText={(v) => setWinnerForm(s => ({...s, testimonial: v}))} />
          
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={pickWinnerImage}>
            <Ionicons name="camera-outline" size={18} color={palette.primary} />
            <Text style={[styles.secondaryText, { marginLeft: 8 }]}>Foto del Ganador</Text>
          </TouchableOpacity>
          {winnerForm.photoUrl ? (
            <Image source={{ uri: winnerForm.photoUrl }} style={{ width: '100%', height: 150, borderRadius: 8, marginVertical: 8 }} resizeMode="cover" />
          ) : null}

          <FilledButton
            title={savingWinner ? 'Publicando...' : 'Publicar Ganador'}
            onPress={submitWinner}
            loading={savingWinner}
            disabled={savingWinner}
            icon={<Ionicons name="trophy-outline" size={18} color="#fff" />}
          />
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
                    <View style={{ marginTop: 8 }}>
                      <Text style={styles.muted}>Comprobante:</Text>
                      <Image 
                        source={{ uri: item.proof }} 
                        style={{ width: '100%', height: 200, borderRadius: 8, backgroundColor: '#0f172a' }} 
                        resizeMode="contain" 
                      />
                    </View>
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
                        onPress={() => {
                          Alert.prompt(
                            'Rechazar pago',
                            'Ingresa el motivo del rechazo (se enviará por correo):',
                            [
                              { text: 'Cancelar', style: 'cancel' },
                              { text: 'Rechazar', onPress: (reason) => processPayment(item.id, 'reject', reason), style: 'destructive' }
                            ],
                            'plain-text'
                          );
                        }}
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
                    terms: r.style?.terms || '',
                    whatsapp: r.style?.whatsapp || '',
                    instagram: r.style?.instagram || ''
                  });
                }}
              >
                <Text style={{ color: selectedRaffle?.id === r.id ? '#fff' : palette.text, fontWeight: '600' }}>{r.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedRaffle ? (
            <View style={{ gap: 8 }}>
              <Text style={styles.muted}>Editando estilo de: {selectedRaffle.title}</Text>
              
              <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={pickBanner}>
                <Ionicons name="image-outline" size={18} color={palette.primary} />
                <Text style={[styles.secondaryText, { marginLeft: 8 }]}>Subir Banner</Text>
              </TouchableOpacity>
              {styleForm.bannerImage ? (
                <Image source={{ uri: styleForm.bannerImage }} style={{ width: '100%', height: 120, borderRadius: 8, backgroundColor: '#e2e8f0' }} resizeMode="cover" />
              ) : null}

              <TextInput style={styles.input} placeholder="Color Tema (Hex: #RRGGBB)" value={styleForm.themeColor} onChangeText={(v) => setStyleForm(s => ({...s, themeColor: v}))} />
              
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                {['#2563eb', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'].map(color => (
                  <TouchableOpacity 
                    key={color}
                    style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: color, borderWidth: styleForm.themeColor === color ? 2 : 0, borderColor: '#0f172a' }}
                    onPress={() => setStyleForm(s => ({...s, themeColor: color}))}
                  />
                ))}
              </View>

              <TextInput style={[styles.input, { height: 80 }]} placeholder="Términos y condiciones (texto)" multiline value={styleForm.terms} onChangeText={(v) => setStyleForm(s => ({...s, terms: v}))} />
              <TextInput style={styles.input} placeholder="WhatsApp (ej: 584141234567)" value={styleForm.whatsapp} onChangeText={(v) => setStyleForm(s => ({...s, whatsapp: v.replace(/[^0-9]/g, '')}))} keyboardType="phone-pad" />
              <TextInput style={styles.input} placeholder="Instagram (sin @)" value={styleForm.instagram} onChangeText={(v) => setStyleForm(s => ({...s, instagram: v.replace('@', '').trim()}))} />

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <FilledButton
                    title={savingStyle ? 'Guardando...' : 'Guardar'}
                    onPress={saveStyle}
                    loading={savingStyle}
                    disabled={savingStyle}
                    icon={<Ionicons name="color-palette-outline" size={18} color="#fff" />}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <OutlineButton
                    title="Vista Previa"
                    onPress={() => setPreviewVisible(true)}
                    icon={<Ionicons name="eye-outline" size={18} color={palette.primary} />}
                  />
                </View>
              </View>

              <Modal visible={previewVisible} animationType="slide" onRequestClose={() => setPreviewVisible(false)}>
                <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: palette.border }}>
                    <TouchableOpacity onPress={() => setPreviewVisible(false)} style={{ padding: 4 }}>
                      <Ionicons name="close" size={24} color={palette.text} />
                    </TouchableOpacity>
                    <Text style={{ color: palette.text, fontSize: 18, fontWeight: 'bold', marginLeft: 16 }}>Vista Previa</Text>
                  </View>
                  <ScrollView contentContainerStyle={styles.scroll}>
                    {styleForm.bannerImage ? (
                      <Image source={{ uri: styleForm.bannerImage }} style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 16 }} resizeMode="cover" />
                    ) : null}
                    
                    <Text style={[styles.title, { color: styleForm.themeColor }]}>{selectedRaffle?.title || 'Título de la Rifa'}</Text>
                    
                    {styleForm.terms ? (
                      <View style={[styles.card, { borderColor: styleForm.themeColor, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.02)' }]}>
                        <Text style={[styles.section, { color: styleForm.themeColor }]}>Información Importante</Text>
                        <Text style={styles.muted}>{styleForm.terms}</Text>
                      </View>
                    ) : null}

                    <View style={styles.card}>
                      <Text style={styles.muted}>
                        Precio VES {selectedRaffle?.price || '0'} • Vendidos 0 • Disponibles {selectedRaffle?.totalTickets || 100}
                      </Text>
                      
                      {(styleForm.whatsapp || styleForm.instagram) && (
                        <View style={{ marginTop: 8, flexDirection: 'row', gap: 10 }}>
                          {styleForm.whatsapp ? (
                            <TouchableOpacity style={[styles.pill, { backgroundColor: '#25D366' }]}>
                              <Ionicons name="logo-whatsapp" size={16} color="#fff" />
                              <Text style={{ color: '#fff', fontWeight: 'bold' }}>WhatsApp</Text>
                            </TouchableOpacity>
                          ) : null}
                          {styleForm.instagram ? (
                            <TouchableOpacity style={[styles.pill, { backgroundColor: '#E1306C' }]}>
                              <Ionicons name="logo-instagram" size={16} color="#fff" />
                              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Instagram</Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      )}
                      
                      <View style={{ marginTop: 16, padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                          <Text style={{ color: palette.muted, textAlign: 'center' }}>[Área de Compra Simulada]</Text>
                      </View>
                    </View>
                  </ScrollView>
                </SafeAreaView>
              </Modal>
            </View>
          ) : (
            <Text style={styles.muted}>Selecciona una rifa para personalizar su estilo.</Text>
          )}
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
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmModalVisible}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#1e293b', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            <Ionicons name="alert-circle" size={48} color="#fbbf24" style={{ marginBottom: 16 }} />
            <Text style={{ color: '#e2e8f0', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>VERIFICA EL NÚMERO</Text>
            <Text style={{ color: '#94a3b8', textAlign: 'center', marginBottom: 24 }}>Asegúrate de que este es el número que salió en la lotería antes de anunciar.</Text>
            
            <View style={{ backgroundColor: '#0f172a', paddingVertical: 20, paddingHorizontal: 40, borderRadius: 16, marginBottom: 24, borderWidth: 2, borderColor: '#fbbf24' }}>
              <Text style={{ color: '#fff', fontSize: 56, fontWeight: '900', letterSpacing: 4 }}>
                {lotteryWinner ? formatTicketNumber(lotteryWinner.number) : '00000'}
              </Text>
            </View>

            <Text style={{ color: '#e2e8f0', fontSize: 16, fontWeight: '700', marginBottom: 32 }}>
              Ganador: {lotteryWinner ? (lotteryWinner.buyer?.firstName || lotteryWinner.user?.name) : ''}
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity 
                onPress={() => setConfirmModalVisible(false)}
                style={{ flex: 1, padding: 16, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={proceedAnnouncement}
                style={{ flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#fbbf24', alignItems: 'center' }}
              >
                <Text style={{ color: '#0b1224', fontWeight: '800' }}>SÍ, ES CORRECTO</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </SafeAreaView>
    </LinearGradient>
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
  const [smtpForm, setSmtpForm] = useState({ host: '', port: '587', user: '', pass: '', secure: false, fromName: '', fromEmail: '' });
  const [savingSmtp, setSavingSmtp] = useState(false);

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
      if (s1.data.smtp) setSmtpForm(s => ({ ...s, ...s1.data.smtp }));
    }
    if (s2.res.ok && Array.isArray(s2.data)) setUsers(s2.data);
    if (s3.res.ok && Array.isArray(s3.data)) setMailLogs(s3.data);
    if (s4.res.ok && Array.isArray(s4.data)) setAuditLogs(s4.data);
    setLoading(false);
  }, [api]);

  const saveSmtp = async () => {
    setSavingSmtp(true);
    const { res, data } = await api('/superadmin/settings/smtp', {
      method: 'PATCH',
      body: JSON.stringify(smtpForm)
    });
    if (res.ok) {
      Alert.alert('Listo', 'Configuración SMTP guardada.');
    } else {
      Alert.alert('Error', data.error || 'No se pudo guardar SMTP.');
    }
    setSavingSmtp(false);
  };

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
    <LinearGradient colors={['#0F172A', '#1E1B4B']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Superadmin</Text>
        
        <View style={styles.card}>
          <Text style={styles.section}>Panel de Control Total</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {[
              { title: 'Crear Rifa', icon: 'add-circle', action: () => Alert.alert('Info', 'Usa la pestaña Admin para crear rifas.') },
              { title: 'Gestionar Rifas', icon: 'list', action: () => Alert.alert('Info', 'Usa la pestaña Admin para editar/eliminar.') },
              { title: 'Usuarios', icon: 'people', action: () => Alert.alert('Info', 'Gestión de usuarios abajo.') },
              { title: 'Tickets', icon: 'ticket', action: () => Alert.alert('Info', 'Usa la pestaña Admin para tickets.') },
              { title: 'Estadísticas', icon: 'bar-chart', action: () => Alert.alert('Próximamente', 'Métricas en tiempo real.') },
              { title: 'Notificaciones', icon: 'notifications', action: () => Alert.alert('Próximamente', 'Gestión de mensajes.') },
              { title: 'Pagos', icon: 'cash', action: () => Alert.alert('Info', 'Usa la pestaña Admin para pagos.') },
              { title: 'Integraciones', icon: 'extension-puzzle', action: () => Alert.alert('Próximamente', 'APIs y pasarelas.') },
              { title: 'Reportes', icon: 'document-text', action: () => Alert.alert('Próximamente', 'Exportar CSV/PDF.') },
              { title: 'Base de Datos', icon: 'server', action: () => Alert.alert('Próximamente', 'Mantenimiento DB.') },
              { title: 'Soporte', icon: 'help-buoy', action: () => Alert.alert('Próximamente', 'Diagnóstico.') },
            ].map((btn, i) => (
              <TouchableOpacity key={i} style={[styles.pill, { backgroundColor: 'rgba(255,255,255,0.08)', width: '48%', justifyContent: 'center', alignItems: 'center', paddingVertical: 16 }]} onPress={btn.action}>
                <Ionicons name={btn.icon} size={24} color={palette.primary} style={{ marginBottom: 8 }} />
                <Text style={{ color: palette.text, fontWeight: '700', fontSize: 12 }}>{btn.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
                  <Ionicons name="mail-outline" size={16} color="#f472b6" />
                </View>
                <View>
                  <Text style={styles.section}>Configuración de Correo (SMTP)</Text>
                  <Text style={styles.sectionHint}>Usa tu propio correo para enviar notificaciones.</Text>
                </View>
              </View>
              <TextInput style={styles.input} placeholder="Host (ej. smtp.gmail.com)" value={smtpForm.host} onChangeText={(v) => setSmtpForm(s => ({...s, host: v}))} autoCapitalize="none" />
              <TextInput style={styles.input} placeholder="Puerto (ej. 587 o 465)" value={String(smtpForm.port)} onChangeText={(v) => setSmtpForm(s => ({...s, port: v}))} keyboardType="numeric" />
              <TextInput style={styles.input} placeholder="Usuario (ej. tu@gmail.com)" value={smtpForm.user} onChangeText={(v) => setSmtpForm(s => ({...s, user: v}))} autoCapitalize="none" />
              <TextInput style={styles.input} placeholder="Contraseña (o App Password)" value={smtpForm.pass} onChangeText={(v) => setSmtpForm(s => ({...s, pass: v}))} secureTextEntry />
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={styles.muted}>Usar conexión segura (SSL/TLS)</Text>
                <Switch value={smtpForm.secure} onValueChange={(v) => setSmtpForm(s => ({...s, secure: v}))} />
              </View>
              <TextInput style={styles.input} placeholder="Nombre Remitente (ej. MegaRifas)" value={smtpForm.fromName} onChangeText={(v) => setSmtpForm(s => ({...s, fromName: v}))} />
              <TextInput style={styles.input} placeholder="Email Remitente (si difiere del usuario)" value={smtpForm.fromEmail} onChangeText={(v) => setSmtpForm(s => ({...s, fromEmail: v}))} autoCapitalize="none" />
              
              <FilledButton 
                title={savingSmtp ? 'Guardando...' : 'Guardar configuración SMTP'} 
                onPress={saveSmtp} 
                disabled={savingSmtp} 
                icon={<Ionicons name="save-outline" size={18} color="#fff" />} 
              />
            </View>

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
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={styles.itemTitle}>{u.email}</Text>
                      <Text style={[styles.pill, { fontSize: 10, backgroundColor: '#334155' }]}>{u.publicId || 'N/A'}</Text>
                    </View>
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
    </LinearGradient>
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
            'Mis Rifas': 'ticket-outline',
            Ganadores: 'trophy-outline',
            Perfil: 'person-circle-outline',
            Admin: 'settings-outline',
            Superadmin: 'shield-checkmark-outline'
          };
          return <Ionicons name={icons[route.name] || 'help-circle-outline'} size={size} color={color} />;
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
      <Tabs.Screen name="Ganadores">
        {() => <WinnersScreen api={api} />}
      </Tabs.Screen>
      {cfg?.user?.profile !== false && (
        <Tabs.Screen name="Perfil">
          {() => <ProfileScreen api={api} user={user} onUserUpdate={onUserUpdate} pushToken={pushToken} setPushToken={setPushToken} />}
        </Tabs.Screen>
      )}
      {(user?.role === 'admin' || user?.role === 'organizer' || user?.role === 'superadmin') && cfg?.admin?.raffles !== false && (
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

function MainContent() {
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
  card: { backgroundColor: 'rgba(30, 41, 59, 0.7)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  input: { borderWidth: 1, borderColor: palette.border, borderRadius: 12, padding: 14, marginBottom: 10, backgroundColor: palette.inputBg, color: palette.text, fontSize: 16 },
  inputSoft: { borderColor: palette.border, backgroundColor: palette.inputBg },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: palette.primary, padding: 12, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: palette.border },
  secondaryText: { color: palette.primary, fontWeight: '700' },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: palette.surface, color: palette.text, fontWeight: '700', alignSelf: 'flex-start' },
  muted: { color: palette.muted },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { fontSize: 16, fontWeight: '700', color: palette.text },
  link: { color: palette.subtext, marginTop: 6, fontWeight: '700' },
  loaderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: palette.background },
  adminBadge: { color: palette.secondary, fontWeight: '700', marginTop: 4 },
  bannerImage: { width: '100%', height: 160, borderRadius: 10, marginVertical: 8 },
  proofImage: { width: '100%', height: 180, borderRadius: 10, marginVertical: 8 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: palette.surface, marginBottom: 8 },
  receiptCard: { borderWidth: 1, borderColor: palette.border, borderRadius: 10, padding: 10, marginBottom: 8 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,12,24,0.55)' },
  heroTitle: { fontSize: 34, fontWeight: '900', color: palette.text, textAlign: 'center' },
  heroTagline: { fontSize: 16, color: palette.subtext, textAlign: 'center', marginTop: 6, marginBottom: 16, lineHeight: 22 },
  glassCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  primaryButton: { backgroundColor: palette.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', shadowColor: palette.primary, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  rememberText: { color: palette.subtext, fontSize: 13 },
  linksRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, gap: 12 },
  linkItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorText: { color: palette.error, marginTop: 4, fontWeight: '600' },
  successText: { color: palette.success, marginTop: 4, fontWeight: '600' },
  bannerCard: { width: 240, marginRight: 12 },
  bannerBg: { height: 140, borderRadius: 16, overflow: 'hidden' },
  bannerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(12,16,32,0.55)' },
  priceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  actionChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: palette.surface, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: palette.border },
  medal: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(251,191,36,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  avatarRing: { padding: 4, borderRadius: 56, borderWidth: 2, borderColor: palette.primary },
  badge: { backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1, borderRadius: 12, padding: 10, alignItems: 'center', width: 100 },
  balanceCard: { backgroundColor: palette.surface, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: palette.border, marginBottom: 12 },
  balanceValue: { fontSize: 34, fontWeight: '900', color: palette.secondary, marginTop: 4 },
  circleAccent: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(124,58,237,0.25)', alignItems: 'center', justifyContent: 'center' },
  ctaRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  ctaButtonPrimary: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, backgroundColor: palette.secondary },
  ctaButtonPrimaryText: { color: '#0b1224', fontWeight: '800' },
  ctaButtonGhost: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: palette.border },
  ctaButtonGhostText: { color: palette.text, fontWeight: '700' },
  statTile: { flex: 1, padding: 10, borderRadius: 12, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginVertical: 10 },
  chartBar: { width: 26, borderRadius: 10, backgroundColor: palette.accent },
  movementRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: palette.border },
  movementBadge: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  statusPill: { marginTop: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, textTransform: 'uppercase', fontSize: 12, fontWeight: '800', color: palette.text, alignSelf: 'flex-end' },
  statusApproved: { backgroundColor: 'rgba(16,185,129,0.18)', borderColor: 'rgba(16,185,129,0.35)', borderWidth: 1 },
  statusPending: { backgroundColor: 'rgba(251,191,36,0.18)', borderColor: 'rgba(251,191,36,0.35)', borderWidth: 1 },
  statusRejected: { backgroundColor: 'rgba(248,113,113,0.18)', borderColor: 'rgba(248,113,113,0.35)', borderWidth: 1 },
  heroCardHome: { backgroundColor: 'rgba(15, 23, 42, 0.6)', borderWidth: 1, borderColor: 'rgba(168, 85, 247, 0.3)', borderRadius: 18, padding: 18, marginBottom: 14 },
  heroPillRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  heroPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(124,58,237,0.18)' },
  heroPillAlt: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: palette.border },
  heroPillText: { color: palette.text, fontWeight: '700' },
  heroHeading: { fontSize: 22, fontWeight: '900', color: palette.text, marginBottom: 6 },
  heroSub: { color: palette.subtext, marginBottom: 10 },
  heroStatsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface },
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

export default function App() {
  return (
    <ToastProvider>
      <MainContent />
    </ToastProvider>
  );
}
