import { Component, Vue } from 'vue-property-decorator'

export const schedule = Vue.observable({
  s: new Map(),
  active: null,
})

export const schedules = Vue.observable({})
export const activeSchedule = Vue.observable(null)

export function spawnSchedule() {
  const symbol = Symbol('Schedule')
  schedule.s.set(symbol, {
    symbol,
    defs: [
      {
        data: { type: 'event', name: 'root event', root: true, from: null, to: null },
        position: { x: 0, y: 0 },
      },
    ],
  })
  return symbol
}
