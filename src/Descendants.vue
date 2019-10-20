<template>
  <div class="descendants">
    <div
      class="descendant"
      :key="descendant.id"
      v-for="descendant in list"
      :style="nodeStyle(descendant.depth)"
    >{{ descendant.name }}</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Frame, frames } from './frame'

type descendant = {
  name: string
  depth: number
  id: symbol
}
@Component
export default class Descendants extends Vue {
  name = 'Descendants'
  @Prop({ default: undefined }) readonly id: string | undefined

  nodeStyle(depth: number): any {
    return {
      marginLeft: depth + 'em',
    }
  }

  get frameName(): string {
    if (!this.frame) return ''
    return this.frame.name
  }

  get frame() {
    if (!frames || typeof this.id !== 'number') return null
    return frames[this.id]
  }

  get list() {
    if (frames === null || this.id === null) return []
    const result = [] as descendant[]
    const addNode = (id: string, depth = 0) => {
      const source = frames[id]
      if (!source) return
      result.push({ depth, id, name: source.name })
      for (let childId of source.children) {
        addNode(childId, depth + 1)
      }
    }
    this.frame!.children.forEach((id: string) => addNode(id))
    return result
  }
}
</script>

<style scoped>
.descendants {
  user-select: none;
  display: flex;
  flex-direction: column;
  text-align: left;
  font-size: 1.6rem;
  flex: 1 1 0;
}
</style>
