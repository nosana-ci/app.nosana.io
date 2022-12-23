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
        <div
          class="button is-accent is-large has-text-weight-semibold"
          exact-active-class="is-active"
          @click="goToGithub"
        >
          Login with Github
        </div>
      </div>
    </div>
  </section>
</template>
<script>
export default {
  middleware: ['auth'],
  auth: 'guest',
  data () {
    return {
      githubAppUrl: process.env.NUXT_ENV_GITHUB_APP_URL
    };
  },
  mounted () {
    if (this.$route.query.code) {
      this.authenticateGithub();
    }
    // this.$sol.loginModal = true;
  },
  methods: {
    goToGithub () {
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${process.env.NUXT_ENV_GITHUB_APP_CLIENT_ID}&redirect_uri=${window.location.origin}/login`;
    },
    async authenticateGithub () {
      const response = await this.$auth.loginWith('githubLogin', {
        data: {
          code: this.$route.query.code
        }
      });
      const installationId = this.$route.query.installation_id;
      if (installationId) {
        await this.$axios.$post('/user/github/installations/', { installationId });
      }
      // Needed because there is a redirect bug when going to a protected route from the login page
      const path = this.$auth.$storage.getUniversal('redirect');
      this.$auth.$storage.setUniversal('redirect', null);
      if (path) {
        this.$router.push(path);
      } else if (this.$route && this.$route.name === 'login') {
        this.$router.push('/');
      }
      console.log('user', response);
    }
  }
};
</script>
