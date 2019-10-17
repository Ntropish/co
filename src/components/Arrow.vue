<template>
  <path :d="path" stroke-width="4" marker-end="url(#arrow)" stroke="hsl(0, 0%, 30%)" fill="none" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class Arrow extends Vue {
  @Prop() private path!: [number, number][]
  name = 'Arrow'
}
</script>
