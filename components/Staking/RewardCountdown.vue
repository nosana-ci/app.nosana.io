<template>
  <div>
    <div
      class="stake-block px-2 py-6 has-background-light is-flex is-justify-content-center is-align-items-flex-start"
      style="height:100%"
    >
      <div class="has-text-centered py-6">
        <div v-if="expectedRewards !== null" class="box has-text-centered mb-6">
          <p>Expected daily rewards</p>
          <h2 class="title is-3 has-text-success mb-0">
            <ICountUp
              :end-val="parseFloat(expectedRewards)"
              :options="{ decimalPlaces: 0, duration:0.1 }"
              style="opacity:0"
            />
            <ICountUp
              :end-val="parseFloat(expectedRewards)"
              :options="{ decimalPlaces: 0 }"
              style="position:absolute;width: 100%;text-align: center;left: 0;"
            />
          </h2>
          <p>NOS</p>
          <p
            v-if="(stakeData && stakeData.amount) ||
              ($parent.$refs.stakingForm && $parent.$refs.stakingForm.amount)"
            class="has-text-centered is-italic is-size-7"
          >
            APY
            {{ ((expectedRewards*365) /
              ((stakeData && stakeData.amount ? (stakeData.amount / 1e6) : 0) +
                (($parent.$refs.stakingForm && $parent.$refs.stakingForm.amount) ?
                  parseInt($parent.$refs.stakingForm.amount) : 0)) * 100).toFixed(1) }}%
          </p>
        </div>
        <h2 v-if="!countdownFinished" class="subtitle">
          <b>Reward program starting in</b>
        </h2>
        <div>
          <client-only>
            <countdown :end-time="date" @onFinish="countdownFinished = true">
              <span
                slot="process"
                slot-scope="{ timeObj }"
              >
                <div class="columns is-mobile is-multiline">
                  <div class="column is-3-desktop  is-6-touch">
                    <div class="has-background-grey-light has-radius title mb-0 p-4" style="white-space: nowrap">
                      {{ timeObj.d }}d
                    </div>
                  </div>

                  <div class="column is-3-desktop  is-6-touch">
                    <div class="has-background-grey-light has-radius title mb-0 p-4" style="white-space: nowrap">
                      {{ timeObj.h }}h
                    </div>
                  </div>

                  <div class="column is-3-desktop  is-6-touch">
                    <div class="has-background-grey-light has-radius title mb-0 p-4" style="white-space: nowrap">
                      {{ timeObj.m }}m
                    </div>
                  </div>

                  <div class="column is-3-desktop  is-6-touch">
                    <div class="has-background-grey-light has-radius title mb-0 p-4" style="white-space: nowrap">
                      {{ timeObj.s }}s
                    </div>
                  </div>
                </div>

              </span>
              <span slot="finish">
                <h2 class="subtitle">
                  <b>Claim your rewards</b>
                </h2>
                Rewards: {{ reward }}
                <button
                  v-if="!loggedIn"
                  class="button is-accent is-fullwidth mt-5 has-text-weight-semibold"
                  @click.stop.prevent="$sol.loginModal = true"
                >
                  Connect Wallet
                </button>
                <button
                  v-else
                  class="button is-accent is-fullwidth mt-5 has-text-weight-semibold"
                  :class="{'is-loading': loading}"
                  :disabled="reward == 0"
                  @click="claimRewards"
                >
                  Claim rewards
                </button>
              </span>
            </countdown>
          </client-only>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ICountUp from 'vue-countup-v2';
import { BN } from '@project-serum/anchor';

export default {
  components: {
    ICountUp
  },
  props: ['xnos'],
  data () {
    return {
      totals: null,
      date: new Date('2022-08-30T13:00:00.000Z'),
      loading: false,
      nosPerSecond: 8000000 / (365 * 3600 * 24),
      lastClaim: new Date('2022-08-30T13:00:00.000'),
      interval: null,
      rate: null
    };
  },
  computed: {
    rewardInfo () {
      return this.$stake ? this.$stake.rewardInfo : null;
    },
    stakeData () {
      return this.$stake ? this.$stake.stakeData : null;
    },
    countdownFinished: {
      get () {
        return new Date() > this.date;
      },
      set (val) {
        this.countdownFinished = val;
      }
    },
    expectedRewards () {
      if (!this.totals) { return null; }
      let totalXnos = parseFloat(this.totals.xnos);
      if (this.stakeData && this.stakeData.amount) {
        totalXnos -= this.stakeData.amount;
      }
      return ((this.xnos * 1e6) / (totalXnos + (this.xnos * 1e6))) * (8000000 / 365);
    },
    loggedIn () {
      return this.$sol && this.$sol.publicKey;
    },
    reward () {
      let reward = 0;
      if (this.countdownFinished) {
        if (this.rewardInfo && this.rate) {
          reward = (this.rewardInfo.rewardAccount.reflection / this.rate) -
          this.rewardInfo.rewardAccount.xnos;
        }
      }
      return +(reward / 1e6).toFixed(4);
    }
  },
  mounted () {
    this.getStakeTotals();
    this.calculateRewards();
    if (!this.interval) {
      this.interval = setInterval(() => {
        this.calculateRewards();
      }, 1000);
    }
  },
  beforeDestroy () {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },
  methods: {
    claimRewards () {
      this.loading = true;
      // quick fix TODO: would be nice to have the programs in the stake plugin
      this.$emit('claim-rewards');
      this.loading = false;
    },
    async getStakeTotals () {
      try {
        this.totals = await this.$axios.$get('/stake/totals');
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    getRate (xnos, reflection) {
      return xnos / reflection;
    },
    calculateRewards () {
      this.rate = this.rewardInfo ? this.rewardInfo.global.rate : null;
      if (this.rewardInfo) {
        const now = new Date().getTime();
        const diff = this.lastClaim.getTime() - now;
        const secondsBetween = Math.abs(diff / 1000);

        const fees = new BN(parseInt(secondsBetween) * parseInt(this.nosPerSecond * 1e6));
        const newTotalXnos = this.rewardInfo.global.totalXnos.add(fees);

        this.rate = new BN(this.rewardInfo.global.totalReflection / newTotalXnos);
      }
    }
  }
};
</script>
<style scoped lang="scss">
h2 {
  font-family: $family-sans-serif;
}
</style>
