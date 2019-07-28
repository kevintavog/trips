<template>
  <div class="tripview">
    <b-notification v-for="m in messages" v-bind:key="m" type="is-danger" role="alert">
      {{ m }}
    </b-notification>

    <span v-if="isLoading">
      <b-loading :active.sync="isLoading" />
    </span>
    <span v-else >
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

      <div  >
        <div class="day-row" v-for="daily in trip.daily" :key="daily.day" >

          <div class="columns " style="margin-left: 0.1em;">
            <div class="column is-vcentered">
              {{ displayable.weekMonthDay(daily.day) }}
            </div>
          </div>

          <div class="is-pulled-right day-image" >
            <div v-for="img in randomDailyImage(daily)" :key="img.thumbURL">
              <img :src="img.thumbURL" />
              <div style="max-width: 20em;">
                <span v-if="img.sitename.length > 0"> {{ img.sitename }}, </span>
                <span v-if="img.city.length > 0"> {{ img.city }} </span>
              </div>
            </div>
          </div>

          <div class="columns" v-for="country in daily.countries" :key="country.name" >
            <span class="column blank-column is-vcentered">
            </span>
            <div class="column"  >
              <b-tag class="trip-country-tag has-text-light" size="is-medium" rounded>
                {{ country.name }}
              </b-tag>
              <span v-for="city in country.cities" :key="city.name" >
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


          <div class="columns" v-for="health in healthByDay(daily.day)" :key="health.day" 
                style="padding-top: 0.75em; padding-bottom: 1.75em;">
            <div class="column blank-column is-vcentered">
            </div>
            <div class="columns is-centered health-row" >
              <div class="column health-column is-narrow has-text-centered is-4">
                <b-icon icon="mobile-alt" size="is-small" class="health-icon" />
                {{ health.sourceName }}
              </div>
              <span class="column health-column is-narrow has-text-centered">
                <b-icon icon="walking" size="is-small" class="health-icon" />
                {{ health.steps }} steps
              </span>
              <span class="column health-column is-narrow has-text-centered">
                <b-icon icon="shoe-prints" size="is-small" class="health-icon" />
                {{ health.flights }} flights
              </span>
              <span class="column health-column is-narrow has-text-centered">
                <b-icon icon="ruler" size="is-small" class="health-icon" />
                {{ displayable.detailedDistance(health.meters) }}
              </span>
            </div>
          </div>

          <div class="columns" style="padding-top: 0.75em; padding-bottom: 1.75em;">
            <div class="column blank-column is-vcentered">
            </div>
            <div class="columns is-centered images-row">
              <div class="column" v-if="daily.images.length === 0">
                No pictures 🙁
              </div>
              <div class="column" v-if="daily.images.length === 1">
                1 picture, taken at {{displayable.timeOnly(daily.images[0].createdDate)}}
              </div>
              <div class="column" v-if="daily.images.length > 1">
                {{daily.images.length}} pictures, from 
                  {{ displayable.timeOnly(daily.images[0].createdDate)}} to
                  {{ displayable.timeOnly(daily.images[daily.images.length - 1].createdDate)}}
              </div>
            </div>
          </div>

        </div>
      </div>
    </span>

  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator'
import { emptyTrip, Trip, TripDayInfo, TripHealth, TripImageInfo } from '@/models/Trip'
import { TripService } from '@/services/TripService'
import { displayable } from '@/utils/Displayable'
import { Chart } from 'chart.js'

@Component({})
export default class TripView extends Vue {
  @Inject('tripService') private tripService!: TripService
  private trip: Trip = emptyTrip
  private isLoading = true
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
        this.isLoading = false
        // this.setHealthDataSeries()
        // this.initializeChart()
      })
      .catch((err) => {
        this.messages.push(`Failed loading: ` + err)
        this.isLoading = false
      })
  }

  // TripHealth is returned because it has a `sourceName`
  private healthByDay(day: string): TripHealth[] {
    for (const d of this.trip!.daily) {
      if (d.day === day) {
        return d.health
      }
    }
    return []
  }

  private randomDailyImage(daily: TripDayInfo): [TripImageInfo] {
    if (daily.images && daily.images.length > 0) {
      const index = Math.floor(Math.random() * (daily.images.length))
      return [daily.images[index]]
    }
    return [{ thumbURL: '', createdDate: new Date(), city: '', country: '', sitename: '' }]
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

    for (const daily of this.trip!.daily) {
      maxStepsDistance = daily.health.reduce( (v, d) => Math.max(v, Math.max(d.steps, d.flights)), maxStepsDistance)
      maxFlights = daily.health.reduce( (v, d) => Math.max(v, d.flights), maxFlights)
    }
/*
      this.chartData.datasets.push({
        backgroundColor: 'rgba(0, 227, 153, 0.7)',
        borderColor: 'rgba(0, 227, 153, 0.7)',
        data: daily.health.map((d) => d.steps),
        label: `Steps - ${daily.sourceName}`,
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
*/
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
  background-color: #3c3c3c;
}

.day-image {
  padding: 1em;
  margin-right: 0.75em;
  margin-bottom: 0.75em;
  background-color: #1a1105;
  border-radius: 1em;
}

.blank-column {
  max-width: 3em;
}

.health-row {
  background-color: #004b4b;
  padding-left: 1.5em;
  padding-right: 2.5em;
  border-radius: 20em;
}

.health-icon {
  color: hsl(203, 92%, 75%);
  margin-right: 5px;
}

.images-row {
  background-color: #a0522d;
  padding-left: 1.5em;
  padding-right: 1.5em;
  border-radius: 20em;
}

</style>