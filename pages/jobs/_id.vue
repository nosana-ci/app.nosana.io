<template>
  <section class="section">
    <div class="container">
      <div v-if="commit">
        <div v-if="commit.id">
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
                  'is-danger': commit.status === ('FAILED' || 'STOPPED')
                }"
              >
                {{ commit.status }}
              </div>
            </div>
            <div>Job <b>#{{ commit.id }}</b> triggered by <a target="_blank" :href="'https://github.com/'+commit.payload.author.username">{{ commit.payload.author.username }}</a> {{ $moment(commit.created_at).fromNow() }}</div>
          </div>
          <hr class="my-4">
          <h1 class="title">
            {{ commit.payload.message.split('\n')[0] }}
          </h1>
          <div class="box">
            <div v-if="commit.job" class="mb-4">
              <i class="fas fa-list mr-4 has-text-accent" />
              Smart Contract Job <a
                target="_blank"
                :href="$sol.explorer + '/address/' + commit.job"
                class="blockchain-address-inline"
              >{{ commit.job }}</a>
            </div>
            <div v-if="commit.job && commit.cache_blockchain" class="mb-4">
              <i class="fas fa-coins mr-4 has-text-accent" />
              Pipeline total cost
              <b class="has-text-accent">
                {{ parseInt(
                  commit.cache_blockchain.price ?
                    commit.cache_blockchain.price : commit.cache_blockchain.tokens, 16)/1e6
                }}
                NOS</b>
            </div>
            <div
              v-if="commit.job && commit.cache_blockchain
                && (commit.cache_blockchain.state > 0 || commit.cache_blockchain.jobStatus > 0)"
              class="mb-4"
            >
              <i class="fas fa-server mr-4 has-text-accent" />
              Node: <a
                target="_blank"
                :href="$sol.explorer + '/address/' + commit.cache_blockchain.node"
                class="blockchain-address-inline"
              >{{ commit.cache_blockchain.node }}</a>
            </div>
            <div v-if="commit.commit" class="has-overresult-ellipses">
              <i class="fab fa-git mr-4 has-text-accent" />
              Commit <a
                :href="commit.payload.url"
                class="blockchain-address-inline"
                target="_blank"
                @click.stop
              >{{ commit.commit }}</a>
            </div>
            <span v-if="commit.payload" style="white-space: pre-wrap">{{ commit.payload.message }}</span>
          </div>
          <div v-if="!commit.job" class="level notification is-warning">
            <div class="level-left">
              <div class="level-item">
                <span>Not posted to blockchain..</span>
              </div>
            </div>
            <div v-if="user && (user.roles && user.roles.includes('admin'))" class="level-right">
              <div class="level-item">
                <button class="button is-small is-danger" style="display: none" @click="postJob(commit.id)">
                  Retry transaction
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Info from blockchain if it doesn't exists in database -->
        <div v-else-if="commit.ipfsJob">
          <div class="is-flex is-align-items-center">
            <div class="mr-4">
              <div
                class="tag is-small"
                :class="{
                  'is-accent': commit.state === 2,
                  'is-info': commit.state === 1,
                  'is-warning': commit.state === 0,
                  'is-danger': commit.state === 3
                }"
              >
                {{ stateMap[commit.state] }}
              </div>
            </div>
          </div>
          <hr class="my-4">
          <div class="box">
            <div v-if="$route.params.id" class="mb-4">
              <i class="fas fa-list mr-4 has-text-accent" />
              Smart Contract Job <a
                target="_blank"
                :href="$sol.explorer + '/address/' + $route.params.id"
                class="blockchain-address-inline"
              >{{ $route.params.id }}</a>
            </div>
            <div v-if="commit.price" class="mb-4">
              <i class="fas fa-coins mr-4 has-text-accent" />
              Pipeline total cost
              <b class="has-text-accent">
                {{ parseInt(commit.price, 16)/1e6
                }}
                NOS</b>
            </div>
            <div
              class="mb-4"
            >
              <i class="fas fa-server mr-4 has-text-accent" />
              Node: <a
                target="_blank"
                :href="$sol.explorer + '/address/' + commit.node"
                class="blockchain-address-inline"
              >{{ commit.node }}</a>
            </div>
            <div
              class="mb-4"
            >
              <i class="fas fa-shop mr-4 has-text-accent" />
              Market: <a
                target="_blank"
                :href="$sol.explorer + '/address/' + commit.market"
                class="blockchain-address-inline"
              >{{ commit.market }}</a>
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
            <li :class="{'is-active': tab === 'ipfs'}">
              <a @click.prevent="tab='ipfs'">IPFS</a>
            </li>
            <li :class="{'is-active': tab === 'pipeline'}">
              <a @click.prevent="tab='pipeline'">Pipeline</a>
            </li>
          </ul>
        </div>
        <div v-if="tab === 'result'">
          <div v-if="commit.job_content">
            <div v-if="commit.ipfsJob">
              <small v-if="parseInt(commit.timeEnd,16)">
                Finished {{ $moment(parseInt(commit.timeEnd,16)*1e3).fromNow() }}<br>
                Duration: {{ secondsToHms(commit.timeStart, commit.timeEnd) }}
              </small>
              <small
                v-else-if="nowSeconds && parseInt(commit.timeStart,16)"
              >
                Running for {{ nowSeconds - (parseInt(commit.timeStart,16)) }} seconds
              </small>
            </div>
            <div v-else>
              <small v-if="commit.cache_blockchain && parseInt(commit.cache_blockchain['timeEnd'],16)">
                Finished {{ $moment(parseInt(commit.cache_blockchain['timeEnd'],16)*1e3).fromNow() }}<br>
                Duration: {{ secondsToHms(commit.cache_blockchain['timeStart'], commit.cache_blockchain['timeEnd']) }}
              </small>
              <small
                v-else-if="nowSeconds && commit.cache_blockchain && parseInt(commit.cache_blockchain['timeStart'],16)"
              >
                Running for {{ nowSeconds - (parseInt(commit.cache_blockchain['timeStart'],16)) }} seconds
              </small>
            </div>
          </div>
          <div
            v-if="commit.job_content"
            class="box mt-2 px-5 content-block has-background-black"
          >
            <div v-if="commit.cache_result && commit.cache_result.results">
              <div class="has-text-centered block">
                <div class="tag is-medium">
                  <b>Node:</b>&nbsp;{{ commit.cache_result['nos-id'] }}
                </div>
              </div>
              <div v-for="(res, index, count) in commit.cache_result.results" :key="index">
                <div v-if="index !== 'docker-cmds' && index.startsWith('cmd-')">
                  <div
                    class="is-flex is-justify-content-space-between is-align-items-center command is-clickable"
                    @click="toggleResult(index)"
                  >
                    <p
                      class="has-text-link has-text-weight-bold row-count"
                      :class="{'has-text-danger': res.exit}"
                    >
                      <span
                        v-if="commit.job_content.pipeline.jobs[parseInt(index.split('-')[1])]
                          && commit.job_content.pipeline.jobs[parseInt(index.split('-')[1])].commands
                          && Array.isArray(commit.job_content.pipeline.jobs[parseInt(index.split('-')[1])].commands)"
                      >
                        <span>
                          <span
                            v-for="cmd in commit.job_content.pipeline.jobs[parseInt(index.split('-')[1])].commands"
                            :key="cmd"
                          >
                            {{ cmd }}
                          </span>
                        </span>
                      </span>
                      <span v-else>
                        {{ commit.job_content.pipeline.jobs[parseInt(index.split('-')[1])] }}
                      </span>
                    </p>
                    <i
                      class="fas fa-chevron-down ml-2 has-text-accent"
                      :class="{'fa-chevron-up': !hideResults[index]}"
                    />
                  </div>
                  <p class="has-text-white row-count log" :class="{'hidden-log': hideResults[index]}">
                    <span class="pre">{{ res.out }}</span>
                    <span class="pre has-text-danger">{{ res.err }}</span>
                  </p>
                </div>
                <div v-else>
                  <div
                    v-for="(item, i) of res[1]"
                    :key="i"
                  >
                    <div
                      v-if="item.cmd"
                      class="is-flex is-justify-content-space-between is-align-items-center command is-clickable"
                      @click="toggleResult(count + '.' + (i - 1))"
                    >
                      <p
                        v-if="!item.cmd.cmd"
                        class="row-count has-text-weight-bold has-text-accent log"
                        :class="{'has-text-danger': item.error}"
                      >
                        {{ item.cmd }}
                      </p>
                      <p
                        v-else
                        class="row-count has-text-weight-bold has-text-accent log"
                        :class="{'has-text-danger': item.error}"
                      >
                        {{ item.cmd.cmd }}
                      </p>
                      <div>
                        <p v-if="item.time && i > 0" class="tag" style="font-family: monospace;">
                          {{ timeStamp(res[1][i - 1]['time'], item.time) }}
                        </p>
                        <i
                          class="fas fa-chevron-down ml-2 has-text-accent"
                          :class="{'fa-chevron-up': !hideResults[count + '.' + (i - 1)]}"
                        />
                      </div>
                    </div>
                    <div v-if="item.log && Array.isArray(item.log)">
                      <div
                        v-for="(log, ik) in item.log"
                        v-show=" log[1] !== ''"
                        :key="ik"
                        class="row-count log"
                        :class="{'has-text-white': log[0] === 1 ||
                                   res[0] === 'success' || (log[0] === 2 && !item.error),
                                 'has-text-danger': log[0] === 2 && item.error,
                                 'hidden-log': hideResults[count + '.' + (i - 1)] }"
                      >
                        {{ log[1] }}
                      </div>
                    </div>
                    <p
                      v-else-if="item.log"
                      class="row-count has-text-white log"
                      :class="{'hidden-log': hideResults[count + '.' + (i - 1)]}"
                    >
                      <span class="pre">{{ item.log | truncate(10000, '...\n') }}</span>
                      <span class="pre has-text-danger">{{ item.error }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div v-else>
              <div
                v-if="commit.state == 2 &&
                  (!commit.job_content.pipeline.jobs || commit.job_content.pipeline.jobs.length === 0)"
              >
                Results are hidden
              </div>
              <div v-else>
                <div
                  v-for="(job, index) in ['git clone', 'git checkout'].concat(commit.job_content.pipeline.jobs)"
                  :key="index"
                >
                  <div
                    v-if="job && job.commands && Array.isArray(job.commands)"
                    class="has-text-link"
                  >
                    <span class="row-count log">Job: {{ job.name }}</span><br>
                    <div
                      v-for="cmd in job.commands"
                      :key="cmd"
                      class="row-count log has-text-white"
                    >
                      {{ cmd }}
                    </div>
                  </div>
                  <div class="has-text-link row-count log">
                    {{ job }}
                  </div>
                  <div class="log row-count has-text-white log">
                    pending...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="tab === 'logs'">
          <pre>{{ displayInfo }}</pre>
        </div>
        <div v-else-if="tab === 'payload'">
          <pre>{{ commit.payload }}</pre>
        </div>
        <div v-else-if="tab === 'ipfs'">
          <div v-if="commit.jobIpfsHash">
            Job IPFS: <a :href="'https://nosana.mypinata.cloud/ipfs/' + commit.jobIpfsHash" target="_blank">{{ commit.jobIpfsHash }}</a>
          </div>
          <div v-if="commit.resultIpfsHash">
            Result IPFS: <a :href="'https://nosana.mypinata.cloud/ipfs/' + commit.resultIpfsHash" target="_blank">{{ commit.resultIpfsHash }}</a>
          </div>
        </div>
        <div v-else-if="tab === 'pipeline'">
          <pre>{{ commit.job_content.pipeline }}</pre>
        </div>
      </div>
      <div v-else>
        Loading..
      </div>
    </div>
  </section>
</template>

<script>
import bs58 from 'bs58';
import { parse } from 'yaml';

export default {
  filters: {
    truncate: function (text, length, suffix) {
      if (text.length > length) {
        return text.substring(0, length) + suffix;
      } else {
        return text;
      }
    }
  },
  data () {
    return {
      commit: null,
      result: null,
      step: null,
      tab: 'result',
      user: null,
      refreshInterval: null,
      clockInterval: null,
      nowSeconds: null,
      hideResults: {},
      displayInfo: null,
      stateMap: [
        'Queued',
        'Running',
        'Done',
        'Stopped'
      ]
    };
  },
  watch: {
    '$auth.loggedIn' (loggedIn) {
      if (loggedIn) {
        this.getUser();
      }
    }
  },
  beforeDestroy () {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
      this.clockInterval = null;
    }
  },
  created () {
    this.getCommit();
    this.updateClock();
    if (!this.clockInterval) {
      this.clockInterval = setInterval(this.updateClock, 1000);
    }
    if (this.$auth && this.$auth.loggedIn) {
      this.getUser();
    }
  },
  methods: {
    toggleResult (i) {
      if (i in this.hideResults) {
        this.hideResults[i] = !this.hideResults[i];
      } else {
        this.$set(this.hideResults, i, true);
      }
    },
    secondsToHms (start, end) {
      const startTime = parseInt(start, 16);
      const endTime = parseInt(end, 16);
      const totalTime = endTime - startTime;
      const h = Math.floor(totalTime / 3600);
      const m = Math.floor(totalTime % 3600 / 60);
      const s = Math.floor(totalTime % 3600 % 60);

      const hours = h > 0 ? h + (h === 1 ? ' hour, ' : ' hours, ') : '';
      const minutes = m > 0 ? m + (m === 1 ? ' minute, ' : ' minutes, ') : '';
      const seconds = s > 0 ? s + (s === 1 ? ' second' : ' seconds') : '';
      return hours + minutes + seconds;
    },
    timeStamp (start, end) {
      const totalTime = end - start;
      const h = Math.floor(totalTime / 3600);
      const m = Math.floor(totalTime % 3600 / 60);
      const s = Math.floor(totalTime % 3600 % 60);
      const hours = h > 0 && h < 10 ? '0' + h + ':' : (h >= 10 ? h + ':' : '');
      const minutes = m > 0 && m < 10 ? '0' + m + ':' : (m >= 10 ? m + ':' : '00:');
      const seconds = s > 0 && s < 10 ? '0' + s : (s >= 10 ? s : '00');

      const time = hours + minutes + seconds;
      return time;
    },
    updateClock () {
      this.nowSeconds = parseInt((new Date()).getTime() / 1e3);
    },
    async getUser () {
      try {
        const user = await this.$axios.$get('/user');
        this.user = user;
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    async postJob (id) {
      try {
        await this.$axios.$post(`/commits/${id}/job`);
        this.getCommit();
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    solHashToIpfsHash (hashArray) {
      // Convert the ipfs bytes from a solana job to a CID
      // It prepends the 0x1220 (18,32) to make it 34 bytes and Base58 encodes it.
      // This result is IPFS addressable.
      if (hashArray[0] !== 18 || hashArray[1] !== 32) {
        hashArray.unshift(18, 32);
      }
      return bs58.encode(Buffer.from(hashArray));
    },
    async retrieveIpfsContent (hash) {
      const response = await fetch('https://nosana.mypinata.cloud/ipfs/' + hash);
      const json = await response.json();
      return json;
    },
    async getJobInfo (ipfsJob) {
      const hash = this.solHashToIpfsHash(ipfsJob);
      this.$set(this.commit, 'jobIpfsHash', hash);
      if (!this.commit.job_content) {
        this.$set(this.commit, 'job_content', await this.retrieveIpfsContent(hash));
      }
      if (this.commit.job_content.pipeline) {
        this.$set(this.commit.job_content, 'pipeline', parse(this.commit.job_content.pipeline));
      } else {
        this.$set(this.commit.job_content, 'pipeline', { jobs: this.commit.job_content.jobs });
      }
    },
    getResult (ipfsResult) {
      // this.result = { 'nos-id': 'IJnYh-qz3uCPTQUk9bCiF', 'finished-at': 1645545696, results: { 'cmd-0': { exit: 0, out: 'audited 1581 packages in 9.248s\n\n124 packages are looking for funding\n  run `npm fund` for details\n\nfound 44 vulnerabilities (2 low, 29 moderate, 13 high)\n  run `npm audit fix` to fix them, or `npm audit` for details\n', err: '' }, 'cmd-1': { exit: 0, out: "yarn run v1.21.1\n$ set -ex; npm run pretty; eslint . --ext .js,.ts\n\n> @solana/web3.js@0.0.0-development pretty\n> prettier --check '{,{src,test}/**/}*.{j,t}s'\n\nChecking formatting...\nAll matched files use Prettier code style!\nDone in 12.01s.\n", err: '+ npm run pretty\n+ eslint . --ext .js,.ts\n' }, 'cmd-2': { exit: 0, out: "yarn run v1.21.1\n$ mocha -r ts-node/register './test/**/*.test.ts'\n\n\n  Account\n    ✓ generate new account\n    ✓ account from secret key\n\n  AgentManager\n    ✓ works (5005ms)\n\n  Cluster Util\n    ✓ invalid\n    ✓ devnet\n\n  Connection\n    ✓ should pass HTTP headers to RPC\n    ✓ should allow middleware to augment request\n    ✓ should attribute middleware fatals to the middleware\n    ✓ should not attribute fetch errors to the middleware\n    ✓ get account info - not found\n    ✓ get multiple accounts info\n    ✓ get program accounts (140ms)\n    ✓ get balance\n    ✓ get inflation\n    ✓ get inflation reward\n    ✓ get epoch info\n    ✓ get epoch schedule\n    ✓ get leader schedule\n    ✓ get slot\n    ✓ get slot leader\n    ✓ get slot leaders\n    ✓ get cluster nodes\n    ✓ confirm transaction - error\n    ✓ get transaction count\n    ✓ get total supply\n    ✓ get minimum balance for rent exemption\n    ✓ get confirmed signatures for address\n    ✓ get signatures for address\n    ✓ get parsed confirmed transactions\n    ✓ get transaction\n    ✓ get confirmed transaction\n    ✓ get parsed confirmed transaction coerces public keys of inner instructions\n    ✓ get block\n    ✓ get confirmed block\n    ✓ get blocks between two slots\n    ✓ get blocks from starting slot\n    ✓ get block signatures\n    ✓ get recent blockhash\n    ✓ get latest blockhash\n    ✓ get fee calculator\n    ✓ get fee for message\n    ✓ get block time\n    ✓ get minimum ledger slot\n    ✓ get first available block\n    ✓ get supply\n    ✓ get supply without accounts\n    ✓ get performance samples\n    ✓ get performance samples limit too high\n    ✓ get largest accounts (82ms)\n    ✓ stake activation should throw when called for not delegated account\n    ✓ stake activation should only accept state with valid string literals\n    ✓ getVersion\n    ✓ getGenesisHash\n    ✓ request airdrop\n    ✓ transaction failure (123ms)\n\n  EpochSchedule\n    ✓ slot methods work\n\n  Keypair\n    ✓ new keypair\n    ✓ generate new keypair\n    ✓ create keypair from secret key\n    ✓ creating keypair from invalid secret key throws error\n    ✓ creating keypair from invalid secret key succeeds if validation is skipped\n    ✓ generate keypair from random seed\n\n  Nonce\n    ✓ create and query nonce account (83ms)\n    ✓ create and query nonce account with seed (51ms)\n\n  PublicKey\n    ✓ invalid\n    ✓ equals\n    ✓ toBase58\n    ✓ toJSON\n    ✓ toBuffer\n    ✓ equals (II)\n    ✓ createWithSeed\n    ✓ createProgramAddress\n    ✓ findProgramAddress\n    ✓ isOnCurve\n    ✓ canBeSerializedWithBorsh\n    ✓ canBeDeserializedUncheckedWithBorsh\n\n  shortvec\n    ✓ decodeLength\n    ✓ encodeLength\n\n  StakeProgram\n    ✓ createAccountWithSeed\n    ✓ createAccount\n    ✓ delegate\n    ✓ authorize\n    ✓ authorize with custodian\n    ✓ authorizeWithSeed\n    ✓ authorizeWithSeed with custodian\n    ✓ split\n    ✓ splitWithSeed\n    ✓ merge\n    ✓ withdraw\n    ✓ withdraw with custodian\n    ✓ deactivate\n    ✓ StakeInstructions\n\n  SystemProgram\n    ✓ createAccount\n    ✓ transfer\n    ✓ transferWithSeed\n    ✓ allocate\n    ✓ allocateWithSeed\n    ✓ assign\n    ✓ assignWithSeed\n    ✓ createAccountWithSeed\n    ✓ createNonceAccount\n    ✓ createNonceAccount with seed\n    ✓ nonceAdvance\n    ✓ nonceWithdraw\n    ✓ nonceAuthorize\n    ✓ non-SystemInstruction error\n\n  Transaction Payer\n    ✓ transaction-payer (97ms)\n\n  Transaction\n    ✓ partialSign (130ms)\n    ✓ transfer signatures (57ms)\n    ✓ dedup signatures\n    ✓ use nonce (62ms)\n    ✓ parse wire format and serialize (61ms)\n    ✓ populate transaction\n    ✓ serialize unsigned transaction\n    ✓ deprecated - externally signed stake delegate\n    ✓ externally signed stake delegate\n    ✓ can serialize, deserialize, and reserialize with a partial signer (85ms)\n    compileMessage\n      ✓ accountKeys are ordered (40ms)\n      ✓ payer is first account meta (61ms)\n      ✓ validation\n      ✓ payer is writable (67ms)\n    dedupe\n      ✓ setSigners\n      ✓ sign\n\n  ValidatorInfo\n    ✓ from config account data\n\n  VoteProgram\n    ✓ createAccount\n    ✓ initialize\n    ✓ authorize\n    ✓ withdraw\n\n\n  128 passing (7s)\n\nDone in 14.26s.\n", err: 'Transaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nNo instructions provided\nNo instructions provided\nNo instructions provided\nNo instructions provided\n' } } }
      const hash = this.solHashToIpfsHash(ipfsResult);
      this.$set(this.commit, 'resultIpfsHash', hash);
      // result is now being retrieved in backend
      // this.result = await this.retrieveIpfsContent(hash)
    },
    async getCommit () {
      const id = this.$route.params.id;
      try {
        const commit = await this.$axios.$get(`/commits/${id}`);
        this.commit = commit;
        if (this.commit.status === 'RUNNING' || this.commit.status === 'QUEUED') {
          if (!this.refreshInterval) {
            // Refresh status every 10 seconds
            this.refreshInterval = setInterval(this.getCommit, parseInt(10000, 10));
          }
        } else if (this.refreshInterval) {
          clearInterval(this.refreshInterval);
          this.refreshInterval = null;
        }
        if (this.commit.cache_blockchain) {
          // posted to blockchain, retrieve job
          this.getJobInfo(this.commit.cache_blockchain.ipfsJob);
          if (commit.cache_blockchain.state === 2 || commit.cache_blockchain.jobStatus === 2) {
            // completed, retrieve results
            this.getResult(this.commit.cache_blockchain.ipfsResult);
          }
          this.displayInfo = Object.assign({}, this.commit.cache_blockchain);
          delete this.displayInfo.ipfsJob;
          delete this.displayInfo.ipfsResult;
        }

        if (this.commit.ipfsJob) {
          await this.getJobInfo(this.commit.ipfsJob);
          if (this.commit.ipfsResult && this.commit.state === 2) {
            // completed, retrieve results
            this.getResult(this.commit.ipfsResult);
          }
          this.displayInfo = Object.assign({}, this.commit);
        }
        this.commit = commit;
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

<style lang="scss" scoped>
.pre {
  white-space: pre-line;
}
.log {
  word-break: break-word;
  max-width: 85%;
  padding-left: 40px;
}
.content-block{
  counter-reset: line;
}
.hidden-log {
  overflow:hidden;
  height:0;
}
.command {
  &:hover {
    background: $grey-darker;
  }
}

.row-count{
  &:before{
    counter-increment: line;
    font-family: $family-headers;
    font-weight: normal;
    content: counter(line);
    display: inline-block;
    padding: 0 .5em;
    margin-right: .5em;
    color: $grey !important;
    min-width: 50px;
    text-align: right;
    margin-left: -62px;
  }
  &.has-text-danger:before {
    color: $red;
  }
}
</style>
