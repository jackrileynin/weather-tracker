


const searchForm = document.getElementById('form-area');
const cityInput = document.getElementById('typed-city');
const searchResultColumn = document.getElementById('search-result-column');
const currentWeatherArea = document.getElementById('current-weather-area');
const forecastArea = document.getElementById('Forecast');

searchForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const cityName = cityInput.value;

  if (cityName) {
    getCoordinates(cityName)
      .then(coordinates => {
        const { lat, lon } = coordinates;
        getWeatherData(lat, lon);
      })
      .catch(error => console.error('Error fetching coordinates:', error));
  }
});

async function getCoordinates(cityName) {
  const coordinatesApiKey = 'c1304e232be9418700b63cf4d95bc25c';
  const coordinatesApiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${coordinatesApiKey}`;

  try {
    const response = await fetch(coordinatesApiUrl);
    const data = await response.json();

    if (data && data.length > 0) {
      const location = data[0].latlon;
      return { lat: location.lat, lon: location.lon };
    } else {
      throw new Error('Invalid city name');
    }
  } catch (error) {
    throw error;
  }
}

function getWeatherData(latitude, longitude) {
  const openWeatherApiKey = '7e12e401cd509b620163df8913118ff8';
  const openWeatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}`;

  
  fetch(openWeatherApiUrl)
    .then(response => response.json())
    .then(data => {
      updateUI(data);
      storage(latitude, longitude);
    })
    .catch(error => console.error('Error fetching data:', error));
}


function updateUI(data) {
  
  const currentWeather = data.list[0].main;
  currentWeatherArea.innerHTML = `
    <p>Temperature: ${currentWeather.temp} °C</p>
    <p>Feels Like: ${currentWeather.feels_like} °C</p>
    <p>Min Temperature: ${currentWeather.temp_min} °C</p>
    <p>Max Temperature: ${currentWeather.temp_max} °C</p>
    <p>Pressure: ${currentWeather.pressure} hPa</p>
    <p>Humidity: ${currentWeather.humidity}%</p>
  `;

  forecastArea.innerHTML = '';
  data.list.slice(1).forEach(forecastItem => {
    const li = document.createElement('li');
    li.textContent = `
      Date/Time: ${forecastItem.dt_txt}
      Temperature: ${forecastItem.main.temp} °C
      Wind Speed: ${forecastItem.wind.speed} m/s
      Humidity: ${forecastItem.main.humidity}%
      Weather: ${forecastItem.weather[0].description}
    `;
    forecastArea.appendChild(li);
  });
}

function storage(latitude, longitude) {
  let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

  searchHistory.push({ latitude, longitude });

  localStorage.setItem('searchHistory', JSON.stringify(searchHistory));

  displaySearchHistory(searchHistory);
}

function displaySearchHistory(searchHistory) {
  searchResultColumn.innerHTML = '';

  searchHistory.forEach(location => {
    const searchItem = document.createElement('div');
    searchItem.textContent = `${location.latitude}, ${location.longitude}`;
    searchResultColumn.appendChild(searchItem);

    searchItem.addEventListener('click', function () {
      getWeatherData(location.latitude, location.longitude);
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
  displaySearchHistory(searchHistory);
});
