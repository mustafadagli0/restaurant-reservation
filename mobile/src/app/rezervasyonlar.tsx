import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList,Pressable } from 'react-native';
import { API_BASE_URL } from '@/constants/api';
import { useAuth } from '@/context/auth-context';

export default function RezervasyonlarScreen() {

  type Rezervasyon = {
  id: number;
  restoran_id: number;
  masa_id: number;
  tarih: string;
  baslangic_saati: string;
  bitis_saati: string;
  kisi_sayisi: number;
  durum: string;
};

const { token } = useAuth();
const [rezervasyonlar, setRezervasyonlar] = useState<Rezervasyon[]>([]);
const [yukleniyor, setYukleniyor] = useState(true);
const [hata, setHata] = useState<string | null>(null);

useEffect(() => {
  async function rezervasyonlariGetir() {
    if (!token) {
      setHata('Önce giriş yapmalısın.');
      setYukleniyor(false);
      return;
    }

    try {
      const cevap = await fetch(`${API_BASE_URL}/rezervasyonlar/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!cevap.ok) {
        throw new Error('Rezervasyonlar alınamadı.');
      }

      const veri = await cevap.json();
      setRezervasyonlar(veri);
      setHata(null);
    } catch {
      setHata('Rezervasyonlar yüklenirken bir hata oluştu.');
    } finally {
      setYukleniyor(false);
    }
  }

  rezervasyonlariGetir();
}, [token]);

async function rezervasyonuIptalEt(id: number) {
  if (!token) {
    setHata('Önce giriş yapmalısın.');
    return;
  }

  try {
    const cevap = await fetch(
      `${API_BASE_URL}/rezervasyonlar/${id}/iptal`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const guncelRezervasyon = await cevap.json();

    if (!cevap.ok) {
      throw new Error(guncelRezervasyon.detail ?? 'İptal başarısız.');
    }

    setRezervasyonlar((mevcutlar) =>
      mevcutlar.map((rezervasyon) =>
        rezervasyon.id === id ? guncelRezervasyon : rezervasyon
      )
    );
    setHata(null);
  } catch {
    setHata('Rezervasyon iptal edilemedi.');
  }
}

  return (
    
    <ThemedView>
      {yukleniyor && <ActivityIndicator />}
      {hata && <ThemedText>{hata}</ThemedText>}
      {!yukleniyor && !hata && rezervasyonlar.length === 0 && (
      <ThemedText>Henüz rezervasyonun yok.</ThemedText>
      )}
      <ThemedText type="title">Rezervasyonlarım</ThemedText>
      <FlatList
      data={rezervasyonlar}
      keyExtractor={(rezervasyon) => String(rezervasyon.id)}
      renderItem={({ item }) => (
      <ThemedView type="backgroundElement">
      <ThemedText>Restoran {item.restoran_id} · Masa {item.masa_id}</ThemedText>
      <ThemedText>
        {item.tarih} · {item.baslangic_saati}–{item.bitis_saati}
      </ThemedText>
      <ThemedText>{item.kisi_sayisi} kişi · {item.durum}</ThemedText>
      {item.durum !== 'iptal' && (
      <Pressable onPress={() => rezervasyonuIptalEt(item.id)}>
        <ThemedText>Rezervasyonu İptal Et</ThemedText>
      </Pressable>
      )}
    </ThemedView>
  )}
  
/>
    </ThemedView>
  );
}