<template>
  <section class="section py-4">
    <div class="container">
      <nuxt-link to="/pipelines" class="has-text-accent has-text-weight-semibold">
        <i class="fas fa-chevron-left" /> All Repositories
      </nuxt-link>
      <h1 class="title is-3 mt-4">
        Add new Repository
      </h1>
      <div class="columns mt-3 is-centered">
        <div class="column is-12">
          <div v-if="!githubToken && !installations">
            Loading...
          </div>
          <div v-else>
            <p v-if="installationError" class="mb-2">
              Having trouble with your Github Installation? <a :href="githubAppUrl">Try reconnecting it.</a>
            </p>
            <div class="has-background-light is-flex is-align-content-center mb-5 p-5 columns is-multiline">
              <div
                v-for="installation in installations"
                :key="installation.id"
                class="column is-one-fifth is-half-mobile"
                @click="githubApp(installation.installation_id)"
              >
                <div
                  class="installation is-flex
                is-align-items-center is-justify-content-flex-start px-4"
                  :class="{'active': installation.installation_id === installationId}"
                >
                  <span class="icon is-medium mr-3">
                    <img :src="installation.meta.account.avatar_url">
                  </span>
                  <p class="has-text-weight-semibold">
                    {{ installation.meta.account.login }}
                  </p>
                </div>
              </div>
              <div
                v-for="installation in installations"
                :key="installation.id"
                class="column is-one-fifth is-half-mobile"
                @click="githubApp(installation.installation_id)"
              >
                <div
                  class="installation is-flex
                is-align-items-center is-justify-content-flex-start px-4"
                >
                  <span class="icon is-medium mr-3">
                    <img :src="installation.meta.account.avatar_url">
                  </span>
                  <p class="has-text-weight-semibold">
                    {{ installation.meta.account.login }}
                  </p>
                </div>
              </div>
              <div class="column is-one-fifth is-half-mobile">
                <a
                  :href="githubAppUrl"
                  class="is-flex is-align-items-center is-justify-content-flex-start installation px-3"
                >
                  <span class="icon is-medium mr-3">
                    <img src="~assets/img/icons/add-gh-account.svg" style="height: 70px;">
                  </span>
                  <p class="is-size-7 has-text-accent has-text-weight-semibold">
                    Connect another account
                  </p>
                  <span />
                </a>
              </div>
            </div>

            <!-- Select repo -->
            <nav class="panel">
              <div class="panel-heading is-flex is-align-items-center">
                <div class="control has-icons-left is-flex-grow-1 mr-5">
                  <input v-model="search" class="input" type="text" placeholder="Search">
                  <span class="icon is-left">
                    <i class="fas fa-search" aria-hidden="true" />
                  </span>
                </div>
                <a
                  :class="{'is-loading': loading}"
                  class="button is-accent is-outlined is-small"
                  :href="githubAppUrl"
                >
                  <span class="is-size-5 mr-1">+</span> Add more repositories
                </a>
              </div>
              <div style="max-height: 50vh; overflow-y: scroll">
                <a
                  v-for="repo in filteredRepositories"
                  :key="repo.id"
                  class="panel-block px-4 py-3"
                  :class="{'is-active': repository === repo.full_name, 'is-disabled': repo.private}"
                  @click.stop="!repo.private ? repository=repo.full_name : notPublic()"
                >
                  <span class="panel-icon mr-3">
                    <i class="fas fa-code-branch" aria-hidden="true" />
                    <i class="fas fa-circle-check is-size-6" aria-hidden="true" style="display: none;" />
                  </span>
                  {{ repo.full_name }}
                </a>
              </div>
            </nav>
          </div>
          <div v-if="githubToken">
            <form @submit.prevent="addRepository">
              <market-selector @select-market="selectMarket" />
              <br>
              <button type="submit" class="button is-accent mt-2" :disabled="!repository || !selectedMarket">
                Add {{ repository }}
              </button>
            </form>
            Repository selected: {{ repository }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import axios from 'axios';
let githubApi;

export default {
  middleware: 'auth',
  data () {
    let githubUrl = process.env.NUXT_ENV_GITHUB_APP_URL;
    if (process.client) {
      githubUrl += `?redirect_uri=${window.location.origin}/repositories/new`;
    }
    return {
      githubAppUrl: githubUrl,
      repository: null,
      githubToken: null,
      repositories: null,
      loading: false,
      search: null,
      installations: null,
      installationId: null,
      selectedMarket: null,
      installationError: false
    };
  },
  computed: {
    filteredRepositories () {
      let filteredRepositories = this.repositories;
      // Search repos
      if (filteredRepositories && this.search !== null && this.userRepositories) {
        filteredRepositories =
        filteredRepositories
          .filter(r => r.full_name.toLowerCase().includes(this.search.toLowerCase()))
          .filter(r => !this.userRepositories.find(ur => ur.repository === r.full_name));
      }

      return filteredRepositories;
    }
  },
  created () {
    if (process.client) {
      const installationId = this.$route.query.installation_id;
      if (installationId) {
        this.githubApp(installationId);
      } else {
        this.getInstallations();
      }
    }
    this.userRepos = this.getUserRepositories();
  },
  methods: {
    notPublic () {
      this.$modal.show({
        color: 'danger',
        text: 'This repo is not public, make this repository public first',
        title: 'Cannot select repo'
      });
    },
    async getUserRepositories () {
      try {
        const repositories = await this.$axios.$get('/user/repositories');
        console.log('repositories', repositories);
        this.userRepositories = repositories;
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    async getInstallations () {
      try {
        this.installations = await this.$axios.$get('/user/github/installations/');
        if (!this.installations.length) {
          this.goToGithub();
        } else {
          this.githubApp(this.installations[0].installation_id);
        }
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    goToGithub () {
      this.loading = true;
      window.location.href = `${this.githubAppUrl}?redirect_uri=${window.location.origin}/repositories/new`;
    },
    async githubApp (installationId) {
      try {
        this.loading = true;
        const installation = await this.$axios.$post('/user/github/installations/', { installationId });
        console.log('installation', installation);
        const query = Object.assign({}, this.$route.query);
        delete query.installation_id;
        this.$router.replace({ query });
        const response = await this.$axios.$get('/github/auth/' + installationId);
        this.githubToken = response.token;
        githubApi = axios.create({
          baseURL: 'https://api.github.com',
          headers: { Authorization: 'token ' + this.githubToken }
        });
        this.installationId = installationId;

        // when there's a repo id in localstorage, redirect to that repo
        if (localStorage.getItem('repo-id')) {
          const id = localStorage.getItem('repo-id');
          console.log('Found localstorage, try redirect', id);
          localStorage.removeItem('repo-id');
          this.$router.push(`/repositories/${id}?installation_id=${this.installationId}`);
        }
        this.installationError = false;
        this.getUserRepos();
      } catch (error) {
        this.loading = false;
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
        this.installationError = true;
      }
    },
    async getUserRepos () {
      try {
        if (githubApi) {
          let page = 1;
          let response;
          this.repositories = [];
          do {
            response = await githubApi
              .get(`/installation/repositories?type=public&per_page=100&page=${page}&t=${(new Date()).getTime()}`);
            if (response && response.data) {
              this.repositories = this.repositories.concat(response.data.repositories);
            }
            page++;
          } while (response && response.data && response.data.repositories.length >= 100);
        }
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
      this.loading = false;
    },
    async addRepository () {
      try {
        const createdRepo = await this.$axios.$post('/repositories', {
          repository: this.repository,
          market: this.selectedMarket.publicKey,
          type: 'GITHUB',
          installationId: this.installationId
        });
        // await this.addWebhook(repo);
        this.$router.push(`/repositories/${createdRepo.id}/pipeline`);
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    async addWebhook (repo) {
      if (githubApi && repo) {
        await githubApi.post(`/repos/${repo.repository}/hooks`, {
          events: ['*'],
          config: {
            content_type: 'json',
            url: process.env.NUXT_ENV_BACKEND_URL + '/webhook/github/' + (repo.secret ? repo.secret : repo.id),
            insecure_ssl: 1
          }
        });
      }
    },
    selectMarket (market) {
      this.selectedMarket = market;
    }
  }
};
</script>
<style scoped lang="scss">
.installation {
  height: 60px;
  border: 1px solid $grey-dark;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  &:hover {
    background-color: $grey-lighter;
  }
  &.active {
    border: 1px solid $accent;
    background: $accent-transparent;
  }
  .icon img {
    border-radius: 50%;
  }
}
</style>
