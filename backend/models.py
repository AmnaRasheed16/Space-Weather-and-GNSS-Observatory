from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime

# --- User & Authentication Models ---
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    role: str = "scientist"  # "admin" or "scientist"

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    role: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    role: str

class TokenData(BaseModel):
    username: Optional[str] = None

# --- GNSS Station Models ---
class StationBase(BaseModel):
    id: str = Field(..., example="IST01")
    name: str = Field(..., example="Islamabad Observatory")
    latitude: float = Field(..., example=33.7294)
    longitude: float = Field(..., example=73.0931)
    receiver_type: str = Field(..., example="Trimble NetR9")
    antenna_type: str = Field(..., example="TRM59800.00")
    data_availability: float = Field(default=100.0, example=98.5)
    status: str = Field(default="active", example="active")

class StationCreate(StationBase):
    pass

class StationResponse(StationBase):
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Space Weather Models ---
class XRayFluxPoint(BaseModel):
    time: str
    value: float

class SpaceWeatherCurrent(BaseModel):
    timestamp: datetime
    kp_index: float
    solar_wind_speed: float
    solar_wind_bt: float
    solar_wind_bz: float
    radio_flux: float
    status_r: str  # e.g., "none", "minor", "moderate", "severe"
    status_s: str
    status_g: str

class SpaceWeatherHistorical(BaseModel):
    xray_flux: List[XRayFluxPoint]
    tec_trend: List[Dict[str, float]] # e.g. [{time: "12:00", value: 12.4}]

# --- Upload Models ---
class UploadResponse(BaseModel):
    id: str
    filename: str
    uploaded_by: str
    uploaded_at: datetime
    status: str
    file_type: str
    station_id: Optional[str] = None
    satellite_count: Optional[int] = None
    epoch_duration: Optional[str] = None

    class Config:
        from_attributes = True
