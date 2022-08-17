<!-- eslint-disable vue/first-attribute-linebreak -->
<!-- eslint-disable vue/order-in-components -->
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
            (activeTier = stakeData.tierInfo.userTier.tier)
            && (stakeData.tierInfo.tiers.length - stakeData.tierInfo.userTier.tier) : 0"
          :height="320"
        >
          <slide
            v-for="slide in stakeData.tierInfo.tiers"
            :key="slide.tier"
            :index="stakeData.tierInfo.tiers.length - slide.tier"
            class="box has-background-light has-shadow has-radius"
            :class="{'has-shadow-accent has-border-accent': activeTier === slide.tier}"
          >
            <div class="columns is-mobile">
              <div class="column is-4 is-flex is-flex-direction-column">
                <div class="subtitle is-6 is-size-7-touch has-text-accent">
                  Tier {{ slide.tier }}
                </div>
                <div class="title is-5 mb-1 is-size-7-touch">
                  {{ slide.name }}
                </div>
                <div style="line-height: 1">
                  <span class="is-size-7">
                    <small>Top<br></small>
                    <span v-if="slide.tier === 1">{{ slide.number }}</span>
                    <span v-else>{{
                      stakeData.tierInfo.tiers.filter(s=>s.tier !== slide.tier && s.tier < slide.tier)
                        .reduce((a, o) => a + (o.percentage ? o.percentage : 0), 0) + slide.percentage
                    }}%
                      <span v-if="slide.tier > 2">
                        - {{ stakeData.tierInfo.tiers.filter(s=>s.tier !== slide.tier && s.tier < slide.tier)
                          .reduce((a, o) => a + (o.percentage ? o.percentage : 0), 0) }}%
                      </span>
                    </span>
                  </span>
                </div>
                <div
                  :class="['tier-' + slide.tier]"
                  class="has-text-accent subtitle mt-auto is-size-7-touch has-border-accent p-1 has-radius"
                >
                  <span v-if="slide.tier === 1">
                    <b>Guaranteed</b><br>NFT mint token
                  </span>
                  <span v-else-if="slide.tier === 2">
                    <b class="title has-text-accent is-size-5-touch">15</b> Tickets
                  </span>
                  <span v-else-if="slide.tier === 3">
                    <b class="title has-text-accent is-size-5-touch">6</b> Tickets
                  </span>
                  <span v-else-if="slide.tier === 4">
                    <b class="title has-text-accent is-size-5-touch">3</b> Tickets
                  </span>
                  <span v-else-if="slide.tier === 5">
                    <b class="title has-text-accent is-size-5-touch">1</b> Ticket
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

      <!-- TODO: background numbers here as in design -->
      <div v-if="stakeData &&
             stakeData.tierInfo &&
             parseFloat(stakeData.xnos) > 0 &&
             (!stakeData.tierInfo.userTier ||
               (stakeData.tierInfo.userTier &&
                 stakeData.tierInfo.userTier.tier !== 1))"
           class="has-shadow next-tier box has-background-light has-text-centered mb-6 py-2"
      >
        <p class="has-text-weight-semibold is-size-5 mb-0">
          Next tier
        </p>
        <span>Only</span>
        <span v-if="stakeData.tierInfo.userTier" class="has-text-accent is-size-5">{{
          ((parseFloat(
            stakeData.tierInfo.tiers.find(e => e.tier === stakeData.tierInfo.userTier.tier - 1).requiredXNOS)
            - parseFloat(stakeData.xnos)) / 1e6).toFixed()
        }}</span>
        <!-- if user is not in tier -->
        <span v-else class="has-text-accent is-size-5">
          {{
            ((parseFloat(
              stakeData.tierInfo.tiers[stakeData.tierInfo.tiers.length - 1].requiredXNOS)
              - parseFloat(stakeData.xnos)) / 1e6).toFixed()
          }}
        </span>
        <span>xNOS left</span>
      </div>

      <div
        v-if="leaderboard && leaderboard.length > 0"
        class="table-container has-background-light p-5 mb-0  has-radius-medium"
      >
        <div class="is-flex">
          <h3 class="has-text-centered subtitle is-4 has-text-weight-semibold">
            Leaderboard
          </h3>
          <span v-if="userRanking && pagination && stakeData && stakeData.tierInfo" class="is-pulled-right ml-auto">
            {{ userRanking }}/{{ pagination.total }}
            <small v-if="userRanking > stakeData.tierInfo.tiers.find(t => t.tier === 1).number">(Top
              {{ (userRanking - stakeData.tierInfo.tiers.find(t => t.tier === 1).number)
                /(pagination.total - stakeData.tierInfo.tiers.find(t => t.tier === 1).number) * 100 }}%)</small>
          </span>
        </div>
        <table class="table is-striped is-fullwidth is-hoverable">
          <thead>
            <tr>
              <th>Place</th>
              <th>Address</th>
              <th>xNOS</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(user, index) in leaderboard"
              :key="user.address"
              :class="{'user-ranking': userRanking === (index + 1)}"
            >
              <td><span>{{ index+1 }}</span></td>
              <td class="blockchain-address">
                {{ user.address }}
              </td>
              <td>{{ parseFloat(user.xnos / 1e6).toFixed() }}</td>
            </tr>
            <tr
              v-if="!leaderboard || !leaderboard.length"
              class="has-text-centered has-text-weight-bold"
            >
              <td v-if="!leaderboard" colspan="5">
                Loading users..
              </td>
              <td v-else colspan="5">
                No users
              </td>
            </tr>
            <tr
              v-if="leaderboard && userRanking && userRanking > leaderboard.length && stakeData"
              class="user-ranking"
            >
              <td><span>{{ userRanking }}</span></td>
              <td class="blockchain-address">
                {{ stakeData.address }}
              </td>
              <td>{{ parseFloat(stakeData.xnos / 1e6).toFixed() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- <pagination-helper
        v-if="leaderboard && leaderboard.length > 0 && pagination"
        :total-pages="Math.ceil(parseInt(pagination.total) / parseInt(pagination.perPage))"
        :per-page="parseInt(pagination.perPage)"
        :current-page="parseInt(pagination.currentPage)"
        @pagechanged="getLeaderboard"
      /> -->
    </div>
  </div>
</template>
<script>
export default {
  props: ['stakeData', 'xnos'],
  data () {
    return {
      activeTier: null,
      leaderboard: null,
      queryPage: this.$route.query.page || 1,
      pagination: null
    };
  },
  watch: {
    xnos (xnos) {
      if (this.stakeData && this.stakeData.tierInfo && this.stakeData.tierInfo.tiers && this.$refs.carousel) {
        const tiers = this.stakeData.tierInfo.tiers;
        for (let i = 0; i < tiers.length; i++) {
          if (tiers[i].requiredXNOS / 1e6 <= parseFloat(xnos)) {
            this.$refs.carousel.goSlide(tiers.length - tiers[i].tier);
            break;
          }
        };
      }
    },
    stakeData (stakeData) {
      if (stakeData.tierInfo && stakeData.tierInfo.userTier && this.$refs.carousel) {
        this.activeTier = stakeData.tierInfo.userTier.tier;
        this.$refs.carousel.goSlide(stakeData.tierInfo.tiers.length - stakeData.tierInfo.userTier.tier);
      }
    }
  },
  mounted () {
    if (this.stakeData && this.stakeData.tierInfo && this.stakeData.tierInfo.userTier) {
      this.activeTier = this.stakeData.tierInfo.userTier.tier;
    }
    this.getLeaderboard(this.queryPage);
  },
  methods: {
    async getLeaderboard (page) {
      try {
        const leaderboard = await this.$axios.$get(
          `/stake/leaderboards?page=${page}&limit=5`
        );
        this.leaderboard = leaderboard.stakes.data;
        // this.userRanking = 7;
        this.userRanking = leaderboard.userRanking;
        this.pagination = leaderboard.stakes.pagination;
      } catch (error) {
        console.error(error);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.carousel-3d-slide{
  filter: blur(2px);
  border-radius: 4px;
  &.current {
    filter: none;
  }
}
.carousel-3d-container {
  padding-bottom: 50px;
  box-sizing: content-box !important;
}
.tier-1 {
  min-width: 160px;z-index: 1;
}

/* Table */
.table {
  background-color: transparent;
  &.is-striped tbody tr:not(.is-selected):nth-child(even) {
    background: transparent;
  }
  &.is-striped tbody tr:not(.is-selected):nth-child(odd) {
    background: $grey-lighter;
  }
}

th {
  color: $text !important;
  &:nth-child(2) {
    text-align: center;
  }
}

tr {
  &.user-ranking {
    background: rgba(3, 188, 0, 0.1) !important;
  }
  .blockchain-address {
    font-family: $family-sans-serif;
  }
  td span {
    position: relative;
  }
  td:nth-child(2) {
    text-align: center;
    margin: 0 auto;
    max-width: 300px;
  }
  td span:first-child {
    &:after {
      position: absolute;
      right: -7px;
      top: 50%;
      transform: translateY(-50%);
      height: 80%;
      display: block;
      width: 4px;
      border-radius: 1px;
      content: '';
    }
  }
}
tr:nth-child(1) td span:first-child {
  font-size: 18px;
  &:after {
    background: #F2C94C;
  }
}

tr:nth-child(2) td span:first-child {
  font-size: 18px;
  &:after {
    background: #D7D7D7;
  }
}

tr:nth-child(3) td span:first-child {
  font-size: 18px;
  &:after {
    background: #F2994A;
  }
}

.next-tier {
  margin: 0 auto;
  margin-top: -10px;
  max-width: 300px;
  width: 100%;
  // span:first-child {
  //   font-size: ;
  // }
}
</style>
