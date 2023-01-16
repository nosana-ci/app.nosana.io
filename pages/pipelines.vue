<template>
  <div>
    <section class="section">
      <div class="columns">
        <div class="column is-4">
          <h1 class="title is-4">
            Projects on <b v-if="network === 'devnet'" class="has-text-accent">DevNet</b>
            <b v-else class="has-text-accent">Testnet</b>
          </h1>
          <p class="has-limited-width-small">
            If it works in a container, it works on the Nosana Network.
            We can run any container command, letting you ship faster than ever before.
            All you have to do right now is connect your GitHub account and request your funds.
            If you have a valid account, we try to release the free testnet credits within 5 days.
            Feel free to reach out to <a href="mailto:team@nosana.io">team@nosana.io</a> if you have any questions.
          </p>
        </div>
        <div v-if="!user" class="column is-8">
          <div class="columns">
            <div class="column is-one-third">
              <nuxt-link
                class="box is-secondary step"
                :class="{'has-background-white': loggedIn}"
                to="/login"
              >
                <div class="is-flex is-justify-content-space-between">
                  <div>1</div>
                  <div v-if="loggedIn">
                    <img :src="require('@/assets/img/icons/done.svg')">
                  </div>
                  <div v-else>
                    <img :src="require('@/assets/img/icons/pending.svg')">
                  </div>
                </div>
                <div class="has-text-centered my-2">
                  <img src="~assets/img/icons/wallet.svg">
                  <p>Login</p>
                </div>
              </nuxt-link>
            </div>
            <div class="column is-one-third">
              <nuxt-link
                class="box is-secondary step"
                :class="{'has-background-white': user && repositories
                           && repositories.filter(r => r.user_id === user.user_id).length,
                         'disabled': !loggedIn}"
                to="/repositories/new"
              >
                <div class="is-flex is-justify-content-space-between">
                  <div>2</div>
                  <div v-if="user && repositories && repositories.filter(r => r.user_id === user.user_id).length">
                    <img :src="require('@/assets/img/icons/done.svg')">
                  </div>
                  <div v-else>
                    <img :src="require('@/assets/img/icons/pending.svg')">
                  </div>
                </div>
                <div class="has-text-centered my-2">
                  <img v-if="loggedIn" src="~assets/img/icons/repository.svg">
                  <img v-else src="~assets/img/icons/repository_grey.svg">
                  <p>Add Repository</p>
                </div>
              </nuxt-link>
            </div>
            <div class="column is-one-third">
              <nuxt-link
                to="/account/edit"
                class="box is-secondary step"
                :class="{'has-background-white': user && repositories
                           && repositories.filter(r => r.user_id === user.user_id).length,
                         'disabled': !(loggedIn && user && repositories
                           && repositories.filter(r => r.user_id === user.user_id).length)}"
              >
                <div class="is-flex is-justify-content-space-between">
                  <div>3</div>
                  <div v-if="user && user.isApproved">
                    <img :src="require('@/assets/img/icons/done.svg')">
                  </div>
                  <div v-else-if="user && user.name">
                    <img :src="require('@/assets/img/icons/running.svg')">
                  </div>
                  <div v-else>
                    <img :src="require('@/assets/img/icons/pending.svg')">
                  </div>
                </div>
                <div class="has-text-centered my-2">
                  <img
                    v-if="loggedIn && user && repositories &&
                      repositories.filter(r => r.user_id === user.user_id).length"
                    src="~assets/img/icons/project.svg"
                  >
                  <img v-else src="~assets/img/icons/project_grey.svg">
                  <p>Request Funds</p>
                </div>
              </nuxt-link>
            </div>
          </div>
        </div>
        <template v-else>
          <div class="column is-2">
            <div class="box">
              <small>Testnet Balance</small>
              <div class="has-text-weight-semibold">
                <span
                  v-if="!balance && balance !== 0"
                >...</span>
                <span v-else>{{ Math.trunc(balance*10000)/10000 }}</span> <span class="has-text-accent">NOS</span>
              </div>
            </div>
            <div v-if="user && (user.roles && user.roles.includes('admin'))">
              <button class="button is-accent is-outlined" @click.prevent="depositPopup = true;">
                Deposit NOS
              </button>
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
        </template>
      </div>
      <div v-if="user && userRepositories && userRepositories.length" class="mb-6">
        <nuxt-link to="/repositories/new" class="button is-accent is-pulled-right">
          Add new repository
        </nuxt-link>
        <nuxt-link to="/secrets" class="button is-accent is-outlined is-pulled-right mr-2">
          Global secrets
        </nuxt-link>
        <h2 class="subtitle has-text-weight-semibold">
          Your Repositories
        </h2>

        <repository-list :repositories="userRepositories" />
      </div>
      <div class="is-flex is-justify-content-space-between has-background-light columns p-2">
        <div style="max-width: 100%; width: 400px">
          <input v-model="search" class="input" placeholder="search repositories">
        </div>
        <nuxt-link to="/repositories/new" class="button is-accent is-small has-text-white">
          + Add new repository
        </nuxt-link>
      </div>
      <div v-if="repositories" class="columns is-multiline mt-4 has-background-light">
        <div v-if="!filteredRepositories.length" class="has-text-centered subtitle">
          No repositories found...
        </div>
        <template v-for="repository in filteredRepositories">
          <div :key="repository.id" class="column is-6 is-3-fullhd is-3-widescreen is-4-desktop">
            <a class="box has-background-white is-clickable" @click="$router.push('/repositories/'+repository.id)">
              <div class="is-flex is-align-items-flex-start is-justify-content-flex-start">
                <div class="project-icon mr-4">
                  <img style="height: 32px" :src="repository.image">
                </div>
                <div>
                  <h2 class="title is-6 has-text-weight-semibold" style="min-height: 36px">
                    <span v-html="repository.repository.split('/').join('/<br>')" />
                  </h2>
                  <h2 class="subtitle is-6 mb-1">
                    <span>{{ repository.name }}</span>
                  </h2>
                  <p class="is-size-7 has-overflow-ellipses" style="height: 40px;">
                    <span>{{ repository.description }}</span>
                  </p>
                </div>
              </div>

              <div class="mt-2">
                <span v-if="repositories">
                  <div v-if="!repository.commits.length">
                    no pipelines
                  </div>
                  <div
                    v-else
                    class="is-flex is-align-items-flex-end"
                  >
                    <div class="mr-2">
                      <div
                        class="tag is-small"
                        :class="{
                          'is-accent': repository.commits[0].status === 'COMPLETED',
                          'is-info': repository.commits[0].status === 'RUNNING',
                          'is-warning': repository.commits[0].status === 'QUEUED',
                          'is-danger': repository.commits[0].status === ('FAILED' || 'STOPPED')
                        }"
                      >{{ repository.commits[0].status }}</div>
                      <div class="is-size-7">
                        {{ $moment(repository.commits[0].updated_at ).fromNow() }}
                      </div>
                    </div>
                    <div
                      v-for="commit in repository.commits.slice().reverse()"
                      :key="commit.id"
                      class="mx-1"
                      @click.stop=""
                    >
                      <nuxt-link :to="`/jobs/${commit.id}`">
                        <commit-status
                          :status="commit.status"
                          class="has-tooltip-arrow"
                          :data-tooltip="commit.commit.substring(0,7)"
                        />
                      </nuxt-link>
                    </div>
                  </div>
                </span>
                <span v-else>Loading..</span>
              </div>
            </a>
          </div>
        </template>
      </div>
    </section>
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
      repositories: null,
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
    this.getActiveRepositories();
    if (!this.interval) {
      this.interval = setInterval(() => {
        console.log('refreshing repositories..');
        this.getActiveRepositories();
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
    async getActiveRepositories () {
      try {
        const repositories = await this.$axios.$get('/repositories/active');
        this.repositories = repositories;
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
