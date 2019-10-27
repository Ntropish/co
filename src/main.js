import Vue from 'vue'
import App from './App.vue'
import { VueHammer } from 'vue2-hammer'

import vuetify from './plugins/vuetify'

import cytoscape from 'cytoscape'
import cxtmenu from 'cytoscape-cxtmenu'

import cyConfig from './cyConfig.js'

export const $port = createPortStore()
export const $obj = createObjectStore($port)
const rootFrame = $obj.spawnFrame({ name: 'root object' })
$obj.spawnFrame({ name: 'sum', parent: rootFrame })
$obj.spawnFrame({ name: 'log', parent: rootFrame })
$obj.spawnFrame({ name: 'child 1', parent: rootFrame })
$obj.spawnFrame({ name: 'child 2', parent: rootFrame })

const config = cyConfig({ $obj, $port })
const $cy = cytoscape(config)
cytoscape.use(cxtmenu)

Vue.use(VueHammer)
Vue.config.productionTip = false
Vue.use({
  install(Vue) {
    Vue.prototype.$cy = $cy
    Vue.prototype.$obj = $obj
    Vue.prototype.$port = $port
  },
})

new Vue({
  vuetify,
  render: h => h(App),
}).$mount('#app')
// This loads a new schedule into cytoscape whenever the active frame changes
// function Collection(fn) {
//   let nextId = 0
//   const s = Vue.observable({})
//   function spawn(base) {
//     const id = '' + nextId++
//     Vue.set(s, id, {
//       id,
//       channels: {},
//       root: '0',
//     })
//     fn(base)
//   }
// }
// function createChannelStore() {
//   let nextId = 0
//   const s = Vue.observable({})

//   function spawn() {
//     const id = '' + nextId++
//     Vue.set(s, id, {
//       id,
//       channels: {},
//       root: '0',
//     })
//   }

//   return {
//     s,
//     spawn,
//   }
// }
// function createScheduleStore() {
//   let nextId = 0
//   const s = Vue.observable({})

//   function spawn() {
//     const id = '' + nextId++
//     Vue.set(s, id, {
//       id,
//       channels: {},
//       root: '0',
//     })
//   }

//   return {
//     s,
//     spawn,
//   }
// }
function createPortStore() {
  let nextId = 0
  const s = Vue.observable({})

  function spawn({ owner, name, type }) {
    const id = '' + nextId++
    Vue.set(s, id, {
      id,
      puts: [],
      takes: [],
      owner,
      name: name || 'anon',
      type,
    })

    return id
  }
  return {
    s,
    spawn,
  }
}

function createObjectStore($port) {
  let nextId = 0
  const store = Vue.observable({
    root: null,
    active: null,
    s: {},
  })
  function spawnFrame({ name = 'anon', parent } = {}) {
    const id = '' + nextId++
    const input = $port.spawn({ owner: id, name: 'in', type: 'in' })
    const output = $port.spawn({ owner: id, name: 'out', type: 'out' })
    Vue.set(store.s, id, {
      id,
      name,
      parent,
      schedule: [
        {
          data: {
            type: 'event',
            name: 'root event',
            root: true,
            _source: { type: 'port', port: input },
            _target: { type: 'port', port: output },
          },
          position: { x: 100, y: 75 },
          selected: true,
        },
      ],
      children: [],
      ports: [input, output],
      values: [['a', 1], ['b', 1]],
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
