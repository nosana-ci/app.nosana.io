<template>
  <div id="app">
    <modal-popup />
    <client-only>
      <sol-wallet />
    </client-only>
    <div class="columns m-0 is-fullheight">
      <div class="column">
        <Nuxt />
        <nos-footer />
      </div>
    </div>
  </div>
</template>

<script>
import SolWallet from '@/components/SolWallet';

export default {
  components: {
    SolWallet
  }
};
</script>

<style lang="scss">
@import "bulma/sass/utilities/mixins";
html {
  min-height: 100vh;
  background-size: cover;
}
</style>
