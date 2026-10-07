// ============================================================
// ГЛОБАЛЬНОЕ СОСТОЯНИЕ
// ============================================================
let currentCoords = { lat: 43.5855, lon: 39.7231 }; // Сочи
let currentCityName = 'Сочи';

const cityInput   = document.querySelector('#city-input');
const searchBtn   = document.querySelector('#search-btn');
const cityStatus  = document.querySelector('#city-status');

// ============================================================
// ВИДЖЕТ 1: ПОГОДА (Open-Meteo Forecast API)
// ============================================================
const weatherNowEl   = document.querySelector('#weather-now');
const weatherTodayEl = document.querySelector('#weather-today');
const weatherMetaEl  = document.querySelector('#weather-meta');
const weatherRefresh = document.querySelector('#weather-refresh');

async function loadWeather() {
  weatherNowEl.textContent = 'Загрузка…';
  weatherTodayEl.textContent = '';
  weatherMetaEl.textContent = '';

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${currentCoords.lat}&longitude=${currentCoords.lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    const tempNow  = data.current?.temperature_2m;
    const windNow  = data.current?.wind_speed_10m;
    const tempMax  = data.daily?.temperature_2m_max?.[0];
    const tempMin  = data.daily?.temperature_2m_min?.[0];
    const rainSum  = data.daily?.precipitation_sum?.[0];

    if (Number.isFinite(tempNow)) {
      weatherNowEl.textContent = `Сейчас: ${tempNow} °C, ветер ${windNow ?? '—'} км/ч`;
    } else {
      weatherNowEl.textContent = 'Сервис не вернул температуру.';
    }

    const parts = [];
    if (Number.isFinite(tempMax)) parts.push(`днём до ${tempMax}°`);
    if (Number.isFinite(tempMin)) parts.push(`ночью до ${tempMin}°`);
    if (Number.isFinite(rainSum)) parts.push(`осадки ${rainSum} мм`);
    weatherTodayEl.textContent = parts.join(' · ');

    weatherMetaEl.textContent = `Источник: Open-Meteo · Обновлено: ${new Date().toLocaleTimeString('ru-RU')}`;

  } catch (error) {
    console.error('Ошибка загрузки погоды:', error);
    weatherNowEl.textContent = 'Не удалось загрузить погоду. Попробуйте ещё раз.';
    weatherMetaEl.textContent = 'Данные недоступны.';
  }
}

// ============================================================
// ВИДЖЕТ 2: КАЧЕСТВО ВОЗДУХА (Open-Meteo Air Quality API)
// ============================================================
const airAqiEl      = document.querySelector('#air-aqi');
const airParticlesEl = document.querySelector('#air-particles');
const airMetaEl     = document.querySelector('#air-meta');
const airRefresh    = document.querySelector('#air-refresh');

// Расшифровка AQI (европейская шкала)
function getAqiLabel(aqi) {
  if (aqi <= 20) return 'Хорошее';
  if (aqi <= 40) return 'Приемлемое';
  if (aqi <= 60) return 'Умеренное';
  if (aqi <= 80) return 'Плохое';
  if (aqi <= 100) return 'Очень плохое';
  return 'Крайне плохое';
}

async function loadAirQuality() {
  airAqiEl.textContent = 'Загрузка…';
  airParticlesEl.textContent = '';
  airMetaEl.textContent = '';

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${currentCoords.lat}&longitude=${currentCoords.lon}&current=us_aqi,pm2_5,pm10,nitrogen_dioxide&timezone=auto`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    const aqi = data.current?.us_aqi;
    const pm25 = data.current?.pm2_5;
    const pm10 = data.current?.pm10;
    const no2 = data.current?.nitrogen_dioxide;

    if (Number.isFinite(aqi)) {
      airAqiEl.textContent = `AQI: ${aqi} — ${getAqiLabel(aqi)}`;
    } else {
      airAqiEl.textContent = 'Сервис не вернул AQI.';
    }

    const parts = [];
    if (Number.isFinite(pm25)) parts.push(`PM2.5: ${pm25} мкг/м³`);
    if (Number.isFinite(pm10)) parts.push(`PM10: ${pm10} мкг/м³`);
    if (Number.isFinite(no2)) parts.push(`NO₂: ${no2} мкг/м³`);
    airParticlesEl.textContent = parts.join(' · ') || 'Данные о частицах недоступны.';

    airMetaEl.textContent = `Источник: Open-Meteo Air Quality · Обновлено: ${new Date().toLocaleTimeString('ru-RU')}`;

  } catch (error) {
    console.error('Ошибка загрузки качества воздуха:', error);
    airAqiEl.textContent = 'Не удалось загрузить данные о воздухе. Попробуйте ещё раз.';
    airMetaEl.textContent = 'Данные недоступны.';
  }
}

// ============================================================
// ВИДЖЕТ 3: ЗАМЕТКИ (локальный, localStorage)
// ============================================================
const noteForm  = document.querySelector('#note-form');
const noteInput = document.querySelector('#note-input');
const notesList = document.querySelector('#notes-list');
const notesMeta = document.querySelector('#notes-meta');

let notes = JSON.parse(localStorage.getItem('nature-notes') || '[]');

function renderNotes() {
  notesList.innerHTML = '';
  if (notes.length === 0) {
    notesList.innerHTML = '<li>Пока пусто. Добавьте первую заметку о регионе.</li>';
    notesMeta.textContent = '';
    return;
  }
  notes.forEach((note, index) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = note;
    const btn = document.createElement('button');
    btn.className = 'delete-note';
    btn.type = 'button';
    btn.textContent = '×';
    btn.setAttribute('aria-label', `Удалить заметку: ${note}`);
    btn.addEventListener('click', () => {
      notes.splice(index, 1);
      localStorage.setItem('nature-notes', JSON.stringify(notes));
      renderNotes();
    });
    li.appendChild(span);
    li.appendChild(btn);
    notesList.appendChild(li);
  });
  notesMeta.textContent = `Заметок: ${notes.length}`;
}

noteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = noteInput.value.trim();
  if (!text) return;
  notes.push(text);
  localStorage.setItem('nature-notes', JSON.stringify(notes));
  noteInput.value = '';
  renderNotes();
});

// ============================================================
// ГЕОКОДИНГ
// ============================================================
async function searchCity() {
  const query = cityInput.value.trim();
  if (!query) {
    cityStatus.textContent = 'Введите название региона.';
    return;
  }

  cityStatus.textContent = 'Поиск региона…';

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=ru`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      cityStatus.textContent = 'Регион не найден. Попробуйте другое название.';
      return;
    }

    const city = data.results[0];
    currentCoords = { lat: city.latitude, lon: city.longitude };
    currentCityName = city.name;
    cityStatus.textContent = `Выбран: ${city.name}, ${city.country}`;

    loadWeather();
    loadAirQuality();

  } catch (error) {
    console.error('Ошибка поиска региона:', error);
    cityStatus.textContent = 'Не удалось найти регион. Проверьте подключение.';
  }
}

// ============================================================
// ОБРАБОТЧИКИ
// ============================================================
searchBtn.addEventListener('click', searchCity);
cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchCity();
});

weatherRefresh.addEventListener('click', loadWeather);
airRefresh.addEventListener('click', loadAirQuality);

// ============================================================
// СТАРТ
// ============================================================
renderNotes();
loadWeather();
loadAirQuality();