<template>
  <section class="section">
    <div class="container">
      <div class="has-text-centered">
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
