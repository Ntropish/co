<template>
  <div class="schedule">
    <div class="box" ref="box">
      <event-node
        v-for="event in events"
        :key="event.id"
        :id="event.id"
        :view="view"
        @create="create(event.id)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { node } from '@/data/node'
import { schedule } from '@/data/schedule'
import Event from './Event.vue'
import { $event, spawnEvent } from '@/data/event'
import * as ft from '@/froto'
import debounce from 'debounce'

@Component({
  components: { EventNode: Event },
})
export default class Schedule extends Vue {
  name = 'Schedule'
  view = [[0, 1], [0, 1]]
  creating = false

  mounted() {
    this.resize = debounce(() => {
      const box = this.$refs.box
      if (!box) {
        return [[0, 0], [0, 0]]
      } else {
        const { left, right, top, bottom } = this.$refs.box.getBoundingClientRect()
        this.view = [[left, right], [top, bottom]]
      }
    }, 200)
    window.addEventListener('resize', this.resize)
    this.resize()
  }
  beforeDestroy() {
    window.removeEventListener('resize', this.resize)
  }

  resize = (...args: any[]) => null as any

  create(eventId: string) {
    $event.s[eventId].next.push(spawnEvent())
  }

  addEvent() {
    this.schedule.events.push(spawnEvent())
  }

  get rootNode() {
    return node.s.get(node.root)
  }

  get rootScheduleId() {
    return this.rootNode.schedule
  }
  get schedule() {
    return schedule.s.get(this.rootScheduleId)
  }

  get events() {
    const result = {}

    function runEvent(id) {
      if (!result.hasOwnProperty(id)) {
        const event = $event.s[id]
        result[id] = event
        event.next.forEach(runEvent)
      }
    }

    runEvent(this.schedule.last)
    return Object.values(result)
  }

  addEvent
}
</script>
<style scoped>
.schedule {
  display: flex;
  flex-direction: column;
  padding: 1em 1em 5em;
}
.box {
  flex: 1 1 0;
  position: relative;
}
</style>