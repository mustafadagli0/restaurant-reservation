from fastapi import FastAPI
from app.routers import kullanicilar, masalar, restoranlar, rezervasyonlar
from app import models
from app.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware


Base.metadata.create_all(bind=engine)
app = FastAPI(title="Restoran Rezervasyon API")

allowed_origins = [
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://172.20.10.5:8081",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def ana_sayfa():
    return {"mesaj": "Restoran rezervasyon API'si calisiyor"}


app.include_router(kullanicilar.router)
app.include_router(restoranlar.router)
app.include_router(masalar.router)
app.include_router(rezervasyonlar.router)
