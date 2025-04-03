from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
from typing import List, Optional
import os
import requests
import json
import feedparser
import numpy as np
from sklearn.linear_model import LinearRegression
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Fetch API keys from environment variables
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
MAPBOX_API_KEY = os.getenv("MAPBOX_API_KEY")

app = FastAPI(title="Supply Chain Resilience API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Weather API Integration
# ---------------------------
class WeatherData:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "http://api.openweathermap.org/data/2.5/weather?"

    def get_weather_data(self, city):
        complete_url = f"{self.base_url}q={city}&appid={self.api_key}&units=metric"
        response = requests.get(complete_url)
        data = response.json()
        if data.get("cod") == "404":
            return None, None
        else:
            weather_info = data["main"]
            weather_description = data["weather"][0]["description"]
            return weather_info, weather_description

# ---------------------------
# Mapbox API Integration
# ---------------------------
class MapboxData:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.mapbox.com/geocoding/v5/mapbox.places/"

    def get_geolocation(self, place_name):
        complete_url = f"{self.base_url}{place_name}.json?access_token={self.api_key}"
        response = requests.get(complete_url)
        data = response.json()
        if data.get("features"):
            location = data["features"][0]["geometry"]["coordinates"]
            return location
        else:
            return None

# ---------------------------
# News API Integration
# ---------------------------
class NewsData:
    def __init__(self, rss_url):
        self.rss_url = rss_url

    def get_news(self):
        feed = feedparser.parse(self.rss_url)
        news_list = []
        for entry in feed.entries[:5]:  # Get first 5 entries
            news_list.append({
                "title": entry.title, 
                "link": entry.link, 
                "published": entry.published
            })
        return news_list

# ---------------------------
# Predictive Model
# ---------------------------
class PredictiveModel:
    def __init__(self):
        self.model = LinearRegression()

    def train_model(self, data):
        time_steps = np.array([item[0] for item in data]).reshape(-1, 1)
        values = np.array([item[1] for item in data])
        self.model.fit(time_steps, values)

    def predict(self, future_time_steps):
        future_time_steps = np.array(future_time_steps).reshape(-1, 1)
        return self.model.predict(future_time_steps)

# Initialize services
weather_api = WeatherData(WEATHER_API_KEY)
mapbox_api = MapboxData(MAPBOX_API_KEY)
news_api = NewsData("https://rss.nytimes.com/services/xml/rss/nyt/World.xml")
predictive_model = PredictiveModel()

# Mock data for the predictive model
mock_data = [(1, 200), (2, 220), (3, 240), (4, 260), (5, 280)]
predictive_model.train_model(mock_data)

# ---------------------------
# API Routes
# ---------------------------

# Weather data endpoint
@app.get("/api/weather/{city}")
async def get_weather(city: str):
    weather_info, weather_description = weather_api.get_weather_data(city)
    if not weather_info:
        raise HTTPException(status_code=404, detail="City not found")
    return {
        "city": city,
        "temperature": weather_info["temp"],
        "humidity": weather_info["humidity"],
        "pressure": weather_info["pressure"],
        "description": weather_description
    }

# Geolocation endpoint
@app.get("/api/location/{place}")
async def get_location(place: str):
    location = mapbox_api.get_geolocation(place)
    if not location:
        raise HTTPException(status_code=404, detail="Place not found")
    return {
        "place": place,
        "coordinates": location
    }

# Route planning endpoint
@app.get("/api/route")
async def get_route(origin: str, destination: str):
    # This would normally call a routing service
    # For now, we'll return mock data
    return {
        "origin": origin,
        "destination": destination,
        "distance": 450,  # miles
        "duration": 510,  # minutes
        "recommended_departure": "06:00",
        "route_recommendation": "Based on current conditions, we recommend taking the northern route to avoid traffic congestion and potential weather delays."
    }

# News endpoint
@app.get("/api/news")
async def get_news():
    news = news_api.get_news()
    return {"news": news}

# Prediction endpoint
@app.get("/api/predict")
async def get_prediction(steps: int = 3):
    future_steps = list(range(6, 6 + steps))
    predictions = predictive_model.predict(future_steps).tolist()
    return {
        "steps": future_steps,
        "predictions": predictions
    }

# Risk assessment endpoint
@app.get("/api/risk")
async def get_risk_assessment(origin: str, destination: str, item_type: str = "standard"):
    # Mock risk assessment based on inputs
    risk_levels = {
        "standard": "Low",
        "perishable": "Medium",
        "fragile": "Medium",
        "hazardous": "High"
    }
    
    risk_level = risk_levels.get(item_type, "Low")
    
    # Get weather for both origin and destination
    origin_weather, _ = weather_api.get_weather_data(origin)
    dest_weather, _ = weather_api.get_weather_data(destination)
    
    # Adjust risk based on weather
    weather_risk = "Low"
    if origin_weather and dest_weather:
        if origin_weather["temp"] > 30 or dest_weather["temp"] > 30:
            weather_risk = "Medium"
            if item_type == "perishable":
                risk_level = "High"
    
    return {
        "overall_risk": risk_level,
        "weather_risk": weather_risk,
        "traffic_risk": "Medium",  # Mock data
        "inventory_risk": "Low",   # Mock data
        "risk_factors": [
            "Weather conditions may affect perishable goods" if item_type == "perishable" else None,
            "Traffic delays could impact delivery timeline",
            "Current inventory levels are sufficient for the journey"
        ],
        "recommendation": "Consider adding temperature monitoring for perishable goods due to potential delays in areas with high temperatures." if item_type == "perishable" else "Standard precautions are sufficient for this journey."
    }

# Traffic alerts endpoint
@app.get("/api/traffic")
async def get_traffic_alerts(route: str):
    # Mock traffic data
    return {
        "alerts": [
            {
                "location": "Highway 101 (Mile 78-82)",
                "condition": "Construction",
                "impact": "High",
                "description": "Road construction causing lane closures and significant delays."
            }
        ],
        "recommendation": "Take the alternate route via Highway 280 to avoid the construction zone. This will add 12 miles but save approximately 45 minutes."
    }

# Weather alerts endpoint
@app.get("/api/weather-alerts")
async def get_weather_alerts(route: str):
    # Mock weather alerts
    return {
        "alerts": [
            {
                "location": "Midway Point (Springfield)",
                "condition": "Heavy Rain",
                "impact": "Medium",
                "description": "Heavy rain expected between 2PM-6PM. May cause slight delays."
            },
            {
                "location": "Mountain Pass",
                "condition": "Fog",
                "impact": "Low",
                "description": "Morning fog expected to clear by 9AM."
            }
        ],
        "recommendation": "Plan for a 1-hour buffer in your schedule to account for potential weather delays. The rain at Springfield may slow traffic."
    }

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)

