import { WeatherController } from './controller.js';

const map = L.map('weather-map').setView([21.0278, 105.8342], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: 'Map data © OpenStreetMap contributors'
}).addTo(map);

WeatherController.initializeMap(map); // Gọi qua instance