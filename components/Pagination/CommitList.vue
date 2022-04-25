<template>
  <div class="section">
    <div class="container">
      <p class="title">
        commitlist
      </p>
      <div class="section">
        <commit-item
          v-for="commit in commitsShown"
          :key="commit.title"
          :title="commit.title"
        />
      </div>
      <div class="section">
        <pagination-bar :commits-per-page="commitsPerPage" :commits="commits" @goToPpage="onClicked" />
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
      commitsPerPage: 3,
      commitsShown: ''
    };
  },
  mounted () {
    this.commitsShown = this.commits.slice(0, this.commitsPerPage);
  },
  methods: {
    onClicked (value, totalPages) {
      if (value === 0) {
        this.commitsShown = this.commits.slice(value, this.commitsPerPage);
        console.log(totalPages);
      }
      if (value === 1) {
        this.commitsShown = this.commits.slice(3, this.commitsPerPage * 2);
      }
      if (value === 2) {
        this.commitsShown = this.commits.slice(6, this.commitsPerPage * 3);
      }
      if (value === 3) {
        this.commitsShown = this.commits.slice(9, this.commitsPerPage * 4);
      }
    }
  }
};
</script>
