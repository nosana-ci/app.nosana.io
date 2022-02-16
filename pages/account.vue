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
      <div v-if="publicKey" class="has-text-centered mt-6">
        <a href="" class="button is-danger" @click.prevent="$sol.logout">Logout</a>
      </div>
    </div>
  </section>
</template>

<script>
import { formatLamportsAsSol } from '@/utils'

export default {
  data () {
    return {
      user: null
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
      }
    }
  },
  created () {
    if (this.$sol.token) {
      this.getUser()
    }
  },
  mounted () {
    if (!this.publicKey) { this.$sol.loginModal = true }
  },
  methods: {
    async getUser () {
      try {
        const user = await this.$axios.$get(`${process.env.backendUrl}/user`)
        this.user = user
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
