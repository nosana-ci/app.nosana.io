<template>
  <section class="section">
    <div class="container">
      <h1 class="title is-spaced">
        Stake
      </h1>
      <div>
        <div v-if="stakeData === null">
          Loading..
        </div>
        <div v-else-if="stakeData">
          <div>
            <span v-if="!amount">Current</span><span v-else>New</span> Stake
          </div>
          <h2 class="subtitle has-text-weight-bold">
            <ICountUp
              :end-val="amount ?
                parseFloat(stakeData.amount/1e9 + parseFloat(amount)) : parseFloat(stakeData.amount/1e9)"
              :options="{ decimalPlaces: 2 }"
            /> <small class="is-size-6">NOS</small>
          </h2>
          <div>
            Unstake duration
          </div>
          <h2 class="subtitle has-text-weight-bold">
            {{ $moment.duration(stakeData.duration, 'seconds').humanize() }}
          </h2>
        </div>
        <br>
        <div class="is-pulled-right">
          <span v-if="balance === null">Loading..</span>
          <span v-else>
            Balance: <a @click="amount = balance">{{ balance }} NOS</a>
            <a v-if="balance === 0" href="https://nosana.io/token" target="_blank">Buy NOS tokens</a>
          </span>
        </div>
      </div>
      <form @submit.prevent="stake">
        <div class="field">
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
        <div v-if="!stakeData" class="field">
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
        <div>
          <span v-if="!amount">Current</span><span v-else>New</span> xNOS score
        </div>
        <h2 class="title">
          <ICountUp :end-val="parseFloat(xNOS)" :options="{ decimalPlaces: 2 }" /> <small class="is-size-5">xNOS</small>
        </h2>
        <button
          v-if="!loggedIn"
          class="button is-accent is-outlined has-text-weight-semibold"
          @click.stop.prevent="$sol.loginModal = true"
        >
          Connect Wallet
        </button>
        <button v-else-if="stakeData" type="submit" class="button is-accent" :class="{'is-loading': loading}">
          Topup with {{ amount }} NOS
        </button>
        <button v-else type="submit" class="button is-accent" :class="{'is-loading': loading}">
          Stake {{ amount }} NOS
        </button>
      </form>
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
      unstakeDays: 365
    };
  },
  computed: {
    loggedIn () {
      return this.$sol && this.$sol.publicKey;
    },
    xNOS () {
      if (!this.unstakeDays && !this.stakeData) {
        return 0;
      }
      let amount = parseFloat(this.amount) || 0;
      let unstakeTime;
      if (this.stakeData) {
        amount += this.stakeData.amount / 1e9;
        unstakeTime = this.stakeData.duration;
      } else {
        unstakeTime = this.unstakeDays * SECONDS_PER_DAY;
      }
      const multiplierSeconds = (SECONDS_PER_DAY * 365) / 6; // 2 months
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
  },
  methods: {
    async initAnchor (wallet) {
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
        // custom
        authority: userKey,
        ataFrom: await getAssociatedTokenAddress(mint, userKey),
        ataVault: undefined,
        stake: undefined,
        stats: undefined,
        mint
      };

      const idl = await anchor.Program.fetchIdl(process.env.NUXT_ENV_STAKE_PROGRAM_ID, this.provider);
      this.program = new anchor.Program(idl, programId, this.provider);
      // get pda
      [accounts.ataVault] = await anchor.web3.PublicKey.findProgramAddress(
        [mint.toBuffer()],
        programId
      );
      [accounts.stats] = await anchor.web3.PublicKey.findProgramAddress(
        [anchor.utils.bytes.utf8.encode('stats')],
        programId
      );
      [accounts.stake] = await anchor.web3.PublicKey.findProgramAddress(
        [anchor.utils.bytes.utf8.encode('stake'), mint.toBuffer(), userKey.toBuffer()],
        programId
      );
      try {
        this.stakeData = await this.program.account.stakeAccount.fetch(accounts.stake);
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
        const decimals = 1e9;
        const stakeAmount = this.amount * decimals;

        const response = await this.program.methods
          .topup(new anchor.BN(stakeAmount))
          .accounts(this.accounts)
          .rpc();
        console.log(response);
        setTimeout(async () => {
          this.stakeData = await this.program.account.stakeAccount.fetch(this.accounts.stake);
        }, 1000);
        this.amount = null;
        await this.getBalance();
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
      if (this.stakeData) {
        return await this.topup();
      }
      try {
        const stakeDurationSeconds = this.unstakeDays * SECONDS_PER_DAY;
        const decimals = 1e9;
        const stakeAmount = this.amount * decimals;

        const response = await this.program.methods
          .stake(new anchor.BN(stakeAmount), new anchor.BN(stakeDurationSeconds))
          .accounts(this.accounts)
          .rpc();
        console.log(response);
        setTimeout(async () => {
          this.stakeData = await this.$axios.$get('/user/stake');
        }, 1000);
        this.amount = null;
        await this.getBalance();
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
