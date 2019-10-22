import Vue from 'vue'
import App from './App.vue'
import { VueHammer } from 'vue2-hammer'

import vuetify from './plugins/vuetify'

Vue.use(VueHammer)
Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App),
}).$mount('#app')
// This loads a new schedule into cytoscape whenever the active frame changes
