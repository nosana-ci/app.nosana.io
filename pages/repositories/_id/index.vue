<template>
  <section class="section">
    <div class="container">
      <nuxt-link v-if="repository" to="/">
        <i class="fas fa-chevron-left" /> All repositories
      </nuxt-link>
      <div class="mt-2">
        <div v-if="repository">
          <div class="is-flex is-align-items-center mb-2">
            <h2 class="title mb-0 mr-2">
              {{ repository.repository }}
            </h2>
            <nuxt-link
              v-if="repository && user &&
                (repository.user_id === user.user_id || (user.roles && user.roles.includes('admin')))"
              class="button is-outlined is-accent is-small"
              style="margin-left: auto"
              :to="`/repositories/${id}/edit`"
            >
              edit
            </nuxt-link>
          </div>
          <p>
            <a
              :href="'https://github.com/' + repository.repository"
              target="_blank"
              @click.stop
            >https://github.com/{{ repository.repository }}</a>
          </p>
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
          <p>
            Pipeline price: <b class="has-text-accent">{{ repository.job_price/1e6 }} NOS</b>
          </p>
          <p class="is-size-7">
            <a @click="showPipeline = !showPipeline">
              <span v-if="showPipeline">Hide</span><span v-else>Show</span> pipeline
            </a>
          </p>
          <div v-if="repository && showPipeline">
            <code-editor v-model="repository.pipeline" :readonly="true" />
          </div>
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
                  commit.commit
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
                    'is-danger': commit.status === 'FAILED',
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
                Loading commits..
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
import PaginationHelper from '@/components/Pagination/PaginationHelper.vue';
export default {
  components: { PaginationHelper },
  data () {
    return {
      queryPage: this.$route.query.page || 1,
      showPipeline: true,
      pagination: null,
      commits: null,
      repository: null,
      project: null,
      id: this.$route.params.id,
      user: null,
      backendUrl: process.env.NUXT_ENV_BACKEND_URL
    };
  },
  watch: {
    '$auth.loggedIn' (loggedIn) {
      if (loggedIn) {
        this.getUser();
      }
    },
    '$route.query.page' () {
      this.queryPage = this.$route.query.page;
      this.getCommits(this.queryPage);
    }
  },
  created () {
    // this.$watch(() => this.$route.query, query => (this.getCommits(query.page)));
    this.getCommits(this.queryPage);
    this.getRepository();
    if (this.$auth && this.$auth.loggedIn) {
      this.getUser();
    }
    // setInterval(() => {
    //   console.log('refreshing commits..')
    //   this.getCommits()
    // }, 20000)
  },
  methods: {
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
    async getRepository () {
      try {
        this.repository = await this.$axios.$get(`/repositories/${this.id}`);
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
td {
  vertical-align: middle;
}
</style>
