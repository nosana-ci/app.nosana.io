<template>
  <section class="section">
    <div>
      <div v-if="!loggedIn">
        <h1 class="title has-text-centered">
          Registration page
        </h1>
        <img class="image mx-auto" src="https://nosana.io/img/Nosana_Logomark_black.svg" alt="" srcset="" style="max-height: 400px;">
        <p class="title has-text-centered">
          Lorem ipsum
        </p>
        <br>
        <div class="buttons is-centered p-6 mx-6">
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
    </div>
  </section>
</template>

<script>
export default {
  layout: 'logged-out',
  data () {
    return {
    };
  },
  computed: {
    loggedIn () {
      return (this.$auth && this.$auth.loggedIn);
    }
  },
  mounted () {
    if (this.loggedIn) {
      this.$router.push('/welcome');
    }
  },
  methods: {
    goToGithub () {
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${process.env.NUXT_ENV_GITHUB_APP_CLIENT_ID}&redirect_uri=${window.location.origin}/login`;
    }
  }
};

</script>
