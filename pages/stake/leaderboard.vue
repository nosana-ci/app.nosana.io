<template>
  <section class="section">
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
            <td><span>{{ parseInt(userInfo.duration/(3600*24)) }}</span></td>
            <td>{{ parseFloat(userInfo.xnos / 1e6).toFixed() }}</td>
          </tr>
          <tr
            v-for="(user, index) in leaderboard"
            :key="user.address"
            :class="{'user-ranking': userInfo && userInfo.rank === (rankings[index] + 1)}"
          >
            <td :class="['rank-' + (rankings[index] + 1) ]">
              <span>{{ rankings[index] + 1 }}</span>
            </td>
            <td class="blockchain-address">
              {{ user.address }}
            </td>
            <td><span>{{ parseInt(user.duration/(3600*24)) }}</span></td>
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
            v-if="leaderboard && userInfo && userInfo.rank > rankings[leaderboard.length - 1] + 1"
            class="user-ranking"
          >
            <td :class="{'ranking-jump-up' : userInfo.rank > rankings[leaderboard.length - 1] + 2}">
              <span>{{ userInfo.rank }}</span>
            </td>
            <td class="blockchain-address">
              {{ userInfo.address }}
            </td>
            <td><span>{{ parseInt(userInfo.duration/(3600*24)) }}</span></td>
            <td>{{ parseFloat(userInfo.xnos / 1e6).toFixed() }}</td>
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
      perPage: 20
    };
  },

  mounted () {
    this.getLeaderboard(this.queryPage);
  },
  methods: {
    async getLeaderboard (page) {
      try {
        const leaderboard = await this.$axios.$get(
          `/stake/leaderboards?page=${page}&limit=${this.perPage}`
        );
        this.leaderboard = leaderboard.stakes.data;
        this.userInfo = leaderboard.user;
        this.pagination = leaderboard.stakes.pagination;
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
