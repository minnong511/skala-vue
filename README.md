# skala-vue : Weather Dashboard

SKALA Frontend 

실시간 날씨 정보를 확인하고, 원하는 지역을 추가해서 비교할 수 있는 Vue 날씨 대시보드입니다.

- Vue의 Composition API
- 컴포넌트 분리를 통한 최적화
중점으로 SPA를 구현하는 것을 목표로 하여 구현했습니다!

## 배포 링크

[날씨 대시보드 바로가기](https://skala-vue-theta.vercel.app/)

## 주요 기능

#### Axios - API 처리 기능
- OpenWeather API를 이용한 현재 날씨와 5일 예보 조회
- 지역별 날씨 카드와 Google Maps 임베드 지도 연동

#### V-directive
- 도시 검색과 원하는 지역 추가
- 선택한 도시의 기온, 습도 비교

#### Pinia - 전역 상태 설정
- 라이트 모드, 다크 모드 전환
- 섭씨, 화씨 단위 전환

#### route - 웹페이지 링크 기능
- 상세 날씨 페이지, 프로젝트 타임라인, 404 페이지

#### 그외
- 즐겨찾기, 날씨 새로고침, 로딩 상태, 오류 메시지 처리

## 개발 순서

### 1. Vue 프로젝트와 SPA 구조 만들기

Vue와 Vite로 프로젝트를 만들었습니다.
`App.vue`에 기본 세팅을 진행했습니다.
페이지가 새로고침되지 않고 화면만 바뀌도록 SPA 구조를 잡았습니다.
(Vue.js의 기본 기능이긴 합니다.)

### 2. 반응형 상태 관리하기

`ref`로 검색어, 선택 도시, 날씨 목록, 로딩 상태를 관리했습니다.
`computed`로 검색 결과와 비교 데이터를 만들고,
`watch`와 `watchEffect`로 상태 변화를 확인했습니다.

### 3. 컴포넌트로 화면 나누기

Vue의 설계 철학에 맞게, 반복 사용되거나, 작은 부분으로 만들 수 있다면 전부 컴포넌트로 분리했습니다.

검색창, 날씨 카드, 공통 대시보드 박스, 지도, 비교 그래프를 각각의 컴포넌트로 분리했습니다.

부모와 자식 컴포넌트는 `props`와 `emits`로 통신하고,
공통 박스는 `slot`으로 재사용했습니다.

### 4. Pinia로 전역 설정 관리하기

온도 단위와 화면 테마처럼 여러 화면에서 사용하는 상태를 전역 상태 관리 라이브러리 Pinia로 관리했습니다.

- `state`: `unit`, `theme`
- `getter`: `unitSymbol`, `isDarkMode`
- `action`: `toggleUnit`, `toggleTheme`

### 5. 날씨 API 연결하기

Axios를 사용해서 OpenWeather API에 좌표를 보내고 날씨 데이터를 받아왔습니다.
받아온 API 데이터는 화면에서 사용하기 쉽도록 날씨 객체 형태로 정리했습니다.

### 6. Vue Router로 페이지 연결하기

헤더 메뉴와 상세보기 버튼을 RouterLink, `router.push`로 연결했습니다.
상세 페이지는 동적 라우트로 도시 ID를 전달하고,
존재하지 않는 주소는 Catch-all 라우트에서 404 페이지로 처리했습니다.

### 7. 원하는 지역과 지도 기능 추가하기

주소를 검색하면 Nominatim(OpenStreetMap)에서 시, 구, 동과 위도, 경도 좌표를 받아옵니다.

선택한 지역은 날씨 목록에 추가하고 localStorage에 저장했습니다. (브라우저마다 별도의 데이터가 저장되도록 구현했습니다.)

카드를 선택하면 시, 구, 동과 위도, 경도 좌표를 기반으로 지도에 입력하여
해당 지역의 Google Maps 임베드 지도가 표시되도록 연결했습니다.

### 8. 배포

github에 올리고, Vercel에 배포했습니다.
마지막으로 API 키는 Vercel 환경변수로 분리해서 저장소에 직접 노출되지 않게 했습니다. (VITE 환경변수는 브라우저에서 사용되기 때문에 배포 후 완전한 비밀키는 아닙니다.)

[날씨 대시보드 바로가기](https://skala-vue-theta.vercel.app/)



## 기술 스택

프론트엔트 프레임워크
- Vue 3, Vite


라이브러리
- Pinia
- Axios
- Vue Router


API
- OpenWeather API
- Nominatim API
- Google Maps Embed API

호스팅
- Vercel

## 데이터 흐름

```text
사용자 입력
  ↓
SearchBar.vue
  ↓ update-query 이벤트
WeatherParent.vue의 searchQuery
  ↓
computed로 검색 결과 필터링
  ↓
WeatherCard.vue에 props로 전달
  ↓ 카드 선택
selectedCityInfo 변경
  ↓
WeatherMapPanel.vue 지도 변경
```

날씨 API 데이터의 흐름은 다음과 같습니다.

```text
WeatherParent.vue
  ↓ fetchWeatherList()
weatherApi.js
  ↓ Axios 요청
OpenWeather API
  ↓ 날씨 JSON 데이터
normalize 함수 : 제 웹페이지에 맞게 데이터를 변환하는 함수입니다.
  ↓
weatherList 반응형 상태
  ↓
WeatherCard, 비교 그래프, 상세 페이지에 표시합니다.
```

## Vercel 배포 환경변수

Vercel 프로젝트의 `Settings > Environment Variables`에 아래 변수 이름을 등록했습니다. 

API 키 값은 Vercel 화면에서 직접 입력하고 저장소에는 작성하지 않았습니다. 

(깃허브 레포에 API 키를 올리면 봇이 키를 다.. 가져가서 털릴 가능성이 있습니다.)

```text
VITE_OPENWEATHER_API_KEY = ~~ 키 값
VITE_GOOGLE_MAPS_API_KEY = ~~ 키 값
```
환경변수 설정에서 키 값을 넣었습니다

또한 `vercel.json`에서 모든 경로를 `index.html`로 연결해서,
Vercel에서 Vue Router 주소를 새로고침해도 정상적으로 페이지가 열리도록 설정했습니다.

## 앞으로 더 공부해야 할 것

1. JWT와 로그인 인증
2. Vue Router의 동적 라우트와 네비게이션 가드
3. API 키를 서버에서 관리하는 방법
4. 테스트 코드와 성능 최적화
5. DB 시스템 연동 
