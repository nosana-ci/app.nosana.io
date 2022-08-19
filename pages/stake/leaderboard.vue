<template>
  <section class="section">
    <div v-if="tiers" class="columns">
      <div
        v-for="slide in tiers"
        :key="slide.tier"
        :index="tiers.length - slide.tier"
        class="column"
      >
        <div
          class="box is-clickable has-background-light has-shadow has-radius"
          @click="gotoTier(slide)"
        >
          <div class="columns is-mobile">
            <div class="column is-5 is-flex is-flex-direction-column">
              <div class="subtitle is-6 is-size-7-touch has-text-accent">
                Tier {{ slide.tier }}
              </div>
              <div class="title is-6 mb-1 is-size-7-touch">
                {{ slide.name }}
              </div>
              <div style="line-height: 1" class="is-hidden-touch">
                <span class="is-size-7">
                  <small>Top<br></small>
                  <span v-if="slide.tier === 1">{{ slide.number }}</span>
                  <span v-else>{{
                    tiers.filter(s=>s.tier !== slide.tier && s.tier < slide.tier)
                      .reduce((a, o) => a + (o.percentage ? o.percentage : 0), 0) + slide.percentage
                  }}%
                    <span v-if="slide.tier > 2">
                      - {{ tiers.filter(s=>s.tier !== slide.tier && s.tier < slide.tier)
                        .reduce((a, o) => a + (o.percentage ? o.percentage : 0), 0) }}%
                    </span>
                  </span>
                </span>
              </div>
              <div
                :class="['tier-' + slide.tier]"
                class="has-text-accent subtitle mt-auto is-size-7 has-border-accent p-1 has-radius is-hidden-touch"
              >
                <span v-if="slide.tier === 1">
                  <b>Guaranteed</b><br>NFT mint token
                </span>
                <span v-else-if="slide.tier === 2">
                  <b class="title has-text-accent is-size-5">15</b> Tickets
                </span>
                <span v-else-if="slide.tier === 3">
                  <b class="title has-text-accent is-size-5">6</b> Tickets
                </span>
                <span v-else-if="slide.tier === 4">
                  <b class="title has-text-accent is-size-5">3</b> Tickets
                </span>
                <span v-else-if="slide.tier === 5">
                  <b class="title has-text-accent is-size-5">1</b> Ticket
                </span>
              </div>
            </div>
            <div class="column is-7 is-hidden-touch">
              <img :src="require(`@/assets/img/tiers/tier${slide.tier}.svg`)">
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="leaderboard && leaderboard.length > 0"
      class="table-container has-background-light p-5 mb-0  has-radius-medium"
    >
      <h3 class="has-text-centered subtitle is-4 has-text-weight-semibold">
        Leaderboard
      </h3>
      <table class="table is-striped is-fullwidth is-hoverable mb-3">
        <thead>
          <tr>
            <th>Place</th>
            <th>Address</th>
            <th>Unstake days</th>
            <th>xNOS</th>
            <th>Tier</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-if="leaderboard && userInfo && userInfo.rank < rankings[0] + 1"
            class="user-ranking"
          >
            <td :class="{'ranking-jump-down' : userInfo.rank < rankings[0] - 2}">
              <span>{{ userInfo.rank }}</span>
            </td>
            <td class="blockchain-address">
              {{ userInfo.address }}
            </td>
            <td>{{ parseInt(userInfo.duration/(3600*24)) }}</td>
            <td>{{ parseFloat(userInfo.xnos / 1e6).toFixed() }}</td>
            <td>{{ calculateTier(userInfo.rank).tier.tier }}</td>
          </tr>
          <tr
            v-for="(user, index) in leaderboard"
            :key="user.address"
            :class="{'user-ranking': userInfo && userInfo.rank === (rankings[index] + 1),
                     'first-in-tier' : calculateTier(rankings[index] + 1).firstInTier}"
          >
            <td :class="['rank-' + (rankings[index] + 1) ]">
              <span>{{ rankings[index] + 1 }}</span>
            </td>
            <td class="blockchain-address">
              {{ user.address }}
            </td>
            <td>{{ parseInt(user.duration/(3600*24)) }}</td>
            <td>{{ parseFloat(user.xnos / 1e6).toFixed() }}</td>
            <td>{{ calculateTier(rankings[index] + 1).tier.tier }}</td>
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
            v-if="leaderboard && userInfo && userInfo.rank > rankings[leaderboard.length - 1] + 1"
            class="user-ranking"
          >
            <td :class="{'ranking-jump-up' : userInfo.rank > rankings[leaderboard.length - 1] + 2}">
              <span>{{ userInfo.rank }}</span>
            </td>
            <td class="blockchain-address">
              {{ userInfo.address }}
            </td>
            <td>{{ parseInt(userInfo.duration/(3600*24)) }}</td>
            <td>{{ parseFloat(userInfo.xnos / 1e6).toFixed() }}</td>
            <td>{{ calculateTier(userInfo.rank).tier.tier }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <pagination-helper
      v-if="leaderboard && leaderboard.length > 0 && pagination"
      class="mt-5"
      :total-pages="Math.ceil(parseInt(pagination.total) / parseInt(pagination.perPage))"
      :per-page="parseInt(pagination.perPage)"
      :current-page="parseInt(pagination.currentPage)"
      @pagechanged="getLeaderboard"
    />
  </section>
</template>
<script>
import PaginationHelper from '@/components/Pagination/PaginationHelper.vue';
export default {
  components: { PaginationHelper },
  middleware: 'auth',
  data () {
    return {
      loading: false,
      leaderboard: null,
      queryPage: this.$route.query.page || 1,
      pagination: null,
      userInfo: null,
      perPage: 20,
      tiers: null
    };
  },

  mounted () {
    this.getLeaderboard(this.queryPage);
  },
  methods: {
    gotoTier (tier) {
      let page;
      if (this.pagination) {
        if (tier.tier === 1) {
          page = 1;
        } else {
          const percentage = this.tiers.filter(s => s.tier !== tier.tier && s.tier < tier.tier)
            .reduce((a, o) => a + (o.percentage ? o.percentage : 0), 0) / 100;
          const top = this.tiers.find(t => t.tier === 1).number;
          const position = percentage * (this.pagination.total - top) + top;
          page = Math.ceil(position / parseInt(this.pagination.perPage));
        }
        if (page !== parseInt(this.pagination.currentPage)) {
          this.getLeaderboard(page);
          this.$router.replace({ query: { page } });
        }
      }
    },
    calculateTier (rank) {
      const tier = this.calculateTierWithoutEdge(rank);
      const previousTier = this.calculateTierWithoutEdge(rank - 1);
      const firstInTier = previousTier !== tier;
      return { tier, firstInTier };
    },
    calculateTierWithoutEdge (rank) {
      if (!this.tiers || !rank) { return null; };
      let rankPercentage;
      let tier;
      if (rank > this.tiers.find(t => t.tier === 1).number) {
        rankPercentage = ((rank - this.tiers.find(t => t.tier === 1).number) /
                (this.pagination.total - this.tiers.find(t => t.tier === 1).number) * 100).toFixed();
      } else {
        tier = this.tiers.find(t => t.tier === 1);
      }
      if (!tier) {
        let percentage = 0;
        for (let i = 1; i < this.tiers.length; i++) {
          percentage += this.tiers[i].percentage;
          if (rankPercentage <= percentage) {
            tier = this.tiers[i];
            break;
          }
        }
      }
      return tier;
    },
    async getLeaderboard (page) {
      try {
        const leaderboard = await this.$axios.$get(
          `/stake/leaderboards?page=${page}&limit=${this.perPage}`
        );
        this.leaderboard = leaderboard.stakes.data;
        this.userInfo = leaderboard.user;
        this.pagination = leaderboard.stakes.pagination;
        this.tiers = leaderboard.tiers;
        this.rankings = [...Array(parseInt(this.pagination.perPage)).keys()].map(i => i + this.pagination.from);
      } catch (error) {
        console.error(error);
      }
    }
  }
};
</script>
<style scoped lang="scss">
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

.box {
  &:hover {
    border: 1px solid $accent;
  }
}

tr {
  &.first-in-tier {
    border-top: 3px dashed $accent;
  }
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
.rank-1 span:first-child {
  font-size: 18px;
  &:after {
    background: #F2C94C;
  }
}

.rank-2 span:first-child {
  font-size: 18px;
  &:after {
    background: #D7D7D7;
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
.ranking-jump-down {
  position:relative;
  &:before {
    content: '⋮';
    position: absolute;
    display: block;
    bottom: -15px;
    left: 15px;
    z-index: 1;
  }
}

.rank-3 span:first-child {
  font-size: 18px;
  &:after {
    background: #F2994A;
  }
}
</style>
