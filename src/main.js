import Vue from 'vue'
import App from './App.vue'
import { VueHammer } from 'vue2-hammer'

import vuetify from './plugins/vuetify'

import cytoscape from 'cytoscape'
import cxtmenu from 'cytoscape-cxtmenu'

import cyConfig from './cyConfig.js'

export const $channel = createChannelStore()
export const $frame = createFrameStore($channel)
const rootFrame = $frame.spawnFrame({ name: 'root object' })
$frame.spawnFrame({ name: 'sum', parent: rootFrame })
$frame.spawnFrame({ name: 'log', parent: rootFrame })
$frame.spawnFrame({ name: 'child 1', parent: rootFrame })
$frame.spawnFrame({ name: 'child 2', parent: rootFrame })

const $cy = cytoscape(cyConfig)
cytoscape.use(cxtmenu)

Vue.use(VueHammer)
Vue.config.productionTip = false
Vue.use({
  install(Vue) {
    Vue.prototype.$cy = $cy
    Vue.prototype.$frame = $frame
    Vue.prototype.$channel = $channel
  },
})

new Vue({
  vuetify,
  render: h => h(App),
}).$mount('#app')
// This loads a new schedule into cytoscape whenever the active frame changes

function createChannelStore() {
  let nextId = 0
  const store = Vue.observable({
    s: {},
  })

  function spawnChannel({ owner, name, type }) {
    const id = '' + nextId++
    Vue.set(store.s, id, {
      puts: [],
      takes: [],
      owner,
      name: name || 'anon',
      type,
    })

    return id
  }
  return {
    store,
    spawnChannel,
  }
}

function createFrameStore($channel) {
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
          position: { x: 100, y: 75 },
        },
      ],
      children: [],
      channels: [
        $channel.spawnChannel({ owner: id, name: 'in', type: 'in' }),
        $channel.spawnChannel({ owner: id, name: 'out', type: 'out' }),
      ],
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
