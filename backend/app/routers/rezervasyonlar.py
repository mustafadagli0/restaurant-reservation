from datetime import datetime, timedelta,date,time
from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from app import schemas, models
from app.database import get_db
from sqlalchemy import select
from app.security import aktif_kullanici_getir


router = APIRouter(prefix="/rezervasyonlar", tags=["Rezervasyonlar"])

def bitis_saati_hesapla(tarih: date, baslangic: time) -> time:
    baslangic_dt = datetime.combine(tarih, baslangic)
    bitis_dt = baslangic_dt + timedelta(minutes=90)
    return bitis_dt.time()

@router.post("/", response_model=schemas.RezervasyonCikti, status_code=201)
def rezervasyon_olustur(veri: schemas.RezervasyonOlustur,
    aktif_kullanici: models.Kullanici = Depends(aktif_kullanici_getir),
    db: Session = Depends(get_db),):
        masa = db.get(models.Masa, veri.masa_id)
        if masa is None:
            raise HTTPException(status_code=404, detail="Masa bulunamadı")
        if veri.kisi_sayisi > masa.kapasite:
            raise HTTPException(status_code=400, detail="Masa kişi sayısı için yetersiz")
        bitis_saati = bitis_saati_hesapla(veri.tarih, veri.baslangic_saati)
        if bitis_saati <= veri.baslangic_saati:
            raise HTTPException(status_code=400, detail="Rezervasyon gece yarısını aşamaz")
        if (
            veri.baslangic_saati < masa.restoran.acilis_saati
            or bitis_saati > masa.restoran.kapanis_saati
            ):
            raise HTTPException(status_code=400, detail="Restoran bu saatlerde açık değil")
        
        cakisan_rezervasyon = db.scalar(
        select(models.Rezervasyon).where(
        models.Rezervasyon.masa_id == veri.masa_id,
        models.Rezervasyon.tarih == veri.tarih,
        models.Rezervasyon.durum != "iptal",
        models.Rezervasyon.baslangic_saati < bitis_saati,
        models.Rezervasyon.bitis_saati > veri.baslangic_saati,
    )
)
        if cakisan_rezervasyon is not None:
            raise HTTPException(
            status_code=409,
            detail="Bu masa bu saatlerde zaten rezerve edilmiş",
        )
        rezervasyon = models.Rezervasyon(
        kullanıcı_id=aktif_kullanici.id,
        restoran_id=masa.restoran_id,
        masa_id=masa.id,
        tarih=veri.tarih,
        baslangic_saati=veri.baslangic_saati,
        bitis_saati=bitis_saati,
        kisi_sayisi=veri.kisi_sayisi,
        ozel_istek=veri.ozel_istek or "",
)
        db.add(rezervasyon)
        db.commit()
        db.refresh(rezervasyon)
        return rezervasyon


@router.get("/", response_model=list[schemas.RezervasyonCikti])
def rezervasyonlari_listele(aktif_kullanici: models.Kullanici = Depends(aktif_kullanici_getir),
    db: Session = Depends(get_db),):
    kullanici = db.get(models.Kullanici, aktif_kullanici.id)
    if kullanici is None:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    rezervasyon_sorgusu = select(models.Rezervasyon).where(
    models.Rezervasyon.kullanıcı_id == aktif_kullanici.id
)
    return db.scalars(rezervasyon_sorgusu).all()

@router.patch("/{rezervasyon_id}/iptal", response_model=schemas.RezervasyonCikti)
def rezervasyonu_iptal_et(rezervasyon_id: int,
    aktif_kullanici: models.Kullanici = Depends(aktif_kullanici_getir),
    db: Session = Depends(get_db),):
    rezervasyon = db.get(models.Rezervasyon, rezervasyon_id)
    if rezervasyon is None:
        raise HTTPException(status_code=404, detail="Rezervasyon bulunamadı")
    if rezervasyon.kullanıcı_id != aktif_kullanici.id:
        raise HTTPException(status_code=403, detail="Bu rezervasyonu iptal etme yetkin yok")
    rezervasyon.durum = "iptal"
    db.commit()
    db.refresh(rezervasyon)
    return rezervasyon