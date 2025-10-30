<template>
  <main class="flex-1 p-8">
    <h2 class="text-[40px] text-[#249CFF] font-semibold text-left mb-6">Calendar</h2>
    <div ref="calendarEl" class="calendar"></div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'

const calendarEl = ref(null)

onMounted(() => {
  const calendar = new Calendar(calendarEl.value, {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
  })
  calendar.render()
})
</script>
<style>
.calendar {
  max-width: 900px;
  margin: 0 auto;
  color: #249cff;
}

.button {
  background-color: #249cff;
  color: white;
  border: none;
}
</style>
