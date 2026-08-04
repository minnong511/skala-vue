<script setup>
import { ref } from 'vue'

const projectStructureCard = {
  id: 'structure',
  title: '프로젝트 구조',
  summary: '날씨 대시보드가 어떤 파일과 폴더로 구성되어 있는지 한눈에 확인합니다.',
  variables: [
    {
      name: 'App.vue',
      description: '공통 헤더와 RouterView를 배치하는 애플리케이션 뼈대입니다.',
    },
    {
      name: 'main.js',
      description: 'Vue 앱, Pinia, Vue Router를 등록하고 실행합니다.',
    },
    {
      name: 'src/views',
      description: '라우터와 연결되는 화면 단위 컴포넌트를 모아 둔 폴더입니다.',
    },
  ],
  directories: [
    'src/components/exercise/, 화면을 구성하는 재사용 컴포넌트',
    'src/services/, Axios와 외부 API 요청 로직',
    'src/components/exercise/LocationSearchPanel.vue, 지역 검색 화면',
    'src/services/locationApi.js, 주소와 좌표 변환',
    'src/stores/, Pinia 전역 상태',
    'src/router/, 페이지 경로와 지연 로딩 설정',
    'src/views/, 홈, 상세, 실습, 프로젝트 화면',
  ],
  diagram: `src/
├── App.vue                    # 공통 헤더, RouterView
├── main.js                    # 앱 시작점, Pinia 등록
├── assets/                    # 전역 CSS와 이미지
├── components/exercise/       # 날씨 대시보드 컴포넌트
│   ├── WeatherParent.vue
│   ├── WeatherCard.vue
│   ├── SearchBar.vue
│   ├── LocationSearchPanel.vue
│   ├── WeatherComparisonChart.vue
│   └── WeatherForecastPanel.vue
├── router/index.js            # URL과 화면 연결
├── services/weatherApi.js     # OpenWeather 현재·5일 예보, Google Maps
├── services/locationApi.js    # Nominatim 주소 검색
├── stores/configStore.js      # 온도 단위 전역 상태
└── views/                     # 라우트별 화면`,
  homeFlowDiagram: `App.vue
└── <RouterView>
    └── WeatherHomeView.vue
        └── WeatherParent.vue
            ├── ref: weatherList / searchQuery / selectedCityInfo
            ├── computed: filteredWeatherList
            ├── watch / watchEffect: 상태 변화 추적
            │
            └── <BaseDashboardCard>
                └── <slot>
                    ├── LocationSearchPanel
                    │   ├── v-model: 주소 검색어
                    │   ├── v-if / v-for: 검색 결과와 지도
                    │   └── @add-location: 지역 추가
                    ├── SearchBar
                    │   ├── :current-query: 검색어 props
                    │   └── @update-query: 검색어 emits
                    ├── WeatherCard v-for
                    │   ├── :city-item: 도시 날씨 props
                    │   └── @select-card / @click-detail
                    ├── WeatherComparisonChart
                    │   └── v-model: 기온 / 습도 / 풍속
                    └── WeatherForecastPanel
                        └── v-if / v-for: 5일 예보 표시`,
  definitions: [
    { term: '컴포넌트', description: '화면을 기능 단위로 나눈 Vue 파일입니다.' },
    { term: '서비스', description: '외부 API 통신처럼 화면 밖의 로직을 분리한 영역입니다.' },
    { term: '라우트', description: 'URL과 보여줄 Vue 화면을 연결한 규칙입니다.' },
  ],
}

const projectCards = [
  {
    order: 1,
    id: 'ref',
    title: '반응형 상태 관리 (ref)',
    summary: '검색어, 도시 목록, 선택 도시처럼 화면 변화에 따라 갱신되는 값을 관리합니다.',
    variables: [
      { name: 'weatherList', description: 'API에서 받은 지역별 날씨 배열입니다.' },
      { name: 'searchQuery', description: '검색창에 입력된 도시 검색어입니다.' },
      { name: 'selectedCityInfo', description: '현재 선택된 도시 객체입니다.' },
      { name: 'isLoading, errorMessage', description: '요청 중 상태와 오류 문구입니다.' },
    ],
    directories: [
      'src/components/exercise/WeatherParent.vue, 상태의 중심',
      'src/components/exercise/SearchBar.vue, 검색어 입력 화면',
      'src/services/weatherApi.js, 날씨 데이터 원본',
    ],
    diagram: `ref 상태
├── searchQuery ──> SearchBar 입력값
├── weatherList ──> WeatherCard 목록
└── selectedCityInfo ──> 상태바, 5일 예보 대상 도시`,
    definitions: [
      { term: 'ref', description: '문자열, 숫자, 배열, 객체를 반응형 값으로 만드는 함수입니다.' },
      { term: '반응형', description: '값이 변경되면 연결된 템플릿도 자동으로 다시 표시되는 특징입니다.' },
      { term: '상태', description: '화면과 기능이 현재 기억하고 있어야 하는 데이터입니다.' },
    ],
  },
  {
    order: 2,
    id: 'computed',
    title: '계산된 상태 관리 (computed)',
    summary: '원본 데이터를 직접 변경하지 않고 검색, 정렬, 단위 변환 결과를 계산합니다.',
    variables: [
      { name: 'filteredWeatherList', description: '검색어와 정렬 조건을 적용한 도시 목록입니다.' },
      { name: 'mapCityId', description: '지도에 표시할 도시 ID를 계산합니다.' },
      { name: 'displayTemp', description: '섭씨 원본을 현재 단위에 맞게 변환한 온도입니다.' },
      { name: 'chartRows', description: '비교 그래프의 값과 막대 비율을 계산한 배열입니다.' },
    ],
    directories: [
      'src/components/exercise/WeatherParent.vue, 검색과 정렬 계산',
      'src/components/exercise/WeatherCard.vue, 카드 온도 계산',
      'src/components/exercise/WeatherComparisonChart.vue, 그래프 계산',
    ],
    diagram: `weatherList + searchQuery + sortMode
                  │
                  ▼
        filteredWeatherList (computed)
                  │
                  ▼
             WeatherCard 목록`,
    definitions: [
      { term: 'computed', description: '반응형 원본 값이 바뀔 때만 결과를 다시 계산하는 함수입니다.' },
      { term: '필터링', description: '조건에 맞는 항목만 골라 새로운 배열을 만드는 작업입니다.' },
      { term: '정렬', description: '기온처럼 특정 기준에 따라 배열 순서를 바꾸는 작업입니다.' },
    ],
  },
  {
    order: 3,
    id: 'props-emits',
    title: '컴포넌트 통신 (props / emits)',
    summary: '부모가 데이터를 전달하고 자식이 사용자의 행동을 이벤트로 알립니다.',
    variables: [
      { name: 'cityItem', description: 'WeatherCard가 표시할 도시 객체입니다.' },
      { name: 'isSelected, isFavorite', description: '선택 여부와 즐겨찾기 여부입니다.' },
      { name: 'update-query', description: 'SearchBar가 검색어를 부모에게 보내는 이벤트입니다.' },
      { name: 'select-card, toggle-favorite', description: 'WeatherCard의 사용자 행동 이벤트입니다.' },
    ],
    directories: [
      'src/components/exercise/SearchBar.vue, 검색어 props와 emits',
      'src/components/exercise/WeatherCard.vue, 도시 props와 emits',
      'src/components/exercise/WeatherParent.vue, 이벤트 수신 부모',
    ],
    diagram: `WeatherParent
├─ :current-query ──> SearchBar (props)
├─ @update-query <── SearchBar (emits)
└─ :city-item ──────> WeatherCard (props)
   @select-card <──── WeatherCard (emits)`,
    definitions: [
      { term: 'props', description: '부모 컴포넌트가 자식 컴포넌트로 전달하는 읽기 전용 데이터입니다.' },
      { term: 'emits', description: '자식 컴포넌트가 부모에게 발생한 행동을 알리는 이벤트입니다.' },
      { term: 'v-model', description: '입력 요소의 값과 반응형 상태를 양방향으로 연결하는 문법입니다.' },
    ],
  },
  {
    order: 4,
    id: 'slot',
    title: '공통 레이아웃 구성 (slot)',
    summary: '공통 카드 디자인은 유지하면서 검색창과 날씨 목록을 서로 다른 내용으로 주입합니다.',
    variables: [
      { name: 'BaseDashboardCard', description: '공통 테두리와 여백을 제공하는 카드 컴포넌트입니다.' },
      { name: '<slot />', description: '부모가 전달한 자식 콘텐츠가 표시되는 자리입니다.' },
      { name: 'SearchBar, WeatherCard', description: 'slot 안에 주입되는 실제 기능 컴포넌트입니다.' },
    ],
    directories: [
      'src/components/exercise/BaseDashboardCard.vue, 공통 카드',
      'src/components/exercise/WeatherParent.vue, slot 사용 부모',
    ],
    diagram: `BaseDashboardCard
└── <slot />
    ├── SearchBar
    └── WeatherCard 목록`,
    definitions: [
      { term: 'slot', description: '공통 컴포넌트 안에 부모의 콘텐츠를 끼워 넣는 Vue 기능입니다.' },
      { term: '재사용 컴포넌트', description: '여러 화면에서 같은 디자인과 구조를 다시 사용할 수 있는 파일입니다.' },
      { term: '스코프', description: '변수나 스타일이 적용되는 범위입니다.' },
    ],
  },
  {
    order: 5,
    id: 'watch',
    title: '상태 변화 감시 (watch / watchEffect)',
    summary: '검색과 도시 선택의 변화를 추적해 콘솔 로그와 저장 동작을 실행합니다.',
    variables: [
      { name: 'newCity, oldCity', description: 'watch에서 선택 전후 도시를 비교하는 값입니다.' },
      { name: 'query, results', description: 'watchEffect에서 검색어와 결과를 확인하는 값입니다.' },
      { name: 'favoriteCityIds', description: '즐겨찾기 변경을 감지해 localStorage에 저장합니다.' },
    ],
    directories: [
      'src/components/exercise/WeatherParent.vue, watch와 watchEffect 실행 위치',
      '브라우저 localStorage, 즐겨찾기 저장 공간',
    ],
    diagram: `searchQuery 변경
        │
        ▼
watchEffect ──> 검색어, 결과 수 콘솔 출력

selectedCityInfo 변경
        │
        ▼
watch ────────> 이전/현재 도시 콘솔 출력`,
    definitions: [
      { term: 'watch', description: '지정한 반응형 값의 변경을 감시하는 함수입니다.' },
      { term: 'watchEffect', description: '함수 안에서 사용한 반응형 값을 자동으로 추적하는 함수입니다.' },
      { term: 'localStorage', description: '브라우저에 간단한 데이터를 저장하는 기능입니다.' },
    ],
  },
  {
    order: 6,
    id: 'pinia',
    title: '전역 상태 관리 (Pinia)',
    summary: '홈, 상세 화면, 카드가 같은 온도 단위 설정을 공유합니다.',
    variables: [
      { name: 'unit', description: 'celsius 또는 fahrenheit를 저장하는 전역 상태입니다.' },
      { name: 'unitSymbol', description: '현재 단위에 따라 ℃ 또는 ℉를 반환합니다.' },
      { name: 'toggleUnit', description: '섭씨와 화씨를 전환하는 액션입니다.' },
      { name: 'configStore', description: '컴포넌트에서 설정 store를 사용하는 변수입니다.' },
    ],
    directories: [
      'src/stores/configStore.js, Pinia store 정의',
      'src/components/exercise/UnitToggler.vue, 단위 변경 버튼',
      'src/views/WeatherDetailView.vue, 상세 화면 단위 표시',
    ],
    diagram: `UnitToggler
     │ toggleUnit()
     ▼
configStore ──> unit ──> WeatherCard / Detail / Chart`,
    definitions: [
      { term: 'Pinia', description: 'Vue 애플리케이션에서 여러 컴포넌트가 함께 쓰는 상태 관리 도구입니다.' },
      { term: 'store', description: '공유할 상태와 상태 변경 함수를 모아 둔 저장소입니다.' },
      { term: '전역 상태', description: '특정 컴포넌트 하나가 아니라 앱 여러 곳에서 사용하는 상태입니다.' },
    ],
  },
  {
    order: 7,
    id: 'axios',
    title: '날씨 API 통신 (Axios)',
    summary: '도시 좌표를 기준으로 OpenWeather API를 요청하고 화면용 데이터로 변환합니다.',
    variables: [
      { name: 'OPEN_WEATHER_URL', description: '현재 날씨 API 요청 주소입니다.' },
      { name: 'WEATHER_LOCATIONS', description: '화면에서 조회할 도시 ID와 좌표 배열입니다.' },
      { name: 'nextWeatherList', description: '새 Axios 요청이 성공했을 때 받은 날씨 목록입니다.' },
      { name: 'lastUpdated', description: '마지막으로 API 요청에 성공한 시각입니다.' },
    ],
    directories: [
      'src/services/weatherApi.js, API 주소와 응답 변환',
      'src/components/exercise/WeatherParent.vue, 목록 요청과 오류 처리',
      'src/views/WeatherDetailView.vue, 상세 도시 요청',
    ],
    diagram: `WeatherParent
   │ fetchWeatherList()
   ▼
weatherApi.js ──> OpenWeather API
   │ normalizeWeatherData()
   ▼
WeatherCard / WeatherDetailView`,
    definitions: [
      { term: 'Axios', description: '브라우저에서 서버에 HTTP 요청을 보내는 JavaScript 라이브러리입니다.' },
      { term: 'API', description: '프로그램끼리 데이터를 주고받기 위한 약속된 통신 창구입니다.' },
      { term: '응답 변환', description: '서버 데이터 구조를 화면에서 쓰기 편한 구조로 바꾸는 작업입니다.' },
    ],
  },
  {
    order: 8,
    id: 'location-search',
    title: '사용자 지역 추가 (Nominatim)',
    summary: '주소를 검색해 시·구·동과 좌표를 확인하고, 해당 지역의 날씨를 목록에 추가합니다.',
    variables: [
      { name: 'locationList', description: '기본 지역과 사용자가 추가한 지역을 합친 목록입니다.' },
      { name: 'customLocations', description: 'localStorage에 저장되는 사용자 추가 지역 배열입니다.' },
      { name: 'searchResults', description: '주소 검색 결과로 반환된 후보 지역 배열입니다.' },
      { name: 'lat, lon, city, district, dong', description: '날씨 요청과 시·구·동 표시에 사용하는 지역 정보입니다.' },
    ],
    directories: [
      'src/components/exercise/LocationSearchPanel.vue, 주소 검색과 추가 버튼',
      'src/services/locationApi.js, Nominatim 요청과 주소 변환',
      'src/components/exercise/WeatherParent.vue, 지역 저장과 날씨 추가',
    ],
    diagram: `주소 검색 입력
      │ debounce
      ▼
locationApi.js ──> Nominatim API
      │ city / district / dong / lat / lon
      ▼
WeatherParent ──> localStorage + OpenWeather API
      │
      ▼
새로운 WeatherCard와 Google Maps 위치`,
    definitions: [
      { term: 'Nominatim', description: 'OpenStreetMap 데이터를 이용해 주소와 좌표를 검색하는 서비스입니다.' },
      { term: '지오코딩', description: '주소를 위도와 경도 좌표로 변환하는 작업입니다.' },
      { term: 'localStorage', description: '브라우저에 사용자 추가 지역을 저장해 새로고침 후에도 유지하는 기능입니다.' },
    ],
  },
  {
    order: 9,
    id: 'router',
    title: '페이지 이동 (Vue Router)',
    summary: '홈, 상세 날씨, 실습 과제, 프로젝트 타임라인을 URL별 화면으로 연결합니다.',
    variables: [
      { name: 'routes', description: 'URL과 해당 Vue 화면의 연결 목록입니다.' },
      { name: 'router', description: '프로그램에서 다른 경로로 이동할 때 사용하는 라우터 객체입니다.' },
      { name: 'cityId', description: '동적 경로에서 상세 도시를 식별하는 값입니다.' },
    ],
    directories: [
      'src/router/index.js, 라우트와 지연 로딩 설정',
      'src/App.vue, RouterLink와 RouterView 배치',
      'src/views/, 라우트별 화면 파일',
    ],
    diagram: `RouterLink 클릭
      │
      ▼
router/index.js ──> /weather/:cityId
      │
      ▼
RouterView ───────> WeatherDetailView`,
    definitions: [
      { term: 'Vue Router', description: 'Vue에서 URL에 따라 화면을 바꾸는 공식 라우팅 도구입니다.' },
      { term: 'RouterLink', description: '페이지 전체 새로고침 없이 다른 경로로 이동하는 링크입니다.' },
      { term: 'RouterView', description: '현재 URL에 해당하는 화면 컴포넌트가 표시되는 자리입니다.' },
    ],
  },
  {
    order: 10,
    id: 'google-maps',
    title: '지도 임베드 (Google Maps Embed API)',
    summary: '주소 검색 결과와 기존 지역의 좌표를 같은 검색 박스 안 지도에 표시합니다.',
    variables: [
      { name: 'mapCityId', description: '부모가 지도에 전달하는 현재 지도 지역 ID입니다.' },
      { name: 'selectedSearchLocationId', description: '주소 검색 결과 중 지도를 미리 볼 지역 ID입니다.' },
      { name: 'selectedMapLocation', description: '현재 지도에 표시할 지역의 이름, 위도, 경도 객체입니다.' },
      { name: 'getGoogleMapsEmbedUrl', description: 'Google Maps iframe에 넣을 임베드 주소를 생성하는 함수입니다.' },
    ],
    directories: [
      'src/components/exercise/LocationSearchPanel.vue, 검색 결과와 기존 지역 지도 통합',
      'src/services/weatherApi.js, Google Maps 임베드 URL 생성',
      'src/views/WeatherDetailView.vue, 상세 화면 지도',
    ],
    diagram: `주소 검색 결과 또는 기존 지역 탭
      │ 지역 좌표
      ▼
LocationSearchPanel
      │
      ▼
Google Maps iframe`,
    definitions: [
      { term: '임베드', description: '외부 페이지를 현재 화면 안에 iframe으로 표시하는 방식입니다.' },
      { term: 'iframe', description: '다른 웹 주소의 콘텐츠를 현재 문서 안에 넣는 HTML 요소입니다.' },
      { term: '좌표', description: '위도와 경도로 지구상의 위치를 나타내는 값입니다.' },
    ],
  },
  {
    order: 11,
    id: 'comparison-selection',
    title: '카테고리별 날씨 비교 통합',
    summary: '지역별 날씨 현황과 비교 그래프를 한 박스에 배치하고, 기온·습도·풍속을 선택해 비교합니다.',
    variables: [
      { name: 'filteredWeatherList', description: '검색 결과에 맞춰 비교 대상이 되는 날씨 배열입니다.' },
      { name: 'metric', description: '기온, 습도, 풍속 중 현재 그래프 항목입니다.' },
      { name: 'chartRows', description: '선택한 카테고리의 값과 막대 비율을 계산한 배열입니다.' },
      { name: 'metricUnit', description: '℃, ℉, %, m/s 중 현재 단위 표시입니다.' },
    ],
    directories: [
      'src/components/exercise/WeatherParent.vue, 현황과 비교 영역 배치',
      'src/components/exercise/WeatherComparisonChart.vue, 카테고리별 그래프',
      'src/components/exercise/WeatherCard.vue, 지역별 날씨 카드',
    ],
    diagram: `filteredWeatherList
      │
      ├── 좌측 WeatherCard 목록
      │
      └── 우측 WeatherComparisonChart
              │ metric 선택
              ▼
       기온 / 습도 / 풍속 막대그래프`,
    definitions: [
      { term: '카테고리', description: '날씨 데이터를 구분해 보는 기준인 기온, 습도, 풍속입니다.' },
      { term: 'metric', description: '그래프에서 현재 선택한 측정 항목입니다.' },
      { term: '막대그래프', description: '도시별 수치를 막대 길이로 표현해 값의 차이를 보여주는 그래프입니다.' },
    ],
  },
  {
    order: 12,
    id: 'forecast',
    title: '5일 날씨 예보 (OpenWeather Forecast API)',
    summary: '선택된 날씨 지역의 3시간 예보를 날짜별로 묶어 5일간의 최고·최저 기온과 습도를 표시합니다.',
    variables: [
      { name: 'forecastList', description: '날짜별로 정리된 5일 예보 배열입니다.' },
      { name: 'forecastCity', description: '예보를 조회할 현재 날씨 지역입니다.' },
      { name: 'forecastRequestId', description: '빠르게 지역을 바꿀 때 오래된 응답을 무시하기 위한 요청 번호입니다.' },
      { name: 'tempMin, tempMax, humidity', description: '날짜별 최저·최고 기온과 평균 습도입니다.' },
    ],
    directories: [
      'src/services/weatherApi.js, 3시간 예보 요청과 날짜별 변환',
      'src/components/exercise/WeatherParent.vue, 예보 대상과 로딩·오류 상태',
      'src/components/exercise/WeatherForecastPanel.vue, 5일 예보 카드 화면',
    ],
    diagram: `selectedCityInfo
      │
      ▼
fetchFiveDayForecast()
      │ 3시간 단위 응답
      ▼
날짜별 그룹화 ──> 최고·최저 기온 / 평균 습도
      │
      ▼
WeatherForecastPanel`,
    definitions: [
      { term: 'Forecast API', description: '현재 날씨가 아니라 미래 시간대의 날씨를 제공하는 API입니다.' },
      { term: '그룹화', description: '3시간 단위 데이터를 같은 날짜끼리 묶는 작업입니다.' },
      { term: '요청 번호', description: '새 요청보다 늦게 도착한 이전 응답을 화면에 반영하지 않도록 확인하는 값입니다.' },
    ],
  },
]

const expandedCardId = ref(null)

const toggleCard = (cardId) => {
  expandedCardId.value =
    expandedCardId.value === cardId ? null : cardId
}
</script>

<template>
  <section class="project-page">
    <div class="page-heading">
      <p class="eyebrow">PROJECT TIMELINE</p>
      <h1>프로젝트 타임라인</h1>
      <p>개발 순서에 따라 사용한 기술과 파일 구조를 확인할 수 있습니다.</p>
    </div>

    <div class="project-grid">
      <article
        class="project-card structure-card"
        :class="{ expanded: expandedCardId === projectStructureCard.id }"
      >
        <button
          type="button"
          class="project-card-header"
          :aria-expanded="expandedCardId === projectStructureCard.id"
          @click="toggleCard(projectStructureCard.id)"
        >
          <span>프로젝트 구조</span>
          <span class="toggle-icon">
            {{ expandedCardId === projectStructureCard.id ? '−' : '+' }}
          </span>
        </button>

        <div
          v-show="expandedCardId === projectStructureCard.id"
          class="project-card-content"
        >
          <p class="card-summary">{{ projectStructureCard.summary }}</p>

          <div class="info-grid">
            <div class="info-section">
              <h3>핵심 파일</h3>
              <ul class="info-list">
                <li
                  v-for="item in projectStructureCard.variables"
                  :key="item.name"
                >
                  <code>{{ item.name }}</code>
                  <span>{{ item.description }}</span>
                </li>
              </ul>
            </div>

            <div class="info-section">
              <h3>주요 디렉토리</h3>
              <ul class="info-list">
                <li
                  v-for="directory in projectStructureCard.directories"
                  :key="directory"
                >
                  {{ directory }}
                </li>
              </ul>
            </div>

            <div class="info-section info-section-wide">
              <h3>홈 화면 Top-down 흐름</h3>
              <p class="info-description">
                앱의 시작점에서 부모 상태와 자식 컴포넌트, 주요 v-directive가 어떻게 연결되는지 보여줍니다.
              </p>
              <pre>{{ projectStructureCard.homeFlowDiagram }}</pre>
            </div>
          </div>

          <div class="diagram-section">
            <h3>디렉토리 다이어그램</h3>
            <pre>{{ projectStructureCard.diagram }}</pre>
          </div>

          <div class="definition-section">
            <h3>용어 정의</h3>
            <dl class="definition-list">
              <template
                v-for="definition in projectStructureCard.definitions"
                :key="definition.term"
              >
                <dt>{{ definition.term }}</dt>
                <dd>{{ definition.description }}</dd>
              </template>
            </dl>
          </div>
        </div>
      </article>

      <article
        v-for="card in projectCards"
        :key="card.id"
        class="project-card"
        :class="{ expanded: expandedCardId === card.id }"
      >
        <button
          type="button"
          class="project-card-header"
          :aria-expanded="expandedCardId === card.id"
          @click="toggleCard(card.id)"
        >
          <span># {{ card.order }}. {{ card.title }}</span>
          <span class="toggle-icon">
            {{ expandedCardId === card.id ? '−' : '+' }}
          </span>
        </button>

        <div
          v-show="expandedCardId === card.id"
          class="project-card-content"
        >
          <p class="card-summary">{{ card.summary }}</p>

          <div class="info-grid">
            <div class="info-section">
              <h3>사용된 변수명</h3>
              <ul class="info-list">
                <li
                  v-for="variable in card.variables"
                  :key="variable.name"
                >
                  <code>{{ variable.name }}</code>
                  <span>{{ variable.description }}</span>
                </li>
              </ul>
            </div>

            <div class="info-section">
              <h3>관련 디렉토리</h3>
              <ul class="info-list">
                <li
                  v-for="directory in card.directories"
                  :key="directory"
                >
                  {{ directory }}
                </li>
              </ul>
            </div>
          </div>

          <div class="diagram-section">
            <h3>구조 다이어그램</h3>
            <pre>{{ card.diagram }}</pre>
          </div>

          <div class="definition-section">
            <h3>용어 정의</h3>
            <dl class="definition-list">
              <template
                v-for="definition in card.definitions"
                :key="definition.term"
              >
                <dt>{{ definition.term }}</dt>
                <dd>{{ definition.description }}</dd>
              </template>
            </dl>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.project-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 28px;
  border: 1px solid #dbe4f0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgb(30 64 175 / 8%);
}

.page-heading {
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 6px;
  color: #2563eb;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

h1 {
  margin: 0;
  color: #0f172a;
  font-size: 1.8rem;
}

.page-heading > p:last-child {
  margin: 10px 0 0;
  color: #64748b;
}

.project-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.project-card {
  overflow: hidden;
  border: 1px solid #dbe4f0;
  border-radius: 12px;
  background: #f8fbff;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.structure-card {
  border-color: #93c5fd;
  background: #f0f7ff;
}

.project-card.expanded {
  border-color: #60a5fa;
  box-shadow: 0 8px 18px rgb(37 99 235 / 12%);
}

.project-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 20px;
  border: 0;
  background: transparent;
  color: #1e3a8a;
  font-size: 1rem;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

.project-card-header:hover {
  background: #eff6ff;
}

.toggle-icon {
  color: #2563eb;
  font-size: 1.4rem;
  line-height: 1;
}

.project-card-content {
  padding: 22px;
  border-top: 1px solid #dbeafe;
  background: #ffffff;
}

.card-summary {
  margin: 0 0 20px;
  color: #334155;
  line-height: 1.6;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.info-section h3,
.diagram-section h3,
.definition-section h3 {
  margin: 0 0 10px;
  color: #1e3a8a;
  font-size: 0.98rem;
}

.info-section-wide {
  grid-column: 1 / -1;
}

.info-description {
  margin: 0 0 10px;
  color: #64748b;
  line-height: 1.5;
}

.info-list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding-left: 18px;
  color: #475569;
  line-height: 1.5;
}

.info-list li {
  padding-left: 2px;
}

.info-list code {
  display: inline-block;
  margin-right: 6px;
  padding: 2px 6px;
  border-radius: 5px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.9em;
}

.diagram-section,
.definition-section {
  margin-top: 22px;
}

pre {
  overflow-x: auto;
  margin: 0;
  padding: 16px;
  border: 1px solid #dbeafe;
  border-radius: 10px;
  background: #0f172a;
  color: #bfdbfe;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-size: 0.85rem;
  line-height: 1.6;
  white-space: pre;
}

.definition-list {
  display: grid;
  grid-template-columns: minmax(100px, 150px) 1fr;
  gap: 8px 14px;
  margin: 0;
  color: #475569;
  line-height: 1.5;
}

.definition-list dt {
  color: #1d4ed8;
  font-weight: 700;
}

.definition-list dd {
  margin: 0;
}

@media (max-width: 760px) {
  .project-page {
    padding: 20px;
  }

  .project-card-content {
    padding: 18px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .definition-list {
    grid-template-columns: 1fr;
    gap: 2px;
  }

  .definition-list dd {
    margin-bottom: 8px;
  }
}

.project-page {
  border-color: var(--glass-border);
  background: var(--glass-surface);
  box-shadow: var(--glass-shadow);
  backdrop-filter: var(--glass-blur);
}

.project-card {
  border-color: rgb(255 255 255 / 72%);
  background: rgb(255 255 255 / 46%);
  box-shadow: 0 10px 24px rgb(30 64 175 / 7%);
  backdrop-filter: blur(12px);
}

.structure-card {
  border-color: rgb(147 197 253 / 62%);
  background: rgb(239 246 255 / 52%);
}

.project-card.expanded {
  border-color: rgb(96 165 250 / 78%);
  box-shadow: 0 16px 32px rgb(37 99 235 / 14%);
}

.project-card-content {
  background: rgb(255 255 255 / 42%);
  backdrop-filter: blur(10px);
}

pre {
  border-color: rgb(147 197 253 / 28%);
  background: rgb(15 23 42 / 88%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 10%);
}

.project-page {
  border-radius: 26px;
  background: var(--glass-surface);
}

.project-card {
  border-radius: 18px;
  background: var(--glass-surface);
}

.structure-card {
  background: rgb(224 231 255 / 62%);
}
</style>
