<template>
  <section class="section">
    <h1 class="title has-text-centered">
      Welcome to the Nosana Network
    </h1>
    <div>
      <div v-if="!loggedIn" class="buttons is-centered p-6 mx-6">
        <div
          class="button is-accent is-large has-text-weight-semibold mx-6 px-6"
          exact-active-class="is-active"
          @click="$sol.loginModal = true"
        >
          Connect Wallet
        </div>
      </div>
      <div class="columns">
        <div class="column is-half">
          <p class="block has-limited-width-small has-text-justified is-horizontal-centered">
            In this dashboard you can see the pipelines that are running on the Nosana Network.
            You can also create and run your own CI/CD pipelines for your open-source project in the
            <nuxt-link to="/pipelines">
              Pipelines
            </nuxt-link>
          </p>
        </div>
        <div class="column is-half">
          <p class="block has-limited-width-small has-text-justified is-horizontal-centered">
            You can also earn <b>$NOS</b> by becoming a Node to use your spare CPU power to run pipelines.
            Head over to the
            <nuxt-link to="/stake">
              Staking Section
            </nuxt-link>
            to start earning and for a chance to receive a NFT burner phone.
          </p>
        </div>
      </div>
    </div>
    <div class="columns mt-5 is-multiline has-background-light pb-5">
      <div class="column is-one-third">
        <div class="box has-background-white m-3 is-flex is-flex-direction-column" style="height: 100%">
          <div class="has-background-light is-flex mb-5 mt-2 is-align-items-center pl-5" style="max-height:45px">
            <img src="~assets/img/icons/account.svg" style="height: 70px;">
          </div>
          <h2 class="subtitle">
            <b>Account completion</b>
          </h2>
          <p class="block is-size-7">
            Make sure to boost your account to 100%.
            This means you’ll be among the first to hear about Network updates,
            Node support, NFT drops, Rewarddrops & more.
          </p>
          <p class="block mt-auto">
            <nuxt-link to="/account/edit" class="button is-accent is-wide is-small is-outlined">
              <b>Account</b>
            </nuxt-link>
          </p>
        </div>
      </div>
      <div class="column is-one-third">
        <div class="box has-background-white m-3 is-flex is-flex-direction-column" style="height: 100%">
          <div class="has-background-light is-flex mb-5 mt-2 is-align-items-center pl-5" style="max-height:45px">
            <img src="~assets/img/icons/pipelines.svg" style="height: 70px;">
          </div>
          <h2 class="subtitle">
            <b>CI/CD Pipelines</b>
          </h2>
          <p class="block is-size-7">
            Our decentralized crowd-hosted platform has computing options for every development need.
            Whether you’re building mobile apps or the next DEX.
            If it works in a container, it works on the Nosana Network.
            We can run any container command, letting you ship faster than ever before.
          </p>
          <p class="block mt-auto">
            <nuxt-link to="/pipelines" class="button is-accent is-wide is-small is-outlined">
              <b>Pipelines</b>
            </nuxt-link>
          </p>
        </div>
      </div>
      <div class="column is-one-third">
        <div class="box has-background-white m-3 is-flex is-flex-direction-column" style="height: 100%">
          <div class="has-background-light is-flex mb-5 mt-2 is-align-items-center pl-5" style="max-height:45px">
            <img src="~assets/img/icons/nos.svg" style="height: 70px;">
          </div>
          <h2 class="subtitle">
            <b>Staking contract is audited!</b>
          </h2>
          <p class="block is-size-7">
            Staking $NOS contract has been audited by our partners at <a href="https://opcodes.fr/" target="_blank" rel="noopener noreferrer">OPCODES</a>.
            We are confident that the contract is safe to use.
            Read it at the link below.
          </p>
          <p class="block mt-auto">
            <a
              href="https://gitlab.com/nosana-ci/apps/platform/spl/-/blob/main/audits/NOSANA_STAKING_REPORT_2.pdf"
              class="button is-accent is-wide is-small is-outlined"
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong>Audit Report</strong>
            </a>
          </p>
        </div>
      </div>
      <div class="column is-one-third">
        <div class="box has-background-white m-3 is-flex is-flex-direction-column" style="height: 100%">
          <div class="has-background-light is-flex mb-5 mt-2 is-align-items-center pl-5" style="max-height:45px">
            <img src="~assets/img/icons/nos.svg" style="height: 70px;">
          </div>
          <h2 v-if="countdown > 0" class="subtitle">
            <b>Staking rewards protocol starts in {{ countdown }} days</b>
          </h2>
          <h2 v-else class="subtitle">
            <b>Staking rewards is live!</b>
          </h2>
          <p class="block is-size-7">
            Receiving token rewards is one of the major benefits of staking.
            The reward pool comes from future usage of the network in the form of network fees.
            As the network is still very much in development, the current rewards pool will come from the mining pool.
            The Nosana Network has 20 million tokens reserved for network participants.
            In the first year, a portion of these will be released daily into the reward pool.
          </p>
          <p class="block mt-auto">
            <nuxt-link to="stake" class="button is-accent is-wide is-small is-outlined">
              <b>Stake</b>
            </nuxt-link>
          </p>
        </div>
      </div>
      <div class="column is-one-third">
        <div class="box has-background-white m-3 is-flex is-flex-direction-column" style="height: 100%">
          <div class="has-background-light is-flex mb-5 mt-2 is-align-items-center pl-5" style="max-height:45px">
            <img src="~assets/img/icons/phone.svg" style="height: 70px;">
          </div>
          <h2 class="subtitle">
            <b>The Burner Phone countdown starts soon!</b>
          </h2>
          <p class="block is-size-7">
            We don’t do minting fees – a Burner Phone costs exactly 0 SOL. Are you a Nosana Network user?
            Stake $NOS for a chance to mint your very own and have exclusive rights to earn $NOS with our Network.
          </p>
          <p class="block mt-auto">
            <a href="https://nosana.io/nft" target="_blank" class="button is-accent is-wide is-small is-outlined">
              <b>Learn more</b>
            </a>
          </p>
        </div>
      </div>
      <div class="column is-one-third">
        <div class="box has-background-white m-3 is-flex is-flex-direction-column" style="height: 100%">
          <div class="has-background-light is-flex mb-5 mt-2 is-align-items-center pl-5" style="max-height:45px">
            <img src="~assets/img/icons/stats.svg" style="height: 70px;">
          </div>
          <h2 class="subtitle">
            <b>Network Statistics</b>
          </h2>
          <p class="block is-size-7">
            Want to learn more about how the Network is doing? Check it out here!
          </p>
          <p class="block mt-auto">
            <nuxt-link to="/stats" class="button is-accent is-wide is-small is-outlined">
              <b>Statistics</b>
            </nuxt-link>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  data () {
    return {
    };
  },
  computed: {
    loggedIn () {
      return (this.$auth && this.$auth.loggedIn);
    },
    countdown () {
      const endDate = new Date('2022-08-29T13:14:15.000Z');
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      const diffInDays = Math.floor(diff / (1000 * 60 * 60 * 24));
      return diffInDays;
    }
  }
};

</script>
