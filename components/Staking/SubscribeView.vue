<template>
  <div>
    <div class="stake-block p-5 has-background-light" style="height: 100%">
      <div class="columns is-vcentered">
        <div class="column is-5 is-offset-1">
          <img width="175" src="~assets/img/burner-phone-logo.svg">
        </div>
        <div class="column is-6">
          <!-- <p>Next mint</p> -->
          <h1 class="title mb-4">
            Subscribe
          </h1>
          <p v-if="nfts && nfts.length > 0" class="block">
            <strong>Participate in the first Burner Phone Festival!</strong>
            <br>
            <small>
              Win an Xbox Series X, an iPad Air, a Ledger Nano X, or one of our other fantastic prizes!
              <br>
              Subscribe below to enter the raffle; it's free!
            </small>
            <br><br>
            <a class="button is-accent is-outlined" href="https://docs.google.com/forms/d/e/1FAIpQLSevTJ8uGcjY6MGQPlTuiJ_S1l7YpUYJbKmzxF52NHGo294H5g/viewform" target="_blank">Register</a>
          </p>
          <p v-else class="block">
            <strong>Get yourself a Burner Phone NFT.</strong>
            <small>
              Do you want to be a part of the second mint and/or next big event?
              <br>
              Simply stake some NOS and click the Subscribe button below.
            </small>
            <br><br>
            <nuxt-link to="/account/edit" class="button is-accent is-outlined">
              <b>Subscribe</b>
            </nuxt-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {
  },
  middleware: ['auth'],
  auth: 'guest',
  data () {
    return {
    };
  },
  computed: {
    // Use computed property as defined in navbar to get stake data
    userTier () {
      return this.$stake?.stakeData?.tierInfo?.userTier !== undefined &&
        this.$stake?.stakeData?.tierInfo?.userTier !== null;
    },
    nfts () {
      return this.$sol ? this.$sol.nfts : null;
    },
    loggedIn () {
      return (this.$auth && this.$auth.loggedIn);
    }
  },
  mounted () {
    this.getNfts();
  },
  methods: {
    async getNfts () {
      if (this.$sol && this.loggedIn) {
        await this.$sol.getNfts(this.$auth.user.address);
      }
    },
    print () {
      console.log(this.$stake?.stakeData);
    }
  }

};
</script>
