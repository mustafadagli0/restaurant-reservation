from datetime import datetime, timezone, time, date
from sqlalchemy import DateTime, ForeignKey, String,Time, String, Integer,Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


def simdi():
    return datetime.now(timezone.utc)


class Kullanici(Base):
    __tablename__ = "kullanicilar"

    id: Mapped[int] = mapped_column(primary_key=True)
    ad_soyad: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    sifre_hash: Mapped[str] = mapped_column(String(255))
    rol: Mapped[str] = mapped_column(String(20), default="musteri")
    olusturma_tarihi: Mapped[datetime] = mapped_column(DateTime, default=simdi)

    rezervasyonlar: Mapped[list["Rezervasyon"]] = relationship(back_populates="kullanici")


class Restoran(Base):
    __tablename__ = "restoranlar"

    id: Mapped[int] = mapped_column(primary_key=True)
    isletmeci_id: Mapped[int] = mapped_column(ForeignKey("kullanicilar.id"))
    ad: Mapped[str]=mapped_column(String(100))
    adres: Mapped[str]=mapped_column(String(250))
    telefon: Mapped[str]=mapped_column(String(20),unique=True)
    acilis_saati: Mapped[time]=mapped_column(Time)
    kapanis_saati: Mapped[time]=mapped_column(Time)
    aciklama: Mapped[str]=mapped_column(String(300))
    masalar: Mapped[list["Masa"]] = relationship(back_populates="restoran")
    rezervasyonlar: Mapped[list["Rezervasyon"]] = relationship(back_populates="restoran")


class Masa(Base):
    __tablename__ = "masalar"

    id: Mapped[int] = mapped_column(primary_key=True)
    restoran_id: Mapped[int]=mapped_column(ForeignKey("restoranlar.id"))
    masa_no: Mapped[int]=mapped_column(Integer)
    kapasite: Mapped[int]=mapped_column(Integer)
    konum: Mapped[str]=mapped_column(String(50))
    x: Mapped[int|None]=mapped_column(Integer,nullable=True)
    y: Mapped[int|None]=mapped_column(Integer,nullable=True)
    restoran: Mapped["Restoran"] = relationship(back_populates="masalar")
    rezervasyonlar: Mapped[list["Rezervasyon"]] = relationship(back_populates="masa")


class Rezervasyon(Base):
    __tablename__ = "rezervasyonlar"

    id: Mapped[int] = mapped_column(primary_key=True)
    kullanıcı_id: Mapped[int]=mapped_column(ForeignKey("kullanicilar.id"))
    restoran_id: Mapped[int]=mapped_column(ForeignKey("restoranlar.id"))
    masa_id: Mapped[int]=mapped_column(ForeignKey("masalar.id"))
    tarih: Mapped[date]=mapped_column(Date)
    baslangic_saati: Mapped[time]=mapped_column(Time)
    bitis_saati: Mapped[time]=mapped_column(Time)
    kisi_sayisi: Mapped[int]=mapped_column(Integer)
    durum: Mapped[str]=mapped_column(String(50),default="beklemede")
    ozel_istek: Mapped[str]=mapped_column(String(200))
    olusturma_tarihi: Mapped[datetime]=mapped_column(DateTime,default=datetime.now)
    kullanici: Mapped["Kullanici"] = relationship(back_populates="rezervasyonlar")
    restoran: Mapped["Restoran"] = relationship(back_populates="rezervasyonlar")
    masa: Mapped["Masa"] = relationship(back_populates="rezervasyonlar")