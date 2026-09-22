import { getWeather } from "./api.js";

const form = document.querySelector("#search-form");
const input = document.querySelector("#city-input");
const message = document.querySelector("#message");
const result = document.querySelector("#weather-result");
const conditions = {
	0: ["Céu limpo", "☀️"],
	1: ["Predominantemente limpo", "🌤️"],
	2: ["Parcialmente nublado", "⛅"],
	3: ["Nublado", "☁️"],
	45: ["Névoa", "🌫️"],
	48: ["Névoa congelante", "🌫️"],
	51: ["Garoa leve", "🌦️"],
	53: ["Garoa moderada", "🌦️"],
	55: ["Garoa intensa", "🌧️"],
	61: ["Chuva leve", "🌦️"],
	63: ["Chuva moderada", "🌧️"],
	65: ["Chuva forte", "🌧️"],
	71: ["Neve leve", "🌨️"],
	73: ["Neve moderada", "❄️"],
	75: ["Neve forte", "❄️"],
	80: ["Pancadas leves", "🌦️"],
	81: ["Pancadas moderadas", "🌧️"],
	82: ["Pancadas fortes", "⛈️"],
	95: ["Trovoada", "⛈️"],
	96: ["Trovoada com granizo", "⛈️"],
	99: ["Trovoada com granizo", "⛈️"],
};

function setMessage(text, type = "") {
	message.textContent = text;
	message.className = `message ${type}`;
}

function renderWeather(data) {
	const { place, weather } = data;
	const current = conditions[weather.current.weather_code] ?? [
		"Condição desconhecida",
		"🌡️",
	];
	const forecast = weather.daily.time.map((date, index) => ({
		date,
		condition: conditions[weather.daily.weather_code[index]] ?? [
			"Indisponível",
			"🌡️",
		],
		max: Math.round(weather.daily.temperature_2m_max[index]),
		min: Math.round(weather.daily.temperature_2m_min[index]),
	}));

	result.innerHTML = `<article class="weather-card"><div class="location-row"><div><span class="pin">⌖</span><strong>${place.name}</strong><span class="country">${place.country}</span></div><span class="updated">Previsão local</span></div><div class="current-weather"><div class="weather-symbol" aria-hidden="true">${current[1]}</div><div><div class="temperature">${Math.round(weather.current.temperature_2m)}<sup>°C</sup></div><p>${current[0]}</p></div><div class="current-details"><span>Sensação <b>${Math.round(weather.current.apparent_temperature)}°</b></span><span>Vento <b>${Math.round(weather.current.wind_speed_10m)} km/h</b></span></div></div><div class="forecast-heading"><h2>Próximos dias</h2><span>${forecast.length} dias</span></div><div class="forecast-grid">${forecast.map((day) => `<div class="forecast-day"><span class="day-name">${day.date}</span><span class="day-icon" aria-hidden="true">${day.condition[1]}</span><strong>${day.max}°</strong><span class="low">${day.min}°</span><small>${day.condition[0]}</small></div>`).join("")}</div></article>`;
}

form.addEventListener("submit", async (event) => {
	event.preventDefault();
	const city = input.value.trim();
	if (!city) return;
	setMessage("Buscando a previsão...", "loading");
	result.innerHTML = "";

	try {
		renderWeather(await getWeather(city));
		setMessage("");
	} catch (error) {
		setMessage(
			error.message === "not-found"
				? "Não encontramos essa cidade. Confira a grafia e tente novamente."
				: "Não foi possível consultar o clima agora. Verifique sua conexão e tente de novo.",
			"error"
		);
	}
});
