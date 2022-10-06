<template>
  <section class="section admin-page">
    <div class="container">
      <h2 class="subtitle mt-6">
        Markets
      </h2>
      <div class="block">
        <h2 class="subtitle has-text-weight-bold">
          <span v-if="markets !== null">{{
            markets.length
          }}</span><span v-else>...</span> markets
          <a @click="getMarkets"><small class="is-size-7">Refresh</small></a>
        </h2>
      </div>
      <form
        @submit.prevent="
          page = 1;
          getMarkets();
        "
      >
        <div class="field has-addons">
          <div class="control">
            <input
              v-model="search"
              class="input"
              type="text"
              placeholder="Search.."
            >
          </div>
          <div class="control">
            <button class="button is-info" type="submit">
              Search
            </button>
          </div>
        </div>
      </form>

      <br>

      <div v-if="loading" class="has-text-centered subtitle">
        <progress class="progress is-small is-primary" max="100">
          Loading
        </progress>
      </div>
      <div class="table-container">
        <table class="table is-fullwidth is-striped is-hoverable">
          <thead>
            <tr>
              <th class="is-size-7 py-2 px-3">
                Public Key
              </th>
              <th class="is-size-7 py-2 px-3">
                Job Price
              </th>
              <th class="is-size-7 py-2 px-3">
                Job Timeout
              </th>
              <th class="is-size-7 py-2 px-3">
                Nodes in Queue
              </th>
              <th class="is-size-7 py-2 px-3">
                Jobs in Queue
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="market in paginatedMarkets"
              :key="market.publicKey"
              class="is-size-7"
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
                -
              </td>
              <td class="py-3">
                -
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
      }
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
  },
  methods: {
    setPage (newPage) {
      this.pagination.currentPage = newPage;
    },
    async getMarkets () {
      try {
        const markets = await this.$axios.$get('/repositories/markets');
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
</style>
