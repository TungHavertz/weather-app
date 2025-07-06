const apiKey = 'f2e4e6b38a1fe6dda3ae69e1d6e8efad';

async function fetchWeatherData(cityOrCoords) {
  let url;
  if (typeof cityOrCoords === 'string') {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${cityOrCoords}&appid=${apiKey}&units=metric&lang=vi`;
  } else {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${cityOrCoords.lat}&lon=${cityOrCoords.lon}&appid=${apiKey}&units=metric&lang=vi`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Không thể lấy dữ liệu thời tiết');
    return await res.json();
  } catch (err) {
    throw err;
  }
}

async function fetchForecastData(cityOrCoords) {
  let url;
  if (typeof cityOrCoords === 'string') {
    url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityOrCoords}&appid=${apiKey}&units=metric&lang=vi`;
  } else {
    url = `https://api.openweathermap.org/data/2.5/forecast?lat=${cityOrCoords.lat}&lon=${cityOrCoords.lon}&appid=${apiKey}&units=metric&lang=vi`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Không thể lấy dữ liệu dự báo');
    const data = await res.json();
    const dailyData = data.list.filter(item => item.dt_txt.includes('12:00:00')).slice(0, 5);
    return dailyData;
  } catch (err) {
    throw err;
  }
}

async function fetchHourlyForecast(cityOrCoords) {
  let url;
  if (typeof cityOrCoords === 'string') {
    url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityOrCoords}&appid=${apiKey}&units=metric&lang=vi`;
  } else {
    url = `https://api.openweathermap.org/data/2.5/forecast?lat=${cityOrCoords.lat}&lon=${cityOrCoords.lon}&appid=${apiKey}&units=metric&lang=vi`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Không thể lấy dữ liệu dự báo theo giờ');
    const data = await res.json();
    return data.list;
  } catch (err) {
    throw err;
  }
}

function getLocalTime(data) {
  const localTime = new Date((data.dt + data.timezone) * 1000);
  const hours = localTime.getUTCHours().toString().padStart(2, '0');
  const minutes = localTime.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function getVideoSrc(weatherDesc) {
  weatherDesc = weatherDesc.toLowerCase();
  let videoSrc = 'videos/default.mp4';
  if (weatherDesc.includes('mưa rào')) videoSrc = 'videos/showers.mp4';
  else if (weatherDesc.includes('mưa nhẹ') || weatherDesc.includes('mưa vừa')) videoSrc = 'videos/moderate-rain.mp4';
  else if (weatherDesc.includes('mây thưa') || weatherDesc.includes('mây rải rác')) videoSrc = 'videos/sparse-clouds.mp4';
  else if (weatherDesc.includes('mây cụm')) videoSrc = 'videos/cluster-clouds.mp4';
  else if (weatherDesc.includes('mây đen')) videoSrc = 'videos/dark-clouds.mp4';
  else if (weatherDesc.includes('quang đãng')) videoSrc = 'videos/clear-sky.mp4';
  else if (weatherDesc.includes('nắng')) videoSrc = 'videos/sunny.mp4';
  else if (weatherDesc.includes('tuyết')) videoSrc = 'videos/snowy.mp4';
  return videoSrc;
}

function predictWeatherTrend(hourlyData) {
  if (hourlyData.length < 8) return 'Không đủ dữ liệu để dự đoán.';
  const recentTemps = hourlyData.slice(0, 8).map(item => item.main.temp);
  const trend = (recentTemps[7] - recentTemps[0]) / 7;
  if (trend > 0.5) return 'Nhiệt độ có thể tăng trong vài giờ tới.';
  if (trend < -0.5) return 'Nhiệt độ có thể giảm trong vài giờ tới.';
  return 'Nhiệt độ ổn định trong vài giờ tới.';
}

function checkWeatherAlert(weatherData, hourlyData) {
  let alert = '';
  if (weatherData.main.temp < 0 || weatherData.main.temp > 35) {
    alert += 'Cảnh báo: Nhiệt độ cực đoan!<br>';
  }
  if (weatherData.wind.speed > 17) {
    alert += 'Cảnh báo: Gió mạnh, có thể có bão!<br>';
  }
  if (hourlyData.some(item => item.rain && item.rain['3h'] > 10)) {
    alert += 'Cảnh báo: Mưa lớn sắp xảy ra!<br>';
  }
  return alert || 'Không có cảnh báo thời tiết.';
}

export { fetchWeatherData, fetchForecastData, fetchHourlyForecast, getLocalTime, getVideoSrc, apiKey, predictWeatherTrend, checkWeatherAlert };