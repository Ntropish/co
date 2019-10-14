<template>
  <div class="root">
    <div
      class="descendant"
      :key="descendant.id"
      v-for="descendant in list"
      :style="nodeStyle(descendant.depth)"
    >{{ nodeName(descendant.id)}}</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { node } from '@/data/node'
import { view } from '@/data/view'
import * as ft from '@/froto'
type descendant = {
  depth: number
  id: symbol
}
@Component
export default class Descendants extends Vue {
  name = 'Descendants'

  nodeStyle(depth: number): any {
    return {
      position: 'relative',
      left: depth + 'em',
    }
  }

  nodeName(id: symbol): string {
    return node.s.get(id).name
  }

  get list() {
    if (!node.root) return []
    const result = [] as descendant[]
    const addNode = (id: symbol, depth = 0) => {
      const source = node.s.get(id)
      result.push({ depth, id })
      for (let childId of source.children) {
        addNode(childId, depth + 1)
      }
    }

    node.s.get(node.root).children.forEach((id: symbol) => addNode(id))
    return result
  }
}
</script>

<style scoped>
.root {
  display: flex;
  flex-direction: column;
  padding: 2em;
}
</style>
