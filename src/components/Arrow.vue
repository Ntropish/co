<template>
  <path :d="path" stroke-width="2" marker-mid="url(#arrow)" stroke="hsl(0, 0%, 15%)" fill="none" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class Arrow extends Vue {
  @Prop() private path!: [number, number][]
  name = 'Arrow'
}
</script>
