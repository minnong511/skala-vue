import axios from 'axios'

import { createDebugLogger } from '@/utils/debugLogger'

const logger = createDebugLogger('locationApi')

const NOMINATIM_SEARCH_URL =
  'https://nominatim.openstreetmap.org/search'

const getFirstAddressValue = (address, keys) => {
  return keys.map((key) => address?.[key]).find(Boolean) ?? ''
}

const createLocationId = (lat, lon) => {
  return `custom_${Number(lat).toFixed(5)}_${Number(lon).toFixed(5)}`
}

export const normalizeLocationResult = (result) => {
  const address = result.address ?? {}
  const city = getFirstAddressValue(address, [
    'city',
    'town',
    'municipality',
    'county',
    'state',
  ])
  const district = getFirstAddressValue(address, [
    'borough',
    'district',
    'county',
  ])
  const dong = getFirstAddressValue(address, [
    'suburb',
    'neighbourhood',
    'quarter',
    'village',
    'hamlet',
  ])
  const name = [...new Set([city, district, dong].filter(Boolean))].join(' ')
  const lat = Number(result.lat)
  const lon = Number(result.lon)

  return {
    id: createLocationId(lat, lon),
    name: name || result.display_name,
    city: city || result.display_name,
    district,
    dong,
    displayName: result.display_name,
    lat,
    lon,
  }
}

export const searchLocations = async (query) => {
  const trimmedQuery = query.trim()

  logger.input('Nominatim 주소 검색', {
    query: trimmedQuery,
    queryLength: trimmedQuery.length,
  })

  if (!trimmedQuery) {
    logger.warn('빈 주소 검색은 요청하지 않습니다.')
    return []
  }

  try {
    const response = await axios.get(NOMINATIM_SEARCH_URL, {
      headers: {
        'User-Agent': 'skala-vue-weather-app/1.0',
      },
      params: {
        q: trimmedQuery,
        format: 'jsonv2',
        addressdetails: 1,
        limit: 5,
        countrycodes: 'kr',
        'accept-language': 'ko',
      },
    })

    const locations = response.data
      .map(normalizeLocationResult)
      .filter(
        (location) =>
          Number.isFinite(location.lat) && Number.isFinite(location.lon),
      )

    logger.success('Nominatim 주소 검색 완료', {
      resultCount: locations.length,
      locationIds: locations.map((location) => location.id),
    })
    return locations
  } catch (error) {
    logger.error('Nominatim 주소 검색 실패', error, {
      query: trimmedQuery,
    })
    throw error
  }
}
