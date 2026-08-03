<script setup>
defineProps({
  directives: {
    type: Array,
    default: () => [],
  },
  components: {
    type: Array,
    default: () => [],
  },
  diagram: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <details class="panel-info">
    <summary>
      <span class="info-icon" aria-hidden="true">i</span>
      이 패널의 구현 정보 보기
    </summary>

    <div class="panel-info-content">
      <section class="info-group">
        <h3>사용한 v-directive</h3>
        <ul v-if="directives.length > 0" class="info-list">
          <li v-for="directive in directives" :key="directive.name">
            <code>{{ directive.name }}</code>
            <span>{{ directive.description }}</span>
          </li>
        </ul>
        <p v-else class="empty-info">표시할 directive가 없습니다.</p>
      </section>

      <section class="info-group">
        <h3>사용한 component</h3>
        <ul v-if="components.length > 0" class="info-list component-list">
          <li v-for="component in components" :key="component.name">
            <strong>{{ component.name }}</strong>
            <span>{{ component.description }}</span>
          </li>
        </ul>
        <p v-else class="empty-info">표시할 component가 없습니다.</p>
      </section>

      <section
        v-if="diagram"
        class="info-group diagram-group"
      >
        <h3>홈 화면 Top-down 흐름</h3>
        <pre>{{ diagram }}</pre>
      </section>
    </div>
  </details>
</template>

<style scoped>
.panel-info {
  margin-top: 18px;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  background: #f8fbff;
}

.panel-info summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  color: #1d4ed8;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  list-style: none;
}

.panel-info summary::-webkit-details-marker {
  display: none;
}

.panel-info summary::after {
  margin-left: auto;
  content: '⌄';
  color: #64748b;
  font-size: 1rem;
  transition: transform 0.2s ease;
}

.panel-info[open] summary::after {
  transform: rotate(180deg);
}

.panel-info summary:focus-visible {
  outline: 3px solid rgb(37 99 235 / 20%);
  outline-offset: -3px;
}

.info-icon {
  display: inline-grid;
  width: 20px;
  height: 20px;
  place-items: center;
  border: 1px solid #93c5fd;
  border-radius: 50%;
  background: #eff6ff;
  color: #2563eb;
  font-size: 0.75rem;
  font-weight: 800;
}

.panel-info-content {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  padding: 0 14px 16px;
}

.info-group {
  min-width: 0;
}

.info-group h3 {
  margin: 0 0 10px;
  color: #334155;
  font-size: 0.85rem;
}

.info-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.info-list li {
  display: grid;
  gap: 5px;
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.4;
}

.info-list code,
.info-list strong {
  width: fit-content;
  color: #1e40af;
  font-size: 0.8rem;
}

.info-list code {
  padding: 2px 6px;
  border-radius: 5px;
  background: #dbeafe;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.component-list strong {
  color: #166534;
}

.empty-info {
  margin: 0;
  color: #94a3b8;
  font-size: 0.82rem;
}

.diagram-group {
  grid-column: 1 / -1;
}

pre {
  overflow-x: auto;
  margin: 0;
  padding: 12px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #0f172a;
  color: #bfdbfe;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.75rem;
  line-height: 1.55;
  white-space: pre;
}

@media (max-width: 640px) {
  .panel-info-content {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
