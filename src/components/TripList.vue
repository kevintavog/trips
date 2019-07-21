<template>
  <div class="triplist">
      <div v-if="tripResponse" class="columns is-multiline is-mobile is-gapless">
        <div class="column" v-for="trip in tripResponse.trips" :key="trip.startDate">
          <TripCard :trip="trip" />
        </div>
      </div>
      <div v-else>
        No trips were found.
      </div>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator'
import TripCard from '@/components/TripCard.vue'
import { TripResponse } from '@/models/Trip'

@Component({
  components: {
    TripCard,
  },
})
export default class TripList extends Vue {
  @Prop({ required: true }) private tripResponse!: TripResponse
}
</script>

<style scoped>

.triplist {
  color: white;
}
</style>
