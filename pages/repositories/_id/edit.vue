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

          <div class="tabs mt-3">
            <ul>
              <li
                class="px-3"
                :class="{'is-active': activeTab === 'general'}"
                @click="activeTab = 'general'"
              >
                <a class="p-3">General</a>
              </li>
              <li
                v-if="repository.pipeline && repository.pipeline.length"
                class="px-3"
                :class="{'is-active': activeTab === 'pipeline'}"
                @click="activeTab = 'pipeline'"
              >
                <a class="p-3">Pipeline</a>
              </li>
            </ul>
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
      activeTab: 'general'
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
