<template>
  <div class="text">
    <button v-if="path.length" @click="exit">^^^</button>
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
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import { frames, spawnFrame, Frame, $frame } from './frame'
console.log(frames)
@Component
export default class App extends Vue {
  path: string[] = []
  addFrame() {
    const frame = frames[this.frameId]
    Vue.set(frame, 'children', frame.children.concat(spawnFrame('anon')))
  }
  get frameId() {
    return $frame.root
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
    const raw = this.$cy.elements().map(element => element.data())
    const idClearedDefs = raw.map(el => {
      let { id, ...rest } = el
      return rest
    })
    this.frame.defs = idClearedDefs[0]
  }
  nodeStyle(depth: number): any {
    return {
      marginLeft: depth + 'em',
    }
  }
  setName(e) {
    debugger
    frames[this.frameId].name = e.target.value
  }
  get frameName(): string {
    if (!this.frame) return ''
    return this.frame.name
  }
  get frame() {
    console.log(frames[this.frameId])
    return frames[this.frameId]
  }
  get list() {
    if (frames === null || this.id === null) return []
    const result = []
    const addNode = (id: string, depth = 0) => {
      const source = frames[id]
      if (!source) return
      result.push({ depth, id, name: source.name })
      for (let childId of source.children) {
        addNode(childId, depth + 1)
      }
    }
    this.frame!.children.forEach((id: string) => addNode(id))
    console.log(result)
    return result
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
.descendants {
  user-select: none;
  display: flex;
  flex-direction: column;
  text-align: left;
  font-size: 1.6rem;
  flex: 1 1 0;
}
</style>


