class WeatherView {
  constructor() {
    this.cityName = document.getElementById('city-name');
    this.cityInput = document.getElementById('city-input');
    this.temp = document.getElementById('temp');
    this.desc = document.getElementById('desc');
    this.humidity = document.getElementById('humidity');
    this.time = document.getElementById('time');
    this.video = document.getElementById('weather-video');
    this.chartCanvas = document.getElementById('forecast-chart');
    this.hourlyForecast = document.getElementById('hourly-forecast');
    this.aiPrediction = document.getElementById('ai-prediction');
    this.weatherAlert = document.getElementById('weather-alert');
    this.chart = null;
  }

  update(weatherData, forecastData, hourlyData, prediction, alert) {
    this.cityName.textContent = weatherData.name;
    this.cityInput.value = weatherData.name;
    this.temp.textContent = Math.round(weatherData.main.temp);
    this.desc.textContent = weatherData.weather[0].description;
    this.humidity.textContent = weatherData.main.humidity;
    this.time.textContent = weatherData.localTime;
    this.video.src = weatherData.videoSrc;

    this.updateChart(forecastData);
    this.updateHourlyForecast(hourlyData, weatherData.timezone);
    this.updateAIPrediction(prediction);
    this.updateWeatherAlert(alert);
  }

  updateChart(forecastData) {
    const labels = forecastData.map(item => {
      const date = new Date(item.dt_txt);
      return date.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' });
    });
    const temperatures = forecastData.map(item => Math.round(item.main.temp));

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(this.chartCanvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nhiệt độ (°C)',
          data: temperatures,
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: false, title: { display: true, text: 'Nhiệt độ (°C)' } },
          x: { title: { display: true, text: 'Ngày' } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  updateHourlyForecast(hourlyData, timezoneOffset) {
    this.hourlyForecast.innerHTML = '';
    hourlyData.forEach(item => {
      const date = new Date(item.dt * 1000 + timezoneOffset * 1000);
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const div = document.createElement('div');
      div.style.border = '1px solid #ccc';
      div.style.padding = '5px';
      div.style.width = '80px';
      div.innerHTML = `
        <p>${hours}:00</p>
        <p>Nhiệt độ: ${Math.round(item.main.temp)}°C</p>
        <p>Độ ẩm: ${item.main.humidity}%</p>
        <p>${item.weather[0].description}</p>
      `;
      this.hourlyForecast.appendChild(div);
    });
  }

  updateAIPrediction(prediction) {
    this.aiPrediction.innerHTML = `<p>Dự đoán cá nhân hóa: ${prediction}</p>`;
  }

  updateWeatherAlert(alert) {
    this.weatherAlert.innerHTML = `<p>${alert}</p>`;
  }

  showLoading() {
    this.cityName.textContent = 'Đang tải...';
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    this.hourlyForecast.innerHTML = '<p>Đang tải...</p>';
    this.aiPrediction.innerHTML = '<p>Đang tải...</p>';
    this.weatherAlert.innerHTML = '<p>Đang tải...</p>';
  }

  clear() {
    this.cityName.textContent = '';
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    this.hourlyForecast.innerHTML = '';
    this.aiPrediction.innerHTML = '';
    this.weatherAlert.innerHTML = '';
  }
}

export default WeatherView;