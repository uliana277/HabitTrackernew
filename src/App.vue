<script setup>
import { ref } from 'vue'
import Datepicker from './Datepicker.vue'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const name = ref('')
const description = ref('')
const habits = ref([])
const datepicker = ref(null)
const pdfExport = ref(null)

const showForm = ref(true)

const addHabit = () => {
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

const pdfHabit = () => {
  if (!pdfExport.value) return

  const newElement = pdfExport.value.cloneNode(true)
  const list = newElement.querySelectorAll('.options')
  list.forEach((element) => element.remove())

  newElement.style.width = '600px'

  const doc = new jsPDF({
    orientation: 'p',
    format: 'a4',
    hotfixes: ['px_scaling'],
    x: 4,
  })

  doc.setFillColor(210, 227, 252)
  doc.setTextColor(210, 227, 252)
  doc.html(newElement, {
    x: 45,
    y: 30,
    html2canvas: { scale: 0.2 },
    callback: (doc) => {
      doc.save('habit-tracker.pdf')
    },
  })
}

const deleteHabit = (index) => {
  habits.value.splice(index, 1)
}

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
</script>

<template>
  <div class="flex h-screen">
    <aside class="w-1/4 p-6 text-[#249CFF] border-r border-gray-300">
      <h1 class="text-[40px] font-bold mb-6">Habit tracker</h1>
      <p class="text-[20px] mb-4">Discover</p>
      <nav class="space-y-4 text-[22px]">
        <p><a href="#" class="hover:underline">🏠 My Habits</a></p>
        <p><a href="#" class="hover:underline">⌕ Search</a></p>
        <p><a href="#" class="hover:underline">📊 Statistic</a></p>
      </nav>
    </aside>

    <main class="flex-1 p-8">
      <h2 class="text-[40px] text-[#249CFF] font-semibold text-left mb-6">Your Habits</h2>

      <div v-if="showForm" class="flex flex-wrap items-center gap-4 mb-8">
        <input
          v-model="name"
          class="flex-1 min-w-[180px] border border-[#249CFF] text-[16px] text-[#249cffa2] px-4 py-2 rounded-full outline-none"
          placeholder="Name for a Habit..."
        />

        <Datepicker ref="datepicker" />

        <input
          v-model="description"
          class="flex-1 min-w-[200px] border border-[#249CFF] text-[16px] text-[#249cffa2] px-4 py-2 rounded-full outline-none"
          type="text"
          placeholder="Description"
        />

        <button
          @click="addHabit"
          class="text-white text-[20px] px-6 py-2 rounded-full bg-[#249CFF] hover:bg-[#1A86E0] transition"
        >
          Add
        </button>
      </div>

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
          :class="
            habit.completed ? 'bg-green-400' : habit.uncompleted ? 'bg-red-400' : 'bg-[#90CAFA]'
          "
          class="relative rounded-xl p-8 text-center text-white shadow-md transition max-w-3xl mx-auto"
        >
          <div class="absolute top-4 right-4 flex space-x-3">
            <h1 v-if="habit.uncompleted">Uncompleted</h1>
            <h1 v-if="habit.completed">Completed</h1>

            <button
              class="hover:text-blue-200 options"
              @click="habit.isEditing ? saveHabit(index) : toggleEdit(index)"
            >
              <span v-if="habit.isEditing">💾</span>
              <span v-else>✏️</span>
            </button>
            <button class="hover:text-red-300 options" @click="deleteHabit(index)">🗑️</button>
          </div>

          <h3 class="text-[18px] mb-1">Habit Name</h3>

          <div v-if="habit.isEditing">
            <input
              v-model="habit.tempName"
              class="bg-white text-[#249CFF] px-4 py-2 rounded-md w-[220px]"
            />
          </div>
          <div v-else class="text-[28px] font-bold mb-8">
            {{ habit.name }}
          </div>

          <div class="flex flex-col sm:flex-row justify-center items-center gap-10 mb-8">
            <div class="text-center">
              <p class="font-semibold mb-2">Due date</p>

              <div v-if="habit.isEditing" class="flex items-center justify-center gap-2">
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

              <div v-else class="text-[20px] font-bold mb-8">
                {{ habit.date }}
              </div>

              <div class="add mb-1 text-base font-medium text-white">Progress</div>
              <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div
                  class="bg-[#1A86E0] h-2.5 rounded-full transition-all duration-500"
                  :style="{ width: habit.progress + '%' }"
                ></div>
              </div>
              <p class="text-sm">{{ habit.progress }}%</p>
            </div>

            <div class="text-center">
              <p class="font-semibold mb-2">Description</p>
              <div v-if="habit.isEditing">
                <input
                  v-model="habit.tempDescription"
                  class="bg-white text-[#249CFF] px-4 py-2 rounded-md w-[220px]"
                />
              </div>
              <div v-else class="text-[20px] font-bold mb-8">
                {{ habit.description }}
              </div>
            </div>
          </div>

          <button
            class="bg-[#90c28b] options text-[#ffffff] px-8 py-2 rounded-md font-semibold hover:bg-[#78a97b] transition"
            @click="completeHabit(index)"
          >
            Completed
          </button>

          <button
            class="bg-[#d46e6e] options text-[#ffffff] px-8 py-2 rounded-md font-semibold hover:bg-[#c94f4f] transition ml-2"
            @click="uncompleteHabit(index)"
          >
            Uncompleted
          </button>
        </div>
      </div>

      <div class="flex justify-center mt-10">
        <button
          class="border border-[#249CFF] text-[#249CFF] px-6 py-2 rounded-[10%] hover:bg-[#EAF6FF]"
          @click="pdfHabit"
        >
          Import to PDF
        </button>
      </div>
    </main>
  </div>
</template>
