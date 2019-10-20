import { Vue } from 'vue-property-decorator'
import { spawnSchedule } from './schedule'

export const frames = Vue.observable({})
export const $frame = Vue.observable({
  root: null,
  active: null,
})

let nextId = 0
export function spawnFrame(name) {
  const id = '' + nextId++
  Vue.set(frames, id, {
    name,
    schedule: spawnSchedule(),
    children: [],
    puts: [],
    takes: [],
  })
  return id
}
