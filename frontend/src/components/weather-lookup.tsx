"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Thermometer, Wind, Eye, Gauge } from "lucide-react";

interface WeatherData {
  id: string;
  date: string;
  location: string;
  notes: string;
  weather_data: {
    current: {
      temperature: number;
      weather_descriptions: string[];
      humidity: number;
      wind_speed: number;
      pressure: number;
      uv_index: number;
      visibility: number;
      feelslike: number;
    };
    location: {
      name: string;
      country: string;
      region: string;
      timezone_id: string;
    };
  };
  created_at: string;
}

export function WeatherLookup() {
  const [weatherId, setWeatherId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    if (!weatherId.trim()) {
      setError("Please enter a weather ID");
      return;
    }

    setIsLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      const response = await fetch(`http://localhost:8000/weather/${weatherId.trim()}`);
      
      if (response.ok) {
        const data = await response.json();
        setWeatherData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Weather data not found");
      }
    } catch {
      setError("Network error: Could not connect to the server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLookup();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Weather Data Lookup</CardTitle>
        <CardDescription>
          Enter a weather ID to retrieve stored weather data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="weather-id">Weather ID</Label>
          <div className="flex gap-2">
            <Input
              id="weather-id"
              value={weatherId}
              onChange={(e) => setWeatherId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., sample-weather-123"
              className="flex-1"
            />
            <Button 
              onClick={handleLookup} 
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? (
                "Loading..."
              ) : (
                <>
                  <Search className="w-4 h-4 mr-1" />
                  Lookup
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-900/20 text-red-500 border border-red-500">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {weatherData && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold text-lg mb-2">
                {weatherData.weather_data.location.name}, {weatherData.weather_data.location.country}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Requested for: {formatDate(weatherData.date)}
              </p>
              
              {weatherData.notes && (
                <div className="mb-3 p-2 bg-background rounded border">
                  <p className="text-sm">
                    <span className="font-medium">Notes:</span> {weatherData.notes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">{weatherData.weather_data.current.temperature}°C</p>
                    <p className="text-xs text-muted-foreground">Temperature</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">{weatherData.weather_data.current.feelslike}°C</p>
                    <p className="text-xs text-muted-foreground">Feels like</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">{weatherData.weather_data.current.wind_speed} km/h</p>
                    <p className="text-xs text-muted-foreground">Wind speed</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">{weatherData.weather_data.current.humidity}%</p>
                    <p className="text-xs text-muted-foreground">Humidity</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">{weatherData.weather_data.current.pressure} hPa</p>
                    <p className="text-xs text-muted-foreground">Pressure</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                  <div>
                    <p className="text-sm font-medium">{weatherData.weather_data.current.uv_index}</p>
                    <p className="text-xs text-muted-foreground">UV Index</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 p-2 bg-background rounded border">
                <p className="text-sm">
                  <span className="font-medium">Weather:</span> {weatherData.weather_data.current.weather_descriptions.join(", ")}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Visibility:</span> {weatherData.weather_data.current.visibility} km
                </p>
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                Created: {formatDate(weatherData.created_at)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 