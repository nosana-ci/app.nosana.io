<template>
  <div>
    <section class="section">
      <div class="columns">
        <div class="column is-4">
          <h1 class="title is-4">
            Projects on <b v-if="network === 'devnet'" class="has-text-accent">DevNet</b>
            <b v-else class="has-text-accent">TestNet</b>
          </h1>
          <p class="has-limited-width-small">
            If it works in a container, it works on the Nosana Network.
            We can run any container command, letting you ship faster than ever before.
            All you have to do right now is connect your GitHub account and request your funds.
            If you have a valid account, we try to release the free testnet credits within 5 days.
            Feel free to reach out to <a href="mailto:team@nosana.io">team@nosana.io</a> if you have any questions.
          </p>
        </div>
        <div v-if="!user || !user.firstName" class="column is-8">
          <div class="columns">
            <div class="column is-one-third">
              <a
                class="box is-secondary step"
                :class="{'has-background-white': loggedIn}"
                @click="$sol.loginModal = true"
              >
                <div class="is-flex is-justify-content-space-between">
                  <div>1</div>
                  <div v-if="loggedIn">
                    <img :src="require('@/assets/img/icons/done.svg')">
                  </div>
                  <div v-else>
                    <img :src="require('@/assets/img/icons/pending.svg')">
                  </div>
                </div>
                <div class="has-text-centered my-2">
                  <img src="~assets/img/icons/wallet.svg">
                  <p>Connect Wallet</p>
                </div>
              </a>
            </div>
            <div class="column is-one-third">
              <nuxt-link
                class="box is-secondary step"
                :class="{'has-background-white': user && repositories
                           && repositories.filter(r => r.user_id === user.user_id).length,
                         'disabled': !loggedIn}"
                to="/repositories/new"
              >
                <div class="is-flex is-justify-content-space-between">
                  <div>2</div>
                  <div v-if="user && repositories && repositories.filter(r => r.user_id === user.user_id).length">
                    <img :src="require('@/assets/img/icons/done.svg')">
                  </div>
                  <div v-else>
                    <img :src="require('@/assets/img/icons/pending.svg')">
                  </div>
                </div>
                <div class="has-text-centered my-2">
                  <img v-if="loggedIn" src="~assets/img/icons/repository.svg">
                  <img v-else src="~assets/img/icons/repository_grey.svg">
                  <p>Add Repository</p>
                </div>
              </nuxt-link>
            </div>
            <div class="column is-one-third">
              <nuxt-link
                to="/account/edit"
                class="box is-secondary step"
                :class="{'has-background-white': user && repositories
                           && repositories.filter(r => r.user_id === user.user_id).length,
                         'disabled': !(loggedIn && user && repositories
                           && repositories.filter(r => r.user_id === user.user_id).length)}"
              >
                <div class="is-flex is-justify-content-space-between">
                  <div>3</div>
                  <div v-if="user && user.isApproved">
                    <img :src="require('@/assets/img/icons/done.svg')">
                  </div>
                  <div v-else-if="user && user.firstName">
                    <img :src="require('@/assets/img/icons/running.svg')">
                  </div>
                  <div v-else>
                    <img :src="require('@/assets/img/icons/pending.svg')">
                  </div>
                </div>
                <div class="has-text-centered my-2">
                  <img
                    v-if="loggedIn && user && repositories &&
                      repositories.filter(r => r.user_id === user.user_id).length"
                    src="~assets/img/icons/project.svg"
                  >
                  <img v-else src="~assets/img/icons/project_grey.svg">
                  <p>Request Funds</p>
                </div>
              </nuxt-link>
            </div>
          </div>
        </div>
        <template v-else>
          <div class="column is-2">
            <div class="box">
              <small>TestNet Balance</small>
              <div class="has-text-weight-semibold">
                <span
                  v-if="!balance && balance !== 0"
                >...</span>
                <span v-else>{{ Math.trunc(balance*10000)/10000 }}</span> <span class="has-text-accent">NOS</span>
              </div>
            </div>
          </div>
          <div class="column is-2">
            <div class="box">
              <small>Used for Jobs</small>
              <div class="has-text-weight-semibold">
                {{ usedBalance }} <span class="has-text-accent">NOS</span>
              </div>
            </div>
          </div>
          <div class="column is-2">
            <div class="box">
              <small>NOS Rewards</small>
              <div class="has-text-weight-semibold">
                {{ reward }} <span class="has-text-accent">NOS</span>
              </div>
            </div>
          </div>
        </template>
      </div>
      <div v-if="user" class="mb-6">
        <nuxt-link to="/repositories/new" class="button is-accent is-outlined is-pulled-right">
          Add new repository
        </nuxt-link>
        <h2 class="subtitle has-text-weight-semibold">
          Your Repositories
        </h2>

        <repository-list :repositories="userRepositories" />
      </div>
      <div class="is-flex is-justify-content-space-between has-background-light columns p-2">
        <div style="max-width: 100%; width: 400px">
          <input v-model="search" class="input" placeholder="search repositories">
        </div>
        <nuxt-link to="/repositories/new" class="button is-accent is-small has-text-white">
          + Add new repository
        </nuxt-link>
      </div>
      <div v-if="repositories" class="columns is-multiline mt-4 has-background-light">
        <div v-if="!filteredRepositories.length" class="has-text-centered subtitle">
          No repositories found..
        </div>
        <template v-for="repository in filteredRepositories">
          <div :key="repository.id" class="column is-6 is-3-fullhd is-3-widescreen is-4-desktop">
            <a class="box has-background-white is-clickable" @click="$router.push('/repositories/'+repository.id)">
              <div class="is-flex is-align-items-flex-start is-justify-content-flex-start">
                <div class="project-icon mr-4">
                  <img style="height: 32px" :src="repository.image">
                </div>
                <div>
                  <h2 class="title is-6 has-text-weight-semibold" style="min-height: 36px">
                    <span v-html="repository.repository.split('/').join('/<br>')" />
                  </h2>
                  <h2 class="subtitle is-6 mb-1">
                    <span>{{ repository.name }}</span>
                  </h2>
                  <p class="is-size-7 has-overflow-ellipses" style="height: 40px;">
                    <span>{{ repository.description }}</span>
                  </p>
                </div>
              </div>

              <div class="mt-2">
                <span v-if="repositories">
                  <div v-if="!repository.commits.length">
                    no pipelines
                  </div>
                  <div
                    v-else
                    class="is-flex is-align-items-flex-end"
                  >
                    <div class="mr-2">
                      <div
                        class="tag is-small"
                        :class="{
                          'is-accent': repository.commits[0].status === 'COMPLETED',
                          'is-info': repository.commits[0].status === 'RUNNING',
                          'is-warning': repository.commits[0].status === 'QUEUED',
                          'is-danger': repository.commits[0].status === 'FAILED'
                        }"
                      >{{ repository.commits[0].status }}</div>
                      <div class="is-size-7">
                        {{ $moment(repository.commits[0].updated_at ).fromNow() }}
                      </div>
                    </div>
                    <div
                      v-for="commit in repository.commits.slice().reverse()"
                      :key="commit.id"
                      class="mx-1"
                      @click.stop=""
                    >
                      <nuxt-link :to="`/jobs/${commit.id}`">
                        <commit-status
                          :status="commit.status"
                          class="has-tooltip-arrow"
                          :data-tooltip="commit.commit.substring(0,7)"
                        />
                      </nuxt-link>
                    </div>
                  </div>
                </span>
                <span v-else>Loading..</span>
              </div>
            </a>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>

<script>

export default {
  data () {
    return {
      repositories: null,
      projects: null,
      user: null,
      userRepositories: null,
      balance: null,
      usedBalance: null,
      search: null,
      interval: null,
      network: process.env.NUXT_ENV_SOL_NETWORK
    };
  },
  computed: {
    reward () {
      let reward = 0;
      if (this.balance > 0) {
        reward += 500;
      }

      return Math.min(reward + this.usedBalance, 10000);
    },
    loggedIn () {
      return this.$auth && this.$auth.loggedIn;
    },
    filteredRepositories () {
      let filteredRepositories = this.repositories;
      // Search campaigns
      if (filteredRepositories && this.search !== null) {
        filteredRepositories =
        filteredRepositories.filter(r => r.repository.toLowerCase().includes(this.search.toLowerCase()) ||
            (r.repository.description && r.repository.description.toLowerCase().includes(this.search.toLowerCase())) ||
            (r.repository.name && r.repository.name.toLowerCase().includes(this.search.toLowerCase())));
      }

      return filteredRepositories;
    }
  },
  watch: {
    '$auth.loggedIn' (loggedIn) {
      if (loggedIn) {
        this.getUser();
        this.getUserRepositories();
        this.getUserJobPrices();
      }
    }
  },
  created () {
    if (this.loggedIn) {
      this.getUser();
      this.getUserRepositories();
      this.getUserJobPrices();
    }
    this.getActiveRepositories();
    if (!this.interval) {
      this.interval = setInterval(() => {
        console.log('refreshing repositories..');
        this.getActiveRepositories();
      }, 20000);
    }
  },
  beforeDestroy () {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },
  methods: {
    async getUserJobPrices () {
      try {
        const totalCosts = await this.$axios.$get('/user/jobs/price');
        this.usedBalance = totalCosts / 1e6;
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    async getUserRepositories () {
      try {
        const repositories = await this.$axios.$get('/user/repositories');
        this.userRepositories = repositories;
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    async getUser () {
      try {
        const user = await this.$axios.$get('/user');
        this.user = user;
        this.balance = (await this.$sol.getNosBalance(this.user.generated_address)).uiAmount;
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    async getActiveRepositories () {
      try {
        const repositories = await this.$axios.$get('/repositories/active');
        this.userRepositories = repositories;
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
.project-icon {
border-radius: 100%;
background: $secondary;
display:flex;
justify-content: center;
min-width: 75px;
height: 75px;
align-items: center;
border: 1px solid grey;
}
.step {
   min-height: 160px;
 }
</style>
