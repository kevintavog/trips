<template>
  <div class="health-chart">
      <div class="is-size-1	has-text-centered"> {{title}} </div>
      <div class="canvas-container">
        <canvas class="health-chart" ref="canvas" />
      </div>
      <health-chart-label />
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator'
import { TripHealth } from '@/models/Trip'
import HealthChartLabel from '@/components/HealthChartLabel.vue'
import { Chart } from 'chart.js'

@Component({
  components: {
    HealthChartLabel,
  },
})
export default class HealthChart extends Vue {
  @Prop({ required: true }) private title!: string
  @Prop({ required: true }) private health!: [TripHealth]
  @Prop({ required: true }) private labels!: [string]

  private canvasElement?: HTMLCanvasElement
  private chart?: Chart
  private chartData: Chart.ChartData = {}
  private options: Chart.ChartOptions = {
    animation: {
      duration: 0,
    },
    legend: {
      display: false,
    },
    maintainAspectRatio: false,
    responsive: true,
    responsiveAnimationDuration: 0,
    scales: {
      yAxes: [{
        type: 'linear',
        display: true,
        position: 'left',
        id: 'y-axis-100',
        gridLines: {
          color: 'rgba(255, 255, 255, 0.3)',
        },
        ticks: {
          min: 0,
          max: 35000,
        },
      }, {
        type: 'linear',
        display: true,
        position: 'right',
        id: 'y-axis-1',
        gridLines: {
          drawOnChartArea: false, // only want the grid lines for one axis to show up
        },
        ticks: {
          min: 0,
          max: 100,
        },
      }],
    },
    tooltips: {
      enabled: true,
      mode: 'index',
      intersect: false,
      position: 'average',
      bodySpacing: 10,
      xPadding: 10,
      yPadding: 10,
      titleSpacing: 4,
    },
  }

  private mounted() {
    this.setHealthDataSeries()
    this.initializeChart()
  }

  private initializeChart() {
    this.canvasElement = this.$refs[`canvas`] as HTMLCanvasElement
    Chart.defaults.global.defaultFontColor = 'rgba(255, 255, 255, 255)'
    this.chart = new Chart(
      this.canvasElement, {
        type: 'bar',
        data: this.chartData,
        options: this.options,
      })

    this.chart!.update( {duration: 0} )
  }

  private setHealthDataSeries() {
    if (this.health.length < 1) {
      return
    }

    this.chartData.datasets = []
    this.chartData.datasets.push({
      backgroundColor: 'rgba(0, 0, 0, 0)',
      borderColor: 'rgba(0, 227, 153, 0.7)',
      data: this.health.map((h) => h.steps),
      label: 'Steps',
      type: 'line',
      yAxisID: 'y-axis-100',
      hidden: false,
    })

    this.chartData.datasets.push({
      backgroundColor: 'rgba(0, 0, 0, 0)',
      borderColor: 'rgba(0, 143, 253, 0.7)',
      data: this.health.map((h) => Math.floor(h.meters)),
      fill: true,
      label: 'Meters',
      type: 'line',
      hidden: false,
    })

    this.chartData.datasets.push({
      backgroundColor: 'rgba(254, 216, 25, 0.7)',
      borderColor: 'rgba(254, 216, 25, 0.7)',
      data: this.health.map((h) => h.flights),
      label: 'Flights',
      type: 'bar',
      yAxisID: 'y-axis-1',
      hidden: false,
    })

    let maxStepsDistance = 0
    let maxFlights = 0
    maxStepsDistance = this.health.reduce( (v, h) =>
      Math.max(v, Math.max(h.steps, h.flights)), maxStepsDistance)
    maxFlights = this.health.reduce( (v, h) =>
      Math.max(v, h.flights), maxFlights)

    const axes = this.options.scales!.yAxes!
    axes[0]!.ticks!.max = 5000 * (1 + Math.floor(maxStepsDistance / 5000))
    axes[1]!.ticks!.max = 5 * (1 + Math.floor(maxFlights / 5))

    this.chartData.labels = this.labels.map((l) => l.slice(5))
  }

}

</script>

<style scoped>

.canvas-container {
  width: 100%;
}

.health-chart {
  width: 100%;
  height: 100%;
  margin: 0px;
  padding: 0px;
}

</style>

