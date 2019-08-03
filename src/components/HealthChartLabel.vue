<template>
  <div class="health-chart-label">
    <div class="chart-legend has-text-centered">
      <span>
        <span class="fa-stack trp-text-steps-color" style="vertical-align: top;">
          <i class="fas fa-square fa-stack-2x"></i>
          <i class="fas fa-shoe-prints fa-stack-1x fa-inverse"></i>
        </span>
        Steps
      </span>
      <span>
        <span class="fa-stack trp-text-distance-color" style="vertical-align: top;">
          <i class="fas fa-square fa-stack-2x"></i>
          <i class="fas fa-ruler fa-stack-1x fa-inverse"></i>
        </span>
        Distance (km)
      </span>
      <span>
        <span class="fa-stack trp-text-flights-color" style="vertical-align: top;">
          <i class="fas fa-square fa-stack-2x"></i>
          <i class="fas fa-signal fa-stack-1x fa-inverse"></i>
        </span>
        Flights
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator'

@Component
export default class HealthChartLabel extends Vue {
}

</script>

<style scoped>
</style>

