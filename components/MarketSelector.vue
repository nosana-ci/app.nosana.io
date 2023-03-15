<template>
  <div>
    <div v-if="user && (user.roles && user.roles.includes('admin'))" class="market-selector py-3">
      <h4 class="title is-5 settings-title mb-5 mt-5">
        Select a market (admin)
      </h4>
      <table class="table is-hoverable is-striped has-radius">
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
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(market) in markets"
            :key="market.publicKey"
            :value="market.publicKey"
            class="p-5 market-row"
            :class="{'has-background-accent': selectedMarket && market.publicKey === selectedMarket.publicKey}"
            @click="$emit('select-market', market), selectedMarket = market"
          >
            <td class="py-3">
              <a
                style="max-width: 185px;"
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
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="selectedMarket && selectedMarket.publicKey === communityMarketId" class="has-text-accent pt-2">
      Your CI/CD jobs will run on the Nosana Community Tier.<br>
      This is a free Tier that will run on a best-effort basis.
    </p>
  </div>
</template>

<script>

export default {
  props: {
    repository: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      communityMarketId: process.env.NUXT_ENV_COMMUNITY_MARKET_ID,
      user: null,
      markets: null,
      selectedMarket: null
    };
  },
  mounted () {
    this.getUser();
    this.getMarkets();
  },
  methods: {
    async getUser () {
      try {
        const user = await this.$axios.$get('/user');
        this.user = user;
      } catch (error) {
        console.error(error);
      }
    },
    async getMarkets () {
      try {
        console.log('repo', this.repository);
        const markets = await this.$axios.$get('/markets');
        // sort by job price
        this.markets = markets.sort((a, b) => parseInt(a.account.jobPrice, 16) - parseInt(b.account.jobPrice, 16));
        if (this.repository) {
          this.selectedMarket = this.markets.find(e => e.publicKey === this.repository.market);
        } else {
          this.selectedMarket = this.markets.find(e => e.publicKey === this.communityMarketId);
        }
        this.$emit('select-market', this.selectedMarket);
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
<style scoped lang="scss">
.market-selector {
  table {
    max-width: 800px;
    width: 100%;
    border: 1px solid #F2F5F1;
  }
  tr.has-background-accent {
    color: $white;
    a {
      color: $white;
    }
  }
  .market-row {
    cursor: pointer;
    &:hover {
      background-color: $grey-light !important;
    }
    &.has-background-accent:hover {
      background-color: $accent !important;
    }
  }
}
</style>
