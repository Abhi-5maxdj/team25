// API service for connecting to the backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function fetchWeather(city: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/weather/${encodeURIComponent(city)}`)
    if (!response.ok) {
      throw new Error("Weather data not available")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching weather data:", error)
    return null
  }
}

export async function fetchLocation(place: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/location/${encodeURIComponent(place)}`)
    if (!response.ok) {
      throw new Error("Location data not available")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching location data:", error)
    return null
  }
}

export async function fetchRoute(origin: string, destination: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/route?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`,
    )
    if (!response.ok) {
      throw new Error("Route data not available")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching route data:", error)
    return null
  }
}

export async function fetchNews() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/news`)
    if (!response.ok) {
      throw new Error("News data not available")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching news data:", error)
    return null
  }
}

export async function fetchRiskAssessment(origin: string, destination: string, itemType = "standard") {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/risk?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&item_type=${encodeURIComponent(itemType)}`,
    )
    if (!response.ok) {
      throw new Error("Risk assessment data not available")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching risk assessment:", error)
    return null
  }
}

export async function fetchTrafficAlerts(route: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/traffic?route=${encodeURIComponent(route)}`)
    if (!response.ok) {
      throw new Error("Traffic alert data not available")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching traffic alerts:", error)
    return null
  }
}

export async function fetchWeatherAlerts(route: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/weather-alerts?route=${encodeURIComponent(route)}`)
    if (!response.ok) {
      throw new Error("Weather alert data not available")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching weather alerts:", error)
    return null
  }
}

