<template>
  <div class="schedule">
    <div class="box" ref="box">
      <event-node
        v-for="event in events"
        :key="event.id"
        :id="event.id"
        :view="view"
        @create="create(event.id)"
        @remove="remove(event.id)"
      />
      <svg class="svg" :width="boxWidth" :height="boxHeight" s>
        <!-- arrowhead marker definition -->
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="12"
            markerHeight="12"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
        </defs>
        <arrow :path="arrow.path" :key="arrow.from + arrow.to" v-for="arrow in arrows" />
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { node } from '@/data/node'
import { schedule } from '@/data/schedule'
import Event from './Event.vue'
import Arrow from './Arrow.vue'

import { $event, spawnEvent, IEventCollection, IEvent } from '@/data/event'
import * as ft from '@/froto'
import debounce from 'debounce'

type range = [number, number]

const NODE_RADIUS = 150
function pathString(path: range[]) {
  // First coordinate just moves into position
  let pathString = 'M ' + path[0].join(' ')

  // But the rest are all drawn
  path.slice(1).forEach((coord: range, i) => {
    // i is actually i - 1 because of the slice
    const last = path[i]
    if (ft.contains([last[1] - NODE_RADIUS, last[1] + NODE_RADIUS], coord[1])) {
      // left/right arrows
      let midX = ft.to([coord[0], last[0]], 0.5)
      pathString += `C ${midX} ${last[1]} ${midX} ${coord[1]} ${coord[0]} ${coord[1]}`
    } else {
      let midY = ft.to([coord[1], last[1]], 0.5)
      pathString += `C ${last[0]} ${midY} ${coord[0]} ${midY} ${coord[0]} ${coord[1]}`
    }
  })
  return pathString
}

@Component({
  components: { EventNode: Event, Arrow },
})
export default class Schedule extends Vue {
  name = 'Schedule'
  view = [[0, 1] as range, [0, 1] as range]
  creating = false

  mounted() {
    this.resize = debounce(() => {
      const box = this.$refs.box
      if (!box) {
        return [[0, 0] as range, [0, 0] as range]
      } else {
        const { left, right, top, bottom } = (this.$refs.box as Element).getBoundingClientRect()
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
  remove(eventId: string) {
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
    const result = {} as IEventCollection

    function runEvent(id: string) {
      if (!result.hasOwnProperty(id)) {
        const event = $event.s[id]
        result[id] = event
        event.next.forEach(runEvent)
      }
    }

    runEvent(this.schedule.last)
    return Object.values(result)
  }

  get arrows() {
    function unpackEvent(event: IEvent) {
      return event.next.map(to => ({ from: event.id, to }))
    }
    const movements = this.events.map(unpackEvent).flat()
    const idToPosition = (id: string) => $event.s[id].position
    const movementCoords = movements.map(function({ from, to }) {
      return { from: idToPosition(from), to: idToPosition(to) }
    })
    return movements.map(({ from, to }) => {
      let path = [this.coordToView(idToPosition(from)), this.coordToView(idToPosition(to))]
      return {
        path: pathString(path),
        from,
        to,
      }
    })
  }

  coordToView(coord: range): range {
    return [ft.to(this.view[0], coord[0]), ft.to(this.view[1], coord[1])]
  }

  get boxWidth() {
    return ft.duration(this.view[0])
  }
  get boxHeight() {
    return ft.duration(this.view[1])
  }
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
.svg {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  user-select: none;
  pointer-events: none;
  z-index: -1;
}
</style>
