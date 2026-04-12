const apiKey = "93faafa90b559a532a7c9b8b8da0a565"; 




const tempEl = document.getElementById("temp");
const weatherEl = document.getElementById("weather");
const humidityEl = document.getElementById("humidity");
const cityNameEl = document.getElementById("city-name");
const feelsLikeEl = document.getElementById("feels-like");
const minTempEl = document.getElementById("min-temp");
const maxTempEl = document.getElementById("max-temp");
const pressureEl = document.getElementById("pressure");
const visibilityEl = document.getElementById("visibility");

const resultEl = document.getElementById("result");
const input = document.getElementById("city-input");
const button = document.getElementById("search-btn");

const historyContainer = document.getElementById("search-history");
const themeToggle = document.getElementById("theme-toggle");


const tableBody = document.getElementById("states-table-body");


let searchHistory = JSON.parse(localStorage.getItem("history")) || [];

function renderHistory() {
    historyContainer.innerHTML = "";
    searchHistory.forEach(city => {
        const btn = document.createElement("button");
        btn.innerHTML = `<i class="bi bi-clock-history me-1"></i> ${city}`;
        btn.onclick = () => fetchWeather(city);
        historyContainer.appendChild(btn);
    });
}

function saveHistory(city) {
    if (!searchHistory.includes(city)) {
        searchHistory.unshift(city);
        if (searchHistory.length > 5) searchHistory.pop();
        localStorage.setItem("history", JSON.stringify(searchHistory));
        renderHistory();
    }
}


function loadTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        themeToggle.innerHTML = '<i class="bi bi-sun-fill text-warning"></i>';
    }
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    

    themeToggle.innerHTML = isDark 
        ? '<i class="bi bi-sun-fill text-warning"></i>' 
        : '<i class="bi bi-moon-stars"></i>';
});


function changeBackground(condition) {
    const body = document.body;
    const weather = condition.toLowerCase();

    
    body.className = body.classList.contains("dark-mode") ? "dark-mode" : "";

    if (weather.includes("clear")) {
        body.classList.add("sunny");
    } 
    else if (weather.includes("snow")) {
        body.classList.add("snowy");
    } 
   
    else if (weather.includes("rain") || weather.includes("drizzle")) {
        body.classList.add("rainy");
    } 
    else if (weather.includes("thunder")) {
        body.classList.add("thunder");
    } 
    else {
        
        body.classList.add("cloudy");
    }
}


async function fetchWeather(city) {
    try {
        resultEl.textContent = "Fetching weather...";
        
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        const data = await res.json();

        if (data.cod != 200) {
            resultEl.textContent = "City not found. Please try again.";
            return;
        }

        updateUI(data);
        saveHistory(data.name); 
        resultEl.textContent = "";
    } catch {
        resultEl.textContent = "Error fetching data. Check connection.";
    }
}


function updateUI(data) {
    
    cityNameEl.textContent = data.name;
    tempEl.textContent = `${Math.round(data.main.temp)}°C`;
    weatherEl.textContent = data.weather[0].description;

    
    humidityEl.textContent = `${data.main.humidity}%`;
    feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°C`;
    minTempEl.textContent = `${Math.round(data.main.temp_min)}°C`;
    maxTempEl.textContent = `${Math.round(data.main.temp_max)}°C`;
    pressureEl.textContent = `${data.main.pressure} hPa`;
    visibilityEl.textContent = `${(data.visibility / 1000).toFixed(1)} km`;

    
    changeBackground(data.weather[0].main);
}


function loadLocationWeather() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                const res = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
                );
                const data = await res.json();
                updateUI(data);
            },
            () => {
               
                fetchWeather("Delhi");
            }
        );
    } else {
        fetchWeather("Delhi");
    }
}


const indianStates = [
    "Delhi", "Mumbai", "Kolkata", "Chennai", "Bangalore"
]; 

async function loadIndianStatesWeather() {
    tableBody.innerHTML = "";
    
    const promises = indianStates.map(state =>
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${state}&appid=${apiKey}&units=metric`)
        .then(res => res.json())
    );

    const results = await Promise.all(promises);

    results
        .filter(data => data.cod === 200)
        .forEach(data => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="fw-bold">${data.name}</td>
                <td>${Math.round(data.main.feels_like)}°C</td>
                <td>${Math.round(data.main.temp_min)}°C</td>
                <td>${Math.round(data.main.temp_max)}°C</td>
                <td>${data.main.pressure} hPa</td>
                <td>${(data.visibility / 1000).toFixed(1)} km</td>
            `;
            tableBody.appendChild(row);
        });
}


button.addEventListener("click", () => {
    const city = input.value.trim();
    if (!city) {
        resultEl.textContent = "Please enter a city name!";
        return;
    }
    fetchWeather(city);
    input.value = ""; 
});

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") button.click();
});


window.addEventListener("load", () => {
    loadTheme();
    renderHistory();
    loadLocationWeather();
    loadIndianStatesWeather();
});