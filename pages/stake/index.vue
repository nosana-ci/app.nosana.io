<template>
  <section class="section">
    <div v-if="loading" class="loader-wrapper is-active">
      <div class="loader is-loading" />
    </div>
    <h1 class="title is-4">
      Earn by <span class="has-text-accent">Staking</span>
    </h1>
    <p>Stake NOS and receive rewards</p>
    <div class="tile is-ancestor mt-6">
      <div class="tile is-vertical is-parent" style="max-width: 650px">
        <staking-form
          ref="stakingForm"
          class="tile is-child"
          style="flex-grow: 0"
          @x-nos="updateXNOS"
          @reward-info="updateRewardInfo"
        />
        <reward-countdown
          :xnos="xNOS"
          class="tile is-child"
          @claim-rewards="$refs.stakingForm.claimRewards()"
        />
      </div>

      <div class="tile is-vertical is-parent">
        <tier-view class="tile is-child" :xnos="xNOS" @rxnos="fillStake" />
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
    fillStake (xnos) {
      if (this.$refs.stakingForm.userHasStakedBefore) {
        this.$refs.stakingForm.topupPopup = true;
        this.$refs.stakingForm.amount = Math.ceil(
          (((xnos / 1e6) - this.$refs.stakingForm.xNOS) + 1) / this.$refs.stakingForm.multiplier);
      } else {
        this.$refs.stakingForm.amount = Math.ceil(
          ((xnos / 1e6) + 1) / this.$refs.stakingForm.multiplier);
      }
    },
    updateXNOS (xNOS) {
      this.xNOS = xNOS;
    },
    updateRewardInfo (info) {
      this.rewardInfo = info;
    }
  }
};
</script>
