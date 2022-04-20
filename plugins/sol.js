import Vue from 'vue';
import {
  PhantomWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  SolflareWalletAdapter,
  SlopeWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { commitment, sendTransaction } from '@/utils/web3';

const network = process.env.NUXT_ENV_SOL_NETWORK;

const NOS_TOKEN_PROGRAM_ID = process.env.NUXT_ENV_NOS_TOKEN;

// You can also provide a custom RPC endpoint
const endpoint = clusterApiUrl(network);
const web3 = new Connection(endpoint, 'confirmed');

// @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking --
// Only the wallets you configure here will be compiled into your application
const wallets = [
  new PhantomWalletAdapter(),
  new SolletExtensionWalletAdapter({ network }),
  new SolletWalletAdapter({ network }),
  new SolflareWalletAdapter(),
  new SlopeWalletAdapter()
];
let connectingAdapter;
let wallet;

export default (context, inject) => {
  const sol = new Vue({
    data () {
      return {
        explorer: 'https://solscan.io',
        balance: null,
        publicKey: null,
        loginModal: false,
        web3,
        walletListenerId: null,
        wallets,
        error: null,
        token: null,
        user: null
      };
    },
    created () {

    },
    methods: {
      connect (adapter) {
        if (adapter) {
          adapter.on('connect', this.onConnect);
          adapter.on('disconnect', this.onDisconnect);
          adapter.on('error', this.onWalletError);

          connectingAdapter = adapter;
          adapter.connect();

          return () => {
            adapter.off('connect', this.onConnect);
            adapter.off('disconnect', this.onDisconnect);
            adapter.off('error', this.onWalletError);
          };
        }
      },

      onWalletChange (_accountInfo) {
        this.publicKey = wallet.publicKey.toString();

        if (typeof _accountInfo.lamports === 'number') {
          this.balance = _accountInfo.lamports;
          this.balance = 0;
        }
      },

      subWallet () {
        if (wallet && wallet.publicKey) {
          this.walletListenerId = this.web3.onAccountChange(
            wallet.publicKey,
            this.onWalletChange,
            commitment
          );
        }
      },

      unsubWallet () {
        if (this.walletListenerId) {
          this.web3.removeAccountChangeListener(this.walletListenerId);
        }
      },

      onConnect () {
        const adapter = connectingAdapter;

        if (adapter && adapter.publicKey) {
          localStorage.setItem('WALLET_NAME', adapter.name);
          wallet = adapter;
          this.subWallet();
          this.getBalance();

          this.publicKey = wallet.publicKey.toString();
          // this.loginModal = false
          // if (context.query.redirect) {
          //   context.app.router.push(context.query.redirect)
          // } else {
          //   context.app.router.push('/account')
          // }
        }
      },
      onDisconnect () {
        this.unsubWallet();
      },
      onWalletError (error) {
        if (['WalletNotFoundError', 'WalletNotInstalledError', 'WalletNotReadyError'].includes(error.name)) {
          const name = error.name
            .replace('Error', '')
            .split(/(?=[A-Z])/g)
            .join(' ');
          const message =
            `Please install and initialize ${connectingAdapter.name} wallet extension first, <a href="${connectingAdapter.url}" target="_blank">click here to install extension</a>`;
          this.error = { name, message };

          return;
        }
        if (['SecurityError'].includes(error.name)) {
          this.onConnect();
          return;
        }
        this.error = { name: 'Connect wallet failed', message: error.name };
      },

      async getNosBalance (address) {
        if (address) {
          const publicKey = new PublicKey(address);
          const response = await web3.getParsedTokenAccountsByOwner(publicKey, {
            mint: new PublicKey(NOS_TOKEN_PROGRAM_ID)
          });
          if (!response.value[0]) { return { uiAmount: 0 }; }
          return response.value[0].account.data.parsed.info.tokenAmount;
        }
      },

      async getBalance () {
        if (wallet && wallet.connected) {
          this.balance = await web3.getBalance(wallet.publicKey, commitment);
          this.balance = 0;
        }
      },

      async requestPayment ({ to, lamports }) {
        if (wallet && wallet.connected) {
          const txid = await sendTransaction(web3, wallet, { destination: to, lamports });
          return txid;
        }
        return false;
        /*

        return false;

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: Keypair.generate().publicKey,
                lamports: 1,
            })
        );

        const signature = await sendTransaction(transaction, connection);

        await connection.confirmTransaction(signature, 'processed'); */
      },

      async sign (message) {
        const data = new TextEncoder().encode('nosana_' + message);
        let signature;
        try {
          const response = await connectingAdapter.signMessage(data);
          signature = { type: 'Buffer', data: Object.values(response) };
        } catch (e) {
          if (e.message.includes('signMessage is not a function')) {
            const response = await connectingAdapter.sign(data, 'utf8');
            signature = response.signature;
          } else {
            throw e;
          }
        }
        return signature;
      },

      async switch () {
        if (connectingAdapter) {
          await connectingAdapter.disconnect();
          connectingAdapter = null;
          this.publicKey = null;
        }
        this.clear();
        this.loginModal = true;
      },

      async logout () {
        await this.switch();
        context.app.router.push('/');
      },

      clear () {
        Object.assign(this.$data, this.$options.data.call(this));
      }
    }
  });

  inject('sol', sol);
};
