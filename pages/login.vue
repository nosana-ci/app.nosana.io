<template>
  <section class="section">
    <div class="container">
      <div class="has-text-centered">
        <img class="image mx-auto" src="~/assets/img/Nosana_Logo_horizontal_color_black.svg" style="width:200px">

        <h1 class="title has-text-centered mt-6">
          Welcome to the<br>Nosana Network
        </h1>
        <div v-if="!loading">
          <p>Login with your Github account<br> or connect your Solana wallet to get started.</p>
          <br>
          <div>
            <div>
              <i class="fab fa-github is-size-2 mb-4" />
            </div>
            <div
              class="button is-accent is-wider has-text-weight-semibold"
              exact-active-class="is-active"
              @click="goToGithub"
            >
              Login with Github
            </div>
          </div>
          <small>
            or
            <a
              class="has-text-weight-semibold"
              exact-active-class="is-active"
              @click.prevent="$sol.loginModal = true"
            >
              Connect Solana Wallet
            </a>
          </small>
        </div>
        <div v-else>
          Authenticating to github..
        </div>
        <div class="mt-6 pt-6">
          <img src="~/assets/img/floor.svg">
        </div>
      </div>
    </div>
  </section>
</template>
<script>
export default {
  layout: 'logged-out',
  middleware: ['auth'],
  auth: 'guest',
  data () {
    return {
      loading: false
    };
  },
  mounted () {
    if (this.$route.query.code) {
      this.authenticateGithub();
    }
  },
  methods: {
    goToGithub () {
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${process.env.NUXT_ENV_GITHUB_APP_CLIENT_ID}&redirect_uri=${window.location.origin}/login`;
    },
    async authenticateGithub () {
      this.loading = true;
      try {
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
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: `Something went wrong while logging in with Github. \n${error}`,
          title: 'Error'
        });
      }
      this.loading = false;
    }
  }
};
</script>
