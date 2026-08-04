const WEATHER_THEME_BY_ICON = {
  '01': 'clear',
  '02': 'clouds',
  '03': 'clouds',
  '04': 'clouds',
  '09': 'rain',
  '10': 'rain',
  '11': 'storm',
  '13': 'snow',
  '50': 'mist',
}

export const getWeatherTheme = (icon = '') => {
  const iconCode = String(icon).slice(0, 2)

  return WEATHER_THEME_BY_ICON[iconCode] ?? 'default'
}
