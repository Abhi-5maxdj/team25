import os
import requests
import json
import feedparser
import paho.mqtt.client as mqtt
from kafka import KafkaProducer
from sklearn.linear_model import LinearRegression
import numpy as np
from dotenv import load_dotenv  # Securely load API keys

# Load environment variables from .env file
load_dotenv()

# Fetch API keys from environment variables
# Note: You should have these keys stored in a .env file with proper variable names
WEATHER_API_KEY = "076252f58fb6775a2b3794aed0da84cc"  # or os.getenv("WEATHER_API_KEY")
MAPBOX_API_KEY = "sk.eyJ1Ijoic3ludGF4eCIsImEiOiJjbTkxMDA3NXEwcDBsMmtyeWlycWV5Y2NlIn0.u9-CS63JArkg-BmLSc375A"  # or os.getenv("MAPBOX_API_KEY")


# ---------------------------
# Weather API Integration (OpenWeatherMap)
# ---------------------------
class WeatherData:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "http://api.openweathermap.org/data/2.5/weather?"

    def get_weather_data(self, city):
        complete_url = f"{self.base_url}q={city}&appid={self.api_key}"
        response = requests.get(complete_url)
        data = response.json()
        if data.get("cod") == "404":
            print("City not found.")
            return None, None
        else:
            weather_info = data["main"]
            weather_description = data["weather"][0]["description"]
            return weather_info, weather_description


# ---------------------------
# Mapbox API Integration for Geospatial Data
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
            print("Place not found.")
            return None


# ---------------------------
# Geopolitical News API Integration (RSS Feed)
# ---------------------------
class NewsData:
    def __init__(self, rss_url):
        self.rss_url = rss_url

    def get_news(self):
        feed = feedparser.parse(self.rss_url)
        news_list = []
        for entry in feed.entries:
            news_list.append({"title": entry.title, "link": entry.link, "published": entry.published})
        return news_list


# ---------------------------
# IoT Integration (MQTT)
# ---------------------------
class IoTIntegration:
    def __init__(self, broker_address):
        self.client = mqtt.Client()
        self.client.connect(broker_address)

    def on_message(self, client, userdata, message):
        payload = message.payload.decode("utf-8")
        data = json.loads(payload)
        print(f"Received IoT data: {data}")

    def subscribe_to_sensor_data(self, topic):
        self.client.subscribe(topic)
        self.client.on_message = self.on_message
        self.client.loop_start()


# ---------------------------
# ETL Process (Weather, Mapbox, IoT, Kafka)
# ---------------------------
class ETLProcess:
    def __init__(self, weather_api_key, mapbox_api_key, kafka_server):
        self.weather_api = WeatherData(weather_api_key)
        self.mapbox_api = MapboxData(mapbox_api_key)
        self.producer = KafkaProducer(bootstrap_servers=kafka_server)

    def transform_data(self, city):
        # Fetch weather data
        weather_info, weather_description = self.weather_api.get_weather_data(city)
        if not weather_info:
            return None

        # Fetch geolocation data
        location = self.mapbox_api.get_geolocation(city)
        return {
            "city": city,
            "weather_info": weather_info,
            "weather_description": weather_description,
            "location": location,
        }

    def load_data_to_kafka(self, city):
        transformed_data = self.transform_data(city)
        if transformed_data:
            # Send data to Kafka as JSON message
            self.producer.send('supply_chain_data', json.dumps(transformed_data).encode())
            print(f"Data for {city} sent to Kafka.")

    def run_etl(self, city):
        self.load_data_to_kafka(city)


# ---------------------------
# Predictive Model for Supply Chain Disruptions
# ---------------------------
class PredictiveModel:
    def __init__(self):
        self.model = LinearRegression()

    def train_model(self, data):
        # Assume data is a list of tuples (time_step, value)
        time_steps = np.array([item[0] for item in data]).reshape(-1, 1)
        values = np.array([item[1] for item in data])
        self.model.fit(time_steps, values)

    def predict(self, future_time_steps):
        future_time_steps = np.array(future_time_steps).reshape(-1, 1)
        return self.model.predict(future_time_steps)


# ---------------------------
# Main Integration and Running the Platform
# ---------------------------
def main():
    # Kafka and MQTT settings
    kafka_server = "localhost:9092"
    rss_url = "https://rss.nytimes.com/services/xml/rss/nyt/World.xml"
    broker_address = "localhost"

    # 1. Weather, Geolocation, and IoT Integration
    weather_api = WeatherData(WEATHER_API_KEY)
    mapbox_api = MapboxData(MAPBOX_API_KEY)
    news_api = NewsData(rss_url)
    iot_api = IoTIntegration(broker_address)

    # 2. Start MQTT client to subscribe to IoT sensor data
    iot_api.subscribe_to_sensor_data("supply_chain/sensors")

    # 3. Create ETL process and run it
    etl = ETLProcess(WEATHER_API_KEY, MAPBOX_API_KEY, kafka_server)
    etl.run_etl("New York")  # Example city

    # 4. Predictive Model Example (using mock data)
    model = PredictiveModel()
    data = [(1, 200), (2, 220), (3, 240), (4, 260), (5, 280)]
    model.train_model(data)
    predictions = model.predict([6, 7, 8])
    print(f"Predicted values for next 3 time steps: {predictions}")

    # 5. Geopolitical News Fetch
    news = news_api.get_news()
    print(f"Geopolitical News: {news[:5]}")  # Display first 5 news articles


if __name__ == "__main__":
    main()