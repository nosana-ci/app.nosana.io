<template>
  <div>
    <section class="section">
      <div v-if="showTutorial">
        <div class="columns mt-3 is-centered has-text-centered">
          <div class="column is-12">
            <h1 class="title is-4">
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
      <div v-if="!showTutorial" class="columns mt-3">
        <div class="column is-4">
          <h1 class="title is-4">
            Projects
          </h1>
        </div>
      </div>
      <div v-if="!showTutorial" class="mb-6">
        <nuxt-link to="/repositories/new" class="button is-accent is-outlined is-pulled-right">
          Add Repository
        </nuxt-link>
        <h2 class="subtitle has-text-weight-semibold">
          Your Repositories
        </h2>

        <repository-list :repositories="userRepositories" />
      </div>
    </section>
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
        if (!repositories.length && this.$route.query.login) {
          this.$router.push('/repositories/new');
        }
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
 .has-limited-width {
  margin: 0 auto;
  &.box {
    max-width: 550px;
    width: 100%;
  }
 }
</style>
