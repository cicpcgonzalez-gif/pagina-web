import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ActivityIndicator, Image, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../theme';
import { styles } from '../styles';

export default function PublicProfileModal({ visible, onClose, userId, api }) {
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
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(251, 191, 36, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.3)' }}>
                    <Ionicons name="shield-checkmark" size={14} color="#fbbf24" />
                    <Text style={{ color: '#fbbf24', fontSize: 12, fontWeight: 'bold' }}>ID: {profile.securityId || 'N/A'}</Text>
                  </View>
                  
                  {profile.identityVerified && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                      <Ionicons name="checkmark-circle" size={14} color="#3b82f6" />
                      <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: 'bold' }}>Verificado</Text>
                    </View>
                  )}
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 24, marginBottom: 24 }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{profile.stats?.raffles || 0}</Text>
                    <Text style={{ color: '#94a3b8', fontSize: 12 }}>Rifas</Text>
                  </View>
                  <View style={{ width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{profile.stats?.sales || 0}</Text>
                    <Text style={{ color: '#94a3b8', fontSize: 12 }}>Ventas</Text>
                  </View>
                  <View style={{ width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                  <View style={{ alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{profile.reputationScore || 5.0}</Text>
                      <Ionicons name="star" size={14} color="#fbbf24" style={{ marginLeft: 2 }} />
                    </View>
                    <Text style={{ color: '#94a3b8', fontSize: 12 }}>Reputación</Text>
                  </View>
                </View>
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
