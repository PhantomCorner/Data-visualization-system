import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus' 
import VForm3 from 'vform3-builds' 
import 'element-plus/dist/index.css' 
import 'vform3-builds/dist/designer.style.css' 
const app=createApp(App)
app.use(ElementPlus)
app.use(VForm3)
app.mount('#app')

