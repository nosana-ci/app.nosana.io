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
          <market-selector v-if="repository" :repository="repository" @select-market="selectMarket" />
          <div class="field py-3">
            <div class="control">
              <label class="checkbox">
                <input v-model="repository.enable_check_runs" type="checkbox">
                Enable Github Check-Runs
              </label>
            </div>
          </div>
          <div class="control">
            <button type="submit" class="button is-accent" :disabled="!selectedMarket">
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
import MarketSelector from '../../../components/MarketSelector.vue';

export default {
  components: { MarketSelector },
  middleware: 'auth',
  data () {
    return {
      id: this.$route.params.id,
      repository: null,
      user: null,
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
        // TODO: change for nice yaml scheme checker
        if (!pipeline.global) {
          throw new Error('Your yaml does not include a `global` config');
        }
        if (!pipeline.nosana) {
          throw new Error('Your yaml does not include a `nosana` config');
        }
        if (!pipeline.jobs || !Array.isArray(pipeline.jobs) || !pipeline.jobs.length) {
          throw new Error('Your yaml does not include a array `jobs` config');
        }
        if (!pipeline.global.trigger || !pipeline.global.trigger.branch) {
          throw new Error('Your yaml does not include a `global.trigger.branch` config');
        }
        if (!pipeline.global.image) {
          throw new Error('Your yaml does not include a `global.image` config');
        }
        if (!pipeline.nosana.description) {
          throw new Error('Your yaml does not include a `nosana.description` config');
        }
        pipeline.jobs.forEach((job, index) => {
          if (!job.name) {
            throw new Error(`Job ${index + 1} does not include a 'name'`);
          }
          if (!job.commands || !Array.isArray(job.commands) || !job.commands.length) {
            throw new Error(`Job ${index + 1} does not include a 'commands' array`);
          }
        });

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
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    selectMarket (market) {
      this.selectedMarket = market;
    }
  }
};
</script>
