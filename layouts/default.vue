<template>
  <div id="app">
    <modal-popup />
    <client-only>
      <sol-wallet />
    </client-only>
    <div class="columns m-0 is-fullheight">
      <div class="column is-narrow has-background-light is-flex is-flex-direction-column">
        <nav-bar />
        <div class="mt-auto box has-background-dark">
          Reward block
        </div>
      </div>
      <div class="column">
        <Nuxt />
        <nos-footer />
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar';
import SolWallet from '@/components/SolWallet';

export default {
  components: {
    NavBar,
    SolWallet
  }
};
</script>

<style lang="scss">
html {
  min-height: 100vh;
  background-size: cover;
}
</style>
