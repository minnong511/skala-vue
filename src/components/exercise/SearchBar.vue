<script setup>
import { createDebugLogger } from '@/utils/debugLogger'

const props = defineProps({
  currentQuery: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update-query'])
const logger = createDebugLogger('SearchBar')

const handleInput = (value) => {
  const query = typeof value === 'string' ? value : value.target.value

  logger.input('도시 검색어 변경', {
    query,
    queryLength: query.trim().length,
  })
  emit('update-query', query)
}
</script>

<template>
  <div class="search-inner">
    <label for="city-search">🔍 도시 검색</label>
    <el-input
      id="city-search"
      type="search"
      :model-value="props.currentQuery"
      placeholder="검색할 도시 이름 입력"
      @input="handleInput"
    >
      <template #prefix>🔍</template>
    </el-input>
    <p>
      검색 중인 도시:
      <strong>{{ props.currentQuery || '전체 도시' }}</strong>
    </p>
  </div>
</template>

<style scoped>
.search-inner {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

label {
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 700;
}

input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid rgb(148 163 184 / 38%);
  border-radius: 10px;
  color: #1f2937;
  background: rgb(255 255 255 / 68%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 80%);
  font-size: 1rem;
}

.search-inner {
  padding: 4px;
}

input {
  border-radius: 14px;
  background: rgb(255 255 255 / 68%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 90%),
    0 10px 22px rgb(30 64 175 / 7%);
  font-family: inherit;
}

input:focus {
  border-color: #2563eb;
  outline: 3px solid rgb(37 99 235 / 18%);
}

p {
  margin: 0;
  color: #475569;
}

strong {
  color: #1d4ed8;
}
</style>
