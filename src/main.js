import { createApp } from 'vue'//引入Vue
import App from './App.vue'//引入根组件
import router from './router'//引入路由     

createApp(App)//创建应用，用App作为根
    .use(router)//装上路由
    .mount('#app')//挂载到index.html的#app上   
