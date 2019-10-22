import Vue from 'vue'
import App from './App.vue'
import { VueHammer } from 'vue2-hammer'

import vuetify from './plugins/vuetify'

import cytoscape from 'cytoscape'
import cxtmenu from 'cytoscape-cxtmenu'

export const $frame = createFrameStore()
const rootFrame = $frame.spawnFrame({ name: 'root frame' })
$frame.spawnFrame({ name: 'sum', parent: rootFrame })
$frame.spawnFrame({ name: 'log', parent: rootFrame })
$frame.spawnFrame({ name: 'child 1', parent: rootFrame })
$frame.spawnFrame({ name: 'child 2', parent: rootFrame })

const config = {
  container: undefined,
  headless: true,
  elements: [],
  layout: {
    name: 'preset',
  },

  style: [
    {
      selector: 'node',
      style: {
        'font-family': ['B612', 'sans-serif'],
        label: 'data(name)',
        shape: 'rectangle',
        width: 100,
        height: 40,
        'text-valign': 'center',
        'background-color': 'hsla(0, 0%, 0%, 0.85)',
        color: 'hsl(30, 47%, 86%)',
      },
    },
    {
      selector: 'node:selected',
      style: {
        'background-color': 'hsl(30, 47%, 86%)',
        color: 'hsla(0, 0%, 0%, 0.85)',
      },
    },
    {
      selector: 'edge',
      style: {
        width: 6,
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'line-color': 'hsla(0, 0%, 0%, 0.85)',
        'target-arrow-color': 'hsla(0, 0%, 0%, 0.85)',
      },
    },
    {
      selector: 'edge:selected',
      style: {
        width: 6,
        'curve-style': 'bezier',
        'line-color': 'hsl(30, 47%, 86%)',
        'target-arrow-color': 'hsl(30, 47%, 86%)',
      },
    },
  ],

  wheelSensitivity: 0.05,
  selectionType: 'single',
}

const $cy = cytoscape(config)
cytoscape.use(cxtmenu)

Vue.use(VueHammer)
Vue.config.productionTip = false
Vue.use({
  install(Vue) {
    Vue.prototype.$cy = $cy
    Vue.prototype.$frame = $frame
  },
})

new Vue({
  vuetify,
  render: h => h(App),
}).$mount('#app')
// This loads a new schedule into cytoscape whenever the active frame changes

function createFrameStore() {
  let nextId = 0
  const store = Vue.observable({
    root: null,
    active: null,
    s: {},
  })
  function spawnFrame({ name = 'anon', parent } = {}) {
    const id = '' + nextId++
    Vue.set(store.s, id, {
      name,
      parent,
      schedule: [
        {
          data: {
            type: 'event',
            name: 'root event',
            root: true,
            from: { type: 'import', schema: {}, name: 'in' },
            to: { type: 'export', name: 'out' },
          },
          position: { x: 0, y: 0 },
        },
      ],
      children: [],
      puts: [],
      takes: [],
    })

    if (parent) {
      store.s[parent].children.push(id)
    } else {
      // no parent, so this has to be a new root?
      store.root = id
    }

    // if there is no active node, this will do now
    if (!store.active) store.active = id

    return id
  }

  return {
    store,
    spawnFrame,
  }
}
