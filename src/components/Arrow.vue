<template>
  <svg class="arrow" :style="style" :viewbox="viewbox">
    <path :d="pathString" stroke="white" />
  </svg>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { node } from '@/data/node'
import { schedule } from '@/data/schedule'
import Event from './Event'
import { $event, spawnEvent } from '@/data/event'
import * as ft from '@/froto'
import debounce from 'debounce'

@Component({
  components: { EventNode: Event },
})
export default class Arrow extends Vue {
  @Prop() private path!: [number, number][]
  @Prop() private view!: [[number, number], [number, number]]

  name = 'Arrow'

  get pathString() {
    const startX = this.screenX(Math.trunc(this.path[0][0]))
    const startY = this.screenY(Math.trunc(this.path[0][1]))
    let path = `m ${startX} ${startY} `
    this.path.forEach(coord => {
      const x = this.screenX(Math.trunc(coord[0]))
      const y = this.screenY(Math.trunc(coord[1]))
      path += `l ${x} ${y} `
    })
    return path
  }

  screenX(n) {
    return ft.to(this.view[0], n)
  }
  screenY(n) {
    return ft.to(this.view[1], n)
  }

  get viewbox() {
    return this.xViewRange.join(' ') + ' ' + this.yViewRange.join(' ')
  }

  get xString() {
    return this.path.map(([x]) => x)
  }
  get yString() {
    return this.path.map(([, y]) => y)
  }

  get xRange() {
    return [Math.min(...this.xString), Math.max(...this.xString)]
  }

  get yRange() {
    return [Math.min(...this.yString), Math.max(...this.yString)]
  }

  get xViewRange() {
    return this.xRange.map(ft.to(this.view[0]))
  }
  get yViewRange() {
    return this.yRange.map(ft.to(this.view[1]))
  }

  get width() {
    return ft.duration(this.xViewRange)
  }
  get height() {
    return ft.duration(this.yViewRange)
  }

  get style() {
    const top = this.yViewRange[0] + 'px'
    const left = this.xViewRange[0] + 'px'
    return {
      position: 'fixed',
      top,
      left,
      width: this.width + 'px',
      height: this.height + 'px',
    }
  }
}
</script>