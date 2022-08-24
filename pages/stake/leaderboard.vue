<template>
  <section class="section">
    <h3 class="title is-4">
      Leaderboard
    </h3>
    <div v-if="tiers" class="is-flex is-flex-wrap-wrap">
      <div
        v-for="slide in tiers"
        :key="slide.tier"
        :index="tiers.length - slide.tier"
        class="column tier-select"
      >
        <div
          class="box is-clickable has-background-light has-shadow has-radius p-0"
          @click="gotoTier(slide)"
        >
          <div class="columns is-mobile is-gapless">
            <div class="column is-flex is-flex-direction-column">
              <div class="pl-3 py-3 pr-0 tier-wrapper">
                <div class="subtitle has-text-accent mb-0">
                  <span class="is-size-7-touch">Tier</span><br class="is-hidden-desktop"> {{ slide.tier }}
                </div>
                <div class="title is-5 mb-1 is-hidden-touch mt-2">
                  {{ slide.name }}
                </div>
                <div style="line-height: 1" class="is-hidden-touch">
                  <span class="is-size-7">
                    <small>Top</small>
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
              </div>
            </div>
            <div class="column is-narrow is-hidden-touch">
              <img :src="require(`@/assets/img/tiers/tier${slide.tier}.svg`)" style="height: 130px;">
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="leaderboard && leaderboard.length > 0"
      class="table-container has-background-light p-5 mb-0  has-radius-medium"
    >
      <table class="table is-striped is-fullwidth is-hoverable mb-3">
        <thead>
          <tr>
            <th>Place</th>
            <th>Address</th>
            <th>Unstake days</th>
            <th>xNOS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="leaderboard && userInfo && userInfo.rank < rankings[0] + 1" class="user-ranking">
            <td
              class="is-family-monospace"
              :class="{'ranking-jump-down' : userInfo.rank < rankings[0] - 2}"
            >
              <span>{{ userInfo.rank }}</span>
            </td>
            <td class="blockchain-address">
              tt{{ userInfo.address }}
            </td>
            <td class="is-family-monospace">
              {{ parseInt(userInfo.duration/(3600*24)) }}
            </td>
            <td class="is-family-monospace">
              {{ parseFloat(userInfo.xnos / 1e6).toFixed() | formatNumber }}
            </td>
          </tr>
          <template
            v-for="(user, index) in leaderboard"
          >
            <tr
              v-if="calculateTier(rankings[index] + 1).firstInTier || index === 0"
              :key="user.address + 1"
              class="has-background-dark"
            >
              <td colspan="4" style="text-align:center;position:relative">
                <figure class="image is-32x32" style="position: absolute;top: 2px;">
                  <img
                    class="is-rounded"
                    :src="
                      require(
                        `@/assets/img/tiers/icons/small/tier${calculateTierWithoutEdge(rankings[index] + 1).tier}.svg`)"
                    style="height: 20px"
                  >
                </figure>

                Tier {{ calculateTierWithoutEdge(rankings[index] + 1).tier }}
              </td>
            </tr>
            <tr
              :key="user.address"
              :class="{'user-ranking': userInfo && userInfo.rank === (rankings[index] + 1)}"
            >
              <td class="is-family-monospace" :class="['rank-' + (rankings[index] + 1) ]">
                <span>{{ rankings[index] + 1 }}</span>
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
          </template>
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
            <td
              class="is-family-monospace"
              :class="{'ranking-jump-up' : userInfo.rank > rankings[leaderboard.length - 1] + 2}"
            >
              <span>{{ userInfo.rank }}</span>
            </td>
            <td class="blockchain-address">
              {{ userInfo.address }}
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
  filters: {
    formatNumber (num) {
      return Number(num).toLocaleString('en-US');
    }
  },
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
      let tier;
      const top = this.tiers.find(t => t.tier === 1).number;
      const tierUsers = this.tiers.filter(t => t.tier !== 1)
        .map(t => ({ ...t, users: Math.ceil(t.percentage / 100.0 * (this.pagination.total - top)) }));
      if (rank > top) {
        let requiredRank = 0;
        for (let i = 0; i < tierUsers.length; i++) {
          requiredRank += tierUsers[i].users;
          if (rank - top <= requiredRank) {
            tier = this.tiers.find(t => t.tier === tierUsers[i].tier);
            break;
          }
        }
      } else {
        tier = this.tiers.find(t => t.tier === 1);
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
@import "bulma/sass/utilities/mixins";
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
.tier-select {
  min-width: 250px;
  max-width: 20%
}
@include touch {
 .tier-select {
  padding: 5px;
  min-width: fit-content;
  .box {
    box-shadow: none;
  }
  .tier-wrapper {
    text-align: center;
    padding: 2px 5px !important;
  }
  max-width: 20%
}
}
.box {
  &:hover {
    border: 1px solid $accent;
  }
}

tr {
  &.first-in-tier {
    position: relative;
    border-top: 3px dashed $accent;
    &:before {
      content: "Tier";
      display: block;
      position: absolute;
      width:100%;
      background: $grey;
    }
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
