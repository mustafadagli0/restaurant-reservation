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
          </>
        )}

        {hata && <ThemedText>{hata}</ThemedText>}
    </ThemedView>
  );
}