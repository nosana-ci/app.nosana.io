<template>
  <div class="stake-block">
    <!-- Extend popup -->
    <div class="modal stake-popup" :class="{ 'is-active': extendPopup }">
      <div class="modal-background" @click="extendPopup = false, amount = 0, extraUnstakeDays = 0" />
      <div v-if="stakeData && stakeData.duration" class="modal-content has-background-white has-radius-medium p-5">
        <h3 class="has-text-centered subtitle is-4 has-text-weight-semibold">
          Extend the unstake period
        </h3>
        <form class="is-fullwidth" @submit.prevent="stake">
          <div
            class="mt-5 has-radius-medium has-text-centered columns
            is-flex is-align-items-center is-multiline has-background-grey-lighter m-0 py-5"
          >
            <div class="column is-8 is-full-mobile">
              <div class="is-flex is-align-items-center is-justify-content-center">
                <span>Extend the unstake period with</span>
                <div class="is-flex is-align-items-center is-flex-direction-columns">
                  <button
                    class="px-2 button is-accent is-outlined has-text-weight-semibold is-uppercase is-size-7"
                    style="width: 45px; height: 22px; margin-left: 10px;"
                    @click.prevent="
                      extraUnstakeDays = 365 - parseInt($moment.duration(stakeData.duration, 'seconds').asDays())"
                  >
                    Max
                  </button>
                  <input
                    v-model="extraUnstakeDays"
                    required
                    class="input mx-2 py-5 has-background-grey-light has-text-centered"
                    type="number"
                    :min="1"
                    step="0.1"
                    :max="365 - parseInt($moment.duration(stakeData.duration, 'seconds').asDays())"
                    placeholder="0"
                    style="width: auto;"
                  >
                </div>
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
                <div class="box has-text-centered p-2">
                  <h2 class="title is-4 has-text-success mb-0">
                    <ICountUp :end-val="parseFloat(multiplier)" :options="{ decimalPlaces: 2, prefix: 'x' }" />
                  </h2>
                  <p>multiplier</p>
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
            Connect wallet
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
              <span @click="amount = parseInt(balance)">{{ balance }} NOS</span>
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
                        step="0.1"
                        type="number"
                        placeholder="0"
                        style="width: 100px; height: 35px; border: none;"
                      >
                      <span class="is-size-7 pt-3 pl-2">NOS</span>
                    </div>

                    <div class="buttons are-small">
                      <button
                        class="px-2 mr-1 button is-accent is-outlined has-text-weight-semibold is-uppercase"
                        @click.prevent="amount = parseInt((balance/2))"
                      >
                        Half
                      </button>
                      <button
                        class="px-2 button is-accent is-outlined has-text-weight-semibold is-uppercase is-size-7"
                        @click.prevent="amount = parseInt(balance)"
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
                  <div class="box has-text-centered">
                    <h2 class="title is-4 has-text-success mb-0">
                      <ICountUp :end-val="parseFloat(NOS)" :options="{ decimalPlaces: 2 }" />
                    </h2>
                    <p>NOS</p>
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
                Connect wallet
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
            <div v-if="!userHasStakedBefore && loggedIn" class="balances columns">
              <div class="column is-two-thirds">
                <div class="balance pl-3">
                  <span v-if="balance === null" class="is-size-7">Loading..<br></span>
                  <span v-else class="is-size-7">NOS Balance<br></span>
                  <span @click="amount = parseInt(balance)">{{ balance }} NOS</span>
                  <a v-if="balance === 0" href="https://nosana.io/token" target="_blank" class="is-size-7">Buy NOS tokens</a>
                </div>
              </div>
            </div>

            <!--- Form --->
            <form
              v-if="!userHasStakedBefore"
              @submit.prevent="stakeConfirm"
            >
              <div class="mt-5 columns is-multiline">
                <div class="column" style="min-width:fit-content">
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
                            step="0.1"
                            type="number"
                            placeholder="0"
                            style="width: 100px; height: 35px; border: none;"
                          >
                          <span class="is-size-7 pl-2 pr-2">NOS</span>
                        </div>

                        <div class="buttons are-small">
                          <button
                            class="px-2 mr-1 button is-accent is-outlined has-text-weight-semibold is-uppercase"
                            @click.prevent="amount = parseInt((balance/2))"
                          >
                            Half
                          </button>
                          <button
                            class="px-2 button is-accent is-outlined has-text-weight-semibold is-uppercase is-size-7"
                            @click.prevent="amount = parseInt(balance)"
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
                          step="0.1"
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
                <div class="column scores first-stake">
                  <div
                    class="has-background-grey-lighter has-radius-medium p-3"
                  >
                    <div class="box has-text-centered mt-2 p-4" style="min-width: 149px">
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
                  @click.stop.prevent="$sol.loginModal = true; $sol.skipLogin = true"
                >
                  Connect wallet
                </button>
                <button v-else type="submit" class="button is-accent" :class="{'is-loading': loading}">
                  Stake NOS
                </button>
                <br>
                <br>
                <div class="has-text-centered">
                  <a
                    href="https://github.com/nosana-ci/nosana-programs/blob/main/audits/NOSANA_STAKING_REPORT_2.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <small>Nosana staking audit report</small>
                  </a>
                  <br><small>For more information visit <a target="_blank" href="https://nosana.io/stake/">FAQ</a></small>
                </div>
              </div>
            </form>
            <div v-else class="your-stake">
              <h3 class="has-text-centered subtitle is-4 has-text-weight-semibold">
                Your stake
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
                </div>
              </div>
              <p class="is-size-7 has-text-centered">
                Unstake period of {{ $moment.duration(stakeData.duration, 'seconds').asDays() }} days
              </p>
              <button
                v-if="stakeData.duration/(3600*24) < 365"
                class="button is-accent is-light extend-btn mt-3 px-6"
                @click="extendPopup = true, amount = 0, extraUnstakeDays = 0"
              >
                Extend unstake period
              </button>
              <p v-else class="has-text-centered is-size-7 has-text-accent has-font-weight-bold">
                Maximum unstake duration!
              </p>
              <div v-if="$stake.accounts" class="mt-6 mb-3">
                <div class="is-flex is-align-items-center">
                  <span class="is-size-7">Stake Account</span>
                  <a
                    target="_blank"
                    :href="`${$sol.explorer}/address/${$stake.accounts.stake}/anchor-account`"
                    class="ml-auto is-size-7"
                  >View on Solana explorer</a>
                </div>
                <hr class="my-2">
                <div class="is-flex is-align-items-center">
                  <span class="is-size-7">Stake Vault</span>
                  <a
                    target="_blank"
                    :href="`${$sol.explorer}/address/${$stake.accounts.vault}/tokens`"
                    class="ml-auto is-size-7"
                  >View on Solana explorer</a>
                </div>
                <hr class="my-2">
                <div class="is-flex is-align-items-center">
                  <span class="is-size-7">Reward Account</span>
                  <a
                    target="_blank"
                    :href="`${$sol.explorer}/address/${$stake.accounts.reward}/anchor-account`"
                    class="ml-auto is-size-7"
                  >View on Solana explorer</a>
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
              <div class="has-text-centered">
                <a
                  href="https://github.com/nosana-ci/nosana-programs/blob/main/audits/NOSANA_STAKING_REPORT_2.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <small>Nosana staking audit report</small>
                </a>
                <br><small>For more information visit <a target="_blank" href="https://nosana.io/stake/">FAQ</a></small>
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
                Be aware that after you unstake, your tokens will be released linearly over the duration
                of your unstaking period, and you will not receive any rewards during this time.<br><br>
                If you were to unstake now, you can claim your tokens on:
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
                Connect wallet
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
            <div class="has-text-centered is-block mb-1">
              <h5 class="mb-0" style="line-height: 1rem;">
                Unstaked at:
              </h5>
              <span class="is-size-7">{{ $moment.unix(stakeData.time_unstake).local() }}</span><br>

              <div class="has-background-grey-lighter has-radius-medium p-3 pb-4 mt-5">
                <h5 v-if="!countdownFinished" class="mb-3">
                  All tokens will be released in
                </h5>
                <client-only>
                  <countdown :end-time="stakeEndDate.toString()">
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
                      <h1 class="title">Claim back your tokens:</h1>
                      <button
                        v-if="!loggedIn"
                        class="button is-accent is-outlined has-text-weight-semibold mt-2"
                        @click.stop.prevent="$sol.loginModal = true"
                      >
                        Connect Wallet
                      </button>
                      <button
                        v-else-if="userHasStakedBefore"
                        class="button is-accent mt-2"
                        :class="{'is-loading': loading}"
                        @click.stop="close"
                      >
                        Claim <span v-if="vaultBalance">&nbsp;{{ Math.floor(vaultBalance) }}&nbsp;</span> NOS
                      </button>
                    </span>
                  </countdown>
                </client-only>
              </div>
            </div>
          </div>

          <div v-if="!countdownFinished" class="mt-5 has-text-centered">
            <div class="box has-background-light">
              <p>Withdrawable tokens</p>
              <h2 class="title is-3 has-text-success mb-0">
                <ICountUp
                  class="is-family-monospace"
                  :end-val="parseFloat(withdrawAvailable)"
                  :options="{ decimalPlaces: 4, duration:0.1 }"
                  style="opacity:0"
                />
                <ICountUp
                  class="is-family-monospace"
                  :end-val="parseFloat(withdrawAvailable)"
                  :options="{ decimalPlaces: 4, duration:1 }"
                  style="position:absolute;width: 100%;text-align: center;left: 0;"
                />
              </h2>
              <p>NOS</p>
            </div>
            <button
              v-if="!loggedIn"
              class="button is-accent is-fullwidth has-text-weight-semibold"
              @click.stop.prevent="$sol.loginModal = true"
            >
              Connect wallet
            </button>
            <button
              v-else-if="userHasStakedBefore"
              type="submit"
              class="button is-fullwidth is-accent"
              :class="{'is-loading': loading}"
              @click="restake"
            >
              Restake<span v-if="vaultBalance">&nbsp;{{ Math.floor(vaultBalance) }}&nbsp;</span> NOS
            </button>
            <button
              v-if="userHasStakedBefore && loggedIn"
              type="submit"
              class="button is-fullwidth is-accent is-outlined mt-2"
              :class="{'is-loading': loading}"
              @click="withdraw"
            >
              Withdraw released tokens
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ICountUp from 'vue-countup-v2';
const anchor = require('@project-serum/anchor');

const SECONDS_PER_DAY = 24 * 60 * 60;

class FakeWallet {
  constructor (payer) {
    this.payer = payer;
  }

  get publicKey () {
    return this.payer.publicKey;
  }
}

export default {
  components: {
    ICountUp
  },
  data () {
    return {
      loading: false,
      balance: null,
      amount: null,
      unstakeDays: 14,
      extraUnstakeDays: null,
      extendStake: false,
      unstakeForm: false,
      topupPopup: false,
      extendPopup: false,
      interval: null,
      withdrawAvailable: 0,
      vaultBalance: null,
      date: new Date(process.env.NUXT_ENV_REWARD_COUNTDOWN)
    };
  },
  computed: {
    errors () {
      const errors = [];
      if (this.balance !== null && this.amount && parseFloat(this.balance) < this.amount) {
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
        errors.push('The minimum unstake period is 14 days');
      }
      if (unstakeTime > (365 * SECONDS_PER_DAY)) {
        errors.push('The maximum unstake period is 365 days');
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
      const xNOS = !this.stakeEndDate ? (parseFloat(amount) + parseFloat(amount) * multiplier).toFixed(2) : 0;
      this.$emit('x-nos', xNOS);
      return xNOS;
    },
    stakeData () {
      return this.$stake ? this.$stake.stakeData : null;
    },
    stakeEndDate () {
      return this.$stake ? this.$stake.stakeEndDate : null;
    },
    countdownFinished: {
      get () {
        return this.stakeEndDate ? (new Date() > this.stakeEndDate) : false;
      },
      set (val) {
        this.countdownFinished = val;
      }
    }
  },
  watch: {
    '$stake.accounts': function () {
      this.getBalance();
    },
    '$sol.publicKey': function (pubkey) {
      if (pubkey) {
        const wallet = this.$sol.getWallet();
        if (wallet) {
          this.$stake.setupPrograms(wallet);
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
    this.$stake.setupPrograms(wallet);
    if (this.$stake.accounts) {
      this.getBalance();
    }
    if (!this.interval) {
      this.interval = setInterval(() => {
        this.calculateWithdrawable();
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
    async getBalance () {
      this.balance = await this.$stake.getBalance(this.$stake.accounts.authority);
      this.vaultBalance = await this.$stake.getBalance(this.$stake.accounts.vault);
    },
    async topup () {
      try {
        this.loading = true;
        const decimals = 1e6;
        const stakeAmount = this.amount * decimals;
        const preInstructions = [];

        preInstructions.push(await this.$stake.poolProgram.methods
          .claimFee()
          .accounts(this.$stake.poolAccounts).instruction());

        // if reward account doesn't exists yet, create it
        if (!this.$stake.rewardInfo || !this.$stake.rewardInfo.rewardAccount) {
          preInstructions.push(await this.$stake.rewardsProgram.methods
            .enter().accounts(this.$stake.accounts).instruction()
          );
        }

        const response = await this.$stake.program.methods
          .topup(new anchor.BN(stakeAmount))
          .accounts(this.$stake.accounts)
          .preInstructions(preInstructions)
          .postInstructions([
            await this.$stake.rewardsProgram.methods
              .sync().accounts({ ...this.$stake.accounts, vault: this.$stake.rewardVault }).instruction()])
          .rpc();
        console.log(response);
        setTimeout(async () => {
          await this.refreshStake();
          this.amount = null;
        }, 1000);
        await this.getBalance();
        this.$modal.show({
          color: 'success',
          text: 'Your stake has been increased successfully.',
          title: 'Stake increased'
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
    stakeConfirm () {
      this.$modal.show({
        color: 'info',
        text:
          'Are you aware you will not have access to your tokens until you unstake AND the unstake duration has passed?\n\n' +
          'For more information about Nosana staking click <a class="has-text-accent" href="https://nosana.io/stake" target="_blank">here</a>.',
        title: 'Are you sure you want to stake?',
        onConfirm: () => {
          this.stake();
        }
      });
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

        const response = await this.$stake.program.methods
          .stake(new anchor.BN(stakeAmount), new anchor.BN(stakeDurationSeconds))
          .accounts(this.$stake.accounts)
          .preInstructions([
            await this.$stake.poolProgram.methods
              .claimFee()
              .accounts(this.$stake.poolAccounts).instruction()
          ])
          .postInstructions(
            [await this.$stake.rewardsProgram.methods.enter().accounts(this.$stake.accounts).instruction()])
          .rpc();
        console.log(response);
        setTimeout(async () => {
          await this.refreshStake();
        }, 1000);
        this.amount = null;
        await this.getBalance();
        this.$modal.show({
          color: 'success',
          text: 'Nos has been staked successfully.',
          title: 'Staked NOS'
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

        const response = await this.$stake.program.methods
          .extend(new anchor.BN(stakeDurationSeconds))
          .accounts(this.$stake.accounts)
          .preInstructions([
            await this.$stake.poolProgram.methods
              .claimFee()
              .accounts(this.$stake.poolAccounts).instruction()
          ])
          .postInstructions([
            await this.$stake.rewardsProgram.methods
              .sync().accounts({ ...this.$stake.accounts, vault: this.$stake.rewardVault }).instruction()])
          .rpc();

        console.log(response);
        setTimeout(async () => {
          await this.refreshStake();
          this.extraUnstakeDays = null;
        }, 1000);
        await this.getBalance();
        this.$modal.show({
          color: 'success',
          text: 'Your stake has been extended successfully.',
          title: 'Extended Stake'
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
      this.loading = true;
      // check if user has has reward account
      const preInstructions = [];
      try {
        const rewardAccount = (
          await this.$stake.rewardsProgram.account.rewardAccount.fetch(this.$stake.accounts.reward)).reflection;
        console.log('User has reward account', rewardAccount);
        preInstructions.push(
          await this.$stake.poolProgram.methods
            .claimFee()
            .accounts(this.$stake.poolAccounts).instruction(),
          await this.$stake.rewardsProgram.methods
            .claim()
            .accounts({ ...this.$stake.accounts, vault: this.$stake.rewardVault }).instruction(),
          await this.$stake.rewardsProgram.methods.close().accounts(this.$stake.accounts).instruction()
        );
      } catch (error) {
        if (!error.message.includes('Account does not exist')) {
          this.$modal.show({
            color: 'danger',
            text: error,
            title: 'Error'
          });
        }
      }

      try {
        await this.$stake.program.methods
          .unstake()
          .accounts(this.$stake.accounts)
          .preInstructions(preInstructions)
          .rpc();

        setTimeout(async () => {
          await this.refreshStake();
        }, 1000);
        this.amount = null;
        await this.getBalance();
        this.$modal.show({
          color: 'success',
          text: 'NOS has been unstaked successfully.',
          title: 'Unstaked NOS'
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
        const response = await this.$stake.program.methods
          .restake()
          .accounts(this.$stake.accounts)
          .preInstructions([
            await this.$stake.poolProgram.methods
              .claimFee()
              .accounts(this.$stake.poolAccounts).instruction()
          ])
          .postInstructions(
            [await this.$stake.rewardsProgram.methods.enter().accounts(this.$stake.accounts).instruction()])
          .rpc();
        console.log(response);
        setTimeout(async () => {
          await this.refreshStake();
        }, 1000);
        this.amount = null;
        await this.getBalance();
        this.$modal.show({
          color: 'success',
          text: 'NOS has been restaked successfully.',
          title: 'Restaked NOS!'
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
    async close () {
      try {
        this.loading = true;
        // const response = await this.$stake.program.methods
        //   .close()
        //   .preInstructions([
        //     await this.$stake.program.methods
        //       .withdraw()
        //       .accounts(this.$stake.accounts)
        //       .instruction()
        //   ])
        //   .accounts(this.$stake.accounts)
        //   .rpc();

        await this.$stake.program.methods
          .withdraw()
          .accounts(this.$stake.accounts)
          .rpc();
        const response = await this.$stake.program.methods
          .close()
          .accounts(this.$stake.accounts)
          .rpc();
        console.log(response);
        this.$modal.show({
          color: 'success',
          text: 'Your NOS has been reclaimed successfully.',
          title: 'Withdrawed NOS!'
        });
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
    },
    async withdraw () {
      try {
        this.loading = true;
        const response = await this.$stake.program.methods
          .withdraw()
          .accounts(this.$stake.accounts)
          .rpc();
        console.log(response);
        this.amount = null;
        this.$modal.show({
          color: 'success',
          text: 'Your NOS has been withdrawn successfully.',
          title: 'Withdrawn NOS!'
        });
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error.message,
          title: 'Error'
        });
      }
      setTimeout(async () => {
        await this.refreshStake();
      }, 1000);
      await this.getBalance();
      this.loading = false;
    },
    calculateWithdrawable () {
      if (this.stakeData && this.stakeData.time_unstake && this.vaultBalance) {
        const now = new Date().getTime();
        const emission = parseFloat(parseInt(this.stakeData.amount) / parseInt(this.stakeData.duration));
        const secondsBetween = parseInt(now / 1000) - parseInt(this.stakeData.time_unstake);

        const tokensReleased = emission * secondsBetween;
        const withdrawn = (parseInt(this.stakeData.amount) - (this.vaultBalance * 1e6));
        const available = Math.min(tokensReleased - withdrawn, this.vaultBalance * 1e6);

        this.withdrawAvailable = +(available / 1e6);
      }
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
@media only screen and (max-width: 1618px) {
  .first-stake {
    > div {
      display:flex;
      justify-content: center;
      flex-wrap:wrap;
      align-items: center;
      .box {
        margin: 5px 10px !important;
      }
    }
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
  @media screen and (min-width: $tablet) {
    .modal-content, .modal-card {
      width: 700px;
    }
  }
}
</style>
