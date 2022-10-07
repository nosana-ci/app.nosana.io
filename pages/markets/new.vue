<template>
  <section class="section admin-page">
    <div class="container">
      <h1 class="title is-4">
        Create a new  <span class="has-text-accent">Market</span>
      </h1>
      <form class="has-background-light p-6 column is-8" @submit.prevent="createMarket()">
        <div class="field is-horizontal">
          <div class="is-flex" style="width: 100%;">
            <div class="field is-flex-grow-1">
              <label class="label mb-0">Job Price</label>
              <p class="is-size-7 mb-2">
                Price for a job in NOS
              </p>
              <div class="control is-expanded">
                <input
                  v-model="newMarket.jobPrice"
                  required
                  class="input is-primary"
                  type="number"
                  placeholder="Price in NOS "
                >
              </div>
            </div>
            <div class="field is-flex-grow-1">
              <label class="label mb-0">Job Timeout</label>
              <p class="is-size-7 mb-2">
                Job timeout in seconds
              </p>
              <div class="control is-expanded">
                <input
                  v-model="newMarket.jobTimeout"
                  required
                  class="input is-primary"
                  type="number"
                  placeholder="Timeout in seconds"
                >
              </div>
            </div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="is-flex" style="width: 100%;">
            <div class="field is-flex-grow-1">
              <label class="label mb-0">Job Type</label>
              <p class="is-size-7 mb-2">
                0 or 1
              </p>
              <div class="control is-expanded">
                <input v-model="newMarket.jobType" required class="input is-primary" type="number">
              </div>
            </div>
            <div class="field is-flex-grow-1">
              <label class="label mb-0">Stake Minimum</label>
              <p class="is-size-7 mb-2">
                The minimum amount a node needs to stake
              </p>
              <div class="control is-expanded">
                <input
                  v-model="newMarket.nodeStakeMinimum"
                  required
                  class="input is-primary"
                  type="number"
                  placeholder="Minimum stake in NOS"
                  min="0"
                  max="1"
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
      loading: false,
      newMarket: {
        jobPrice: null,
        jobTimeout: null,
        jobType: null,
        nodeStakeMinimum: null
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
      this.loading = true;
      try {
        const marketKeypair = anchor.web3.Keypair.generate();
        const vault = await anchor.web3.PublicKey.findProgramAddress(
          [marketKeypair.publicKey.toBuffer(), this.$job.accounts.mint.toBuffer()],
          this.$job.jobsProgram.programId
        );
        console.log('vault', vault[0].toString());

        const tx = await this.$job.jobsProgram.methods
          .init(
            new anchor.BN(this.newMarket.jobPrice * 1e6),
            new anchor.BN(this.newMarket.jobTimeout),
            parseInt(this.newMarket.jobType),
            new anchor.BN(this.newMarket.nodeStakeMinimum * 1e6))
          .accounts({
            ...this.$job.accounts,
            vault: vault[0],
            market: marketKeypair.publicKey
          })
          .signers([marketKeypair])
          .rpc();
        console.log('tx', tx);
        this.$modal.show({
          color: 'success',
          text: 'Successfully created Market',
          title: 'Claimed'
        });
        this.$router.push('/markets');
      } catch (error) {
        console.error(error);
        this.$modal.show({
          color: 'danger',
          text: error.message,
          title: 'Error'
        });
      }
      this.loading = false;
    }
  }
};
</script>
<style scoped lang="scss">
  .is-horizontal {
    .field {
      &:first-child {
        margin-right: 5px;
      }
      &:last-child {
        margin-left: 5px;
      }
    }
  }
.field {
  flex-basis: 0;
}
</style>
