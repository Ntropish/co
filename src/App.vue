<template>
  <div id="app">
    <Schedule class="schedule" />
    <Descendants class="descendants" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Descendants from './components/Descendants.vue'
import Schedule from './components/Schedule.vue'
import { node, spawnNode } from './data/node'
import { view } from './data/view'

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
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: hsla(0, 0%, 100%, 0.7);
  width: 100%;
  height: 100%;
  display: flex;
  font-size: 2rem;
  line-height: 3rem;
}

.schedule {
  flex: 1.618 1 0;
}
.descendants {
  flex: 1 1 0;
}
</style>
