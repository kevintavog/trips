<template>
  <div class="image-viewer">
      <div class="is-size-1	has-text-centered"> {{title}} </div>
      <div class="image-list-container">
        <div class="box single-image" v-for="img in images" :key="img.thumbURL">
          <img class="trip-image" :src="img.thumbURL" />
          <div style="max-width: 15em;">
            <span v-if="img.sitename.length > 0"> {{ img.sitename }}, </span>
            <span v-if="img.city.length > 0"> {{ img.city }} </span>
          </div>
          <div>
            {{ displayable.timeOnly(img.createdDate) }}
          </div>
        </div>
      </div>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator'
import { TripImageInfo } from '@/models/Trip'
import { displayable } from '@/utils/Displayable'

@Component
export default class ImageViewer extends Vue {
  @Prop({ required: true }) private title!: string
  @Prop({ required: true }) private images!: TripImageInfo[]
  private displayable = displayable
}
</script>

<style scoped>

.image-viewer {
  background-color: #555555;
  overflow: auto;
  padding-left: 1em;
}

.single-image {
  float: left;
  margin-right: 0.75em;
  margin-bottom: 0.75em;
  background-color: #e5e4e2;
}

.trip-image {
  border: 3px solid black;
}
</style>
