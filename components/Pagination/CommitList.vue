<template>
  <div class="section">
    <div class="container">
      <p v-for="(commit, index) in displayedPosts" :key="index">
        {{ commit.title }}
      </p>
    </div>
    <pagination-helper
      :total-pages="totalPages"
      :per-page="commitsPerPage"
      :current-page="currentPage"
      @pagechanged="onPageChange"
    />
  </div>
</template>

<script>
import PaginationHelper from './PaginationHelper.vue';
export default {
  components: { PaginationHelper },
  data () {
    return {
      currentPage: 1,
      commits: [{ title: 'commit 1' }, { title: 'commit 2' }, { title: 'commit 3' }, { title: 'commit 4' }, { title: 'commit 5' }, { title: 'commit 6' }, { title: 'commit 7' }, { title: 'commit 8' }, { title: 'commit 9' }, { title: 'commit 10' }],
      commitsPerPage: 3,
      showCommits: ''
    };
  },
  computed: {
    totalPages () {
      return Math.ceil(this.commits.length / this.commitsPerPage);
    },
    displayedPosts () {
      return this.paginate(this.commits);
    }
  },
  methods: {
    paginate (commits) {
      const page = this.currentPage;
      const perPage = this.commitsPerPage;
      const from = (page * perPage) - perPage;
      const to = (page * perPage);
      return commits.slice(from, to);
    },
    onPageChange (page) {
      console.log(page);
      this.currentPage = page;
    }
  }
};
</script>

<style></style>
