import Vue from 'vue'
import { spawnEvent } from './event'
export const schedule = Vue.observable({
  s: new Map(),
})

// This is a template literal tag
export function spawnSchedule() {
  const symbol = Symbol('Schedule')
  const root = spawnEvent()
  schedule.s.set(symbol, { root, last: root })
  return symbol
}
