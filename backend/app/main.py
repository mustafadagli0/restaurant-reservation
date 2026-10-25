from fastapi import FastAPI
from app import models
from app.database import Base, engine

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Restoran Rezervasyon API")



@app.get("/")

def ana_sayfa():
    return{"mesaj": "Restoran rezervasyon API'si calisiyor"}