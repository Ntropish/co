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

const sumId = spawnNode('sum')
const sum = node.s.get(sumId)

sum.children.push(spawnNode('> reset'))
sum.children.push(spawnNode('> insert'))
sum.children.push(spawnNode('< out'))

root.children.push(sumId)
root.children.push(spawnNode('< render'))
root.children.push(spawnNode('> log'))
root.children.push(spawnNode('child 1'))

const childId = spawnNode('child 2')
const child = node.s.get(childId)

child.children.push(spawnNode('> custom'))
child.children.push(spawnNode('< interface'))

root.children.push(childId)

Vue.set(node, 'root', rootId)
