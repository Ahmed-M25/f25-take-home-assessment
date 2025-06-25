from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn
import requests
import uuid
from datetime import datetime

app = FastAPI(title="Weather Data System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for weather data
weather_storage: Dict[str, Dict[str, Any]] = {}
# WeatherStack API configuration
WEATHERSTACK_API_KEY = "737957feb2c12adb55ddd833de2f09a5"
WEATHERSTACK_BASE_URL = "http://api.weatherstack.com/current"

class WeatherRequest(BaseModel):
    date: str
    location: str
    notes: Optional[str] = ""

class WeatherResponse(BaseModel):
    id: str

def fetch_weather_data(location: str) -> Dict[str, Any]:
    """
    Fetch weather data from WeatherStack API
    """
    try:
        params = {
            "access_key": WEATHERSTACK_API_KEY,
            "query": location,
            "units": "m"
        }
        
        response = requests.get(WEATHERSTACK_BASE_URL, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if "error" in data:
            raise HTTPException(status_code=400, detail=f"Weather API error: {data['error']['info']}")
        
        return data
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch weather data: {str(e)}")

@app.post("/weather", response_model=WeatherResponse)
async def create_weather_request(request: WeatherRequest):
    """
    You need to implement this endpoint to handle the following:
    1. Receive form data (date, location, notes)
    2. Calls WeatherStack API for the location
    3. Stores combined data with unique ID in memory
    4. Returns the ID to frontend
    """
    try:
        # Generate unique ID
        weather_id = str(uuid.uuid4())
        
        # Fetch weather data from WeatherStack API
        weather_data = fetch_weather_data(request.location)
        
        # Combine form data with weather data
        combined_data = {
            "id": weather_id,
            "date": request.date,
            "location": request.location,
            "notes": request.notes,
            "weather_data": weather_data,
            "created_at": datetime.now().isoformat()
        }
        
        # Store in memory
        weather_storage[weather_id] = combined_data
        
        print(f"Created weather request with ID: {weather_id}")
        
        return WeatherResponse(id=weather_id)
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/weather/{weather_id}")
async def get_weather_data(weather_id: str):
    """
    Retrieve stored weather data by ID.
    This endpoint is already implemented for the assessment.
    """
    if weather_id not in weather_storage:
        raise HTTPException(status_code=404, detail="Weather data not found")
    
    return weather_storage[weather_id]


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
