import { fetchWeatherData, fetchForecastData, fetchHourlyForecast, getLocalTime, getVideoSrc, apiKey, predictWeatherTrend, checkWeatherAlert } from './model.js';
import WeatherView from './view.js';

class WeatherController {
  constructor() {
    this.view = new WeatherView();
    this.map = null; // Khởi tạo ban đầu là null
    this.initEventListeners();
    this.requestNotificationPermission();
  }

  // Hàm khởi tạo bản đồ, được gọi từ map.js
  initializeMap(map) {
    this.map = map;
  }

  initEventListeners() {
    document.getElementById('get-weather').addEventListener('click', () => this.handleGetWeather());
    document.getElementById('get-location').addEventListener('click', () => this.handleGetLocation());
  }

  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Quyền thông báo được cấp.');
      }
    }
  }

  async handleGetWeather() {
    const city = document.getElementById('city-input').value.trim();
    if (!city) return alert('Vui lòng nhập tên thành phố');
    if (!this.map) return alert('Bản đồ chưa được khởi tạo');

    this.view.showLoading();
    try {
      const [weatherData, forecastData, hourlyData] = await Promise.all([
        fetchWeatherData(city),
        fetchForecastData(city),
        fetchHourlyForecast(city)
      ]);
      this.updateWeatherData(weatherData, forecastData, hourlyData);
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=vi`);
      const data = await response.json();
      this.map.setView([data.coord.lat, data.coord.lon], 10);
      this.checkAndSendAlert(weatherData, hourlyData);
    } catch (err) {
      alert(err.message);
      this.view.clear();
    }
  }

  async handleGetLocation() {
    if (navigator.geolocation) {
      this.view.showLoading();
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lon } = position.coords;
          console.log(`Tọa độ: ${lat}, ${lon}`);
          if (!this.map) return alert('Bản đồ chưa được khởi tạo');
          try {
            const [weatherData, forecastData, hourlyData] = await Promise.all([
              fetchWeatherData({ lat, lon }),
              fetchForecastData({ lat, lon }),
              fetchHourlyForecast({ lat, lon })
            ]);
            this.updateWeatherData(weatherData, forecastData, hourlyData);
            this.map.setView([lat, lon], 10);
            this.checkAndSendAlert(weatherData, hourlyData);
          } catch (err) {
            alert(err.message);
            this.view.clear();
          }
        },
        (error) => {
          alert('Không thể lấy vị trí: ' + error.message);
          this.view.clear();
        }
      );
    } else {
      alert('Trình duyệt không hỗ trợ geolocation.');
    }
  }

  updateWeatherData(weatherData, forecastData, hourlyData) {
    const localTime = getLocalTime(weatherData);
    const videoSrc = getVideoSrc(weatherData.weather[0].description);
    const prediction = predictWeatherTrend(hourlyData);
    const alert = checkWeatherAlert(weatherData, hourlyData);
    this.view.update({ ...weatherData, localTime, videoSrc }, forecastData, hourlyData, prediction, alert);
  }

  checkAndSendAlert(weatherData, hourlyData) {
    const alert = checkWeatherAlert(weatherData, hourlyData);
    if (alert !== 'Không có cảnh báo thời tiết.' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Cảnh báo thời tiết', {
        body: alert,
        icon: '/icon.png'
      });
    }
  }
}

// Xuất instance của WeatherController để map.js có thể gọi
const controller = new WeatherController();
export { controller as WeatherController }; // Xuất instance thay vì hàm