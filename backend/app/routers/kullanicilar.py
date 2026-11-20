from fastapi import APIRouter, Depends, HTTPException
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.security import token_olustur

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

@router.post("/giris", response_model=schemas.TokenCikti)
def giris_yap(veri: schemas.KullaniciGiris, db: Session = Depends(get_db)):
    kullanici = db.scalar(
        select(models.Kullanici).where(models.Kullanici.email == str(veri.email))
    )
    if kullanici is None or not sifre_araci.verify(veri.sifre, kullanici.sifre_hash):
        raise HTTPException(
        status_code=401,
        detail="E-posta veya şifre hatalı",
    )
    access_token = token_olustur(kullanici.id)
    return schemas.TokenCikti(access_token=access_token)
