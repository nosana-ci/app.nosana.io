import Vue from 'vue';

const anchor = require('@project-serum/anchor');
const { TOKEN_PROGRAM_ID } = require('@solana/spl-token');
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
  const job = new Vue({
    data () {
      return {
        interval: null,
        provider: null,
        accounts: null,
        jobsProgram: null
      };
    },
    methods: {
      async setupPrograms () {
        let wallet = context.$sol.getWallet();
        if (!wallet) {
          wallet = new FakeWallet(anchor.web3.Keypair.generate());
        }

        this.provider = new anchor.AnchorProvider(web3, wallet, {});
        let userKey = wallet.publicKey;
        if (context.$auth && context.$auth.user) {
          userKey = new anchor.web3.PublicKey(context.$auth.user.address);
        }

        console.log('uk pk', userKey.toString());

        const programId = new anchor.web3.PublicKey(process.env.NUXT_ENV_JOBS_PROGRAM_ID);

        const mint = new anchor.web3.PublicKey(process.env.NUXT_ENV_NOS_TOKEN);
        const accounts = {
          // solana native
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
          market: null,

          // custom
          authority: userKey,
          accessKey: new anchor.web3.PublicKey(process.env.NUXT_ENV_NFT_COLLECTION_ID),
          mint
        };

        const idl = await anchor.Program.fetchIdl(process.env.NUXT_ENV_JOBS_PROGRAM_ID, this.provider);
        this.jobsProgram = new anchor.Program(idl, programId, this.provider);

        this.loading = false;
        this.accounts = accounts;
      }
    }
  });

  inject('job', job);
};
