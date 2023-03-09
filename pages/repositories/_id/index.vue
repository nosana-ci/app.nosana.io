<template>
  <section class="section py-4">
    <div class="container">
      <nuxt-link to="/pipelines" class="has-text-accent has-text-weight-semibold">
        <i class="fas fa-chevron-left" /> All Repositories
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
                <b>Nosana Community Tier</b><br>
                Your CI/CD jobs will run on the Nosana Community Tier.<br>
                This is a free Tier that will run on a best-effort basis.
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
              v-if="repository && user && repository.user_id === user.user_id"
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
            No Github installation found
          </span>
          <span v-else>
            No permission for this repository in the Github App Installation.
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
            >Setup Github Installation</span>
            <span
              v-else
              class="has-text-white"
            >Reconnect this repository</span>
          </span>
        </div>
      </div>
      <div v-else>
        Loading..
      </div>

      <div class="table-container mt-6">
        <table class="table is-striped is-bordered  is-fullwidth is-hoverable">
          <thead>
            <tr class="has-background-light">
              <th class="py-2 px-5">
                <div class="px-3">
                  Job ID
                </div>
              </th>
              <th class="py-2 px-5">
                <div class="px-3">
                  Message
                </div>
              </th>
              <th class="py-2 px-5">
                <div class="px-3">
                  Ref
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
              v-for="job in jobs"
              :key="job.id"
              class="is-clickable"
              @click="$router.push(`/jobs/${job.id}`)"
            >
              <td><div>{{ job.id }}</div></td>
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
                  class="tag is-small"
                  :class="{
                    'is-accent': job.status === 'COMPLETED',
                    'is-info': job.status === 'RUNNING',
                    'is-warning': job.status === 'QUEUED',
                    'is-danger': job.status === ('FAILED' || 'STOPPED'),
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
</style>
