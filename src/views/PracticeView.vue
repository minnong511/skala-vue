<script setup>
const practiceGroups = [
  {
    title: '기초 문법',
    description: 'Vue 템플릿 문법과 이벤트, 조건부 렌더링, 폼 바인딩 실습',
    items: [
    ],
  },
  {
    title: '컴포넌트',
    description: 'Props, Emits, Slot과 컴포넌트 생명주기 실습',
    items: [
    ],
  },
  {
    title: 'Composition API',
    description: '반응형 상태, computed, watch, watchEffect 활용 실습',
    items: [

    ],
  },
  {
    title: '라이브러리 활용',
    description: 'Pinia, Axios, Element Plus와 JavaScript 기능 실습',
    items: [
    ],
  },
]
</script>

<template>
  <section class="practice-page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">VUE PRACTICE ARCHIVE</p>
        <h1>실습 과제</h1>
      </div>
      <p class="description">
        지금까지 학습하고 구현한 Vue 실습 목록입니다.
      </p>
    </div>

    <div class="practice-grid">
      <article
        v-for="group in practiceGroups"
        :key="group.title"
        class="practice-card"
      >
        <h2>{{ group.title }}</h2>
        <p>{{ group.description }}</p>
        <ul>
          <li
            v-for="item in group.items"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>

<style scoped>
.practice-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 28px;
  border: 1px solid #dbe4f0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgb(30 64 175 / 8%);
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
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

.description {
  margin: 0;
  color: #64748b;
  text-align: right;
}

.practice-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.practice-card {
  padding: 20px;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  background: #f8fbff;
}

h2 {
  margin: 0;
  color: #1e3a8a;
  font-size: 1.25rem;
}

.practice-card p {
  min-height: 48px;
  margin: 10px 0 14px;
  color: #475569;
  line-height: 1.6;
}

ul {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

li {
  padding: 5px 9px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1e40af;
  font-size: 0.85rem;
  font-weight: 600;
}

@media (max-width: 700px) {
  .practice-page {
    padding: 20px;
  }

  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .description {
    text-align: left;
  }

  .practice-grid {
    grid-template-columns: 1fr;
  }
}
</style>
