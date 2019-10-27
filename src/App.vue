<template>
  <div class="root">
    <div class="left">
      <div class="cy-container">
        <div ref="cy" class="cy" v-once />
      </div>
    </div>

    <div class="text">
      <div class="obj-title-row">
        <v-btn :disabled="!path.length" id="up-button" @click="exit" outlined large color="primary">
          <v-icon>mdi-arrow-up-box</v-icon>
        </v-btn>
        <input
          placeholder="Title"
          type="text"
          class="title-input input blackout"
          @input="setName"
          :value="obj.name"
        />
      </div>

      <v-expansion-panels class="entities" accordion :multiple="true" :value="[0,1,2]">
        <v-expansion-panel :style="expansionPanelStyle">
          <v-expansion-panel-header class="type-header light-text">
            <span class="type-text">ports</span>
            <div style="flex: 0 0 3rem;">
              <v-btn color="primary" icon text @click.stop="addPort" class="port-button">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div :key="port.id" v-for="(port, index) in ports" class="port">
              <v-btn
                color="primary"
                icon
                text
                v-if="port.type === 'in'"
                class="port-button"
                @click="setSource({ type: 'port', port: port.id })"
              >
                <v-icon>mdi-arrow-right</v-icon>
              </v-btn>
              <v-btn
                color="primary"
                icon
                text
                v-if="port.type !== 'in'"
                class="port-button"
                @click="setTarget({ type: 'port', port: port.id })"
              >
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>
              <input
                placeholder="name"
                type="text"
                class="input blackout expand"
                :value="port.name"
                @change="setPortName(index, $event)"
              />
              <v-btn color="primary" icon text @click.stop="togglePort(index)" class="port-button">
                <v-icon color="red darken-3">mdi-swap-horizontal</v-icon>
              </v-btn>
              <v-btn text icon color="primary" @click="removePort(index)" class="port-button">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel :style="expansionPanelStyle">
          <v-expansion-panel-header class="type-header light-text">
            <span class="type-text">child objects</span>
            <div style="flex: 0 0 3rem;">
              <v-btn color="primary" icon text @click.stop="addObj" class="port-button">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div :key="object.id" v-for="object in objects" class="object">
              <div class="light-text object-name">
                <span class="blackout" @click="enter(object.id)">{{ object.name }}</span>
                <v-btn
                  text
                  icon
                  color="primary"
                  @click="removeObject(object.id)"
                  class="port-button"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
              <div v-for="port in object.ports" :key="port.id">
                <v-btn
                  color="primary"
                  icon
                  text
                  v-if="port.type === 'in'"
                  class="port-button"
                  @click="setTarget({ type: 'object', object: object.id, port: port.id })"
                >
                  <v-icon>mdi-arrow-right</v-icon>
                </v-btn>
                <v-btn
                  color="primary"
                  icon
                  text
                  v-if="port.type !== 'in'"
                  class="port-button"
                  @click="setSource({ type: 'object', object: object.id, port: port.id })"
                >
                  <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
                <span class="nice-text">{{ object.name }}</span>
              </div>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel :style="expansionPanelStyle">
          <v-expansion-panel-header class="type-header light-text">
            <span class="type-text">values</span>
            <div style="flex: 0 0 3rem;">
              <v-btn color="primary" icon text @click.stop="addValue" class="port-button">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div class="value-row" :key="value.id" v-for="(value, index) in values">
              <v-btn
                text
                icon
                color="primary"
                class="port-button"
                @click="setSource({ type: 'value', object: $obj.store.active, index })"
              >
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>
              <input
                placeholder="name"
                type="text"
                class="input blackout"
                :value="value[0]"
                @change="setValueName(index, $event)"
              />
              <input
                placeholder="value"
                type="text"
                class="input blackout"
                :value="stringValue(value[1])"
                @change="setValue(index, $event)"
              />
              <v-btn text icon color="primary" @click="removeValue(index)" class="port-button">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import emoji from './emoji'
export default {
  data() {
    return {
      expansionPanelStyle: { background: 'hsl(30, 47%, 86%)' },
    }
  },
  watch: {
    schedule() {
      this.setSchedule()
    },
  },
  mounted() {
    const container = this.$refs.cy
    this.$cy.mount(container)

    // cxtmenu needs a container to run against so we have
    // to wait until cy is mounted before registering anything
    const cy = this.$cy
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
                data: {
                  type: 'edge',
                  source: source.data().id,
                  target: ele.data().id,
                },
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
              data: { type: 'event', name: 'eventful', _source: null, _target: null, emoji: emoji() },
              position: event.position,
            })
            const newEvent = result[0]
            const selected = cy.$(':selected')
            if (selected.length) {
              selected.each(select => {
                const edge = {
                  type: 'edge',
                  source: select.data().id,
                  target: newEvent.data().id,
                }
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
    // const elements = $obj.s[$obj.store.active].schedule
    // const container = document.getElementById('cy')

    this.setSchedule()
  },
  beforeDestroy() {
    // this just unmounts anything so hopefully this happens
    // before the new one is created!
    this.$cy.unmount()
  },
  computed: {
    schedule() {
      const sched = this.obj ? this.obj.schedule : null
      return sched
    },
    path() {
      let result = []
      let cursor = this.$obj.store.active
      while (cursor && cursor !== this.$obj.store.root) {
        result.unshift(cursor)
        cursor = this.$obj.s[cursor].parent
      }
      return result
    },
    obj() {
      return this.$obj.s[this.$obj.store.active]
    },
    objName() {
      return this.obj.name
    },
    list() {
      const result = []

      const addNode = (id, depth = 0) => {
        const source = this.$obj.s[id]
        if (!source) return
        result.push({ depth, id, name: source.name })
      }
      this.obj.children.forEach(id => addNode(id))
      return result
    },
    ports() {
      if (!this.obj) return []
      return this.obj.ports.map(id => this.$port.s[id])
    },
    objects() {
      const result = []

      const getPort = id => {
        return this.$port.s[id]
      }

      const addNode = id => {
        const source = this.$obj.s[id]
        if (!source) return
        result.push({
          id,
          name: source.name,
          ports: source.ports.map(getPort),
        })
      }
      this.obj.children.forEach(id => addNode(id))
      return result
    },
    values() {
      if (!this.obj) return []
      return this.obj.values
    },
  },
  methods: {
    setSource(source) {
      const selected = this.$cy.$(':selected')
      if (selected.length) {
        selected.each(select => {
          select.data({ _source: source })
        })
      }
    },
    setTarget(target) {
      const selected = this.$cy.$(':selected')
      if (selected.length) {
        selected.each(select => {
          select.data({ _target: target })
        })
      }
    },
    setSchedule() {
      if (!this.schedule) debugger
      this.$cy.remove('*')
      this.$cy.add(this.schedule)
    },
    setValueName(index, event) {
      this.values[index][0] = event.target.value
    },
    setValue(index, event) {
      this.values[index][1] = JSON.parse(event.target.value)
    },
    removeObject(id) {
      const index = this.obj.children.indexOf('' + id)
      if (index === -1) return
      this.obj.children.splice(index, 1)
    },
    removePort(index) {
      this.obj.ports.splice(index, 1)
    },
    removeValue(index) {
      this.obj.values.splice(index, 1)
    },
    togglePort(index) {
      const port = this.ports[index]
      port.type = port.type === 'out' ? 'in' : 'out'
    },
    setPortName(index, event) {
      const port = this.ports[index]
      port.name = event.target.value
    },
    addObj() {
      const config = { name: 'anon', parent: this.$obj.store.active }
      this.$obj.spawn(config)
    },
    addPort() {
      const config = { owner: this.obj.id, name: 'anon', type: 'in' }
      const portId = this.$port.spawn(config)
      this.obj.ports.push(portId)
    },
    addValue() {
      this.obj.values.push(['anon', null])
    },
    stringValue(value) {
      return JSON.stringify(value, null, 2)
    },
    enter(id) {
      this.save()
      this.$obj.store.active = id
    },
    exit() {
      if (typeof this.obj.parent !== 'string') return
      this.save()
      this.$obj.store.active = this.obj.parent
    },
    save() {
      const raw = this.$cy.elements().jsons()
      Vue.set(this.obj, 'schedule', raw)
    },
    nodeStyle(depth) {
      return {
        marginLeft: depth + 'em',
      }
    },
    setName(e) {
      this.obj.name = e.target.value
    },
  },
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
  overflow: hidden !important;
}
html {
  background: hsl(185, 9%, 15%);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: 'B612', sans-serif;
}
.text {
  color: hsl(185, 9%, 25%);
  z-index: 1;
  position: relative;
  padding: 1rem;
  background: hsl(30, 47%, 86%);
  box-shadow: 0 0 1rem hsla(0, 0%, 0%, 0.1);
  flex: 0 0 32rem;
  display: flex;
  flex-direction: column;
}
.title-input {
  flex: 1 1 0;
  background: transparent;
  font-size: 1.618rem;
  text-align: center;
  border: none;
  margin: 0 0 0 1rem;
}
.entities {
  margin-top: 1rem;
  font-size: 1.618rem;
  overflow-y: scroll;
}
::-webkit-scrollbar {
  width: 0.7rem;
}
::-webkit-scrollbar-track {
}
::-webkit-scrollbar-thumb {
  background: hsla(185, 9%, 25%, 0.2);
  border-radius: 1rem;
}
.blackout:hover {
  background: hsl(185, 9%, 25%);
  color: hsl(30, 47%, 86%);
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

  /* 
  min width is whatever the width of the content is
  so this needs to be set back to 0 to keep the canvas
  container flexy 😏 in flexbox. Otherwise it just
  ratchets itself wider and wider. I think...
   */
  min-width: 0;
}
button.type-header {
  /* font-size: 2rem; */
  flex: 1 1 0;
}
.obj-title-row {
  position: relative;
  display: flex;
  justify-content: stretch;
}
#up-button {
  height: 100%;
  /* font-size: 3rem; */
  /* height: 5rem; */
}
.light-text {
  color: hsla(185, 9%, 25%, 0.618);
}
.nice-text {
  color: hsla(185, 9%, 25%);
}
.value-row {
  display: flex;
}
input.blackout {
  width: 10rem;
  color: hsla(185, 9%, 35%, 0.9);
}
.object {
  margin-bottom: 1rem;
  position: relative;
}
.object-name {
  cursor: pointer;
  position: absolute;
  right: 0;
  top: 0;
}
.port-button {
  width: 2.5rem;
  margin: 0 0.5rem;
  color: hsla(185, 9%, 25%, 0.618) !important;
}

.port-button::before {
  color: transparent;
  color: hsl(30, 47%, 86%);
}

.port-button:hover {
  background: hsl(185, 9%, 35%);
  color: hsl(30, 47%, 86%) !important;
}
.type-text {
  margin-left: 5rem;
  font-size: 1.618rem;
}
.expand {
  flex-grow: 1;
}

.port {
  display: flex;
}
</style>
