<template>
  <div class="home">
    <b-notification v-for="m in messages" v-bind:key="m" type="is-danger" role="alert">
      {{ m }}
    </b-notification>

    <TripList :tripResponse="tripResponse" />
  </div>
</template>

<script lang="ts">
import { Component, Inject, Vue } from 'vue-property-decorator'
import TripList from '@/components/TripList.vue'
import { TripResponse } from '@/models/Trip'
import { TripService } from '@/services/TripService'

@Component({
  components: {
    TripList,
  },
})
export default class Home extends Vue {
  @Inject('tripService') private tripService!: TripService
  private tripResponse: TripResponse = { trips: [] }
  private messages: string[] = []

  private mounted() {
    this.tripService!.loadTrips()
      .then((results) => {
        this.tripResponse = results
      })
      .catch((err) => {
        this.messages.push(`Failed loading: ` + err)
      })
  }
}
</script>
