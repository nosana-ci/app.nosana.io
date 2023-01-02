<template>
  <section class="section">
    <div class="container">
      <nuxt-link to="/pipelines">
        <i class="fas fa-chevron-left" /> All repositories
      </nuxt-link>
      <h1 class="title is-4">
        Add new <b class="has-text-accent">Repository</b>
      </h1>
      <div v-if="!githubToken && !installations">
        Loading...
      </div>
      <div v-else-if="!githubToken">
        <p v-if="installationError" class="mb-2">
          Having trouble with your Github Installation? <a :href="githubAppUrl">Try reconnecting it.</a>
        </p>
        <p
          v-for="installation in installations"
          :key="installation.id"
          class="block"
        >
          <a
            class="button is-outlined"
            @click="githubApp(installation.installation_id)"
          >
            <span class="icon is-small">
              <img :src="installation.meta.account.avatar_url">
            </span>
            <span>{{ installation.meta.account.login }}</span>
          </a>
        </p>
        <p class="block">
          <a :class="{'is-loading': loading}" class="button is-accent" :href="githubAppUrl">
            <span>Connect another GitHub account</span>
          </a>
        </p>
      </div>
      <nav v-else class="panel">
        <p class="panel-heading">
          <a :class="{'is-loading': loading}" class="button is-accent is-pulled-right is-small" :href="githubAppUrl">
            <span>Add more GitHub repositories</span>
          </a>
          Repositories
        </p>
        <div class="panel-block">
          <p class="control has-icons-left">
            <input v-model="search" class="input" type="text" placeholder="Search">
            <span class="icon is-left">
              <i class="fas fa-search" aria-hidden="true" />
            </span>
          </p>
        </div>
        <div style="max-height: 50vh; overflow-y: scroll">
          <a
            v-for="repo in filteredRepositories"
            :key="repo.id"
            class="panel-block"
            :class="{'is-active': repository === repo.full_name, 'is-disabled': repo.private}"
            @click.stop="!repo.private ? repository=repo.full_name : notPublic()"
          >
            <span class="panel-icon">
              <i class="fas fa-code-branch" aria-hidden="true" />
            </span>
            {{ repo.full_name }}
          </a>
        </div>
      </nav>
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
      if (filteredRepositories && this.search !== null) {
        filteredRepositories =
        filteredRepositories.filter(r => r.full_name.toLowerCase().includes(this.search.toLowerCase()));
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
  },
  methods: {
    notPublic () {
      this.$modal.show({
        color: 'danger',
        text: 'This repo is not public, make this repository public first',
        title: 'Cannot select repo'
      });
    },
    async getInstallations () {
      try {
        this.installations = await this.$axios.$get('/user/github/installations/');
        if (!this.installations.length) {
          this.goToGithub();
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
