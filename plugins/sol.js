import Vue from 'vue'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import {
  PhantomWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  SolflareWalletAdapter,
  SlopeWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl, Connection } from '@solana/web3.js'
import { commitment, sendTransaction } from '@/utils/web3'

const network = WalletAdapterNetwork.Mainnet

// You can also provide a custom RPC endpoint
const endpoint = clusterApiUrl(network)
const web3 = new Connection(endpoint, commitment)

// @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking --
// Only the wallets you configure here will be compiled into your application
const wallets = [
  new PhantomWalletAdapter(),
  new SolletExtensionWalletAdapter({ network }),
  new SolletWalletAdapter({ network }),
  new SolflareWalletAdapter(),
  new SlopeWalletAdapter()
]
let connectingWallet = {
  adapter: null,
  name: null
}
let wallet

export default (context, inject) => {
  const sol = new Vue({
    data () {
      return {
        explorer: process.env.NUXT_ENV_SOL_EXPLORER,
        balance: null,
        publicKey: null,
        loginModal: false,
        currentProvider: null,
        walletConnected: false,
        web3,
        walletListenerId: null,
        wallets
      }
    },
    created () {

    },
    methods: {
      connect (adapter) {
        if (adapter) {
          adapter.on('connect', () => { this.onConnect(adapter) })
          adapter.on('disconnect', this.onDisconnect)
          adapter.on('error', this.onWalletError)

          connectingWallet = {
            name: adapter.name,
            adapter
          }
          adapter.connect()

          return () => {
            adapter.off('connect', this.onConnect)
            adapter.off('disconnect', this.onDisconnect)
            adapter.off('error', this.onWalletError)
          }
        }
      },

      onWalletChange (_accountInfo) {
        if (typeof _accountInfo.lamports === 'number') {
          this.balance = _accountInfo.lamports
        }
      },

      subWallet () {
        if (wallet && wallet.publicKey) {
          this.walletListenerId = this.web3.onAccountChange(
            wallet.publicKey,
            this.onWalletChange,
            commitment
          )
        }
      },

      unsubWallet () {
        if (this.walletListenerId) {
          this.web3.removeAccountChangeListener(this.walletListenerId)
        }
      },

      onConnect () {
        const { name, adapter } = connectingWallet

        if (adapter && adapter.publicKey) {
          localStorage.setItem('WALLET_NAME', name)
          wallet = adapter
          this.subWallet()
          this.getBalance()

          this.publicKey = wallet.publicKey.toString()
          this.loginModal = false
          if (context.query.redirect) {
            context.app.router.push(context.query.redirect)
          } else {
            context.app.router.push('/account')
          }
        }
      },
      onDisconnect () {
        this.disconnect()
      },
      disconnect () {
        connectingWallet = {
          name: null,
          adapter: null
        }

        /*
    try {
      Vue.prototype.$wallet.disconnect()
    } catch (error) {}

    Vue.prototype.$wallet = null
*/
        this.unsubWallet()
        /*
    this.$accessor.wallet.setDisconnected()
    this.$notify.warning({
      message: 'Wallet disconnected',
      description: ''
    }) */
      },
      onWalletError (error) {
        // TODO!
        console.log(error)

        /*
   const { name } = this.connectingWallet

    if (name) {
      const info = this.wallets[name]

      if (info) {
        const { website, chromeUrl, firefoxUrl } = info

        if (['WalletNotFoundError', 'WalletNotInstalledError', 'WalletNotReadyError'].includes(error.name)) {
          const errorName = error.name
            .replace('Error', '')
            .split(/(?=[A-Z])/g)
            .join(' ')

          this.$notify.error({
            message: errorName,
            description: (h) => {
              const msg = [
                `Please install and initialize ${name} wallet extension first, `,
                h('a', { attrs: { href: website, target: '_blank' } }, 'click here to visit official website')
              ]

              if (chromeUrl || firefoxUrl) {
                const installUrl = /Firefox/.test(navigator.userAgent) ? firefoxUrl : chromeUrl
                if (installUrl) {
                  msg.push(' or ')
                  msg.push(h('a', { attrs: { href: installUrl, target: '_blank' } }, 'click here to install extension'))
                }
              }

              return h('div', msg)
            }
          })

          return
        }
      }
    }

    if (['SecurityError'].includes(error.name)) {
      this.onConnect()
      return
    }

    this.$notify.error({
      message: 'Connect wallet failed',
      description: `${error.name}`
    })
        */
      },

      async getBalance () {
        const conn = web3

        if (wallet && wallet.connected) {
          this.balance = await conn.getBalance(wallet.publicKey, commitment)
        }
      },

      async requestPayment ({ to, lamports }) {
        const conn = web3
        if (wallet && wallet.connected) {
          const txid = await sendTransaction(conn, wallet, { destination: to, lamports })
          return txid
        }
        return false
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

      logout () {
        this.clear()
        context.app.router.push('/')
      },
      async switch () {
        if (wallet) {
          await wallet.disconnect()
          wallet = null
          this.publicKey = null
        }
        this.clear()
        this.loginModal = true
      },

      clear () {
        Object.assign(this.$data, this.$options.data.call(this))
      }
    }
  })

  inject('sol', sol)
}
