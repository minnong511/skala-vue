import axios from 'axios'

import { createDebugLogger } from '@/utils/debugLogger'

const logger = createDebugLogger('weatherApi')

const OPEN_WEATHER_URL =
  'https://api.openweathermap.org/data/2.5/weather'
const OPEN_WEATHER_FORECAST_URL =
  'https://api.openweathermap.org/data/2.5/forecast'
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const OPEN_WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

export const WEATHER_LOCATIONS = [
  {
    id: 'city_01',
    name: '서울',
    city: '서울',
    district: '',
    dong: '',
    displayName: '서울특별시',
    lat: 37.5665,
    lon: 126.978,
  },
  {
    id: 'city_02',
    name: '수원',
    city: '수원',
    district: '',
    dong: '',
    displayName: '경기도 수원시',
    lat: 37.2636,
    lon: 127.0286,
  },
  {
    id: 'city_03',
    name: '부산',
    city: '부산',
    district: '',
    dong: '',
    displayName: '부산광역시',
    lat: 35.1796,
    lon: 129.0756,
  },
]

const resolveLocation = (locationOrId, additionalLocations = []) => {
  if (typeof locationOrId === 'object' && locationOrId !== null) {
    return locationOrId
  }

  return [...WEATHER_LOCATIONS, ...additionalLocations].find(
    (location) => location.id === locationOrId,
  )
}

export const getGoogleMapsEmbedUrl = (
  locationOrId,
  additionalLocations = [],
) => {
  const location = resolveLocation(locationOrId, additionalLocations)

  if (!location) {
    return '#'
  }

  const query = encodeURIComponent(`${location.lat},${location.lon}`)
  return `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${query}&zoom=12`
}

const normalizeWeatherData = (location, data) => {
  return {
    ...location,
    name: location.name,
    temp: Math.round(data.main.temp),
    status: data.weather?.[0]?.description ?? '정보 없음',
    humidity: data.main.humidity,
    wind: data.wind?.speed ?? 0,
    icon: data.weather?.[0]?.icon ?? '',
  }
}

const getForecastDateKey = (timestamp, timezoneOffset = 0) => {
  return new Date((timestamp + timezoneOffset) * 1000)
    .toISOString()
    .slice(0, 10)
}

const formatForecastDate = (dateKey) => {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${dateKey}T00:00:00Z`))
}

const normalizeForecastData = (location, data) => {
  const timezoneOffset = data.city?.timezone ?? 0
  const groupedForecast = new Map()

  data.list.forEach((item) => {
    const dateKey = getForecastDateKey(item.dt, timezoneOffset)
    const entries = groupedForecast.get(dateKey) ?? []
    entries.push(item)
    groupedForecast.set(dateKey, entries)
  })

  return [...groupedForecast.entries()]
    .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
    .slice(0, 5)
    .map(([dateKey, entries]) => {
      const representative = entries.reduce((closest, entry) => {
        const entryHour = new Date((entry.dt + timezoneOffset) * 1000).getUTCHours()
        const closestHour = new Date(
          (closest.dt + timezoneOffset) * 1000,
        ).getUTCHours()

        return Math.abs(entryHour - 12) < Math.abs(closestHour - 12)
          ? entry
          : closest
      })
      const temperatures = entries.map((entry) => entry.main.temp)
      const humidityValues = entries.map((entry) => entry.main.humidity)

      return {
        id: `${location.id}-${dateKey}`,
        date: dateKey,
        dateLabel: formatForecastDate(dateKey),
        tempMin: Math.round(Math.min(...temperatures)),
        tempMax: Math.round(Math.max(...temperatures)),
        status: representative.weather?.[0]?.description ?? '정보 없음',
        humidity: Math.round(
          humidityValues.reduce((sum, value) => sum + value, 0) /
            humidityValues.length,
        ),
        icon: representative.weather?.[0]?.icon ?? '',
      }
    })
}

export const fetchWeatherByLocation = async (location) => {
  logger.input('지역별 날씨 요청 준비', {
    id: location?.id,
    name: location?.name,
    lat: location?.lat,
    lon: location?.lon,
  })

  if (!OPEN_WEATHER_API_KEY) {
    const error = new Error('OpenWeather API 키가 설정되지 않았습니다.')
    logger.error('OpenWeather API 키 검증 실패', error)
    throw error
  }

  if (!location || !Number.isFinite(Number(location.lat)) || !Number.isFinite(Number(location.lon))) {
    const error = new Error('날씨를 조회할 지역 좌표가 올바르지 않습니다.')
    logger.error('지역 좌표 검증 실패', error, {
      id: location?.id,
      lat: location?.lat,
      lon: location?.lon,
    })
    throw error
  }

  try {
    logger.state('OpenWeather 요청 시작', { id: location.id })
    const response = await axios.get(OPEN_WEATHER_URL, {
      params: {
        lat: location.lat,
        lon: location.lon,
        appid: OPEN_WEATHER_API_KEY,
        units: 'metric',
        lang: 'kr',
      },
    })

    const weather = normalizeWeatherData(location, response.data)
    logger.success('OpenWeather 응답 정규화 완료', {
      id: weather.id,
      name: weather.name,
      temp: weather.temp,
      humidity: weather.humidity,
      status: weather.status,
    })
    return weather
  } catch (error) {
    logger.error('지역별 날씨 요청 실패', error, {
      id: location.id,
      name: location.name,
    })
    throw error
  }
}

export const fetchFiveDayForecast = async (location) => {
  logger.input('5일 예보 요청 준비', {
    id: location?.id,
    name: location?.name,
    lat: location?.lat,
    lon: location?.lon,
  })

  if (!OPEN_WEATHER_API_KEY) {
    const error = new Error('OpenWeather API 키가 설정되지 않았습니다.')
    logger.error('5일 예보 API 키 검증 실패', error)
    throw error
  }

  if (!location || !Number.isFinite(Number(location.lat)) || !Number.isFinite(Number(location.lon))) {
    const error = new Error('5일 예보를 조회할 지역 좌표가 올바르지 않습니다.')
    logger.error('5일 예보 지역 좌표 검증 실패', error, {
      id: location?.id,
      lat: location?.lat,
      lon: location?.lon,
    })
    throw error
  }

  try {
    logger.state('OpenWeather 5일 예보 요청 시작', { id: location.id })
    const response = await axios.get(OPEN_WEATHER_FORECAST_URL, {
      params: {
        lat: location.lat,
        lon: location.lon,
        appid: OPEN_WEATHER_API_KEY,
        units: 'metric',
        lang: 'kr',
      },
    })

    if (!Array.isArray(response.data?.list) || response.data.list.length === 0) {
      throw new Error('5일 예보 응답에 forecast 데이터가 없습니다.')
    }

    const forecast = normalizeForecastData(location, response.data)
    logger.success('5일 예보 응답 정규화 완료', {
      id: location.id,
      dayCount: forecast.length,
      dates: forecast.map((day) => day.date),
    })
    return forecast
  } catch (error) {
    logger.error('5일 예보 요청 실패', error, {
      id: location.id,
      name: location.name,
    })
    throw error
  }
}

export const fetchWeatherByCity = async (
  cityId,
  additionalLocations = [],
) => {
  const location = resolveLocation(cityId, additionalLocations)

  logger.input('도시 ID로 날씨 조회', {
    cityId,
    additionalLocationCount: additionalLocations.length,
    resolved: Boolean(location),
  })

  if (!location) {
    const error = new Error(`등록되지 않은 지역 코드입니다: ${cityId}`)
    logger.error('도시 ID를 지역으로 변환하지 못했습니다.', error, { cityId })
    throw error
  }

  return fetchWeatherByLocation(location)
}

export const fetchWeatherList = async (
  locations = WEATHER_LOCATIONS,
) => {
  logger.input('전체 지역 날씨 목록 요청', {
    locationCount: locations.length,
    locationIds: locations.map((location) => location.id),
  })

  const results = await Promise.allSettled(
    locations.map((location) => fetchWeatherByLocation(location)),
  )
  const weatherList = []
  const failedLocations = []

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      weatherList.push(result.value)
    } else {
      failedLocations.push({
        location: locations[index],
        error: result.reason,
      })
    }
  })

  logger.state('전체 지역 요청 집계', {
    successCount: weatherList.length,
    failedCount: failedLocations.length,
    failedLocationIds: failedLocations.map(({ location }) => location.id),
  })

  if (weatherList.length === 0 && failedLocations.length > 0) {
    const error = new Error('모든 지역의 날씨 요청에 실패했습니다.')
    error.failedLocations = failedLocations
    logger.error('전체 지역 날씨 요청이 모두 실패했습니다.', error)
    throw error
  }

  return { weatherList, failedLocations }
}
