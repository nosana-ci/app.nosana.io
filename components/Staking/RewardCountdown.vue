<template>
  <div>
    <div
      class="stake-block p-5 has-background-light"
      style="height:100%"
    >
      <div class="has-text-centered columns is-multiline">
        <div v-if="expectedRewards !== null" class="column is-12 is-6-fullhd">
          <div class="box has-text-centered">
            <p>Expected daily rewards</p>
            <h2 class="title is-3 has-text-success mb-0">
              <ICountUp
                class="is-family-monospace"
                :end-val="parseFloat(expectedRewards)"
                :options="{ decimalPlaces: 0, duration:0.1 }"
                style="opacity:0"
              />
              <ICountUp
                class="is-family-monospace"
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
          <div v-if="rewardInfo && rewardInfo.rewardAccount" class="is-size-6">
            <div class="is-flex is-align-items-center">
              <span class="">Current xNOS score</span>
              <b class="ml-auto">{{ parseInt(rewardInfo.rewardAccount.xnos/1e6) }}</b>
            </div>
            <hr class="my-2">
            <div class="is-flex is-align-items-center">
              <span class="">Total xNOS score</span>
              <b class="ml-auto ">{{ parseInt(rewardInfo.global.totalXnos/1e6) }}</b>
            </div>
            <hr class="my-2">
            <div class="is-flex is-align-items-center">
              <span class="">Your percentage</span>
              <b class="ml-auto">
                {{ (rewardInfo.rewardAccount.xnos/rewardInfo.global.totalXnos * 100).toFixed(2) }}%</b>
            </div>
            <hr class="my-2">
          </div>
        </div>
        <div class="column">
          <!-- <h2 v-if="!countdownFinished" class="subtitle">
            <b>Reward program starting in</b>
          </h2> -->
          <div>
            <client-only>
              <countdown :end-time="date" @onFinish="countdownFinished = true">
                <span
                  slot="process"
                  slot-scope="{ timeObj }"
                >
                  <div class="columns is-mobile is-multiline">
                    <div class="column is-6-fullhd is-6-desktop  is-6-touch">
                      <div class="has-background-grey-light has-radius title mb-0 p-4" style="white-space: nowrap">
                        {{ timeObj.d }}d
                      </div>
                    </div>

                    <div class="column is-6-fullhd is-6-desktop is-6-touch">
                      <div class="has-background-grey-light has-radius title mb-0 p-4" style="white-space: nowrap">
                        {{ timeObj.h }}h
                      </div>
                    </div>

                    <div class="column is-6-fullhd is-6-desktop  is-6-touch">
                      <div class="has-background-grey-light has-radius title mb-0 p-4" style="white-space: nowrap">
                        {{ timeObj.m }}m
                      </div>
                    </div>

                    <div class="column is-6-fullhd is-6-desktop  is-6-touch">
                      <div class="has-background-grey-light has-radius title mb-0 p-4" style="white-space: nowrap">
                        {{ timeObj.s }}s
                      </div>
                    </div>
                  </div>

                </span>
                <div slot="finish">
                  <div v-if="reward !== null">
                    <div class="box has-background-light">
                      <p>Pending NOS rewards</p>
                      <h2 class="title is-3 has-text-success mb-0">
                        <ICountUp
                          class="is-family-monospace"
                          :end-val="parseFloat(reward)"
                          :options="{ decimalPlaces: 4, duration:0.1 }"
                          style="opacity:0"
                        />
                        <ICountUp
                          class="is-family-monospace"
                          :end-val="parseFloat(reward)"
                          :options="{ decimalPlaces: 4, duration:1 }"
                          style="position:absolute;width: 100%;text-align: center;left: 0;"
                        />
                      </h2>
                      <p>NOS</p>
                    </div>
                    <p class="is-size-7">
                      You can either restake your pending rewards to increase your xNOS score
                      and earn even more rewards, or you can claim your pending rewards immediately to your wallet.
                    </p>
                    <button
                      v-if="!loggedIn"
                      class="button is-accent is-fullwidth mt-5 has-text-weight-semibold"
                      @click.stop.prevent="$sol.loginModal = true"
                    >
                      Connect Wallet
                    </button>
                    <div v-else>
                      <button
                        class="button is-accent is-fullwidth mt-5 has-text-weight-semibold"
                        :class="{'is-loading': loading}"
                        :disabled="reward == 0"
                        @click="claimAndRestakeRewards"
                      >
                        Restake
                      </button>
                      <button
                        class="button is-accent is-outlined is-fullwidth mt-2 has-text-weight-semibold"
                        :class="{'is-loading': loading}"
                        :disabled="reward == 0"
                        @click="claimRewards"
                      >
                        Claim rewards
                      </button>
                    </div>
                  </div>
                </div>
              </countdown>
            </client-only>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ICountUp from 'vue-countup-v2';
import { BN } from '@project-serum/anchor';
const anchor = require('@project-serum/anchor');

let node = process.env.NUXT_ENV_SOL_NETWORK;
if (!node.includes('http')) {
  node = anchor.web3.clusterApiUrl(node);
}

export default {
  components: {
    ICountUp
  },
  props: ['xnos'],
  data () {
    return {
      totals: null,
      date: new Date(process.env.NUXT_ENV_REWARD_COUNTDOWN),
      loading: false,
      interval: null,
      rate: null
    };
  },
  computed: {
    rewardInfo () {
      return this.$stake ? this.$stake.rewardInfo : null;
    },
    poolInfo () {
      return this.$stake ? this.$stake.poolInfo : null;
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
        if (this.rewardInfo && this.rewardInfo.rewardAccount && this.rate) {
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
    async claimRewards () {
      this.loading = true;
      try {
        const response = await this.$stake.rewardsProgram.methods
          .claim()
          .accounts({ ...this.$stake.accounts, vault: this.$stake.rewardVault })
          .preInstructions([
            await this.$stake.poolProgram.methods
              .claimFee()
              .accounts(this.$stake.poolAccounts).instruction()
          ])
          .rpc();
        console.log(response);
        setTimeout(async () => {
          await this.$stake.refreshStake();
        }, 1000);
        this.amount = null;
        this.balance = await this.$stake.getBalance(this.$stake.accounts.authority);
        this.$modal.show({
          color: 'success',
          text: 'Successfully claimed rewards',
          title: 'Claimed'
        });
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error.message,
          title: 'Error'
        });
      }
      this.loading = false;
    },
    async claimAndRestakeRewards () {
      this.loading = true;
      try {
        const decimals = 1e6;
        const stakeAmount = parseFloat(this.reward) * decimals;
        const response = await this.$stake.rewardsProgram.methods
          .claim()
          .accounts({ ...this.$stake.accounts, vault: this.$stake.rewardVault })
          .preInstructions([
            await this.$stake.poolProgram.methods
              .claimFee()
              .accounts(this.$stake.poolAccounts).instruction()
          ])
          .postInstructions([
            await this.$stake.program.methods
              .topup(new anchor.BN(stakeAmount))
              .accounts(this.$stake.accounts).instruction(),
            await this.$stake.rewardsProgram.methods
              .sync().accounts({ ...this.$stake.accounts, vault: this.$stake.rewardVault }).instruction()
          ])
          .rpc();
        console.log(response);
        setTimeout(async () => {
          await this.$stake.refreshStake();
        }, 1000);
        this.amount = null;
        this.balance = await this.$stake.getBalance(this.$stake.accounts.authority);
        this.$modal.show({
          color: 'success',
          text: 'Successfully claimed & restaked rewards',
          title: 'Claimed & restaked'
        });
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error.message,
          title: 'Error'
        });
      }
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
    calculateRewards () {
      if (this.rewardInfo && this.poolInfo) {
        this.rate = this.rewardInfo.global.rate;
        const now = new Date().getTime();
        const secondsBetween = parseInt(now / 1000) - parseInt(this.poolInfo.startTime);

        const fees =
          new BN(parseInt(secondsBetween) * parseInt(this.poolInfo.emission) - parseInt(this.poolInfo.claimedTokens));
        const newTotalXnos = this.rewardInfo.global.totalXnos.add(fees);
        if (this.poolInfo.balance > 0) {
          this.rate = new BN(this.rewardInfo.global.totalReflection / newTotalXnos);
        }
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
