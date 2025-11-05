<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="flex h-screen">
    <aside class="w-1/4 p-6 text-[#249CFF] border-r border-gray-300">
      <h1 class="text-[40px] font-bold mb-6">Habit tracker</h1>
      <p class="text-[20px] mb-4">Discover</p>
      <nav class="space-y-4 text-[22px]">
        <p><RouterLink to="/">🏠 Home</RouterLink></p>
        <p><RouterLink to="/calendar">📊 Calendar</RouterLink></p>
      </nav>
    </aside>
    <RouterView />
  </div>
</template>
