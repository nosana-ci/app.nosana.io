<template>
  <div class="section">
    <div class="container">
      <p class="title">
        commitlist
      </p>
      <div class="section">
        <commit-item
          v-for="commit in commits"
          :key="commit.title"
          :title="commit.title"
        />
      </div>
      <div class="section">
        <pagination-bar
          :max-visible-buttons="3"
          :total-pages="totalPages"
          :per-page="perPage"
          :current-page="currentPage"
          @pagechanged="onPageChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import CommitItem from './CommitItem';
import PaginationBar from './PaginationBar.vue';

export default {

  components: { CommitItem, PaginationBar },
  data () {
    return {
      commits: [{ title: 'commit 1' }, { title: 'commit 2' }, { title: 'commit 3' }, { title: 'commit 4' }, { title: 'commit 5' }, { title: 'commit 6' }, { title: 'commit 7' }, { title: 'commit 8' }, { title: 'commit 9' }, { title: 'commit 10' }, { title: 'commit 11' }],
      currentPage: 0,
      perPage: 3
    };
  },
  computed: {
    totalPages () {
      return Math.ceil(this.commits.length / this.perPage);
    }
  },
  methods: {
    onPageChange (page) {
      console.log(page);
      this.currentPage = page;
    }
  }
};
</script>
