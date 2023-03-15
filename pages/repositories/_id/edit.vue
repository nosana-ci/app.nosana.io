<template>
  <section class="section py-4">
    <div class="container">
      <nuxt-link :to="`/repositories/${id}`" class="has-text-accent has-text-weight-semibold">
        <i class="fas fa-chevron-left" /> Back
      </nuxt-link>
      <form v-if="repository" class="mt-2" @submit.prevent="edit">
        <div class="is-flex-desktop is-align-items-flex-start is-justify-content-space-between mb-4">
          <div>
            <h2 class="title mb-1">
              Settings
            </h2>
            <p class="is-size-7">
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

        <div v-if="activeTab === 'general'" class="mt-5">
          <market-selector v-if="repository" :repository="repository" class="pb-4" @select-market="selectMarket" />
          <h4 class="title is-5 settings-title mb-4 mt-5">
            Github Check-Runs
          </h4>
          <div class="field pb-4">
            <div class="control is-flex">
              <label class="checkbox mx-2 pt-1">
                <input v-model="repository.enable_check_runs" type="checkbox">
              </label>
              <div>
                <p class="has-text-weight-semibold">
                  Enable Github Check-Runs
                </p>
                <p class="is-size-7">
                  Creates a Github Check-Run for every job in this repository.
                </p>
              </div>
            </div>
          </div>

          <h4 class="title is-5 settings-title mt-5 mb-4">
            Repository Status <span class="is-size-7">(<span
              class="has-text-weight-semibold"
              :class="{'has-text-danger' : repository.status === 'DEACTIVATED',
                       'has-text-accent' : repository.status !== 'DEACTIVATED'}"
            >{{ repository.status !== 'DEACTIVATED' ? 'ACTIVE' : 'DEACTIVATED' }}</span>)</span>
          </h4>
          <div class="settings-block">
            <div v-if="repository.status === 'DEACTIVATED'">
              <p>Your repository is deactivated. Reactivate your repository to run your pipelines on Nosana.</p>
              <button class="button is-success is-outlined" @click.prevent="activateRepo">
                (Re)activate repository
              </button>
            </div>
            <div v-else>
              <p>When the repository is deactivated, commits won't trigger new Nosana jobs.</p>
              <button class="button is-danger is-light mt-2" @click.prevent="deactivateRepo">
                Deactivate repository
              </button>
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
        <div class="control mt-6">
          <button type="submit" class="button is-accent is-wide" :disabled="!selectedMarket">
            Save
          </button>
        </div>
      </form>
      <div v-else>
        Loading..
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
          title: 'Saved!',
          text: 'Successfully updated repository.',
          image: 'icons/saved.svg',
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
    },
    async deactivateRepo () {
      try {
        await this.$modal.show({
          color: 'warning',
          text:
          'When you deactivate your repository your new commits in this repository won\'t trigger new jobs. \n\n' +
          'You can always reactivate a repository.',
          title: 'Are you sure you want to deactivate this repository?',
          onConfirm: async () => {
            await this.$axios.$post(`/repositories/${this.id}`, { status: 'DEACTIVATED' });
            this.$modal.show({
              color: 'success',
              title: 'Deactivated repository'
            });
            this.$router.push(`/repositories/${this.id}`);
          }
        });
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Something went wrong, please try again later.'
        });
      }
    },
    async activateRepo () {
      await this.$axios.$post(`/repositories/${this.id}`, { status: 'PENDING' });
      this.$modal.show({
        color: 'success',
        title: 'Saved!',
        text: 'Successfully activated repository.',
        image: 'icons/saved.svg',
        onConfirm: () => {
          this.$router.push(`/repositories/${this.id}`);
        }
      });
    }
  }
};
</script>
<style lang="scss">
.settings-title {
  border-bottom: 1px solid $grey-darker;
  width: 100%;
  padding-bottom: 8px;
}
</style>
