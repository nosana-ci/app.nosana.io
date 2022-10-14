<template>
  <section class="section admin-page">
<<<<<<< HEAD
    <div v-if="user && allowed" class="container">
=======
    <div class="container">
>>>>>>> 9b415bd5521869d134b79e82cc1c54ee8896c67d
      <h1 class="title is-4">
        Create a new  <span class="has-text-accent">Market</span>
      </h1>
      <form class="has-background-light p-6 column is-6" @submit.prevent="createMarket()">
        <div class="field">
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
        <div class="field">
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
        <div class="field">
          <label class="label mb-0">Job Expiration</label>
          <p class="is-size-7 mb-2">
            Job Expiration in days
          </p>
          <div class="control is-expanded">
            <input
              v-model="newMarket.jobExpiration"
              required
              class="input is-primary"
              type="number"
              placeholder="Job expiration in days"
            >
          </div>
        </div>
        <div class="field">
          <label class="label mb-0">Stake Minimum</label>
          <p class="is-size-7 mb-2">
            The minimum XNOS a node needs to stake
          </p>
          <div class="control is-expanded">
            <input
              v-model="newMarket.nodeStakeMinimum"
              required
              class="input is-primary"
              type="number"
              placeholder="Minimum stake in XNOS"
              min="0"
            >
          </div>
        </div>
        <div class="field">
          <label class="label mb-0">Job Type</label>
          <p class="is-size-7 mb-2">
            Choose the type of jobs for this market
          </p>
          <div class="select">
            <select v-model="newMarket.jobType" required>
              <option value="0">
                0 - Default
              </option>
              <option value="1">
                1 - Small
              </option>
              <option value="2">
                2 - Medium
              </option>
              <option value="3">
                3 - Large
              </option>
              <option value="4">
                4 - Gpu
              </option>
              <option value="255">
                255 - Unknown
              </option>
            </select>
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
              :class="{'is-loading': loading}"
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
      user: null,
      allowed: false,
      newMarket: {
        jobPrice: null,
        jobTimeout: null,
        jobType: 0,
        nodeStakeMinimum: null,
        jobExpiration: null
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
    this.getUser();
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

        const tx = await this.$job.jobsProgram.methods
          .open(
            // job expiration days to seconds
            new anchor.BN(this.newMarket.jobExpiration * 24 * 60 * 60),
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
          text: 'Transaction ID: ' + tx,
          title: 'Successfully created market'
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
    },
    async getUser () {
      try {
        const user = await this.$axios.$get('/user');
        this.user = user;
        if ((this.user.roles && this.user.roles.includes('admin'))) {
          this.allowed = true;
        } else {
          this.$router.push('/');
        }
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
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
