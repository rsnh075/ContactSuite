import App                from './App.vue';
import { createApp }      from 'vue';
import { store }          from './store/cmStore';
import { createPinia }    from 'pinia';
import router             from './router';
import SoftPhone          from './plugins/SoftPhone';


import '@/scss/index.scss';

const app = createApp(App)
app.use(store)
app.use(createPinia())
app.use(router)
app.use(SoftPhone)
router.isReady().then(() => app.mount('#app'))
