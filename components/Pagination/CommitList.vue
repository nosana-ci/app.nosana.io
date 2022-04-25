<template>
  <div>
    <pagination-helper
      :total-pages="11"
      :total="113"
      :per-page="10"
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
      currentPage: 1
    };
  },
  methods: {
    onPageChange (page) {
      console.log(page);
      this.currentPage = page;
    }
  }
};
</script>

<style></style>
