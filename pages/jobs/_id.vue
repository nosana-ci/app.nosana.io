<template>
  <section class="section">
    <div class="container">
      <div v-if="commit">
        <div class="is-flex is-align-items-center">
          <div v-if="commit.repository_id" class="mr-4">
            <nuxt-link :to="`/repositories/${commit.repository_id}`" class="is-size-5">
              <i class="fas fa-chevron-left" />
            </nuxt-link>
          </div>
          <div class="mr-4">
            <div
              class="tag is-small"
              :class="{
                'is-accent': commit.status === 'COMPLETED' || commit.state === 2,
                'is-info': commit.status === 'RUNNING' || (!commit.status && commit.state === 1),
                'is-warning': commit.status === 'QUEUED' || (!commit.status && commit.state === 0),
                'is-danger': commit.status === ('FAILED' || 'STOPPED') || commit.state === 3
              }"
            >
              <span v-if="commit.status">{{ commit.status }}</span>
              <span v-else>{{ stateMap[commit.state] }}</span>
            </div>
          </div>
          <div v-if="commit.id">
            Job <b>#{{ commit.id }}</b> triggered by <a target="_blank" :href="'https://github.com/'+commit.payload.author.username">{{ commit.payload.author.username }}</a> {{ $moment(commit.created_at).fromNow() }}
          </div>
        </div>
        <hr class="my-4">
        <h1 class="title">
          <span v-if="commit.payload">{{ commit.payload.message.split('\n')[0] }}</span>
          <span v-else>External Job</span>
        </h1>
        <div class="tabs is-medium">
          <ul>
            <li :class="{'is-active': tab === 'result'}">
              <a @click.prevent="tab='result'">Result</a>
            </li>
            <li :class="{'is-active': tab === 'pipeline'}">
              <a @click.prevent="tab='pipeline'">Pipeline</a>
            </li>
          </ul>
        </div>
        <div class="columns">
          <div class="column is-9">
            <div v-if="tab === 'result'">
              <div class="box px-5 content-block has-background-black">
                <div>
                  <div class="row-count has-text-link">
                    <span>Posting job to blockchain</span>
                  </div>
                  <div>
                    <template v-if="commit.job">
                      <div class="row-count">
                        <span>Job posted</span>
                        <span v-if="commit.cache_blockchain">to market {{ commit.cache_blockchain.market }} for price
                          <b class="has-text-accent">
                            {{ parseInt(
                              commit.cache_blockchain.price ?
                                commit.cache_blockchain.price : commit.cache_blockchain.tokens, 16)/1e6
                            }}
                            NOS</b>
                        </span>
                      </div>
                      <div class="row-count">
                        <span>
                          <a
                            target="_blank"
                            :href="$sol.explorer + '/address/' + commit.job"
                            class="blockchain-address-inline"
                          >{{ commit.job }}</a>
                          <template
                            v-if="user &&
                              ((user.roles && user.roles.includes('admin')) || user.user_id === commit.user_id)"
                          >
                            <a
                              v-if="!loading"
                              class="has-text-warning"
                              @click="postJob(commit.id)"
                            >Re-run job</a>

                            <span v-else class="loading-text-white">Posting to blockchain</span>
                          </template>

                        </span>
                      </div>
                    </template>
                    <template v-else-if="!loading">
                      <div class="row-count">
                        <span>Not posted to blockchain.</span>
                      </div>
                      <div class="row-count">
                        <span>
                          <template
                            v-if="user && ((user.roles && user.roles.includes('admin'))
                              || user.user_id === commit.user_id)"
                          >
                            <a
                              class="has-text-warning"
                              @click="postJob(commit.id)"
                            >Post manually</a> or
                          </template>wait for cron job to pick it up
                        </span>
                      </div>
                    </template>
                    <div v-else class="row-count">
                      <span class="loading-text-white">Posting to blockchain</span>
                    </div>
                  </div>
                </div>
                <template v-if="commit.cache_blockchain">
                  <div class="row-count" />
                  <div>
                    <div class="row-count has-text-link">
                      <span>Finding node to run job</span>
                    </div>
                    <div>
                      <div v-if="commit.cache_blockchain.state > 0" class="row-count">
                        <span>Job claimed by node <a
                          target="_blank"
                          :href="$sol.explorer + '/address/' + commit.cache_blockchain.node"
                          class="blockchain-address-inline"
                        >{{ commit.cache_blockchain.node }}</a></span>
                      </div>
                      <div v-else class="row-count loading-text-white">
                        <span>Waiting for node to claim job</span>
                      </div>
                    </div>
                  </div>
                </template>
                <template v-if="commit.cache_blockchain && commit.cache_blockchain.state > 0">
                  <div class="row-count" />
                  <div>
                    <div class="row-count has-text-link">
                      <span>Running job</span>
                    </div>
                    <div>
                      <template
                        v-if="commit.job_content.pipeline.jobs"
                      >
                        <div
                          v-for="jobName in ['checkout'].concat(commit.job_content.pipeline.jobs.map(j => j.name))"
                          :key="jobName"
                        >
                          <template
                            v-if="(commit.cache_result && commit.cache_result.results
                              && commit.cache_result.results[jobName])"
                          >
                            <div class="row-count has-text-link">
                              <span>- Executed step '{{ jobName }}'</span>
                            </div>
                            <div
                              v-if="typeof commit.cache_result.results[jobName][1] === 'string'"
                              class="has-text-danger row-count"
                            >
                              <span>{{ commit.cache_result.results[jobName][1] }}</span>
                            </div>
                            <div
                              v-for="(step, index) in commit.cache_result.results[jobName][1]"
                              v-else
                              :key="index"
                            >
                              <div
                                v-if="step.cmd"
                                class="row-count"
                                :class="{'has-text-accent': !step.status,
                                         'has-text-danger': step.status}"
                              >
                                <span v-if="step.cmd.cmd" class="has-text-weight-bold">
                                  <span v-if="!step.cmd.cmd.startsWith('sh -c')">$ {{ step.cmd.cmd }}</span>
                                  <i v-else class="has-text-grey">executing through sh -c</i>
                                </span>
                                <span v-else class="has-text-weight-bold">$ {{ step.cmd }}</span>
                              </div>
                              <div v-if="step.log && Array.isArray(step.log)">
                                <div
                                  v-for="(log, ik) in step.log"
                                  v-show=" log[1] !== ''"
                                  :key="ik"
                                  class="row-count"
                                  :class="{'has-text-danger':
                                    log[0] === 2
                                    && step.status}"
                                >
                                  <span class="pre" v-html="log[1].slice(0, 10000)" />
                                  <!-- {{ convert.toHtml(log[1].slice(0, 10000)) }} -->
                                </div>
                                <div v-if="step.error" class="row-count has-text-danger">
                                  <span class="has-text-weight-bold">{{ step.error }}</span>
                                </div>
                                <div v-if="step.status" class="row-count has-text-danger">
                                  <span class="has-text-weight-bold">Exited with code {{ step.status }}</span>
                                </div>
                              </div>
                            </div>
                            <div class="row-count" />
                          </template>
                          <template v-else-if="!commit.cache_result && (logs[jobName] || currentStep === jobName)">
                            <div class="row-count has-text-link">
                              <span
                                :class="{'loading-text-link': currentStep === jobName}"
                              >- Execut<span v-if="currentStep === jobName">ing</span>
                                <span v-else>ed</span> step '{{ jobName }}'</span>
                            </div>
                            <template v-if="logs[jobName]">
                              <div class="row-count">
                                <span class="pre" v-html="logs[jobName].slice(0, 10000)" />
                              </div>
                            </template>
                          </template>
                        </div>
                      </template>
                      <div
                        v-if="!commit.cache_result || !commit.cache_result.results"
                        class="row-count loading-text-white"
                      >
                        <span>Waiting
                          <span v-if="nowSeconds">{{ nowSeconds - (parseInt(commit.cache_blockchain['timeStart'],16)) }}
                            seconds</span>
                          for results</span>
                      </div>
                    </div>
                  </div>
                </template>
                <template v-if="commit.cache_blockchain && commit.cache_blockchain.state === 2">
                  <div class="row-count" />
                  <div>
                    <div class="row-count has-text-link">
                      <span>Finishing job</span>
                    </div>
                    <div>
                      <template v-if="commit.cache_result && commit.cache_result.results">
                        <div class="row-count">
                          <span>Uploaded results
                            <a v-if="commit.resultIpfsHash" :href="'https://nosana.mypinata.cloud/ipfs/' + commit.resultIpfsHash" target="_blank">{{ commit.resultIpfsHash }}</a></span>
                        </div>
                      </template>
                      <div v-else class="row-count has-text-danger">
                        <span>Could not retrieve results</span>
                      </div>
                      <div class="row-count">
                        <span>Job finished
                          {{ $moment(parseInt(commit.cache_blockchain['timeEnd'],16)*1e3).fromNow() }}</span>
                      </div>
                      <div class="row-count">
                        <span>Duration:
                          {{ secondsToHms(commit.cache_blockchain['timeStart'], commit.cache_blockchain['timeEnd']) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </template>
                <div class="row-count" />
                <div class="row-count">
                  <span
                    class="tag is-small"
                    :class="{
                      'is-accent': commit.status === 'COMPLETED',
                      'is-info': commit.status === 'RUNNING',
                      'is-warning': commit.status === 'QUEUED',
                      'is-danger': commit.status === ('FAILED' || 'STOPPED')
                    }"
                  >
                    <b>JOB {{ commit.status }}</b>
                  </span>
                </div>
                <label v-if="commit.status === 'RUNNING'" class="checkbox ml-1 pt-5 is-flex">
                  <input v-model="disableAutoScroll" type="checkbox" class="mr-2">
                  Disable auto scroll
                </label>
              </div>
            </div>
            <div v-else-if="tab === 'payload'">
              <pre>{{ commit.payload }}</pre>
            </div>
            <div v-else-if="tab === 'pipeline'">
              <code-editor
                v-model="pipelineYml"
                :highlight-lines="[0]"
                :readonly="true"
                class="py-3 pt-4 code-editor"
              />
            </div>
            <div v-else>
              Loading..
            </div>
          </div>
          <div class="column is-3">
            <div v-if="commit.id" style="position: sticky; top: 20px;">
              <div class="box">
                <div v-if="commit.job && commit.cache_blockchain" class="mb-4">
                  <i class="fas fa-coins mr-4 has-text-accent" />
                  Pipeline Cost
                  <b class="has-text-accent">
                    {{ parseInt(
                      commit.cache_blockchain.price ?
                        commit.cache_blockchain.price : commit.cache_blockchain.tokens, 16)/1e6
                    }}
                    NOS</b>
                </div>
                <div v-if="commit.commit" class="has-overresult-ellipses">
                  <i class="fab fa-git mr-4 has-text-accent" />
                  Commit: <a
                    :href="commit.payload.url"
                    class="blockchain-address-inline"
                    target="_blank"
                    @click.stop
                  >{{ commit.commit }}</a>
                </div>
                <span v-if="commit.payload" style="white-space: pre-wrap">{{ commit.payload.message }}</span>
                <hr v-if="commit.job || commit.cache_blockchain || displayInfo">
                <div v-if="commit.job" class="mb-4">
                  <i class="fas fa-list mr-4 has-text-accent" />
                  Job: <a
                    target="_blank"
                    :href="$sol.explorer + '/address/' + commit.job"
                    class="blockchain-address-inline"
                  >{{ commit.job }}</a>
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
                <div v-if="displayInfo && displayInfo.market" class="mb-4">
                  <i class="fas fa-globe mr-4 has-text-accent" />
                  Market: <a
                    target="_blank"
                    :href="$sol.explorer + '/address/' + displayInfo.market"
                    class="blockchain-address-inline"
                  >{{ displayInfo.market }}</a>
                </div>
                <div v-if="displayInfo && displayInfo.payer" class="mb-4">
                  <i class="fas fa-user mr-4 has-text-accent" />
                  Payer: <a
                    target="_blank"
                    :href="$sol.explorer + '/address/' + displayInfo.payer"
                    class="blockchain-address-inline"
                  >{{ displayInfo.payer }}</a>
                </div>
                <div v-if="displayInfo && displayInfo.project">
                  <i class="fas fa-project-diagram mr-4 has-text-accent" />
                  Project: <a
                    target="_blank"
                    :href="$sol.explorer + '/address/' + displayInfo.project"
                    class="blockchain-address-inline"
                  >{{ displayInfo.project }}</a>
                </div>
                <hr v-if="commit.resultIpfsHash || commit.jobIpfsHash">
                <div v-if="commit.jobIpfsHash" class="mb-4">
                  <i class="fas fa-file mr-4 has-text-accent" />
                  Job IPFS: <a
                    target="_blank"
                    :href="'https://nosana.mypinata.cloud/ipfs/' + commit.jobIpfsHash"
                    class="blockchain-address-inline"
                  >{{ commit.jobIpfsHash }}</a>
                </div>
                <div v-if="commit.resultIpfsHash">
                  <i class="fas fa-file mr-4 has-text-accent" />
                  Result IPFS: <a
                    target="_blank"
                    :href="'https://nosana.mypinata.cloud/ipfs/' + commit.resultIpfsHash"
                    class="blockchain-address-inline"
                  >{{ commit.resultIpfsHash }}</a>
                </div>
                <hr
                  v-if="user && ((user.roles && user.roles.includes('admin')) || user.user_id === commit.user_id) &&
                    (commit.status !== 'PENDING' && commit.status !== 'QUEUED')"
                >
                <div class="buttons is-centered">
                  <button
                    v-if="user && ((user.roles && user.roles.includes('admin')) || user.user_id === commit.user_id) &&
                      (commit.status !== 'PENDING' && commit.status !== 'QUEUED')"
                    class="button is-accent is-outlined is-small is-fullwidth mt-2"
                    :class="{'is-loading': loading}"
                    @click="postJob(commit.id)"
                  >
                    Rerun job
                  </button>
                </div>
              </div>
            </div>

            <!-- Info from blockchain if it doesn't exists in database -->
            <div v-else-if="commit.ipfsJob">
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
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import bs58 from 'bs58';
import { parse, stringify } from 'yaml';
const Convert = require('ansi-to-html');
const convert = new Convert();
const nodes = require('../../utils/nodes.json');

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
      loading: false,
      tab: 'result',
      user: null,
      refreshInterval: null,
      logInterval: null,
      clockInterval: null,
      nowSeconds: null,
      logs: {},
      currentStep: null,
      hideResults: {},
      displayInfo: null,
      autoScroll: true,
      disableAutoScroll: false,
      stateMap: [
        'Queued',
        'Running',
        'Done',
        'Stopped'
      ]
    };
  },
  computed: {
    pipelineYml () {
      // commit.job_content.pipeline
      if (this.commit && this.commit.job_content && this.commit.job_content.pipeline) {
        return stringify(this.commit.job_content.pipeline);
      }
      return '';
    }
  },
  watch: {
    '$auth.loggedIn' (loggedIn) {
      if (loggedIn) {
        this.getUser();
      }
    },
    tab (newTab) {
      if (newTab === 'result') {
        this.autoScroll = true;
      } else {
        this.autoScroll = false;
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
    if (this.logInterval) {
      clearInterval(this.logInterval);
      this.logInterval = null;
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
        this.loading = true;
        await this.$axios.$post(`/commits/${id}/job`);
        this.getCommit();
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
      this.loading = false;
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
    async getLogs (node) {
      if (this.currentStep) {
        try {
          const response =
          await fetch(`${node}/nosana/logs/${this.commit.job}/${this.currentStep}`);
          if (response.status !== 200) {
            throw new Error('Log error status ' + response.status);
          }
          this.logs[this.currentStep] = await response.text();
          const lastCharacter = this.logs[this.currentStep].slice(-1);
          this.logs[this.currentStep] = convert.toHtml(this.logs[this.currentStep].replace(String.fromCharCode(26), ''));
          if (this.autoScroll && !this.disableAutoScroll) {
            this.$nextTick(() => {
              window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: 'smooth' });
            });
          }
          // Check EOF character
          if (lastCharacter.charCodeAt(0) === 26) {
            if (this.commit.job_content.pipeline.jobs) {
              const i = this.commit.job_content.pipeline.jobs.findIndex(item => item.name === this.currentStep) + 1;
              if (i < this.commit.job_content.pipeline.jobs.length) {
                this.currentStep = this.commit.job_content.pipeline.jobs[i].name;
              } else {
                this.currentStep = null;
                clearInterval(this.logInterval);
                this.logInterval = null;
              }
            } else {
              this.currentStep = null;
              clearInterval(this.logInterval);
              this.logInterval = null;
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    },
    async getCommit () {
      const id = this.$route.params.id;
      try {
        const commit = await this.$axios.$get(`/commits/${id}`);
        if (commit.cache_result) {
          for (const key in commit.cache_result.results) {
            const results = commit.cache_result.results[key];
            for (let i = 0; i < results[1].length; i++) {
              const step = results[1][i];
              if (step.log && Array.isArray(step.log)) {
                for (let j = 0; j < step.log.length; j++) {
                  step.log[j][1] = convert.toHtml(step.log[j][1]);
                }
              }
            }
          }
        }
        this.commit = commit;
        if (this.commit.status === 'RUNNING') {
          this.commit.cache_blockchain = {};
          this.commit.cache_blockchain.node = '4HoZogbrDGwK6UsD1eMgkFKTNDyaqcfb2eodLLtS8NTx';
          if (!this.logInterval && this.commit.cache_blockchain) {
            const node = nodes[this.commit.cache_blockchain.node];
            const network = process.env.NUXT_ENV_SOL_NETWORK_NAME;
            if (node && node[network] && node[network].endpoint && node[network].logs) {
              this.currentStep = 'checkout';
              // Refresh logs every second
              this.getLogs(node[network].endpoint);
              this.logInterval = setInterval(() => { this.getLogs(node[network].endpoint); }, parseInt(1000, 10));
            }
          }
        } else if (this.logInterval) {
          clearInterval(this.logInterval);
          this.logInterval = null;
        }
        if (this.commit.status === 'RUNNING' || this.commit.status === 'QUEUED' || this.commit.status === 'PENDING') {
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
        if (this.autoScroll && this.commit.status === 'RUNNING' && !this.disableAutoScroll) {
          this.$nextTick(() => {
            window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: 'smooth' });
          });
        }
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
</style>

<style lang="scss" scoped>
.checkbox {
  &:hover {
   color: $white;
  }
}
.pre {
  white-space: pre-wrap;
}
.content-block{
  color: white;
  font-family: monospace;
  font-size: 14px;
  counter-reset: line;
  a {
    color:white;
    text-decoration: underline;
  }
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
  word-break: break-word;
  max-width: 85%;
  padding-left: 40px;
  &:before{
    counter-increment: line;
    font-family: $family-monospace;
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
    color: $red !important;
  }
}
</style>
