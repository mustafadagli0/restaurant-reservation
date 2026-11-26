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
const [rol, setRol] = useState<'musteri' | 'isletmeci'>('musteri');
const [girisYapanRol, setGirisYapanRol] = useState<'musteri' | 'isletmeci' | null>(null);
const [restoranAdi, setRestoranAdi] = useState('');
const [restoranAdresi, setRestoranAdresi] = useState('');
const [restoranTelefonu, setRestoranTelefonu] = useState('');
const [acilisSaati, setAcilisSaati] = useState('');
const [kapanisSaati, setKapanisSaati] = useState('');
const [aciklama, setAciklama] = useState('');
const [restoranId, setRestoranId] = useState<number | null>(null);
const [restoranlarim, setRestoranlarim] = useState<
  { id: number; ad: string; adres: string }[]
>([]);
const [masaNo, setMasaNo] = useState('');
const [masaKapasitesi, setMasaKapasitesi] = useState('');
const [masaKonumu, setMasaKonumu] = useState('');



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

    const profilCevap = await fetch(`${API_BASE_URL}/kullanicilar/ben`, {
      headers: { Authorization: `Bearer ${veri.access_token}` },
    });

    if (!profilCevap.ok) {
      throw new Error('Kullanıcı bilgisi alınamadı.');
    }

    const profil: { rol: 'musteri' | 'isletmeci' } = await profilCevap.json();
    if (profil.rol === 'isletmeci') {
    const restoranCevap = await fetch(`${API_BASE_URL}/restoranlar/benim`, {
      headers: { Authorization: `Bearer ${veri.access_token}` },
    });

    if (!restoranCevap.ok) {
      throw new Error('İşletmeci restoranları alınamadı.');
    }

    const restoranVerileri: { id: number; ad: string; adres: string }[] =
      await restoranCevap.json();

    setRestoranlarim(restoranVerileri);
  } else {
    setRestoranlarim([]);
  }

    setToken(veri.access_token);
    setGirisYapanRol(profil.rol);
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
        rol,
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

async function restoranOlustur() {
  try {
    const cevap = await fetch(`${API_BASE_URL}/restoranlar/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ad: restoranAdi,
        adres: restoranAdresi,
        telefon: restoranTelefonu,
        acilis_saati: acilisSaati,
        kapanis_saati: kapanisSaati,
        aciklama,
      }),
    });

    const veri = await cevap.json();

    if (!cevap.ok) {
      throw new Error(veri.detail ?? 'Restoran oluşturulamadı.');
    }
    setRestoranId(veri.id);
    setRestoranlarim((onceki) => [
    ...onceki,
    { id: veri.id, ad: veri.ad, adres: veri.adres },
    ]);

    setBilgiMesaji(`Restoran oluşturuldu: ${veri.ad}`);
    setHata(null);
  } catch (hata) {
    setHata(
      hata instanceof Error ? hata.message : 'Restoran oluşturulurken hata oluştu.'
    );
  }
}

async function masaOlustur() {
  if (restoranId === null) {
    setHata('Önce restoran oluşturmalısın.');
    return;
  }

  try {
    const cevap = await fetch(
      `${API_BASE_URL}/restoranlar/${restoranId}/masalar/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          masa_no: Number(masaNo),
          kapasite: Number(masaKapasitesi),
          konum: masaKonumu,
        }),
      }
    );

    const veri = await cevap.json();

    if (!cevap.ok) {
        const detay =
        typeof veri.detail === 'string'
        ? veri.detail
        : JSON.stringify(veri.detail);

        throw new Error(detay ?? 'Masa oluşturulamadı.');
    }

    setBilgiMesaji(`Masa ${veri.masa_no} oluşturuldu.`);
    setHata(null);
    setMasaNo('');
    setMasaKapasitesi('');
    setMasaKonumu('');
  } catch (hata) {
    setHata(
      hata instanceof Error ? hata.message : 'Masa oluşturulurken hata oluştu.'
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
            {girisYapanRol === 'isletmeci' && (
          <>
          <ThemedText type="subtitle">Restoranlarım</ThemedText>

          {restoranlarim.length === 0 ? (
            <ThemedText>Henüz kayıtlı restoranın yok.</ThemedText>
          ) : (
            restoranlarim.map((restoran) => (
              <Pressable
                key={restoran.id}
                onPress={() => setRestoranId(restoran.id)}
              >
                <ThemedText>
                  {restoran.ad}{restoranId === restoran.id ? ' (Seçili)' : ''}
                </ThemedText>
                <ThemedText>{restoran.adres}</ThemedText>
              </Pressable>
            ))
          )}
            <TextInput
              value={restoranAdi}
              onChangeText={setRestoranAdi}
              placeholder="Restoran adı"
            />
            <TextInput value={restoranAdresi} onChangeText={setRestoranAdresi} placeholder="Adres" />
            <TextInput value={restoranTelefonu} onChangeText={setRestoranTelefonu} placeholder="Telefon" />
            <TextInput value={acilisSaati} onChangeText={setAcilisSaati} placeholder="Açılış saati (örn. 09:00)" />
            <TextInput value={kapanisSaati} onChangeText={setKapanisSaati} placeholder="Kapanış saati (örn. 22:00)" />
            <TextInput value={aciklama} onChangeText={setAciklama} placeholder="Açıklama (isteğe bağlı)" />
            <Pressable onPress={restoranOlustur}>
                <ThemedText>Restoran Oluştur</ThemedText>
            </Pressable>
            {restoranId !== null && (
              
              <>
                <ThemedText type="subtitle">Masa ekle</ThemedText>

                <TextInput
                  value={masaNo}
                  onChangeText={setMasaNo}
                  placeholder="Masa numarası"
                  keyboardType="numeric"
                />

                <TextInput
                  value={masaKapasitesi}
                  onChangeText={setMasaKapasitesi}
                  placeholder="Kaç kişilik?"
                  keyboardType="numeric"
                />

                <TextInput
                  value={masaKonumu}
                  onChangeText={setMasaKonumu}
                  placeholder="Konum (örn. Bahçe)"
                />
                <Pressable onPress={masaOlustur}>
                    <ThemedText>Masa Ekle</ThemedText>
                </Pressable>
              </>
            )}
            </>
        )}
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
          {kayitModu && (
          <>
            <ThemedText>Hesap türü</ThemedText>

            <Pressable onPress={() => setRol('musteri')}>
              <ThemedText>
                {rol === 'musteri' ? '✓ Müşteri' : 'Müşteri'}
              </ThemedText>
            </Pressable>

            <Pressable onPress={() => setRol('isletmeci')}>
              <ThemedText>
                {rol === 'isletmeci' ? '✓ İşletmeci' : 'İşletmeci'}
              </ThemedText>
            </Pressable>
          </>
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