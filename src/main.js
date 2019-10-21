import Vue from 'vue'
import App from './App.vue'
import { VueHammer } from 'vue2-hammer'
import cytoscape from 'cytoscape'
import cxtmenu from 'cytoscape-cxtmenu'

// ==============================================================

// frames
export const $frame = createFrameStore()

const rootFrame = $frame.spawnFrame({ name: 'root frame' })
$frame.spawnFrame({ name: 'sum', parent: rootFrame })
$frame.spawnFrame({ name: 'log', parent: rootFrame })
$frame.spawnFrame({ name: 'child 1', parent: rootFrame })
$frame.spawnFrame({ name: 'child 2', parent: rootFrame })

// cytoscape
console.log($frame)
cytoscape.use(cxtmenu)
const elements = $frame.store.s[$frame.store.active].schedule
const cy = cytoscape({
  container: document.getElementById('cy'),
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

Vue.use(VueHammer)
Vue.config.productionTip = false

Vue.use({
  install(Vue) {
    Vue.prototype.$cy = cy
    Vue.prototype.$frame = $frame
  },
})

new Vue({
  render: h => h(App),
  data: {
    $frame,
  },
}).$mount('#app')

// This loads a new schedule into cytoscape whenever the active frame changes
new Vue({
  computed: {
    schedule() {
      return $frame.store.s[$frame.store.active].schedule
    },
  },
  watch: {
    schedule(newSchedule) {
      cy.remove('*')
      cy.add(newSchedule)
    },
  },
})
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
          data: { type: 'event', name: 'eventful', from: null, to: null },
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

export default function createFrameStore() {
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
          data: { type: 'event', name: 'root event', root: true, from: null, to: null },
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
