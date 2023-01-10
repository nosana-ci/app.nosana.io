import Vue from 'vue';
import {
  PhantomWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  SolflareWalletAdapter,
  SlopeWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import { commitment, sendTransaction } from '@/utils/web3';
const nacl = require('tweetnacl');

const network = process.env.NUXT_ENV_SOL_NETWORK;

const NOS_TOKEN_PROGRAM_ID = process.env.NUXT_ENV_NOS_TOKEN;

// You can also provide a custom RPC endpoint
let endpoint = network;
if (!endpoint.includes('http')) {
  endpoint = clusterApiUrl(network);
}
const web3 = new Connection(endpoint, 'confirmed');
const metaplex = new Metaplex(web3);

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
        explorer: 'https://explorer.solana.com',
        balance: null,
        publicKey: null,
        loginModal: false,
        web3,
        walletListenerId: null,
        wallets,
        error: null,
        token: null,
        user: null,
        skipLogin: false,
        nfts: null,
        addWalletToExistingAccount: false
      };
    },
    created () {

    },
    methods: {
      async getNfts (address) {
        if (address) {
          const nfts = await metaplex.nfts().findAllByOwner({ owner: new PublicKey(address) }).run();

          this.nfts = nfts.filter(function (nft) {
            return nft.collection
              ? nft.collection.address.toString() === process.env.NUXT_ENV_NFT_COLLECTION_ID
              : false;
          }); ;
          this.nfts = await this.processNfts();
        }
      },
      async processNfts () {
        const processedNfts = [];
        for (let i = 0; i < this.nfts.length; i++) {
          processedNfts.push(await metaplex.nfts().load({ metadata: this.nfts[i] }).run());
        }
        return processedNfts;
      },
      getWallet () {
        return wallet;
      },
      connect (adapter) {
        if (adapter || connectingAdapter) {
          adapter.on('connect', this.onConnect);
          adapter.on('disconnect', this.onDisconnect);
          adapter.on('error', this.onWalletError);

          if (!connectingAdapter) {
            connectingAdapter = adapter;
          }
          if (this.addWalletToExistingAccount) {
            connectingAdapter.disconnect();
          }
          connectingAdapter.connect();

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

      async onConnect () {
        const adapter = connectingAdapter;

        if (adapter && adapter.publicKey) {
          localStorage.setItem('WALLET_NAME', adapter.name);
          wallet = adapter;
          this.subWallet();
          this.getBalance();

          this.publicKey = wallet.publicKey.toString();
          if (context.$auth && context.$auth.loggedIn) {
            if (context.$auth.user.address === this.publicKey) {
              this.loginModal = false;
            } else if (this.addWalletToExistingAccount) {
              // add wallet to account
              try {
                // sign message & check
                const timestamp = Math.floor(+new Date() / 1000);
                const signature = await this.sign(timestamp);
                console.log('signature', signature);

                const message = new TextEncoder().encode('nosana_' + timestamp);
                if (!nacl.sign.detached.verify(
                  message, new Uint8Array(signature.data), new Uint8Array(new PublicKey(this.publicKey).toBuffer()))) {
                  throw new Error('Invalid signature');
                }

                // add to account
                await context.$axios.$post('/user/add-wallet', {
                  address: this.publicKey
                });
                this.$modal.show({
                  color: 'success',
                  title: 'Successfully Synced Wallet!'
                });
                this.loginModal = false;
              } catch (e) {
                console.error(e);
                if (!e.message.includes('User rejected the request')) {
                  this.$modal.show({
                    color: 'danger',
                    text: (e.response && e.response.data.message) ? 'Something went wrong while connecting the wallet to your account: \n' + e.response.data.message : e,
                    title: 'Error'
                  });
                  this.loginModal = false;
                }
              }
              this.addWalletToExistingAccount = false;
            } else {
              context.$auth.logout(true);
            }
          }
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
            `Please install and initialize ${connectingAdapter.name} wallet extension first,
            <a href="${connectingAdapter.url}" target="_blank">click here to install extension</a>`;
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

      async sign (message, prefix = 'nosana') {
        const data = new TextEncoder().encode(`${prefix}_${message}`);
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
      },

      async logout () {
        await this.switch();
        context.$stake.clear();
        await context.$auth.logout();
      },

      clear () {
        const clone = (({ loginModal, ...o }) => o)(this.$data);
        Object.assign(clone, this.$options.data.call(this));
      }
    }
  });

  inject('sol', sol);
};
