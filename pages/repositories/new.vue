<template>
  <section class="section">
    <div class="container">
      <nuxt-link to="/">
        <i class="fas fa-chevron-left" /> All repositories
      </nuxt-link>
      <h1 class="title is-4">
        Add new <b class="has-text-accent">Repository</b>
      </h1>
      <nav class="panel">
        <p class="panel-heading">
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
          <a v-for="repo in filteredRepositories" :key="repo.id" class="panel-block" :class="{'is-active': repository === repo.full_name}" @click.stop="repository=repo.full_name">
            <span class="panel-icon">
              <i class="fas fa-code-branch" aria-hidden="true" />
            </span>
            {{ repo.full_name }}
          </a>
        </div>
      </nav>
      <div>
        <a v-if="!githubToken" :class="{'is-loading': loading}" class="button is-accent" href="https://github.com/login/oauth/authorize?client_id=382b493152debb760a28&scope=public_repo">
          Connect to Github
        </a>
        <div v-else-if="!loggedIn" class="navbar-item" exact-active-class="is-active" @click="mobileMenu = false">
          <a :class="{'is-loading': loading}" class="button is-accent has-text-weight-semibold" exact-active-class="is-active" to="/account" @click="$sol.loginModal = true">
            <div>
              Connect Wallet
            </div>
          </a>
        </div>
        <form v-else @submit.prevent="addRepository">
          <button type="submit" class="button is-accent mt-2" :disabled="!repository">
            Add {{ repository }}
          </button>
        </form>
        Repository selected: {{ repository }}
      </div>
    </div>
  </section>
</template>

<script>
import axios from 'axios'
let githubApi

export default {
  data () {
    return {
      repository: null,
      githubToken: null,
      repositories: null,
      loading: false,
      search: null
    }
  },
  computed: {
    loggedIn () {
      return (this.$sol) ? this.$sol.token : null
    },
    filteredRepositories () {
      let filteredRepositories = this.repositories
      // Search repos
      if (filteredRepositories && this.search !== null) {
        filteredRepositories = filteredRepositories.filter((r) => {
          return r.full_name.toLowerCase().includes(this.search.toLowerCase())
        })
      }

      return filteredRepositories
    }
  },
  created () {
    if (process.client) {
      const code = this.$route.query.code
      if (code) {
        this.githubOauth(code)
      } else {
        this.goToGithub()
      }
    }
  },
  methods: {
    goToGithub () {
      this.loading = true
      window.location.href = 'https://github.com/login/oauth/authorize?client_id=382b493152debb760a28&scope=public_repo'
    },
    async githubOauth (code) {
      try {
        this.loading = true
        const response = await this.$axios.$post(`${process.env.backendUrl}/github/callback`, {
          code
        })
        this.githubToken = response.access_token
        githubApi = axios.create({
          baseURL: 'https://api.github.com',
          headers: { Authorization: 'token ' + this.githubToken }
        })
        this.getUserRepos()
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        })
      }
      const query = Object.assign({}, this.$route.query)
      delete query.code
      this.$router.replace({ query })
    },
    async getUserRepos () {
      try {
        if (githubApi) {
          const response = await githubApi.get('/user/repos?per_page=100')
          this.repositories = response.data
        }
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        })
      }
      this.loading = false
    },
    async addRepository () {
      try {
        const repo = await this.$axios.$post(`${process.env.backendUrl}/repositories`, {
          repository: this.repository,
          type: 'GITHUB'
        })
        await this.addWebhook(repo)
        this.$router.push('/')
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        })
      }
    },
    async addWebhook (repo) {
      if (githubApi && repo) {
        await githubApi.post(`/repos/${repo.repository}/hooks`, {
          config: {
            content_type: 'json',
            url: 'https://testnet.nosana.io/webhook/github/' + repo.id,
            insecure_ssl: 1
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
