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
      <div v-if="publicKey" class="has-text-centered mt-6">
        <a href="" class="button is-danger is-inverted" @click.prevent="$sol.logout">Logout</a>
      </div>
    </div>
  </section>
</template>

<script>
import { formatLamportsAsSol } from '@/utils'

export default {
  computed: {
    publicKey () {
      return (this.$sol) ? this.$sol.publicKey : null
    },
    balance () {
      return this.$sol && typeof this.$sol.balance === 'number' && formatLamportsAsSol(this.$sol && this.$sol.balance, true)
    }
  },
  mounted () {
    if (!this.publicKey) { this.$sol.loginModal = true }
  }
}
</script>
