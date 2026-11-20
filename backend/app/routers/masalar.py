from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.security import aktif_kullanici_getir

router = APIRouter(prefix="/restoranlar/{restoran_id}/masalar", tags=["Masalar"])


@router.post("/", response_model=schemas.MasaCikti, status_code=201)
def masa_olustur(
    restoran_id: int,
    veri: schemas.MasaOlustur,
    aktif_kullanici: models.Kullanici = Depends(aktif_kullanici_getir),
    db: Session = Depends(get_db),
):
    restoran = db.get(models.Restoran, restoran_id)
    if restoran is None:
        raise HTTPException(status_code=404, detail="Restoran bulunamadı")

    if (
        aktif_kullanici.rol != "isletmeci"
        or restoran.isletmeci_id != aktif_kullanici.id
    ):
        raise HTTPException(status_code=403, detail="Bu restorana masa ekleme yetkin yok")
    masa = models.Masa(restoran_id=restoran_id, **veri.model_dump())
    db.add(masa)
    db.commit()
    db.refresh(masa)
    return masa


@router.get("/", response_model=list[schemas.MasaCikti])
def masalari_listele(restoran_id: int, db: Session = Depends(get_db)):
    if db.get(models.Restoran, restoran_id) is None:
        raise HTTPException(status_code=404, detail="Restoran bulunamadı")
    return db.scalars(
        select(models.Masa)
        .where(models.Masa.restoran_id == restoran_id)
        .order_by(models.Masa.masa_no)
    ).all()
