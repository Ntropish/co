<template>
  <div class="event-bar">
    <div class="from">
      <div v-if="fromType === 'import'" class="import">
        <label>
          event name
          <input type="text" />
        </label>
      </div>
      <div v-if="fromType === 'value'">VALUE</div>
      <div v-if="fromType === 'child'">CHILD</div>
    </div>

    <v-select :items="fromOptions" label="from type" outlined />
    <!-- <select :value="fromType" @change="setFromType" name="from">
      <option value="import">import</option>
      <option value="value">value</option>
      <option value="child">child</option>
    </select>-->

    <div>-></div>

    <select :value="toType" @change="setToType" name="to">
      <option value="export">export</option>
      <option value="child">child</option>
    </select>

    <div class="to">
      <div v-if="toType === 'export'">
        <label>
          event name
          <input type="text" />
        </label>
      </div>
      <div v-if="toType === 'child'"></div>
    </div>
  </div>
</template>
<script>
function createFrom(type) {}
function createTo(type) {}
export default {
  data() {
    return {
      event: null,
      fromOptions: ['import', 'child', 'value'],
    }
  },
  mounted() {
    this.$cy.elements().on('select', e => {
      this.event = e.target.data()
      console.log(this.event)
    })
  },
  methods: {
    setFromType(e) {
      const value = e.target.value
      // this.event.from =
    },
    setToType(e) {
      const value = e.target.value
      console.log(value)
    },
  },
  computed: {
    fromType() {
      return this.event && this.event.from ? this.event.from.type : 'none'
    },
    toType() {
      return this.event && this.event.to ? this.event.to.type : 'none'
    },
    frame() {
      return this.$frame.store.s[this.$frame.store.active]
    },
    frameName() {
      return this.frame.store.name
    },
  },
}
</script>

<style scoped>
.import {
  display: flex;
  flex-direction: column;
}

.event-bar {
  font-size: 2rem;
  padding: 1rem 0rem;
  display: flex;
  position: relative;
  z-index: 1;
  flex: 0 0 4rem;
  background: hsl(30, 47%, 86%);
  box-shadow: 0 0 0.618rem hsla(0, 0%, 0%, 0.1618);
}
.event-bar > *:not(last-child) {
  margin-left: 1rem;
}
/* select {
  font-size: 2rem;
  flex: 0 0 4rem;
  background: hsl(30, 47%, 86%);
  border: 1px solid hsla(0, 0%, 0%, 0.85);
}
select:hover:not(.disabled) {
  background: hsla(0, 0%, 0%, 0.85);
  color: hsl(30, 47%, 86%);
} */
.from,
.to {
  flex: 1 1 0;
  color: hsla(0, 0%, 0%, 0.45);
  font-weight: 800;
  font-size: 1.6rem;
}
</style>
