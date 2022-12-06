<template>
  <section class="section">
    <div class="container">
      <nuxt-link v-if="repository" to="/pipelines">
        <i class="fas fa-chevron-left" /> All repositories
      </nuxt-link>
      <div class="mt-2">
        <div v-if="repository">
          <div class="is-flex is-align-items-center mb-2">
            <h2 class="title mb-0 mr-2">
              {{ repository.repository }}
            </h2>
            <div class="ml-auto">
              <nuxt-link
                v-if="repository && user &&
                  (repository.user_id === user.user_id)"
                class="button is-outlined is-accent is-small"
                :to="`/repositories/${id}/secrets`"
              >
                secrets
              </nuxt-link>
              <nuxt-link
                v-if="canEdit"
                class="button is-outlined is-accent is-small"
                :to="`/repositories/${id}/edit`"
              >
                edit
              </nuxt-link>
            </div>
          </div>
          <p>
            <a
              :href="'https://github.com/' + repository.repository"
              target="_blank"
              @click.stop
            >https://github.com/{{ repository.repository }}</a>
          </p>
          <div
            v-if="canEdit && (permissionFound === false
              || (permissionFound === null && loading === false))"
            class="notification is-danger mt-3"
          >
            <span v-if="!repository.github_installation_id">
              No Github installation found
            </span>
            <span v-else>
              No permission for this repository in the Github App Installation.
            </span>
            <br>
            <span
              :class="{'is-loading': loading}"
              class="button is-danger is-outlined is-small mt-2"
              style="border-color: #fff;"
              @click="goToGithub"
            >
              <span v-if="!repository.github_installation_id" class="has-text-white">Setup Github Installation</span>
              <span v-else class="has-text-white">Reconnect this repository</span>
            </span>
          </div>
          <p>
            <span
              class="has-tooltip-arrow"
              :class="{'has-tooltip': repository.secret}"
              :data-tooltip="repository.secret ?
                ('Github Webhook:\n' + backendUrl + '/webhook/github/' + repository.secret) : null"
              @click.stop="repository.secret ?
                copyToClipboard(backendUrl + '/webhook/github/' + repository.secret) : null"
            >Trigger on commit to {{ repository.branches }} branch(es)</span>
          </p>
          <p v-if="repository.marketAccount">
            Pipeline price: <b class="has-text-accent">
              {{ parseInt(repository.marketAccount.jobPrice, 16) / 1e6 }} NOS</b>
          </p>
          <p class="my-4">
            <nuxt-link
              v-if="repository"
              class="button is-accent"
              :to="`/repositories/${id}/pipeline`"
            >
              <span
                v-if="canEdit"
              >Manage</span><span v-else>Show</span>&nbsp;<span>Pipeline</span>
            </nuxt-link>
          </p>
        </div>
        <div v-else>
          Loading..
        </div>
      </div>

      <div class="table-container">
        <table class="table is-striped is-fullwidth is-hoverable">
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Message</th>
              <th>Commit</th>
              <th>Created</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="commit in commits"
              :key="commit.id"
              class="is-clickable"
              @click="$router.push(`/jobs/${commit.id}`)"
            >
              <td>{{ commit.id }}</td>
              <td>{{ commit.payload.message.split("\n")[0] }}</td>
              <td>
                <a :href="commit.payload.url" target="_blank" @click.stop>{{
                  commit.commit | shortenHashes
                }}</a>
              </td>
              <td>{{ $moment(commit.created_at).fromNow() }}</td>
              <td class="py-4">
                <div
                  class="tag is-small"
                  :class="{
                    'is-accent': commit.status === 'COMPLETED',
                    'is-info': commit.status === 'RUNNING',
                    'is-warning': commit.status === 'QUEUED',
                    'is-danger': commit.status === ('FAILED' || 'STOPPED'),
                  }"
                >
                  {{ commit.status }}
                </div>
              </td>
            </tr>
            <tr
              v-if="!commits || !commits.length"
              class="has-text-centered has-text-weight-bold"
            >
              <td v-if="!commits" colspan="5">
                Loading commits...
              </td>
              <td v-else colspan="5">
                No commits
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <pagination-helper
        v-if="commits && commits.length > 0 && pagination"
        :total-pages="Math.ceil(pagination.total / pagination.perPage)"
        :per-page="pagination.perPage"
        :current-page="parseInt(pagination.currentPage)"
        @pagechanged="getCommits"
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
      commits: null,
      repository: null,
      project: null,
      id: this.$route.params.id,
      user: null,
      backendUrl: process.env.NUXT_ENV_BACKEND_URL,
      permissionFound: null,
      loading: false,
      newInstallationId: null
    };
  },
  computed: {
    canEdit () {
      return this.repository && this.user &&
                  (this.repository.user_id === this.user.user_id || (this.user.roles && this.user.roles.includes('admin')));
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
    this.getCommits(this.queryPage);
    this.setup();
    setInterval(() => {
      console.log('refreshing commits..');
      this.getCommits(this.queryPage);
    }, 20000);
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
    async getCommits (page) {
      try {
        const commits = await this.$axios.$get(
          `/repositories/${this.$route.params.id}/commits?page=${page}`
        );
        this.commits = commits.data;
        this.pagination = commits.pagination;
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
          await this.githubApp(parseInt(this.repository.github_installation_id));
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
        const response = await this.$axios.$get('/github/auth/' + installationId);
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
            response = await githubApi
              .get(`/installation/repositories?type=public&per_page=100&page=${page}&t=${(new Date()).getTime()}`);
            console.log('response', response);
            if (response && response.data) {
              this.repositories = this.repositories.concat(response.data.repositories);
            }
            page++;
          } while (response && response.data && response.data.repositories.length >= 100);

          // check if current repo is amongst the selected repositories && != private
          for (const repo of this.repositories) {
            if (repo.full_name === this.repository.repository && !repo.private) {
              this.permissionFound = true;

              if (!this.repository.github_installation_id && this.newInstallationId) {
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
