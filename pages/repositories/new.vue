<template>
  <section class="section">
    <div class="container">
      <nuxt-link to="/" class="is-pulled-right">
        Back to repositories
      </nuxt-link>
      <h1 class="title is-4">
        Add new <b class="has-text-accent">Repository</b>
      </h1>

      <div v-for="repo in repositories" :key="repo.id">
        <a :class="{'has-text-accent': repository === repo.full_name}" @click.stop="repository=repo.full_name"> {{ repo.full_name }}</a>
      </div>
      <a v-if="!githubToken" class="button is-accent" href="https://github.com/login/oauth/authorize?client_id=382b493152debb760a28&scope=public_repo">
        Connect to Github
      </a>
      <div v-else-if="!publicKey" class="navbar-item" exact-active-class="is-active" @click="mobileMenu = false">
        <a class="button is-accent has-text-weight-semibold" exact-active-class="is-active" to="/account" @click="$sol.loginModal = true">
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
    </div>
  </section>
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      repository: null,
      githubToken: null,
      repositories: null
    }
  },
  computed: {
    publicKey () {
      return (this.$sol) ? this.$sol.publicKey : null
    }
  },
  created () {
    if (process.client) {
      const code = this.$route.query.code
      if (code) {
        this.githubOauth(code)
      }
    }
  },
  methods: {
    async githubOauth (code) {
      const response = await this.$axios.$post(`${process.env.backendUrl}/github/callback`, {
        code
      })
      this.githubToken = response.access_token
      this.getUserRepos()
    },
    async getUserRepos () {
      const githubApi = axios.create({
        baseURL: 'https://api.github.com',
        headers: { Authorization: 'token ' + this.githubToken }
      })
      const response = await githubApi.get('/user/repos?per_page=100')
      this.repositories = response.data
    },
    async addRepository () {
      try {
        await this.$axios.$post(`${process.env.backendUrl}/repositories`, {
          repository: this.repository,
          type: 'GITHUB'
        })
        this.$router.push('/')
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
