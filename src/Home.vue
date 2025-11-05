<script setup>
import { ref, onMounted } from 'vue'
import Datepicker from './Datepicker.vue'
import jsPDF from 'jspdf'
import Input from './Input.vue'
import { initFlowbite } from 'flowbite'

const name = ref('')
const description = ref('')
const habits = ref([])
const datepicker = ref(null)
const pdfExport = ref(null)
const showForm = ref(true)

const addHabit = (e) => {
  e.preventDefault()
  if (!name.value.trim()) return

  const startDate = datepicker.value.getStartDate()
  const endDate = datepicker.value.getEndDate()

  habits.value.push({
    name: name.value,
    date: `${startDate} to ${endDate}`,
    description: description.value,
    isEditing: false,
    completed: false,
    uncompleted: false,
    progress: 0,
    tempName: name.value,
    tempStartDate: startDate,
    tempEndDate: endDate,
    tempDescription: description.value,
  })

  name.value = ''
  description.value = ''
  datepicker.value.reset()
  showForm.value = false
}

const deleteHabit = (index) => habits.value.splice(index, 1)

const toggleEdit = (index) => {
  const habit = habits.value[index]
  if (!habit.isEditing) {
    habit.tempName = habit.name
    const [start, end] = habit.date.split(' to ')
    habit.tempStartDate = start
    habit.tempEndDate = end
    habit.tempDescription = habit.description
  }
  habit.isEditing = !habit.isEditing
}

const saveHabit = (index) => {
  const habit = habits.value[index]
  habit.name = habit.tempName
  habit.date = `${habit.tempStartDate} to ${habit.tempEndDate}`
  habit.description = habit.tempDescription
  habit.isEditing = false
}

const completeHabit = (index) => {
  const habit = habits.value[index]
  if (!habit.completed && habit.progress < 100) {
    habit.progress += 50
    if (habit.progress >= 100) {
      habit.progress = 100
      habit.completed = true
    }
  } else {
    habit.progress = 0
    habit.completed = false
  }
  habit.uncompleted = false
}

const uncompleteHabit = (index) => {
  const habit = habits.value[index]
  habit.uncompleted = !habit.uncompleted
  habit.completed = false
  habit.progress = 0
}

const pdfHabit = () => {
  if (!pdfExport.value) return
  const newElement = pdfExport.value.cloneNode(true)
  const list = newElement.querySelectorAll('.options')
  list.forEach((el) => el.remove())
  newElement.style.width = '600px'

  const doc = new jsPDF({ orientation: 'p', format: 'a4', hotfixes: ['px_scaling'], x: 4 })
  doc.setFillColor(210, 227, 252)
  doc.setTextColor(210, 227, 252)
  doc.html(newElement, {
    x: 45,
    y: 30,
    html2canvas: { scale: 1.5 },
    callback: (doc) => doc.save('habit-tracker.pdf'),
  })
}

const datetxtRef = ref(null)
const datesRef = ref(null)
const prevBtnRef = ref(null)
const nextBtnRef = ref(null)
const monthYearRef = ref(null)

onMounted(() => {
  initFlowbite()

  const dmObj = {
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    months: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
  }

  let dateObj = new Date()
  let month = dateObj.getMonth()
  let year = dateObj.getFullYear()
  const date = dateObj.getDate()
  const dayName = dmObj.days[dateObj.getDay()]

  if (datetxtRef.value) {
    datetxtRef.value.innerHTML = `${dayName}, ${dmObj.months[month]} ${date}, ${year}`
  }

  const fillCalendar = () => {
    if (!datesRef.value || !monthYearRef.value) return

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()

    datesRef.value.innerHTML = ''

    for (let i = 0; i < firstDay; i++) {
      const li = document.createElement('li')
      li.textContent = ''
      datesRef.value.appendChild(li)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const li = document.createElement('li')
      li.textContent = i
      li.addEventListener('click', () => {
        li.classList.toggle('selected-day')
      })
      datesRef.value.appendChild(li)
    }

    monthYearRef.value.textContent = `${dmObj.months[month]}, ${year}`
  }

  fillCalendar()

  if (prevBtnRef.value) {
    prevBtnRef.value.addEventListener('click', () => {
      month--
      if (month < 0) {
        month = 11
        year--
      }
      fillCalendar()
    })
  }

  if (nextBtnRef.value) {
    nextBtnRef.value.addEventListener('click', () => {
      month++
      if (month > 11) {
        month = 0
        year++
      }
      fillCalendar()
    })
  }
})
</script>

<template>
  <main class="flex-1 p-8">
    <h2 class="text-[40px] text-[#249CFF] font-semibold mb-6">Your Habits</h2>

    <form v-if="showForm" @submit.prevent="addHabit" class="max-w-sm mx-auto">
      <Input v-model="name" label="Name for a habit" placeholder="workout more" />
      <Datepicker ref="datepicker" />
      <Input
        v-model="description"
        label="Description for a habit"
        placeholder="2 sets of pushups 2x a day"
      />
      <button class="text-white bg-[#90CAFA] px-5 py-2.5 rounded-lg w-full hover:bg-blue-400">
        Add
      </button>
    </form>

    <button
      v-else
      @click="showForm = true"
      class="mb-8 px-4 py-2 border border-[#249CFF] text-[#249CFF] rounded-full hover:bg-[#EAF6FF]"
    >
      +
    </button>

    <div v-if="habits.length === 0" class="text-center text-[#249CFF] mt-10 text-xl">
      No habits yet.
    </div>

    <div class="space-y-6" ref="pdfExport">
      <div
        v-for="(habit, index) in habits"
        :key="index"
        class="habit-card bg-[#90CAFA] rounded-2xl p-8 text-center text-white max-w-2xl mx-auto"
      >
        <div class="absolute top-4 right-4 flex space-x-3 options">
          <button @click="habit.isEditing ? saveHabit(index) : toggleEdit(index)">
            {{ habit.isEditing ? '💾' : '✏️' }}
          </button>
          <button @click="deleteHabit(index)">🗑️</button>
        </div>

        <div v-if="habit.isEditing">
          <input
            v-model="habit.tempName"
            class="bg-white text-[#249CFF] px-4 py-2 rounded-md w-[220px]"
          />
        </div>
        <div v-else class="text-[32px] font-bold mb-6">{{ habit.name }}</div>

        <div class="flex flex-col sm:flex-row justify-center items-center gap-10 mb-8">
          <div class="text-center">
            <p class="font-semibold mb-2">Due date</p>
            <div v-if="habit.isEditing" class="flex items-center gap-2 justify-center">
              <input
                v-model="habit.tempStartDate"
                type="date"
                class="bg-white text-[#249CFF] px-3 py-1 rounded-md"
              />
              <span class="text-white font-semibold">to</span>
              <input
                v-model="habit.tempEndDate"
                type="date"
                class="bg-white text-[#249CFF] px-3 py-1 rounded-md"
              />
            </div>
            <div v-else class="text-[18px] font-semibold">{{ habit.date }}</div>
          </div>

          <div class="text-center">
            <p class="font-semibold mb-2">Description</p>
            <div v-if="habit.isEditing">
              <input
                v-model="habit.tempDescription"
                class="bg-white text-[#249CFF] px-4 py-2 rounded-md w-[220px]"
              />
            </div>
            <div v-else class="text-[18px] font-semibold">{{ habit.description }}</div>
          </div>
        </div>

        <div class="text-center mb-6">
          <p class="font-semibold mb-2">Progress</p>
          <div class="w-3/4 mx-auto bg-white/40 rounded-full h-3 mb-1 overflow-hidden">
            <div
              class="bg-white h-3 rounded-full transition-all duration-500"
              :style="{ width: habit.progress + '%' }"
            ></div>
          </div>
          <p class="text-sm">{{ habit.progress }}%</p>
        </div>

        <div class="flex justify-center gap-4 mt-4">
          <button
            @click="completeHabit(index)"
            class="bg-[#7CD197] hover:bg-[#69b881] text-white px-6 py-2 rounded-lg"
          >
            Completed
          </button>
          <button
            @click="uncompleteHabit(index)"
            class="bg-[#E47E7E] hover:bg-[#d46e6e] text-white px-6 py-2 rounded-lg"
          >
            Uncompleted
          </button>
        </div>
      </div>
    </div>

    <h2 class="text-[40px] text-[#249CFF] font-semibold mb-6 mt-10">Calendar</h2>
    <div class="calendar">
      <div class="calendar_inner">
        <div class="calendar_controls">
          <div class="calendar_headings">
            <i class="fa-solid fa-arrow-left" ref="prevBtnRef"></i>
            <h2 class="month_year" ref="monthYearRef"></h2>
            <i class="fa-solid fa-arrow-right" ref="nextBtnRef"></i>
          </div>
          <div class="current_datetime">
            <p class="daytxt">Today</p>
            <p class="datetxt" ref="datetxtRef"></p>
          </div>
          <div class="days_date">
            <ul class="days">
              <li>Sun</li>
              <li>Mon</li>
              <li>Tue</li>
              <li>Wed</li>
              <li>Thu</li>
              <li>Fri</li>
              <li>Sat</li>
            </ul>
            <ul class="dates" ref="datesRef"></ul>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-center mt-10">
      <button
        @click="pdfHabit"
        class="border border-[#249CFF] text-[#249CFF] px-6 py-2 rounded hover:bg-[#EAF6FF]"
      >
        Import to PDF
      </button>
    </div>
  </main>
</template>

<style>
.calendar {
  max-width: 450px;
  margin: 0 auto;
  color: #249cff;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.4);
  font-family: 'Poppins', sans-serif;
}

.calendar_inner {
  padding: 20px;
}

.calendar_headings {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.calendar_headings h2 {
  font-size: 1.5rem;
  color: #249cff;
}

.fa-solid.fa-arrow-left,
.fa-solid.fa-arrow-right {
  cursor: pointer;
  font-size: 1.2rem;
  color: #fff;
  transition: color 0.2s;
}

.fa-solid.fa-arrow-left:hover,
.fa-solid.fa-arrow-right:hover {
  color: #249cff;
}

.current_datetime {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #a8ceee86;
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.current_datetime .daytxt {
  background-color: #249cff;
  color: #fff;
  border-radius: 5px;
  padding: 5px 10px;
  font-weight: 600;
}

.current_datetime .datetxt {
  color: #249cff;
  font-weight: 500;
}

.days_date .days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  margin-bottom: 5px;
}

.days_date .days li {
  list-style: none;
  text-align: center;
  font-weight: 600;
  color: #249cff;
  border-bottom: 2px solid #249cffbd;
  padding: 5px 0;
}

.dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.dates li {
  list-style: none;
  padding: 10px 0;
  text-align: center;
  cursor: pointer;
  border-radius: 6px;
  color: #249cff;
  transition: all 0.2s;
  user-select: none;
}

.dates li:hover {
  background-color: #b3b3b3;
  color: #262829;
}

.dates li:active {
  background-color: #03a9f4;
  color: #fff;
}

.selected-day {
  background-color: #8be28b !important;
  color: #ffffff !important;
}

@media (max-width: 500px) {
  .calendar {
    max-width: 100%;
  }
  .calendar_inner {
    padding: 15px;
  }
  .days_date .days li,
  .dates li {
    padding: 8px 0;
  }
}
</style>
