import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false

import '@fortawesome/fontawesome-free/css/all.min.css'

import Buefy from 'buefy'
import 'buefy/dist/buefy.css'

Vue.use(Buefy, { defaultIconPack: 'fas' })

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app')
