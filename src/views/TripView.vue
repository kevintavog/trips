<template>
  <div class="tripview">
    <b-notification v-for="m in messages" v-bind:key="m" type="is-danger" role="alert">
      {{ m }}
    </b-notification>

    <span v-if="isLoadingTrip">
      <b-loading :active.sync="isLoadingTrip" />
    </span>
    <span v-else >
      <b-modal :active.sync="isHealthChartModalActive" scroll="keep">
        <health-chart :title="healthChartTitle" :health="healthChartItems" :labels="healthChartLabels" />
      </b-modal>
      <b-modal :active.sync="isImageViewerModalActive" scroll="keep">
        <image-viewer :title="imageViewerTitle" :images="imageViewerItems" />
      </b-modal>

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

      <div class="trip-overview">
        Overview:
        <div style="padding-top: 0.75em; padding-bottom: 1.75em;" v-for="health in trip.health" :key="health.sourceName">
          <div class="columns is-centered health-row" @click="showOverviewHealth(health.sourceName)">
            <span class="column health-column is-narrow has-text-centered is-3">
              <b-icon icon="mobile-alt" size="is-small" class="health-icon" />
              {{ health.sourceName }}
            </span>
            <span class="column health-column is-narrow has-text-centered">
              <b-icon icon="shoe-prints" size="is-small" class="health-icon" />
              {{ displayable.stepsString(health.steps) }} steps
            </span>
            <span class="column health-column is-narrow has-text-centered">
              <b-icon icon="signal" size="is-small" class="health-icon" />
              {{ health.flights }} flights
            </span>
            <span class="column health-column is-narrow has-text-centered">
              <b-icon icon="ruler" size="is-small" class="health-icon" />
              {{ displayable.metersString(health.meters) }}
            </span>
          </div>
        </div>
      </div>
    </span>

    <span v-if="isLoadingDetails">
      <b-loading :active.sync="isLoadingDetails" />
    </span>
    <span v-else>
      <div  >
        <div class="day-row" v-for="daily in details.daily" :key="daily.day" >

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
            <div class="column" >
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
            <div class="columns is-centered health-row" @click="showDailyHealth(health)">
              <div class="column health-column is-narrow has-text-centered is-4">
                <b-icon icon="mobile-alt" size="is-small" class="health-icon" />
                {{ health.sourceName }}
              </div>
              <span class="column health-column is-narrow has-text-centered">
                <b-icon icon="shoe-prints" size="is-small" class="health-icon" />
                {{ health.steps }} steps
              </span>
              <span class="column health-column is-narrow has-text-centered">
                <b-icon icon="signal" size="is-small" class="health-icon" />
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
            <div class="columns is-centered images-row"
                  @click="showImages(displayable.weekMonthDay(daily.day), daily.images)">
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
import { emptyTrip, Trip, TripDailyDetails, TripDayInfo, TripHealth, TripImageInfo } from '@/models/Trip'
import { TripService } from '@/services/TripService'
import HealthChart from '@/components/HealthChart.vue'
import ImageViewer from '@/components/ImageViewer.vue'
import { displayable } from '@/utils/Displayable'

@Component({
  components: {
    HealthChart,
    ImageViewer,
  },
})
export default class TripView extends Vue {
  @Inject('tripService') private tripService!: TripService
  private trip: Trip = emptyTrip
  private details: TripDailyDetails = { daily: [] }
  private isLoadingTrip = true
  private isLoadingDetails = true
  private messages: string[] = []
  private displayable = displayable

  private isHealthChartModalActive = false
  private healthChartItems: TripHealth[] = []
  private healthChartLabels: string[] = []
  private healthChartTitle: string = ''

  private isImageViewerModalActive = false
  private imageViewerTitle: string = ''
  private imageViewerItems: TripImageInfo[] = []


  private showImages(day: string, images: TripImageInfo[]) {
    this.imageViewerTitle = `Images for ${day}`
    this.imageViewerItems = images
    this.isImageViewerModalActive = true
  }

  private showOverviewHealth(sourceName: string) {
    this.healthChartItems = []
    this.healthChartLabels = []
    this.healthChartTitle = `All '${sourceName}' data for this trip`
    const dailyHealth = this.trip!.dailyHealth.filter((h) => h.sourceName === sourceName)

    dailyHealth.forEach( (h) => {
        this.healthChartItems.push(h)
        this.healthChartLabels.push(h.date.toString().slice(5, 10))
      })

    this.isHealthChartModalActive = true
  }

  private showDailyHealth(health: TripHealth) {
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
      })
      .catch((err) => {
        this.messages.push(`Failed loading trip: ` + err)
      })
      .finally(() => {
        this.isLoadingTrip = false
      })
    this.tripService!.getDayInfo(id)
      .then((results) => {
        this.details = results
      })
      .catch((err) => {
        this.messages.push(`Failed loading day info: ` + err)
      })
      .finally(() => {
        this.isLoadingDetails = false
      })
  }

  // TripHealth is returned because it has a `sourceName`
  private healthByDay(day: string): TripHealth[] {
    let health:TripHealth[] = []
    for (const h of this.trip.dailyHealth) {
      if (h.date === day) {
        health.push(h)
      }
    }
    return health
  }

  private randomDailyImage(daily: TripDayInfo): [TripImageInfo] {
    if (daily.images && daily.images.length > 0) {
      const index = Math.floor(Math.random() * (daily.images.length))
      return [daily.images[index]]
    }
    return [{ thumbURL: '', createdDate: new Date(), city: '', country: '', sitename: '' }]
  }
}
</script>

<style scoped>

.tripview {
  margin: 0.5em;
  color: white;
}

.trip-overview {
  max-width: 35em;
  margin-left: 1em;
  margin-bottom: 3em;
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

.day-row {
  margin-bottom: 1.5em;
  background-color: #3c3c3c;
  overflow: auto;
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