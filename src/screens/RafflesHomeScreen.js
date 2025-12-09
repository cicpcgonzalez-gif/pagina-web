import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Animated,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { palette } from '../theme';
import { styles } from '../styles';
import Announcements from '../components/Announcements';
import PublicProfileModal from '../components/PublicProfileModal';
import { FilledButton } from '../components/UI';

export default function RafflesHomeScreen({ navigation, api, user }) {
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [supportVisible, setSupportVisible] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [techSupport, setTechSupport] = useState(null);
  const [viewProfileId, setViewProfileId] = useState(null);
  const [winners, setWinners] = useState([]);
  const heroAnim = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    setLoading(true);
    const { res, data } = await api('/raffles');
    if (res.ok && Array.isArray(data)) {
      const activeOnly = data.filter((r) => r.status !== 'closed');
      setRaffles(activeOnly);
    }
    
    // Load Winners
    try {
      const { res: wRes, data: wData } = await api('/winners');
      if (wRes.ok && Array.isArray(wData)) setWinners(wData.slice(0, 5));
    } catch (e) { console.log('No winners'); }

    // Load Tech Support Settings
    try {
      const { res: sRes, data: sData } = await api('/settings/tech-support');
      if (sRes.ok) setTechSupport(sData);
    } catch (e) { console.log('No tech support config'); }

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
        <View style={{ alignItems: 'center', marginBottom: 20, marginTop: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative' }}>
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 1 }}>MEGA RIFAS</Text>
            {techSupport && (
              <TouchableOpacity 
                onPress={() => setSupportVisible(true)} 
                style={{ position: 'absolute', right: 0, padding: 8 }}
              >
                <Ionicons name="help-circle-outline" size={28} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          <View style={{ height: 4, width: 60, backgroundColor: palette.primary, borderRadius: 2, marginTop: 4 }} />
          
          {/* Wallet Display removed per request */}
        </View>

        {/* Winners Carousel */}
        {winners.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: '#fbbf24', fontSize: 18, fontWeight: 'bold', marginLeft: 16, marginBottom: 12 }}>🏆 Últimos Ganadores</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              {winners.map((w) => (
                <View key={w.id} style={{ width: 140, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.3)' }}>
                  <Image source={{ uri: w.photoUrl || 'https://via.placeholder.com/100' }} style={{ width: 60, height: 60, borderRadius: 30, marginBottom: 8 }} />
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12, textAlign: 'center' }} numberOfLines={1}>{w.winnerName}</Text>
                  <Text style={{ color: '#fbbf24', fontSize: 10, textAlign: 'center' }} numberOfLines={1}>{w.prize}</Text>
                  <Text style={{ color: '#94a3b8', fontSize: 10, marginTop: 4 }}>Ticket #{String(w.ticketNumber).padStart(5, '0')}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

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
                <Text style={styles.heroPillText}>Sorteos Activos</Text>
              </View>
              <TouchableOpacity onPress={load} style={styles.heroPillAlt}>
                <Ionicons name="refresh" size={14} color={palette.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.heroHeading}>Tu oportunidad de ganar hoy.</Text>
            <Text style={styles.heroSub}>Participa en los sorteos más exclusivos con total seguridad.</Text>
          </View>
        </Animated.View>

        <Announcements api={api} onShowProfile={setViewProfileId} />

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color={palette.primary} size="large" />
            <Text style={styles.muted}>Cargando rifas...</Text>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {raffles.map((item, index) => {
              const stats = item.stats || {};
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.95}
                  onPress={() => navigation.navigate('RaffleDetail', { raffle: item })}
                  style={{
                    backgroundColor: '#1e293b',
                    borderRadius: 20,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.1)',
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4.65,
                    elevation: 8,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: 'rgba(30, 41, 59, 0.95)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                    <TouchableOpacity 
                      style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                      onPress={() => item.user && setViewProfileId(item.user.id)}
                    >
                      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                         {item.user?.avatar ? (
                           <Image source={{ uri: item.user.avatar }} style={{ width: 36, height: 36, borderRadius: 18 }} />
                         ) : (
                           <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>{item.user?.name?.charAt(0).toUpperCase() || 'M'}</Text>
                         )}
                      </View>
                      <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15, marginRight: 4 }}>
                            {item.user?.name || 'MegaRifas Oficial'}
                          </Text>
                          {item.user?.identityVerified && <Ionicons name="checkmark-circle" size={14} color="#3b82f6" />}
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="shield-checkmark" size={12} color="#fbbf24" style={{ marginRight: 4 }} />
                          <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '600' }}>ID: {item.user?.securityId || 'VERIFICADO'}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>

                  {item.style?.bannerImage ? (
                    <Image source={{ uri: item.style.bannerImage }} style={{ width: '100%', height: 180 }} resizeMode="cover" />
                  ) : (
                    <View style={{ width: '100%', height: 150, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="image-outline" size={48} color="rgba(255,255,255,0.2)" />
                    </View>
                  )}
                  
                  <View style={{ padding: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', flex: 1, marginRight: 8 }}>{item.title}</Text>
                      <View style={{ backgroundColor: 'rgba(251, 191, 36, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.5)' }}>
                        <Text style={{ color: '#fbbf24', fontWeight: '800' }}>VES {item.price}</Text>
                      </View>
                    </View>
                    
                    <Text style={{ color: '#94a3b8', fontSize: 14, marginBottom: 16 }} numberOfLines={2}>{item.description}</Text>
                    
                    <View style={{ marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text style={{ color: '#cbd5e1', fontSize: 12, fontWeight: '600' }}>Progreso</Text>
                        <Text style={{ color: '#cbd5e1', fontSize: 12 }}>{stats.sold || 0} / {item.totalTickets || '∞'}</Text>
                      </View>
                      <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                        <View style={{ width: `${(stats.progress || 0) * 100}%`, height: '100%', backgroundColor: item.style?.accentColor || palette.primary }} />
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="time-outline" size={16} color="#94a3b8" />
                        <Text style={{ color: '#94a3b8', fontSize: 12 }}>Cierra: {item.endDate ? item.endDate.slice(0, 10) : 'Pronto'}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={{ color: palette.primary, fontWeight: '700', fontSize: 14 }}>Jugar ahora</Text>
                        <Ionicons name="arrow-forward" size={16} color={palette.primary} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
            {raffles.length === 0 && <Text style={styles.muted}>No hay rifas activas por el momento.</Text>}
          </View>
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
            {techSupport && (
              <View style={{ marginBottom: 16, padding: 12, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                <Text style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: 4 }}>Soporte Técnico (App)</Text>
                <Text style={styles.muted}>Reportar fallas de la aplicación:</Text>
                {techSupport.phone && <Text style={{ color: '#cbd5e1', marginTop: 4 }}>WhatsApp: {techSupport.phone}</Text>}
                {techSupport.email && <Text style={{ color: '#cbd5e1' }}>Email: {techSupport.email}</Text>}
              </View>
            )}
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
