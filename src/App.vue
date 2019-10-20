<template>
  <div class="root">
    <div class="text">
      <div v-if="path.length" @click="exit">^^^</div>
      <input placeholder="Title" type="text" class="title-input input" :value="frame.name" />
      <button @click="addFrame">add frame</button>
      <Descendants :id="frameId" @enter="enter" />
    </div>
    <cytoscape
      ref="cy"
      :config="config"
      :preConfig="preConfig"
      :afterCreated="afterCreated"
      id="app"
    >
      <cy-element v-for="def in defs" :key="def.data.id" :definition="def" />
    </cytoscape>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Descendants from './Descendants.vue'
import cxtmenu from 'cytoscape-cxtmenu'

import { frames, spawnFrame, Frame } from './frame'
import { schedule } from './schedule'

const rootFrame = spawnFrame('root frame')
frames[rootFrame].children.push(spawnFrame('sum'))
frames[rootFrame].children.push(spawnFrame('log'))
frames[rootFrame].children.push(spawnFrame('child 1'))
frames[rootFrame].children.push(spawnFrame('child 2'))

@Component({
  components: { Descendants },
})
export default class App extends Vue {
  frameId: string = rootFrame
  path: string[] = []

  preConfig(cytoscape) {
    cytoscape.use(cxtmenu)
  }
  afterCreated(cy) {
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

  addFrame() {
    const frame = frames[this.frameId]
    Vue.set(frame, 'children', frame.children.concat(spawnFrame('anon')))
  }

  async enter(id) {
    await this.save()
    this.path.push(this.frameId)
    this.frameId = id
  }

  async exit() {
    await this.save()
    const parent = this.path.pop()
    this.frameId = parent
  }

  async save() {
    let cy = await this.$refs.cy.cy
    const raw = cy.elements().map(element => element.data())
    const idClearedDefs = raw.map(el => {
      let { id, ...rest } = el
      return rest
    })
    console.log(idClearedDefs)
    this.frame.defs = idClearedDefs[0]
  }

  get frame() {
    return frames[this.frameId]
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
  background: hsla(30, 47%, 86%, 0.596);
  box-shadow: 0 0 1rem hsla(0, 0%, 0%, 0.15);
  flex: 0 1;
  display: flex;
  flex-direction: column;
}
.title-input {
  background: transparent;
  font-size: 2rem;
  padding: 0.3rem 0.4rem;
  border: none;
  margin-bottom: 1rem;
  text-align: center;
}
.schedule {
  flex: 1.618 1 0;
}
</style>


