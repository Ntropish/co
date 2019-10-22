<template>
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
</template>

<script>
import Vue from 'vue'
export default {
  data() {
    return {}
  },
  computed: {
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
  },
  methods: {
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
</style>
