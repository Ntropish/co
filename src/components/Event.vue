<template>
  <div class="event" :style="eventStyle">
    <div class="top">private</div>
    <div class="middle">
      <div class="from" :class="{empty: !e.from}"> {{ e.from || 'from' }} </div>
      <div class="handle" v-hammer:pan="drag" v-hammer:panstart="dragStart">|||</div>
      <div class="to" :class="{empty: !e.to}">{{ e.to || 'to' }} </div>
    </div>
    <div class="bottom">
      <div class="add" @click="$emit('create')">+</div>
    </div>
    <arrow :path="[e.position, getNode(n).position]" :view="view" v-for="n in next"></arrow>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import Arrow from './Arrow.vue'
import { node } from '@/data/node'
import * as ft from '@/froto'
import { spawnSchedule } from '@/data/schedule'
import { $event } from '@/data/event'

const unitClamp = ft.clamp([0, 1])

@Component({
  components: { Arrow }
})
export default class Event extends Vue {
  name = 'Event'
  dragOffset = [0, 0]
  @Prop() private id!: symbol
  @Prop() private view!: [[number, number], [number, number]]

  dragStart(e) {
    e.target.setPointerCapture(e.pointers[0].pointerId)
    let mouseX = ft.from(this.view[0], e.center.x)
    let x = ft.duration([this.e.position[0], mouseX])

    let mouseY = ft.from(this.view[1], e.center.y)
    let y = ft.duration([this.e.position[1], mouseY])

    this.dragOffset = [x, y]
  }
  drag(e) {
    let mouseX = ft.from(this.view[0], e.center.x)
    let x = unitClamp(ft.duration([this.dragOffset[0], mouseX]))
    let mouseY = ft.from(this.view[1], e.center.y)
    let y = unitClamp(ft.duration([this.dragOffset[1], mouseY]))

    const newEvent = { ...$event.s[this.id], position: [ x, y] }
    Vue.set($event.s, this.id, newEvent)
  }
  dragStop(e) {
    e.target.releasePointerCapture(e.pointers[0].pointerId)
  }

  getNode(id) {
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
      top: e.position[1] * 100 + '%',
      left: e.position[0] * 100 + '%',
    }
  }
}
</script>
<style scoped>
.event {
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  position: absolute;
  padding: 0 1em;
  width: 10em;
  user-select: none; 
  height: 7em;
  line-height: 1.2rem;
}
.middle {
  line-height: 3rem;
  flex: 0 0 3rem;
  align-items: stretch;
  font-size: 1rem;
  display: flex;
  flex-direction: row;
  user-select: none;
}
.top {
  flex: 1 1 0;
  color: hsla(0, 0%, 100%, 0.3);
  font-weight: 800;
}
.bottom {
  display: flex;
  align-items: stretch;
  justify-content: center;
  flex: 1 1 0;
  line-height: 2em;
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
  font-weight: 800;
  border-radius: 0.2rem;
  flex: 1 1 0;
  cursor: grab;
}
.handle:hover {
  background: hsla(0, 0%, 100%, 0.2);
}
.empty {
  color: hsla(0, 0%, 100%, 0.3);
  font-weight: 800;
}
.add {
  color: hsla(0, 0%, 100%, 0.3);
  font-weight: 800;
  border-radius: 0.2rem;
  flex: 0 0 3rem;
  /* height: 3rem; */
}
.add:hover {
  background: hsla(0, 0%, 100%, 0.2);
}
</style>