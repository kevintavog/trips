<template>
  <div class="tripcard card">
    <div class="card-content">
      <div class="title">
          <b-tag class="trip-country-tag has-text-light" size="is-medium" v-for="country in trip.countries" :key="country.name" rounded>
            {{country.name}}
          </b-tag>
      </div>
      <div class="subtitle has-text-light">
        {{ dateOnly(trip.startDate, trip.startTimezoneId) }} - {{ dateOnly(trip.endDate, trip.endTimezoneId) }}
      </div>
      <div v-if="trip.health" >
        <div v-for="health in trip.health" :key="health.sourceName">
          {{ health.sourceName }}: {{ stepsString(health.totalSteps) }} steps, {{ health.totalFlights }} flights of stairs, {{ metersString(health.totalMeters) }}.
        </div>
      </div>
      <div class="content">
        <div v-if="trip.countries.length > 1">
          <div v-for="c in trip.countries" :key="c.name" >
            <span> {{ c.name }} cities: </span>
            <span v-for="city in c.cities" :key="city.name" >
              <b-tag v-if="city.name.length > 0" class="trip-city-tag has-text-light" size="is-medium" rounded >
                {{city.name}}
              </b-tag>
            </span>
          </div>
        </div>
        <div v-else>
          Cities:
          <span v-for="city in trip.countries[0].cities" :key="city.name">
            <b-tag v-if="city.name.length > 0" class="trip-city-tag has-text-light" size="is-medium" rounded >
              {{city.name}}
            </b-tag>
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

@Component
export default class TripCard extends Vue {
  @Prop({ required: true }) private trip!: Trip

  private dateOnly(date: string | Date, timezoneId: string): string {
    const l = DateTime.fromISO(date.toString(), {setZone: true}).setZone(timezoneId)
    return `${l.weekdayLong}, ${l.toLocaleString()}`
  }

  private countryList(): string[] {
    return this.trip.countries.map( (c) => c.name)
  }
  private cityList(cities: TripCity[]): string[] {
    return cities.map( (c) => c.name)
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
}
</script>

<style scoped>

.tripcard {
  background-color: #3C3C3C;
  color: white;
  margin-top: 1em;
  margin-bottom: 0.5em;
  margin-left: 0.75em;
  margin-right: 0.75em;
  /* max-width: 35em; */
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

</style>
