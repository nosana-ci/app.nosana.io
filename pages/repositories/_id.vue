<template>
  <section class="section">
    <div class="container">
      <nuxt-link v-if="repository" to="/">
        <i class="fas fa-chevron-left" /> All repositories
      </nuxt-link>
      <div class="mt-2">
        <div v-if="repository">
          <div class="is-flex is-align-items-center">
            <h2 class="title">
              {{ repository.repository }}
            </h2>
          </div>
          <p>
            <a
              :href="'https://github.com/' + repository.repository"
              target="_blank"
              @click.stop
            >https://github.com/{{ repository.repository }}</a>
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
              v-for="commit in displayedCommits"
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
              v-if="!commits"
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
        v-if="commits"
        :commits="commits"
        :per-page="commitsPerPage"
        :current-page="currentPage"
        @pagechanged="onPageChange"
      />
    </div>
  </section>
</template>

<script>
import PaginationHelper from '../../components/Pagination/PaginationHelper.vue';
export default {
  components: { PaginationHelper },
  data () {
    return {
      currentPage: 1,
      commitsPerPage: 10,
      commits: null,
      repository: null,
      project: null
    };
  },
  computed: {
    displayedCommits () {
      return this.paginate(this.commits);
    }
  },
  created () {
    this.getCommits();
    this.getRepository();
    // setInterval(() => {
    //   console.log('refreshing repositories..')
    //   this.getCommits()
    // }, 20000)
  },
  methods: {
    paginate (commits) {
      const page = this.currentPage;
      const perPage = this.commitsPerPage;
      const from = (page * perPage) - perPage;
      const to = (page * perPage);
      if (this.commits) {
        return commits.slice(from, to);
      }
    },
    onPageChange (page) {
      this.currentPage = page;
    },
    async getCommits () {
      try {
        const commits = await this.$axios.$get(
          `/repositories/${this.$route.params.id}/commits`
        );
        this.commits = commits;
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
        this.repository = await this.$axios.$get(
          `/repositories/${this.$route.params.id}`
        );
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
