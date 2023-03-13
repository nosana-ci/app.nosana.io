<template>
  <section class="section">
    <div class="container">
      <div v-if="job">
        <div class="is-flex is-align-items-center">
          <div v-if="job.repository_id" class="mr-4">
            <nuxt-link :to="`/repositories/${job.repository_id}`" class="is-size-5">
              <i class="fas fa-chevron-left" />
            </nuxt-link>
          </div>
          <div class="mr-4">
            <div
              class="tag is-small"
              :class="{
                'is-accent': job.status === 'COMPLETED' || job.state === 2,
                'is-info': job.status === 'RUNNING' || (!job.status && job.cache_run_account),
                'is-warning': job.status === 'QUEUED' || (!job.status && job.state === 0 && !job.cache_run_account),
                'is-danger': job.status === ('FAILED' || 'STOPPED') || job.state === 3
              }"
            >
              <span v-if="job.status">{{ job.status }}</span>
              <span v-else>{{ stateMap[job.cache_run_account ? 1 : job.state] }}</span>
            </div>
          </div>
          <div>
            Job
            <span v-if="job.payload && job.payload.author">triggered by <a target="_blank" :href="'https://github.com/'+job.payload.author.username">{{ job.payload.author.username }}</a></span>
            <span v-else-if="job.payload && job.payload.user">triggered by <a target="_blank" :href="'https://github.com/'+job.payload.user.login">{{ job.payload.user.login }}</a></span>
            {{ $moment(job.created_at).fromNow() }}
          </div>
        </div>
        <hr class="my-4">
        <h1 class="title">
          <span v-if="job.payload && job.payload.message">{{ job.payload.message.split('\n')[0] }}</span>
          <span v-if="job.payload && job.payload.title">{{ job.payload.title }}</span>
          <span v-else-if="!job.payload">External Job</span>
        </h1>
        <div class="tabs is-medium">
          <ul>
            <li :class="{'is-active': tab === 'result'}">
              <a @click.prevent="tab='result'">Result</a>
            </li>
            <li v-show="user && user.roles === 'admin'" :class="{'is-active': tab === 'pipeline'}">
              <a @click.prevent="tab='pipeline'">Pipeline</a>
            </li>
          </ul>
        </div>
        <div class="columns">
          <div class="column" :class="{ 'is-9': minimizeSideBar, 'is-11': minimizeSideBar}">
            <div v-if="tab === 'result'">
              <div
                id="terminal"
                class="box px-5 content-block has-background-black terminal"
                @scroll.prevent="handleScroll"
              >
                <div>
                  <div class="row-count has-text-link">
                    <span>Posting job to blockchain</span>
                  </div>
                  <div>
                    <template v-if="job.address">
                      <div class="row-count">
                        <span>Job posted</span>
                        <span v-if="job.cache_blockchain">to market {{ job.cache_blockchain.market }} for price
                          <b class="has-text-accent">
                            {{ parseInt(
                              job.cache_blockchain.price ?
                                job.cache_blockchain.price : job.cache_blockchain.tokens, 16)/1e6
                            }}
                            NOS</b>
                        </span>
                      </div>
                      <div class="row-count">
                        <span>
                          <a
                            target="_blank"
                            :href="$sol.explorer + '/address/' + job.address"
                            class="blockchain-address-inline"
                          >{{ job.address }}</a>
                          <template
                            v-if="user &&
                              ((user.roles && user.roles.includes('admin')) || user.user_id === job.user_id)"
                          >
                            <a
                              v-if="!loading"
                              class="has-text-warning"
                              @click="postJob(job.commit_id)"
                            >Re-run job</a>

                            <span v-else class="loading-text-white">Posting to blockchain</span>
                          </template>

                        </span>
                      </div>
                    </template>
                    <template v-else-if="($route.params.id.length > 10 && job.ipfsJob)">
                      <div class="row-count">
                        Job posted to market {{ job.market }} for price
                        <b class="has-text-accent">{{ parseInt(job.price, 16)/1e6 }} NOS</b>
                      </div>
                      <div class="row-count">
                        <span>
                          <a
                            target="_blank"
                            :href="$sol.explorer + '/address/' + $route.params.id"
                            class="blockchain-address-inline"
                          >{{ $route.params.id }}</a>
                        </span>
                      </div>
                    </template>
                    <template v-else-if="!loading">
                      <div v-if="job.status === 'NOT_POSTED'" class="row-count">
                        <span>Not posted to blockchain.</span>
                      </div>
                      <div class="row-count">
                        <span>
                          <template
                            v-if="user && ((user.roles && user.roles.includes('admin'))
                              || user.user_id === job.user_id)"
                          >
                            <span v-if="job.status === 'NOT_POSTED'">
                              <a
                                class="has-text-warning"
                                @click="postJob(job.commit_id)"
                              >Post manually</a>
                              or wait for cron job to pick it up
                            </span>
                          </template>
                        </span>
                      </div>
                      <div v-if="job.status === 'PENDING'" class="row-count">
                        <span class="loading-text-white">Posting to blockchain</span>
                      </div>
                    </template>
                    <div v-else class="row-count">
                      <span class="loading-text-white">Posting to blockchain</span>
                    </div>
                  </div>
                </div>
                <template v-if="job.cache_blockchain">
                  <div class="row-count" />
                  <div>
                    <div class="row-count has-text-link">
                      <span>Finding node to run job</span>
                    </div>
                    <div>
                      <div v-if="job.cache_blockchain.state > 0 || job.cache_run_account" class="row-count">
                        <span>Job claimed by node <a
                          target="_blank"
                          :href="$sol.explorer + '/address/' +
                            (job.cache_run_account ?
                              job.cache_run_account.account.node : job.cache_blockchain.node)"
                          class="blockchain-address-inline"
                        >{{ job.cache_run_account ?
                          job.cache_run_account.account.node : job.cache_blockchain.node }}</a></span>
                      </div>
                      <div v-else class="row-count loading-text-white">
                        <span>Waiting for node to claim job</span>
                      </div>
                    </div>
                  </div>
                </template>
                <template
                  v-if="job.cache_blockchain &&
                    (job.cache_blockchain.state > 0 || job.cache_run_account)"
                >
                  <div class="row-count" />
                  <div>
                    <div class="row-count has-text-link">
                      <span>Running job</span>
                    </div>
                    <div>
                      <template
                        v-if="job.job_content.pipeline.jobs"
                      >
                        <div
                          v-for="jobName in (job.job_content.pipeline.jobs
                            .find(j => j.id === 'checkout') ? [] : ['checkout'])
                            .concat(job.job_content.pipeline.jobs
                              .map(j => j.name || j.id))"
                          :key="jobName"
                        >
                          <template
                            v-if="(job.cache_result && job.cache_result.results
                              && job.cache_result.results[jobName])"
                          >
                            <div class="row-count has-text-link">
                              <span>- Executed step '{{ jobName }}'</span>
                            </div>
                            <div
                              v-if="typeof job.cache_result.results[jobName][1] === 'string'"
                              class="has-text-danger row-count"
                            >
                              <span>{{ job.cache_result.results[jobName][1] }}</span>
                            </div>
                            <div
                              v-for="(step, index) in job.cache_result.results[jobName][1]"
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
                          <template v-else-if="!job.cache_result && (logs[jobName] || currentStep === jobName)">
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
                        v-else-if="(!job.cache_result || !job.cache_result.results)
                          && (job.cache_blockchain && job.cache_blockchain.state === 2)"
                        class="row-count has-text-danger"
                      >
                        <span>Could not retrieve results</span>
                      </div>
                    </div>
                  </div>
                </template>
                <template v-if="job.cache_blockchain && job.cache_blockchain.state === 2">
                  <div class="row-count" />
                  <div>
                    <div class="row-count has-text-link">
                      <span>Finishing job</span>
                    </div>
                    <div>
                      <template v-if="job.cache_result && job.cache_result.results">
                        <div class="row-count">
                          <span>Uploaded results
                            <a v-if="job.resultIpfsHash" :href="'https://nosana.mypinata.cloud/ipfs/' + job.resultIpfsHash" target="_blank">{{ job.resultIpfsHash }}</a></span>
                        </div>
                      </template>
                      <div class="row-count">
                        <span>Job finished
                          {{ $moment(parseInt(job.cache_blockchain['timeEnd'],16)*1e3).fromNow() }}</span>
                      </div>
                      <div class="row-count">
                        <span>Duration:
                          {{ secondsToHms(job.cache_blockchain['timeStart'], job.cache_blockchain['timeEnd']) }}
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
                      'is-accent': job.status === 'COMPLETED',
                      'is-info': job.status === 'RUNNING',
                      'is-warning': job.status === 'QUEUED',
                      'is-danger': job.status === ('FAILED' || 'STOPPED')
                    }"
                  >
                    <b>JOB {{ job.status }}</b>
                  </span>
                </div>
                <label v-if="job.status === 'RUNNING'" class="checkbox ml-1 pt-5 is-flex">
                  <input v-model="disableAutoScroll" type="checkbox" class="mr-2">
                  Disable auto scroll
                </label>
              </div>
            </div>
            <div v-else-if="tab === 'payload'">
              <pre>{{ job.payload }}</pre>
            </div>
            <div
              v-else-if="tab === 'pipeline'"
            >
              <code-editor
                v-model="pipelineYml"
                :highlight-lines="[0]"
                :readonly="true"
                class="code-editor"
              />
            </div>
            <div v-else>
              Loading..
            </div>
          </div>
          <div v-if="!minimizeSideBar" class="column is-3">
            <div v-if="job.id" style="position: sticky; top: 20px;">
              <div class="box">
                <!-- minimize icon -->
                <div class="buttons">
                  <button
                    class="button is-small is-light"
                    @click="minimizeSideBar = true"
                  >
                    <i class="fas fa-angle-double-right" />
                  </button>
                </div>
                <hr>
                <div v-if="job.address && job.cache_blockchain" class="mb-4">
                  <i class="fas fa-coins mr-4 has-text-accent" />
                  Cost
                  <b class="has-text-accent">
                    {{ parseInt(
                      job.cache_blockchain.price ?
                        job.cache_blockchain.price : job.cache_blockchain.tokens, 16)/1e6
                    }}
                    NOS</b>
                </div>
                <div v-if="job.commit" class="has-overresult-ellipses">
                  <i class="fab fa-git mr-4 has-text-accent" />
                  Commit: <a
                    :href="job.payload.html_url || job.payload.url"
                    class="blockchain-address-inline"
                    target="_blank"
                    @click.stop
                  >{{ job.commit }}</a>
                </div>
                <span
                  v-if="job.payload"
                  class="blockchain-address-inline"
                  style="white-space: pre-wrap"
                >{{ job.payload.message }}</span>
                <div v-if="job.repository && job.commit" class="has-overresult-ellipses">
                  <i class="fab fa-git mr-4 has-text-accent" />
                  Pipeline: <a
                    :href="`https://github.com/${job.repository}/blob/${job.commit}/.nosana-ci.yml`"
                    class="blockchain-address-inline"
                    target="_blank"
                    @click.stop
                  >.nosana-ci.yml</a>
                </div>
                <hr v-if="job.address || job.cache_blockchain || displayInfo">
                <div v-if="job.address" class="mb-4">
                  <i class="fas fa-list mr-4 has-text-accent" />
                  Job: <a
                    target="_blank"
                    :href="$sol.explorer + '/address/' + job.address"
                    class="blockchain-address-inline"
                  >{{ job.address }}</a>
                </div>
                <div
                  v-if="job.address && job.cache_blockchain
                    && (job.cache_blockchain.state > 0 ||
                      job.cache_blockchain.jobStatus > 0 || job.cache_run_account)"
                  class="mb-4"
                >
                  <i class="fas fa-server mr-4 has-text-accent" />
                  Node: <a
                    target="_blank"
                    :href="$sol.explorer + '/address/'
                      + (job.cache_run_account ?
                        job.cache_run_account.account.node : job.cache_blockchain.node)"
                    class="blockchain-address-inline"
                  >{{ job.cache_run_account ?
                    job.cache_run_account.account.node : job.cache_blockchain.node }}</a>
                </div>
                <div v-if="displayInfo && displayInfo.market && user && user.roles === 'admin'" class="mb-4">
                  <i class="fas fa-globe mr-4 has-text-accent" />
                  Market: <a
                    target="_blank"
                    :href="$sol.explorer + '/address/' + displayInfo.market"
                    class="blockchain-address-inline"
                  >{{ displayInfo.market }}</a>
                </div>
                <div v-if="displayInfo && displayInfo.payer && user && user.roles === 'admin'" class="mb-4">
                  <i class="fas fa-user mr-4 has-text-accent" />
                  Payer: <a
                    target="_blank"
                    :href="$sol.explorer + '/address/' + displayInfo.payer"
                    class="blockchain-address-inline"
                  >{{ displayInfo.payer }}</a>
                </div>
                <div v-if="displayInfo && displayInfo.project && user && user.roles === 'admin'">
                  <i class="fas fa-project-diagram mr-4 has-text-accent" />
                  Project: <a
                    target="_blank"
                    :href="$sol.explorer + '/address/' + displayInfo.project"
                    class="blockchain-address-inline"
                  >{{ displayInfo.project }}</a>
                </div>
                <hr v-if="job.resultIpfsHash || job.jobIpfsHash">
                <div v-if="job.jobIpfsHash" class="mb-4">
                  <i class="fas fa-file mr-4 has-text-accent" />
                  Job IPFS: <a
                    target="_blank"
                    :href="'https://nosana.mypinata.cloud/ipfs/' + job.jobIpfsHash"
                    class="blockchain-address-inline"
                  >{{ job.jobIpfsHash }}</a>
                </div>
                <div v-if="job.resultIpfsHash">
                  <i class="fas fa-file mr-4 has-text-accent" />
                  Result IPFS: <a
                    target="_blank"
                    :href="'https://nosana.mypinata.cloud/ipfs/' + job.resultIpfsHash"
                    class="blockchain-address-inline"
                  >{{ job.resultIpfsHash }}</a>
                </div>
                <hr
                  v-if="user && ((user.roles && user.roles.includes('admin')) || user.user_id === job.user_id) &&
                    (job.status !== 'PENDING' && job.status !== 'QUEUED')"
                >
                <div class="buttons is-centered">
                  <button
                    v-if="user && ((user.roles && user.roles.includes('admin')) || user.user_id === job.user_id) &&
                      (job.status !== 'PENDING' && job.status !== 'NOT_POSTED' && job.status !== 'QUEUED')"
                    class="button is-accent is-outlined is-small is-fullwidth mt-2"
                    :class="{'is-loading': loading}"
                    @click="postJob(job.commit_id)"
                  >
                    Rerun job
                  </button>
                </div>
              </div>
            </div>

            <!-- Info from blockchain if it doesn't exists in database -->
            <div v-else-if="job.ipfsJob">
              <div class="box">
                <div v-if="$route.params.id" class="mb-4">
                  <i class="fas fa-list mr-4 has-text-accent" />
                  Smart Contract Job <a
                    target="_blank"
                    :href="$sol.explorer + '/address/' + $route.params.id"
                    class="blockchain-address-inline"
                  >{{ $route.params.id }}</a>
                </div>
                <div v-if="job.price" class="mb-4">
                  <i class="fas fa-coins mr-4 has-text-accent" />
                  Pipeline total cost
                  <b class="has-text-accent">
                    {{ parseInt(job.price, 16)/1e6
                    }}
                    NOS</b>
                </div>
                <div
                  class="mb-4"
                >
                  <i class="fas fa-server mr-4 has-text-accent" />
                  Node: <a
                    target="_blank"
                    :href="$sol.explorer + '/address/'
                      + job.node"
                    class="blockchain-address-inline"
                  >{{ job.node }}</a>
                </div>
                <div
                  class="mb-4"
                >
                  <i class="fas fa-shop mr-4 has-text-accent" />
                  Market: <a
                    target="_blank"
                    :href="$sol.explorer + '/address/' + job.market"
                    class="blockchain-address-inline"
                  >{{ job.market }}</a>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="column" :class="{ 'is-1': minimizeSideBar }">
            <div class="box">
              <!-- looking glass icon -->
              <div class="buttons is-centered px-1">
                <button
                  class="button is-small is-light"
                  @click="minimizeSideBar = false"
                >
                  <i class="fas fa-angle-double-left" />
                </button>
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
      job: null,
      result: null,
      step: null,
      loading: false,
      tab: 'result',
      user: null,
      refreshInterval: null,
      destroying: false,
      logInterval: null,
      clockInterval: null,
      nowSeconds: null,
      logs: {},
      currentStep: null,
      hideResults: {},
      displayInfo: null,
      autoScroll: true,
      disableAutoScroll: false,
      minimizeSideBar: false,
      lastScrollPosition: null,
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
      // job.job_content.pipeline
      if (this.job && this.job.job_content && this.job.job_content.pipeline) {
        return stringify(this.job.job_content.pipeline);
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
    this.destroying = true;
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
    this.getJob();
    this.updateClock();
    if (!this.clockInterval) {
      this.clockInterval = setInterval(this.updateClock, 1000);
    }
    if (this.$auth && this.$auth.loggedIn) {
      this.getUser();
    }
  },
  methods: {
    handleScroll (el) {
      const terminal = document.getElementById('terminal');
      terminal.addEventListener('scroll', () => {
        // check if terminal is at bottom
        if (terminal.scrollTop === terminal.scrollHeight - terminal.clientHeight) {
          this.disableAutoScroll = false;
        } else {
          this.disableAutoScroll = true;
        }
      },
      false
      );
    },
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
        const createdJobId = await this.$axios.$post(`/commits/${id}/job`, {
          jobUuid: this.job.status === ('NOT_POSTED' || 'PENDING') ? this.job.uuid : null
        });
        if (createdJobId) {
          this.$router.push(`/jobs/${createdJobId.uuid}`);
        }
        await this.getJob();
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
      this.$set(this.job, 'jobIpfsHash', hash);
      if (!this.job.job_content) {
        this.$set(this.job, 'job_content', await this.retrieveIpfsContent(hash));
      }
      if (this.job.job_content.pipeline) {
        this.$set(this.job.job_content, 'pipeline', parse(this.job.job_content.pipeline));
      } else if (this.job.job_content.jobs) {
        this.$set(this.job.job_content, 'pipeline', { jobs: this.job.job_content.jobs });
      } else if (this.job.job_content.ops) {
        this.$set(this.job.job_content, 'pipeline', { jobs: this.job.job_content.ops });
      }
    },
    getResult (ipfsResult) {
      // this.result = { 'nos-id': 'IJnYh-qz3uCPTQUk9bCiF', 'finished-at': 1645545696, results: { 'cmd-0': { exit: 0, out: 'audited 1581 packages in 9.248s\n\n124 packages are looking for funding\n  run `npm fund` for details\n\nfound 44 vulnerabilities (2 low, 29 moderate, 13 high)\n  run `npm audit fix` to fix them, or `npm audit` for details\n', err: '' }, 'cmd-1': { exit: 0, out: "yarn run v1.21.1\n$ set -ex; npm run pretty; eslint . --ext .js,.ts\n\n> @solana/web3.js@0.0.0-development pretty\n> prettier --check '{,{src,test}/**/}*.{j,t}s'\n\nChecking formatting...\nAll matched files use Prettier code style!\nDone in 12.01s.\n", err: '+ npm run pretty\n+ eslint . --ext .js,.ts\n' }, 'cmd-2': { exit: 0, out: "yarn run v1.21.1\n$ mocha -r ts-node/register './test/**/*.test.ts'\n\n\n  Account\n    ✓ generate new account\n    ✓ account from secret key\n\n  AgentManager\n    ✓ works (5005ms)\n\n  Cluster Util\n    ✓ invalid\n    ✓ devnet\n\n  Connection\n    ✓ should pass HTTP headers to RPC\n    ✓ should allow middleware to augment request\n    ✓ should attribute middleware fatals to the middleware\n    ✓ should not attribute fetch errors to the middleware\n    ✓ get account info - not found\n    ✓ get multiple accounts info\n    ✓ get program accounts (140ms)\n    ✓ get balance\n    ✓ get inflation\n    ✓ get inflation reward\n    ✓ get epoch info\n    ✓ get epoch schedule\n    ✓ get leader schedule\n    ✓ get slot\n    ✓ get slot leader\n    ✓ get slot leaders\n    ✓ get cluster nodes\n    ✓ confirm transaction - error\n    ✓ get transaction count\n    ✓ get total supply\n    ✓ get minimum balance for rent exemption\n    ✓ get confirmed signatures for address\n    ✓ get signatures for address\n    ✓ get parsed confirmed transactions\n    ✓ get transaction\n    ✓ get confirmed transaction\n    ✓ get parsed confirmed transaction coerces public keys of inner instructions\n    ✓ get block\n    ✓ get confirmed block\n    ✓ get blocks between two slots\n    ✓ get blocks from starting slot\n    ✓ get block signatures\n    ✓ get recent blockhash\n    ✓ get latest blockhash\n    ✓ get fee calculator\n    ✓ get fee for message\n    ✓ get block time\n    ✓ get minimum ledger slot\n    ✓ get first available block\n    ✓ get supply\n    ✓ get supply without accounts\n    ✓ get performance samples\n    ✓ get performance samples limit too high\n    ✓ get largest accounts (82ms)\n    ✓ stake activation should throw when called for not delegated account\n    ✓ stake activation should only accept state with valid string literals\n    ✓ getVersion\n    ✓ getGenesisHash\n    ✓ request airdrop\n    ✓ transaction failure (123ms)\n\n  EpochSchedule\n    ✓ slot methods work\n\n  Keypair\n    ✓ new keypair\n    ✓ generate new keypair\n    ✓ create keypair from secret key\n    ✓ creating keypair from invalid secret key throws error\n    ✓ creating keypair from invalid secret key succeeds if validation is skipped\n    ✓ generate keypair from random seed\n\n  Nonce\n    ✓ create and query nonce account (83ms)\n    ✓ create and query nonce account with seed (51ms)\n\n  PublicKey\n    ✓ invalid\n    ✓ equals\n    ✓ toBase58\n    ✓ toJSON\n    ✓ toBuffer\n    ✓ equals (II)\n    ✓ createWithSeed\n    ✓ createProgramAddress\n    ✓ findProgramAddress\n    ✓ isOnCurve\n    ✓ canBeSerializedWithBorsh\n    ✓ canBeDeserializedUncheckedWithBorsh\n\n  shortvec\n    ✓ decodeLength\n    ✓ encodeLength\n\n  StakeProgram\n    ✓ createAccountWithSeed\n    ✓ createAccount\n    ✓ delegate\n    ✓ authorize\n    ✓ authorize with custodian\n    ✓ authorizeWithSeed\n    ✓ authorizeWithSeed with custodian\n    ✓ split\n    ✓ splitWithSeed\n    ✓ merge\n    ✓ withdraw\n    ✓ withdraw with custodian\n    ✓ deactivate\n    ✓ StakeInstructions\n\n  SystemProgram\n    ✓ createAccount\n    ✓ transfer\n    ✓ transferWithSeed\n    ✓ allocate\n    ✓ allocateWithSeed\n    ✓ assign\n    ✓ assignWithSeed\n    ✓ createAccountWithSeed\n    ✓ createNonceAccount\n    ✓ createNonceAccount with seed\n    ✓ nonceAdvance\n    ✓ nonceWithdraw\n    ✓ nonceAuthorize\n    ✓ non-SystemInstruction error\n\n  Transaction Payer\n    ✓ transaction-payer (97ms)\n\n  Transaction\n    ✓ partialSign (130ms)\n    ✓ transfer signatures (57ms)\n    ✓ dedup signatures\n    ✓ use nonce (62ms)\n    ✓ parse wire format and serialize (61ms)\n    ✓ populate transaction\n    ✓ serialize unsigned transaction\n    ✓ deprecated - externally signed stake delegate\n    ✓ externally signed stake delegate\n    ✓ can serialize, deserialize, and reserialize with a partial signer (85ms)\n    compileMessage\n      ✓ accountKeys are ordered (40ms)\n      ✓ payer is first account meta (61ms)\n      ✓ validation\n      ✓ payer is writable (67ms)\n    dedupe\n      ✓ setSigners\n      ✓ sign\n\n  ValidatorInfo\n    ✓ from config account data\n\n  VoteProgram\n    ✓ createAccount\n    ✓ initialize\n    ✓ authorize\n    ✓ withdraw\n\n\n  128 passing (7s)\n\nDone in 14.26s.\n", err: 'Transaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nNo instructions provided\nNo instructions provided\nNo instructions provided\nNo instructions provided\n' } } }
      const hash = this.solHashToIpfsHash(ipfsResult);
      this.$set(this.job, 'resultIpfsHash', hash);
      // result is now being retrieved in backend
      // this.result = await this.retrieveIpfsContent(hash)
    },
    async getLogs (node) {
      if (this.currentStep) {
        try {
          const response =
          await fetch(`${node}/nosana/logs/${this.job.address}/${this.currentStep}`);
          if (response.status !== 200) {
            throw new Error('Log error status ' + response.status);
          }
          this.logs[this.currentStep] = await response.text();
          const lastCharacter = this.logs[this.currentStep].slice(-1);
          this.logs[this.currentStep] = convert.toHtml(this.logs[this.currentStep].replace(String.fromCharCode(26), ''));
          if (this.autoScroll && !this.disableAutoScroll) {
            this.$nextTick(() => {
              if (document) {
                const terminal = document.getElementById('terminal');
                if (terminal) {
                  terminal.scrollTop = terminal.scrollHeight;
                }
              }
            });
          }
          // Check EOF character
          if (lastCharacter.charCodeAt(0) === 26) {
            if (this.job.job_content.pipeline.jobs) {
              const i = this.job.job_content.pipeline.jobs.findIndex(item => item.name === this.currentStep ||
              item.id === this.currentStep) + 1;
              if (i < this.job.job_content.pipeline.jobs.length) {
                this.currentStep = this.job.job_content.pipeline.jobs[i].name ||
                this.job.job_content.pipeline.jobs[i].id;
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
    async getJob () {
      if (this.destroying) { return; }
      const id = this.$route.params.id;
      try {
        const job = await this.$axios.$get(`/jobs/${id}`);
        if (job.cache_result) {
          for (const key in job.cache_result.results) {
            const results = job.cache_result.results[key];
            if (Array.isArray(results)) {
              if (results[1]) {
                if (Array.isArray(results[1])) {
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
            }
          }
        }
        this.job = job;
        if (this.job.status === 'RUNNING') {
          if (!this.logInterval && this.job.cache_run_account) {
            const node = nodes[this.job.cache_run_account.account.node];
            const network = process.env.NUXT_ENV_SOL_NETWORK_NAME;
            if (node && node[network] && node[network].endpoint && node[network].logs && this.job.payload) {
              this.currentStep = 'checkout';
              // Refresh logs every second
              this.getLogs(node[network].endpoint);
              if (!this.destroying) {
                this.logInterval = setInterval(() => { this.getLogs(node[network].endpoint); }, parseInt(1000, 10));
              }
            }
          }
        } else if (this.logInterval) {
          clearInterval(this.logInterval);
          this.logInterval = null;
        }
        if (this.job.status === 'RUNNING' || this.job.status === 'QUEUED' || this.job.status === 'PENDING') {
          if (!this.refreshInterval && !this.destroying) {
            // Refresh status every 10 seconds
            this.refreshInterval = setInterval(this.getJob, parseInt(10000, 10));
          }
        } else if (this.refreshInterval) {
          clearInterval(this.refreshInterval);
          this.refreshInterval = null;
        }
        if (this.job.cache_blockchain) {
          // posted to blockchain, retrieve job
          this.getJobInfo(this.job.cache_blockchain.ipfsJob);
          if (job.cache_blockchain.state === 2 || job.cache_blockchain.jobStatus === 2) {
            // completed, retrieve results
            this.getResult(this.job.cache_blockchain.ipfsResult);
          }
          this.displayInfo = Object.assign({}, this.job.cache_blockchain);
          if (this.job.cache_run_account) {
            this.displayInfo.node = this.job.cache_run_account.account.node;
            this.displayInfo.market = this.job.cache_run_account.account.market;
          }
          delete this.displayInfo.ipfsJob;
          delete this.displayInfo.ipfsResult;
        }

        if (this.job.ipfsJob) {
          await this.getJobInfo(this.job.ipfsJob);
          if (this.job.ipfsResult && this.job.state === 2) {
            // completed, retrieve results
            this.getResult(this.job.ipfsResult);
          }
          this.displayInfo = Object.assign({}, this.job);
        }
        this.job = job;
        if (this.autoScroll && !this.disableAutoScroll) {
          this.$nextTick(() => {
            if (document) {
              const terminal = document.getElementById('terminal');
              if (terminal) {
                terminal.scrollTop = terminal.scrollHeight;
              }
            }
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
  max-height: calc(100vh - 350px);
  overflow-y: auto;
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
