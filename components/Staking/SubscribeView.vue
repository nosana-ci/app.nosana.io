<template>
  <div>
    <div class="stake-block p-5 has-background-light" style="height: 100%">
      <div class="columns is-vcentered">
        <div class="column is-5 is-offset-1">
          <img width="175" src="~assets/img/burner-phone-logo.svg">
        </div>
        <div class="column is-6">
          <p>Next mint</p>
          <h1 class="title mb-4">
            Subscribe
          </h1>
          <p v-if="userTier" class="block">
            <strong>Get you hands on a Burner Phone</strong>
            <br>
            <small>
              Next NFT mint- Get your hands on a Burner Phone. <br>
              All stakers have a chance to win an NFT mint token.
              You need to subscribe here after staking to participate in the raffle.
            </small>
          </p>
          <p v-else class="block">
            <strong>Get your hands on a Burner Phone</strong>
            <small>
              Want to be one of the first to own a Burner Phone?
              <br>
              Subscribe below participate in the raffle!
            </small>
          </p>
          <p class="block">
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
    }
  },
  mounted () {
  },
  methods: {
    print () {
      console.log(this.$stake?.stakeData);
    }
  }

};
</script>
