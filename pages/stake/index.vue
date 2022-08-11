<template>
  <section class="section">
    <!-- {{stakeData}}<br>
    userHasStakedBefore?: {{userHasStakedBefore}} -->
    <div v-if="loading" class="loader-wrapper is-active">
      <div class="loader is-loading" />
    </div>
    <h1 class="title is-4">
      Earn by staking
    </h1>
    <p>Stake NOS and generate $NOS and $xNOS</p>

    <div class="columns mt-6">
      <div class="column is-half stake-block">
        <div class="has-background-light">
          <div class="tabs">
            <ul>
              <li
                class="has-background-secondary px-4"
                :class="{'is-active': unstakeForm === false}"
                @click="unstakeForm = false"
              >
                <a class="p-4">Stake</a>
              </li>
              <li
                v-if="userHasStakedBefore"
                class="has-background-secondary px-4"
                :class="{'is-active': unstakeForm === true}"
                @click="unstakeForm = true"
              >
                <a class="p-4">Unstake</a>
              </li>
            </ul>
          </div>

          <div class="p-5">
            <div v-if="!stakeEndDate" class="container">
              <div v-if="!unstakeForm">
                <!--- Balances --->
                <div class="balances columns">
                  <div class="column is-two-thirds">
                    <div class="balance pl-3">
                      <span v-if="balance === null" class="is-size-7">Loading..<br></span>
                      <span v-else class="is-size-7">NOS Balance<br></span>
                      <span @click="amount = balance">{{ balance }} NOS</span>
                      <a v-if="balance === 0" href="https://nosana.io/token" target="_blank">Buy NOS tokens</a>
                    </div>
                  </div>
                  <div class="column is-one-third">
                    <div class="balance pl-3">
                      <span class="is-size-7">Staked<br></span>
                      <span v-if="stakeData && stakeData.amount">
                        {{ parseFloat(stakeData.amount/1e6) }}
                      </span>
                      <span v-else>0</span>
                      <small class="is-size-6">NOS</small>
                    </div>
                  </div>
                </div>

                <!-- Extra tabs topup&extend, what to do with these? -->
                <div>
                  <div v-if="userHasStakedBefore" class="tabs">
                    <ul>
                      <li @click="extendStake = false" :class="{'is-active': extendStake === false}"><a>Topup</a></li>
                      <li :class="{'is-active': extendStake === true}" @click="extendStake = true"><a>Extend</a></li>
                    </ul>
                  </div>
                </div>

                <!--- Form --->
                <form class="mt-5 columns is-multiline is-flex" @submit.prevent="stake">
                  <div class="column is-two-thirds">
                    <div class="form-inputs has-background-grey-lighter has-radius-medium p-3">
                      <div v-if="!extendStake" class="field">
                        <label class="label">NOS amount</label>
                        <div class="control">
                          <input
                            v-model="amount"
                            required
                            class="input"
                            :max="balance"
                            min="1"
                            step="0.00000001"
                            type="number"
                            placeholder="0.00 NOS"
                          >
                        </div>
                      </div>
                      <div v-if="userHasStakedBefore && extendStake" class="field">
                        <label class="label">Add extra unstake days</label>
                        <div class="control">
                          <input
                            v-model="extraUnstakeDays"
                            required
                            class="input"
                            type="number"
                            :min="1"
                            :max="365 - parseInt($moment.duration(stakeData.duration, 'seconds').asDays())"
                            placeholder="0 days"
                          >
                        </div>
                      </div>
                      <div v-else-if="!userHasStakedBefore" class="field">
                        <label class="label">Unstake Days</label>
                        <div class="control">
                          <input
                            v-model="unstakeDays"
                            required
                            class="input"
                            type="number"
                            :min="31"
                            :max="365"
                            placeholder="0 days"
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- (New) Scores -->
                  <div class="column is-one-third">
                    <div class="has-background-grey-lighter has-radius-medium p-3">
                      <div class="box has-text-centered">
                        <h2 class="title is-4 has-text-success mb-1">
                          <ICountUp :end-val="parseFloat(NOS)" :options="{ decimalPlaces: 2 }" />
                        </h2>
                        <span>NOS</span>
                      </div>
                      <div class="box has-text-centered">
                        <h2 class="title is-4 has-text-success mb-1">
                          <ICountUp :end-val="parseFloat(xNOS)" :options="{ decimalPlaces: 2 }" />
                        </h2>
                        <span>xNOS</span>
                      </div>
                    </div>
                  </div>

                  <div class="column is-whole">
                    <!-- Buttons -->
                    <button
                      v-if="!loggedIn"
                      class="button is-accent is-outlined has-text-weight-semibold"
                      @click.stop.prevent="$sol.loginModal = true"
                    >
                      Connect Wallet
                    </button>
                    <button
                      v-else-if="userHasStakedBefore && extendStake"
                      type="submit"
                      class="button is-accent"
                      :class="{'is-loading': loading}"
                    >
                      Extend with {{ extraUnstakeDays }} days
                    </button>
                    <button
                      v-else-if="userHasStakedBefore"
                      type="submit"
                      class="button is-accent"
                      :class="{'is-loading': loading}"
                    >
                      Topup with {{ amount }} NOS
                    </button>
                    <button v-else type="submit" class="button is-accent" :class="{'is-loading': loading}">
                      Stake {{ amount }} NOS
                    </button>
                  </div>
                </form>
              </div>

              <!--- Unstake form --->
              <div v-if="unstakeForm && userHasStakedBefore">
                <h1 class="title is-spaced">
                  Unstake
                </h1>
                <p>Lorem ipsum unstake time</p>
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
            <!-- Time unstake is not 0, so show countdown + restake stuff -->
            <div v-if="userHasStakedBefore && stakeEndDate" class="container">
              <span v-if="countdownFinished">
                Claim your tokens!<br>
              </span>
              <span v-else>
                You have unstaked your tokens.<br>
                Unstaked at: {{ $moment.unix(stakeData.time_unstake).toDate() }}<br>

                They will be released in
              </span>
              <client-only>
                <countdown :end-time="new Date(stakeEndDate)" @finish="countdownFinished = true">
                  <span
                    slot="process"
                    slot-scope="{ timeObj }">
                    <h2 class="title py-1 has-text-weight-medium">{{
                      `${timeObj.d}:${timeObj.h}:${timeObj.m}:${timeObj.s}`
                    }}</h2></span>
                  <span slot="finish">
                    <button
                      v-if="!loggedIn"
                      class="button is-accent is-outlined has-text-weight-semibold"
                      @click.stop.prevent="$sol.loginModal = true"
                    >
                      Connect Wallet
                    </button>
                    <button
                      v-else
                      @click.stop.prevent="claim()"
                      class="button is-accent"
                      :class="{'is-loading': loading}"
                    >
                      Claim {{ parseFloat(stakeData.amount)/1e6 }} NOS
                    </button>
                  </span>
                </countdown>
              </client-only>

              <form v-if="!countdownFinished" @submit.prevent="restake">
                Or restake them here: <br>
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
                  Restake {{ parseFloat(stakeData.amount)/1e6 }} NOS
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div class="column is-half">
        <div class="stake-block p-5 has-background-light">
          Tiers
        </div>
      </div>
    </div>

    <div class="columns">
      <div class="column is-half">
        <div class="stake-block p-5 has-background-light">
          Countdown
        </div>
      </div>

      <div class="column is-half">
        <div class="stake-block p-5 has-background-light">
          Subscribe
        </div>
      </div>
    </div>
  </section>
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
      countdownFinished: false
    };
  },
  computed: {
    userHasStakedBefore () {
      return this.stakeData !== null && (this.stakeData.user_id !== null && this.stakeData.user_id !== undefined);
    },
    loggedIn () {
      return this.$sol && this.$sol.publicKey;
    },
    NOS () {
      console.log('this.userHasStakedBefore', this.unstakeDays);
      if (!this.userHasStakedBefore) {
        const amount = parseFloat(this.amount) || 0;
        return parseFloat(amount).toFixed(2);
      }
      const amount = parseFloat(this.amount) || 0;
      return (parseFloat(this.stakeData.amount / 1e6) + parseFloat(amount)).toFixed(2);
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
      return (parseFloat(amount) + parseFloat(amount) * multiplier).toFixed(2);
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
    async initAnchor (wallet) {
      this.loading = true;
      this.provider = new anchor.AnchorProvider(web3, wallet, {});
      let userKey = wallet.publicKey;
      if (this.$auth && this.$auth.user) {
        userKey = new anchor.web3.PublicKey(this.$auth.user.address);
      }

      const programId = new anchor.web3.PublicKey(process.env.NUXT_ENV_STAKE_PROGRAM_ID);
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
        ataVault: undefined,
        ataTo: await getAssociatedTokenAddress(mint, userKey),
        stake: undefined,
        stats: undefined,
        mint
      };

      const idl = await anchor.Program.fetchIdl(process.env.NUXT_ENV_STAKE_PROGRAM_ID, this.provider);
      this.program = new anchor.Program(idl, programId, this.provider);
      // get pda
      const [ataVault, bump] = await anchor.web3.PublicKey.findProgramAddress(
        [mint.toBuffer()],
        programId
      );
      accounts.ataVault = ataVault;
      console.log(ataVault.toString(), bump);

      [accounts.stats] = await anchor.web3.PublicKey.findProgramAddress(
        [anchor.utils.bytes.utf8.encode('stats')],
        programId
      );
      [accounts.stake] = await anchor.web3.PublicKey.findProgramAddress(
        [anchor.utils.bytes.utf8.encode('stake'), mint.toBuffer(), userKey.toBuffer()],
        programId
      );
      try {
        this.stakeData = await this.refreshStake();
      } catch (e) {
        if (!e.message.includes('Account does not exist')) {
          this.$modal.show({
            color: 'danger',
            text: e,
            title: 'Error'
          });
        } else {
          this.stakeData = false;
        }
      }
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
          this.stakeData = await this.refreshStake();
          this.amount = null;
        }, 1000);
        await this.getBalance();
        this.$modal.show({
          color: 'success',
          text: 'Successfully topped up stake',
          title: ''
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
          .rpc();
        console.log(response);
        setTimeout(async () => {
          this.stakeData = await this.refreshStake();
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
          this.stakeData = await this.refreshStake();
          this.extraUnstakeDays = null;
        }, 1000);
        await this.getBalance();
        this.$modal.show({
          color: 'success',
          text: 'Successfully extented stake',
          title: 'Extended'
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
    async unstake () {
      try {
        this.loading = true;
        const response = await this.program.methods
          .unstake()
          .accounts(this.accounts)
          .rpc();
        console.log(response);
        setTimeout(async () => {
          this.stakeData = await this.refreshStake();
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
          .rpc();
        console.log(response);
        setTimeout(async () => {
          this.stakeData = await this.refreshStake();
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
          this.stakeData = await this.refreshStake();
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
      const stakeData = await this.$axios.$get('/user/stake');
      if (stakeData && stakeData.user_id && parseInt(stakeData.time_unstake) !== 0 && parseInt(stakeData.time_unstake) !== '00') {
        this.stakeEndDate = this.$moment.unix(stakeData.time_unstake).add(stakeData.duration, 's');
        // this.stakeEndDate = this.$moment.unix(1659698174);
      } else {
        this.stakeEndDate = null;
      }
      return stakeData;
    }
  }
};
</script>

<style scoped lang="scss">
.stake-block {
  border-radius: 4px;
  height: 100%;
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
}
</style>
