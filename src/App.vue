<template>
  <div class="root">
    <div class="left">
      <div class="cy-container">
        <div ref="cy" class="cy" v-once />
      </div>
    </div>

    <div class="text">
      <div class="frame-title-row">
        <v-btn :disabled="!path.length" id="up-button" @click="exit" outlined large color="primary">
          <v-icon>mdi-arrow-up-box</v-icon>
        </v-btn>
        <input
          placeholder="Title"
          type="text"
          class="title-input input blackout"
          @input="setName"
          :value="frame.name"
        />
      </div>

      <v-expansion-panels class="entities" accordion :multiple="true" :value="[0,1,2]">
        <v-expansion-panel :style="expansionPanelStyle">
          <v-expansion-panel-header class="type-header light-text">
            <span class="type-text">channels</span>
            <div style="flex: 0 0 3rem;">
              <v-btn icon class="icon-button" @click.stop="addChannel" text>
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div :key="channel.id" v-for="(channel, index) in channels">
              <v-btn
                text
                v-if="channel.type === 'in'"
                class="port-button"
                @click="setSource({ type: 'channel', channel: channel.id })"
              >
                <v-icon>mdi-arrow-right</v-icon>
              </v-btn>
              <v-btn
                text
                v-if="channel.type !== 'in'"
                class="port-button"
                @click="setTarget({ type: 'channel', channel: channel.id })"
              >
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>
              <input
                placeholder="name"
                type="text"
                class="input blackout"
                :value="channel.name"
                @change="setChannelName(index, $event)"
              />
              <v-btn icon class="icon-button" @click.stop="toggleChannel(index)" text>
                <v-icon color="red darken-3">mdi-swap-horizontal</v-icon>
              </v-btn>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel :style="expansionPanelStyle">
          <v-expansion-panel-header class="type-header light-text">
            <span class="type-text">child objects</span>
            <div style="flex: 0 0 3rem;">
              <v-btn icon class="icon-button" @click.stop="addFrame" text>
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </div>
            <!-- <button class="square-button" @click="addFrame">add</button> -->
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div :key="object.id" v-for="object in objects" class="object">
              <div
                class="blackout light-text object-name"
                @click="enter(object.id)"
              >{{ object.name }}</div>
              <div v-for="channel in object.channels" :key="channel.id">
                <v-btn
                  text
                  v-if="channel.type === 'in'"
                  class="port-button"
                  @click="setTarget({ type: 'object', channel: channel.id })"
                >
                  <v-icon>mdi-arrow-right</v-icon>
                </v-btn>
                <v-btn
                  text
                  v-if="channel.type !== 'in'"
                  class="port-button"
                  @click="setSource({ type: 'object', channel: channel.id })"
                >
                  <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
                <input placeholder="name" type="text" class="input" :value="channel.name" />
              </div>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel :style="expansionPanelStyle">
          <v-expansion-panel-header class="type-header light-text">
            <span class="type-text">values</span>
            <div style="flex: 0 0 3rem;">
              <v-btn icon class="icon-button" @click.stop="addValue" text>
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div class="value-row" :key="value.id" v-for="(value, index) in values">
              <v-btn text class="port-button" @click="setSource({ type: 'value', index })">
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
              data: { type: 'event', name: 'eventful', from: null, to: null, emoji: emoji() },
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
    // const elements = $frame.store.s[$frame.store.active].schedule
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
      const sched = this.frame ? this.frame.schedule : null
      return sched
    },
    path() {
      let result = []
      let cursor = this.$frame.store.active
      while (cursor && cursor !== this.$frame.store.root) {
        result.unshift(cursor)
        cursor = this.$frame.store.s[cursor].parent
      }
      return result
    },
    frame() {
      return this.$frame.store.s[this.$frame.store.active]
    },
    frameName() {
      return this.frame.name
    },
    list() {
      const result = []

      const addNode = (id, depth = 0) => {
        const source = this.$frame.store.s[id]
        if (!source) return
        result.push({ depth, id, name: source.name })
      }
      this.frame.children.forEach(id => addNode(id))
      return result
    },
    channels() {
      if (!this.frame) return []
      return this.frame.channels.map(channelId => this.$channel.store.s[channelId])
    },
    objects() {
      const result = []

      const getChannel = id => {
        return this.$channel.store.s[id]
      }

      const addNode = id => {
        const source = this.$frame.store.s[id]
        if (!source) return
        result.push({
          id,
          name: source.name,
          channels: source.channels.map(getChannel),
        })
      }
      this.frame.children.forEach(id => addNode(id))
      return result
    },
    values() {
      if (!this.frame) return []
      return this.frame.values
    },
  },
  methods: {
    setSource(source) {
      const selected = this.$cy.$(':selected')
      if (selected.length) {
        selected.each(select => {
          console.log(select)

          select.data({ _source: source })
        })
      }
    },
    setTarget(target) {
      const selected = this.$cy.$(':selected')
      if (selected.length) {
        selected.each(select => {
          select.data({ _target: target })
          console.log(select)
        })
      }
    },
    setSchedule() {
      this.$cy.remove('*')
      this.$cy.add(this.schedule)
    },
    setValueName(index, event) {
      this.values[index][0] = event.target.value
    },
    setValue(index, event) {
      this.values[index][1] = JSON.parse(event.target.value)
    },
    toggleChannel(index) {
      const channel = this.channels[index]
      channel.type = channel.type === 'out' ? 'in' : 'out'
    },
    setChannelName(index, event) {
      const channel = this.channels[index]
      channel.name = event.target.value
    },
    addFrame() {
      const config = { name: 'anon', parent: this.$frame.store.active }
      this.$frame.spawnFrame(config)
    },
    addChannel() {
      const config = { owner: this.frame.id, name: 'anon', type: 'in' }
      const channelId = this.$channel.spawnChannel(config)
      this.frame.channels.push(channelId)
    },
    addValue() {
      this.frame.values.push(['anon', null])
    },
    stringValue(value) {
      return JSON.stringify(value, null, 2)
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
  background: rgba(0, 0, 0, 0.15);
  border-radius: 1rem;
}
.blackout:hover {
  background: hsla(0, 0%, 0%, 0.85);
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
.frame-title-row {
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
  color: hsla(0, 0%, 0%, 0.4);
}
.value-row {
  display: flex;
}
input {
  width: 10rem;
}
.object {
  margin-bottom: 1rem;
}
.object-name {
  margin-left: 5rem;
}
.port-button {
  width: 2.5rem;
  margin: 0 0.5rem;
}
.type-text {
  margin-left: 5rem;
  font-size: 1.618rem;
}
</style>
