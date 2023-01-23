<template>
  <div id="app">
    <modal-popup />
    <client-only>
      <sol-wallet />
    </client-only>
    <div class="columns m-0 is-fullheight">
      <div
        class="column is-narrow has-background-secondary is-flex is-flex-direction-column sidebar"
      >
        <nav-bar />
        <!-- <node-block class="mt-auto is-hidden-mobile" /> -->
        <div class="mt-auto is-hidden-mobile has-text-centered">
          <a class="has-text-danger is-size-7" @click.prevent="$sol.logout">Logout</a>
        </div>
      </div>
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
.sidebar {
  position: sticky;
  top: 0;
  height: fit-content;
  min-height: 100vh;
}
@include mobile {
  .sidebar {
    position: relative;
    min-height: 0;
  }
}
</style>
