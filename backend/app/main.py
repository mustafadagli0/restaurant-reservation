from fastapi import FastAPI

app = FastAPI(title="Restoran Rezervasyon API")



@app.get("/")

def ana_sayfa():
    return{"mesaj": "Restoran rezervasyon API'si calisiyor"}