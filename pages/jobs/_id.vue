<template>
  <div class="container mt-5">
    <div v-if="loadingJob">
      <p class="loading-dots">
        Loading job
      </p>
    </div>
    <div v-if="job">
      <div class="is-flex is-align-items-center">
        <div v-if="job.repository_id" class="mr-4">
          <a
            class="has-text-accent has-text-weight-semibold"
            @click.prevent="goBack"
          >
            <i class="fas fa-chevron-left" /> Back
          </a>
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
      <hr class="my-5">
      <h1 class="title">
        <span v-if="job.payload && job.payload.message">{{ job.payload.message.split('\n')[0] }}</span>
        <span v-if="job.payload && job.payload.title">{{ job.payload.title }}</span>
        <span v-else-if="!job.payload">External Job</span>
      </h1>
      <div class="columns">
        <div class="column" :class="{ 'is-9': !minimizeSideBar, 'is-11 sidebar-is-minimized pl-0': minimizeSideBar}">
          <div
            v-if="!showLogsOfStep"
            :class="{ 'px-2': minimizeSideBar}"
            class="box is-flex is-flex-wrap-nowrap px-5"
            style="background-color: #F7F9F6; border: none; height: 100%; overflow-x: auto;"
          >
            <div class="step-columns is-flex">
              <div
                v-for="(jobStep, index) in job.job_content.pipeline.jobs"
                :key="index"
                class="step-column px-5"
              >
                <div class="mb-5 mt-5 has-text-weight-medium">
                  <label>
                    {{ jobStep.id }}
                  </label>
                </div>
                <div class="step-items">
                  <div
                    class="step-item has-background-white"
                    :class="{'disabled-step': !jobStep.step_status}"
                    @click="jobStep.step_status ? showLogs(jobStep.id) : null"
                  >
                    <div class="is-flex is-align-items-center">
                      <img
                        v-if="jobStep.step_status && jobStep.step_status === 'success'"
                        :src="require('@/assets/img/icons/done.svg')"
                        class="mr-2"
                      >
                      <img
                        v-else-if="jobStep.step_status && jobStep.step_status === 'failed'"
                        :src="require('@/assets/img/icons/failed.svg')"
                        class="mr-2"
                      >
                      <img
                        v-else-if="jobStep.step_status && jobStep.step_status === 'running'"
                        :src="require('@/assets/img/icons/running.svg')"
                        class="mr-2"
                      >
                      <img
                        v-else
                        :src="require('@/assets/img/icons/pending.svg')"
                        class="mr-2"
                      >
                      <span style="display: inline-block;">{{ jobStep.id }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="showLogsOfStep"
            id="terminal"
            class="box px-5 content-block has-background-black terminal"
            @scroll.prevent="handleScroll"
          >
            <div v-if="showLogsOfStep === 'checkout'">
              <div class="row-count has-text-link">
                <span>Posting job to the blockchain</span>
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
                    Job has been posted to the {{ job.market }} for the price of
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
                    <span>Job has not been posted to the blockchain.</span>
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
                          or wait for a cron job to pick it up
                        </span>
                      </template>
                    </span>
                  </div>
                  <div v-if="job.status === 'PENDING'" class="row-count">
                    <span class="loading-text-white">Posting to the blockchain</span>
                  </div>
                </template>
                <div v-else class="row-count">
                  <span class="loading-text-white">Posting to the blockchain</span>
                </div>
              </div>
              <template v-if="job.cache_blockchain">
                <div class="row-count" />
                <div>
                  <div class="row-count has-text-link">
                    <span>Finding a node to run the job</span>
                  </div>
                  <div>
                    <div v-if="job.cache_blockchain.state > 0 || job.cache_run_account" class="row-count">
                      <span>Job has been claimed by a node <a
                        target="_blank"
                        :href="$sol.explorer + '/address/' +
                          (job.cache_run_account ?
                            job.cache_run_account.account.node : job.cache_blockchain.node)"
                        class="blockchain-address-inline"
                      >{{ job.cache_run_account ?
                        job.cache_run_account.account.node : job.cache_blockchain.node }}</a></span>
                    </div>
                    <div v-else class="row-count loading-text-white">
                      <span>Waiting for a node to claim the job</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
            <template
              v-if="job.cache_blockchain &&
                (job.cache_blockchain.state > 0 || job.cache_run_account)"
            >
              <div>
                <div>
                  <template
                    v-if="job.job_content.pipeline && job.job_content.pipeline.jobs"
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
                          && job.cache_result.results[jobName]) && jobName === showLogsOfStep"
                      >
                        <div
                          v-if="typeof job.cache_result.results[jobName][1] === 'string'
                            && (!job.cache_result.results[jobName][2]
                              || (Array.isArray(job.cache_result.results[jobName][2])
                                && job.cache_result.results[jobName][2].length === 0))"
                          class="has-text-danger row-count"
                        >
                          <span>{{ job.cache_result.results[jobName][1] }}</span>
                        </div>
                        <div
                          v-for="(step, index)
                            in ((job.cache_result.results[jobName][2]
                              && Array.isArray(job.cache_result.results[jobName][2]))
                              ? job.cache_result.results[jobName][2][1] : job.cache_result.results[jobName][1])"
                          v-else
                          :key="index"
                        >
                          <span
                            v-if="typeof job.cache_result.results[jobName][1] === 'string'
                              && job.cache_result.results[jobName][2] && index === 0"
                            class="has-text-danger row-count"
                          >
                            {{ job.cache_result.results[jobName][1] }}</span>
                          <div
                            v-if="step.cmd && false"
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
                        <div
                          v-if="job.cache_result.results[jobName][0] === 'success' ||
                            job.cache_result.results[jobName][0] === ('nos/error' || 'nos/cmd-err')"
                          class="row-count"
                        >
                          <span
                            class="tag is-small"
                            :class="{
                              'is-accent': job.cache_result.results[jobName][0] === 'success',
                              'is-danger': job.cache_result.results[jobName][0] === ('nos/error' || 'nos/cmd-err'),
                            }"
                          >
                            <b>STEP <span v-if="job.cache_result.results[jobName][0] === 'success'">
                              COMPLETED
                            </span><span v-else>
                              FAILED
                            </span></b>
                          </span>
                        </div>
                      </template>
                      <template v-else-if="!job.cache_result && (logs[jobName] || currentStep === jobName)">
                        <div
                          v-if="currentStep === jobName && jobName === showLogsOfStep"
                          class="row-count has-text-link"
                        >
                          <span
                            class="loading-text-link"
                          >- Executing step '{{ jobName }}'</span>
                        </div>
                        <template v-if="logs[jobName] && jobName === showLogsOfStep">
                          <div class="row-count">
                            <span class="pre" v-html="logs[jobName].slice(0, 10000)" />
                          </div>
                          <!-- Show step status for running logs-->
                          <div
                            v-if="
                              job.job_content.pipeline &&
                                job.job_content.pipeline.jobs &&
                                job.job_content.pipeline.jobs.find(item => item.name === jobName
                                  || item.id === jobName).step_status
                                && job.job_content.pipeline.jobs.find(item => item.name === jobName
                                  || item.id === jobName).step_status === ('success' || 'failed')
                            "
                            class="row-count"
                          >
                            <span
                              class="tag is-small"
                              :class="{
                                'is-accent': job.job_content.pipeline.jobs.find(item => item.name === jobName
                                  || item.id === jobName).step_status === 'success',
                                'is-danger': job.job_content.pipeline.jobs.find(item => item.name === jobName
                                  || item.id === jobName).step_status === ('nos/error' || 'nos/cmd-err'),
                              }"
                            >
                              <b>STEP <span
                                v-if="job.job_content.pipeline.jobs.find(item => item.name === jobName
                                  || item.id === jobName).step_status === 'success'"
                              >
                                COMPLETED
                              </span><span v-else>
                                FAILED
                              </span></b>
                            </span>
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
                    <span>Could not retrieve the results</span>
                  </div>
                </div>
              </div>
            </template>
            <div v-else>
              Loading...
            </div>
          </div>
        </div>
        <div class="column sidebar" :class="{ 'is-3': !minimizeSideBar, 'sidebar-minimized ': minimizeSideBar}">
          <div v-if="job.id" style="position: sticky; top: 20px; height: 100%">
            <div
              class="box pb-2"
              style="border: none;"
            >
              <div
                v-if="job.address && job.cache_blockchain"
                class="is-flex is-align-items-flex-start my-3"
                :class="{ 'is-justify-content-center is-align-items-center has-tooltip-left': minimizeSideBar}"
                :data-tooltip="'Cost \n' + `${parseInt(
                  job.cache_blockchain.price ?
                    job.cache_blockchain.price : job.cache_blockchain.tokens, 16)/1e6}` + ' NOS'"
              >
                <img
                  :class="{ 'mr-2': !minimizeSideBar}"
                  :src="require('@/assets/img/icons/sidebar/cost.svg')"
                  style="width: 19px;"
                >
                <div :class="{ 'minimized': minimizeSideBar}" class="pr-4" style="max-width: 100%; margin-top: -4px;">
                  <span class="is-size-6">Cost</span>
                  <br>
                  <span
                    class="has-text-accent blockchain-address-inline has-text-weight-semibold"
                    style="display: block; margin-top: -4px;"
                  >
                    {{ parseInt(
                      job.cache_blockchain.price ?
                        job.cache_blockchain.price : job.cache_blockchain.tokens, 16)/1e6
                    }}
                    NOS</span>
                </div>
              </div>
              <div
                v-if="job.cache_blockchain && job.cache_blockchain.state === 2"
                class="is-flex is-align-items-flex-start my-3"
                :class="{ 'is-justify-content-center is-align-items-center has-tooltip-left': minimizeSideBar}"
                :data-tooltip="'Duration \n' +
                  `${secondsToHms(job.cache_blockchain['timeStart'], job.cache_blockchain['timeEnd'])}`"
              >
                <img
                  :class="{ 'mr-2': !minimizeSideBar}"
                  :src="require('@/assets/img/icons/sidebar/time.svg')"
                  style="width: 19px;"
                >
                <div :class="{ 'minimized': minimizeSideBar}" class="pr-4" style="max-width: 100%; margin-top: -4px;">
                  <span class="is-size-6">Duration</span>
                  <br>
                  <span
                    class="has-text-accent blockchain-address-inline has-text-weight-semibold"
                    style="display: block; margin-top: -4px;"
                  >
                    {{ secondsToHms(job.cache_blockchain['timeStart'], job.cache_blockchain['timeEnd']) }}
                  </span>
                </div>
              </div>
              <div
                v-if="job.commit"
                class="has-overflow-ellipses is-flex is-align-items-flex-start mb-3"
                :class="{ 'is-justify-content-center is-align-items-center has-tooltip-left': minimizeSideBar}"
                :data-tooltip="'Commit \n' + `${job.commit.substring(0, 10) + '...'}`"
              >
                <img
                  :class="{ 'mr-2': !minimizeSideBar}"
                  :src="require('@/assets/img/icons/sidebar/github.svg')"
                  style="width: 19px;"
                >
                <div :class="{ 'minimized': minimizeSideBar}" class="pr-4" style="max-width: 100%; margin-top: -4px;">
                  <span class="is-size-6 ">Commit</span><a
                    :href="job.payload.html_url || job.payload.url"
                    class="blockchain-address-inline"
                    target="_blank"
                    @click.stop
                  >{{ job.commit }}</a>
                </div>
              </div>
              <div
                v-if="job.repository && job.commit"
                class="has-overflow-ellipses is-flex is-align-items-flex-start"
                :class="{ 'is-justify-content-center is-align-items-center has-tooltip-left': minimizeSideBar}"
                :data-tooltip="'Pipeline \n' + `${job.address.substring(0, 10) + '...'}`"
              >
                <img
                  :class="{ 'mr-2': !minimizeSideBar}"
                  :src="require('@/assets/img/icons/sidebar/github.svg')"
                  style="width: 19px;"
                >
                <div :class="{ 'minimized': minimizeSideBar}" class="pr-4" style="max-width: 100%; margin-top: -4px;">
                  <span class="is-size-6 ">Pipeline</span><a
                    :href="`https://github.com/${job.repository}/blob/${job.commit}/.nosana-ci.yml`"
                    class="blockchain-address-inline"
                    target="_blank"
                    @click.stop
                  >.nosana-ci.yml</a>
                </div>
              </div>
              <hr v-if="job.address || job.cache_blockchain || displayInfo">
              <div
                v-if="job.address"
                class="mb-3 is-flex is-align-items-flex-start"
                :class="{ 'is-justify-content-center is-align-items-center has-tooltip-left': minimizeSideBar}"
                :data-tooltip="'Job address \n' + `${job.address.substring(0, 10) + '...'}`"
              >
                <img
                  :class="{ 'mr-2': !minimizeSideBar}"
                  :src="require('@/assets/img/icons/sidebar/job.svg')"
                  style="width: 19px;"
                >
                <div :class="{ 'minimized': minimizeSideBar}" class="pr-4" style="max-width: 100%; margin-top: -4px;">
                  <span class="is-size-6 ">Job</span> <a
                    target="_blank"
                    :href="$sol.explorer + '/address/' + job.address"
                    class="blockchain-address-inline"
                  >{{ job.address }}</a>
                </div>
              </div>
              <div
                v-if="job.address && job.cache_blockchain
                  && (job.cache_blockchain.state > 0 ||
                    job.cache_blockchain.jobStatus > 0 || job.cache_run_account)"
                class="mb-3 is-flex is-align-items-flex-start"
                :class="{ 'is-justify-content-center is-align-items-center has-tooltip-left'
                  : minimizeSideBar}"
                :data-tooltip="'Node \n' + `${job.cache_run_account ?
                  job.cache_run_account.account.node.substring(0, 10) + '...' :
                  job.cache_blockchain.node.substring(0, 10) + '...'
                }`"
              >
                <img
                  :class="{ 'mr-2': !minimizeSideBar}"
                  :src="require('@/assets/img/icons/sidebar/node.svg')"
                  style="width: 19px;"
                >
                <div :class="{ 'minimized': minimizeSideBar}" class="pr-4" style="max-width: 100%; margin-top: -4px;">
                  <span class="is-size-6 ">Node</span> <a
                    target="_blank"
                    :href="$sol.explorer + '/address/'
                      + (job.cache_run_account ?
                        job.cache_run_account.account.node : job.cache_blockchain.node)"
                    class="blockchain-address-inline"
                  >{{ job.cache_run_account ?
                    job.cache_run_account.account.node : job.cache_blockchain.node }}</a>
                </div>
              </div>
              <hr v-if="job.resultIpfsHash || job.jobIpfsHash">
              <div
                v-if="job.jobIpfsHash"
                class="mb-3 is-flex is-align-items-flex-start"
                :class="{ 'is-justify-content-center is-align-items-center has-tooltip-left': minimizeSideBar}"
                :data-tooltip="'Job IPFS \n' + `${job.jobIpfsHash.substring(0, 10) + '...'}`"
              >
                <img
                  :class="{ 'mr-2': !minimizeSideBar}"
                  :src="require('@/assets/img/icons/sidebar/ipfs.svg')"
                  style="width: 19px;"
                >
                <div
                  :class="{ 'minimized is-flex': minimizeSideBar}"
                  class="pr-4"
                  style="max-width: 100%; margin-top: -4px;"
                >
                  <span class="is-size-6 ">Job IPFS</span> <a
                    target="_blank"
                    :href="'https://nosana.mypinata.cloud/ipfs/' + job.jobIpfsHash"
                    class="blockchain-address-inline"
                  >{{ job.jobIpfsHash }}</a>
                </div>
              </div>
              <div
                v-if="job.resultIpfsHash"
                class="is-flex is-align-items-flex-start"
                :class="{ 'is-justify-content-center is-align-items-center has-tooltip-left': minimizeSideBar}"
                :data-tooltip="'Result IPFS \n' + `${job.jobIpfsHash.substring(0, 10) + '...'}`"
              >
                <img
                  :class="{ 'mr-2': !minimizeSideBar}"
                  :src="require('@/assets/img/icons/sidebar/ipfs.svg')"
                  style="width: 19px;"
                >
                <div
                  :class="{ 'minimized is-flex': minimizeSideBar}"
                  class="pr-4"
                  style="max-width: 100%; margin-top: -4px;"
                >
                  <span class="is-size-6 has-overflow-ellipses" style="display: block;">Result IPFS</span> <a
                    target="_blank"
                    :href="'https://nosana.mypinata.cloud/ipfs/' + job.resultIpfsHash"
                    class="blockchain-address-inline"
                  >{{ job.resultIpfsHash }}</a>
                </div>
              </div>
              <hr class="mb-2">
              <!-- minimize icon -->
              <div
                class="buttons collapse-button is-flex is-justify-content-flex-end is-hidden-touch"
                :class="{ 'is-justify-content-center': minimizeSideBar}"
              >
                <button
                  class="button is-small pr-1"
                  style="background-color: transparent !important; border: none !important; outline: none;"
                  @click="minimizeSideBar = !minimizeSideBar"
                >
                  <span v-if="!minimizeSideBar">Collapse Sidebar</span>
                  <i v-if="!minimizeSideBar" class="pl-1 fas fa-angle-double-right" />
                  <i v-else class="pl-1 fas fa-angle-double-left" />
                </button>
              </div>
            </div>
            <div v-if="!minimizeSideBar" class="buttons is-centered">
              <button
                v-if="user && ((user.roles && user.roles.includes('admin')) || user.user_id === job.user_id) &&
                  (job.status !== 'PENDING' && job.status !== 'NOT_POSTED' && job.status !== 'QUEUED')"
                class="button is-accent is-outlined is-small is-fullwidth mt-2"
                :class="{'is-loading': loading}"
                @click="postJob(job.commit_id)"
              >
                Rerun the job
              </button>
            </div>
          </div>

          <!-- Info from the blockchain if it doesn't exist in the database -->
          <div v-else-if="job.ipfsJob">
            <div class="box">
              <div v-if="$route.params.id" class="is-flex is-align-items-flex-start mb-3">
                <img :src="require('@/assets/img/icons/sidebar/job.svg')" class="mr-2" style="width: 19px;">
                <div class="pr-4" style="max-width: 100%; margin-top: -4px;">
                  <span class="is-size-6">Smart contract job</span> <a
                    target="_blank"
                    :href="$sol.explorer + '/address/' + $route.params.id"
                    class="blockchain-address-inline"
                  >{{ $route.params.id }}</a>
                </div>
              </div>
              <div v-if="job.price" class="mb-3 is-flex is-align-items-flex-start">
                <img :src="require('@/assets/img/icons/sidebar/cost.svg')" class="mr-2" style="width: 19px;">
                <div class="pr-4" style="max-width: 100%; margin-top: -4px;">
                  <span class="is-size-6">Pipeline total cost</span>
                  <b class="has-text-accent">
                    {{ parseInt(job.price, 16)/1e6
                    }}
                    NOS</b>
                </div>
              </div>
              <div
                class="mb-3 is-flex is-align-items-flex-start"
              >
                <img :src="require('@/assets/img/icons/sidebar/ipfs.svg')" class="mr-2" style="width: 19px;">
                <div class="pr-4" style="max-width: 100%; margin-top: -4px;">
                  <span class="is-size-6">Node</span> <a
                    target="_blank"
                    :href="$sol.explorer + '/address/'
                      + job.node"
                    class="blockchain-address-inline"
                  >{{ job.node }}</a>
                </div>
              </div>
              <div
                class="mb-4"
              >
                <i class="fas fa-shop mr-4 has-text-accent" />
                <div class="pr-4" style="max-width: 100%; margin-top: -4px;">
                  <span class="is-size-6">Market</span> <a
                    target="_blank"
                    :href="$sol.explorer + '/address/' + job.market"
                    class="blockchain-address-inline"
                  >{{ job.market }}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import bs58 from 'bs58';
import { parse } from 'yaml';
import AnsiUp from 'ansi_up';
const ansi = new AnsiUp();
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
      loadingJob: false,
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
      showLogsOfStep: null,
      stateMap: [
        'Queued',
        'Running',
        'Done',
        'Stopped'
      ],
      logSignature: null
    };
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
    goBack () {
      this.$router.push(
        !this.showLogsOfStep ? `/repositories/${this.job.repository_id}` : `/jobs/${this.$route.params.id}`);
      this.showLogsOfStep = null;
    },
    handleScroll (el) {
      const terminal = el.target;
      if (terminal.scrollTop + 5 >= terminal.scrollHeight - terminal.clientHeight) {
        this.disableAutoScroll = false;
      } else {
        this.disableAutoScroll = true;
      }
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

      if (this.$route.query.step && this.job.job_content.pipeline.jobs &&
        this.job.job_content.pipeline.jobs.find(e => e.id === this.$route.query.step && e.step_status)) {
        this.showLogsOfStep = this.$route.query.step;
      }

      if (this.job.cache_result) {
        for (const key in this.job.cache_result.results) {
          const results = this.job.cache_result.results[key];
          this.job.job_content.pipeline.jobs = this.job.job_content.pipeline.jobs.map((e) => {
            if (e.id === key) {
              e.step_status = results[0] === 'success' ? 'success' : 'failed';
            }
            return e;
          });
        }
      }
    },
    getResult (ipfsResult) {
      // this.result = { 'nos-id': 'IJnYh-qz3uCPTQUk9bCiF', 'finished-at': 1645545696, results: { 'cmd-0': { exit: 0, out: 'audited 1581 packages in 9.248s\n\n124 packages are looking for funding\n  run `npm fund` for details\n\nfound 44 vulnerabilities (2 low, 29 moderate, 13 high)\n  run `npm audit fix` to fix them, or `npm audit` for details\n', err: '' }, 'cmd-1': { exit: 0, out: "yarn run v1.21.1\n$ set -ex; npm run pretty; eslint . --ext .js,.ts\n\n> @solana/web3.js@0.0.0-development pretty\n> prettier --check '{,{src,test}/**/}*.{j,t}s'\n\nChecking formatting...\nAll matched files use Prettier code style!\nDone in 12.01s.\n", err: '+ npm run pretty\n+ eslint . --ext .js,.ts\n' }, 'cmd-2': { exit: 0, out: "yarn run v1.21.1\n$ mocha -r ts-node/register './test/**/*.test.ts'\n\n\n  Account\n    ✓ generate new account\n    ✓ account from secret key\n\n  AgentManager\n    ✓ works (5005ms)\n\n  Cluster Util\n    ✓ invalid\n    ✓ devnet\n\n  Connection\n    ✓ should pass HTTP headers to RPC\n    ✓ should allow middleware to augment request\n    ✓ should attribute middleware fatals to the middleware\n    ✓ should not attribute fetch errors to the middleware\n    ✓ get account info - not found\n    ✓ get multiple accounts info\n    ✓ get program accounts (140ms)\n    ✓ get balance\n    ✓ get inflation\n    ✓ get inflation reward\n    ✓ get epoch info\n    ✓ get epoch schedule\n    ✓ get leader schedule\n    ✓ get slot\n    ✓ get slot leader\n    ✓ get slot leaders\n    ✓ get cluster nodes\n    ✓ confirm transaction - error\n    ✓ get transaction count\n    ✓ get total supply\n    ✓ get minimum balance for rent exemption\n    ✓ get confirmed signatures for address\n    ✓ get signatures for address\n    ✓ get parsed confirmed transactions\n    ✓ get transaction\n    ✓ get confirmed transaction\n    ✓ get parsed confirmed transaction coerces public keys of inner instructions\n    ✓ get block\n    ✓ get confirmed block\n    ✓ get blocks between two slots\n    ✓ get blocks from starting slot\n    ✓ get block signatures\n    ✓ get recent blockhash\n    ✓ get latest blockhash\n    ✓ get fee calculator\n    ✓ get fee for message\n    ✓ get block time\n    ✓ get minimum ledger slot\n    ✓ get first available block\n    ✓ get supply\n    ✓ get supply without accounts\n    ✓ get performance samples\n    ✓ get performance samples limit too high\n    ✓ get largest accounts (82ms)\n    ✓ stake activation should throw when called for not delegated account\n    ✓ stake activation should only accept state with valid string literals\n    ✓ getVersion\n    ✓ getGenesisHash\n    ✓ request airdrop\n    ✓ transaction failure (123ms)\n\n  EpochSchedule\n    ✓ slot methods work\n\n  Keypair\n    ✓ new keypair\n    ✓ generate new keypair\n    ✓ create keypair from secret key\n    ✓ creating keypair from invalid secret key throws error\n    ✓ creating keypair from invalid secret key succeeds if validation is skipped\n    ✓ generate keypair from random seed\n\n  Nonce\n    ✓ create and query nonce account (83ms)\n    ✓ create and query nonce account with seed (51ms)\n\n  PublicKey\n    ✓ invalid\n    ✓ equals\n    ✓ toBase58\n    ✓ toJSON\n    ✓ toBuffer\n    ✓ equals (II)\n    ✓ createWithSeed\n    ✓ createProgramAddress\n    ✓ findProgramAddress\n    ✓ isOnCurve\n    ✓ canBeSerializedWithBorsh\n    ✓ canBeDeserializedUncheckedWithBorsh\n\n  shortvec\n    ✓ decodeLength\n    ✓ encodeLength\n\n  StakeProgram\n    ✓ createAccountWithSeed\n    ✓ createAccount\n    ✓ delegate\n    ✓ authorize\n    ✓ authorize with custodian\n    ✓ authorizeWithSeed\n    ✓ authorizeWithSeed with custodian\n    ✓ split\n    ✓ splitWithSeed\n    ✓ merge\n    ✓ withdraw\n    ✓ withdraw with custodian\n    ✓ deactivate\n    ✓ StakeInstructions\n\n  SystemProgram\n    ✓ createAccount\n    ✓ transfer\n    ✓ transferWithSeed\n    ✓ allocate\n    ✓ allocateWithSeed\n    ✓ assign\n    ✓ assignWithSeed\n    ✓ createAccountWithSeed\n    ✓ createNonceAccount\n    ✓ createNonceAccount with seed\n    ✓ nonceAdvance\n    ✓ nonceWithdraw\n    ✓ nonceAuthorize\n    ✓ non-SystemInstruction error\n\n  Transaction Payer\n    ✓ transaction-payer (97ms)\n\n  Transaction\n    ✓ partialSign (130ms)\n    ✓ transfer signatures (57ms)\n    ✓ dedup signatures\n    ✓ use nonce (62ms)\n    ✓ parse wire format and serialize (61ms)\n    ✓ populate transaction\n    ✓ serialize unsigned transaction\n    ✓ deprecated - externally signed stake delegate\n    ✓ externally signed stake delegate\n    ✓ can serialize, deserialize, and reserialize with a partial signer (85ms)\n    compileMessage\n      ✓ accountKeys are ordered (40ms)\n      ✓ payer is first account meta (61ms)\n      ✓ validation\n      ✓ payer is writable (67ms)\n    dedupe\n      ✓ setSigners\n      ✓ sign\n\n  ValidatorInfo\n    ✓ from config account data\n\n  VoteProgram\n    ✓ createAccount\n    ✓ initialize\n    ✓ authorize\n    ✓ withdraw\n\n\n  128 passing (7s)\n\nDone in 14.26s.\n", err: 'Transaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nTransaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.\nNo instructions provided\nNo instructions provided\nNo instructions provided\nNo instructions provided\n' } } }
      const hash = this.solHashToIpfsHash(ipfsResult);
      this.$set(this.job, 'resultIpfsHash', hash);
      // the result is now being retrieved in the backend
      // this.result = await this.retrieveIpfsContent(hash)
    },
    async getLogs (node) {
      if (this.currentStep) {
        try {
          // + if logs are private
          if (!this.logSignature) {
            await this.getLogSignature();
          }
          const nodeUrl = node.replace('$MARKET', this.job.cache_blockchain.market.substring(0, 5));
          const currentStepIndex = this.job.job_content.pipeline.jobs
            .findIndex(item => item.name === this.currentStep ||
              item.id === this.currentStep);

          if (this.job.job_content.pipeline.jobs) {
            this.$set(this.job.job_content.pipeline.jobs[currentStepIndex], 'step_status', 'running');
          }

          const response =
          await fetch(`${nodeUrl}/nosana/logs/${this.job.address}/${this.currentStep}`, {
            headers: {
              Authorization: this.logSignature
            }
          });

          if (response.status !== 200 && response.status !== 206) {
            throw new Error('Log error status ' + response.status);
          }
          this.logs[this.currentStep] = await response.text();
          this.logs[this.currentStep] = ansi.ansi_to_html(this.logs[this.currentStep].replace(String.fromCharCode(26), ''));
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
          // When status code = 200 the log is finished
          if (response.status === 200) {
            if (this.job.job_content.pipeline.jobs) {
              const i = this.job.job_content.pipeline.jobs.findIndex(item => item.name === this.currentStep ||
              item.id === this.currentStep) + 1;
              if (i < this.job.job_content.pipeline.jobs.length) {
                this.currentStep = this.job.job_content.pipeline.jobs[i].name ||
                this.job.job_content.pipeline.jobs[i].id;

                // set this step to complete and the next step to running
                this.$set(this.job.job_content.pipeline.jobs[currentStepIndex], 'step_status', 'success');
                this.$set(this.job.job_content.pipeline.jobs[i], 'step_status', 'running');
              } else {
                this.currentStep = null;
                clearInterval(this.logInterval);
                this.refreshInterval = setInterval(this.getJob, parseInt(10000, 10));
                this.logInterval = null;
              }
            } else {
              this.currentStep = null;
              this.refreshInterval = setInterval(this.getJob, parseInt(10000, 10));
              this.logInterval = null;
            }
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
          }
        } catch (e) {
          console.error(e);
        }
      }
    },
    async getJob () {
      if (this.destroying) { return; }
      this.loadingJob = true;
      const id = this.$route.params.id;
      try {
        const job = await this.$axios.$get(`/jobs/${id}`);
        if (job.cache_result) {
          for (const key in job.cache_result.results) {
            const results = job.cache_result.results[key];
            if (Array.isArray(results)) {
              if (results[1]) {
                if (Array.isArray(results[1]) || Array.isArray(results[2])) {
                  const resultsArray = Array.isArray(results[1]) ? results[1] : results[2][1];
                  if (resultsArray) {
                    for (let i = 0; i < resultsArray.length; i++) {
                      const step = resultsArray[i];
                      if (step.log && Array.isArray(step.log)) {
                        step.log = step.log
                          .reduce((str, log) => str.concat(log[1]), '')
                          .split('\n')
                          .map(l => [1, ansi.ansi_to_html(l)]);
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
          if (this.job.cache_run_account) {
            const node = nodes[this.job.cache_run_account.account.node];
            const network = process.env.NUXT_ENV_SOL_NETWORK_NAME;
            if (node && node[network] && node[network].endpoint && node[network].logs && this.job.payload) {
              this.currentStep = 'checkout';
              // Refresh logs every second
              this.getLogs(node[network].endpoint);
              if (!this.destroying && !this.logInterval) {
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
            // this.refreshInterval = setInterval(this.getJob, parseInt(10000, 10));
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

        // if (this.job.cache_result) {
        //   this.
        // }

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
        const url = this.job ? `/repositories/${this.job.repository_id}` : '/pipelines';
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error',
          cancel: false,
          onConfirm: () => {
            this.$router.push(url);
          }
        });
      }
      this.loadingJob = false;
    },
    async getLogSignature () {
      try {
        console.log('this.job.address', this.job.address);
        const response = await this.$axios.$get(`/user/log-signature/${this.job.address}`);
        this.logSignature = response.signature;
      } catch (error) {
        console.error('cannot get signature for logs', error);
      }
    },
    showLogs (step) {
      this.showLogsOfStep = step;
      this.$router.push({ path: `/jobs/${this.$route.params.id}`, query: { step } });
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

.loading-dots:after {
  content: '.';
  animation: dots 1s steps(5, end) infinite;}

@keyframes dots {
  0%, 20% {
    color: white;
    text-shadow:
      .25em 0 0 white,
      .5em 0 0 white;}
  40% {
    color: black;
    text-shadow:
      .25em 0 0 white,
      .5em 0 0 white;}
  60% {
    text-shadow:
      .25em 0 0 black,
      .5em 0 0 white;}
  80%, 100% {
    text-shadow:
      .25em 0 0 black,
      .5em 0 0 black;}
}

.step-columns {
  .step-column {
    white-space: nowrap;
    width: max-content;
    .step-items {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .step-item {
      border: 1px solid #B9BEB7;
      border-radius: 8px;
      padding: 10px;
      padding-right: 60px;
      width: 100%;
      max-width: 400px;
      &:hover {
        cursor: pointer;
        background-color: $grey-light !important;
      }
      &.disabled-step {
        cursor: not-allowed !important;
        &:hover {
          background-color: white;
        }
      }
    }
  }
}

.sidebar-is-minimized {
  width: calc(100% - 60px) !important;
}
.is-9, .is-11 {
  transition: all ease .2s;
}
.sidebar {
  transition: all ease .2s;
  .box .is-flex.is-align-items-flex-start {
        &::before {
          visibility: hidden !important;
        }
      }
  &.sidebar-minimized {
    width: 60px;
    padding-left: 0px;
    .box {
      padding-left: 0px !important;
      padding-right: 0px !important;

      .is-flex.is-align-items-flex-start {
        &::before {
          visibility: visible !important;
        }
      }
      & > .is-flex.is-align-items-flex-start:hover {
          background-color: $grey-darker;
          border-radius: 4px;
        }

      @media screen and (max-width: $tablet) {
        .is-flex.is-align-items-flex-start {
          &::before {
            display: block;
          }
        }
      }
    }
  }
  .minimized {
    visibility: hidden;
    width: 0;
    padding: 0 !important;
  }
  span.is-size-6 {
    font-size: .85rem !important;
    color: #717470;
  }
  hr {
    background-color: #E0E6DE;
  }
  .blockchain-address-inline {
    font-family: $family-headers;
    color: $accent;
    font-weight: 500;
    display: block;
    margin-top: -3px;
  }
}
.collapse-button {
  button {
    padding-left: 0 !important;
    font-family: $family-headers;
  }
}
</style>
