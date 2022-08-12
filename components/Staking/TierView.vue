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
          :start-index="stakeData.tierInfo.userTier ? stakeData.tierInfo.userTier.tier : 0"
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
                  Top
                  {{
                    stakeData.tierInfo.tiers.filter(s=>s.tier !== slide.tier && s.tier > slide.tier)
                      .reduce((a, o) => a + (o.percentage ? o.percentage : 0), 0) + slide.percentage
                  }}%
                </span>
                <br><small class="is-size-7"><span v-if="slide.tier !== 5">minus</span> top 100</small>
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
  props: ['stakeData'],
  watch: {
    stakeData (stakeData) {
      if (stakeData.tierInfo && stakeData.tierInfo.userTier && this.$refs.carousel) {
        this.$refs.carousel.goSlide(stakeData.tierInfo.userTier.tier - 1);
      }
    }
  }
};
</script>

<style lang="scss">
.carousel-3d-slide{
  filter: blur(2px);
  &.current {
    filter: none;
  }
}
.carousel-3d-container {
  padding-bottom: 50px;
  box-sizing: content-box !important;
}
</style>
