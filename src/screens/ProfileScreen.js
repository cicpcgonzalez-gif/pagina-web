import React, { useState, useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { palette } from '../theme';
import { styles } from '../styles';
import { FilledButton } from '../components/UI';
import { formatTicketNumber } from '../utils';

export default function ProfileScreen({ api, onUserUpdate, pushToken, setPushToken, onLogout }) {
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

  const [errorMsg, setErrorMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [{ res: r1, data: d1 }, { res: r2, data: d2 }, { res: r3, data: d3 }, { res: r4, data: d4 }] = await Promise.all([
        api('/me'),
        api('/me/tickets'),
        api('/me/payments'),
        api('/me/referrals')
      ]);
      
      console.log('Profile Load Status:', r1.status, d1);

      if (r1.ok) {
        // Merge referral data if available
        const user = d1;
        if (r4.ok) {
          user.referrals = d4.referrals;
          user.referralCode = d4.code;
        }
        setProfile(user);
      } else {
        setErrorMsg(d1?.error || `Error ${r1.status}: No se pudo cargar el perfil`);
      }
      if (r2.ok && Array.isArray(d2)) setTickets(d2);
      if (r3.ok && Array.isArray(d3)) setPayments(d3);
    } catch (e) {
      console.error('Profile Load Error:', e);
      setErrorMsg(e.message || 'Error de conexión');
    }
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
    try {
      const { res, data } = await api(`/users/${profile.id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          name: profile.name,
          email: profile.email,
          phone: profile.phone, 
          address: profile.address, 
          cedula: profile.cedula,
          dob: profile.dob,
          bio: profile.bio,
          avatar: profile.avatar
        })
      });
      if (res.ok) {
        Alert.alert('Guardado', 'Perfil actualizado correctamente.');
        if (onUserUpdate) onUserUpdate(data.user);
      } else {
        Alert.alert('Error', data.error || 'No se pudo actualizar el perfil.');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Error de conexión al guardar.');
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

  const deleteAccount = () => {
    Alert.alert(
      'Eliminar cuenta',
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible y perderás acceso a tus tickets y datos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const { res, data } = await api('/me', { method: 'DELETE' });
              if (res.ok) {
                Alert.alert('Cuenta eliminada', 'Tu cuenta ha sido eliminada correctamente.');
                onLogout();
              } else {
                Alert.alert('Error', data.error || 'No se pudo eliminar la cuenta.');
              }
            } catch (e) {
              Alert.alert('Error', 'Error de conexión al eliminar la cuenta.');
            }
          }
        }
      ]
    );
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
                  <Text style={styles.itemTitle}>{profile.name || 'Usuario'}</Text>
                  {profile.verified && <Ionicons name="checkmark-circle" size={18} color="#3b82f6" />}
                </View>
                <Text style={styles.muted}>{profile.email ? profile.email.replace(/(.{2})(.*)(@.*)/, "$1***$3") : 'Sin correo'}</Text>
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
                    <Text style={styles.muted}>Ref: {p.reference || '—'}</Text>
                    <Text style={{ color: '#fbbf24', fontWeight: 'bold' }}>VES {amount || '0.00'}</Text>
                    <Text style={styles.muted}>{new Date(p.createdAt).toLocaleDateString()}</Text>
                  </View>
                );
              })}
            </View>

            <View style={{ marginTop: 20, gap: 12, marginBottom: 40 }}>
              <FilledButton 
                title="Cerrar sesión" 
                onPress={onLogout} 
                style={{ backgroundColor: '#ef4444' }} 
                icon={<Ionicons name="log-out-outline" size={18} color="#fff" />} 
              />
              
              <TouchableOpacity 
                onPress={deleteAccount}
                style={{ padding: 12, alignItems: 'center' }}
              >
                <Text style={{ color: '#94a3b8', fontSize: 14, textDecorationLine: 'underline' }}>
                  Eliminar mi cuenta
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={{ color: palette.error, textAlign: 'center' }}>{errorMsg || 'No se pudo cargar el perfil.'}</Text>
        )}
      </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
