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
          <code-editor v-model="repository.pipeline" />
          <div class="field">
            <label class="label">Trigger branches (comma seperated)</label>
            <div class="control">
              <input v-model="repository.branches" required class="input" type="text" placeholder="main,master">
            </div>
          </div>
          <label class="label">Choose market</label>
          <div class="select">
            <select v-model="repository.market" required>
              <option
                v-for="(market, index) in markets"
                :key="market.publicKey"
                :value="market.publicKey"
              >
                Market #{{ index+1 }} - Job price: {{ parseInt(market.account.jobPrice, 16) / 1e6 }} NOS
              </option>
            </select>
          </div>
          <div class="field">
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
      markets: null
    };
  },
  created () {
    this.getUser();
    this.getMarkets();
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
          market: this.repository.market,
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
        this.markets = await this.$axios.$get('/repositories/markets');
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
