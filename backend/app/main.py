from fastapi import FastAPI
from app.routers import kullanicilar, masalar, restoranlar, rezervasyonlar
from app import models
from app.database import Base, engine


Base.metadata.create_all(bind=engine)
app = FastAPI(title="Restoran Rezervasyon API")


@app.get("/")
def ana_sayfa():
    return {"mesaj": "Restoran rezervasyon API'si calisiyor"}


app.include_router(kullanicilar.router)
app.include_router(restoranlar.router)
app.include_router(masalar.router)
app.include_router(rezervasyonlar.router)
