export async function getWeather(city) {
	const geocodingUrl = new URL(
		"/v1/search",
		"https://geocoding-api.open-meteo.com"
	);
	geocodingUrl.searchParams.set("name", city.split(",")[0].trim());
	geocodingUrl.searchParams.set("count", "1");
	geocodingUrl.searchParams.set("language", "pt");
	geocodingUrl.searchParams.set("format", "json");

	const geocodingResponse = await fetch(geocodingUrl.href);
	if (!geocodingResponse.ok) throw new Error("request-failed");

	const geocodingData = await geocodingResponse.json();
	const place = geocodingData.results?.[0];
	if (!place) throw new Error("not-found");

	const weatherUrl = new URL("/v1/forecast", "https://api.open-meteo.com");
	weatherUrl.searchParams.set("latitude", place.latitude);
	weatherUrl.searchParams.set("longitude", place.longitude);
	weatherUrl.searchParams.set(
		"current",
		"temperature_2m,apparent_temperature,weather_code,wind_speed_10m"
	);
	weatherUrl.searchParams.set(
		"daily",
		"weather_code,temperature_2m_max,temperature_2m_min"
	);
	weatherUrl.searchParams.set("forecast_days", "6");
	weatherUrl.searchParams.set("timezone", "auto");

	const weatherResponse = await fetch(weatherUrl.href);
	if (!weatherResponse.ok) throw new Error("request-failed");

	return { place, weather: await weatherResponse.json() };
}
