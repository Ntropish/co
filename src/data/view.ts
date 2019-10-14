import Vue from 'vue'
import { documentReady } from '@/util'

export const view = Vue.observable({
  x: [0, 1],
  y: [0, 1],
  screenX: [0, 1],
  screenY: [0, 1],
})
