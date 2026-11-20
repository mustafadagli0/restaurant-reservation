from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.security import aktif_kullanici_getir

router = APIRouter(prefix="/restoranlar", tags=["Restoranlar"])


@router.post("/", response_model=schemas.RestoranCikti, status_code=201)
def restoran_olustur(veri: schemas.RestoranOlustur,
    aktif_kullanici: models.Kullanici = Depends(aktif_kullanici_getir),
    db: Session = Depends(get_db),):
    if aktif_kullanici.rol != "isletmeci":
        raise HTTPException(
        status_code=403,
        detail="Yalnızca işletmeciler restoran oluşturabilir",
    )

    alanlar = veri.model_dump(exclude={"aciklama"})
    restoran = models.Restoran(
    **alanlar,
    isletmeci_id=aktif_kullanici.id,
    aciklama=veri.aciklama or "",
    )
    db.add(restoran)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Bu telefon numarası zaten kayıtlı")
    db.refresh(restoran)
    return restoran


@router.get("/", response_model=list[schemas.RestoranCikti])
def restoranlari_listele(db: Session = Depends(get_db)):
    return db.scalars(select(models.Restoran).order_by(models.Restoran.id)).all()
