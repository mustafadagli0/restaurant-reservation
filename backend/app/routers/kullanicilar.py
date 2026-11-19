from fastapi import APIRouter, Depends, HTTPException
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/kullanicilar", tags=["Kullanıcılar"])
sifre_araci = PasswordHash.recommended()


@router.post("/", response_model=schemas.KullaniciCikti, status_code=201)
def kullanici_olustur(veri: schemas.KullaniciOlustur, db: Session = Depends(get_db)):
    if veri.rol not in {"musteri", "isletmeci"}:
        raise HTTPException(status_code=400, detail="Rol musteri veya isletmeci olmalı")
    mevcut = db.scalar(select(models.Kullanici).where(models.Kullanici.email == str(veri.email)))
    if mevcut:
        raise HTTPException(status_code=409, detail="Bu e-posta zaten kayıtlı")

    kullanici = models.Kullanici(
        ad_soyad=veri.ad_soyad,
        email=str(veri.email),
        sifre_hash=sifre_araci.hash(veri.sifre),
        rol=veri.rol,
    )
    db.add(kullanici)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Bu e-posta zaten kayıtlı")
    db.refresh(kullanici)
    return kullanici
