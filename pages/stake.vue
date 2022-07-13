<template>
  <section class="section">
    <div class="container">
      <h1 class="title is-spaced">
        Stake
      </h1>
      <div v-if="$sol && $sol.publicKey">
        <div v-if="stakeData === null">
          Loading..
        </div>
        <h2 v-else-if="stakeData" class="subtitle">
          Staked <b>{{ stakeData.amount/1e9 }} NOS</b> for
          <b>{{ $moment.duration(stakeData.duration, 'seconds').humanize() }}</b>
        </h2>
        <div v-if="balance === null">
          Loading..
        </div>
        <div v-else>
          Available Balance: {{ balance }} NOS
          <a v-if="balance === 0" href="https://nosana.io/token" target="_blank">Buy NOS tokens</a>
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
              type="number"
              placeholder="0.00 NOS"
            >
          </div>
        </div>
        <div v-if="!stakeData" class="field">
          <label class="label">Unstake Days</label>
          <div class="control">
            <input v-model="unstakeDays" required class="input" type="number" placeholder="0 days">
          </div>
        </div>
        <h2 class="subtitle">
          {{ xNOS }} xNOS
        </h2>
        <button
          v-if="!$sol || !$sol.publicKey"
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
const anchor = require('@project-serum/anchor');
const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

const idl = require('@/utils/nosana_staking.json');

const ENV = process.env.NUXT_ENV_SOL_NETWORK;
const SECONDS_PER_DAY = 24 * 60 * 60;

let node = ENV;
if (!node.includes('http')) {
  node = anchor.web3.clusterApiUrl(ENV);
}
export default {
  middleware: 'auth',
  data () {
    return {
      loading: false,
      program: null,
      provider: null,
      programId: process.env.NUXT_ENV_STAKE_PROGRAM_ID,
      stakeData: null,
      accounts: null,
      balance: null,
      amount: null,
      unstakeDays: 365
    };
  },
  computed: {
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
    const wallet = this.$sol.getWallet();
    if (wallet) {
      this.initAnchor(wallet);
    }
  },
  methods: {
    async initAnchor (wallet) {
      this.provider = new anchor.AnchorProvider(this.$sol.web3, wallet, {});

      const accounts = {
        // solana native
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        tokenProgram: new anchor.web3.PublicKey(TOKEN_PROGRAM_ID),
        feePayer: this.provider.wallet.publicKey,
        // custom
        authority: this.provider.wallet.publicKey,
        ataVault: undefined,
        mint: new anchor.web3.PublicKey(process.env.NUXT_ENV_NOS_TOKEN),
        ataFrom: undefined,
        stake: undefined
      };
      this.program = new anchor.Program(idl, this.programId, this.provider);
      const [ataVault, bump] = await anchor.web3.PublicKey.findProgramAddress(
        [accounts.mint.toBuffer()],
        this.program.programId
      );
      accounts.ataVault = ataVault;
      console.log(ataVault.toString(), bump);
      [accounts.stake] = await anchor.web3.PublicKey.findProgramAddress(
        [anchor.utils.bytes.utf8.encode('stake'), this.provider.wallet.publicKey.toBuffer()],
        this.program.programId
      );
      accounts.ataFrom = (await anchor.web3.PublicKey.findProgramAddress(
        [
          accounts.authority.toBuffer(),
          accounts.tokenProgram.toBuffer(),
          accounts.mint.toBuffer()
        ],
        new anchor.web3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL') // SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
      ))[0];
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
      const account = await this.$sol.web3.getTokenAccountsByOwner(this.accounts.authority,
        { mint: this.accounts.mint });
      if (account && account.value && account.value.length > 0) {
        const tokenAddress = new anchor.web3.PublicKey(account.value[0].pubkey.toString());

        this.balance = (await this.$sol.web3.getTokenAccountBalance(
          tokenAddress
        )).value.uiAmount;
        if (this.amount === null) {
          this.amount = this.balance;
        }
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
        this.stakeData = await this.program.account.stakeAccount.fetch(this.accounts.stake);
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
        this.stakeData = await this.program.account.stakeAccount.fetch(this.accounts.stake);
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
