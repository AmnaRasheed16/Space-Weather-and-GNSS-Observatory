import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Request, UploadFile, File, Form

from backend.database import get_database
from backend.auth import verify_token
from backend.uploads_utils import get_file_type, parse_rinex_metadata

router = APIRouter(tags=["uploads"])

@router.post("/api/upload")
async def upload_rinex(
    request: Request,
    file: UploadFile = File(...),
    station_id: Optional[str] = Form(None)
):
    auth_header = request.headers.get("Authorization")
    user_info = verify_token(auth_header)
    
    db, is_mongo = await get_database()
    
    contents = await file.read()
    text = contents.decode("utf-8", errors="ignore")
    lines = text.split("\n")[:100]
    
    parsed_metadata = parse_rinex_metadata(lines, station_id)
    file_type = get_file_type(file.filename)
    
    record = {
        "id": str(uuid.uuid4()),
        "filename": file.filename,
        "uploaded_by": user_info["username"],
        "uploaded_at": datetime.now().isoformat(),
        "status": "Completed",
        "file_type": file_type,
        "station_id": parsed_metadata["station_name"][:5].upper() if parsed_metadata["station_name"] else station_id,
        "satellite_count": parsed_metadata["satellite_count"],
        "epoch_duration": "24 Hours (30s sampling)"
    }
    
    if is_mongo:
        await db.uploads.insert_one(record)
    else:
        db.uploads.append(record)
        
    return {
        "status": "Success",
        "record": record,
        "parsed_metadata": parsed_metadata
    }

@router.get("/api/uploads")
async def get_uploads_endpoint(request: Request):
    auth_header = request.headers.get("Authorization")
    verify_token(auth_header)
    
    db, is_mongo = await get_database()
    if is_mongo:
        cursor = db.uploads.find({}).sort("uploaded_at", -1)
        uploads = []
        async for doc in cursor:
            doc.pop("_id", None)
            uploads.append(doc)
    else:
        uploads = sorted(db.uploads, key=lambda x: x["uploaded_at"], reverse=True)
    return uploads
