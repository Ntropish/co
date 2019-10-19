<template>
  <div class="root" :style="rootNodeStyle">
    <div class="node">{{ node.name || 'anon' }}</div>
    <div class="children">
      <Node :key="child" v-for="child in node.children" :id="child" :depth="depth + 1" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { node } from '@/data/node'
import { view } from '@/data/view'
import * as ft from '@/froto'
import { goldenSequence } from '../util'

@Component
export default class Node extends Vue {
  @Prop() private id!: Symbol
  @Prop() private depth!: number

  name = 'Node'

  get node() {
    return node.s.get(this.id)
  }
  view = view

  get rootNodeStyle() {
    const width = ft.to(this.view.screenX, ft.to(this.view.x, goldenSequence(this.depth)))
    return {
      width: width + 'px',
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.root {
  color: brown;
  display: flex;
  flex-direction: row-reverse;
  background: red;
}

.node {
  background: yellow;
  height: 100%;
  flex: 1 1 0;
}

.children {
  background: cyan;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
