<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script lang="ts">
import { Component, Provide, Vue } from 'vue-property-decorator'
import { TripService } from '@/services/TripService'

@Component
export default class App extends Vue {
  @Provide('tripService') private tripService = new TripService()
}
</script>

<style>

.main-html {
  height: 100vh;
  margin: 0;
  background-color: #202020;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  color: white !important;
  text-decoration: underline !important;
}

a:visited {
  color: white !important;
}

a:hover {
  color: white !important;
}

a:link {
  color: white !important;
}

.trp-text-steps-color {
  color: rgba(0, 227, 153, 0.7);
}

.trp-text-distance-color {
  color: rgba(0, 143, 253, 0.7);
}

.trp-text-flights-color {
  color: rgba(254, 216, 25, 0.7);
}

</style>
