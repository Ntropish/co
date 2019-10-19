<template>
  <div class="root">
    <div class="text">
      <input placeholder="Title" type="text" class="title-input input" />
      <Descendants />
    </div>
    <cytoscape
      ref="cy"
      :config="config"
      :preConfig="preConfig"
      :afterCreated="applyCytoPlugins"
      id="app"
    >
      <cy-element v-for="def in defs" :key="def.data.id" :definition="def" />
    </cytoscape>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Descendants from './components/Descendants.vue'
import Schedule from './components/Schedule.vue'
import { view } from './data/view'
import jquery from 'jquery'
import contextMenus from 'cytoscape-context-menus'
import 'cytoscape-context-menus/cytoscape-context-menus.css'
import compoundDragAndDrop from 'cytoscape-compound-drag-and-drop'
import cxtmenu from 'cytoscape-cxtmenu'

export const schedule = Vue.observable({
  s: new Map(),
  root: null,
})

export const frame = Vue.observable({
  s: new Map(),
  root: null,
})

function spawnSchedule() {
  const symbol = Symbol('Schedule')
  schedule.s.set(symbol, {
    symbol,
    defs: [
      {
        data: { type: 'event', root: true, from: null, to: null },
        position: { x: 0, y: 0 },
      },
    ],
  })
  return symbol
}

export function spawnFrame(name: string) {
  const symbol = Symbol('Frame')
  frame.s.set(symbol, {
    name,
    schedule: spawnSchedule(),
    children: [],
    puts: [],
    takes: [],
  })
  return symbol
}

const rootFrame = spawnFrame('root')
frame.s.get(rootFrame).children.push(spawnFrame('sum'))
frame.s.get(rootFrame).children.push(spawnFrame('log'))
frame.s.get(rootFrame).children.push(spawnFrame('child 1'))
frame.s.get(rootFrame).children.push(spawnFrame('child 2'))

@Component({
  components: { Descendants, Schedule },
})
export default class App extends Vue {
  frameId = rootFrame
  preConfig(cytoscape) {
    cytoscape.use(cxtmenu)
  }
  applyCytoPlugins(cy) {
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
          select: function(ele, event) {
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
              data: { type: 'event', name: 'event', from: null, to: null },
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
          select: function(ele, event) {
            cy.remove('#' + ele.data().id)
          },
          enabled: true,
        },
      ],
    })
    // cy.add(this.schedule.def)
  }
  config = {
    elements: [],

    layout: {
      name: 'preset',
    },

    // so we can see the ids
    style: [
      {
        selector: 'node',
        style: {
          label: 'data(name)',
          shape: 'rectangle',
          width: 100,
          height: 40,
          'text-valign': 'center',
          color: 'white',
          'background-color': 'hsl(0, 0%, 20%)',
        },
      },
      {
        selector: 'node:selected',
        style: {
          'background-color': 'hsl(145, 60%, 40%)',
        },
      },
      {
        selector: 'edge',
        style: {
          width: 6,
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
        },
      },
    ],

    wheelSensitivity: 0.05,

    selectionType: 'single',
  }
  get frame() {
    return frame.s.get(this.frameId)
  }
  get schedule() {
    return schedule.s.get(this.frame.schedule)
  }
  get defs() {
    return this.schedule.defs
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
  background: hsl(0, 0%, 10%);
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
#app > div {
  height: 100%;
  flex-grow: 1;
}
#app {
  position: relative;
  overflow: hidden;
  color: hsla(0, 0%, 100%, 0.7);
  /* width: 100%; */
  flex-grow: 1;
  min-width: 0;
  height: 100%;
}
.root {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: stretch;
}
.text {
  z-index: 1;
  position: relative;
  padding: 2em;
  color: hsla(0, 0%, 100%, 0.7);
  background: hsla(30, 20%, 30%, 0.9);
  box-shadow: 0 0 1rem hsla(0, 0%, 0%, 0.15);
  flex: 0 1;
  display: flex;
  flex-direction: column;
}
.title-input {
  background: transparent;
  font-size: 2rem;
  padding: 0.3rem 0.4rem;
  color: hsla(0, 0%, 100%, 0.7);
  border: none;
  margin-bottom: 1rem;
  text-align: center;
}
.schedule {
  flex: 1.618 1 0;
}
</style>


