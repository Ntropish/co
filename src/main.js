import Vue from 'vue'
import App from './App.vue'
import { VueHammer } from 'vue2-hammer'
import VueCompositionApi from '@vue/composition-api'

import VueCytoscape from 'vue-cytoscape'

import cytoscape from 'cytoscape'
import cxtmenu from 'cytoscape-cxtmenu'

import { schedules, activeSchedule } from './schedule'
import { frames, spawnFrame, $frame } from './frame.js'

// ==============================================================

const rootFrame = spawnFrame('root frame')
frames[rootFrame].children.push(spawnFrame('sum'))
frames[rootFrame].children.push(spawnFrame('log'))
frames[rootFrame].children.push(spawnFrame('child 1'))
frames[rootFrame].children.push(spawnFrame('child 2'))

$frame.root = rootFrame
$frame.active = rootFrame

cytoscape.use(cxtmenu)

const elements = activeSchedule ? schedules[activeSchedule] : []
console.log('start with eles:', elements)
const cy = cytoscape({
  container: document.getElementById('canvas'),
  elements,
  layout: {
    name: 'preset',
  },

  style: [
    {
      selector: 'node',
      style: {
        label: 'data(name)',
        shape: 'rectangle',
        width: 100,
        height: 40,
        'text-valign': 'center',
        color: 'white',
        'background-color': 'hsl(0, 0%, 20%)',
      },
    },
    {
      selector: 'node:selected',
      style: {
        'background-color': 'hsl(145, 60%, 40%)',
      },
    },
    {
      selector: 'edge',
      style: {
        width: 6,
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
      },
    },
  ],

  wheelSensitivity: 0.05,
  selectionType: 'single',
})

Vue.use(VueCytoscape)
Vue.use(VueCompositionApi)
Vue.use(VueHammer)
Vue.config.productionTip = false
Vue.use({
  install(Vue, options) {
    Vue.prototype.$cy = cy
  },
})
new Vue({
  render: h => h(App),
}).$mount('#app')

cy.cxtmenu({
  menuRadius: 100,
  selector: 'node',
  commands: [
    {
      content: 'remove',
      contentStyle: {},
      select: function(ele) {
        cy.remove('#' + ele.data().id)
      },
      enabled: true,
    },
    {
      content: 'connect',
      contentStyle: {},
      select: function(ele, event) {
        const selected = cy.$(':selected')
        selected.each(source => {
          cy.add({
            data: { type: 'edge', source: source.data().id, target: ele.data().id },
          })
        })
      },
      enabled: true,
    },
  ],
})
cy.cxtmenu({
  menuRadius: 100,
  selector: 'core',
  commands: [
    {
      content: 'add',
      contentStyle: {},
      select: function(ele, event) {
        const result = cy.add({
          data: { type: 'event', name: 'event', from: null, to: null },
          position: event.position,
        })
        const newEvent = result[0]
        const selected = cy.$(':selected')
        if (selected.length) {
          selected.each(select => {
            const edge = { type: 'edge', source: select.data().id, target: newEvent.data().id }
            cy.add({ data: edge })
          })
        }
      },
      enabled: true,
    },
  ],
})
cy.cxtmenu({
  menuRadius: 100,
  selector: 'edge',
  commands: [
    {
      content: 'remove',
      contentStyle: {},
      select: function(ele, event) {
        cy.remove('#' + ele.data().id)
      },
      enabled: true,
    },
  ],
})
