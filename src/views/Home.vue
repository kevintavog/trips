<template>
  <div class="home">
    <b-notification v-for="m in messages" v-bind:key="m" type="is-danger" role="alert">
      {{ m }}
    </b-notification>

    <TripList :tripResponse="tripResponse" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import TripList from '@/components/TripList.vue'
import { TripResponse } from '@/models/Trip'
import axios from 'axios'

@Component({
  components: {
    TripList,
  },
})
export default class Home extends Vue {
  private tripResponse: TripResponse = { trips: [] }
  private messages: string[] = []

  private mounted() {
    this.loadTrips()
      .then((results) => {
        this.tripResponse = results
      })
      .catch((err) => {
        this.messages.push(`Failed loading: ` + err)
      })
  }

  private loadTrips(): Promise<TripResponse> {
    return new Promise((resolve, reject) => {
        axios.get('trips.json')
        .then((response) => {
            resolve(response.data as TripResponse)
        }, (err) => {
          let message = err.message
          if (err.response != null) {
              message = `${err.response.status}: ${err.message}`
          }
          reject(message)
        })
    })
  }

}
</script>
