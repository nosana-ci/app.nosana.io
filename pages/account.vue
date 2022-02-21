<template>
  <section class="section">
    <div class="container">
      <h1 class="title is-4">
        Your Account
      </h1>
      <div v-if="publicKey">
        <div class="title mt-4 blockchain-address">
          {{ publicKey }}
        </div>
        <div>
          Balance: {{ balance }} SOL
        </div>
      </div>
      <div v-else>
        <a href="" @click.prevent="$sol.loginModal = true">Connect your Solana Wallet</a> to continue
      </div>
      <div v-if="user">
        <div v-if="editUser">
          <form @submit.prevent="updateUser">
            <div class="field">
              <label>Name:</label>
              <input v-model="name" type="text" class="input">
            </div>
            <div class="field">
              <label>Description:</label>
              <textarea v-model="description" class="textarea" />
            </div>
            <div class="field">
              <label>Icon URL:</label>
              <input v-model="image" type="url" class="input">
            </div>
            <a class="button" @click.prevent="editUser = false">Cancel</a>
            <input type="submit" class="button is-accent" value="Save">
          </form>
        </div>
        <div v-else>
          <a @click.prevent="editUser = true">Edit Project info</a>
          <div v-if="user.name" class="is-flex is-align-items-center">
            <img v-if="user.image" style="height: 32px" :src="user.image" class="mr-4">
            <h2 class="title">
              {{ user.name }}
            </h2>
          </div>
          <div v-else>
            <a
              href="https://bit.ly/NosanaBetaForm-hp"
              class="button is-accent is-outlined has-text-weight-semibold"
              target="_blank"
            >Register a project</a>
          </div>
          <p v-if="user.description">
            Description: {{ user.description }}
          </p>
        </div>
      </div>
      <div v-if="user">
        <h2 class="subtitle">
          Repositories
        </h2>
        <nuxt-link to="/repositories/new" class="button is-accent is-outlined">
          Add new repository
        </nuxt-link>
        <repository-list :commits="commits" :repositories="repositories" />
      </div>
      <div v-if="publicKey" class="has-text-centered mt-6">
        <a href="" class="button is-danger" @click.prevent="$sol.logout">Logout</a>
      </div>
    </div>
  </section>
</template>

<script>
import RepositoryList from '../components/RepositoryList.vue'
import { formatLamportsAsSol } from '@/utils'

export default {
  components: { RepositoryList },
  data () {
    return {
      user: null,
      image: null,
      description: null,
      name: null,
      editUser: false,
      repositories: null,
      commits: null
    }
  },
  computed: {
    publicKey () {
      return (this.$sol) ? this.$sol.publicKey : null
    },
    balance () {
      return this.$sol && typeof this.$sol.balance === 'number' && formatLamportsAsSol(this.$sol && this.$sol.balance, true)
    }
  },
  watch: {
    '$sol.token' (token) {
      if (token) {
        this.getUser()
        this.getRepositories()
        this.getCommits()
      }
    }
  },
  created () {
    if (this.$sol && this.$sol.token) {
      this.getUser()
      this.getRepositories()
      this.getCommits()
    }
  },
  mounted () {
    if (!this.publicKey) { this.$sol.loginModal = true }
  },
  methods: {
    async getCommits () {
      try {
        const commits = await this.$axios.$get(`${process.env.backendUrl}/commits`)
        this.commits = commits
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        })
      }
    },
    async getUser () {
      try {
        const user = await this.$axios.$get(`${process.env.backendUrl}/user`)
        this.name = user.name
        this.description = user.description
        this.image = user.image
        this.user = user
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        })
      }
    },
    async getRepositories () {
      try {
        const repositories = await this.$axios.$get(`${process.env.backendUrl}/user/repositories`)
        this.repositories = repositories
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        })
      }
    },
    async updateUser () {
      try {
        const user = await this.$axios.$post(`${process.env.backendUrl}/user`, {
          name: this.name,
          image: this.image,
          description: this.description

        })
        this.user = user
        this.editUser = false
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
