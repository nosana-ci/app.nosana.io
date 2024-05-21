import Vue from 'vue';

const anchor = require('@project-serum/anchor');
const { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } = require('@solana/spl-token');
const ENV = process.env.NUXT_ENV_SOL_NETWORK;

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

export default (context, inject) => {
  const stake = new Vue({
    data () {
      return {
        interval: null,
        stakeData: null,
        stakeEndDate: null,

        program: null,
        provider: null,
        accounts: null,
        rewardsProgram: null,
        rewardVault: null,
        poolProgram: null,
        poolAccounts: null,
        rewardInfo: null,
        poolInfo: null
      };
    },
    beforeDestroy () {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    },
    methods: {
      clear () {
        this.stakeData = null;
        this.stakeDataEnd = null;
      },
      async setupPrograms () {
        let wallet = context.$sol.getWallet();
        if (!wallet) {
          wallet = new FakeWallet(anchor.web3.Keypair.generate());
        }

        if (!this.interval) {
          this.interval = setInterval(() => {
            console.log('refresh staking info..');
            this.refreshStake();
          }, 30000);
        }

        this.provider = new anchor.AnchorProvider(web3, wallet, {});
        let userKey = wallet.publicKey;
        if (context.$auth && context.$auth.user && context.$auth.user.address) {
          userKey = new anchor.web3.PublicKey(context.$auth.user.address);
        }

        const programId = new anchor.web3.PublicKey(process.env.NUXT_ENV_STAKE_PROGRAM_ID);
        const rewardsProgramId = new anchor.web3.PublicKey(process.env.NUXT_ENV_REWARD_PROGRAM_ID);
        const poolProgramId = new anchor.web3.PublicKey(process.env.NUXT_ENV_POOL_PROGRAM_ID);
        const poolId = new anchor.web3.PublicKey((Date.now() / 1000 < 1716283380 ? '6CJ9UPNnXzcwuLSE9ebTz4FPbBw1VXJkPxDgTi9ybHBj' : process.env.NUXT_ENV_POOL_ID));
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
          ataTo: await getAssociatedTokenAddress(mint, userKey),
          stake: undefined,
          reflection: undefined,
          user: await getAssociatedTokenAddress(mint, userKey),
          vault: undefined,
          reward: undefined,
          mint
        };

        [this.rewardVault] = await anchor.web3.PublicKey.findProgramAddress([mint.toBuffer()], rewardsProgramId);
        [this.poolVault] = await anchor.web3.PublicKey.findProgramAddress(
          [anchor.utils.bytes.utf8.encode('vault'), poolId.toBuffer()],
          poolProgramId
        );

        const idl = await anchor.Program.fetchIdl(process.env.NUXT_ENV_STAKE_PROGRAM_ID, this.provider);
        this.program = new anchor.Program(idl, programId, this.provider);

        const idlReward = await anchor.Program.fetchIdl(process.env.NUXT_ENV_REWARD_PROGRAM_ID, this.provider);
        this.rewardsProgram = new anchor.Program(idlReward, rewardsProgramId, this.provider);

        const idlPool = await anchor.Program.fetchIdl(process.env.NUXT_ENV_POOL_PROGRAM_ID, this.provider);
        this.poolProgram = new anchor.Program(idlPool, poolProgramId, this.provider);

        [accounts.vault] = await anchor.web3.PublicKey.findProgramAddress(
          [anchor.utils.bytes.utf8.encode('vault'), mint.toBuffer(), userKey.toBuffer()],
          programId
        );

        [accounts.reflection] = await anchor.web3.PublicKey.findProgramAddress(
          [anchor.utils.bytes.utf8.encode('reflection')],
          rewardsProgramId
        );
        [accounts.stake] = await anchor.web3.PublicKey.findProgramAddress(
          [anchor.utils.bytes.utf8.encode('stake'), mint.toBuffer(), userKey.toBuffer()],
          programId
        );
        [accounts.reward] = await anchor.web3.PublicKey.findProgramAddress(
          [anchor.utils.bytes.utf8.encode('reward'), userKey.toBuffer()],
          rewardsProgramId
        );

        this.loading = false;
        this.accounts = accounts;
        this.poolAccounts = {
          ...this.accounts,
          pool: poolId,
          vault: this.poolVault,
          rewardsVault: this.rewardVault,
          rewardsReflection: this.accounts.reflection,
          rewardsProgram: rewardsProgramId
        };

        await this.refreshStake();
      },
      async refreshRewardsAndPoolInfo () {
        if (!this.accounts) { return null; }
        const globalReflection = await this.rewardsProgram.account.reflectionAccount.fetch(this.accounts.reflection);
        let rewardAccount;
        try {
          const poolInfo = await this.poolProgram.account.poolAccount.fetch((Date.now() / 1000 < 1716283380 ? '6CJ9UPNnXzcwuLSE9ebTz4FPbBw1VXJkPxDgTi9ybHBj' : process.env.NUXT_ENV_POOL_ID));
          this.poolInfo = poolInfo;
          this.poolInfo.balance = await this.getBalance(this.poolVault);
          rewardAccount = await this.rewardsProgram.account.rewardAccount.fetch(this.accounts.reward);
        } catch (error) {
          if (!error.message.includes('Account does not exist')) {
            throw new Error(error.message);
          } else {
            console.log('Reward account does not exists, skip');
          }
        }
        const rewardInfo = {
          global: globalReflection,
          rewardAccount
        };
        this.rewardInfo = rewardInfo;
      },
      async refreshStake () {
        const userAddress = context.$sol && context.$sol.publicKey ? `?userAddress=${context.$sol.publicKey}` : '';
        if (userAddress) {
          const stakeData = await context.$axios.$get('/user/stake' + userAddress);
          if (stakeData && stakeData.user_id && parseInt(stakeData.time_unstake) !== 0 && parseInt(stakeData.time_unstake) !== '00') {
            this.stakeEndDate = context.$moment.unix(stakeData.time_unstake).add(stakeData.duration, 's');
          // this.stakeEndDate = this.$moment.unix(1659698174);
          } else {
            this.stakeEndDate = null;
          }
          this.stakeData = stakeData;
        }
        await this.refreshRewardsAndPoolInfo();
      },
      async getBalance (address) {
        try {
          const account = await web3.getTokenAccountsByOwner(address,
            { mint: this.accounts.mint });
          if (account && account.value && account.value.length > 0) {
            const tokenAddress = new anchor.web3.PublicKey(account.value[0].pubkey.toString());
            return (await web3.getTokenAccountBalance(
              tokenAddress
            )).value.uiAmount;
          } else {
            return 0;
          }
        } catch (err) {
          console.error('tryna get balance', err);
          return 0;
        }
      }
    }
  });

  inject('stake', stake);
};
