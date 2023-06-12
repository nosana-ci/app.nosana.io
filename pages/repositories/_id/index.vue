<template>
  <section class="section py-4">
    <div class="container">
      <nuxt-link to="/pipelines" class="has-text-accent has-text-weight-semibold">
        <i class="fas fa-chevron-left" /> All repositories
      </nuxt-link>
      <div v-if="repository">
        <div class="mb-2 mt-3 is-flex-desktop">
          <div>
            <h2 class="title mb-0 mr-2">
              {{ repository.repository }}
            </h2>
            <a
              class="is-size-7"
              :href="'https://github.com/' + repository.repository"
              target="_blank"
              @click.stop
            >https://github.com/{{ repository.repository }}</a>
            <div v-if="repository.market === communityMarketId" class="mt-5">
              <p>
                <b>Nosana community tier</b><br>
                Your CI/CD jobs will run on the Nosana community tier.<br>
                This is a free tier that will run on a best-effort basis.
              </p>
            </div>
          </div>
          <div class="ml-auto">
            <div
              v-if="repository.marketAccount"
              class="has-background-light has-text-centered px-6 py-4
              has-radius-medium"
            >
              Pipeline price<br>
              <b class="has-text-accent is-size-5">{{ parseInt(repository.marketAccount.jobPrice, 16) / 1e6 }} NOS</b>
            </div>
            <p
              v-if="repository && user && repository.user_id === user.user_id && repository.github_installation_id &&
                permissionFound !== null"
              class="my-4"
            >
              <nuxt-link
                v-if="repository"
                class="button is-accent is-fullwidth is-wider"
                :to="`/repositories/${id}/pipeline`"
              >
                Manage
              </nuxt-link>
            </p>
          </div>
        </div>
        <div
          v-if="
            canEdit &&
              (permissionFound === false ||
                (permissionFound === null && loading === false))
          "
          class="notification is-danger mt-3 has-radius-medium"
        >
          <span v-if="!repository.github_installation_id">
            No GitHub installation found
          </span>
          <span v-else>
            No permission for this repository in the GitHub app installation.
          </span>
          <br>
          <span
            :class="{ 'is-loading': loading }"
            class="button is-danger is-outlined is-small mt-2"
            style="border-color: #fff"
            @click="goToGithub"
          >
            <span
              v-if="!repository.github_installation_id"
              class="has-text-white"
            >Setup GitHub installation</span>
            <span
              v-else
              class="has-text-white"
            >Reconnect this repository</span>
          </span>
        </div>
        <div
          v-if="repository.status === 'DEACTIVATED'"
          class="notification is-danger mt-3 has-radius-medium"
        >
          This repository is deactivated and will not create jobs based on your commits.<br>
          You can reactivate this repository in the settings menu.
          <br>
          <nuxt-link
            class="button is-danger is-outlined is-small mt-2"
            style="border-color: #fff"
            :to="`/repositories/${id}/edit`"
          >
            <span
              class="has-text-white"
            >Settings</span>
          </nuxt-link>
        </div>
      </div>
      <div v-else>
        Loading...
      </div>

      <div class="table-container mt-6" style="overflow-y: visible;">
        <table class="table is-striped is-bordered  is-fullwidth is-hoverable">
          <thead>
            <tr class="has-background-light">
              <th class="py-2 px-5">
                <div class="px-3">
                  #
                </div>
              </th>
              <th class="py-2 px-5">
                <div class="px-3">
                  Message
                </div>
              </th>
              <th class="py-2 px-5">
                <div class="px-3">
                  Commit
                </div>
              </th>
              <th class="py-2 px-5">
                <div class="px-3">
                  Created
                </div>
              </th>
              <th class="py-2 px-5">
                <div class="px-3">
                  Status
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(job, index) in jobs"
              :key="job.uuid"
              :class="{
                'has-tooltip disabled': job.status === 'YAML_ERROR',
                'is-clickable': job.status !== 'YAML_ERROR',
              }"
              data-tooltip="Could not create job for this commit: Error when parsing nosana-ci.yml file."
              @click="job.status !== 'YAML_ERROR' ? $router.push(`/jobs/${job.uuid}`) : null"
            >
              <td>
                <div>
                  {{ (pagination.total -
                    (parseInt(pagination.currentPage) === 1 ? index : (pagination.from + index ))) }}
                </div>
              </td>
              <td>
                <span v-if="job.payload.message">{{ job.payload.message.split("\n")[0] }}</span>
                <span v-else-if="job.payload.title">
                  {{ job.payload.title }}
                </span>
              </td>

              <td>
                <a :href="job.payload.html_url || job.payload.url" target="_blank" @click.stop>{{
                  job.commit | shortenHashes
                }}</a>
              </td>
              <td>{{ $moment(job.created_at).fromNow() }}</td>
              <td class="py-4">
                <div
                  class="tag is-outlined is-light"
                  :class="{
                    'is-accent': job.status === 'COMPLETED',
                    'is-info': job.status === 'RUNNING' || job.status === 'PENDING',
                    'is-warning': job.status === 'QUEUED',
                    'is-danger': job.status === 'FAILED' || job.status === 'STOPPED' || job.status === 'YAML_ERROR'
                      || job.status === 'NOT_POSTED',
                  }"
                >
                  {{ job.status }}
                </div>
              </td>
            </tr>
            <tr
              v-if="!jobs || !jobs.length"
              class="has-text-centered has-text-weight-bold"
            >
              <td v-if="!jobs" colspan="5">
                Loading jobs...
              </td>
              <td v-else colspan="5">
                No jobs
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <pagination-helper
        v-if="jobs && jobs.length > 0 && pagination"
        :total-pages="Math.ceil(pagination.total / pagination.perPage)"
        :per-page="pagination.perPage"
        :current-page="parseInt(pagination.currentPage)"
        @pagechanged="getJobs"
      />
    </div>
  </section>
</template>

<script>
import axios from 'axios';
import PaginationHelper from '@/components/Pagination/PaginationHelper.vue';

let githubApi;
export default {
  components: { PaginationHelper },
  filters: {
    shortenHashes (value) {
      if (!value) {
        return;
      }
      const firstCharacters = value.slice(0, 8);
      // const lastCharacters = value.slice(value.length - 4, value.length);
      return firstCharacters; // + '... ' + lastCharacters;
    }
  },
  data () {
    return {
      githubAppUrl: process.env.NUXT_ENV_GITHUB_APP_URL,
      queryPage: this.$route.query.page || 1,
      showPipeline: true,
      pagination: null,
      refreshInterval: null,
      repository: null,
      project: null,
      id: this.$route.params.id,
      user: null,
      backendUrl: process.env.NUXT_ENV_BACKEND_URL,
      permissionFound: null,
      loading: false,
      newInstallationId: null,
      communityMarketId: process.env.NUXT_ENV_COMMUNITY_MARKET_ID,
      jobs: null
    };
  },
  computed: {
    canEdit () {
      return (
        this.repository &&
        this.user &&
        (this.repository.user_id === this.user.user_id ||
          (this.user.roles && this.user.roles.includes('admin')))
      );
    }
  },
  watch: {
    '$auth.loggedIn' (loggedIn) {
      if (loggedIn) {
        this.getUser();
      }
    }
  },
  created () {
    this.newInstallationId = this.$route.query.installation_id;
    this.setup();
    this.getJobs(this.queryPage);
    if (!this.refreshInterval) {
      this.refreshInterval = setInterval(() => {
        console.log('refreshing jobs..');
        this.getJobs(this.queryPage);
      }, 20000);
    }
  },
  beforeDestroy () {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  },
  methods: {
    async setup () {
      await this.getRepository();
      if (this.$auth && this.$auth.loggedIn) {
        await this.getUser();
      }
      if (this.canEdit) {
        await this.githubInstallationCheck();
      }
    },
    copyToClipboard (content) {
      navigator.clipboard.writeText(content).then(() => {
        alert('Webhook URL copied!');
      });
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
    async getJobs (page) {
      try {
        const jobs = await this.$axios.$get(
          `/repositories/${this.$route.params.id}/jobs?page=${page}`
        );
        this.jobs = jobs.data;
        this.pagination = jobs.pagination;
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    async githubInstallationCheck () {
      try {
        // GH installation check
        if (this.repository.github_installation_id) {
          await this.githubApp(
            parseInt(this.repository.github_installation_id)
          );
        } else if (this.newInstallationId) {
          await this.githubApp(parseInt(this.newInstallationId));
        } else {
          console.log('no github installation id found');
          this.loading = false;
          this.permissionFound = false;
        }
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    async getRepository () {
      try {
        localStorage.removeItem('repo-id');
        this.repository = await this.$axios.$get(`/repositories/${this.id}`);
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    goToGithub () {
      localStorage.setItem('repo-id', this.repository.id);
      window.location.href = this.githubAppUrl;
    },
    async githubApp (installationId) {
      try {
        this.loading = true;
        const response = await this.$axios.$get(
          '/github/auth/' + installationId
        );
        this.githubToken = response.token;
        githubApi = axios.create({
          baseURL: 'https://api.github.com',
          headers: { Authorization: 'token ' + this.githubToken }
        });
        this.getUserRepos();
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
        this.permissionFound = false;
        this.loading = false;
      }
    },
    async getUserRepos () {
      try {
        if (githubApi) {
          let page = 1;
          let response;
          this.repositories = [];
          do {
            response = await githubApi.get(
              `/installation/repositories?type=public&per_page=100&page=${page}&t=${new Date().getTime()}`
            );
            console.log('response', response);
            if (response && response.data) {
              this.repositories = this.repositories.concat(
                response.data.repositories
              );
            }
            page++;
          } while (
            response &&
            response.data &&
            response.data.repositories.length >= 100
          );

          // check if current repo is amongst the selected repositories && != private
          for (const repo of this.repositories) {
            if (
              repo.full_name === this.repository.repository &&
              !repo.private
            ) {
              this.permissionFound = true;

              if (
                !this.repository.github_installation_id &&
                this.newInstallationId
              ) {
                // update installation id for repo, if we there's no id in db
                await this.$axios.$post(`/repositories/${this.id}`, {
                  github_installation_id: this.newInstallationId
                });
              }
            }
          }
        }
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
td {
  vertical-align: middle;
}
</style>
<style lang="scss" scoped>
.table.is-striped tbody tr:not(.is-selected):nth-child(odd) {
  background-color: $grey-lighter;
}
.table td, .table th {
  border-color: $grey-darker;
}

tr.is-clickable:not(.disabled) {
  &::before {
    visibility: hidden;
    content: ""
  }
}
tr.disabled {
  cursor: not-allowed;
  td {
    opacity: .2;
    &:last-child{
      opacity: 1;
    }
  }
}

table thead tr::before {
    content: "";
}

</style>
