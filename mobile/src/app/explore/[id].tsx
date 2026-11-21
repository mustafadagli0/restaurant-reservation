import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { API_BASE_URL } from '@/constants/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RestaurantDetail() {

const { id } = useLocalSearchParams<{ id: string }>();
const [masalar, setMasalar] = useState<{ id: number; kapasite: number }[]>([]);
const [yukleniyor, setYukleniyor] = useState(true);
const [hata, setHata] = useState<string | null>(null);

useEffect(() => {
  async function masalariGetir() {
    try {
      const cevap = await fetch(
        `${API_BASE_URL}/restoranlar/${id}/masalar/`
      );

      if (!cevap.ok) {
        throw new Error('Masalar alınamadı');
      }

      const veri = await cevap.json();
      setMasalar(veri);
    } catch {
      setHata('Masalar yüklenirken bir hata oluştu.');
    } finally {
      setYukleniyor(false);
    }
  }

  masalariGetir();
}, [id]);
const insets = useSafeAreaInsets();

  return (
    <ThemedView style={{ flex: 1, paddingTop: insets.top + 60, paddingHorizontal: 16 }}>
      <ThemedText type="title">Restaurant {id}</ThemedText>
        {yukleniyor && <ActivityIndicator />}
        {hata && <ThemedText>{hata}</ThemedText>}
        <FlatList
            data={masalar}
            keyExtractor={(masa) => String(masa.id)}
            renderItem={({ item }) => (
        <ThemedView>
            <ThemedText>Masa {item.id}</ThemedText>
            <ThemedText>Kapasite: {item.kapasite} kişi</ThemedText>
        </ThemedView>
    )}
/>
    </ThemedView>
  );
}