// 사용자 입력
//    ↓
// searchLocations("강남구")
//    ↓
// Nominatim API 요청
//    ↓
// 검색 결과(JSON)
//    ↓
// normalizeLocationResult()
//    ↓
// Vue에서 사용할 위치 객체 형태로 변환


import axios from 'axios'

import { createDebugLogger } from '@/utils/debugLogger'

// 내 Vue 앱
//    |
//    | GET 요청
//    ↓
// Nominatim 서버
//    |
//    | JSON 응답
//    ↓
// 내 Vue 앱


const logger = createDebugLogger('locationApi')


// 디버강용 로그 객체


const NOMINATIM_SEARCH_URL =
  'https://nominatim.openstreetmap.org/search'

// API 주소

const getFirstAddressValue = (address, keys) => {
  return keys.map((key) => address?.[key]).find(Boolean) ?? ''
}

// 여러 후보 중에서 처음 존재하는 주소값 가져오기
// address = {
//  city:"서울",
//  town:null,
//  county:"대한민국"
// keys.map()
// [
//  address.city,
//  address.town,
//  address.county
// ]
// }
// .find(Boolean)
// "결과"
// ?? '' -> 아무것도 없으면 빈 문자열
// 결론적으로
// .. 있으면 첫 번째 값
// 없으면 ""


// 위치 생성 ID

const createLocationId = (lat, lon) => {
  return `custom_${Number(lat).toFixed(5)}_${Number(lon).toFixed(5)}`
}

// 프로젝트 형태에 맞는 데이터로 변경해준다.
// Nominatim 응답 데이터를 우리 프로젝트 데이터 구조로 변환
// API 원본
// {
//  "lat":"37.5665",
//  "lon":"126.978",
//  "display_name":"서울특별시 중구"
// }
//
// 이런 식으로 변환
// {
//  id:"",
//  name:"",
//  city:"",
//  district:"",
//  dong:"",
//  lat:"",
//  lon:""
// }


export const normalizeLocationResult = (result) => {
  const address = result.address ?? {}
  // city 추출
  // 위에가 가장 우선 순위
  // city -> town -> muncipality -> county -> state
  // 위에서부터 찾게 된다.
  const city = getFirstAddressValue(address, [
    'city',
    'town',
    'municipality',
    'county',
    'state',
  ])

  // district(구) 추출
  // 강남구
  // 마포구
  // 종로구
  const district = getFirstAddressValue(address, [
    'borough',
    'district',
    'county',
  ])

  // 동 추출
  const dong = getFirstAddressValue(address, [
    'suburb',
    'neighbourhood',
    'quarter',
    'village',
    'hamlet',
  ])

  // 이름 생성
  // 배열을 펼치고, 빈값을 제거하고 나서 묶는다.
  // set으로 중복을 제거한다.
  const name = [...new Set([city, district, dong].filter(Boolean))].join(' ')
  // 문자열 연결
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

// 최종 출력은 이와 같을 것이다.
// {
//  id:"custom_37.12345_127.12345",
//  name:"서울 강남구 역삼동",
//  city:"서울",
//  district:"강남구",
//  dong:"역삼동",
//  lat:37.12345,
//  lon:127.12345
// }



// 실제 API 호출


export const searchLocations = async (query) => {
  const trimmedQuery = query.trim() // 공백 제거
  logger.input('Nominatim 주소 검색', {
    query: trimmedQuery,
    queryLength: trimmedQuery.length,
  })

  // 빈 검색 방지
  if (!trimmedQuery) {
    logger.warn('빈 주소 검색은 요청하지 않습니다.')
    return []
  }

  // API 요청
  // GET
  // https://nominatim.openstreetmap.org/search

  // ?q=강남구
  // &format=jsonv2
  // &addressdetails=1
  // &limit=5
  // &countrycodes=kr
  // &accept-language=ko
  try {
    const response = await axios.get(NOMINATIM_SEARCH_URL, {
      headers: {
        'User-Agent': 'skala-vue-weather-app/1.0',
      },
      params: {
        q: trimmedQuery,
        format: 'jsonv2',
        addressdetails: 1,
        limit: 3,
        countrycodes: 'kr',
        'accept-language': 'ko',
      },
    })

    // 결과 반환


    // 좌표 검증
    const locations = response.data
      .map(normalizeLocationResult)
      .filter(
        (location) =>
          Number.isFinite(location.lat) && Number.isFinite(location.lon),
      )

    // 성공 로그
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


// const locations = response.data
//       .map(normalizeLocationResult)

// [
//  원본1,
//  원본2,
//  원본3
// ]

// normalizeLocationResult()

// [
// 우리 앱 위치 객체,
// 우리 앱 위치 객체
// ]

// ----------------------------
// SearchBar.vue

// 사용자:
// "강남구"
//         |
//         ↓

// searchLocations()

//         |
//         ↓

// axios GET

//         |
//         ↓

// Nominatim API

//         |
//         ↓

// JSON 결과

//         |
//         ↓

// normalizeLocationResult()

//         |
//         ↓

// {
//  id,
//  city,
//  district,
//  dong,
//  lat,
//  lon
// }

//         |
//         ↓

// WeatherParent.vue

// 날씨 API 요청
