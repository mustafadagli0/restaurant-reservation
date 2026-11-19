from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/restoranlar", tags=["Restoranlar"])


@router.post("/", response_model=schemas.RestoranCikti, status_code=201)
def restoran_olustur(veri: schemas.RestoranOlustur, db: Session = Depends(get_db)):
    isletmeci = db.get(models.Kullanici, veri.isletmeci_id)
    if not isletmeci or isletmeci.rol != "isletmeci":
        raise HTTPException(status_code=400, detail="Geçerli bir işletmeci bulunamadı")

    alanlar = veri.model_dump(exclude={"aciklama"})
    restoran = models.Restoran(**alanlar, aciklama=veri.aciklama or "")
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
