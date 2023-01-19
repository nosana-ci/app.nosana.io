<template>
  <div>
    <section class="section">
      <div v-if="userRepositories === null">
        <h1 class="title">
          Loading..
        </h1>
      </div>
      <div v-else-if="showTutorial">
        <div class="columns mt-3">
          <div class="column is-4">
            <h1 class="title is-4">
              Get Started
            </h1>
          </div>
        </div>
        <p class="has-limited-width">
          Install the Nosana Github App, which will have read-only permission to your selected repositories.
          After you have installed the app, you can add your repositories and manage their pipelines.
          You can specify on which triggers (e.g. commits on the main branch) pipelines are automatically being
          posted to the blockchain
        </p>
        <div class="columns mt-4">
          <div class="column is-10">
            <div class="columns">
              <div class="column is-one-third">
                <nuxt-link
                  class="box is-secondary step"
                  :class="{'has-background-white': user && userRepositories && userRepositories.length > 0,
                           'disabled': !loggedIn}"
                  to="/repositories/new"
                >
                  <!-- <div class="is-flex is-justify-content-space-between">
                    <div>1</div>
                    <div
                      v-if="user && userRepositories && userRepositories.length > 0"
                    >
                      <img :src="require('@/assets/img/icons/done.svg')">
                    </div>
                    <div v-else>
                      <img :src="require('@/assets/img/icons/pending.svg')">
                    </div>
                  </div> -->
                  <div class="has-text-centered my-2">
                    <img v-if="loggedIn" src="~assets/img/icons/repository.svg">
                    <img v-else src="~assets/img/icons/repository_grey.svg">
                    <h2 class="subtitle has-text-weight-bold mt-4">
                      Add first Repository
                    </h2>
                  </div>
                </nuxt-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="columns">
        <div class="column is-2">
          <div class="box">
            <small>Balance</small>
            <div class="has-text-weight-semibold">
              <span
                v-if="!balance && balance !== 0"
              >...</span>
              <span v-else>{{ Math.trunc(balance*10000)/10000 }}</span> <span class="has-text-accent">NOS</span>
            </div>
          </div>
        </div>
        <div class="column is-2">
          <div class="box">
            <small>Used for Jobs</small>
            <div class="has-text-weight-semibold">
              {{ usedBalance }} <span class="has-text-accent">NOS</span>
            </div>
          </div>
        </div>
        <div class="column is-2">
          <div class="box">
            <small>NOS Rewards</small>
            <div class="has-text-weight-semibold">
              {{ reward }} <span class="has-text-accent">NOS</span>
            </div>
          </div>
        </div>
        <div class="column is-2">
          <div v-if="user">
            <button class="button is-accent is-outlined" @click.prevent="depositPopup = true;">
              Deposit NOS
            </button>
          </div>
        </div>
      </div>

      <!-- Projects -->
      <div v-if="!showTutorial" class="columns mt-3">
        <div class="column is-4">
          <h1 class="title is-4">
            Projects
          </h1>
        </div>
      </div>
      <div v-if="!showTutorial" class="mb-6">
        <nuxt-link to="/repositories/new" class="button is-accent is-outlined is-pulled-right">
          Add Repository
        </nuxt-link>
        <h2 class="subtitle has-text-weight-semibold">
          Your Repositories
        </h2>

        <repository-list :repositories="userRepositories" />
      </div>
    </section>

    <!-- Deposit popup -->
    <div class="modal deposit-popup" :class="{ 'is-active': depositPopup }">
      <div class="modal-background" @click="depositPopup = false,depositAmount = 0" />
      <div class="modal-content">
        <div class="modal-content has-background-white has-radius-medium p-5">
          <h3 class="has-text-centered subtitle is-4 has-text-weight-semibold">
            Deposit
          </h3>
          <div class="balances is-flex">
            <div class="balance pl-3">
              <span v-if="walletBalance === null" class="is-size-7">Loading..<br></span>
              <span v-else class="is-size-7">NOS Wallet Balance<br></span>
              <span @click="depositAmount = parseInt(walletBalance)">{{ walletBalance }} NOS</span>
              <a v-if="walletBalance === 0" href="https://nosana.io/token" target="_blank" class="is-size-7">Buy NOS tokens</a>
            </div>
          </div>
          <form class="is-fullwidth" @submit.prevent="deposit">
            <div
              class="mt-5 has-radius-medium has-text-centered columns
              is-flex is-align-items-center is-multiline has-background-grey-lighter m-0 py-5"
            >
              <div class="column is-full">
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
                        v-model="depositAmount"
                        required
                        class="input has-background-grey-light ml-3 my-3"
                        :max="walletBalance"
                        min="1"
                        step="0.1"
                        type="number"
                        placeholder="0"
                        style="width: 250px; height: 35px; border: none;"
                      >
                      <span class="is-size-7 pt-3 pl-2">NOS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button
              v-if="!walletLoggedIn"
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
              Deposit
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Transaction, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount, TOKEN_PROGRAM_ID, createTransferInstruction, createAssociatedTokenAccountInstruction, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
const anchor = require('@project-serum/anchor');

export default {
  data () {
    return {
      projects: null,
      user: null,
      userRepositories: null,
      balance: null,
      usedBalance: null,
      search: null,
      interval: null,
      network: process.env.NUXT_ENV_SOL_NETWORK,
      loading: false,
      depositAmount: 0,
      depositPopup: false,
      walletBalance: null,
      wallet: null
    };
  },
  computed: {
    reward () {
      let reward = 0;
      if (this.balance > 0) {
        reward += 500;
      }

      return Math.min(reward + this.usedBalance, 10000);
    },
    loggedIn () {
      return this.$auth && this.$auth.loggedIn;
    },
    walletLoggedIn () {
      return this.$sol && this.$sol.publicKey;
    },
    showTutorial () {
      return !(this.user && this.userRepositories && this.userRepositories.length > 0);
    },
    filteredRepositories () {
      let filteredRepositories = this.repositories;
      // Search campaigns
      if (filteredRepositories && this.search !== null) {
        filteredRepositories =
        filteredRepositories.filter(r => r.repository.toLowerCase().includes(this.search.toLowerCase()) ||
            (r.repository.description && r.repository.description.toLowerCase().includes(this.search.toLowerCase())) ||
            (r.repository.name && r.repository.name.toLowerCase().includes(this.search.toLowerCase())));
      }

      return filteredRepositories;
    }
  },
  watch: {
    '$auth.loggedIn' (loggedIn) {
      if (loggedIn) {
        this.getUser();
        this.getUserRepositories();
        this.getUserJobPrices();
      }
    },
    '$sol.publicKey': function (pubkey) {
      if (pubkey) {
        this.wallet = this.$sol.getWallet();
      }
    }
  },
  created () {
    if (this.loggedIn) {
      this.getUser();
      this.getUserRepositories();
      this.getUserJobPrices();
      if (this.$sol) {
        this.wallet = this.$sol.getWallet();
      }
    }
    if (!this.interval) {
      this.interval = setInterval(() => {
        this.getUserRepositories();
      }, 20000);
    }
  },
  beforeDestroy () {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },
  methods: {
    async getUserJobPrices () {
      try {
        const totalCosts = await this.$axios.$get('/user/jobs/price');
        this.usedBalance = totalCosts / 1e6;
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    async getUserRepositories () {
      try {
        const repositories = await this.$axios.$get('/user/repositories');
        this.userRepositories = repositories;
        if (!repositories.length && this.$route.query.login) {
          this.$router.push('/repositories/new');
        }
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    async getUser () {
      try {
        const user = await this.$axios.$get('/user');
        this.user = user;
        this.balance = (await this.$sol.getNosBalance(this.user.generated_address)).uiAmount;
        if (this.user.address) {
          this.walletBalance = (await this.$sol.getNosBalance(this.user.address)).uiAmount;
        }
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    async deposit () {
      this.loading = true;
      try {
        let node = this.network;
        if (!this.network.includes('http')) {
          node = anchor.web3.clusterApiUrl(node);
        }
        const connection = new anchor.web3.Connection(node, 'confirmed');
        const mint = new PublicKey(process.env.NUXT_ENV_NOS_TOKEN);
        const from = await getAssociatedTokenAddress(mint, this.wallet.publicKey);
        const to = await getAssociatedTokenAddress(mint, new PublicKey(this.user.generated_address));
        const tx = new Transaction();
        try {
          const account = await getAccount(connection, to, TOKEN_PROGRAM_ID);
          console.log('get account!', account);
        } catch (error) {
          try {
            tx.add(createAssociatedTokenAccountInstruction(
              this.wallet.publicKey,
              to,
              new PublicKey(this.user.generated_address),
              mint,
              TOKEN_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID
            ));
          } catch (e) {
            console.log(e);
            // Ignore all errors; for now there is no API-compatible way to selectively ignore the expected
            // instruction error if the associated account exists already.
          }
        }

        tx.add(
          createTransferInstruction(
            from,
            to,
            this.wallet.publicKey,
            this.depositAmount * 1e6
          )
        );

        tx.feePayer = this.wallet.publicKey;
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        const signed = await this.wallet.signTransaction(tx);
        const signature = await connection.sendRawTransaction(signed.serialize());
        await connection.confirmTransaction(signature);
        console.log('tx response', signature);
        this.$modal.show({
          color: 'success',
          text: `Successfully deposited ${this.depositAmount} NOS`,
          title: 'Deposit'
        });
        this.depositAmount = 0;
        this.depositPopup = 0;
      } catch (error) {
        console.error(error);
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.project-icon {
border-radius: 100%;
background: $secondary;
display:flex;
justify-content: center;
min-width: 75px;
height: 75px;
align-items: center;
border: 1px solid grey;
}
.step {
   min-height: 160px;
 }
.deposit-popup {
  z-index: 39;
}
</style>
