<template>
  <section class="section admin-page">
    <div class="container">
      <h1 class="title is-4">
        Job <span class="has-text-accent">markets</span>
      </h1>
      <p class="has-limited-width-small mb-6" />
      <div v-if="user && (user.roles && user.roles.includes('admin'))">
        <nuxt-link to="/markets/new" class="button is-accent is-outlined is-pulled-right">
          Add a new market
        </nuxt-link>
      </div>
      <div class="block">
        <h2 class="subtitle has-text-weight-bold">
          <span v-if="markets !== null">{{
            markets.length
          }}</span><span v-else>...</span> markets
        </h2>
      </div>
      <div v-if="loading" class="has-text-centered subtitle">
        <progress class="progress is-small is-primary" max="100">
          Loading...
        </progress>
      </div>
      <div class="table-container">
        <table class="table is-fullwidth is-striped is-hoverable">
          <thead>
            <tr>
              <th class="is-size-7 py-2 px-3">
                Public key
              </th>
              <th class="is-size-7 py-2 px-3">
                Job price
              </th>
              <th class="is-size-7 py-2 px-3">
                Job timeout
              </th>
              <th class="is-size-7 py-2 px-3">
                Nodes in the queue
              </th>
              <th class="is-size-7 py-2 px-3">
                Jobs in the queue
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="market in paginatedMarkets"
              :key="market.publicKey"
              class="is-size-6"
              @click="$router.push(`/markets/${market.publicKey}`)"
            >
              <td class="py-3">
                <a
                  style="max-width: 200px;"
                  class="blockchain-address"
                  target="_blank"
                  :href="$sol.explorer + '/address/' + market.publicKey"
                >{{ market.publicKey }}</a>
              </td>
              <td class="py-3">
                {{ parseInt(market.account.jobPrice, 16) / 1e6 }} NOS
              </td>
              <td class="py-3">
                {{ parseInt(market.account.jobTimeout, 16) / 60 }} min
              </td>
              <td class="py-3">
                <span v-if="market.account.queueType === 1">{{ market.account.queue.length }}</span>
                <span v-else>-</span>
              </td>
              <td class="py-3">
                <span v-if="market.account.queueType === 0">{{ market.account.queue.length }}</span>
                <span v-else>-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <pagination-helper
        v-if="markets && markets.length > 0 && pagination"
        :total-pages="Math.ceil(markets.length / pagination.perPage)"
        :per-page="pagination.perPage"
        :current-page="parseInt(pagination.currentPage)"
        @pagechanged="setPage"
      />
    </div>
  </section>
</template>

<script>
import PaginationHelper from '@/components/Pagination/PaginationHelper.vue';

export default {
  components: {
    PaginationHelper
  },
  middleware: 'auth',
  data () {
    return {
      markets: null,
      error: null,
      loading: false,
      search: '',
      pagination: {
        perPage: 10,
        currentPage: 1
      },
      user: null
    };
  },
  computed: {
    paginatedMarkets () {
      const start = (this.pagination.currentPage - 1) * this.pagination.perPage;
      if (this.markets) {
        return this.markets.slice(start, start + this.pagination.perPage);
      }
      return [];
    }
  },
  mounted () {
    this.getMarkets();
    this.getUser();
  },
  methods: {
    setPage (newPage) {
      this.pagination.currentPage = newPage;
    },
    async getUser () {
      try {
        const user = await this.$axios.$get('/user');
        this.user = user;
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    async getMarkets () {
      try {
        const markets = await this.$axios.$get('/markets');
        // sort by job price
        this.markets = markets.sort((a, b) => parseInt(a.account.jobPrice, 16) - parseInt(b.account.jobPrice, 16));
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
  tr {
    cursor: pointer;
  }
</style>
