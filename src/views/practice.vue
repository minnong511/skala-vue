<script setup>
// 걍 연습용임 
import {reactive} from 'vue'

const userReactive = reactive({name:'이순신', age:30})
const celebrateReactive = () => {userReactive.age++}

const items = reactive([
  {id:1, name:'사과', price:1000},
  {id:2, name:'바나나', price:2000},
  {id:3, name:'체리', price:3000},
])

const addItem = () => reactive(['사과','바나나'])
const removeItem = (index) => {items.splice(index, 1)}
</script>


<template>
  <div class="practice-container">
    <h2>반응형 상태 reactive() 특징 및 주의점</h2>
    <h3>1) 객체(Object) reactive</h3>
    <p> 이름 : {{userReactive.name}},나이 : {{userReactive.age}}</p>
    <button @click="celebrateReactive">축하합니다</button>
    <h3>2) 배열(Array) reactive</h3>
    <ul>
      <li v-for="(item, index) in items" :key="item.id">
        {{item.name}} : {{item.price}}
        <button @click="removeItem(index)">삭제</button>
      </li>
    </ul>
    <button @click="addItem">추가</button>
  </div>
</template>
