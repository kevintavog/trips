<template>
  <div class="tripview">
    <b-notification v-for="m in messages" v-bind:key="m" type="is-danger" role="alert">
      {{ m }}
    </b-notification>

    <div class="title">
      <b-tag
        class="trip-country-tag has-text-light"
        size="is-medium"
        v-for="country in trip.countries"
        :key="country.name"
        rounded >
          {{country.name}}
      </b-tag>
    </div>

    <div class="subtitle has-text-light">
      {{ displayable.dateOnly(trip.startDate, trip.startTimezoneId) }} - 
      {{ displayable.dateOnly(trip.endDate, trip.endTimezoneId) }}
    </div>

    <!-- <div v-if="trip.health">
      <div class="canvas-container">
        <canvas class="health-chart" ref="canvas" />
      </div>

      <div v-for="health in trip.health" :key="health.sourceName" >
        {{ health.sourceName }}: 
        {{ displayable.stepsString(health.totalSteps) }} steps, 
        {{ health.totalFlights }} flights of stairs, 
        {{ displayable.metersString(health.totalMeters) }}.
      </div>
    </div> -->

    <div v-if="trip.dailyLocations && trip.dailyLocations.length > 0" >
      <div class="day-row" v-for="loc in trip.dailyLocations" :key="loc.day+loc.name" >

        <div class="columns ">
          <div class="column is-vcentered">
            {{ displayable.weekMonthDay(loc.day) }}
          </div>
        </div>

        <div class="columns" >
          <span class="column blank-column is-vcentered">
          </span>
          <div class="column">
            <b-tag v-if="trip.countries.length > 1" class="trip-country-tag has-text-light" size="is-medium" rounded>
              {{ loc.name }}
            </b-tag>
            <span v-for="city in loc.cities" :key="city.name" >
              <b-tag class="trip-city-tag has-text-light" size="is-medium" rounded >
                  {{ city.name }}
              </b-tag>
              <span v-for="site in city.sites" :key="site" >
                <b-tag class="trip-site-tag has-text-light" size="is-medium" rounded >
                  {{ site }}
                </b-tag>
              </span>
            </span>
          </div>
        </div>

        <div class="columns" >
          <span class="column blank-column is-vcentered">
          </span>
          <div class="column">
            <div v-for="health in healthByDay(loc.day)" :key="health.day" >
              {{ health.sourceName }}: 
              {{ health.totalSteps }} steps, 
              {{ health.totalFlights }} flights of stairs, 
              {{ displayable.detailedDistance(health.totalMeters) }}.
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator'
import { emptyTrip, Trip, TripHealth } from '@/models/Trip'
import { TripService } from '@/services/TripService'
import { displayable } from '@/utils/Displayable'
import { Chart } from 'chart.js'

@Component({})
export default class TripView extends Vue {
  @Inject('tripService') private tripService!: TripService
  private trip: Trip = emptyTrip
  private messages: string[] = []
  private displayable = displayable

  private canvasElement?: HTMLCanvasElement
  private chart?: Chart
  private chartData: Chart.ChartData = {
    datasets: [],
  }
  private options: Chart.ChartOptions = {
    animation: {
      duration: 0,
    },
    legend: {
      position: 'right',
    },
    tooltips: {
      enabled: true,
      mode: 'index',
      intersect: false,
      position: 'nearest',
      bodySpacing: 10,
      xPadding: 10,
      yPadding: 10,
      titleSpacing: 4,
    },
    responsive: true,
    responsiveAnimationDuration: 0,
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        type: 'linear',
        display: true,
        position: 'bottom',
        id: 'xaxis-big',
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
        position: 'top',
        id: 'xaxis-small',
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
    const props = this.$route.query
    let id = ''
    if ('id' in props) {
      id = props[`id`] as string
    }
    this.tripService!.getTrip(id)
      .then((results) => {
        this.trip = results
        // this.setHealthDataSeries()
        // this.initializeChart()
      })
      .catch((err) => {
        this.messages.push(`Failed loading: ` + err)
      })
  }

  // TripHealth is returned because it has a `sourceName`
  private healthByDay(day: string): TripHealth[] {
    const health: TripHealth[] = []
    for (const h of this.trip!.health) {
      const dayMatch = h.daily.filter( (d) => d.day === day)
      if (dayMatch.length > 0) {
        const first = dayMatch[0]
        health.push({
          sourceName: h.sourceName,
          totalSteps: first.steps,
          totalFlights: first.flights,
          totalMeters: first.meters,
          daily: []})
      }
    }
    return health
  }

  private initializeChart() {
    this.canvasElement = this.$refs[`canvas`] as HTMLCanvasElement
    Chart.defaults.global.defaultFontColor = 'rgba(255, 255, 255, 255)'
    this.chart = new Chart(
      this.canvasElement, {
        type: 'horizontalBar',
        data: this.chartData,
        options: this.options,
      })

    this.chart!.update( {duration: 0} )
  }

  private setHealthDataSeries() {
    if (!this.trip || !this.trip!.health || this.trip!.health.length < 1) {
      return
    }

    this.chartData.datasets = []

    let maxStepsDistance = 0
    let maxFlights = 0

    for (const h of this.trip!.health) {
      maxStepsDistance = h.daily.reduce( (v, d) => Math.max(v, Math.max(d.steps, d.flights)), maxStepsDistance)
      maxFlights = h.daily.reduce( (v, d) => Math.max(v, d.flights), maxFlights)

      this.chartData.datasets.push({
        backgroundColor: 'rgba(0, 227, 153, 0.7)',
        borderColor: 'rgba(0, 227, 153, 0.7)',
        data: h.daily.map((d) => d.steps),
        label: `Steps - ${h.sourceName}`,
        pointStyle: 'circle',
        pointRadius: 5,
        xAxisID: 'xaxis-big',
      })

      this.chartData.datasets.push({
        backgroundColor: 'rgba(0, 143, 253, 0.7)',
        borderColor: 'rgba(0, 143, 253, 0.7)',
        data: h.daily.map((d) => Math.floor(d.meters)),
        label: `Meters - ${h.sourceName}`,
        pointRadius: 5,
        pointStyle: 'triangle',
        xAxisID: 'xaxis-big',
      })

      this.chartData.datasets.push({
        backgroundColor: 'rgba(254, 216, 25, 0.7)',
        borderColor: 'rgba(254, 216, 25, 0.7)',
        data: h.daily.map((d) => d.flights),
        label: `Flights - ${h.sourceName}`,
        pointStyle: 'rect',
        xAxisID: 'xaxis-small',
      })
    }

    this.chartData.labels = this.trip!.health[0].daily.map((d) => d.day.slice(5))

    const axes = this.options.scales!.xAxes!
    axes[0]!.ticks!.max = 5000 * (1 + Math.floor(maxStepsDistance / 5000))
    axes[1]!.ticks!.max = 5 * (1 + Math.floor(maxFlights / 5))
  }

}
</script>

<style scoped>

.tripview {
  margin: 0.5em;
  color: white;
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

.trip-site-tag {
  background-color: hsl(48, 50%, 34%);
  margin-bottom: 5px;
  margin-right: 3px;
}

.canvas-container {
  width: 90%;
}

.health-chart {
  width: 100%;
  height: 100%;
  margin: 0px;
  padding: 0px;
}

.day-row {
  margin-bottom: 1.5em;
}

.blank-column {
  max-width: 5em;
}

</style>