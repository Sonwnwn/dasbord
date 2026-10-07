# Природа и среда — дашборд

**Тема:** Природа и среда
**Пользователь:** Человек, который следит за экологией и хочет знать состояние окружающей среды в выбранном регионе
**Задача панели:** За один экран показать погоду, качество воздуха и дать возможность вести заметки о регионе

## Виджеты
1. **Погода** — Open-Meteo Forecast API (текущая температура, ветер, прогноз на день)
2. **Качество воздуха** — Open-Meteo Air Quality API (AQI, PM2.5, PM10, NO₂)
3. **Заметки о регионе** — локальный виджет с сохранением в localStorage

## API

| API | Документация | Что используем |
|---|---|---|
| Open-Meteo Forecast | https://open-meteo.com/en/docs | `current.temperature_2m`, `current.wind_speed_10m`, `daily.temperature_2m_max`, `daily.temperature_2m_min`, `daily.precipitation_sum` |
| Open-Meteo Geocoding | https://open-meteo.com/en/docs/geocoding-api | `results[0].latitude`, `results[0].longitude` |
| Open-Meteo Air Quality | https://open-meteo.com/en/docs/air-quality-api | `current.us_aqi`, `current.pm2_5`, `current.pm10`, `current.nitrogen_dioxide` |

**Пример запроса погоды:**
https://api.open-meteo.com/v1/forecast?latitude=43.58&longitude=39.72&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=1

**Пример запроса качества воздуха:**
https://air-quality-api.open-meteo.com/v1/air-quality?latitude=43.58&longitude=39.72&current=us_aqi,pm2_5,pm10,nitrogen_dioxide&timezone=auto

## Ограничения
- Open-Meteo — бесплатный сервис без ключа, лимит 10 000 запросов в день [citation:2].
- Air Quality API — отдельный эндпоинт `air-quality-api.open-meteo.com`, данные от CAMS [citation:1][citation:12].
- Данные о качестве воздуха — прогноз, не измерения в реальном времени.

## Результаты проверок
- [ ] Ширина 360px — одна колонка
- [ ] Ширина 768px — две колонки
- [ ] Ширина 1280px — две колонки, заметки на всю ширину
- [ ] Отключение сети — виджеты показывают ошибку, панель не ломается
- [ ] Пустой поиск региона — понятное сообщение
- [ ] Кнопка «Обновить» повторяет запрос

## Применение ИИ
Код написан с помощью AI-ассистента. Проверен вручную: запущен локально, протестированы оба API, проверены состояния загрузки/ошибки/пустого результата.
