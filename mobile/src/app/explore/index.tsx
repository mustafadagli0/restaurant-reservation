import { Platform, ScrollView, StyleSheet,Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { API_BASE_URL } from '@/constants/api';
import { useEffect, useState } from 'react';
import { Link } from 'expo-router';



type Restoran = {
  id: number;
  ad: string;
  adres: string;
};


export default function TabTwoScreen() {

  const [restoranlar, setRestoranlar] = useState<Restoran[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hataMesaji, setHataMesaji] = useState<string | null>(null);

  useEffect(() => {
  async function restoranlariGetir() {
    try {
      const cevap = await fetch(`${API_BASE_URL}/restoranlar/`);

      if (!cevap.ok) {
        throw new Error('Restoranlar alınamadı');
      }

      const veri: Restoran[] = await cevap.json();
      setRestoranlar(veri);
    } catch (hata) {
      console.error(hata);
      setHataMesaji('Could not load restaurants. Please try again.');
    }
    finally {
      setYukleniyor(false);
    }
  }

  restoranlariGetir();
}, []);

  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="subtitle">Restaurants</ThemedText>
          {yukleniyor && (
            <ThemedText type="small">Loading restaurants...</ThemedText>
          )}
          {hataMesaji && (
            <ThemedText type="small">{hataMesaji}</ThemedText>
          )}
          {!yukleniyor && !hataMesaji && restoranlar.length === 0 && (
          <ThemedText type="small">No restaurants available yet.</ThemedText>
          )}
          {restoranlar.map((restoran) => (
            
            <Link
              key={restoran.id}
              href={{
                pathname: '/explore/[id]',
                params: { id: String(restoran.id) },
              }}
              asChild>
              <Pressable>
                <ThemedView
                  type="backgroundElement"
                  style={styles.restaurantCard}>
                  <ThemedText>{restoran.ad}</ThemedText>
                  <ThemedText type="small">{restoran.adres}</ThemedText>
                </ThemedView>
              </Pressable>
            </Link>
          ))}

         
        </ThemedView>

        
        {Platform.OS === 'web' && <WebBadge />}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  restaurantCard: {
  alignSelf: 'stretch',
  padding: Spacing.three,
  borderRadius: Spacing.three,
  gap: Spacing.one,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
  },
  titleContainer: {
    gap: Spacing.three,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  centerText: {
    textAlign: 'center',
  },
});
