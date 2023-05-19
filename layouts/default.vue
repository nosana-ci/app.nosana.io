<template>
  <div id="app" class="has-navbar-fixed-top">
    <modal-popup />
    <client-only>
      <sol-wallet />
    </client-only>
    <nav-bar />
    <div class="columns m-0 is-fullheight content-wrapper">
      <div class="column" style="position: relative;">
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
@import "bulma/sass/utilities/mixins";
html {
  min-height: 100vh;
  background-size: cover;
}
.content-wrapper {
  margin-top: $navbar-height !important;
}
.sidebar {
  position: sticky;
  top: 0;
}
@include mobile {
  .sidebar {
    position: relative;
    min-height: 0;
  }
}
</style>
