import { Vue } from 'vue-property-decorator'
import { spawnSchedule } from './schedule'

export interface Frame {
  name: string
  schedule: symbol
  children: string[]
  puts: any[]
  takes: any[]
}

export const frames = Vue.observable({} as {
  [key: string]: Frame
})

let nextId = 0
export function spawnFrame(name: string) {
  const id = nextId++
  Vue.set(frames, id, {
    name,
    schedule: spawnSchedule(),
    children: [],
    puts: [],
    takes: [],
  })
  return id
}
