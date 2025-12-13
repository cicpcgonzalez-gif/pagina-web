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
import * as ImageManipulator from 'expo-image-manipulator';
import { useFocusEffect } from '@react-navigation/native';
import { palette } from '../theme';
import { styles } from '../styles';
import { FilledButton } from '../components/UI';
import { formatTicketNumber } from '../utils';

import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen({ navigation, api, onUserUpdate, pushToken, setPushToken, onLogout }) {
  const nav = useNavigation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // const [myRaffles, setMyRaffles] = useState([]); // Removed as we use a separate screen now
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const achievements = useMemo(() => {
    if (!profile) return [];
    const list = [];
    if (tickets.length > 0) list.push({ id: 'ach1', label: 'Explorador', icon: 'planet' });
    if (tickets.length >= 5) list.push({ id: 'ach2', label: 'Jugador fiel', icon: 'sparkles' });
    if (profile.referrals?.length >= 5) list.push({ id: 'ach3', label: 'Influencer', icon: 'people' });
    return list;
  }, [profile, tickets]);

  const [errorMsg, setErrorMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [{ res: r1, data: d1 }, { res: r2, data: d2 }, { res: r4, data: d4 }] = await Promise.all([
        api('/me'),
        api('/me/tickets'),
        api('/me/referrals')
      ]);
      
      if (r1.ok) {
        const user = d1;
        if (r4.ok) {
          user.referrals = d4.referrals;
          user.referralCode = d4.code;
        }
        setProfile(user);
        
        // Removed inline raffle fetching
      } else {
        setErrorMsg(d1?.error || `Error ${r1.status}: No se pudo cargar el perfil`);
      }
      if (r2.ok && Array.isArray(d2)) setTickets(d2);
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
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.9, base64: false, allowsEditing: false });
    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      const normalized = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: Math.min(800, asset.width || 800) } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      setProfile((p) => ({ ...p, avatar: `data:image/jpeg;base64,${normalized.base64}` }));
    }
  };

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      // Ensure socials is an object or string as expected. 
      // Assuming backend handles JSON body correctly.
      const payload = { 
        name: profile.name,
        email: profile.email,
        phone: profile.phone, 
        address: profile.address, 
        cedula: profile.cedula,
        dob: profile.dob,
        bio: profile.bio,
        socials: profile.socials || {},
        avatar: profile.avatar
      };

      const { res, data } = await api('/me', {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        Alert.alert('Guardado', 'Perfil actualizado correctamente.');
        setIsEditing(false);
        if (onUserUpdate) onUserUpdate(data.user);
      } else {
        // Log error for debugging
        console.log('Save Profile Error:', data);
        Alert.alert('Error', data.error || 'No se pudo actualizar el perfil.');
      }
    } catch (e) {
      console.error('Save Profile Exception:', e);
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
      `Rifa: ${item.raffleTitle || ''}\nTicket: ${item.number ? formatTicketNumber(item.number, item.digits) : '—'}\nSerial: ${item.serialNumber || '—'}\nEstado: ${item.status}\nFecha: ${item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}\nVía: ${item.via || ''}`
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
            {/* MURAL VIEW */}
            <View style={[styles.card, styles.profileHeader, { alignItems: 'center', paddingVertical: 30 }]}> 
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
              
              <Text style={[styles.itemTitle, { fontSize: 24, marginTop: 12 }]}>{profile.name || 'Usuario'}</Text>
              
              {/* STARS RATING */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, backgroundColor: 'rgba(251, 191, 36, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons key={star} name="star" size={14} color="#fbbf24" />
                ))}
                <Text style={{ color: '#fbbf24', marginLeft: 6, fontWeight: 'bold', fontSize: 12 }}>5.0 (Excelencia)</Text>
              </View>

              {profile.verified && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
                  <Ionicons name="checkmark-circle" size={16} color="#3b82f6" />
                  <Text style={{ color: '#3b82f6', fontWeight: 'bold' }}>Verificado</Text>
                </View>
              )}
              
              <Text style={[styles.muted, { textAlign: 'center', marginTop: 8, paddingHorizontal: 20 }]}>
                {profile.bio || 'Sin biografía.'}
              </Text>

              <View style={{ flexDirection: 'row', gap: 16, marginTop: 16 }}>
                {profile.socials?.whatsapp ? (
                  <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${profile.socials.whatsapp}`)}>
                    <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                  </TouchableOpacity>
                ) : null}
                {profile.socials?.instagram ? (
                  <TouchableOpacity onPress={() => Linking.openURL(`https://instagram.com/${profile.socials.instagram.replace('@','')}`)}>
                    <Ionicons name="logo-instagram" size={24} color="#E1306C" />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* MY PUBLICATIONS BUTTON */}
              {(profile.role === 'admin' || profile.role === 'superadmin') && (
                <TouchableOpacity 
                  style={[styles.button, { marginTop: 20, backgroundColor: 'rgba(59, 130, 246, 0.15)', width: 'auto', paddingHorizontal: 24 }]} 
                  onPress={() => navigation.navigate('Rifas', { screen: 'MyPublications' })}
                >
                  <Ionicons name="list-outline" size={20} color="#3b82f6" />
                  <Text style={{ color: '#3b82f6', fontWeight: 'bold', marginLeft: 8 }}>Mis Publicaciones</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton, { marginTop: 12, width: 'auto', paddingHorizontal: 24 }]} 
                onPress={() => setIsEditing(!isEditing)}
              >
                <Ionicons name={isEditing ? "close-outline" : "create-outline"} size={18} color={palette.primary} />
                <Text style={[styles.secondaryText, { marginLeft: 8 }]}>{isEditing ? 'Cancelar Edición' : 'Editar Perfil'}</Text>
              </TouchableOpacity>
            </View>

            {/* EDIT FORM */}
            {isEditing && (
              <View style={[styles.card, styles.glassCard]}>
                <Text style={styles.section}>Editar Información</Text>
                <TouchableOpacity style={{ alignItems: 'center', marginBottom: 16 }} onPress={pickAvatar}>
                  <Text style={{ color: palette.primary }}>Cambiar Foto de Perfil</Text>
                </TouchableOpacity>

                <Text style={styles.muted}>Nombre</Text>
                <TextInput style={styles.input} value={profile.name} onChangeText={(v) => setProfile(p => ({...p, name: v}))} />

                <Text style={styles.muted}>Biografía</Text>
                <TextInput style={[styles.input, { height: 80 }]} multiline value={profile.bio} onChangeText={(v) => setProfile(p => ({...p, bio: v}))} />

                <Text style={styles.muted}>Teléfono</Text>
                <TextInput style={styles.input} value={profile.phone} onChangeText={(v) => setProfile(p => ({...p, phone: v}))} keyboardType="phone-pad" />

                <Text style={styles.muted}>WhatsApp (Solo números)</Text>
                <TextInput style={styles.input} value={profile.socials?.whatsapp} onChangeText={(v) => setProfile(p => ({...p, socials: {...p.socials, whatsapp: v}}))} keyboardType="phone-pad" />

                <Text style={styles.muted}>Instagram (@usuario)</Text>
                <TextInput style={styles.input} value={profile.socials?.instagram} onChangeText={(v) => setProfile(p => ({...p, socials: {...p.socials, instagram: v}}))} />

                <FilledButton title={saving ? 'Guardando...' : 'Guardar Cambios'} onPress={saveProfile} loading={saving} disabled={saving} />
              </View>
            )}

            {/* REMOVED INLINE ADMIN RAFFLES */}

            <View style={[styles.card, styles.glassCard]}>
              <Text style={styles.section}>Legal</Text>
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
                onPress={() => nav.navigate('Legal')}
              >
                <Ionicons name="document-text-outline" size={24} color={palette.primary} />
                <Text style={{ color: palette.text, marginLeft: 12, fontSize: 16 }}>Términos, Privacidad y Marco Legal</Text>
                <Ionicons name="chevron-forward" size={20} color={palette.muted} style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
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
