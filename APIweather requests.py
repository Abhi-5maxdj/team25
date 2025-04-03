import requests

# generated OpenWeatherMap API key
API_KEY = '076252f58fb6775a2b3794aed0da84cc'

# Base URL for the OpenWeatherMap API
BASE_URL = 'http://api.openweathermap.org/data/2.5/weather'

# Function to get the weather
def get_weather(city):
    # Create the complete URL to fetch weather data
    url = f"{BASE_URL}?q={city}&appid={API_KEY}&units=metric"  # units=metric for temperature in Celsius

    # Sending a GET request to the OpenWeatherMap API
    response = requests.get(url)

    # Check if the request was successful
    if response.status_code == 200:
        data = response.json()

        # Extract relevant weather information
        main = data['main']
        weather = data['weather'][0]
        wind = data['wind']

        temperature = main['temp']
        humidity = main['humidity']
        pressure = main['pressure']
        description = weather['description']
        wind_speed = wind['speed']

        # Display the weather details
        print(f"Weather in {city}:")
        print(f"Temperature: {temperature}°C")
        print(f"Humidity: {humidity}%")
        print(f"Pressure: {pressure} hPa")
        print(f"Weather: {description.capitalize()}")
        print(f"Wind Speed: {wind_speed} m/s")
    else:
        print(f"Error: Unable to fetch data for {city}. Status code: {response.status_code}")

# Example usage takes the city name and gives the weather info  
if __name__ == '__main__':
    city = input("Enter city name: ")
    get_weather(city)  # Executing the function
    
