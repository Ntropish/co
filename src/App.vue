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

<script>
import Vue from 'vue'
// import createFrameStore from './createFrameStore.js'

export default {
  setup(props, me) {
    console.log(props, me)
    const $frame = me.root.$frame
    const state = reactive({
      path: computed(() => {
        let result = []
        let cursor = $frame.active
        while (cursor) {
          result.unshift(cursor)
          cursor = frames[cursor].parent
        }
        return result
      }),
      frame: computed(() => frames[$frame.active]),
      frameName: computed(() => state.frame.name),
      list: computed(() => {
        const result = []
        const addNode = (id, depth = 0) => {
          const source = frames[id]
          if (!source) return
          result.push({ depth, id, name: source.name })
          for (let childId of source.children) {
            addNode(childId, depth + 1)
          }
        }
        state.frame.children.forEach(id => addNode(id))
        return result
      }),
    })
    function addFrame() {
      const frame = frames[state.frameId]
      Vue.set(frame, 'children', frame.children.concat($frame.spawnFrame('anon')))
    }
    async function enter(id) {
      $frame.active = id
      await save()
    }
    async function exit() {
      await save()
      $frame.active = state.frame.parent
    }
    async function save() {
      const raw = Vue.prototype.$cy.elements().map(element => element.data())
      const idClearedDefs = raw.map(el => {
        let { id, ...rest } = el
        return rest
      })
      frames[$frame.active].defs = idClearedDefs[0]
    }
    function nodeStyle(depth) {
      return {
        marginLeft: depth + 'em',
      }
    }
    function setName(e) {
      frames[state.frameId].name = e.target.value
    }
    return {
      ...state,
      addFrame,
      enter,
      exit,
      save,
      nodeStyle,
      setName,
    }
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


