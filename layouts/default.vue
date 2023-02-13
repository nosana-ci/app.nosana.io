<template>
  <div id="app">
    <modal-popup />
    <client-only>
      <sol-wallet />
    </client-only>
    <div class="columns m-0 is-fullheight">
      <div
        class="column is-narrow has-background-secondary is-flex is-flex-direction-column sidebar
        is-justify-content-space-between"
      >
        <nav-bar />
        <div>
          <node-block class="mt-auto is-hidden-mobile mb-0" />
          <hr class="m-4 is-hidden-touch">
          <div class="mt-auto is-hidden-mobile has-text-centered">
            <a class="button is-outlined is-danger is-small" @click.prevent="$sol.logout">
              <i class="fa-solid fa-arrow-right-from-bracket pr-1" /> Logout</a>
          </div>
        </div>
      </div>
      <div class="column" style="position: relative;">
        <Nuxt />
        <nos-footer />
        <node-block class="mt-auto is-hidden-desktop mt-5 mb-0" />
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar';
import SolWallet from '@/components/SolWallet';
import NodeBlock from '@/components/Staking/NodeBlock';

export default {
  components: {
    NavBar,
    SolWallet,
    NodeBlock
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
