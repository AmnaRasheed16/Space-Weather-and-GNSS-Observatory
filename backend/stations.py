from datetime import datetime
from fastapi import APIRouter, Request, HTTPException, status

from backend.database import get_database
from backend.auth import verify_token
from backend.models import StationCreate, StationResponse

router = APIRouter(prefix="/api/stations", tags=["stations"])

@router.get("")
async def get_stations_endpoint(request: Request):
    auth_header = request.headers.get("Authorization")
    verify_token(auth_header)
    
    db, is_mongo = await get_database()
    if is_mongo:
        cursor = db.stations.find({})
        stations = []
        async for doc in cursor:
            doc["created_at"] = doc["created_at"].isoformat() if isinstance(doc.get("created_at"), datetime) else doc.get("created_at")
            doc.pop("_id", None)
            stations.append(doc)
    else:
        stations = list(db.stations.values())
        for doc in stations:
            if isinstance(doc.get("created_at"), datetime):
                doc["created_at"] = doc["created_at"].isoformat()
    return stations

@router.post("", response_model=StationResponse)
async def create_station(station: StationCreate, request: Request):
    auth_header = request.headers.get("Authorization")
    user_info = verify_token(auth_header)
    
    if user_info["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Only Administrators can register new GNSS Stations."
        )
        
    db, is_mongo = await get_database()
    new_station = station.dict()
    new_station["created_at"] = datetime.now()
    
    if is_mongo:
        exists = await db.stations.find_one({"id": station.id})
        if exists:
            raise HTTPException(status_code=400, detail="Station ID already registered")
        await db.stations.insert_one(new_station)
    else:
        if station.id in db.stations:
            raise HTTPException(status_code=400, detail="Station ID already registered")
        db.stations[station.id] = new_station
        
    new_station["created_at"] = new_station["created_at"].isoformat()
    return new_station
