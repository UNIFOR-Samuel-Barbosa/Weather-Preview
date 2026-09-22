import "../styles/style.css";

const app = document.querySelector("#app");
const weatherLabels = {
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
const getWeather = (code) =>
	weatherLabels[code] ?? ["Condição desconhecida", "🌡️"];

function render() {
	app.innerHTML = `<main class="weather-app"><section class="hero"><div class="eyebrow"><span class="eyebrow-dot"></span> Previsão em tempo real</div><h1>O céu da sua<br><em>cidade.</em></h1><p class="intro">Descubra a temperatura, as condições atuais e a previsão dos próximos dias.</p><form class="search-form" id="search-form"><label class="sr-only" for="city-input">Digite o nome da cidade</label><span class="search-icon">⌕</span><input id="city-input" name="city" type="search" placeholder="Qual cidade você quer consultar?" autocomplete="off" required /><button type="submit">Buscar <span aria-hidden="true">↗</span></button></form><p class="search-hint">Ex.: São Paulo, Lisboa, Nova York</p></section><section class="content" aria-live="polite"><div class="message" id="message">Digite uma cidade para começar sua consulta.</div><div id="weather-result"></div></section><footer>Dados meteorológicos fornecidos por <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a></footer></main>`;
	document
		.querySelector("#search-form")
		.addEventListener("submit", handleSearch);
}

function setMessage(text, type = "") {
	const message = document.querySelector("#message");
	message.textContent = text;
	message.className = `message ${type}`;
}
function formatDate(date) {
	return new Intl.DateTimeFormat("pt-BR", {
		weekday: "short",
		day: "numeric",
		month: "short",
	}).format(new Date(`${date}T12:00:00`));
}

function renderWeather(place, weather) {
	const current = getWeather(weather.current.weather_code);
	document.querySelector("#weather-result").innerHTML =
		`<article class="weather-card"><div class="location-row"><div><span class="pin">⌖</span><strong>${place.name}</strong><span class="country">${place.country}</span></div><span class="updated">Agora, ${new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date())}</span></div><div class="current-weather"><div class="weather-symbol" aria-hidden="true">${current[1]}</div><div><div class="temperature">${Math.round(weather.current.temperature_2m)}<sup>°C</sup></div><p>${current[0]}</p></div><div class="current-details"><span>Sensação <b>${Math.round(weather.current.apparent_temperature)}°</b></span><span>Vento <b>${Math.round(weather.current.wind_speed_10m)} km/h</b></span></div></div><div class="forecast-heading"><h2>Próximos dias</h2><span>${weather.daily.time.length} dias</span></div><div class="forecast-grid">${weather.daily.time
			.map((date, index) => {
				const day = getWeather(weather.daily.weather_code[index]);
				return `<div class="forecast-day"><span class="day-name">${index === 0 ? "Hoje" : formatDate(date)}</span><span class="day-icon" aria-hidden="true">${day[1]}</span><strong>${Math.round(weather.daily.temperature_2m_max[index])}°</strong><span class="low">${Math.round(weather.daily.temperature_2m_min[index])}°</span><small>${day[0]}</small></div>`;
			})
			.join("")}</div></article>`;
}

async function handleSearch(event) {
	event.preventDefault();
	const city = document.querySelector("#city-input").value.trim();
	if (!city) return;
	setMessage("Buscando a previsão...", "loading");
	document.querySelector("#weather-result").innerHTML = "";
	try {
		const geocodingResponse = await fetch(
			`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`
		);
		if (!geocodingResponse.ok) throw new Error("geocoding");
		const geocoding = await geocodingResponse.json();
		if (!geocoding.results?.length) throw new Error("not-found");
		const place = geocoding.results[0];
		const forecastResponse = await fetch(
			`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=6&timezone=auto`
		);
		if (!forecastResponse.ok) throw new Error("forecast");
		setMessage("");
		renderWeather(place, await forecastResponse.json());
	} catch (error) {
		setMessage(
			error.message === "not-found"
				? "Não encontramos essa cidade. Confira a grafia e tente novamente."
				: "Não foi possível consultar o clima agora. Verifique sua conexão e tente de novo.",
			"error"
		);
	}
}

render();
