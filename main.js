/*
    We're using the Open-Meteo API available at:
    https://open-meteo.com/en/docs

    Just a heads up, it uses metric units by default.
    So it says 2000 elevation but that's meters.
    And 6 degrees but that's celcius.
*/

// HTML Elements
const locationInputElement = document.getElementById("location-input");
const locationDisplayElement = document.getElementById("location-string");

const temperatureElement = document.getElementById("temperature");
const conditionsElement = document.getElementById("conditions");
const humidityElement = document.getElementById("humidity");
const windSpeedElement = document.getElementById("wind-speed");
const pressureElement = document.getElementById("pressure");

const errorMessageElement = document.getElementById("error-message");
const weatherIconElement = document.getElementById("icon-emoji");
const weatherDescriptionElement = document.getElementById(
    "weather-description",
);

// Turn weather codes into more easy readings
function getWeatherDescription(code) {
    const weatherCodes = {
        0: "Clear Sky",
        1: "Mainly Clear",
        2: "Partly Cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Foggy",
        51: "Light Drizzle",
        53: "Drizzle",
        55: "Heavy Drizzle",
        61: "Light Rain",
        63: "Rain",
        65: "Heavy Rain",
        71: "Light Snow",
        73: "Snow",
        75: "Heavy Snow",
        80: "Rain Showers",
        81: "Rain Showers",
        82: "Heavy Rain Showers",
        95: "Thunderstorm",
    };

    return weatherCodes[code] || "Unknown Conditions";
}

// Turn weather codes into emojis
function getWeatherEmoji(code) {
    if (code === 0 || code === 1) return "☀️";
    if (code === 2) return "⛅";
    if (code === 3) return "☁️";
    if (code === 45 || code === 48) return "🌫️";
    if (code >= 51 && code <= 67) return "🌧️";
    if (code >= 71 && code <= 77) return "❄️";
    if (code >= 80 && code <= 82) return "🌦️";
    if (code >= 95) return "⛈️";

    return "🌤️";
}

// Get and display weather information
async function updateWeather() {
    const selectedOption =
        locationInputElement.options[locationInputElement.selectedIndex];

    const locationName = selectedOption.textContent;
    const [lat, lon] = locationInputElement.value.split(",");

    locationDisplayElement.textContent = locationName;
    errorMessageElement.textContent = "";

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const current = data.current;
        const description = getWeatherDescription(current.weather_code);

        // Display actual weather information
        temperatureElement.textContent = current.temperature_2m + " °C";
        conditionsElement.textContent = description;
        humidityElement.textContent = current.relative_humidity_2m + "%";
        windSpeedElement.textContent = current.wind_speed_10m + " km/h";
        pressureElement.textContent = current.surface_pressure + " hPa";

        // Update weather icon and description
        weatherIconElement.textContent = getWeatherEmoji(current.weather_code);
        weatherDescriptionElement.textContent = description;
    } catch (error) {
        console.error("Weather API fetch error:", error);

        errorMessageElement.textContent =
            "Unable to retrieve weather information. Please try again.";

        temperatureElement.textContent = "Unavailable";
        conditionsElement.textContent = "Unavailable";
        humidityElement.textContent = "Unavailable";
        windSpeedElement.textContent = "Unavailable";
        pressureElement.textContent = "Unavailable";
    }
}

// Check if a location was previously saved
const savedLocation = localStorage.getItem("savedLocation");

// Restore the saved location if it exists
if (savedLocation) {
    const savedOption = Array.from(locationInputElement.options).find(
        (option) => option.value === savedLocation,
    );

    if (savedOption) {
        locationInputElement.value = savedLocation;
    }
}

// Save the selected location whenever it changes
locationInputElement.addEventListener("change", () => {
    localStorage.setItem("savedLocation", locationInputElement.value);
    updateWeather();
});

// Load weather when the webpage opens
updateWeather();

// Refresh weather automatically every 10 minutes
const WEATHER_REFRESH_INTERVAL = 10 * 60 * 1000;

setInterval(() => {
    updateWeather();
}, WEATHER_REFRESH_INTERVAL);
