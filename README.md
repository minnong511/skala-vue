# skala-vue : Weather DashBoard 

## 주요 기능 

설계 철학 : 프론트엔드는 처음이여서 SPA을 구현해보는 것을 목표로 했음, 
그래서 최대한 요소를 분리하고, 재사용을 해야하는 것은 별도 컴포넌트로 분리했다.
그리고 Slot을 적극적으로 활용하여서 최대한 모듈화를 이뤄내기를 목표로 했음  


## 기술 스택 

1. Pinia 
state: unit, theme
getter: unitSymbol, isDarkMode
action: toggleUnit, toggleTheme

2. Axios 
async, await, try/catch, Promise.allSettled

3. router 
링크 연동 ... / catch-a;;


## 데이터 흐름 



# ------- 앞으로 더 공부해야 할 것 

1. JWT 
2. Vue Router // 동적 라우트, 지연 로딩, Catch-all 라우트 