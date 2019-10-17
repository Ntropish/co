import Vue from 'vue'
import App from './App.vue'
import { VueHammer } from 'vue2-hammer'
import VueCompositionApi from '@vue/composition-api'
import compoundDragAndDrop from 'cytoscape-compound-drag-and-drop'
import contextMenus from 'cytoscape-context-menus'

import cytoscape from 'cytoscape'
cytoscape.use(compoundDragAndDrop)
cytoscape.use(contextMenus)

import VueCytoscape from 'vue-cytoscape'
Vue.use(VueCytoscape)
Vue.use(VueCompositionApi)
Vue.use(VueHammer)
Vue.config.productionTip = false
// const cdnd = cy.compoundDragAndDrop({})

new Vue({
  render: h => h(App),
}).$mount('#app')
