<template>
  <section class="section">
    <div class="container">
      <nuxt-link to="/" class="is-pulled-right">
        Back to repositories
      </nuxt-link>
      <h1 class="title is-4">
        Add new <b class="has-text-accent">Repository</b>
      </h1>
      <a href="https://github.com/login/oauth/authorize?client_id=382b493152debb760a28&scope=public_repo">
        Connect to Github
      </a>
      <div v-for="repo in repositories" :key="repo.id">
        {{ repo.full_name }}
      </div>
      <form @submit.prevent="addRepository">
        <input v-model="repository" class="input" type="text" required>
        <button type="submit" class="button is-accent mt-2">
          Add
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
      await this.$axios.$post(`${process.env.backendUrl}/repositories`, {
        repository: this.repository,
        type: 'GITHUB'
      })
      this.$router.push('/')
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
