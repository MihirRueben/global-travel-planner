import os
import json
import httpx
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from typing import Dict, Any
from dotenv import load_dotenv

from schemas import ItineraryGenerationSchema
from llm_engine import generate_itinerary

load_dotenv()

app = FastAPI(title="Travel Engine API")

# Allowing the React local server port to access the API without CORS blocking
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connecting to Neon Postgres
engine = create_engine(os.getenv("NEON_DATABASE_URL"))
SessionLocal = sessionmaker(autocommit=False, autoflush=False,bind=engine)

# Dependency to handle the database connections per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/system/seed")
async def seed_countries(db: Session = Depends(get_db)):
    """Creates the structural tables if they don't exist, then seeds from open mirror"""
    
    # 💡 STEP 1: Auto-generate the complete relational table schema layout inside Neon
    table_creation_queries = [
        """
        CREATE TABLE IF NOT EXISTS countries (
            cca3 VARCHAR(3) PRIMARY KEY,
            common_name VARCHAR(100) NOT NULL,
            official_name VARCHAR(150),
            region VARCHAR(50),
            subregion VARCHAR(50),
            languages JSONB,
            currencies JSONB,
            capital VARCHAR(100),
            latlng DOUBLE PRECISION[]
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS travel_itineraries (
            id SERIAL PRIMARY KEY,
            country_code VARCHAR(3) REFERENCES countries(cca3),
            title VARCHAR(200) NOT NULL,
            total_days INT NOT NULL,
            user_preferences TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS itinerary_days (
            id SERIAL PRIMARY KEY,
            itinerary_id INT REFERENCES travel_itineraries(id) ON DELETE CASCADE,
            day_number INT NOT NULL,
            theme VARCHAR(100),
            activities JSONB NOT NULL
        );
        """
    ]
    
    try:
        for stmt in table_creation_queries:
            db.execute(text(stmt))
        db.commit()
    except Exception as db_err:
        raise HTTPException(status_code=500, detail=f"Database structure generation crash: {str(db_err)}")

    # 💡 STEP 2: Fetching the global data from the open repository mirror
    mirror_url = "https://raw.githubusercontent.com/mledoze/countries/master/dist/countries.json"
    
    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        try:
            res = await client.get(mirror_url)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to connect to dataset mirror: {str(e)}")

        if res.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Dataset mirror responded with error: {res.status_code}")
            
        data = res.json()

    # 💡 STEP 3: Populating fresh tables with the downloaded parameters
    query = text("""
        INSERT INTO countries (cca3, common_name, official_name, region, subregion, languages, currencies, capital, latlng)
        VALUES (:cca3, :common, :official, :region, :subregion, :languages, :currencies, :capital, :latlng)
        ON CONFLICT (cca3) DO NOTHING;
    """)
    
    inserted_count = 0
    for c in data:
        if not isinstance(c, dict):
            continue
            
        cca3 = c.get('cca3') or c.get('cca2', '') + 'X'
        if not cca3 or len(cca3) != 3: 
            continue
        
        name_obj = c.get('name', {})
        common_name = name_obj.get('common', 'Unknown')
        official_name = name_obj.get('official', 'Unknown')
        
        capital_list = c.get('capital', [])
        capital = capital_list[0] if isinstance(capital_list, list) and len(capital_list) > 0 else 'Unknown'
        latlng = c.get('latlng', [0.0, 0.0])

        try:
            db.execute(query, {
                "cca3": cca3.upper(),
                "common": common_name,
                "official": official_name,
                "region": c.get('region', 'Unknown'),
                "subregion": c.get('subregion', 'Unknown'),
                "languages": json.dumps(c.get('languages', {})),
                "currencies": json.dumps(c.get('currencies', {})),
                "capital": capital,
                "latlng": latlng
            })
            inserted_count += 1
        except Exception:
            continue
            
    db.commit()
    return {"message": "Tables created and seeded successfully!", "records_processed": inserted_count}

@app.post("/itinerary/generate")
def create_itinerary(country_code: str, days: int, preferences: str, db: Session = Depends(get_db)):
    """Fetches localized data, feeds it to Gemini, records the result, and returns it"""
    # 1. Fetch metadata from Neon local store
    country = db.execute(
        text("SELECT * FROM countries WHERE UPPER(cca3) = :code"), {"code": country_code.upper()}
    ).mappings().first()
    
    if not country:
        raise HTTPException(status_code=404, detail="Country code not found. Please run the /system/seed endpoint first.")
        
    country_payload = {
        "name": country["common_name"],
        "region": country["region"],
        "languages": json.loads(country["languages"]),
        "currencies": json.loads(country["currencies"]),
        "capital": country["capital"]
    }
    
    # 2. Fire the processed data packet to Gemini
    structured_data = generate_itinerary(country_payload, preferences, days)
    
    # 3. Write structural parent and child fields back into Neon Postgres
    parent_stmt = text("""
        INSERT INTO travel_itineraries (country_code, title, total_days, user_preferences)
        VALUES (:code, :title, :days, :pref) RETURNING id;
    """)
    parent_id = db.execute(parent_stmt, {
        "code": country_code.upper(), "title": structured_data.title,
        "days": structured_data.total_days, "pref": preferences
    }).scalar()
    
    day_stmt = text("""
        INSERT INTO itinerary_days (itinerary_id, day_number, theme, activities)
        VALUES (:itinerary_id, :day_num, :theme, :activities);
    """)
    for day in structured_data.days:
        db.execute(day_stmt, {
            "itinerary_id": parent_id, "day_num": day.day_number,
            "theme": day.theme, "activities": json.dumps([a.model_dump() for a in day.activities])
        })
    db.commit()
    
    return {"itinerary_id": parent_id, "data": structured_data.model_dump()}
