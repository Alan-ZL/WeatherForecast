import { createApp } from 'vue'

import './style.css'
import App from './App.vue'
import router from './router'

import { fas } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import '../node_modules/@fortawesome/fontawesome-free';

library.add(fas);

createApp(App).use(router).component('font-awesome-icon', FontAwesomeIcon).mount('#app')
