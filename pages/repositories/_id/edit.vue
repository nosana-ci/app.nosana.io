<template>
  <section class="section">
    <div class="container">
      <nuxt-link :to="`/repositories/${id}`">
        <i class="fas fa-chevron-left" /> Cancel
      </nuxt-link>
      <div class="mt-2">
        <form v-if="repository" @submit.prevent="edit">
          <div class="is-flex is-align-items-center">
            <h2 class="title">
              Edit {{ repository.repository }}
            </h2>
          </div>
          <p>
            <a :href="'https://github.com/'+ repository.repository" target="_blank" @click.stop>https://github.com/{{ repository.repository }}</a>
          </p>
          <code-editor v-model="repository.pipeline" class="py-3" />
          <div class="field py-3">
            <label class="label">Trigger branches (comma seperated)</label>
            <div class="control">
              <input v-model="repository.branches" required class="input" type="text" placeholder="main,master">
            </div>
          </div>
          <div class="market-selector py-3">
            <label class="label">Select a market</label>
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
                  :class="{'has-background-accent': market.publicKey === selectedMarket.publicKey}"
                  @click="selectedMarket = market"
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
          <div class="field py-3">
            <div class="control">
              <label class="checkbox">
                <input v-model="repository.enable_check_runs" type="checkbox">
                Enable Github Check-Runs
              </label>
            </div>
          </div>
          <div class="control">
            <button type="submit" class="button is-accent" :disabled="!markets || (markets && markets.length === 0)">
              Save
            </button>
          </div>
        </form>
        <div v-else>
          Loading..
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { parse } from 'yaml';

export default {
  middleware: 'auth',
  data () {
    return {
      id: this.$route.params.id,
      repository: null,
      user: null,
      markets: null,
      selectedMarket: null
    };
  },
  created () {
    this.getUser();
  },
  methods: {
    async edit () {
      try {
        const pipeline = parse(this.repository.pipeline);
        if (!pipeline.commands || !Array.isArray(pipeline.commands)) {
          throw new Error('Your yaml does not include a `commands` list');
        }
        if (!pipeline.image || typeof pipeline.image !== 'string') {
          throw new Error('Your yaml does not include a `image` string');
        }
        console.log(pipeline);
        await this.$axios.$post(`/repositories/${this.id}`, {
          pipeline: this.repository.pipeline,
          market: this.selectedMarket.publicKey,
          branches: this.repository.branches,
          enable_check_runs: this.repository.enable_check_runs
        });
        this.$modal.show({
          color: 'success',
          text: 'Successfully updated repository',
          title: 'Saved!',
          persistent: true,
          cancel: false,
          onConfirm: () => {
            this.$router.push(`/repositories/${this.id}`);
          }
        });
      } catch (error) {
        console.error(error);
        if (error.name === 'YAMLParseError') {
          this.$modal.show({
            color: 'danger',
            text: error,
            title: 'Could not parse YAML'
          });
        } else {
          this.$modal.show({
            color: 'danger',
            text: error,
            title: 'Could not parse YAML'
          });
        }
      }
    },
    async getUser () {
      try {
        const user = await this.$axios.$get('/user');
        this.user = user;
        await this.getRepository();
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
      if (!this.user || !this.repository || ((!this.user.roles || !this.user.roles.includes('admin')) && !this.user.user_id === this.repository.user_id)) {
        this.$router.push(`/repositories/${this.id}`);
      }
    },
    async getRepository () {
      try {
        this.repository = await this.$axios.$get(`/repositories/${this.id}`);
        this.getMarkets();
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
        this.selectedMarket = this.markets.find(e => e.publicKey === this.repository.market);
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
