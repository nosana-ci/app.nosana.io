<template>
  <div>
    <div class="stake-block p-5 has-background-grey-lighter" style="height:100%">
      <client-only>
        <carousel-3d
          v-if="stakeData && stakeData.tierInfo"
          ref="carousel"
          :perspective="20"
          :display="3"
          :loop="false"
          :width="350"
          :start-index="stakeData.tierInfo.userTier && parseFloat(xnos) >= 1000 ?
            (activeTier = stakeData.tierInfo.userTier.tier)
            && (stakeData.tierInfo.tiers.length - stakeData.tierInfo.userTier.tier) : 0"
          :height="320"
          @after-slide-change="refreshNextTier = !refreshNextTier"
        >
          <slide
            v-for="slide in stakeData.tierInfo.tiers"
            :key="slide.tier"
            :index="stakeData.tierInfo.tiers.length - slide.tier"
            class="box has-background-light has-shadow has-radius"
            :class="{'has-shadow-accent has-border-accent is-active': activeTier === slide.tier}"
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
              <div class="column is-8 tier-image">
                <img v-if="activeTier === slide.tier" :src="require(`@/assets/img/tiers/tier${slide.tier}_active.svg`)">
                <img v-else :src="require(`@/assets/img/tiers/tier${slide.tier}.svg`)">
              </div>
            </div>
          </slide>
        </carousel-3d>
      </client-only>
      <div
        v-if="stakeData &&
          stakeData.tierInfo && !stakeEndDate"
        class="next-tier-wrap has-shadow box has-background-light has-text-centered mb-6 p-0"
      >
        <div class="next-tier py-2" @click="requiredXnos(nextTier)">
          <div class="tier-bg tier-bg-prev">
            <span>
              {{ expectedTier }}
            </span>
          </div>
          <div class="has-text-weight-semibold is-size-5 mb-0">
            <div
              v-if="stakeData.tierInfo.userTier && stakeData.tierInfo.userTier.tier === 1 || expectedTier === 1"
              class="py-4"
            >
              Top {{ stakeData.tierInfo.tiers.find(t => t.tier === 1).number }}
            </div>
            <span v-else>Next tier</span>
          </div>
          <span v-if="nextTier" class="has-text-accent is-size-5">
            <span v-if="nextTier.tier !== 5">
              {{
                ((parseFloat(
                  nextTier.requiredXNOS)
                  - parseFloat(xnos)*1e6) / 1e6).toFixed()
              }}
            </span>
            <span v-else>{{ ((1000*1e6 - parseFloat(xnos)*1e6) / 1e6).toFixed() }}</span>
            <small class="has-text-black-ter">xNOS needed</small>
          </span>

          <div v-if="nextTier" class="tier-bg tier-bg-next">
            <span>{{ nextTier.tier }}</span>
          </div>
        </div>
      </div>

      <div
        v-if="leaderboard && leaderboard.length > 0"
        class="table-container has-background-light p-5 mb-0  has-radius-medium"
      >
        <div class="is-flex is-flex-wrap-wrap">
          <h3 class="has-text-centered subtitle is-4 has-text-weight-semibold">
            Leaderboard
          </h3>
          <span
            v-if="
              userInfo && userInfo.rank && pagination && stakeData && stakeData.tierInfo"
            class="is-pulled-right ml-auto"
          >
            {{ userInfo.rank }}/{{ pagination.total }}
            <small v-if="userInfo.rank > stakeData.tierInfo.tiers.find(t => t.tier === 1).number">(Top
              {{ ((userInfo.rank - stakeData.tierInfo.tiers.find(t => t.tier === 1).number)
                /(pagination.total - stakeData.tierInfo.tiers.find(t => t.tier === 1).number) * 100).toFixed()
              }}%)</small>

          </span>
        </div>
        <table class="table is-striped is-fullwidth is-hoverable">
          <thead>
            <tr>
              <th>Place</th>
              <th>Address</th>
              <th>Unstake days</th>
              <th>xNOS</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(user, index) in the leaderboard"
              :key="user.address"
              :class="{'user-ranking': userInfo && userInfo.rank === (index + 1)}"
            >
              <td class="is-family-monospace">
                <span>{{ index+1 }}</span>
              </td>
              <td class="blockchain-address">
                {{ user.address }}
              </td>
              <td class="is-family-monospace">
                {{ parseInt(user.duration/(3600*24)) }}
              </td>
              <td class="is-family-monospace">
                {{ parseFloat(user.xnos / 1e6).toFixed() | formatNumber }}
              </td>
            </tr>
            <tr
              v-if="!leaderboard || !leaderboard.length"
              class="has-text-centered has-text-weight-bold"
            >
              <td v-if="!leaderboard" colspan="5">
                Loading users...
              </td>
              <td v-else colspan="5">
                No users
              </td>
            </tr>
            <tr
              v-if="leaderboard && userInfo && userInfo.rank > leaderboard.length && stakeData"
              class="user-ranking"
            >
              <td class="is-family-monospace" :class="{'ranking-jump-up' : userInfo.rank > (leaderboard.length + 1)}">
                <span>{{ userInfo.rank }}</span>
              </td>
              <td class="blockchain-address">
                <span v-if="userInfo.address">{{ userInfo.address }}</span>
                <span v-else>Connected to Github</span>
              </td>
              <td class="is-family-monospace">
                {{ parseInt(userInfo.duration/(3600*24)) }}
              </td>
              <td class="is-family-monospace">
                {{ parseFloat(userInfo.xnos / 1e6).toFixed() | formatNumber }}
              </td>
            </tr>
          </tbody>
        </table>
        <div class="is-fullwidth has-text-centered has-text-weight-semibold">
          <nuxt-link to="/stake/leaderboard" class="has-text-accent">
            See all
          </nuxt-link>
        </div>
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
  filters: {
    formatNumber (num) {
      return Number(num).toLocaleString('en-US');
    }
  },
  props: ['xnos'],
  data () {
    return {
      activeTier: null,
      leaderboard: null,
      queryPage: this.$route.query.page || 1,
      pagination: null,
      userInfo: null,
      expectedTier: null,
      refreshNextTier: false
    };
  },
  computed: {
    publicKey () {
      return this.$sol ? this.$sol.publicKey : null;
    },
    stakeEndDate () {
      return this.$stake ? this.$stake.stakeEndDate : null;
    },
    stakeData () {
      return this.$stake ? this.$stake.stakeData : null;
    },
    nextTier () {
      let tier;
      // eslint-disable-next-line no-unused-expressions
      this.refreshNextTier;
      if (this.stakeData && this.stakeData.tierInfo) {
        if (this.$refs.carousel) {
          tier =
          this.stakeData.tierInfo.tiers[this.stakeData.tierInfo.tiers.length - this.$refs.carousel.currentIndex - 1];
        }
        if (this.expectedTier) {
          if (!tier || tier.tier >= this.expectedTier) {
            tier = this.stakeData.tierInfo.tiers.find(e => e.tier === this.expectedTier - 1);
          }
        } else if (!tier) {
          tier =
            this.stakeData.tierInfo.tiers[this.stakeData.tierInfo.tiers.length - 1];
        }
      }

      return tier;
    }
  },
  watch: {
    '$sol.publicKey': function () {
      this.getLeaderboard(this.queryPage);
    },
    xnos (xnos) {
      if (!xnos || !parseFloat(xnos)) {
        this.expectedTier = null;
      } else if (this.stakeData && this.stakeData.tierInfo && this.stakeData.tierInfo.tiers && this.$refs.carousel) {
        const tiers = this.stakeData.tierInfo.tiers;
        for (let i = 0; i < tiers.length; i++) {
          if (tiers[i].requiredXNOS / 1e6 <= parseFloat(xnos) || (i + 1 === tiers.length && parseFloat(xnos) >= 1000)) {
            this.expectedTier = tiers[i].tier;
            this.$refs.carousel.goSlide(tiers.length - tiers[i].tier);
            break;
          }
        };
      }
    },
    stakeData (stakeData) {
      if (stakeData.tierInfo && stakeData.tierInfo.userTier) {
        if (parseFloat(this.xnos) >= 1000) {
          this.activeTier = stakeData.tierInfo.userTier.tier;
          if (this.expectedTier === null) {
            this.expectedTier = stakeData.tierInfo.userTier.tier;
          }
        }
        // if(this.$refs.carousel) {
        // this.$refs.carousel.goSlide(stakeData.tierInfo.tiers.length - stakeData.tierInfo.userTier.tier);
        // }
        this.getLeaderboard(this.queryPage);
      }
    }
  },
  mounted () {
    if (this.stakeData && this.stakeData.tierInfo && this.stakeData.tierInfo.userTier) {
      if (parseFloat(this.xnos) >= 1000) {
        this.activeTier = this.stakeData.tierInfo.userTier.tier;
      }
    }
    this.getLeaderboard(this.queryPage);
  },
  methods: {
    requiredXnos (tier) {
      if (tier) {
        if (tier.tier !== 5) {
          this.$emit('rxnos', tier.requiredXNOS);
        } else {
          this.$emit('rxnos', 1000 * 1e6);
        }
      }
    },
    async getLeaderboard (page) {
      try {
        const userAddress = this.publicKey ? `&userAddress=${this.publicKey}` : '';
        const leaderboard = await this.$axios.$get(
          `/stake/leaderboards?page=${page}&limit=5` + userAddress
        );
        this.leaderboard = leaderboard.stakes.data;
        // this.userRanking = 7;
        this.userInfo = leaderboard.user;
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
  td, th {
    padding: 0.4em 1em;
    border: none;
  }
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
    margin: 0 auto;
    max-width: 250px;
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
.next-tier-wrap {
  margin: 0 auto;
  margin-top: -10px;
  max-width: 300px;
  width: 100%;
  overflow: hidden;
  position: relative;
}

.next-tier {
  box-shadow: inset 0px 1px 12px 10px white;
  border: 1px solid transparent;
  cursor: pointer;
  &:hover {
    border-color: $accent;
  }
}

.ranking-jump-up {
  position:relative;
  &:before {
    content: '⋮';
    position: absolute;
    display: block;
    top: -15px;
    left: 15px;
    z-index: 1;
  }
}
.tier-bg {
  font-weight: bold;
  display: flex;
  align-items: center;
  position: absolute;
  font-size: 100px;
  -webkit-text-stroke-width: 2px;
  -webkit-text-stroke-color: rgba(0,0,0,.1);
  color: transparent;
  bottom: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 100%;
  &:before {
    top: 50%;
    transform: translateY(-50%);
    content: " ";
    position:absolute;
    height: 100%;
    width: 60px;
  }
  &-next {
    right: -10px;
    &:before {
      right: 5px;
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,1) 100%);
    }
  }
  &-prev {
    left: -10px;
    &:before {
      left: 5px;
      background: linear-gradient(90deg, rgba(255,255,255,1) 0%, transparent 100%);
    }
  }
}
</style>
