"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Cloud, CloudRain, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JourneyMap } from "@/components/journey-map"
import { WeatherAlert } from "@/components/weather-alert"
import { TrafficAlert } from "@/components/traffic-alert"
import { InventoryForm } from "@/components/inventory-form"
import { fetchRoute, fetchRiskAssessment, fetchTrafficAlerts, fetchWeatherAlerts } from "@/lib/api"
import { Loader2 } from "lucide-react"

export default function JourneyPage() {
  const [step, setStep] = useState(1)
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [transportType, setTransportType] = useState("truck")
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [inventoryItems, setInventoryItems] = useState([])

  // State for API data
  const [routeData, setRouteData] = useState(null)
  const [riskData, setRiskData] = useState(null)
  const [trafficAlerts, setTrafficAlerts] = useState(null)
  const [weatherAlerts, setWeatherAlerts] = useState(null)

  const handleSubmitRoute = (e) => {
    e.preventDefault()
    setStep(2)
  }

  const handleSubmitInventory = async (items, requirements) => {
    setInventoryItems(items)
    setLoading(true)

    try {
      // Get the primary item type for risk assessment
      const primaryItemType = items.length > 0 ? items[0].type : "standard"

      // Fetch data from our API
      const route = await fetchRoute(origin, destination)
      const risk = await fetchRiskAssessment(origin, destination, primaryItemType)
      const traffic = await fetchTrafficAlerts(`${origin}-${destination}`)
      const weather = await fetchWeatherAlerts(`${origin}-${destination}`)

      // Update state with the fetched data
      setRouteData(route)
      setRiskData(risk)
      setTrafficAlerts(traffic)
      setWeatherAlerts(weather)

      setStep(3)
      setShowResults(true)
    } catch (error) {
      console.error("Error fetching journey data:", error)
      // Show error message to user
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="font-bold text-xl">ChainPulse</span>
        </Link>
      </header>
      <main className="flex-1 py-6 px-4 md:px-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Plan Your Journey</h1>
            <div className="flex items-center space-x-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                1
              </div>
              <Separator className="w-8" />
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </div>
              <Separator className="w-8" />
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                3
              </div>
            </div>
          </div>

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Route Information</CardTitle>
                <CardDescription>
                  Enter the starting point and destination for your supply chain journey.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitRoute} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin">Starting Point</Label>
                    <Input
                      id="origin"
                      placeholder="Enter city or address"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      placeholder="Enter city or address"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Transportation Type</Label>
                    <RadioGroup
                      value={transportType}
                      onValueChange={setTransportType}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="truck" id="truck" />
                        <Label htmlFor="truck">Truck</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="train" id="train" />
                        <Label htmlFor="train">Train</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ship" id="ship" />
                        <Label htmlFor="ship">Ship</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <Button type="submit" className="w-full">
                    Continue to Inventory
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Inventory Details</CardTitle>
                <CardDescription>Enter information about the goods you're transporting.</CardDescription>
              </CardHeader>
              <CardContent>
                <InventoryForm onSubmit={handleSubmitInventory} />
              </CardContent>
            </Card>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Analyzing your supply chain journey...</p>
            </div>
          )}

          {showResults && !loading && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Journey Overview</CardTitle>
                  <CardDescription>
                    From {origin} to {destination}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <JourneyMap origin={origin} destination={destination} />
                </CardContent>
              </Card>

              <Tabs defaultValue="route">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="route">Route</TabsTrigger>
                  <TabsTrigger value="weather">Weather</TabsTrigger>
                  <TabsTrigger value="traffic">Traffic</TabsTrigger>
                </TabsList>
                <TabsContent value="route" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Route Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Estimated Distance:</span>
                          <span className="font-medium">{routeData?.distance || 450} miles</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimated Travel Time:</span>
                          <span className="font-medium">
                            {routeData
                              ? `${Math.floor(routeData.duration / 60)} hours ${routeData.duration % 60} minutes`
                              : "8 hours 30 minutes"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Recommended Departure:</span>
                          <span className="font-medium">{routeData?.recommended_departure || "6:00 AM"}</span>
                        </div>
                        <Separator />
                        <div className="rounded-md bg-muted p-4">
                          <h4 className="font-medium mb-2">Route Recommendation</h4>
                          <p className="text-sm text-muted-foreground">
                            {routeData?.route_recommendation ||
                              "Based on current conditions, we recommend taking the northern route to avoid traffic congestion and potential weather delays."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="weather" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Weather Conditions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {weatherAlerts?.alerts ? (
                          weatherAlerts.alerts.map((alert, index) => (
                            <WeatherAlert
                              key={index}
                              location={alert.location}
                              condition={alert.condition}
                              impact={alert.impact}
                              icon={
                                alert.condition.includes("Rain") ? (
                                  <CloudRain className="h-5 w-5 text-yellow-500" />
                                ) : (
                                  <Cloud className="h-5 w-5 text-blue-500" />
                                )
                              }
                              description={alert.description}
                            />
                          ))
                        ) : (
                          <>
                            <WeatherAlert
                              location="Midway Point (Springfield)"
                              condition="Heavy Rain"
                              impact="Medium"
                              icon={<CloudRain className="h-5 w-5 text-yellow-500" />}
                              description="Heavy rain expected between 2PM-6PM. May cause slight delays."
                            />
                            <WeatherAlert
                              location="Mountain Pass"
                              condition="Fog"
                              impact="Low"
                              icon={<Cloud className="h-5 w-5 text-blue-500" />}
                              description="Morning fog expected to clear by 9AM."
                            />
                          </>
                        )}
                        <Separator />
                        <div className="rounded-md bg-muted p-4">
                          <h4 className="font-medium mb-2">Weather Recommendation</h4>
                          <p className="text-sm text-muted-foreground">
                            {weatherAlerts?.recommendation ||
                              "Plan for a 1-hour buffer in your schedule to account for potential weather delays. The rain at Springfield may slow traffic."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="traffic" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Traffic Conditions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {trafficAlerts?.alerts ? (
                          trafficAlerts.alerts.map((alert, index) => (
                            <TrafficAlert
                              key={index}
                              location={alert.location}
                              condition={alert.condition}
                              impact={alert.impact}
                              icon={<Truck className="h-5 w-5 text-red-500" />}
                              description={alert.description}
                            />
                          ))
                        ) : (
                          <TrafficAlert
                            location="Highway 101 (Mile 78-82)"
                            condition="Construction"
                            impact="High"
                            icon={<Truck className="h-5 w-5 text-red-500" />}
                            description="Road construction causing lane closures and significant delays."
                          />
                        )}
                        <Separator />
                        <div className="rounded-md bg-muted p-4">
                          <h4 className="font-medium mb-2">Traffic Recommendation</h4>
                          <p className="text-sm text-muted-foreground">
                            {trafficAlerts?.recommendation ||
                              "Take the alternate route via Highway 280 to avoid the construction zone. This will add 12 miles but save approximately 45 minutes."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Overall Risk Level:</span>
                      <span
                        className={`px-2 py-1 rounded-md text-sm font-medium ${
                          riskData?.overall_risk === "High"
                            ? "bg-red-100 text-red-800"
                            : riskData?.overall_risk === "Medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {riskData?.overall_risk || "Medium"}
                      </span>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium">Risk Factors:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {riskData?.risk_factors ? (
                          riskData.risk_factors.filter(Boolean).map((factor, index) => <li key={index}>{factor}</li>)
                        ) : (
                          <>
                            <li>Weather conditions may affect perishable goods</li>
                            <li>Traffic delays could impact delivery timeline</li>
                            <li>Current inventory levels are sufficient for the journey</li>
                          </>
                        )}
                      </ul>
                    </div>
                    <div className="rounded-md bg-muted p-4">
                      <h4 className="font-medium mb-2">Inventory Recommendation</h4>
                      <p className="text-sm text-muted-foreground">
                        {riskData?.recommendation ||
                          "Consider adding temperature monitoring for perishable goods due to potential delays in areas with high temperatures."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button>Save Journey Plan</Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

