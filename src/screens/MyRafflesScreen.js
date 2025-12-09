import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { palette } from '../theme';
import { styles } from '../styles';
import { QRCodePlaceholder, ProgressBar } from '../components/UI';
import { formatTicketNumber } from '../utils';

export default function MyRafflesScreen({ api, navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { res, data } = await api('/me/raffles');
      if (res.ok && Array.isArray(data)) {
        // Filtrar nulos/indefinidos para evitar crasheos en el render
        setItems(data.filter(Boolean));
      } else {
        setItems([]);
      }
    } catch (err) {
      setItems([]);
    }
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
          <View>
            {items.length === 0 ? <Text style={styles.muted}>No tienes rifas compradas.</Text> : null}
            {items.map((item, idx) => {
              if (!item) return null;
              const raffle = item.raffle || {};
              const progress = raffle?.stats?.progress || 0;
              const isWinner = !!item.isWinner;
              const status = isWinner ? 'Ganador' : item.status || 'Activo';
              return (
                <View key={raffle.id || item?.raffleId || `raffle-${idx}`} style={[styles.card, styles.myRaffleCard]}>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={styles.itemTitle}>{raffle.title || 'Rifa'}</Text>
                      <Text style={styles.muted}>{raffle.description}</Text>
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
                      <Text style={{ color: '#e2e8f0', fontWeight: '800', fontSize: 16 }}>
                        {Array.isArray(item.numbers)
                          ? item.numbers.map(n => formatTicketNumber(n, raffle?.digits)).join(', ')
                          : item.numbers
                          ? formatTicketNumber(item.numbers, raffle?.digits)
                          : '—'}
                      </Text>
                    </View>
                  </View>

                  <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8, marginVertical: 8 }}>
                    <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Detalles del Comprador:</Text>
                    <Text style={{ color: '#e2e8f0', fontWeight: '600' }}>
                      {item?.user?.firstName || item?.user?.name || 'Usuario'} {item?.user?.lastName || ''}
                    </Text>
                    <Text style={{ color: '#cbd5e1', fontSize: 12 }}>{item?.user?.phone || '—'}</Text>
                    {item.createdAt && (
                      <Text style={{ color: '#cbd5e1', fontSize: 12, marginTop: 4 }}>
                        Fecha: {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    )}
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginVertical: 8 }}>
                    <View style={{ transform: [{ scale: 0.7 }] }}>
                      <QRCodePlaceholder value={item.serialNumber || `TICKET-${item.id || '000'}`} />
                    </View>
                    <View>
                      <Text style={{ color: '#94a3b8', fontSize: 10 }}>Serial Único</Text>
                      <Text style={{ color: '#fff', fontFamily: 'monospace', fontSize: 12 }}>{item.serialNumber || 'PENDIENTE'}</Text>
                    </View>
                  </View>

                  <ProgressBar progress={progress} color={isWinner ? '#fbbf24' : palette.accent} />
                  <View style={styles.rowBetween}>
                    <Text style={styles.muted}>Estado: {status}</Text>
                    <TouchableOpacity onPress={() => raffle && navigation.navigate('RaffleDetail', { raffle })}>
                      <Text style={styles.link}>Ver rifa</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
