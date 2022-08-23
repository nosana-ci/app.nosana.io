<template>
  <div class="stake-block">
    <!-- Extend popup -->
    <div class="modal stake-popup" :class="{ 'is-active': extendPopup }">
      <div class="modal-background" @click="extendPopup = false" />
      <div v-if="stakeData && stakeData.duration" class="modal-content has-background-white has-radius-medium p-5">
        <h3 class="has-text-centered subtitle is-4 has-text-weight-semibold">
          Extend unstake period
        </h3>
        <form class="is-fullwidth" @submit.prevent="stake">
          <div
            class="mt-5 has-radius-medium has-text-centered columns
            is-flex is-align-items-center is-multiline has-background-grey-lighter m-0 py-5"
          >
            <div class="column is-8 is-full-mobile">
              <div class="is-flex is-align-items-center is-justify-content-center">
                <span>Extend unstake period with</span>
                <input
                  v-model="extraUnstakeDays"
                  required
                  class="input mx-2 py-5 has-background-grey-light has-text-centered"
                  type="number"
                  :min="1"
                  :max="365 - parseInt($moment.duration(stakeData.duration, 'seconds').asDays())"
                  placeholder="0"
                  style="width: auto;"
                >
                <span>days</span>
              </div>
            </div>
            <div class="column is-1 p-1 is-2-mobile is-offset-5-mobile">
              <div
                class="has-background-grey-light has-radius-medium
                is-flex is-align-items-center is-justify-content-center py-2"
              >
                <img width="24" src="~assets/img/icons/arrow.svg">
              </div>
            </div>
            <div class="column is-3 is-full-mobile scores">
              <div class="has-background-grey-lighter has-radius-medium">
                <div class="box has-text-centered mb-3 p-2">
                  <h2 class="title is-4 has-text-success mb-0">
                    <ICountUp :end-val="parseFloat(multiplier)" :options="{ decimalPlaces: 2, prefix: 'x' }" />
                  </h2>
                  <p>multiplier</p>
                </div>
                <div class="box has-text-centered p-2">
                  <h2 class="title is-4 has-text-success mb-0">
                    <ICountUp :end-val="parseFloat(xNOS)" :options="{ decimalPlaces: 2 }" />
                  </h2>
                  <p>xNOS score</p>
                </div>
              </div>
            </div>
            <p class="mb-2 has-text-centered is-full column">
              <span v-if="extraUnstakeDays > 0">
                New days:
                {{ parseInt($moment.duration(stakeData.duration, 'seconds').asDays()) + parseInt(extraUnstakeDays) }}
              </span>
              <span v-else>
                Current days: {{ parseInt($moment.duration(stakeData.duration, 'seconds').asDays()) }}
              </span>
            </p>
          </div>
          <div v-if="errors" style="width: 100%">
            <div v-for="error in errors" :key="error" class="has-text-danger">
              {{ error }}
            </div>
          </div>
          <button
            v-if="!loggedIn"
            class="button is-accent is-fullwidth mt-5 has-text-weight-semibold"
            @click.stop.prevent="$sol.loginModal = true"
          >
            Connect Wallet
          </button>
          <button
            v-else
            type="submit"
            class="button is-accent is-fullwidth mt-5 has-text-weight-semibold"
            :class="{'is-loading': loading}"
          >
            Extend
          </button>
        </form>
      </div>
      <button
        class="modal-close is-large"
        aria-label="close"
        @click="extendPopup = false, amount = 0, extraUnstakeDays = 0"
      />
    </div>

    <!-- Topup popup -->
    <div class="modal stake-popup" :class="{ 'is-active': topupPopup }">
      <div class="modal-background" @click="topupPopup = false,amount = 0, extraUnstakeDays = 0" />
      <div class="modal-content">
        <div v-if="stakeData && stakeData.duration" class="modal-content has-background-white has-radius-medium p-5">
          <h3 class="has-text-centered subtitle is-4 has-text-weight-semibold">
            Increase stake
          </h3>
          <div class="balances is-flex">
            <div class="balance pl-3">
              <span v-if="balance === null" class="is-size-7">Loading..<br></span>
              <span v-else class="is-size-7">NOS Balance<br></span>
              <span @click="amount = balance">{{ balance }} NOS</span>
              <a v-if="balance === 0" href="https://nosana.io/token" target="_blank" class="is-size-7">Buy NOS tokens</a>
            </div>
            <div class="balance pl-3 ml-6">
              <span class="is-size-7">Staked<br></span>
              <span v-if="stakeData && stakeData.amount">
                {{ parseFloat(stakeData.amount/1e6) }}
              </span>
              <span v-else>0</span>
              <small class="is-size-6">NOS</small>
            </div>
          </div>
          <form class="is-fullwidth" @submit.prevent="stake">
            <div
              class="mt-5 has-radius-medium has-text-centered columns
              is-flex is-align-items-center is-multiline has-background-grey-lighter m-0 py-5"
            >
              <div class="column is-full-mobile">
                <div class="field has-background-grey-light has-radius-medium">
                  <div
                    class="control px-1 pr-3 py-2
                    is-flex is-flex-direction-row is-align-items-center is-justify-content-space-between"
                  >
                    <div class="amount-logo px-3">
                      <img width="30" src="~assets/img/icons/token.svg">
                    </div>
                    <div class="is-flex is-align-items-center is-flex-grow-1">
                      <input
                        v-model="amount"
                        required
                        class="input has-background-grey-light ml-3 my-3"
                        :max="balance"
                        min="1"
                        step="0.00000001"
                        type="number"
                        placeholder="0"
                        style="width: 100px; height: 35px; border: none;"
                      >
                      <span class="is-size-7 pt-3 pl-2">NOS</span>
                    </div>

                    <div class="buttons are-small">
                      <button
                        class="px-2 mr-1 button is-accent is-outlined has-text-weight-semibold is-uppercase"
                        @click.prevent="amount = (balance/2)"
                      >
                        Half
                      </button>
                      <button
                        class="px-2 button is-accent is-outlined has-text-weight-semibold is-uppercase is-size-7"
                        @click.prevent="amount = balance"
                      >
                        Max
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="column is-1 p-1 is-2-mobile is-offset-5-mobile">
                <div
                  class="has-background-grey-light has-radius-medium
                is-flex is-align-items-center is-justify-content-center py-2"
                >
                  <img width="24" src="~assets/img/icons/arrow.svg">
                </div>
              </div>
              <div class="column is-3 is-full-mobile scores">
                <div class="has-background-grey-lighter has-radius-medium">
                  <div class="box has-text-centered mb-3 p-2">
                    <h2 class="title is-4 has-text-success mb-0">
                      <ICountUp :end-val="parseFloat(NOS)" :options="{ decimalPlaces: 2 }" />
                    </h2>
                    <p>NOS</p>
                  </div>
                  <div class="box has-text-centered p-2">
                    <h2 class="title is-4 has-text-success mb-0">
                      <ICountUp :end-val="parseFloat(xNOS)" :options="{ decimalPlaces: 2 }" />
                    </h2>
                    <p>xNOS score</p>
                  </div>
                </div>
              </div>
              <div v-if="errors" style="width: 100%">
                <div v-for="error in errors" :key="error" class="has-text-danger">
                  {{ error }}
                </div>
              </div>
              <button
                v-if="!loggedIn"
                class="button is-accent is-fullwidth mt-5 has-text-weight-semibold"
                @click.stop.prevent="$sol.loginModal = true"
              >
                Connect Wallet
              </button>
              <button
                v-else
                type="submit"
                class="button is-accent is-fullwidth mt-5 has-text-weight-semibold"
                :class="{'is-loading': loading}"
              >
                Increase stake
              </button>
            </div>
          </form>
        </div>
      </div>
      <button class="modal-close is-large" aria-label="close" @click="topupPopup = true" />
    </div>

    <div class="has-background-light" style="height: 100%">
      <div class="tabs">
        <ul>
          <li
            class="has-background-secondary px-4"
            :class="{'is-active': unstakeForm === false, 'is-inactive' : stakeEndDate}"
            @click="!stakeEndDate ? unstakeForm = false : null"
          >
            <a class="p-4">Stake</a>
          </li>
          <li
            class="has-background-secondary px-4"
            :class="{'is-active': unstakeForm === true || stakeEndDate, 'is-inactive' : !userHasStakedBefore}"
            @click="userHasStakedBefore ? unstakeForm = true : null"
          >
            <a class="p-4">Unstake</a>
          </li>
        </ul>
      </div>

      <div class="p-5">
        <div v-if="!stakeEndDate" class="container">
          <div v-if="!unstakeForm">
            <!--- Balances --->
            <div v-if="!userHasStakedBefore" class="balances columns">
              <div class="column is-two-thirds">
                <div class="balance pl-3">
                  <span v-if="balance === null" class="is-size-7">Loading..<br></span>
                  <span v-else class="is-size-7">NOS Balance<br></span>
                  <span @click="amount = balance">{{ balance }} NOS</span>
                  <a v-if="balance === 0" href="https://nosana.io/token" target="_blank" class="is-size-7">Buy NOS tokens</a>
                </div>
              </div>
            </div>

            <!--- Form --->
            <form
              v-if="!userHasStakedBefore"
              @submit.prevent="stake"
            >
              <div class="mt-5 columns is-multiline">
                <div class="column">
                  <div class="form-inputs has-background-grey-lighter has-radius-medium p-3 pt-5">
                    <div class="field has-background-grey-light has-radius-medium">
                      <div
                        class="control px-1 pr-3 py-2
                        is-flex is-flex-direction-row is-align-items-center is-justify-content-space-between"
                      >
                        <div class="amount-logo px-3">
                          <img width="30" src="~assets/img/icons/token.svg">
                        </div>
                        <div class="is-flex is-align-items-center is-flex-grow-1">
                          <input
                            v-model="amount"
                            required
                            class="input has-background-grey-light ml-3 my-3"
                            :max="balance"
                            min="1"
                            step="0.00000001"
                            type="number"
                            placeholder="0"
                            style="width: 100px; height: 35px; border: none;"
                          >
                          <span class="is-size-7 pl-2 pr-2">NOS</span>
                        </div>

                        <div class="buttons are-small">
                          <button
                            class="px-2 mr-1 button is-accent is-outlined has-text-weight-semibold is-uppercase"
                            @click.prevent="amount = (balance/2)"
                          >
                            Half
                          </button>
                          <button
                            class="px-2 button is-accent is-outlined has-text-weight-semibold is-uppercase is-size-7"
                            @click.prevent="amount = balance"
                          >
                            Max
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="field">
                      <div class="mt-5 is-flex is-flex-direction-row is-align-items-center is-justify-content-center">
                        <span class="is-size-7">Unstake period of</span>
                        <input
                          v-model="unstakeDays"
                          required
                          class="input mx-2 py-5 has-background-grey-light has-text-centered"
                          type="number"
                          :min="14"
                          :max="365"
                          placeholder="0"
                          style="width: auto;"
                        >
                        <span class="is-size-7">days</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- (New) Scores -->
                <div class="column is-one-third scores">
                  <div
                    class="has-background-grey-lighter has-radius-medium p-3"
                  >
                    <div class="box has-text-centered">
                      <h2 class="title is-3 has-text-success mb-0">
                        <ICountUp
                          :end-val="parseFloat(xNOS)"
                          :options="{ decimalPlaces: 0, duration:0.1 }"
                          style="opacity:0"
                        />
                        <ICountUp
                          :end-val="parseFloat(xNOS)"
                          :options="{ decimalPlaces: 0 }"
                          style="position:absolute;width: 100%;text-align: center;left: 0;"
                        />
                      </h2>
                      <p>xNOS score</p>
                    </div>
                    <div class="box has-text-centered mb-3">
                      <h2 class="title is-4 has-text-success mb-0">
                        <ICountUp
                          :end-val="parseFloat(multiplier)"
                          :options="{ decimalPlaces: 2, duration:0.1, prefix: 'x' }"
                          style="opacity:0"
                        />
                        <ICountUp
                          :end-val="parseFloat(multiplier)"
                          :options="{ decimalPlaces: 2, prefix: 'x' }"
                          style="position:absolute;width: 100%;text-align: center;left: 0;"
                        />
                      </h2>
                      <p>multiplier</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div v-if="errors">
                  <div v-for="error in errors" :key="error" class="has-text-danger">
                    {{ error }}
                  </div>
                </div>
                <!-- Buttons -->
                <button
                  v-if="!loggedIn"
                  class="button is-accent is-outlined has-text-weight-semibold"
                  @click.stop.prevent="$sol.loginModal = true"
                >
                  Connect Wallet
                </button>
                <button v-else type="submit" class="button is-accent" :class="{'is-loading': loading}">
                  Stake NOS
                </button>
              </div>
            </form>
            <div v-else class="your-stake">
              <h3 class="has-text-centered subtitle is-4 has-text-weight-semibold">
                Your Stake
              </h3>
              <div class="scores">
                <div
                  class="has-radius-medium p-3
                is-flex is-flex-wrap-wrap is-align-items-center is-justify-content-center"
                >
                  <div class="box has-text-centered m-2">
                    <h2 class="title is-4 mb-0">
                      <ICountUp
                        :end-val="parseFloat(NOS)"
                        :options="{ decimalPlaces: 0, duration:0.1 }"
                        style="opacity:0"
                      />
                      <ICountUp
                        :end-val="parseFloat(NOS)"
                        :options="{ decimalPlaces: 0 }"
                        style="position:absolute;width: 100%;text-align: center;left: 0;"
                      />
                    </h2>
                    <p>NOS</p>
                  </div>
                  <div class="box has-text-centered m-2" style="min-width: 0">
                    <h2 class="title is-4 mb-0">
                      <ICountUp
                        :end-val="parseFloat(multiplier)"
                        :options="{ decimalPlaces: 2, duration:0.1, prefix: 'x' }"
                        style="opacity:0"
                      />
                      <ICountUp
                        :end-val="parseFloat(multiplier)"
                        :options="{ decimalPlaces: 2, prefix: 'x' }"
                        style="position:absolute;width: 100%;text-align: center;left: 0;"
                      />
                    </h2>
                    <p>multiplier</p>
                  </div>
                  <div class="box has-text-centered m-2">
                    <h2 class="title is-4 mb-0">
                      <ICountUp
                        :end-val="parseFloat(xNOS)"
                        :options="{ decimalPlaces: 0, duration:0.1 }"
                        style="opacity:0"
                      />
                      <ICountUp
                        :end-val="parseFloat(xNOS)"
                        :options="{ decimalPlaces: 0 }"
                        style="position:absolute;width: 100%;text-align: center;left: 0;"
                      />
                    </h2>
                    <p>xNOS</p>
                  </div>
                </div>
              </div>
              <p class="is-size-7 has-text-centered">
                Unstake period of {{ $moment.duration(stakeData.duration, 'seconds').asDays() }} days
              </p>
              <button
                class="button is-accent is-light extend-btn mt-3 px-6"
                @click="extendPopup = true, amount = 0, extraUnstakeDays = 0"
              >
                Extend unstake period
              </button>
              <div v-if="accounts" class="mt-6 mb-3">
                <div class="is-flex is-align-items-center">
                  <span class="is-size-7">Stake Account</span>
                  <a target="_blank" :href="`https://explorer.solana.com/address/${accounts.stake}/anchor-account`" class="ml-auto is-size-7">View on Solana explorer</a>
                </div>
                <hr class="my-2">
                <div class="is-flex is-align-items-center">
                  <span class="is-size-7">Stake Vault</span>
                  <a target="_blank" :href="`https://explorer.solana.com/address/${accounts.vault}/tokens`" class="ml-auto is-size-7">View on Solana explorer</a>
                </div>
                <hr class="my-2">
                <div class="is-flex is-align-items-center">
                  <span class="is-size-7">Reward Account</span>
                  <a target="_blank" :href="`https://explorer.solana.com/address/${accounts.reward}/anchor-account`" class="ml-auto is-size-7">View on Solana explorer</a>
                </div>
                <hr class="my-2">
              </div>
              <div class="column is-whole">
                <!-- Buttons -->
                <button
                  class="button is-accent is-fullwidth mt-5 has-text-weight-semibold"
                  style="font-size: 18px"
                  :class="{'is-loading': loading}"
                  @click="topupPopup = true, amount = 0, extraUnstakeDays = 0"
                >
                  Increase stake
                </button>
              </div>
            </div>
          </div>

          <!--- Unstake form --->
          <div v-if="unstakeForm && userHasStakedBefore">
            <div class="has-text-centered has-limited-width-small is-horizontal-centered mb-6">
              <h3 class="has-text-centered subtitle is-4 has-text-weight-semibold">
                Unstake your<br>tokens here.
              </h3>
              <p>
                Be aware that after you unstake,
                you will have to wait till your unstake period ends to claim your tokens<br><br>
                If you would to unstake now, you can claim your tokens on:
              </p>
              <h1 class="subtitle is-5 mt-4">
                {{ $moment().add(stakeData.duration, 'seconds').format('LL') }}
              </h1>
            </div>
            <form @submit.prevent="unstake">
              <button
                v-if="!loggedIn"
                class="button is-accent is-outlined has-text-weight-semibold"
                @click.stop.prevent="$sol.loginModal = true"
              >
                Connect Wallet
              </button>
              <button
                v-else-if="userHasStakedBefore"
                type="submit"
                class="button is-accent"
                :class="{'is-loading': loading}"
              >
                Unstake NOS
              </button>
            </form>
          </div>
        </div>
        <div v-if="userHasStakedBefore && stakeEndDate" class="container">
          <div class="unstaked">
            <h3 class="has-text-centered subtitle is-4 has-text-weight-semibold">
              You have unstaked<br>your tokens
            </h3>
            <span v-if="countdownFinished">
              Claim your tokens!<br>
            </span>
            <div v-else class="has-text-centered is-block mb-1">
              <h5 class="mb-0" style="line-height: 1rem;">
                Unstaked at:
              </h5>
              <span class="is-size-7">{{ $moment.unix(stakeData.time_unstake).local() }}</span><br>

              <div class="has-background-grey-lighter has-radius-medium p-3 pb-4 mt-5">
                <h5 class="mb-3">
                  They will be released in
                </h5>
                <client-only>
                  <countdown :end-time="stakeEndDate">
                    <span
                      slot="process"
                      slot-scope="{ timeObj }"
                    >
                      <div class="columns is-mobile is-multiline">
                        <div class="column is-3-desktop is-6-touch">
                          <div class="has-background-grey-light has-radius title mb-0 py-4 px-2">
                            {{ timeObj.d }}d
                          </div>
                        </div>
                        <div class="column is-3-desktop is-6-touch">
                          <div class="has-background-grey-light has-radius title mb-0 py-4 px-2">
                            {{ timeObj.h }}h
                          </div>
                        </div>
                        <div class="column is-3-desktop is-6-touch">
                          <div class="has-background-grey-light has-radius title mb-0 py-4 px-2">
                            {{ timeObj.m }}m
                          </div>
                        </div>
                        <div class="column is-3-desktop is-6-touch">
                          <div class="has-background-grey-light has-radius title mb-0 py-4 px-2">
                            {{ timeObj.s }}s
                          </div>
                        </div>
                      </div>

                    </span>
                    <span slot="finish">
                      <h1 class="title">Now LIVE</h1>
                    </span>
                  </countdown>
                </client-only>
              </div>
            </div>
          </div>

          <form v-if="!countdownFinished" class="mt-5 has-text-centered" @submit.prevent="restake">
            Or restake them here: <br>
            <button
              v-if="!loggedIn"
              class="button is-accent is-outlined has-text-weight-semibold mt-2"
              @click.stop.prevent="$sol.loginModal = true"
            >
              Connect Wallet
            </button>
            <button
              v-else-if="userHasStakedBefore"
              type="submit"
              class="button is-accent mt-2"
              :class="{'is-loading': loading}"
            >
              Restake {{ parseFloat(stakeData.amount)/1e6 }} NOS
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ICountUp from 'vue-countup-v2';
const anchor = require('@project-serum/anchor');
const { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } = require('@solana/spl-token');

const ENV = process.env.NUXT_ENV_SOL_NETWORK;
const SECONDS_PER_DAY = 24 * 60 * 60;

class FakeWallet {
  constructor (payer) {
    this.payer = payer;
  }

  get publicKey () {
    return this.payer.publicKey;
  }
}

let node = ENV;
if (!node.includes('http')) {
  node = anchor.web3.clusterApiUrl(ENV);
}
const web3 = new anchor.web3.Connection(node, 'confirmed');

export default {
  components: {
    ICountUp
  },
  props: ['stakeData', 'stakeEndDate'],
  data () {
    return {
      loading: false,
      program: null,
      provider: null,
      accounts: null,
      balance: null,
      amount: null,
      unstakeDays: 14,
      extraUnstakeDays: null,
      extendStake: false,
      unstakeForm: false,
      countdownFinished: false,
      topupPopup: false,
      extendPopup: false,
      rewardsProgram: null
    };
  },
  computed: {
    errors () {
      const errors = [];
      if (this.balance !== null && this.xNOS && parseFloat(this.balance) < this.xNOS) {
        errors.push('Balance too low');
      }
      let unstakeTime;
      if (this.userHasStakedBefore) {
        if (this.extraUnstakeDays) {
          unstakeTime = parseInt(this.stakeData.duration) + (this.extraUnstakeDays * SECONDS_PER_DAY);
        } else {
          unstakeTime = this.stakeData.duration;
        }
      } else {
        unstakeTime = this.unstakeDays * SECONDS_PER_DAY;
      }
      if (unstakeTime < (14 * SECONDS_PER_DAY)) {
        errors.push('Minimum unstake period is 14 days');
      }
      if (unstakeTime > (365 * SECONDS_PER_DAY)) {
        errors.push('Maximum unstake period is 365 days');
      }
      return errors;
    },
    userHasStakedBefore () {
      return this.stakeData !== null && (this.stakeData.user_id !== null && this.stakeData.user_id !== undefined);
    },
    loggedIn () {
      return this.$sol && this.$sol.publicKey;
    },
    NOS () {
      if (!this.userHasStakedBefore) {
        const amount = parseFloat(this.amount) || 0;
        return parseFloat(amount).toFixed(2);
      }
      const amount = parseFloat(this.amount) || 0;
      return (parseFloat(this.stakeData.amount / 1e6) + parseFloat(amount)).toFixed(2);
    },
    multiplier () {
      let unstakeTime;
      if (this.userHasStakedBefore) {
        if (this.extraUnstakeDays) {
          unstakeTime = parseInt(this.stakeData.duration) + (this.extraUnstakeDays * SECONDS_PER_DAY);
        } else {
          unstakeTime = this.stakeData.duration;
        }
      } else {
        unstakeTime = this.unstakeDays * SECONDS_PER_DAY;
      }
      const multiplierSeconds = (SECONDS_PER_DAY * 365) / 3; // 4 months
      const multiplier = unstakeTime / multiplierSeconds;
      return multiplier + 1;
    },
    xNOS () {
      if (!this.unstakeDays && !this.userHasStakedBefore) {
        return 0;
      }
      let amount = parseFloat(this.amount) || 0;
      let unstakeTime;
      if (this.userHasStakedBefore) {
        amount += this.stakeData.amount / 1e6;
        if (this.extraUnstakeDays) {
          unstakeTime = parseInt(this.stakeData.duration) + (this.extraUnstakeDays * SECONDS_PER_DAY);
        } else {
          unstakeTime = this.stakeData.duration;
        }
      } else {
        unstakeTime = this.unstakeDays * SECONDS_PER_DAY;
      }
      const multiplierSeconds = (SECONDS_PER_DAY * 365) / 3; // 4 months
      const multiplier = unstakeTime / multiplierSeconds;
      const xNOS = (parseFloat(amount) + parseFloat(amount) * multiplier).toFixed(2);
      this.$emit('x-nos', xNOS);
      return xNOS;
    }
  },
  watch: {
    '$sol.publicKey': function (pubkey) {
      if (pubkey) {
        const wallet = this.$sol.getWallet();
        if (wallet) {
          this.initAnchor(wallet);
        } else {
          this.$sol.loginModal = true;
        }
      }
    }
  },
  mounted () {
    console.log('initializing anchor client');
    let wallet = this.$sol.getWallet();
    if (!wallet) {
      wallet = new FakeWallet(anchor.web3.Keypair.generate());
    }
    this.initAnchor(wallet);
  },
  methods: {
    async initAnchor (wallet) {
      this.loading = true;
      this.provider = new anchor.AnchorProvider(web3, wallet, {});
      let userKey = wallet.publicKey;
      if (this.$auth && this.$auth.user) {
        userKey = new anchor.web3.PublicKey(this.$auth.user.address);
      }

      const programId = new anchor.web3.PublicKey(process.env.NUXT_ENV_STAKE_PROGRAM_ID);
      const rewardsProgramId = new anchor.web3.PublicKey(process.env.NUXT_ENV_REWARD_PROGRAM_ID);

      const mint = new anchor.web3.PublicKey(process.env.NUXT_ENV_NOS_TOKEN);
      const accounts = {
        // solana native
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        feePayer: userKey,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,

        // custom
        authority: userKey,
        ataFrom: await getAssociatedTokenAddress(mint, userKey),
        ataTo: await getAssociatedTokenAddress(mint, userKey),
        stake: undefined,
        stats: undefined,
        user: await getAssociatedTokenAddress(mint, userKey),
        vault: undefined,
        reward: undefined,
        mint
      };

      const idl = await anchor.Program.fetchIdl(process.env.NUXT_ENV_STAKE_PROGRAM_ID, this.provider);
      this.program = new anchor.Program(idl, programId, this.provider);

      const idlReward = await anchor.Program.fetchIdl(process.env.NUXT_ENV_REWARD_PROGRAM_ID, this.provider);
      this.rewardsProgram = new anchor.Program(idlReward, rewardsProgramId, this.provider);

      [accounts.vault] = await anchor.web3.PublicKey.findProgramAddress(
        [anchor.utils.bytes.utf8.encode('vault'), mint.toBuffer(), userKey.toBuffer()],
        programId
      );

      [accounts.stats] = await anchor.web3.PublicKey.findProgramAddress(
        [anchor.utils.bytes.utf8.encode('stats')],
        rewardsProgramId
      );
      [accounts.stake] = await anchor.web3.PublicKey.findProgramAddress(
        [anchor.utils.bytes.utf8.encode('stake'), mint.toBuffer(), userKey.toBuffer()],
        programId
      );
      [accounts.reward] = await anchor.web3.PublicKey.findProgramAddress(
        [anchor.utils.bytes.utf8.encode('reward'), userKey.toBuffer()],
        rewardsProgramId
      );

      await this.refreshStake();
      this.loading = false;
      this.accounts = accounts;
      this.getBalance();
    },
    async getBalance () {
      const account = await web3.getTokenAccountsByOwner(this.accounts.authority,
        { mint: this.accounts.mint });
      if (account && account.value && account.value.length > 0) {
        const tokenAddress = new anchor.web3.PublicKey(account.value[0].pubkey.toString());

        this.balance = (await web3.getTokenAccountBalance(
          tokenAddress
        )).value.uiAmount;
      } else {
        this.balance = 0;
      }
    },
    async topup () {
      try {
        this.loading = true;
        const decimals = 1e6;
        const stakeAmount = this.amount * decimals;

        const response = await this.program.methods
          .topup(new anchor.BN(stakeAmount))
          .accounts(this.accounts)
          .rpc();
        console.log(response);
        setTimeout(async () => {
          await this.refreshStake();
          this.amount = null;
        }, 1000);
        await this.getBalance();
        this.$modal.show({
          color: 'success',
          text: 'Successfully increased stake',
          title: ''
        });
        this.topupPopup = false;
      } catch (error) {
        this.amount = 0;
        this.extraUnstakeDays = 0;
        this.topupPopup = false;
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
      this.loading = false;
    },
    async stake () {
      if (this.userHasStakedBefore && this.amount) {
        return await this.topup();
      } else if (this.userHasStakedBefore && this.extraUnstakeDays) {
        return await this.extend();
      }

      try {
        const stakeDurationSeconds = this.unstakeDays * SECONDS_PER_DAY;
        const decimals = 1e6;
        const stakeAmount = this.amount * decimals;

        const response = await this.program.methods
          .stake(new anchor.BN(stakeAmount), new anchor.BN(stakeDurationSeconds))
          .accounts(this.accounts)
          .postInstructions([await this.rewardsProgram.methods.enter().accounts(this.accounts).instruction()])
          .rpc();
        console.log(response);
        setTimeout(async () => {
          await this.refreshStake();
        }, 1000);
        this.amount = null;
        await this.getBalance();
        this.$modal.show({
          color: 'success',
          text: 'Successfully staked NOS',
          title: 'Staked'
        });
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    async extend () {
      try {
        this.loading = true;
        const stakeDurationSeconds = this.extraUnstakeDays * SECONDS_PER_DAY;

        const response = await this.program.methods
          .extend(new anchor.BN(stakeDurationSeconds))
          .accounts(this.accounts)
          .rpc();
        console.log(response);
        setTimeout(async () => {
          await this.refreshStake();
          this.extraUnstakeDays = null;
        }, 1000);
        await this.getBalance();
        this.$modal.show({
          color: 'success',
          text: 'Successfully extented stake',
          title: 'Extended'
        });
        this.extendPopup = false;
      } catch (error) {
        this.amount = 0;
        this.extraUnstakeDays = 0;
        this.extendPopup = false;
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
      this.loading = false;
    },
    async unstake () {
      try {
        this.loading = true;
        const response = await this.program.methods
          .unstake()
          .accounts(this.accounts)
          .preInstructions([await this.rewardsProgram.methods.close().accounts(this.accounts).instruction()])
          .rpc();
        console.log(response);
        setTimeout(async () => {
          await this.refreshStake();
        }, 1000);
        this.amount = null;
        await this.getBalance();
        this.$modal.show({
          color: 'success',
          text: 'Successfully unstaked NOS',
          title: 'Unstaked'
        });
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
      this.loading = false;
    },
    async restake () {
      try {
        this.loading = true;
        const response = await this.program.methods
          .restake()
          .accounts(this.accounts)
          .postInstructions([await this.rewardsProgram.methods.enter().accounts(this.accounts).instruction()])
          .rpc();
        console.log(response);
        setTimeout(async () => {
          await this.refreshStake();
        }, 1000);
        this.amount = null;
        await this.getBalance();
        this.$modal.show({
          color: 'success',
          text: 'Successfully restaked NOS',
          title: 'Restaked!'
        });
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
      this.loading = false;
    },
    async claim () {
      try {
        this.loading = true;
        const response = await this.program.methods
          .claim()
          .accounts(this.accounts)
          .rpc();
        console.log(response);
        setTimeout(async () => {
          await this.refreshStake();
        }, 1000);
        this.amount = null;
        await this.getBalance();
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error.message,
          title: 'Error'
        });
      }
      this.loading = false;
    },
    async refreshStake () {
      await this.$stake.refreshStake();
    }
  }
};
</script>

<style scoped lang="scss">
.stake-block {
  border-radius: 4px;
  height: 100%;
}

.unstaked {
  max-width: 500px;
  width: 100%;
  text-align: center;
  margin: 0 auto;
}

.tabs ul {
  border-bottom-width: 0px;
  li {
    width: 50%;
    font-size: 18px;
    a {
      margin-bottom: 0;
    }
    &.is-active {
      background-color: transparent !important;
    }
    &.is-inactive {
      opacity: .4;
      a {
        cursor: not-allowed;
        &:hover {
          color: $text;
        }
      }
    }
  }
}

.scores {
  min-width: fit-content;
  h2 {
    font-family: $family-sans-serif;
  }
  p {
    font-size: 14px;
  }
  .box {
    border: none;
  }
}

.your-stake {
  .scores .box {
    min-width: 180px;
    border: none;
  }
}

.balances {
  .balance {
    border-left: 1px solid $grey-dark;
  }
}

form {
  button {
    width: 100%;
  }
  .column .has-background-grey-lighter {
    height: 100%;
  }
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
  }
  input[type="number"] {
      -moz-appearance: textfield;
  }
  .buttons button {
    width: 45px;
    height: 22px;
  }
  .amount-logo {
    border-right: 1px solid $grey-darker;
  }
}

.extend-btn {
  display: block;
  font-size: 14px;
  margin: 0 auto;

}

.stake-popup {
  z-index: 39;
  .scores {
    h2 {
      font-size: 1.1rem;
    }
    p {
      font-size: 0.75rem;
    }
  }
}
</style>
