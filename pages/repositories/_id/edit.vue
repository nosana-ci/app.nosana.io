<template>
  <section class="section py-4">
    <div class="container">
      <nuxt-link :to="`/repositories/${id}`" class="has-text-accent has-text-weight-semibold">
        <i class="fas fa-chevron-left" /> Back
      </nuxt-link>
      <form v-if="repository" class="mt-2" @submit.prevent="edit">
        <div class="is-flex-desktop is-align-items-flex-start is-justify-content-space-between mb-4">
          <div>
            <h2 class="title mb-2">
              Settings
            </h2>
            <p>
              <a :href="'https://github.com/'+ repository.repository" target="_blank" @click.stop>https://github.com/{{ repository.repository }}</a>
            </p>
          </div>
          <div class="buttons">
            <nuxt-link :to="`/repositories/${id}/pipeline`" class="button is-accent px-5 is-outlined">
              Pipeline
            </nuxt-link>
            <nuxt-link :to="`/repositories/${id}/secrets`" class="button is-accent px-5 is-outlined">
              Secrets
            </nuxt-link>
            <nuxt-link :to="`/repositories/${id}/edit`" class="button is-accent px-5">
              Settings
            </nuxt-link>
          </div>
        </div>

        <div v-if="activeTab === 'general'">
          <market-selector v-if="repository" :repository="repository" @select-market="selectMarket" />
          <div class="field py-3">
            <div class="control">
              <label class="checkbox">
                <input v-model="repository.enable_check_runs" type="checkbox">
                Enable Github Check-Runs
              </label>
            </div>
          </div>
        </div>
        <div v-if="activeTab === 'pipeline'">
          <code-editor
            v-model="repository.pipeline"
            class="py-3 pt-4"
          />
          <div class="field py-3">
            <label class="label">Trigger branches (comma seperated)</label>
            <div class="control">
              <input v-model="repository.branches" required class="input" type="text" placeholder="main,master">
            </div>
          </div>
        </div>
        <div class="control">
          <button type="submit" class="button is-accent is-wide" :disabled="!selectedMarket">
            Save
          </button>
        </div>
      </form>
      <div v-else>
        Loading..
      </div>
    </div>
    <!-- TODO: make this in modalpopup component-->
    <div class="modal" :class="{'is-active' : successPopup}">
      <div class="modal-background" />
      <div
        class="modal-content has-background-white has-text-centered mx-3 pt-6 pb-5 has-radius-medium
      has-limited-width-small"
      >
        <img
          :src="require(`@/assets/img/icons/saved.svg`)"
        >
        <h3 class="title is-3 mb-3">
          Saved!
        </h3>
        <p>
          Successfully updated repository.
        </p>
        <button class="button is-accent mt-5 is-less-wide mb-3" @click="$router.push(`/repositories/${id}`);">
          OK
        </button>
      </div>
    </div>
  </section>
</template>

<script>
import MarketSelector from '@/components/MarketSelector.vue';

export default {
  components: { MarketSelector },
  middleware: 'auth',
  data () {
    return {
      id: this.$route.params.id,
      repository: null,
      user: null,
      selectedMarket: null,
      activeTab: 'general',
      successPopup: false
    };
  },
  created () {
    this.getUser();
  },
  methods: {
    async edit () {
      try {
        const updateData = {
          pipeline: this.repository.pipeline,
          market: this.selectedMarket.publicKey,
          branches: this.repository.branches,
          enable_check_runs: this.repository.enable_check_runs
        };
        if (this.repository.pipeline && this.repository.pipeline.length) {
          updateData.pipeline = this.repository.pipeline;
        }

        await this.$axios.$post(`/repositories/${this.id}`, updateData);
        this.successPopup = true;
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
