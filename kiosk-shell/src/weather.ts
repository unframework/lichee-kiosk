import fetch from "node-fetch";
import { z } from "zod";

// example
/*
{
    "coord": {
        "lon": -73.9818,
        "lat": 40.7523
    },
    "weather": [
        {
            "id": 803,
            "main": "Clouds",
            "description": "broken clouds",
            "icon": "04d"
        }
    ],
    "base": "stations",
    "main": {
        "temp": 282.34,
        "feels_like": 278.13,
        "temp_min": 280.47,
        "temp_max": 283.79,
        "pressure": 997,
        "humidity": 55
    },
    "visibility": 10000,
    "wind": {
        "speed": 10.73,
        "deg": 285,
        "gust": 15.2
    },
    "clouds": {
        "all": 75
    },
    "dt": 1710092191,
    "sys": {
        "type": 2,
        "id": 2090253,
        "country": "US",
        "sunrise": 1710069305,
        "sunset": 1710111436
    },
    "timezone": -14400,
    "id": 5125125,
    "name": "Long Island City",
    "cod": 200
}
*/

const weatherSchema = z.object({
  weather: z
    .array(
      z.object({
        id: z.number(),
        main: z.string(),
        description: z.string(),
        icon: z.string(),
      })
    )
    .nonempty(),
  main: z.object({
    temp: z.number(),
    feels_like: z.number(),
    temp_min: z.number(),
    temp_max: z.number(),
    pressure: z.number(),
    humidity: z.number(),
  }),
  visibility: z.number(),
  wind: z.object({
    speed: z.number(),
    deg: z.number(),
    gust: z.number(),
  }),
  clouds: z.object({
    all: z.number(),
  }),
  sys: z.object({
    sunrise: z.number(),
    sunset: z.number(),
  }),
});

export async function fetchWeather() {
  const feedKey = process.env.OPEN_WEATHER_MAP_KEY;
  if (!feedKey) {
    throw new Error("OPEN_WEATHER_MAP_KEY not set");
  }

  const latLonStr = process.env.OPEN_WEATHER_MAP_LATLON ?? "";
  const latLon = latLonStr.split(",", 2).map(parseFloat);
  if (latLon.length !== 2 || latLon.some(isNaN)) {
    throw new Error(
      `OPEN_WEATHER_MAP_LATLON must be comma-separated floats: ${latLonStr}`
    );
  }

  const response = await fetch(
    "https://api.openweathermap.org/data/2.5/weather?" +
      [
        `appid=${encodeURIComponent(feedKey)}`,
        `lat=${latLon[0]}`,
        `lon=${latLon[1]}`,
      ].join("&")
  );

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status} for weather`);
  }

  const data = await response.json();
  const parseResult = await weatherSchema.safeParseAsync(data);
  if (!parseResult.success) {
    throw new Error(
      `Invalid weather: ${parseResult.error.issues[0]?.message} at ${parseResult.error.issues[0]?.path}`
    );
  }

  return parseResult.data;
}
