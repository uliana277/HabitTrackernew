import { createApp } from 'vue'
import App from './App.vue'
import Home from './Home.vue'
import './assets/main.css'

import { createMemoryHistory, createRouter } from 'vue-router'
import Calendar from './Calendar.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/calendar', component: Calendar },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

createApp(App).use(router).mount('#app')
