import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState } from 'react';
import { Pressable, TextInput } from 'react-native';
import { API_BASE_URL } from '@/constants/api';
import { useAuth } from '@/context/auth-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HesapScreen() {

const [email, setEmail] = useState('');
const [sifre, setSifre] = useState('');
const [hata, setHata] = useState<string | null>(null);
const { token, setToken } = useAuth();
const insets = useSafeAreaInsets();
const [adSoyad, setAdSoyad] = useState('');
const [kayitModu, setKayitModu] = useState(false);
const [bilgiMesaji, setBilgiMesaji] = useState<string | null>(null);




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

async function kayitOl() {
  try {
    const cevap = await fetch(`${API_BASE_URL}/kullanicilar/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ad_soyad: adSoyad,
        email,
        sifre,
        rol: 'musteri',
      }),
    });

    const veri = await cevap.json();

    if (!cevap.ok) {
      throw new Error(veri.detail ?? 'Kayıt başarısız.');
    }

    setBilgiMesaji('Hesap oluşturuldu. Şimdi giriş yapabilirsin.');
    setKayitModu(false);
    setHata(null);
  } catch (hata) {
    setHata(
      hata instanceof Error ? hata.message : 'Kayıt sırasında hata oluştu.'
    );
  }
}


  return (
    <ThemedView
    style={{
      flex: 1,
      paddingTop: insets.top + 16,
      paddingHorizontal: 16,
    }}>
      <ThemedText type="title">Hesabım</ThemedText>
      {token ? (
        <>
            <ThemedText>Giriş yapıldı</ThemedText>
            <Pressable onPress={() => setToken(null)}>
              <ThemedText>Çıkış Yap</ThemedText>
            </Pressable>
        </>
        ) : (
        <>
          {kayitModu && (
            <TextInput
              value={adSoyad}
              onChangeText={setAdSoyad}
              placeholder="Ad Soyad"
              autoCapitalize="words"
            />
          )}

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

          <Pressable onPress={kayitModu ? kayitOl : girisYap}>
            <ThemedText>{kayitModu ? 'Kayıt Ol' : 'Giriş Yap'}</ThemedText>
          </Pressable>
      
          <Pressable
            onPress={() => {
              setKayitModu(!kayitModu);
              setHata(null);
              setBilgiMesaji(null);
            }}>
            <ThemedText>
              {kayitModu ? 'Giriş ekranına dön' : 'Hesap oluştur'}
            </ThemedText>
          </Pressable>
        </>
        )}

        {hata && <ThemedText>{hata}</ThemedText>}
        {bilgiMesaji && <ThemedText>{bilgiMesaji}</ThemedText>}
    </ThemedView>
  );
}