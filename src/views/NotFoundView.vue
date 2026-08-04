<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push({ name: 'WeatherHome' })
}
</script>

<template>
  <!-- 전체 화면을 중앙 정렬하기 위한 래퍼 -->
  <div class="not-found-container">
    <div class="not-found-content">
      <img
        class="not-found-photo"
        src="/not-found-person.jpg"
        alt="404 페이지 안내 이미지"
      />
      <small class="mascot-caption">2조의 마스코트 Kim ki hyun (제작자 아닙니다)</small>

      <!-- 시각적 포인트를 위한 아이콘 또는 큰 텍스트 (옵션) -->
      <div class="error-icon">☀️❓</div>

      <h2>페이지를 찾을 수 없습니다.</h2>
      <p>요청하신 주소가 존재하지 않거나,<br />아직 개발되지 않았습니다.</p>

      <!-- 포인트 컬러가 적용된 버튼 -->
      <button class="home-button" @click="goHome">날씨 메인으로 이동</button>
    </div>
  </div>
</template>

<!-- Scoped CSS로 이 컴포넌트에만 스타일 적용 -->
<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  /* 부모 요소(예: App.vue)에서 남은 높이를 다 쓰도록 설정 */
  min-height: 80vh;
  background-color: #f8f9fa; /* 아주 연한 회색 배경 */
  font-family: 'Noto Sans KR', sans-serif; /* 기본 폰트 설정 (옵션) */
  animation: not-found-screen-shake 0.85s ease-in-out 0.75s 2;
  will-change: transform;
}

.not-found-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: #ffffff;
  padding: 50px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 은은한 그림자 */
  border: 1px solid #e9ecef;
}

.not-found-photo {
  display: block;
  width: min(100%, 360px);
  max-height: 420px;
  margin-bottom: 20px;
  object-fit: contain;
  filter:
    drop-shadow(0 0 10px rgb(10 132 255 / 42%))
    drop-shadow(0 0 24px rgb(94 92 230 / 30%));
  animation:
    not-found-photo-load 1.15s cubic-bezier(0.22, 1, 0.36, 1) both,
    not-found-photo-glow 2.8s ease-in-out 1.15s infinite alternate;
  will-change: transform, opacity, filter;
}

.mascot-caption {
  display: block;
  margin: -8px 0 18px;
  color: #8e8e93;
  font-size: 0.75rem;
  letter-spacing: 0.02em;
}

.error-icon {
  font-size: 5rem; /* 아주 크게 */
  margin-bottom: 20px;
  animation: error-icon-float 2.4s ease-in-out 1.1s infinite alternate;
}

@keyframes not-found-photo-load {
  0% {
    opacity: 0;
    transform: translateY(28px) scale(0.72) rotate(-360deg);
    filter:
      blur(12px)
      drop-shadow(0 0 0 rgb(10 132 255 / 0%));
  }

  65% {
    opacity: 1;
    transform: translateY(-6px) scale(1.03) rotate(420deg);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(720deg);
  }
}

@keyframes not-found-screen-shake {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }

  15% {
    transform: translate(-7px, 3px) rotate(-0.5deg);
  }

  30% {
    transform: translate(8px, -4px) rotate(0.6deg);
  }

  45% {
    transform: translate(-6px, -3px) rotate(-0.4deg);
  }

  60% {
    transform: translate(6px, 4px) rotate(0.4deg);
  }

  75% {
    transform: translate(-3px, 2px) rotate(-0.2deg);
  }
}

@keyframes not-found-photo-glow {
  from {
    filter:
      drop-shadow(0 0 10px rgb(10 132 255 / 42%))
      drop-shadow(0 0 24px rgb(94 92 230 / 30%));
  }

  to {
    filter:
      drop-shadow(0 0 18px rgb(10 132 255 / 68%))
      drop-shadow(0 0 36px rgb(255 204 0 / 42%));
  }
}

@keyframes error-icon-float {
  from {
    transform: translateY(0) rotate(-4deg);
  }

  to {
    transform: translateY(-8px) rotate(4deg);
  }
}

h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #343a40; /* 짙은 회색 */
  margin-bottom: 15px;
  letter-spacing: -0.5px;
}

p {
  font-size: 1.1rem;
  color: #6c757d; /* 중간 회색 */
  line-height: 1.6;
  margin-bottom: 35px;
}

.home-button {
  background-color: #007bff; /* 날씨 앱 포인트 컬러 (파란색) */
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 1.1rem;
  font-weight: 500;
  border-radius: 30px; /* 둥근 버튼 */
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
}

/* Hover 및 Active 효과 */
.home-button:hover {
  background-color: #0056b3; /* 조금 짙은 파란색 */
}

.home-button:active {
  transform: scale(0.98); /* 클릭 시 살짝 눌리는 효과 */
}

/* 404 화면은 카드뿐 아니라 바깥 배경과 본문도 함께 다크 모드로 전환합니다. */
:global(#app .app-shell.theme-dark) .not-found-container {
  background-color: #1c1c1e;
  color: #f5f5f7;
}

:global(#app .app-shell.theme-dark) .not-found-content {
  border-color: #48484a;
  background-color: #2c2c2e;
  box-shadow: 0 20px 55px rgb(0 0 0 / 34%);
}

:global(#app .app-shell.theme-dark) .mascot-caption {
  color: #aeaeb2;
}

:global(#app .app-shell.theme-dark) h2 {
  color: #f5f5f7;
}

:global(#app .app-shell.theme-dark) p {
  color: #d1d1d6;
}

:global(#app .app-shell.theme-dark) .home-button {
  background-color: #0a84ff;
  color: #ffffff;
}

:global(#app .app-shell.theme-dark) .home-button:hover {
  background-color: #409cff;
}

@media (prefers-reduced-motion: reduce) {
  .not-found-photo,
  .error-icon,
  .not-found-container {
    animation: none;
  }
}
</style>
