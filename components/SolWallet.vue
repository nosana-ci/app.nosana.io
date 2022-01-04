
<template>
  <span>
    <div class="modal" :class="{ 'is-active': $sol.loginModal }">
      <div
        class="modal-background"
        @click="
          $sol.loginModal = false;
          error = null;
        "
      />
      <div class="modal-card">
        <div v-if="error" class="notification is-danger">
          <button class="delete" @click="error = null" />
          {{ error }}
        </div>
        <header class="modal-card-head">
          <p class="modal-card-title">
            <span v-if="loggedIn">Your Account</span>
            <span v-else>Connect Solana Wallet</span>
          </p>
          <button
            class="delete"
            aria-label="close"
            @click="
              $sol.loginModal = false;
              error = null;
            "
          />
        </header>
        <section class="modal-card-body">
          <div v-if="loading" class="loader-wrapper is-active">
            <div class="loader is-loading" />
          </div>
          <div v-if="loggedIn">

            <nuxt-link
              class="button is-accent px-5"
              to="/pieces"
              exact-active-class="is-active"
              @click="
                $sol.loginModal = false;
                error = null;
              "
            >
              <div>My Account</div>
            </nuxt-link>

            <div class="has-text-right">
              <a
                class="has-text-danger is-small"
                style="border-radius: 6px"
                @click="$sol.logout()"
              >
                Logout
              </a>
            </div>
          </div>
          <div v-else>
            <div v-for="wallet in $sol.wallets" :key="wallet.name" class="my-2">
              <div
                class="button is-medium is-justify-content-flex-start is-outlined is-fullwidth has-text-weight-semibold"
                @click="selectWallet(wallet)"
              >
                <span class="icon mr-5">
                  <img :src="wallet.icon">
                </span>
                <span>{{ wallet.name }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </span>
</template>

<script>
export default {
  data () {
    return {
      loading: false,
      error: null,
      isDisabled: false
    }
  },
  computed: {
    publicKey () {
      return this.$sol ? this.$sol.publicKey : null
    },
    loggedIn () {
      return this.$sol && this.$sol.publicKey
    }
  },

  methods: {
    async selectWallet (provider) {
      try {
        await this.$sol.connect(provider)
        this.error = null
      } catch (error) {
        this.error = error
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .modal-card {
    max-width: 400px;
  }
</style>
