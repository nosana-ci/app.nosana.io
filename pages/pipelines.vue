<template>
  <div>
    <section class="section">
      <div class="container">
        <span v-if="loading">Loading..</span>
        <div v-if="showTutorial && !loading">
          <div class="columns mt-3 is-centered has-text-centered">
            <div class="column is-12">
              <h1 class="title is-3">
                Get Started
              </h1>
              <p v-if="loggedIn" class="has-text-centered has-limited-width">
                Install the Nosana Github App, which will have read-only permission to your selected repositories.
                After you have installed the app, you can add your repositories and manage their pipelines.
                You can specify on which triggers (e.g. commits on the main branch) pipelines are automatically being
                posted to the blockchain
              </p>
              <p v-else class="has-text-centered has-limited-width">
                To get started with running pipelines on Nosana, create an account or login.
              </p>
            </div>
          </div>
          <div class="mt-4 has-text-centered">
            <div
              v-if="loggedIn"
              class="box has-background-light has-limited-width"
            >
              <div class="has-text-centered my-2">
                <h2 class="subtitle has-text-weight-bold mt-4">
                  Add your first Repository
                </h2>
                <img class="my-4" src="~assets/img/icons/repository_grey.svg" style="width: 70px;"><br>
                <nuxt-link to="/repositories/new" class="button is-accent my-3 px-6">
                  + Add Repository
                </nuxt-link>
              </div>
            </div>
            <nuxt-link v-else to="/repositories/new" class="button is-accent px-6">
              Login
            </nuxt-link>
          </div>
        </div>

        <!-- Projects -->
        <div v-if="!showTutorial && !loading" class="columns">
          <div class="column is-4">
            <h1 class="title is-3">
              Pipelines
            </h1>
          </div>
        </div>
        <div v-if="!showTutorial && !loading" class="mb-6 mt-5">
          <h2 class="subtitle has-text-weight-semibold">
            Your Repositories
          </h2>

          <div class="has-background-light">
            <div class="px-5 pt-5">
              <div class="is-flex is-justify-content-space-between table-header">
                <div class="is-flex-grow-1 pr-4">
                  <input v-model="search" class="input" placeholder="Search">
                </div>
                <div class="buttons">
                  <nuxt-link to="/secrets" class="button is-accent is-outlined mr-3 is-pulled-right">
                    Global Secrets
                  </nuxt-link>
                  <nuxt-link to="/repositories/new" class="button is-accent is-pulled-right">
                    + Add more repositories
                  </nuxt-link>
                </div>
              </div>
            </div>
            <repository-list class="mt-5" :repositories="filteredRepositories" />
          </div>
        </div>
      </div>
    </section>
    <div v-if="showTutorial" class="mt-6 pt-6 floor-image">
      <img src="~/assets/img/floor.svg">
    </div>
  </div>
</template>

<script>

export default {
  data () {
    return {
      projects: null,
      user: null,
      userRepositories: null,
      search: null,
      interval: null,
      network: process.env.NUXT_ENV_SOL_NETWORK,
      loading: false
    };
  },
  computed: {
    loggedIn () {
      return this.$auth && this.$auth.loggedIn;
    },
    showTutorial () {
      return !(this.user && this.userRepositories && this.userRepositories.length > 0);
    },
    filteredRepositories () {
      let filteredRepositories = this.userRepositories;
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
      }
    },
    '$sol.publicKey': function (pubkey) {
      if (pubkey) {
        this.wallet = this.$sol.getWallet();
      }
    }
  },
  created () {
    if (this.loggedIn) {
      this.getUser();
      this.getUserRepositories();
      if (this.$sol) {
        this.wallet = this.$sol.getWallet();
      }
    }
    if (!this.interval) {
      this.interval = setInterval(() => {
        if (this.loggedIn) {
          this.getUserRepositories();
        }
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
      this.loading = false;
    },
    async getUser () {
      this.loading = true;
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
    }
  }
};
</script>

<style lang="scss" scoped>
.table-header {
  @media screen and (max-width: $tablet) {
    display: block !important;
    div {
      padding-right: 0 !important;
    }
    .buttons {
      margin-top: 15px;
      a {
        margin-right: 0 !important;
        width: 100%;
      }
    }
  }
}

.section {
  min-height: calc(100vh - 100px);
}
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
 .has-limited-width {
  margin: 0 auto;
  &.box {
    max-width: 550px;
    width: 100%;
  }
 }

 .floor-image {
  position: absolute;
  width: 100%;
  z-index: 0;
  bottom: 0;
  overflow: hidden;
  z-index: -1;
  img {
    mask-image: linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0));
    width: 100%;
  }
 }
</style>
