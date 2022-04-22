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
        <pagination-bar :pages="commits" />
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
      commits: [{ title: 'commit one' }, { title: 'commit two' }]
    };
  }

};
</script>
