<template>
  <cytoscape
    ref="cy"
    :config="config"
    :preConfig="preConfig"
    :afterCreated="applyCytoPlugins"
    id="app"
  />
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
    cytoscape.use(compoundDragAndDrop)
    cytoscape.use(cxtmenu)
  }
  applyCytoPlugins(cy) {
    cy.compoundDragAndDrop({})
    cy.cxtmenu({
      menuRadius: 200,
      selector: 'node',
      commands: [
        {
          // example command
          fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
          content: 'remove', // html/text content to be displayed in the menu
          contentStyle: {}, // css key:value pairs to set the command's css in js if you want
          select: function(ele) {
            // a function to execute when the command is selected
            //console.log(ele.id()) // `ele` holds the reference to the active element
          },
          enabled: true, // whether the command is selectable
        },
      ],
    })
    cy.cxtmenu({
      menuRadius: 200,
      selector: 'core',
      commands: [
        {
          // example command
          fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
          content: 'a command name', // html/text content to be displayed in the menu
          contentStyle: {}, // css key:value pairs to set the command's css in js if you want
          select: function(ele) {
            // a function to execute when the command is selected
            //console.log(ele.id()) // `ele` holds the reference to the active element
          },
          enabled: true, // whether the command is selectable
        },
      ],
    })
  }
  config = {
    elements: [
      // flat array of nodes and edges
      {
        // node n1
        group: 'nodes', // 'nodes' for a node, 'edges' for an edge
        // NB the group field can be automatically inferred for you but specifying it
        // gives you nice debug messages if you mis-init elements

        data: {
          // element data (put json serialisable dev data here)
          id: 'n1', // mandatory (string) id for each element, assigned automatically on undefined
          parent: 'nparent', // indicates the compound node parent id; not defined => no parent
          // (`parent` can be effectively changed by `eles.move()`)
        },

        // scratchpad data (usually temp or nonserialisable data)
        scratch: {
          _foo: 'bar', // app fields prefixed by underscore; extension fields unprefixed
        },

        position: {
          // the model position of the node (optional on init, mandatory after)
          x: 100,
          y: 100,
        },

        selected: false, // whether the element is selected (default false)

        selectable: true, // whether the selection state is mutable (default true)

        locked: false, // when locked a node's position is immutable (default false)

        grabbable: true, // whether the node can be grabbed and moved by the user

        pannable: false, // whether dragging the node causes panning instead of grabbing

        classes: ['foo', 'bar'], // an array (or a space separated string) of class names that the element has
      },

      {
        // node n2
        data: { id: 'n2' },
        renderedPosition: { x: 200, y: 200 }, // can alternatively specify position in rendered on-screen pixels
      },

      {
        // node n3
        data: { id: 'n3', parent: 'nparent' },
        position: { x: 123, y: 234 },
      },

      {
        // node nparent
        data: { id: 'nparent' },
      },

      {
        // edge e1
        data: {
          id: 'e1',
          // inferred as an edge because `source` and `target` are specified:
          source: 'n1', // the source node id (edge comes from this node)
          target: 'n2', // the target node id (edge goes to this node)
          // (`source` and `target` can be effectively changed by `eles.move()`)
        },

        pannable: true, // whether dragging on the edge causes panning
      },
    ],

    layout: {
      name: 'preset',
    },

    // so we can see the ids
    style: [
      {
        selector: 'node',
        style: {
          label: 'data(id)',
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
  /* background: hsl(0, 0%, 10%); */
}
#app > div {
  height: 100%;
}
#app {
  position: relative;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: hsla(0, 0%, 100%, 0.7);
  width: 100%;
  height: 100%;
}

.schedule {
  flex: 1.618 1 0;
}
.descendants {
  flex: 1 1 0;
}
</style>
