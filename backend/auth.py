from datetime import datetime, timedelta
from typing import Optional
import jwt
from fastapi import APIRouter, Depends, HTTPException, status

from backend.database import get_database
from backend.models import UserLogin, Token
from backend.seed_utils import verify_password

SECRET_KEY = "aethershield_super_secret_jwt_key_2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

router = APIRouter(prefix="/api/auth", tags=["auth"])

async def get_current_user(token: str = Depends(lambda: None)):
    return token

def verify_token(auth_header: str) -> dict:
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session token")
        return {"username": username, "role": role}
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired or invalid")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    db, is_mongo = await get_database()
    username = credentials.username
    password = credentials.password
    
    user = None
    if is_mongo:
        user = await db.users.find_one({"username": username})
    else:
        user = db.users.get(username)
        
    if not user or not verify_password(password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": username, "role": user["role"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": username,
        "role": user["role"]
    }
