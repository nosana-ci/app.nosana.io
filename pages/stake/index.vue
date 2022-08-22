<template>
  <section class="section">
    <div v-if="loading" class="loader-wrapper is-active">
      <div class="loader is-loading" />
    </div>
    <h1 class="title is-4">
      Earn by <span class="has-text-accent">Staking</span>
    </h1>
    <p>Stake NOS and generate $NOS and $xNOS</p>
    <div class="tile is-ancestor mt-6">
      <div class="tile is-vertical is-parent" style="max-width: 650px">
        <staking-form
          class="tile is-child"
          style="flex-grow: 0"
          :stake-data="stakeData"
          :stake-end-date="stakeEndDate"
          @x-nos="updateXNOS"
        />
        <reward-countdown :xnos="xNOS" :stake-data="stakeData" class="tile is-child" />
      </div>

      <div class="tile is-vertical is-parent">
        <tier-view class="tile is-child" :stake-data="stakeData" :xnos="xNOS" />
        <subscribe-view style="flex-grow: 0" class="tile is-child" />
      </div>
    </div>
  </section>
</template>
<script>
import StakingForm from '../../components/Staking/StakingForm.vue';
import RewardCountdown from '../../components/Staking/RewardCountdown.vue';
import SubscribeView from '../../components/Staking/SubscribeView.vue';
import TierView from '../../components/Staking/TierView.vue';

export default {
  components: {
    StakingForm,
    RewardCountdown,
    SubscribeView,
    TierView
  },
  middleware: 'auth',
  data () {
    return {
      loading: false,
      program: null,
      provider: null,
      accounts: null,
      balance: null,
      amount: null,
      unstakeDays: 365,
      extraUnstakeDays: null,
      extendStake: false,
      unstakeForm: false,
      countdownFinished: false,
      xNOS: null
    };
  },
  computed: {
    stakeData () {
      return this.$stake ? this.$stake.stakeData : null;
    },
    stakeEndDate () {
      return this.$stake ? this.$stake.stakeEndDate : null;
    },
    loggedIn () {
      return this.$sol && this.$sol.publicKey;
    }
  },
  mounted () {
  },
  beforeDestroy () {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },
  methods: {
    updateXNOS (xNOS) {
      this.xNOS = xNOS;
    }
  }
};
</script>
