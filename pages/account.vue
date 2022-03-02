<template>
  <section class="section">
    <div class="container">
      <h1 class="title is-4">
        Your Account
      </h1>
      <div v-if="!loggedIn">
        <a href="" @click.prevent="$sol.loginModal = true">Connect your Solana Wallet</a> to continue
      </div>
      <div v-else>
        <div>
          <div class="columns">
            <div v-if="user" class="column is-4">
              <div class="is-flex is-align-items-flex-start is-justify-content-flex-start">
                <div class="project-icon mr-4">
                  <img v-if="user.image" style="height: 32px" :src="user.image">
                </div>
                <div style="max-width: 100%;">
                  <h2 v-if="user.name" class="title is-6 has-text-weight-semibold">
                    {{ user.name }}
                    <a @click.prevent="editUser = true"><i class="fas fa-edit" /></a>
                  </h2>
                  <h2 class="subtitle is-6 mb-1">
                    <a target="_blank" :href="`https://solscan.io/address/${publicKey}`" class="blockchain-address" style="max-width: 140px;">
                      {{ publicKey }}
                    </a>
                  </h2>
                  <a v-if="!user.name" @click.prevent="editUser = true"><i class="fas fa-edit" /> Edit Project info</a>
                  <p class="is-size-7 has-overflow-ellipses" style="height: 40px;">
                    <span v-if="user.description">{{ user.description }}</span>
                  </p>
                </div>
              </div>
            </div>
            <div v-if="!user || !user.name" class="column is-8">
              <div class="columns">
                <div class="column is-one-third">
                  <a class="box is-secondary step" :class="{'has-background-white': loggedIn}" @click="$sol.loginModal = true">
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
                  <nuxt-link class="box is-secondary step" :class="{'has-background-white': user && repositories && repositories.filter(r => r.user_id === user.user_id).length, 'disabled': !loggedIn}" to="/repositories/new">
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
                  <a class="box is-secondary step" :class="{'has-background-white': user && repositories && repositories.filter(r => r.user_id === user.user_id).length, 'disabled': !(loggedIn && user && repositories && repositories.filter(r => r.user_id === user.user_id).length)}" @click.stop="editUser = true">
                    <div class="is-flex is-justify-content-space-between">
                      <div>3</div>
                      <div v-if="user && user.isApproved">
                        <img :src="require('@/assets/img/icons/done.svg')">
                      </div>
                      <div v-else-if="user && user.name">
                        <img :src="require('@/assets/img/icons/running.svg')">
                      </div>
                      <div v-else>
                        <img :src="require('@/assets/img/icons/pending.svg')">
                      </div>
                    </div>
                    <div class="has-text-centered my-2">
                      <img v-if="loggedIn && user && repositories && repositories.filter(r => r.user_id === user.user_id).length" src="~assets/img/icons/project.svg">
                      <img v-else src="~assets/img/icons/project_grey.svg">
                      <p>Request Funds</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            <template v-else>
              <div class="column is-2">
                <div class="box">
                  <small>TestNet Balance</small>
                  <div class="has-text-weight-semibold">
                    {{ balance }} <span class="has-text-accent">NOS</span>
                  </div>
                </div>
              </div>
              <div class="column is-2">
                <div class="box">
                  <small>Used for Jobs</small>
                  <div class="has-text-weight-semibold">
                    {{ balance }} <span class="has-text-accent">NOS</span>
                  </div>
                </div>
              </div>
              <div class="column is-2">
                <div class="box">
                  <small>NOS Rewards</small>
                  <div class="has-text-weight-semibold">
                    {{ balance }} <span class="has-text-accent">NOS</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
        <div class="modal" :class="{'is-active': editUser}">
          <div class="modal-background" @click="editUser = false" />
          <div class="modal-card">
            <header class="modal-card-head">
              <p class="modal-card-title">
                Register Project
              </p>
            </header>
            <form @submit.prevent="updateUser">
              <section class="modal-card-body">
                <div class="field">
                  <label>Name*:</label>
                  <input v-model="name" required type="text" class="input">
                </div>
                <div class="field">
                  <label>Email*:</label>
                  <input v-model="email" required type="email" class="input">
                </div>
                <div class="field">
                  <label>Description:</label>
                  <textarea v-model="description" class="textarea" />
                </div>
                <div class="field">
                  <label>Icon URL:</label>
                  <input v-model="image" type="url" class="input">
                </div>
                <div class="field">
                  <label>Discord Username:</label>
                  <input v-model="discord" type="text" class="input">
                </div>
              </section>

              <footer class="modal-card-foot has-text-right">
                <button class="button" @click.prevent="editUser = false">
                  Cancel
                </button>
                <input type="submit" class="button is-accent" value="Save">
              </footer>
            </form>
          </div>
          <button class="modal-close is-large" aria-label="close" @click="editUser = false" />
        </div>
      </div>
      <div v-if="user" class="mt-6">
        <nuxt-link to="/repositories/new" class="button is-accent is-outlined is-pulled-right">
          Add new repository
        </nuxt-link>
        <h2 class="subtitle has-text-weight-semibold">
          Repositories
        </h2>

        <repository-list :commits="commits" :repositories="repositories" />
      </div>
      <div v-if="publicKey" class="has-text-centered mt-6">
        <a class="has-text-danger" @click.prevent="$sol.logout">Logout</a>
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
      discord: null,
      email: null,
      name: null,
      editUser: false,
      repositories: null,
      commits: null
    }
  },
  computed: {
    loggedIn () {
      return (this.$sol) ? this.$sol.token : null
    },
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
    if (this.$route.query.edit) {
      this.editUser = true
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
        this.discord = user.discord
        this.email = user.email
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
          description: this.description,
          discord: this.discord,
          email: this.email
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
</style>
