<template>
  <div class="tripcard card">
    <header class="card-header">
      <p class="card-header-title">
        {{ dateOnly(trip.startDate, trip.startTimezoneId) }} - {{ dateOnly(trip.endDate, trip.endTimezoneId) }}
        <br>
        {{ countryList().join(', ')}}
      </p>
    </header>
    <div class="card-content">
      <div class="content">
        <div v-if="trip.countries.length > 1">
          <div v-for="c in trip.countries" :key="c.name" >
            <span> {{ c.name }} cities: </span>
            <b-tag class="trip-tag has-text-light" size="is-medium" v-for="city in c.cities" :key="city.name" rounded>
              {{city.name}}
            </b-tag>
          </div>
        </div>
        <div v-else>
          Cities:
          <b-tag class="trip-tag has-text-light" size="is-medium" v-for="city in trip.countries[0].cities" :key="city.name" rounded>
            {{city.name}}
          </b-tag>
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
}
</script>

<style scoped>

.tripcard {
  background-color: #3C3C3C;
  color: white;
  margin: 1em 1em 1em 1em;
}

.card-header-title {
  color: lightgray;
}

.trip-tag {
  background-color: hsl(217, 71%, 23%);
  margin-bottom: 5px;
  margin-right: 3px;
}

</style>
