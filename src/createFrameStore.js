import { Vue } from 'vue-property-decorator'
import { spawnSchedule } from './schedule'
import { reactive } from '@vue/composition-api'

export default function createFrameStore() {
  let nextId = 0
  const store = reactive({
    root: null,
    active: null,
    s: {},
  })
  function spawnFrame({ name, parent }) {
    const id = '' + nextId++
    Vue.set(store.s, id, {
      name,
      parent,
      schedule: spawnSchedule(),
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
