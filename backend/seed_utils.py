import hashlib
import logging
from datetime import datetime, timedelta

logger = logging.getLogger("AetherShield.SeedUtils")

def hash_password(password: str) -> str:
    salt = "aethershield_super_secret_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

DEFAULT_USERS = [
    {
        "username": "admin",
        "hashed_password": hash_password("admin123"),
        "role": "admin"
    },
    {
        "username": "scientist",
        "hashed_password": hash_password("scientist123"),
        "role": "scientist"
    }
]

DEFAULT_STATIONS = [
    {
        "id": "IST01",
        "name": "Islamabad Observatory (IST)",
        "latitude": 33.7294,
        "longitude": 73.0931,
        "receiver_type": "Trimble NetR9",
        "antenna_type": "TRM59800.00 NONE",
        "data_availability": 98.4,
        "status": "active",
        "created_at": datetime.now() - timedelta(days=60)
    },
    {
        "id": "KHI02",
        "name": "Karachi Coastal Station",
        "latitude": 24.8607,
        "longitude": 67.0011,
        "receiver_type": "Septentrio PolaRx5",
        "antenna_type": "SEPCHOKE_MC NONE",
        "data_availability": 99.1,
        "status": "active",
        "created_at": datetime.now() - timedelta(days=45)
    },
    {
        "id": "PEW03",
        "name": "Peshawar High-Altitude Station",
        "latitude": 34.0151,
        "longitude": 71.5249,
        "receiver_type": "Leica GR50",
        "antenna_type": "LEIAR25.R4 LEIT",
        "data_availability": 95.8,
        "status": "active",
        "created_at": datetime.now() - timedelta(days=30)
    },
    {
        "id": "QTA04",
        "name": "Quetta Valley Station",
        "latitude": 30.1798,
        "longitude": 66.9750,
        "receiver_type": "Trimble NetR9",
        "antenna_type": "TRM59800.00 NONE",
        "data_availability": 84.2,
        "status": "inactive",
        "created_at": datetime.now() - timedelta(days=12)
    }
]
