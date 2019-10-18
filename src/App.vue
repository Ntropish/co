<template>
  <div class="root">
    <Descendants />
    <cytoscape
      ref="cy"
      :config="config"
      :preConfig="preConfig"
      :afterCreated="applyCytoPlugins"
      id="app"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Descendants from './components/Descendants.vue'
import Schedule from './components/Schedule.vue'
import { node, spawnNode } from './data/node'
import { view } from './data/view'
import jquery from 'jquery'
import contextMenus from 'cytoscape-context-menus'
import 'cytoscape-context-menus/cytoscape-context-menus.css'
import compoundDragAndDrop from 'cytoscape-compound-drag-and-drop'
import cxtmenu from 'cytoscape-cxtmenu'
const root = spawnNode('root')
node.s.get(root).children.push(spawnNode('sum'))
node.s.get(root).children.push(spawnNode('log'))
node.s.get(root).children.push(spawnNode('child 1'))
node.s.get(root).children.push(spawnNode('child 2'))

@Component({
  components: { Descendants, Schedule },
})
export default class App extends Vue {
  root = root
  node = node
  preConfig(cytoscape) {
    // it can be used both ways
    // cytoscape.use(compoundDragAndDrop)
    console.dir(this)
    cytoscape.use(cxtmenu)
  }
  applyCytoPlugins(cy) {
    // cy.compoundDragAndDrop({})
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
              data: { type: 'event', name: 'event' },
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
.schedule {
  flex: 1.618 1 0;
}
.descendants {
  flex: 1 1 0;
}
</style>


