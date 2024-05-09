import { createApp } from 'vue'
import App from './App.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import { createPinia } from 'pinia'
import 'element-plus/dist/index.css';
import './styles/main.css'
import './styles/icon.css'
import 'echarts'
import ECharts from 'vue-echarts'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const app = createApp(App);

// pinia持久化操作
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia)
app.use(router)

// 注册plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 注册vue-echarts
app.component('v-chart', ECharts)
app.mount('#app')

export default app;
