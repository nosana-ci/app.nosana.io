<template>
  <section class="section admin-page">
    <div class="container">
      <div class="has-background-light p-6 column is-6">
        <h1 class="title is-4">
          Edit <span class="has-text-accent">Market</span>
        </h1>
        <p v-if="market">
          Editing market:
          <a
            target="_blank"
            :href="$sol.explorer + '/address/' + id"
            class="blockchain-address-inline"
          >{{ id }}</a>
        </p>
        <form v-if="market" @submit.prevent="saveMarket()">
          <div class="field">
            <label class="label mb-0">Job Price</label>
            <p class="is-size-7 mb-2">
              Price for a job in NOS
            </p>
            <div class="control is-expanded">
              <input
                v-model="market.jobPrice"
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
                v-model="market.jobTimeout"
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
                v-model="market.jobExpiration"
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
                v-model="market.nodeStakeMinimum"
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
              Choose the type of jobs in this market
            </p>
            <div class="select">
              <select v-model="market.jobType" required>
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
                <strong>Update Market</strong>
              </button>
            </div>
          </div>
        </form>
        <div class="has-text-centered">
          <button v-if="loggedIn" class="is-ghost button mt-1" @click="closeConfirm">
            <span class="has-text-danger is-size-7">Close market</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
<script>
import * as anchor from '@project-serum/anchor';
import { getAssociatedTokenAddress } from '@solana/spl-token';

export default {
  middleware: 'auth',
  data () {
    return {
      id: this.$route.params.id,
      loading: false,
      market: {
        jobPrice: null,
        jobTimeout: null,
        jobType: null,
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
    this.getMarket();
    if (this.loggedIn) {
      this.$job.setupPrograms(this.$sol.getWallet());
    }
  },
  methods: {
    async saveMarket () {
      this.loading = true;
      try {
        const tx = await this.$job.jobsProgram.methods
          .update(
            // job expiration days to seconds
            new anchor.BN(this.market.jobExpiration * 24 * 60 * 60),
            new anchor.BN(this.market.jobPrice * 1e6),
            new anchor.BN(this.market.jobTimeout),
            parseInt(this.market.jobType),
            new anchor.BN(this.market.nodeStakeMinimum * 1e6)
          ).accounts({
            ...this.$job.accounts,
            market: new anchor.web3.PublicKey(this.id)
          })
          .rpc();
        console.log('tx', tx);
        this.$modal.show({
          color: 'success',
          title: 'Successfully updated market'
        });
        this.$router.push(`/markets/${this.id}`);
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
    async getMarket () {
      this.loading = true;
      try {
        const market = await this.$axios.$get(`/markets/${this.id}`);
        this.market = {
          ...market,
          jobPrice: parseInt(market.jobPrice, 16) / 1e6,
          jobTimeout: parseInt(market.jobTimeout, 16),
          nodeStakeMinimum: parseInt(market.nodeXnosMinimum, 16) / 1e6,
          jobExpiration: parseInt(market.jobExpiration, 16) / 60 / 60 / 24
        };
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
      this.loading = false;
    },
    closeConfirm () {
      this.$modal.show({
        color: 'warning',
        title: 'Are you sure you want to close this market?',
        onConfirm: () => {
          this.closeMarket();
        }
      });
    },
    async closeMarket () {
      this.loading = true;
      try {
        const [vault] = await anchor.web3.PublicKey.findProgramAddress(
          [new anchor.web3.PublicKey(this.id).toBuffer(), this.$job.accounts.mint.toBuffer()],
          this.$job.jobsProgram.programId
        );
        console.log('vault', vault.toString());
        const user = await getAssociatedTokenAddress(
          this.$job.accounts.mint, this.$job.accounts.authority);
        const tx = await this.$job.jobsProgram.methods
          .close().accounts({
            ...this.$job.accounts,
            market: new anchor.web3.PublicKey(this.id),
            vault,
            user
          })
          .rpc();
        console.log('tx', tx);
        this.$modal.show({
          color: 'success',
          title: 'Successfully removed market'
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
