<template>
  <section class="section">
    <div class="container">
      <div v-if="commit">
        <div class="is-flex is-align-items-center">
          <div class="mr-4">
            <nuxt-link :to="`/repositories/${commit.repository_id}`" class="is-size-5">
              <i class="fas fa-chevron-left" />
            </nuxt-link>
          </div>
          <div class="mr-4">
            <div
              class="tag is-small"
              :class="{
                'is-accent': commit.status === 'COMPLETED',
                'is-info': commit.status === 'RUNNING',
                'is-warning': commit.status === 'QUEUED',
                'is-danger': commit.status === 'FAILED'
              }"
            >
              {{ commit.status }}
            </div>
          </div>
          <div>Job <b>#{{ commit.id }}</b> triggered by <a target="_blank" :href="'https://github.com/'+commit.payload.author.username">{{ commit.payload.author.name }}</a> {{ $moment(commit.created_at).fromNow() }}</div>
        </div>
        <hr class="my-4">
        <h1 class="title">
          {{ commit.payload.message.split('\n')[0] }}
        </h1>
        <!-- resultIpfsHash: {{ commit.resultIpfsHash }}
        jobIpfsHash: {{ commit.jobIpfsHash }} -->
        <div class="box">
          <div v-if="commit.job" class="mb-4">
            <i class="fas fa-list mr-4 has-text-accent" />Smart Contract Job <a target="_blank" :href="$sol.explorer + '/address/' + commit.job" class="blockchain-address-inline">{{ commit.job }}</a>
          </div>
          <div v-if="commit.job && commit.cache_blockchain" class="mb-4">
            <i class="fas fa-coins mr-4 has-text-accent" />Pipeline total cost <b class="has-text-accent">{{ parseInt(commit.cache_blockchain.tokens, 16)/1e9 }} NOS</b>
          </div>
          <div v-if="commit.job && commit.cache_blockchain && commit.cache_blockchain.jobStatus > 0" class="mb-4">
            <i class="fas fa-server mr-4 has-text-accent" />Node: <a target="_blank" :href="$sol.explorer + '/address/' + commit.cache_blockchain.node" class="blockchain-address-inline">{{ commit.cache_blockchain.node }}</a>
          </div>
          <div class="has-overresult-ellipses">
            <i class="fab fa-git mr-4 has-text-accent" />Commit <a :href="commit.payload.url" class="blockchain-address-inline" target="_blank" @click.stop>{{ commit.commit }}</a>
          </div>
          <span style="white-space: pre-wrap">{{ commit.payload.message }}</span>
        </div>
        <div v-if="!commit.job" class="level notification is-warning">
          <div class="level-left">
            <div class="level-item">
              <span>Not posted to blockchain..</span>
            </div>
          </div>
          <div v-if="user && (user.roles.includes('admin'))" class="level-right">
            <div class="level-item">
              <button class="button is-small is-danger" style="display: none" @click="postJob(commit.id)">
                Retry transaction
              </button>
            </div>
          </div>
        </div>
        <div class="tabs is-medium">
          <ul>
            <li :class="{'is-active': tab === 'result'}">
              <a @click.prevent="tab='result'">Result</a>
            </li>
            <li :class="{'is-active': tab === 'logs'}">
              <a @click.prevent="tab='logs'">Job Info</a>
            </li>
            <li :class="{'is-active': tab === 'payload'}">
              <a @click.prevent="tab='payload'">Payload</a>
            </li>
          </ul>
        </div>
        <div v-if="tab === 'result'">
          <div v-if="commit.jobIpfs">
            <small v-if="commit.cache_result">
              Finished {{ $moment(commit.cache_result['finished-at']*1e3).fromNow() }}
            </small>
            <div v-for="(command, index) in commit.jobIpfs.commands" :key="index" class="box is-info">
              <div>
                <div class="is-clickable is-flex is-flex-wrap-wrap is-align-items-center" @click="step !== index ? step = index : step = null">
                  <h3
                    class="subtitle m-0"
                    :class="{
                      'has-text-success': commit.cache_result && commit.cache_result.results && commit.cache_result.results[`cmd-${index}`] && commit.cache_result.results[`cmd-${index}`].exit === 0,
                      'has-text-danger': commit.cache_result && commit.cache_result.results && commit.cache_result.results[`cmd-${index}`] && commit.cache_result.results[`cmd-${index}`].exit === 1
                    }"
                  >
                    <i v-if="commit.cache_result && commit.cache_result.results && commit.cache_result.results[`cmd-${index}`] && commit.cache_result.results[`cmd-${index}`].exit === 1" class="fas fa-times" />
                    <i v-else-if="commit.cache_result && commit.cache_result.results && commit.cache_result.results[`cmd-${index}`] && commit.cache_result.results[`cmd-${index}`].exit === 0" class="fas fa-check" />
                    <span>{{ command }}</span>
                  </h3>
                  <div class="is-size-7 has-overresult-ellipses mr-4" style="margin-left: auto">
                    <span v-if="commit.cache_result">node: {{ commit.cache_result['nos-id'] }}</span>
                    <span v-else>pending</span>
                  </div>
                  <div>
                    <i class="fas fa-chevron-down" :class="{'fa-chevron-up': step === index}" />
                  </div>
                </div>
                <div v-if="step === index">
                  <div>
                    <pre v-if="commit.cache_result && commit.cache_result.results && commit.cache_result.results[`cmd-${index}`]">{{ commit.cache_result.results[`cmd-${index}`].out }}</pre>
                    <pre v-if="commit.cache_result && commit.cache_result.results && commit.cache_result.results[`cmd-${index}`]" class="has-text-danger">{{ commit.cache_result.results[`cmd-${index}`].err }}</pre>
                    <div v-else>
                      No results yet..
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="tab === 'logs'">
          <pre>{{ commit.cache_blockchain }}</pre>
        </div>
        <div v-else-if="tab === 'payload'">
          <pre>{{ commit.payload }}</pre>
        </div>
      </div>
      <div v-else>
        Loading..
      </div>
    </div>
  </section>
</template>

<script>
import bs58 from 'bs58'

export default {
  data () {
    return {
      commit: null,
      result: null,
      step: null,
      tab: 'result',
      user: null,
      refreshInterval: null
    }
  },
  watch: {
    '$sol.token' (token) {
      if (token) {
        this.getUser()
      }
    }
  },
  beforeDestroy () {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    }
  },
  created () {
    this.getCommit()
    if (this.$sol && this.$sol.token) {
      this.getUser()
    }
  },
  methods: {
    async getUser () {
      try {
        const user = await this.$axios.$get('/user')
        this.user = user
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        })
      }
    },
    async postJob (id) {
      try {
        await this.$axios.$post(`/commits/${id}/job`)
        this.getCommit()
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        })
      }
    },
    solHashToIpfsHash (hashArray) {
      // Convert the ipfs bytes from a solana job to a CID
      // It prepends the 0x1220 (18,32) to make it 34 bytes and Base58 encodes it.
      // This result is IPFS addressable.
      hashArray.unshift(18, 32)
      return bs58.encode(Buffer.from(hashArray))
    },
    async retrieveIpfsContent (hash) {
      const response = await fetch('https://gateway.pinata.cloud/ipfs/' + hash)
      const json = await response.json()
      return json
    },
    async getJobInfo (ipfsJob) {
      const hash = this.solHashToIpfsHash(ipfsJob)
      this.$set(this.commit, 'jobIpfsHash', hash)
      this.$set(this.commit, 'jobIpfs', await this.retrieveIpfsContent(hash))
    },
    getResult (ipfsResult) {
      // this.result = { 'nos-id': 'IJnYh-qz3uCPTQUk9bCiF', 'finished-at': 1645545696, results: { 'cmd-0': { exit: 0, out: 'audited 1581 packages in 9.248s\n\n124 packages are looking for funding\n  run `npm fund` for details\n\nfound 44 vulnerabilities (2 low, 29 moderate, 13 high)\n  run `npm audit fix` to fix them, or `npm audit` for details\n', err: '' }, 'cmd-1': { exit: 0, out: "yarn run v1.21.1\n$ set -ex; npm run pretty; eslint . --ext .js,.ts\n\n> @solana/web3.js@0.0.0-development pretty\n> prettier --check '{,{src,test}/**/}*.{j,t}s'\n\nChecking formatting...\nAll matched files use Prettier code style!\nDone in 12.01s.\n", err: '+ npm run pretty\n+ eslint . --ext .js,.ts\n' }, 'cmd-2': { exit: 0, out: "yarn run v1.21.1\n$ mocha -r ts-node/register './test/**/*.test.ts'\n\n\n  Account\n    ✓ generate new account\n    ✓ account from secret key\n\n  AgentManager\n    ✓ works (5005ms)\n\n  Cluster Util\n    ✓ invalid\n    ✓ devnet\n\n  Connection\n    ✓ should pass HTTP headers to RPC\n    ✓ should allow middleware to augment request\n    ✓ should attribute middleware fatals to the middleware\n    ✓ should not attribute fetch errors to the middleware\n    ✓ get account info - not found\n    ✓ get multiple accounts info\n    ✓ get program accounts (140ms)\n    ✓ get balance\n    ✓ get inflation\n    ✓ get inflation reward\n    ✓ get epoch info\n    ✓ get epoch schedule\n    ✓ get leader schedule\n    ✓ get slot\n    ✓ get slot leader\n    ✓ get slot leaders\n    ✓ get cluster nodes\n    ✓ confirm transaction - error\n    ✓ get transaction count\n    ✓ get total supply\n    ✓ get minimum balance for rent exemption\n    ✓ get confirmed signatures for address\n    ✓ get signatures for address\n    ✓ get parsed confirmed transactions\n    ✓ get transaction\n    ✓ get confirmed transaction\n    ✓ get parsed confirmed transaction coerces public keys of inner instructions\n    ✓ get block\n    ✓ get confirmed block\n    ✓ get blocks between two slots\n    ✓ get blocks from starting slot\n    ✓ get block signatures\n    ✓ get recent blockhash\n    ✓ get latest blockhash\n    ✓ get fee calculator\n    ✓ get fee for message\n    ✓ get block time\n    ✓ get minimum ledger slot\n    ✓ get first available block\n    ✓ get supply\n    ✓ get supply without accounts\n    ✓ get performance samples\n    ✓ get performance samples limit too high\n    ✓ get largest accounts (82ms)\n    ✓ stake activation should throw when called for not delegated account\n    ✓ stake activation should only accept state with valid string literals\n    ✓ getVersion\n    ✓ getGenesisHash\n    ✓ request airdrop\n    ✓ transaction failure (123ms)\n\n  EpochSchedule\n    ✓ slot methods work\n\n  Keypair\n    ✓ new keypair\n    ✓ generate new keypair\n    ✓ create keypair from secret key\n    ✓ creating keypair from invalid secret key throws error\n    ✓ creating keypair from invalid secret key succeeds if validation is skipped\n    ✓ generate keypair from random seed\n\n  Nonce\n    ✓ create and query nonce account (83ms)\n    ✓ create and query nonce account with seed (51ms)\n\n  PublicKey\n    ✓ invalid\n    ✓ equals\n    ✓ toBase58\n    ✓ toJSON\n    ✓ toBuffer\n    ✓ equals (II)\n    ✓ createWithSeed\n    ✓ createProgramAddress\n    ✓ findProgramAddress\n    ✓ isOnCurve\n    ✓ canBeSerializedWithBorsh\n    ✓ canBeDeserializedUncheckedWithBorsh\n\n  shortvec\n    ✓ decodeLength\n    ✓ encodeLength\n\n  StakeProgram\n    ✓ createAccountWithSeed\n    ✓ createAccount\n    ✓ delegate\n    ✓ authorize\n    ✓ authorize with custodian\n    ✓ authorizeWithSeed\n    ✓ authorizeWithSeed with custodian\n    ✓ split\n    ✓ splitWithSeed\n    ✓ merge\n    ✓ withdraw\n    ✓ withdraw with custodian\n    ✓ deactivate\n    ✓ StakeInstructions\n\n  SystemProgram\n    ✓ createAccount\n    ✓ transfer\n    ✓ transferWithSeed\n    ✓ allocate\n    ✓ allocateWithSeed\n    ✓ assign\n    ✓ assignWithSeed\n    ✓ createAccountWithSeed\n    ✓ createNonceAccount\n    ✓ createNonceAccount with seed\n    ✓ nonceAdvance\n    ✓ nonceWithdraw\n    ✓ nonceAuthorize\n    ✓ non-SystemInstruction error\n\n  Transaction Payer\n    ✓ transaction-payer (97ms)\n\n  Transaction\n    ✓ partialSign (130ms)\n    ✓ transfer signatures (57ms)\n    ✓ dedup signatures\n    ✓ use nonce (62ms)\n    ✓ parse wire format and serialize (61ms)\n    ✓ populate transaction\n    ✓ serialize unsigned transaction\n    ✓ deprecated - externally signed stake delegate\n    ✓ externally signed stake delegate\n    ✓ can serialize, deserialize, and reserialize with a partial signer (85ms)\n    compileMessage\n      ✓ accountKeys are ordered (40ms)\n      ✓ payer is first account meta (61ms)\n      ✓ validation\n      ✓ payer is writable (67ms)\n    dedupe\n      ✓ setSigners\n      ✓ sign\n\n  ValidatorInfo\n    ✓ from config account data\n\n  VoteProgram\n    ✓ createAccount\n    ✓ initialize\n    ✓ authorize\n    ✓ withdraw\n\n\n  128 passing (7s)\n\nDone in 14.26s.\n", err: 'Transaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nNo instructions provided\nNo instructions provided\nNo instructions provided\nNo instructions provided\n' } } }
      const hash = this.solHashToIpfsHash(ipfsResult)
      this.$set(this.commit, 'resultIpfsHash', hash)
      // result is now being retrieved in backend
      // this.result = await this.retrieveIpfsContent(hash)
    },
    async getCommit () {
      const id = this.$route.params.id
      try {
        const commit = await this.$axios.$get(`/commits/${id}`)
        this.commit = commit
        if (this.commit.status === 'RUNNING') {
          if (!this.refreshInterval) {
            // Refresh status every 10 seconds
            this.refreshInterval = setInterval(this.getCommit, parseInt(60000, 10))
          }
        } else if (this.refreshInterval) {
          clearInterval(this.refreshInterval)
          this.refreshInterval = null
        }
        if (this.commit.cache_blockchain) {
          // posted to blockchain, retrieve job
          this.getJobInfo(this.commit.cache_blockchain.ipfsJob)
          if (commit.cache_blockchain.jobStatus === 2) {
            // completed, retrieve results
            this.getResult(this.commit.cache_blockchain.ipfsResult)
          }
        }
        this.commit = commit
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
