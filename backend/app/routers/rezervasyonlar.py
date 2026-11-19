from datetime import datetime, timedelta,date,time
from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from app import schemas, models
from app.database import get_db
from sqlalchemy import select

router = APIRouter(prefix="/rezervasyonlar", tags=["Rezervasyonlar"])

def bitis_saati_hesapla(tarih: date, baslangic: time) -> time:
    baslangic_dt = datetime.combine(tarih, baslangic)
    bitis_dt = baslangic_dt + timedelta(minutes=90)
    return bitis_dt.time()

@router.post("/", response_model=schemas.RezervasyonCikti, status_code=201)
def rezervasyon_olustur(veri: schemas.RezervasyonOlustur, db: 
    Session = Depends(get_db)):
        kullanici = db.get(models.Kullanici, veri.kullanıcı_id)
        if kullanici is None:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
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
        kullanıcı_id=veri.kullanıcı_id,
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
        