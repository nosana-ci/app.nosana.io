<template>
  <div>
    <div class="stake-block p-5 has-background-grey-lighter" style="height:100%">
      <client-only>
        <carousel-3d
          v-if="stakeData && stakeData.tierInfo"
          ref="carousel"
          :perspective="20"
          :display="3"
          :width="350"
          :start-index="stakeData.tierInfo.userTier ?
            stakeData.tierInfo.userTier.tier : stakeData.tierInfo.tiers ? stakeData.tierInfo.tiers.length - 1 : 0"
          :height="320"
        >
          <slide
            v-for="slide in stakeData.tierInfo.tiers"
            :key="slide.tier"
            :index="slide.tier - 1"
            class="box has-background-light has-shadow"
            :class="{'has-shadow-accent has-border-accent': activeTier === slide.tier}"
          >
            <div class="columns is-mobile">
              <div class="column is-4 is-flex is-flex-direction-column">
                <div class="subtitle is-6 has-text-accent">
                  Tier {{ slide.tier }}
                </div>
                <div class="title is-5 mb-1">
                  {{ slide.name }}
                </div>
                <div>
                  <small class="is-size-7">Top
                    <span v-if="slide.tier === 1">{{ slide.number }}</span>
                    <span v-else>{{
                      stakeData.tierInfo.tiers.filter(s=>s.tier !== slide.tier && s.tier < slide.tier)
                        .reduce((a, o) => a + (o.percentage ? o.percentage : 0), 0) + slide.percentage
                    }}%
                    </span>
                  </small>
                </div>
                <div class="has-text-accent subtitle mt-auto has-border-accent p-1 has-radius">
                  <span v-if="slide.tier === 1" style="min-width: 160px;z-index: 1;">
                    <b>Guaranteed</b> NFT mint token
                  </span>
                  <span v-else-if="slide.tier === 2">
                    <b class="title has-text-accent">15</b> Tickets
                  </span>
                  <span v-else-if="slide.tier === 3">
                    <b class="title has-text-accent">6</b> Tickets
                  </span>
                  <span v-else-if="slide.tier === 4">
                    <b class="title has-text-accent">3</b> Tickets
                  </span>
                  <span v-else-if="slide.tier === 5">
                    <b class="title has-text-accent">1</b> Ticket
                  </span>
                </div>
              </div>
              <div class="column is-8">
                <img :src="require(`@/assets/img/tiers/tier${slide.tier}.svg`)">
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
  props: ['stakeData', 'xnos'],
  data () {
    return {
      activeTier: null
    };
  },
  watch: {
    xnos (xnos) {
      if (this.stakeData && this.stakeData.tierInfo && this.stakeData.tierInfo.tiers && this.$refs.carousel) {
        const tiers = this.stakeData.tierInfo.tiers;
        for (let i = 0; i < tiers.length; i++) {
          if (tiers[i].requiredXNOS / 1e6 <= parseFloat(xnos)) {
            this.$refs.carousel.goSlide(tiers[i].tier - 1);
            break;
          }
        };
      }
    },
    stakeData (stakeData) {
      if (stakeData.tierInfo && stakeData.tierInfo.userTier && this.$refs.carousel) {
        this.activeTier = stakeData.tierInfo.userTier.tier;
        this.$refs.carousel.goSlide(stakeData.tierInfo.userTier.tier - 1);
      }
    }
  },
  mounted () {
    if (this.stakeData && this.stakeData.tierInfo && this.stakeData.tierInfo.userTier) {
      this.activeTier = this.stakeData.tierInfo.userTier.tier;
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
