<template>
  <div class="column is-half">
    <div class="stake-block p-5 has-background-grey-lighter">
      <client-only>
        <carousel-3d
          v-if="stakeData && stakeData.tierInfo"
          ref="carousel"
          :perspective="20"
          :display="3"
          :width="350"
          :height="320"
        >
          <slide
            v-for="slide in stakeData.tierInfo.tiers"
            :key="slide.tier"
            :index="slide.tier - 1"
            class="box has-background-light has-shadow"
          >
            <div class="has-text-centered">
              <div class="subtitle is-5">
                Tier {{ slide.tier }}
              </div>
              <div class="title is-4">
                {{ slide.name }}
              </div>
              <div class="my-4" style="position:relative">
                <img src="~assets/img/icons/globe.svg" style="width: 100px;">
                <span
                  class="has-text-accent m-0 title is-1"
                  style="position: absolute; top: calc(50% - 30px); left:calc(50% - 14px);"
                >{{ slide.tier }}</span>
              </div>
              <div class="has-text-accent subtitle">
                <hr>
                <span v-if="slide.tier === 5">
                  Guaranteed NFT mint token
                </span>
                <span v-else>
                  Top {{ slide.percentage }}%<br><small class="is-size-7">minus top 100</small>
                </span>
              </div>
            </div>
          </slide>
        </carousel-3d>
      </client-only>
    </div>
  </div>
</template>
<script>
export default {
  props: ['stakeData']
};
</script>

<style lang="scss">
.carousel-3d-slide{
  filter: blur(1px);
  &.current {
    filter: none;
  }
}
.carousel-3d-container {
  padding-bottom: 50px;
  box-sizing: content-box !important;
}
</style>
