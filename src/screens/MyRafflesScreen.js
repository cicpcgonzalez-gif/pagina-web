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
          <View>
            {items.length === 0 ? <Text style={styles.muted}>No tienes rifas compradas.</Text> : null}
            {items.map((item) => {
              const progress = item.raffle?.stats?.progress || 0;
              const isWinner = !!item.isWinner;
              const status = isWinner ? 'Ganador' : item.status || 'Activo';
              return (
                <View key={item?.raffle?.id || item?.raffleId || String(Math.random())} style={[styles.card, styles.myRaffleCard]}>
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
            })}
          </View>
        )}
      </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
