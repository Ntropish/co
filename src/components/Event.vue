<template>
  <div class="event" :style="eventStyle">
    <div class="top">
      <div class="sub" @click="$emit('remove')">-</div>
    </div>
    <div class="middle">
      <div class="handle" v-hammer:pan="drag" v-hammer:panstart="dragStart">|||</div>
      <div class="from" :class="{empty: !e.from}">{{ e.from || 'from' }}</div>
      <div class="to" :class="{empty: !e.to}">{{ e.to || 'to' }}</div>
    </div>
    <div class="bottom">
      <div class="add" @click="$emit('create')">+</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { node } from '@/data/node'
import * as ft from '@/froto'
import { spawnSchedule } from '@/data/schedule'
import { $event } from '@/data/event'

const unitClamp = ft.clamp([0, 1])

@Component
export default class Event extends Vue {
  name = 'Event'
  dragOffset = [0, 0]
  @Prop() private id!: string
  @Prop() private view!: [[number, number], [number, number]]

  dragStart(e: any) {
    e.target.setPointerCapture(e.pointers[0].pointerId)
    let mouseX = ft.from(this.view[0], e.center.x)
    let x = ft.duration([this.e.position[0], mouseX])

    let mouseY = ft.from(this.view[1], e.center.y)
    let y = ft.duration([this.e.position[1], mouseY])

    this.dragOffset = [x, y]
  }
  drag(e: any) {
    let mouseX = ft.from(this.view[0], e.center.x)
    let x = unitClamp(ft.duration([this.dragOffset[0], mouseX]))
    let mouseY = ft.from(this.view[1], e.center.y)
    let y = unitClamp(ft.duration([this.dragOffset[1], mouseY]))

    const newEvent = { ...$event.s[this.id], position: [x, y] }
    Vue.set($event.s, this.id, newEvent)
  }
  dragStop(e: any) {
    e.target.releasePointerCapture(e.pointers[0].pointerId)
  }

  getNode(id: string) {
    return $event.s[id]
  }
  get e() {
    return this.getNode(this.id)
  }
  get next() {
    return this.e.next
  }
  get nextPositions() {
    return this.next.map
  }
  get eventStyle() {
    const e = $event.s[this.id]
    return {
      top: `${e.position[1] * 100}%`,
      left: `${e.position[0] * 100}%`,
    }
  }
}
</script>
<style scoped>
.event {
  font-size: 1rem;
  position: absolute;
  user-select: none;
  line-height: 1.6rem;
  background: hsla(0, 0%, 15%, 1);
  /* box-shadow: 0 0.1rem 0.2rem hsla(0, 0%, 0%, 0.4); */
  display: flex;
  flex-direction: column;
  user-select: none;
  align-items: stretch;
  line-height: 3rem;
  width: 8rem;
}

.middle {
  display: flex;
  justify-content: space-around;
}

.from {
  border-radius: 0.2rem;
  flex: 1 1 0;
}
.from:hover {
  background: hsla(0, 0%, 100%, 0.2);
}
.to {
  border-radius: 0.2rem;
  flex: 1 1 0;
}
.to:hover {
  background: hsla(0, 0%, 100%, 0.2);
}
.handle {
  color: hsla(0, 0%, 100%, 0.3);
  font-weight: 600;
  border-radius: 0.2rem;
  flex: 1 1 0;
  cursor: grab;
}
.handle:hover {
  background: hsla(0, 0%, 100%, 0.2);
}
.empty {
  color: hsla(0, 0%, 100%, 0.3);
  font-weight: 600;
}
.add {
  color: hsla(0, 0%, 100%, 0.3);
  font-weight: 600;
  border-radius: 0.2rem;
  position: absolute;
  top: 100%;
  right: 100%;
  width: 2rem;
}
.add:hover {
  background: hsla(0, 0%, 100%, 0.2);
}
.sub {
  color: hsla(0, 0%, 100%, 0.3);
  font-weight: 600;
  border-radius: 0.2rem;
  position: absolute;
  bottom: 100%;
  right: 100%;
  width: 2rem;
}
.sub:hover {
  background: hsla(0, 0%, 100%, 0.2);
}
</style>