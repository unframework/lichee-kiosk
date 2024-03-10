import { Box, Text } from "ink";
import { Feed } from "./feed";
import { fetchWeather } from "./weather";

function cels(temp: number) {
  return Math.round(temp - 273.15);
}

// m/s to km/h
function kmh(mps: number) {
  return Math.round(mps * 3.6);
}

function dir(deg: number) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

const TEXT_FILLER = [...new Array(200)].map(() => " ").join("");

export const WeatherBox: React.FC<{
  weatherFeed: Feed<Awaited<ReturnType<typeof fetchWeather>>>;
}> = ({ weatherFeed }) => {
  if (weatherFeed.state === "pending") {
    return (
      <Box height={2} flexDirection="column">
        <Text>Loading...</Text>
      </Box>
    );
  }

  const {
    weather: [{ main: weather }],
    main: { temp, feels_like, temp_min, temp_max },
    wind,
  } = weatherFeed;

  return (
    <Box height={2} flexDirection="column">
      <Box height={1} overflow="hidden">
        <Text backgroundColor="blue" color="yellowBright">
          {cels(temp)}({cels(feels_like)})C {cels(temp_max)}/{cels(temp_min)}C
        </Text>
        <Text backgroundColor="blue"> </Text>
        <Text backgroundColor="blue" color="white">
          {weather}
        </Text>

        <Box
          height={1}
          overflow="hidden"
          flexShrink={1}
          flexGrow={1}
          flexBasis={0}
        >
          <Text backgroundColor="blue">{TEXT_FILLER}</Text>
        </Box>

        {wind.gust / wind.speed > 1.2 ? (
          <Text backgroundColor="red" color="white">
            {dir(wind.deg)}
            {kmh(wind.gust)}
          </Text>
        ) : (
          <Text backgroundColor="blue" color="white">
            {dir(wind.deg)}
            {kmh(wind.speed)}
          </Text>
        )}
      </Box>
      <Text backgroundColor="blue" color="white">
        {String(weatherFeed.lastError || "")}
      </Text>
    </Box>
  );
};
