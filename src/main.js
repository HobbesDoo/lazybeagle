import './assets/main.css'
// Use local vendor CSS instead of package's public path to avoid resolution issues
import './vendor/vue3-grid-layout.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
