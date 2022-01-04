<template>
  <div id="app">
    <client-only>
      <sol-wallet />
    </client-only>
    <nav-bar />
    <Nuxt />
    <foot />
  </div>
</template>

<script>
import NavBar from '@/components/NavBar'
import SolWallet from '@/components/SolWallet'

export default {
  components: {
    NavBar,
    SolWallet
  }
}
</script>

<style lang="scss">
html {
  min-height: 100vh;
  background-size: cover;
}
</style>
