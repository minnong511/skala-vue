<script setup>
// template에 데이터 표시용
// 사용자가 버튼 클릭
// Script의 함수 실행
// 데이터 변경
// Vue가 화면 자동 갱신


// setup에서 함수 선언하면 template에서 바로 사용 가능


import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router' // 라우터 가져오기
// 이후 다음과 같이 사용할 수 있다
// 브라우저 주소가 해당 경로로 이동한다.



// API 호출용, 라이브러리 가져오기
// ref : 변경 가능한 반응형 데이터
// computed : 계산된 데이터, ref를 기반으로 계산된 값, ref가 바뀌면 자동으로 갱신됨
// watch : 내부에서 사용한 반응형 데이터
// onMounted : 컴포넌트가 마운트될 때 실행되는 함수, 첫 로딩시에 사용


// 함수 가져오기 , js 스크립트 형태

import {
  fetchFiveDayForecast,
  fetchWeatherByLocation,
  fetchWeatherList,
  WEATHER_LOCATIONS,
} from '@/services/weatherApi' // @는 Src 폴더를 의미, src/services/weatherApi.js 가 실제 경로임

// weatherApi.js에서 export한 함수들을 가져와서 사용한다.
// 5일 예보, 특정 지역의 현재 날씨 요청
// 여러 지역의 날씨 요청
// 기본 지역 목록

import { useConfigStore } from '@/stores/configStore' //configStore.unit ,configStore.unitSymbol 와 같이 홈페이지 전역에서 사용하는 값 저장, 뭐 다크모드도 여기에 추가할 수 있겠지?
import { createDebugLogger } from '@/utils/debugLogger'
import { getWeatherTheme } from '@/utils/weatherTheme'

// store 가져오기 -> pinia store를 가져오는 코드
// 여러 컴포넌트에서 함께 사용하는 전역 상태 저장소



////// 컴포넌트 가져오기

// 현재 파일 안에서 사용할 다른 Vue 컴포넌트들을 가져온다.
// HTML 태그처럼 사용이 가능하다.

import BaseDashboardCard from './BaseDashboardCard.vue' // 대시보드 카드 UI
import LocationSearchPanel from './LocationSearchPanel.vue' // 위치 검색 패널
import SearchBar from './SearchBar.vue' // 검색바
import WeatherCard from './WeatherCard.vue' // 날씨 카드 UI
import WeatherComparisonChart from './WeatherComparisonChart.vue' // 날씨 비교 차트 UI
import WeatherForecastPanel from './WeatherForecastPanel.vue'// 5일 예보 패널 UI

const router = useRouter()
const configStore = useConfigStore()
const logger = createDebugLogger('WeatherParent')

// 함수 선언 - 위에서 불러온 함수를 선언한다.

const customLocationStorageKey = 'skala-weather-custom-locations' // 단순 문자열, 값이 바뀌더라도 Vue 화면을 다시 그릴 필요가 없는 경우에 사용
const favoriteStorageKey = 'skala-weather-favorite-city-ids' // 로컬 스토리지 값. 여기에 즐겨찾기한 도시 ID를 저장하고, 새로고침해도 유지되도록 함.

const weatherList = ref([])
// 날씨 데이터 배열, 여러 지역의 날씨를 담는다.
// 나중에 API 로 weatherList.value = result.weatherList 로 데이터 받아온다.weatherList.value로 ref 데이터에 접근할 수 있다.
// <p>{{ weatherList.length }}</p> 에서는 알아서 자동으로 value를 붙여서 계산해준다. (template에서는 자동으로 .value를 붙여서 계산해줌)
// 이렇게 데이터를 받아온다.
// id: 'city_03',
// name: '부산',
// city: '부산',
// district: '',
// dong: '',
// displayName: '부산광역시',
// lat: 35.1796,
// lon: 129.0756,

const customLocations = ref([])

// 사용자가 추가한 배열, 초깃값은 일단은 빈 배열

// 어떤 형태의 데이터지?


const searchQuery = ref('')
// 사용자가 입력한 검색어 문자열, 나중에 computed에서 검색어를 기반으로 날씨 데이터를 필터링할 때 사용한다.

const selectedCityInfo = ref(null)
// const selectedCityInfo = ref(null) -> 사용자가 선택한 날씨 카드, 처음에는 선택한 도시가 없으므로 null
// selectedCityInfo.value = city -> 나중에 이렇게 데이터가 저장됨.

const selectedMapCityId = ref('')
// 날씨 카드 선택과 지도 선택을 별도로 관리

const isLoading = ref(false)
// API 요청 중인지 표시 -> isLoading이 true이면 버튼이 비활성화


// 에러 메세지 담는 용도
const errorMessage = ref('')
// 전체 날씨 API 오류
const locationErrorMessage = ref('')
// 지역 추가, 삭제 관련 메시지
const forecastErrorMessage = ref('')
// 5일 예보 API 오류

// 마지막 업데이트 시간
const lastUpdated = ref(null)
// 날씨를 마지막으로 받아온 시간을 저장
// lastUpdated.value = new Date() -> 이렇게 저장하면 날씨를 마지막으로 받아온 시간을 저장한다.


// 정렬 방식
const sortMode = ref('default')
// 날씨 카드 정렬 방식 - default, temp-desc, temp-asc, 라디오에 연결되어 있음.
// 정렬 방식이 바뀌면 computed에서 자동으로 필터링된 날씨 데이터가 갱신됨.

const forecastList = ref([])
// 5일 예보 데이터 배열

const isForecastLoading = ref(false)

let forecastRequestId = 0

const weatherTheme = computed(() => {
  return getWeatherTheme(
    selectedCityInfo.value?.icon ?? weatherList.value[0]?.icon,
  )
})




// ------------------------------------------------------------------------
///// 위에는 불러오는 것 위주로, 아래는 실제로 날씨 데이터를 불러오거나, 아니면 계산하는 함수
// computed를 이용해서 계산하는 코드들이 있다.

const readStorageArray = (storageKey) => {
  try {
    const savedValue = localStorage.getItem(storageKey)
    const parsedValue = savedValue ? JSON.parse(savedValue) : []

    return Array.isArray(parsedValue) ? parsedValue : []
  } catch (error) {
    console.warn(`[storage] ${storageKey}를 읽지 못했습니다.`, error)
    return []
  }
}

customLocations.value = readStorageArray(customLocationStorageKey)
const favoriteCityIds = ref(readStorageArray(favoriteStorageKey))

logger.state('대시보드 초기 상태 확인', {
  customLocationCount: customLocations.value.length,
  favoriteCount: favoriteCityIds.value.length,
})

// 전체 지역 목록
const locationList = computed(() => {
  return [...WEATHER_LOCATIONS, ...customLocations.value]
})

// 기본 지역과 사용자 추가 지역을 합쳐서 locationList를 만든다.
// WEATHER_LOCATIONS는 weatherApi.js에서 가져온 기본 지역 목록이다.
// 기본 지역 + 사용자 추가 지역 = 전체 지역
// const a = [1, 2] , const b = [3, 4] , [...a, ...b] = [1, 2, 3, 4] 이런 식으로 합친다.
// ... spread operator, 배열을 펼쳐서 넣는다.


const favoriteCount = computed(() => favoriteCityIds.value.length)
// 즐겨찾기 개수 계산, computed를 이용해서 favoriteCityIds.value.length를 계산한다.
// ['seoul', 'busan'].length = 2 처럼 계산하는데 쓰인다.



// 대망의 검색 기능
// SearchQuery를 기반으로 weatherList를 필터링해서 filteredWeatherList를 만든다.
// SearchQuery는 사용자가 입력한 검색어이다.

// 로직
// 1. 검색어 가져오기, trim()으로 앞뒤 공백 제거
// SearchedCities = query에 정제된 데이터를 넣는다.
// 2. 검색어에 맞는 도시만 필터링
// 3. 선탱한 방식으로 정령
// 4. 결과 반환

const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  // 검색 필터

  // 검색 대상으로 사용할 문자열 세팅
  // ?는 조건이 참일때, :는 조건이 거짓일때
  const searchedCities = query
    ? weatherList.value.filter((city) => {
        const searchableText = [
          city.name,
          city.displayName,
          city.city,
          city.district,
          city.dong,
        ]
          .filter(Boolean)
          .join(' ')
        // .filter(Boolean) -> undefined, null, '' 제거
        // .join(' ') -> 배열을 문자열로 합치기, 공백으로 구분
        return searchableText.includes(query)
        // 그리고 나서 함수로 검색어 포함되어 있는지 확인
      })

    : weatherList.value
    // 조건이 빈 문장열이면 weatherList.value 그대로 반환


  // 여기는 시간 복잡도가 좀 문제가 될 수 있다. -> 그거 고려해야 한디.


  // 높은 기온순 정렬
  // 배열 펼치고 sort()로 정렬, 그리고 나라서 내림차순

  if (sortMode.value === 'temp-desc') {
    return [...searchedCities].sort((first, second) => second.temp - first.temp)
  }

  // 낮은 기온순 정렬
  // 배열 펼치고, sort()로 정렬, 그리고 나서 오름차순

  if (sortMode.value === 'temp-asc') {
    return [...searchedCities].sort((first, second) => first.temp - second.temp)
  }

  return searchedCities
})

const mapCityId = computed(() => {
  return (
    selectedMapCityId.value ||
    locationList.value[0]?.id ||
    ''
  )
})

const lastUpdatedText = computed(() => {
  return lastUpdated.value
    ? lastUpdated.value.toLocaleString('ko-KR')
    : '아직 조회하지 않음'
})

const selectedDisplayTemp = computed(() => {
  const rawTemp = selectedCityInfo.value?.temp

  if (rawTemp === undefined) {
    return null
  }

  return configStore.unit === 'fahrenheit'
    ? Math.round((rawTemp * 9) / 5 + 32)
    : rawTemp
})

const statusBarMessage = computed(() => {
  return selectedCityInfo.value
    ? `${selectedCityInfo.value.name}이 선택되었습니다.`
    : '카드를 선택하면 선택한 도시 정보가 표시됩니다.'
})

const forecastCity = computed(() => {
  return selectedCityInfo.value ?? weatherList.value[0] ?? null
})

// 콘솔 로그 찍어보는 watch, watchEffect

watch(selectedCityInfo, (newCity, oldCity) => {
  console.groupCollapsed('[watch] 선택 도시 변경')
  console.log('이전 도시:', oldCity?.name ?? '없음')
  console.log('현재 도시:', newCity?.name ?? '없음')
  console.log('도시 ID:', newCity?.id ?? '없음')
  console.log('시/구/동:', {
    city: newCity?.city,
    district: newCity?.district,
    dong: newCity?.dong,
  })
  console.log('날씨 상태:', newCity?.status ?? '없음')
  console.log('현재 온도:', newCity?.temp ?? '없음')
  console.log('상태바 문구:', statusBarMessage.value)
  console.groupEnd()
})


// LocalStorage 저장 watch
// 브라우저 LocalStorage에 사용자 추가 지역과 즐겨찾기 도시 ID를 저장

watch(
  customLocations,
  (newLocations) => {
    try {
      localStorage.setItem(
        customLocationStorageKey,
        JSON.stringify(newLocations),
      )
      // stringify로 배열을 문자열로 변환해서 저장
      // LocalStorage는 문자열만 저장할 수 있기 때문에 변환이 필요

      console.info('[location] 사용자 지역 저장 완료:', newLocations)
    } catch (error) {
      console.warn('[location] 사용자 지역을 저장하지 못했습니다.', error)
    }
  },
  { deep: true },
  // 배열 내부 객체의 변경까지 감지
)

watch(
  favoriteCityIds,
  (newFavorites) => {
    try {
      localStorage.setItem(favoriteStorageKey, JSON.stringify(newFavorites))
    } catch (error) {
      console.warn('[favorite] 즐겨찾기를 저장하지 못했습니다.', error)
    }
  },
  { deep: true },
)

// 함수 안에서 사용한 반응형 데이터를 Vue가 자동으로 찾아서 감시
// searchQuery.value
// filteredWeatherList.value
// locationList.value
// weatherList.value
// sortMode.value
// 이 중 하나라도 바뀌면 watchEffect가 다시 실행된다.

watchEffect(() => {
  const query = searchQuery.value.trim()
  const results = filteredWeatherList.value

  console.groupCollapsed('[watchEffect] 검색 상태 변화')
  console.log('입력한 검색어:', searchQuery.value || '없음')
  console.log('전체 지역 수:', locationList.value.length)
  console.log('날씨 데이터 수:', weatherList.value.length)
  console.log('검색 결과 수:', results.length)
  console.log('정렬 방식:', sortMode.value)
  console.log('검색 결과:', results.map((city) => `${city.id} - ${city.name}`))
  console.log('검색 결과 없음:', Boolean(query) && results.length === 0)
  console.groupEnd()
})

// 비동기 함수 async, await
// API 요청 함수는 대부분 async로 선언
// async는 이 함수 안에서 시간이 걸리는 작업을 처리

const loadForecast = async (city) => {
  const requestId = ++forecastRequestId

  if (!city) {
    forecastList.value = []
    forecastErrorMessage.value = ''
    isForecastLoading.value = false
    logger.state('5일 예보 대상 지역 없음')
    return
  }

  isForecastLoading.value = true
  forecastErrorMessage.value = ''
  logger.input('5일 예보 갱신 요청', {
    cityId: city.id,
    name: city.name,
  })

  // API 요청에서는 실패할 수 있으니, try-catch-finally로 감싸서 에러 처리
  try {
    const forecasts = await fetchFiveDayForecast(city)

    if (requestId !== forecastRequestId) {
      logger.warn('오래된 5일 예보 응답을 무시했습니다.', { cityId: city.id })
      return
    }

    forecastList.value = forecasts
    logger.success('5일 예보 화면 갱신 완료', {
      cityId: city.id,
      dayCount: forecasts.length,
    })
  } catch (error) {
    if (requestId !== forecastRequestId) {
      return
    }

    logger.error('5일 예보 화면 갱신 실패', error, {
      cityId: city.id,
      name: city.name,
    })
    forecastList.value = []
    forecastErrorMessage.value =
      '5일 예보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    if (requestId === forecastRequestId) {
      isForecastLoading.value = false
    }
  }
}

// 10. loaeWeatherList 함수, 전체 지역 날씨를 불러오는 함수이다.
// 1. 로딩 시작
// 2. 기존 선택 도시 확인
// 3. API 로딩
// 4. 실패한 지역 안내
// 5. 선택된 도시 유지
// 6. 선택 도시의 예보 조회
// 7. 오류 처리
// 8. 로딩 종료



// async 함수로 ㄱㄱ

const loadWeatherList = async () => {
  // async 함수 안에서, 내부에서 API 요청처럼 오래 걸리는 걸리는 작업을 await로 기다릴 수 있다.

  const selectedCityId = selectedCityInfo.value?.id
  // 현재 선택돤 id를 저장한다, ?. 선택적 연결 연산자
    // 선택된 도시가 있으면 id 가져오기
    // 선택된 도시가 없으면 오류를 내지 않고 undefined 반환
  // ?. 선택적 연결 연산자  -> 선택한 도시가 있으면 id 가져오기
  // 선택된 도시가 없으면 오류를 내지 않고, undefined 반환

  isLoading.value = true
  // 로딩 상태 초기화, true로 설정해서 로딩 화면을 표시한다
  // 이전 오류 메시지 컷
  // .value를 사용하는 건 위에서 isLoading = ref(false)로 선언했기 때문에,
    // ref로 선언한 반응형 데이터에 접근할 때는 .value를 붙여야 한다.

  errorMessage.value = ''
  logger.input('날씨 새로고침 요청', {
    locationCount: locationList.value.length, // 요청할 지역의 개수
    locationIds: locationList.value.map((location) => location.id), // 각 지역의 id 뽑아서 배열로
    selectedCityId: selectedCityId ?? '없음', //SelectId 없으면 없음 출력
  })

  // 날씨 요청을 보내기 전에 새로고침 요청

  console.info('[Axios] 전체 지역 날씨 요청 시작, 날씨 API 가동! ', {
    count: locationList.value.length,
    selectedCityId: selectedCityId ?? '없음',
  })

  // API 요청 시작
  // 지역 목록을 API 함수를 전달해서 날씨 데이터를 요청
  // fetchWeatherList(locationList.value)를 요청

  // {
  //weatherList: [
  //  { id: 1, name: "서울", temperature: 27 },
  //  { id: 2, name: "부산", temperature: 29 }
  // ],
  //failedLocations: []
  // }
  // 그러면 이 전체 객체가 result에 담긴다.

  try {
    const result = await fetchWeatherList(locationList.value)
    // 날씨 목록
    weatherList.value = result.weatherList
    // API에서 받은 날씨 목록을 화면에서 사용할 weatherList에 저
    lastUpdated.value = new Date()
    // 마지막으로 새로고침한 시간을 현재 시간으로 저장


    // 일부 지역 요청 실패 처리
    // 실패한 지역의 이름을 뽑아서 오류 메시지를 만든다.
    // 예를 들어 실패 목록이

    // [
    //  { location: { name: "서울" } },
    //  { location: { name: "부산" } }
    // ]

    // 일부 지역을 불러오지 못했습니다: 서울, 부산

    if (result.failedLocations.length > 0) {
      errorMessage.value = `일부 지역을 불러오지 못했습니다: ${result.failedLocations
        .map(({ location }) => location.name) // 각 실패 객체에서 location.name만 꺼내는 코드
        .join(', ')}` // 도시 이름 배열을 쉼표로 연결해 문자열로 만든다.
    }

    // 기존에 선택한 도시 유지
    // 날씨를 새로 불러온 뒤에도 사용자가 선택했던 도시를 유지하려는 부분

    if (selectedCityId) {
      selectedCityInfo.value =
        result.weatherList.find((city) => city.id === selectedCityId) ?? null
    }

    // 선택한 도시의 예보를 불러온다.
    // 1. 현재 선택된 도시
    // 2. 날씨 목록의 첫 번째 도시
    // 3. null
    loadForecast(selectedCityInfo.value ?? result.weatherList[0] ?? null)

    // 성공 로그
    console.info('[Axios] 전체 지역 날씨 수신 완료', {
      successCount: result.weatherList.length,
      failedCount: result.failedLocations.length,
      lastUpdated: lastUpdated.value.toISOString(),
    })

    // 메시지 찍는 부분
    logger.success('대시보드 날씨 데이터 갱신 완료', {
      successCount: result.weatherList.length,
      failedCount: result.failedLocations.length,
    })
    // API 요청 오류 처리
    // (네트워크, API 키, 서버) 와 같은 오류가 발생하면 실행된다.
  } catch (error) {
    console.error('[Axios] 전체 지역 날씨 요청 실패:', error)
    logger.error('대시보드 날씨 데이터 갱신 실패', error)
    //
    weatherList.value = []
    selectedCityInfo.value = null
    loadForecast(null)
    errorMessage.value =
      '실시간 날씨를 불러오지 못했습니다. API 키와 네트워크를 확인해주세요.'
  }
    // 항상 로딩 종료 , finally는 항상 로딩 종료
    finally {
    isLoading.value = false
    logger.state('날씨 로딩 상태 변경', { isLoading: false })
  }
}



const addLocation = async (location) => {
  // 사용자가 검색한 지역을 추가
  // 먼저 중복 여부를 확인
  logger.input('사용자 지역 추가 요청', {
    id: location.id,
    name: location.name,
    lat: location.lat,
    lon: location.lon,
  })

  // 먼저 중복 여부를 확인
  // some은 일부라도 중복되면 true를 반환
  const isDuplicate = locationList.value.some(
    (savedLocation) => savedLocation.id === location.id,
  )

  if (isDuplicate) {
    locationErrorMessage.value = '이미 추가된 지역입니다.'
    logger.warn('이미 등록된 지역입니다.', { id: location.id })
    return
  }

  locationErrorMessage.value = ''

  try {
    const weather = await fetchWeatherByLocation(location)
    // 기존 배열에 새 지역에 추가한다.
    customLocations.value = [...customLocations.value, location]
    weatherList.value = [...weatherList.value, weather]
    selectedCityInfo.value = weather
    selectedMapCityId.value = weather.id
    loadForecast(weather)
    lastUpdated.value = new Date()
    locationErrorMessage.value = `${location.name} 날씨를 추가했습니다.`
    logger.success('사용자 지역 추가 완료', {
      id: location.id,
      name: location.name,
      weatherCount: weatherList.value.length,
    })
  } catch (error) {
    console.error('[Axios] 추가 지역 날씨 요청 실패:', error)
    logger.error('사용자 지역 날씨 조회 실패', error, {
      id: location.id,
      name: location.name,
    })
    locationErrorMessage.value = `${location.name}의 날씨를 불러오지 못했습니다.`
  }
}

const isCustomLocation = (cityId) => {
  return customLocations.value.some((location) => location.id === cityId)
}


// 사용자가 추가한 지역 하나를 삭제
// 삭제할 ID와 다른 항목만 남긴다.

const removeLocation = (cityId) => {
  logger.input('사용자 지역 삭제 요청', { cityId })
  const location = customLocations.value.find((item) => item.id === cityId)

  if (!location) {
    logger.warn('삭제할 사용자 지역을 찾지 못했습니다.', { cityId })
    return
  }

  if (!window.confirm(`${location.name} 지역을 삭제할까요?`)) {
    logger.state('사용자 지역 삭제 취소', { cityId })
    return
  }

  customLocations.value = customLocations.value.filter(
    (item) => item.id !== cityId,
  )
  weatherList.value = weatherList.value.filter((city) => city.id !== cityId)
  favoriteCityIds.value = favoriteCityIds.value.filter(
    (favoriteId) => favoriteId !== cityId,
  )

  if (selectedCityInfo.value?.id === cityId) {
    selectedCityInfo.value = null
    loadForecast(weatherList.value[0] ?? null)
  }

  if (selectedMapCityId.value === cityId) {
    selectedMapCityId.value = ''
  }

  locationErrorMessage.value = `${location.name} 지역을 삭제했습니다.`
  logger.success('사용자 지역 삭제 완료', {
    cityId,
    remainingCustomLocationCount: customLocations.value.length,
  })
}

// 사용자가 추가한 지역을 전부 삭제
// 초기화 기능

const resetCustomLocations = () => {
  logger.input('사용자 지역 전체 초기화 요청', {
    customLocationCount: customLocations.value.length,
  })
  if (customLocations.value.length === 0) {
    locationErrorMessage.value = '초기화할 추가 지역이 없습니다.'
    logger.warn('초기화할 사용자 지역이 없습니다.')
    return
  }

  if (!window.confirm('추가한 지역을 모두 삭제할까요?')) {
    logger.state('사용자 지역 전체 초기화 취소')
    return
  }

  const customLocationIds = new Set(
    customLocations.value.map((location) => location.id),
  )

  customLocations.value = []
  // 빈 배열로 만들어서 초기화 때려버린다.

  weatherList.value = weatherList.value.filter(
    (city) => !customLocationIds.has(city.id),
  )
  favoriteCityIds.value = favoriteCityIds.value.filter(
    (favoriteId) => !customLocationIds.has(favoriteId),
  )

  if (selectedCityInfo.value && customLocationIds.has(selectedCityInfo.value.id)) {
    selectedCityInfo.value = null
    loadForecast(weatherList.value[0] ?? null)
  }

  if (customLocationIds.has(selectedMapCityId.value)) {
    selectedMapCityId.value = ''
  }

  locationErrorMessage.value = '추가한 지역을 모두 초기화했습니다.'
  logger.success('사용자 지역 전체 초기화 완료', {
    removedCount: customLocationIds.size,
  })
}

const updateSearchQuery = (query) => {
  logger.input('도시 검색어 전달 수신', {
    query,
    queryLength: query.trim().length,
  })
  searchQuery.value = query
}

const selectCity = (city) => {
  logger.input('날씨 카드 선택 수신', {
    id: city.id,
    name: city.name,
  })
  selectedCityInfo.value = city
  loadForecast(city)
  logger.success('날씨 카드 선택 상태만 변경했습니다. 지도 선택 상태는 유지합니다.', {
    weatherCityId: city.id,
    mapCityId: selectedMapCityId.value || '없음',
  })
}

const selectMapCity = (cityId) => {
  logger.input('지도 지역 선택 수신', { cityId })
  selectedMapCityId.value = cityId
  logger.success('지도 위치만 변경했습니다. 날씨 선택 상태는 유지합니다.', {
    cityId,
    selectedWeatherCityId: selectedCityInfo.value?.id ?? '없음',
  })
}

const isFavorite = (cityId) => favoriteCityIds.value.includes(cityId)

// 즐겨찾기 여부
// 이미 즐겨찾기면 삭제

const toggleFavorite = (cityId) => {
  const wasFavorite = isFavorite(cityId)
  favoriteCityIds.value = isFavorite(cityId)
    ? favoriteCityIds.value.filter((favoriteId) => favoriteId !== cityId)
    : [...favoriteCityIds.value, cityId]
  logger.success('즐겨찾기 상태 변경 완료', {
    cityId,
    isFavorite: !wasFavorite,
    favoriteCount: favoriteCityIds.value.length,
  })
}

// 상세 페이지로 이동한다.
// 링크에 city id 넣어서 /weather/seoul 같이 이동한다.

const goToDetail = async (cityId) => {
  logger.input('상세 날씨 페이지 이동 요청', { cityId })

  try {
    await router.push(`/weather/${cityId}`)
    logger.success('상세 날씨 페이지 이동 완료', { cityId })
  } catch (error) {
    logger.error('상세 날씨 페이지 이동 실패', error, { cityId })
  }
}


// 이 컴포넌트가 브라우저 화면에 처음 나타난 후에 실행된다.
// 따라서 사용자가 페이지를 열면 자동으로 API를 요청한다.
// 페이지 진입
// → 컴포넌트 마운트
// → loadWeatherList 실행
// → 날씨 화면 출력

onMounted(() => {
  logger.state('대시보드 마운트 완료')
  loadWeatherList()
})

</script>

<!-- 여기부터가 템플릿임, 진짜 길다 ㅋㅋ

dashboard-wrapper
├─ 첫 번째 BaseDashboardCard
│  ├─ LocationSearchPanel
│  ├─ 추가 지역 개수
│  ├─ 전체 초기화 버튼
│  └─ 지역 관련 메시지
│
└─ 두 번째 BaseDashboardCard
   ├─ dashboard-columns
   │  ├─ weather-overview
   │  │  ├─ SearchBar
   │  │  ├─ 제목
   │  │  ├─ 정렬
   │  │  ├─ 새로고침
   │  │  ├─ 로딩·오류 메시지
   │  │  └─ WeatherCard 반복
   │  └─ WeatherComparisonChart
   │
   ├─ status-bar
   └─ WeatherForecastPanel


-->

<template>
  <!-- 반복되는 기능 디자인은 slot으로 처리한다.
  - 카드, 모달, 패널처럼 바깥 구조가 반복될 때 주로 쓴다고 한더라.
  -->

  <div
    class="dashboard-wrapper"
    :class="`weather-theme-${weatherTheme}`"
  >
    <!-- BaseDashboardCard가 바깥 디자인을 제공 -->
    <BaseDashboardCard>
      <!-- LocationSearchPanel
      locations -> 전체 지역 목록
      selected -> 현재 지도에서 선택한 지역 ID
      -->
      <LocationSearchPanel
        :locations="locationList"
        :selected-city-id="mapCityId"
        @add-location="addLocation"
        @select-city="selectMapCity"
      />
      <!-- add location , selectMapCity 실행 -->

      <div class="location-actions">
        <span>추가 지역 {{ customLocations.length }}개</span>
        <el-button
          type="danger"
          plain
          round
          :disabled="customLocations.length === 0"
          @click="resetCustomLocations"
        >
          추가 지역 초기화
        </el-button>
      </div>

      <el-alert
        v-if="locationErrorMessage"
        class="location-message"
        :title="locationErrorMessage"
        type="info"
        :closable="false"
        show-icon
      />

    </BaseDashboardCard>

    <!--
    slot을 써서 부모가 전달한 내용이 들어간다.
    -->

    <BaseDashboardCard>
      <div class="dashboard-columns">
        <section class="weather-overview">
          <div class="weather-search-bar">
            <SearchBar
              :current-query="searchQuery"
              @update-query="updateSearchQuery"
            />
          </div>

          <div class="list-heading">
            <div>
              <h1>🏙️ 지역별 날씨 현황</h1>
              <p class="list-caption">주소 검색으로 원하는 지역을 계속 추가할 수 있습니다.</p>
            </div>
            <p>{{ filteredWeatherList.length }}개 도시</p>
          </div>

          <div class="weather-toolbar">
            <label class="sort-control">
              기온순 정렬
              <el-select
                v-model="sortMode"
                aria-label="기온순 정렬"
              >
                <el-option label="기본 순서" value="default" />
                <el-option label="높은 기온순" value="temp-desc" />
                <el-option label="낮은 기온순" value="temp-asc" />
              </el-select>
            </label>

            <el-button
              type="primary"
              round
              class="refresh-button"
              :disabled="isLoading"
              :loading="isLoading"
              @click="loadWeatherList"
            >
              날씨 새로고침
            </el-button>

            <div class="dashboard-meta">
              <span>즐겨찾기 {{ favoriteCount }}개</span>
              <span>마지막 조회: {{ lastUpdatedText }}</span>
            </div>
          </div>

          <div
            v-if="isLoading"
            class="loading-message"
          >
            <el-skeleton animated :rows="2" />
            Axios로 모든 지역의 실시간 날씨를 불러오는 중입니다...
          </div>

          <el-alert
            v-if="errorMessage"
            class="api-message"
            :title="errorMessage"
            type="error"
            :closable="false"
            show-icon
          />

          <div
            v-if="!isLoading && filteredWeatherList.length > 0"
            class="weather-grid"
          >
            <WeatherCard
              v-for="city in filteredWeatherList"
              :key="city.id"
              :city-item="city"
              :is-selected="selectedCityInfo?.id === city.id"
              :is-favorite="isFavorite(city.id)"
              :is-custom-location="isCustomLocation(city.id)"
              @select-card="selectCity"
              @click-detail="goToDetail"
              @toggle-favorite="toggleFavorite"
              @remove-location="removeLocation"
            />
          </div>

          <el-empty
            v-else-if="!isLoading && !errorMessage"
            class="empty-message"
            :description="`'${searchQuery}'와 일치하는 도시가 없습니다.`"
          />

        </section>

        <WeatherComparisonChart :cities="filteredWeatherList" />
      </div>

      <section class="status-bar" aria-live="polite">
        <template v-if="selectedCityInfo">
          <strong>{{ statusBarMessage }}</strong>
          <span>
            현재 {{ selectedDisplayTemp }}{{ configStore.unitSymbol }}, 날씨는
            {{ selectedCityInfo.status }}입니다.
          </span>
          <small>{{ selectedCityInfo.displayName }}</small>
        </template>
        <span v-else>{{ statusBarMessage }}</span>
      </section>

      <!-- 봄
      부모의 forecastCity          → 자식의 city
      부모의 forecastList          → 자식의 forecasts
      부모의 isForecastLoading     → 자식의 isLoading
      부모의 forecastErrorMessage  → 자식의 errorMessage
      -->
      <WeatherForecastPanel
        :city="forecastCity"
        :forecasts="forecastList"
        :is-loading="isForecastLoading"
        :error-message="forecastErrorMessage"
      />
    </BaseDashboardCard>

  </div>
</template>


<!--여기는 CSS..! AI가 잘 꾸며줄 것이다. -->

<style scoped>
.dashboard-wrapper {
  width: 100%;
  max-width: 1560px;
  margin: 0 auto;
}

.location-message {
  margin: 12px 0 0;
  color: #166534;
  font-weight: 700;
}

.weather-search-bar {
  margin-top: 12px;
  padding: 0;
  background: transparent;
}

.location-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  color: #64748b;
  font-size: 0.9rem;
}

.location-actions button {
  padding: 8px 12px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fff1f2;
  color: #be123c;
  font-weight: 700;
  cursor: pointer;
}

.location-actions button:hover:not(:disabled) {
  background: #ffe4e6;
}

.location-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.dashboard-columns {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  align-items: start;
  gap: 16px;
}

.weather-overview {
  min-width: 0;
}

.weather-toolbar {
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: end;
  gap: 8px;
  margin-bottom: 12px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.sort-control {
  display: grid;
  gap: 6px;
  color: #475569;
  font-size: 0.85rem;
  font-weight: 700;
}

.sort-control select {
  min-width: 150px;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #0f172a;
}

.refresh-button {
  min-height: 40px;
  padding: 10px 14px;
  border: 1px solid #2563eb;
  border-radius: 8px;
  background: #2563eb;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.refresh-button:hover:not(:disabled) {
  background: #1d4ed8;
}

.refresh-button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.dashboard-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px 14px;
  min-height: 40px;
  align-items: center;
  color: #64748b;
  font-size: 0.85rem;
  text-align: right;
}

.list-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.list-heading h1 {
  margin: 0;
  color: #0f172a;
  font-size: 1.5rem;
}

.list-heading p {
  margin: 0;
  color: #64748b;
}

.list-heading .list-caption {
  margin-top: 6px;
  font-size: 0.9rem;
}

.weather-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.empty-message {
  margin: 0;
  padding: 12px;
  border: 1px dashed #94a3b8;
  border-radius: 12px;
  background: #f8fafc;
  color: #334155;
  text-align: center;
}

.loading-message,
.api-message {
  margin: 0 0 16px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #eff6ff;
  color: #1e40af;
  text-align: center;
}

.api-message {
  background: #fff7ed;
  color: #9a3412;
}

.status-bar {
  display: grid;
  gap: 8px;
  min-height: auto;
  margin-top: 16px;
  padding: 10px 14px;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  background: #f0fdf4;
  color: #166534;
  line-height: 1.5;
  text-align: center;
}

.status-bar strong {
  color: #14532d;
}

.status-bar small {
  display: block;
  overflow-wrap: anywhere;
  color: #64748b;
}

@media (max-width: 1100px) {
  .dashboard-columns {
    grid-template-columns: 1fr;
  }

  .weather-toolbar {
    grid-template-columns: 1fr 1fr;
  }

  .dashboard-meta {
    grid-column: 1 / -1;
    justify-content: flex-start;
    text-align: left;
  }
}

@media (max-width: 760px) {
  .weather-grid {
    grid-template-columns: 1fr;
  }

  .list-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 560px) {
  .weather-toolbar {
    grid-template-columns: 1fr;
  }

  .dashboard-meta {
    grid-column: auto;
  }
}

.dashboard-wrapper {
  max-width: 1560px;
}

.weather-toolbar {
  border-top-color: rgb(255 255 255 / 58%);
}

.sort-control select {
  border-color: rgb(148 163 184 / 38%);
  background: rgb(255 255 255 / 68%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 80%);
  backdrop-filter: blur(10px);
}

.refresh-button {
  border-color: rgb(255 255 255 / 42%);
  background: #4f46e5;
  box-shadow: 0 8px 18px rgb(37 99 235 / 22%);
}

.refresh-button:hover:not(:disabled) {
  background: #4338ca;
}

.empty-message {
  border-color: rgb(100 116 139 / 42%);
  background: rgb(255 255 255 / 45%);
  backdrop-filter: blur(10px);
}

.loading-message,
.api-message {
  background: rgb(219 234 254 / 58%);
  backdrop-filter: blur(10px);
}

.api-message {
  background: rgb(255 237 213 / 66%);
}

.status-bar {
  border-color: rgb(134 239 172 / 56%);
  background: rgb(240 253 244 / 62%);
  box-shadow: 0 10px 24px rgb(22 101 52 / 8%);
  backdrop-filter: blur(12px);
}

.dashboard-wrapper {
  position: relative;
  isolation: isolate;
  min-height: auto;
  padding: 8px 0 24px;
  border-radius: 24px;
  transition: background 0.7s ease;
}

.dashboard-wrapper::before {
  position: absolute;
  inset: 10% 4% auto auto;
  z-index: -1;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: rgb(99 102 241 / 10%);
  content: '';
  filter: blur(8px);
  pointer-events: none;
}

.dashboard-wrapper.weather-theme-default {
  background: rgb(241 245 249 / 82%);
}

.dashboard-wrapper.weather-theme-clear {
  background: rgb(224 242 254 / 78%);
}

.dashboard-wrapper.weather-theme-clouds {
  background: rgb(226 232 240 / 78%);
}

.dashboard-wrapper.weather-theme-rain {
  background: rgb(191 219 254 / 78%);
}

.dashboard-wrapper.weather-theme-storm {
  background: rgb(99 102 241 / 68%);
}

.dashboard-wrapper.weather-theme-snow {
  background: rgb(239 246 255 / 82%);
}

.dashboard-wrapper.weather-theme-mist {
  background: rgb(203 213 225 / 78%);
}

@media (prefers-reduced-motion: reduce) {
  .dashboard-wrapper {
    transition: none;
  }
}
</style>
