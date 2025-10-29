<template>
  <main class="flex-1 p-8">
    <h2 class="text-[40px] text-[#249CFF] font-semibold text-left mb-6">Calendar</h2>
  </main>
</template>

<script setup>
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'

const calendarEl = document.getElementById('calendar')

const calendar = new Calendar(calendarEl, {
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
})

calendar.render()
</script>
