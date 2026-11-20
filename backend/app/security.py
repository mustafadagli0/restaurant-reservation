import os
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app import models
from app.database import get_db

load_dotenv()
SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if SECRET_KEY is None:
    raise RuntimeError("JWT_SECRET_KEY backend/.env dosyasında tanımlı değil")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def token_olustur(kullanici_id: int) -> str:
    sona_erme = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    bilgiler = {"sub": str(kullanici_id), "exp": sona_erme}
    return jwt.encode(bilgiler, SECRET_KEY, algorithm=ALGORITHM)

bearer_sema = HTTPBearer()
def aktif_kullanici_getir(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_sema),
    db: Session = Depends(get_db),
):
    try:
        bilgiler = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
        kullanici_id = int(bilgiler["sub"])
    except (jwt.InvalidTokenError, KeyError, TypeError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Geçersiz veya süresi dolmuş token",
        )

    kullanici = db.get(models.Kullanici, kullanici_id)
    if kullanici is None:
        raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")

    return kullanici