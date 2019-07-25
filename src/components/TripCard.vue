<template>
  <div class="tripcard card">
    <div class="card-content">
      <div class="title">
        <b-tag
          class="trip-country-tag has-text-light"
          size="is-medium"
          v-for="country in trip.countries"
          :key="country.name"
          rounded
        >{{country.name}}</b-tag>
      </div>
      <div
        class="subtitle has-text-light"
      >{{ dateOnly(trip.startDate, trip.startTimezoneId) }} - {{ dateOnly(trip.endDate, trip.endTimezoneId) }}</div>

      <div v-if="trip.health">
        <div class="canvas-container">
          <canvas class="health-chart" ref="canvas" />
        </div>

        <div
          v-for="health in trip.health"
          :key="health.sourceName"
        >{{ health.sourceName }}: {{ stepsString(health.totalSteps) }} steps, {{ health.totalFlights }} flights of stairs, {{ metersString(health.totalMeters) }}.</div>
      </div>

      <div class="content">
        <div v-if="trip.countries.length > 1">
          <div v-for="c in trip.countries" :key="c.name">
            <span>{{ c.name }} cities:</span>
            <span v-for="city in c.cities" :key="city.name">
              <b-tag
                v-if="city.name.length > 0"
                class="trip-city-tag has-text-light"
                size="is-medium"
                rounded
              >{{city.name}}</b-tag>
            </span>
          </div>
        </div>
        <div v-else>
          Cities:
          <span v-for="city in trip.countries[0].cities" :key="city.name">
            <b-tag
              v-if="city.name.length > 0"
              class="trip-city-tag has-text-light"
              size="is-medium"
              rounded
            >{{city.name}}</b-tag>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator'
import { Trip, TripCity } from '@/models/Trip'
import { DateTime } from 'luxon'
import { Chart } from 'chart.js'

@Component
export default class TripCard extends Vue {
  @Prop({ required: true }) private trip!: Trip
  private canvasElement?: HTMLCanvasElement
  private chart?: Chart
  private chartData: Chart.ChartData = {}
  private options: Chart.ChartOptions = {
    animation: {
      duration: 0,
    },
    tooltips: {
      enabled: true,
      mode: 'index',
      intersect: false,
      position: 'nearest',
    },
    responsive: true,
    responsiveAnimationDuration: 0,
    maintainAspectRatio: false,
    scales: {
      yAxes: [{
        type: 'linear',
        display: false,
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
        display: false,
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
  }


  private mounted() {
    this.initializeChart()
    this.setHealthDataSeries()
  }

  private dateOnly(date: string | Date, timezoneId: string): string {
    const l = DateTime.fromISO(date.toString(), { setZone: true }).setZone(timezoneId)
    return `${l.weekdayLong}, ${l.toLocaleString()}`
  }

  private countryList(): string[] {
    return this.trip.countries.map((c) => c.name)
  }
  private cityList(cities: TripCity[]): string[] {
    return cities.map((c) => c.name)
  }
  private stepsString(count: number): string {
    if (count < 3000) {
      return `${count}`
    }
    return `${Math.floor(count / 1000)}K`
  }
  private metersString(distance: number): string {
    if (distance < 5000) {
      return `${Math.floor(distance)} meters`
    }
    return `${Math.floor(distance / 1000)} km`
  }

  private initializeChart() {
    this.canvasElement = this.$refs['canvas'] as HTMLCanvasElement
    Chart.defaults.global.defaultFontColor = 'rgba(255, 255, 255, 255)'
    this.chart = new Chart(
      this.canvasElement, {
        type: 'bar',
        data: this.chartData,
        options: this.options,
      })

  }

  private setHealthDataSeries() {
    if (!this.trip || !this.trip!.health || this.trip!.health.length < 1) {
      return
    }

    this.chartData.datasets = []
    this.chartData.datasets.push({
      backgroundColor: 'rgba(0, 0, 0, 0)',
      borderColor: 'rgba(0, 227, 153, 0.7)',
      data: this.trip!.health[0].daily.map((d) => d.steps),
      fill: false,
      label: 'Steps',
      pointStyle: 'circle',
      pointRadius: 5,
      type: 'line',
      yAxisID: 'y-axis-100',
    })

    this.chartData.datasets.push({
      backgroundColor: 'rgba(0, 0, 0, 0)',
      borderColor: 'rgba(0, 143, 253, 0.7)',
      data: this.trip!.health[0].daily.map((d) => Math.floor(d.meters)),
      fill: false,
      label: 'Meters',
      pointRadius: 5,
      pointStyle: 'triangle',
      type: 'line',
    })

    this.chartData.datasets.push({
      backgroundColor: 'rgba(254, 216, 25, 0.7)',
      borderColor: 'rgba(254, 216, 25, 0.7)',
      data: this.trip!.health[0].daily.map((d) => d.flights),
      label: 'Flights',
      pointStyle: 'rect',
      type: 'bar',
      yAxisID: "y-axis-1",
    })

    this.chartData.labels = this.trip!.health[0].daily.map((d) => d.day.slice(5))

    this.chart!.update( {duration: 0} )
  }
}
</script>


<style>
</style>


<style scoped>
.tripcard {
  background-color: #3c3c3c;
  color: white;
  margin-top: 1em;
  margin-bottom: 0.5em;
  margin-left: 0.75em;
  margin-right: 0.75em;
  max-width: 45em;
  min-width: 30em;
}

.card-header-title {
  color: lightgray;
}

.trip-country-tag {
  background-color: hsl(141, 71%, 23%);
  margin-bottom: 5px;
  margin-right: 3px;
}

.trip-city-tag {
  background-color: hsl(217, 71%, 23%);
  margin-bottom: 5px;
  margin-right: 3px;
}

.canvas-container {
  height: 150px;
}

.health-chart {
  width: 100%;
  height: 100%;
  margin: 0px;
  padding: 0px;
}
</style>
