<template>
  <div id="app">
    <modal-popup />
    <client-only>
      <sol-wallet />
    </client-only>
    <div class="columns m-0 is-fullheight">
      <div
        class="column is-narrow has-background-light is-flex is-flex-direction-column sidebar"
      >
        <nav-bar />
        <node-block class="mt-auto is-hidden-mobile" />
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
