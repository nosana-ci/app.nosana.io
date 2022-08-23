<template>
  <section class="section">
    <div class="container">
      <div class="has-text-centered">
        <div class="title has-text-centered">
          Welcome to the Nosana Network
        </div>
        <img class="image mx-auto" src="https://nosana.io/img/Nosana_Logomark_black.svg" alt="" srcset="" style="max-height: 400px;">
        <p>Connect your Solana wallet to get started.</p>
        <br>
        <div
          class="button is-accent is-large has-text-weight-semibold"
          exact-active-class="is-active"
          @click="$sol.loginModal = true"
        >
          Connect Wallet
        </div>
      </div>
    </div>
  </section>
</template>
<script>
export default {
  middleware: ['auth'],
  auth: 'guest',
  mounted () {
    this.$sol.loginModal = true;
  }
};
</script>
