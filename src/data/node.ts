import Vue from 'vue'

import { spawnSchedule } from '@/data/schedule.ts'

export const node = Vue.observable({
  s: new Map(),
  root: null,
})

export function spawnNode(name: string) {
  const symbol = Symbol('Node')
  node.s.set(symbol, {
    name,
    schedule: spawnSchedule(),
    children: [],
    puts: [],
    takes: [],
  })
  return symbol
}

const rootId = spawnNode('root')
const root = node.s.get(rootId)
root.children.push(spawnNode('a'))
root.children.push(spawnNode('b'))

Vue.set(node, 'root', rootId)
