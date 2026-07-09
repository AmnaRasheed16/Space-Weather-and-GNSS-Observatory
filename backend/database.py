import logging
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AetherShield.Database")

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "aethershield"

class MockDatabase:
    """Fallback in-memory database that mimics basic MongoDB collections and async operations."""
    def __init__(self):
        self.users = {}
        self.stations = {}
        self.space_weather = []
        self.tec_data = []
        self.uploads = []
        self.is_mock = True
        logger.info("Initializing in-memory mock database fallback.")

    async def ping(self):
        return True

db_client = None
db = None
is_mongo = False

async def get_database():
    global db_client, db, is_mongo
    if db is not None:
        return db, is_mongo

    try:
        # Try connecting to MongoDB with a short timeout
        logger.info(f"Connecting to MongoDB at {MONGO_URI}...")
        client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=2000)
        # Verify connection by triggering a simple command
        await client.admin.command('ping')
        db_client = client
        db = client[DB_NAME]
        is_mongo = True
        logger.info("Successfully connected to MongoDB.")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}. Switching to in-memory database fallback.")
        db = MockDatabase()
        is_mongo = False

    return db, is_mongo
