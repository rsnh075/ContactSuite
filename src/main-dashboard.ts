import { createApp }      from 'vue';
import { store }          from './store/cmStore';

import App                from './App-dashboard.vue';

import '@/scss/index.scss';

const app = createApp(App)
app.use(store)
app.mount('#cm-dashboard')
