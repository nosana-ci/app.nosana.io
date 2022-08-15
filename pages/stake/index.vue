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
      <div class="tile is-vertical is-parent">
        <staking-form
          class="tile is-child"
          :stake-data="stakeData"
          :stake-end-date="stakeEndDate"
          @x-nos="updateXNOS"
        />
        <reward-countdown class="tile is-child" />
      </div>

      <div class="tile is-vertical is-parent">
        <tier-view class="tile is-child" :stake-data="stakeData" :xnos="xNOS" />
        <subscribe-view class="tile is-child" />
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
      stakeData: null,
      accounts: null,
      balance: null,
      amount: null,
      unstakeDays: 365,
      extraUnstakeDays: null,
      extendStake: false,
      unstakeForm: false,
      stakeEndDate: null,
      countdownFinished: false,
      xNOS: null
    };
  },
  computed: {
    loggedIn () {
      return this.$sol && this.$sol.publicKey;
    }
  },
  mounted () {
    if (!this.interval) {
      this.interval = setInterval(() => {
        console.log('refresh staking info..');
        this.refreshStake();
      }, 30000);
    }
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
    },
    async refreshStake () {
      const stakeData = await this.$axios.$get('/user/stake');
      if (stakeData && stakeData.user_id && parseInt(stakeData.time_unstake) !== 0 && parseInt(stakeData.time_unstake) !== '00') {
        this.stakeEndDate = this.$moment.unix(stakeData.time_unstake).add(stakeData.duration, 's');
        // this.stakeEndDate = this.$moment.unix(1659698174);
      } else {
        this.stakeEndDate = null;
      }
      this.stakeData = stakeData;
    }
  }
};
</script>
