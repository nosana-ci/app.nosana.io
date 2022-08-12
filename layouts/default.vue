<template>
  <div id="app">
    <modal-popup />
    <client-only>
      <sol-wallet />
    </client-only>
    <div class="columns m-0 is-fullheight">
      <div
        class="column is-narrow has-background-light is-flex is-flex-direction-column"
        style="height: fit-content;min-height: 100vh;"
      >
        <nav-bar />
        <stake-block class="mt-auto is-hidden-mobile" />
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
import StakeBlock from '@/components/Staking/StakeBlock';

export default {
  components: {
    NavBar,
    SolWallet,
    StakeBlock
  }
};
</script>

<style lang="scss">
html {
  min-height: 100vh;
  background-size: cover;
}
</style>
