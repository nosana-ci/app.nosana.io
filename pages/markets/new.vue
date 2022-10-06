<template>
  <section class="section admin-page">
    <div class="container">
      <h1 class="title is-4">
        Create a new  <span class="has-text-accent">Market</span>
      </h1>
      <form class="has-background-light p-6 column is-6" @submit.prevent="createMarket()">
        <div class="field is-horizontal">
          <div class="field-body">
            <div class="field">
              <label class="label">Job Price</label>
              <div class="control is-expanded">
                <input v-model="newMarket.jobPrice" required class="input is-primary" type="number">
              </div>
            </div>
            <div class="field">
              <label class="label">Job Timeout</label>
              <div class="control is-expanded">
                <input
                  v-model="newMarket.jobTimeout"
                  required
                  class="input is-primary"
                  type="number"
                >
              </div>
            </div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-body">
            <div class="field">
              <label class="label">Job Type</label>
              <div class="control is-expanded">
                <input v-model="newMarket.jobType" required class="input is-primary" type="number">
              </div>
            </div>
            <div class="field">
              <label class="label">Node Stake Minimum</label>
              <div class="control is-expanded">
                <input
                  v-model="newMarket.nodeStakeMinimum"
                  required
                  class="input is-primary"
                  type="number"
                >
              </div>
            </div>
          </div>
        </div>
        <div class="field">
          <div class="control">
            <button
              v-if="!loggedIn"
              class="button is-medium is-accent is-fullwidth mt-5 is-outlined"
              @click.prevent.stop="$sol.loginModal = true"
            >
              <strong>Connect Wallet</strong>
            </button>
            <button
              v-else
              :disabled="loading"
              :class="{ 'is-disabled': loading }"
              class="button is-medium is-accent is-fullwidth mt-5"
              type="submit"
            >
              <strong>Create Market</strong>
            </button>
          </div>
        </div>
      </form>
    </div>
  </section>
</template>
<script>
import * as anchor from '@project-serum/anchor';

export default {
  middleware: 'auth',
  data () {
    return {
      newMarket: {
        jobPrice: 0,
        jobTimeout: 0,
        jobType: 0,
        nodeStakeMinimum: 0
      }
    };
  },
  computed: {
    loggedIn () {
      return this.$sol && this.$sol.publicKey;
    }
  },
  watch: {
    '$sol.publicKey': function (pubkey) {
      if (pubkey) {
        const wallet = this.$sol.getWallet();
        if (wallet) {
          this.$job.setupPrograms(wallet);
        } else {
          this.$sol.loginModal = true;
        }
      }
    }
  },
  mounted () {
    if (this.loggedIn) {
      this.$job.setupPrograms(this.$sol.getWallet());
    }
  },
  methods: {
    async createMarket () {
      const marketKeypair = anchor.web3.Keypair.generate();
      // TODO: setup accounts
      const vault = await anchor.web3.PublicKey.findProgramAddress(
        [marketKeypair.toBuffer(), this.$job.accounts.mint.toBuffer()],
        this.$job.program.programId
      )[0];
      console.log('vault', vault);
      await this.jobsProgram.methods
        .init(
          new anchor.BN(this.constants.jobPrice),
          new anchor.BN(this.constants.jobTimeout),
          this.constants.jobType.default,
          new anchor.BN(this.constants.stakeMinimum)
        )
        .accounts({
          ...this.$job.accounts,
          vault,
          market: marketKeypair
        })
        .rpc();
    }
  }
};
</script>
