<template>
  <div class="root">
    <div class="left">
      <div class="cy-container">
        <div ref="cy" class="cy" v-once />
      </div>
    </div>

    <div class="text">
      <button :disabled="!path.length" :class="{ disabled: !path.length}" @click="exit">^^^</button>
      <input
        placeholder="Title"
        type="text"
        class="title-input input"
        @input="setName"
        :value="frame.name"
      />
      <button @click="addFrame">add frame</button>
      <div class="descendants">
        <div
          class="descendant"
          :key="descendant.id"
          v-for="descendant in list"
          :style="nodeStyle(descendant.depth)"
          @click="enter(descendant.id)"
        >{{ descendant.name }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

import cytoscape from 'cytoscape'
import cxtmenu from 'cytoscape-cxtmenu'
export const $frame = createFrameStore()
const rootFrame = $frame.spawnFrame({ name: 'root frame' })
$frame.spawnFrame({ name: 'sum', parent: rootFrame })
$frame.spawnFrame({ name: 'log', parent: rootFrame })
$frame.spawnFrame({ name: 'child 1', parent: rootFrame })
$frame.spawnFrame({ name: 'child 2', parent: rootFrame })

const config = {
  container: undefined,
  headless: true,
  elements: [],
  layout: {
    name: 'preset',
  },

  style: [
    {
      selector: 'node',
      style: {
        'font-family': ['B612', 'sans-serif'],
        label: 'data(name)',
        shape: 'rectangle',
        width: 100,
        height: 40,
        'text-valign': 'center',
        'background-color': 'hsla(0, 0%, 0%, 0.85)',
        color: 'hsl(30, 47%, 86%)',
      },
    },
    {
      selector: 'node:selected',
      style: {
        'background-color': 'hsl(30, 47%, 86%)',
        color: 'hsla(0, 0%, 0%, 0.85)',
      },
    },
    {
      selector: 'edge',
      style: {
        width: 6,
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'line-color': 'hsla(0, 0%, 0%, 0.85)',
        'target-arrow-color': 'hsla(0, 0%, 0%, 0.85)',
      },
    },
    {
      selector: 'edge:selected',
      style: {
        width: 6,
        'curve-style': 'bezier',
        'line-color': 'hsl(30, 47%, 86%)',
        'target-arrow-color': 'hsl(30, 47%, 86%)',
      },
    },
  ],

  wheelSensitivity: 0.05,
  selectionType: 'single',
}

const cy = cytoscape(config)
cytoscape.use(cxtmenu)

export default {
  data() {
    return {
      cy: null,
    }
  },
  watch: {
    schedule() {
      this.setSchedule()
    },
  },
  mounted() {
    const container = this.$refs.cy
    cy.mount(container)

    // cstmenu needs a container to run against so we have
    // to wait until cy is mounted before registering anything
    cy.cxtmenu({
      menuRadius: 100,
      selector: 'node',
      commands: [
        {
          content: 'remove',
          contentStyle: {},
          select: function(ele) {
            cy.remove('#' + ele.data().id)
          },
          enabled: true,
        },
        {
          content: 'connect',
          contentStyle: {},
          select: function(ele /*, event*/) {
            const selected = cy.$(':selected')
            selected.each(source => {
              cy.add({
                data: { type: 'edge', source: source.data().id, target: ele.data().id },
              })
            })
          },
          enabled: true,
        },
      ],
    })
    cy.cxtmenu({
      menuRadius: 100,
      selector: 'core',
      commands: [
        {
          content: 'add',
          contentStyle: {},
          select: function(ele, event) {
            const result = cy.add({
              data: { type: 'event', name: 'eventful', from: null, to: null },
              position: event.position,
            })
            const newEvent = result[0]
            const selected = cy.$(':selected')
            if (selected.length) {
              selected.each(select => {
                const edge = { type: 'edge', source: select.data().id, target: newEvent.data().id }
                cy.add({ data: edge })
              })
            }
            selected.unselect()
            result.select()
          },
          enabled: true,
        },
      ],
    })
    cy.cxtmenu({
      menuRadius: 100,
      selector: 'edge',
      commands: [
        {
          content: 'remove',
          contentStyle: {},
          select: function(ele /*, event*/) {
            cy.remove('#' + ele.data().id)
          },
          enabled: true,
        },
      ],
    })
    // const elements = $frame.store.s[$frame.store.active].schedule
    // const container = document.getElementById('cy')

    this.setSchedule()
  },
  beforeDestroy() {
    // this just unmounts anything so hopefully this happens
    // before the new one is created!
    cy.unmount()
  },
  computed: {
    schedule() {
      const sched = this.frame ? this.frame.schedule : null
      console.log(sched)
      return sched
    },
    path() {
      let result = []
      let cursor = $frame.store.active
      while (cursor && cursor !== $frame.store.root) {
        result.unshift(cursor)
        cursor = this.$frame.store.s[cursor].parent
      }
      return result
    },
    frame() {
      return $frame.store.s[$frame.store.active]
    },
    frameName() {
      return this.frame.name
    },
    list() {
      const result = []
      const addNode = (id, depth = 0) => {
        const source = $frame.store.s[id]
        if (!source) return
        result.push({ depth, id, name: source.name })
      }
      this.frame.children.forEach(id => addNode(id))
      return result
    },
  },
  methods: {
    setSchedule() {
      cy.remove('*')
      cy.add(this.schedule)
    },
    addFrame() {
      const config = { name: 'anon', parent: this.$frame.store.active }
      this.$frame.spawnFrame(config)
    },
    enter(id) {
      this.save()
      this.$frame.store.active = id
    },
    exit() {
      if (typeof this.frame.parent !== 'string') return
      this.save()
      this.$frame.store.active = this.frame.parent
    },
    save() {
      const raw = this.$cy.elements().jsons()
      Vue.set(this.frame, 'schedule', raw)
    },
    nodeStyle(depth) {
      return {
        marginLeft: depth + 'em',
      }
    },
    setName(e) {
      this.frame.name = e.target.value
    },
  },
}

function createFrameStore() {
  let nextId = 0
  const store = Vue.observable({
    root: null,
    active: null,
    s: {},
  })
  function spawnFrame({ name = 'anon', parent } = {}) {
    const id = '' + nextId++
    Vue.set(store.s, id, {
      name,
      parent,
      schedule: [
        {
          data: {
            type: 'event',
            name: 'root event',
            root: true,
            from: { type: 'import', schema: {}, name: 'in' },
            to: { type: 'export', name: 'out' },
          },
          position: { x: 0, y: 0 },
        },
      ],
      children: [],
      puts: [],
      takes: [],
    })

    if (parent) {
      store.s[parent].children.push(id)
    } else {
      // no parent, so this has to be a new root?
      store.root = id
    }

    // if there is no active node, this will do now
    if (!store.active) store.active = id

    return id
  }

  return {
    store,
    spawnFrame,
  }
}
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
html {
  background: hsl(185, 9%, 15%);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: 'B612', sans-serif;
}
.text {
  z-index: 1;
  position: relative;
  padding: 2em;
  background: hsl(30, 47%, 86%);
  box-shadow: 0 0 1rem hsla(0, 0%, 0%, 0.1);
  flex: 0 1;
  display: flex;
  flex-direction: column;
}
.title-input {
  background: transparent;
  font-size: 2rem;
  font-weight: 600;
  padding: 0.3rem 0.4rem;
  border: none;
  margin: 1rem 0;
  text-align: center;
  border: 1px solid hsla(0, 0%, 0%, 0.85);
}
.descendants {
  user-select: none;
  display: flex;
  flex-direction: column;
  text-align: left;
  font-size: 1.6rem;
  flex: 1 1 0;
}
.descendant:hover {
  background: hsla(0, 0%, 0%, 0.85);
  color: hsl(30, 47%, 86%);
}
button {
  background: none;
  color: hsla(0, 0%, 0%, 0.85);
  line-height: 3rem;
  border: 1px solid hsla(0, 0%, 0%, 0.85);
  font-size: 2rem;
  font-weight: 100;
}
button:hover:not(.disabled) {
  background: hsla(0, 0%, 0%, 0.85);
  color: hsl(30, 47%, 86%);
}
button.disabled {
  border: 1px solid hsla(0, 0%, 0%, 0.15);
  color: hsla(0, 0%, 0%, 0.15);
  font-weight: 800;
}

.root {
  display: flex;
  height: 100%;
  justify-content: stretch;
}
.cy,
.full {
  width: 100%;
  height: 100%;
}
.cy-container {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}
#app {
  flex: 1 1 0;
}
.left {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
}
</style>
