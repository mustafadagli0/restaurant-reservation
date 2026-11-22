import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList,Pressable,TextInput } from 'react-native';
import { API_BASE_URL } from '@/constants/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function RestaurantDetail() {

const { id } = useLocalSearchParams<{ id: string }>();
const [masalar, setMasalar] = useState<{ id: number; kapasite: number }[]>([]);
const [yukleniyor, setYukleniyor] = useState(true);
const [hata, setHata] = useState<string | null>(null);
const [seciliMasaId, setSeciliMasaId] = useState<number | null>(null);
const [email, setEmail] = useState('');
const [sifre, setSifre] = useState('');
const [token, setToken] = useState<string | null>(null);
const [tarih, setTarih] = useState('');
const [baslangicSaati, setBaslangicSaati] = useState('');
const [kisiSayisi, setKisiSayisi] = useState('');
const [basariMesaji, setBasariMesaji] = useState<string | null>(null);

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

async function girisYap() {
  try {
    const cevap = await fetch(`${API_BASE_URL}/kullanicilar/giris`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, sifre }),
    });

    if (!cevap.ok) {
      throw new Error('Giriş başarısız');
    }

    const veri: { access_token: string } = await cevap.json();
    setToken(veri.access_token);
    setHata(null);
  } catch {
    setHata('Giriş başarısız. E-posta ve şifreni kontrol et.');
  }
}

async function rezervasyonOlustur() {
  if (seciliMasaId === null) {
    setHata('Önce bir masa seç.');
    return;
  }

  if (!token) {
    setHata('Önce giriş yap.');
    return;
  }

  try {
    const cevap = await fetch(`${API_BASE_URL}/rezervasyonlar/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        masa_id: seciliMasaId,
        tarih,
        baslangic_saati: baslangicSaati,
        kisi_sayisi: Number(kisiSayisi),
      }),
    });

    const veri = await cevap.json();

    if (!cevap.ok) {
      throw new Error(veri.detail ?? 'Rezervasyon oluşturulamadı.');
    }

    setBasariMesaji(`Rezervasyon oluşturuldu. No: ${veri.id}`);
    setHata(null);
  } catch (hata) {
    setHata(
      hata instanceof Error ? hata.message : 'Rezervasyon oluşturulamadı.'
    );
  }
}

const insets = useSafeAreaInsets();

  return (
    <ThemedView style={{ flex: 1, paddingTop: insets.top + 60, paddingHorizontal: 16 }}>
      <ThemedText type="title">Restaurant {id}</ThemedText>
        {yukleniyor && <ActivityIndicator />}
        {hata && <ThemedText>{hata}</ThemedText>}
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="E-posta"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          value={sifre}
          onChangeText={setSifre}
          placeholder="Şifre"
          secureTextEntry
        />
        <Pressable onPress={girisYap}>
            <ThemedText>Giriş Yap</ThemedText>
        </Pressable>

        {token && <ThemedText>Giriş başarılı</ThemedText>}
        <TextInput
          value={tarih}
          onChangeText={setTarih}
          placeholder="Tarih (YYYY-AA-GG)"
        />

        <TextInput
          value={baslangicSaati}
          onChangeText={setBaslangicSaati}
          placeholder="Saat (HH:MM:SS)"
        />

        <TextInput
          value={kisiSayisi}
          onChangeText={setKisiSayisi}
          placeholder="Kişi sayısı"
          keyboardType="number-pad"
        />
        <Pressable onPress={rezervasyonOlustur}>
            <ThemedText>Rezervasyon Oluştur</ThemedText>
        </Pressable>
         {basariMesaji && <ThemedText>{basariMesaji}</ThemedText>}
        <FlatList
            data={masalar}
            keyExtractor={(masa) => String(masa.id)}
            renderItem={({ item }) => (
            <Pressable onPress={() => setSeciliMasaId(item.id)}>
                <ThemedView>
                    <ThemedText>
                      Masa {item.id}{seciliMasaId === item.id ? ' (Seçildi)' : ''}
                     </ThemedText>
                    <ThemedText>Kapasite: {item.kapasite} kişi</ThemedText>
                </ThemedView>
            </Pressable>
    )}
/>
    </ThemedView>
  );
}