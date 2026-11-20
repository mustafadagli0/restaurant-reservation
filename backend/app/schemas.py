from datetime import time,date

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class KullaniciOlustur(BaseModel):
    ad_soyad: str = Field(min_length=1, max_length=100)
    email: EmailStr
    sifre: str = Field(min_length=8, max_length=128)
    rol: str = "musteri"


class KullaniciCikti(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ad_soyad: str
    email: EmailStr
    rol: str


class RestoranOlustur(BaseModel):
    ad: str = Field(min_length=1, max_length=100)
    adres: str = Field(min_length=1, max_length=250)
    telefon: str = Field(min_length=1, max_length=20)
    acilis_saati: time
    kapanis_saati: time
    aciklama: str | None = Field(default=None, max_length=300)


class RestoranCikti(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    isletmeci_id: int
    ad: str
    adres: str
    telefon: str
    acilis_saati: time
    kapanis_saati: time
    aciklama: str | None


class MasaOlustur(BaseModel):
    masa_no: int = Field(gt=0)
    kapasite: int = Field(gt=0)
    konum: str = Field(min_length=1, max_length=50)
    x: int | None = None
    y: int | None = None


class MasaCikti(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    restoran_id: int
    masa_no: int
    kapasite: int
    konum: str
    x: int | None
    y: int | None

class RezervasyonOlustur(BaseModel):
    masa_id: int
    tarih: date
    baslangic_saati: time
    kisi_sayisi: int = Field(gt=0)
    ozel_istek: str | None = Field(default=None, max_length=200)

class RezervasyonCikti(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    kullanıcı_id: int
    restoran_id: int
    masa_id: int
    tarih: date
    baslangic_saati: time
    bitis_saati: time
    kisi_sayisi: int
    durum: str

class KullaniciGiris(BaseModel):
    email: EmailStr
    sifre: str

class TokenCikti(BaseModel):
    access_token: str
    token_type: str = "bearer"