import Vue from 'vue'
export interface IEvent {
  position: [number, number]
  next: IEvent[]
}

interface IEventCollection {
  [key: string]: IEventCollection
}

export const $event = Vue.observable({
  s: {},
})

let nextId = 0
// This is a template literal tag
export function spawnEvent() {
  const id = nextId++
  const event = { from: null, to: null, position: [0.5, 0.5], next: [], id }
  Vue.set($event.s, id, event)
  return id
}
