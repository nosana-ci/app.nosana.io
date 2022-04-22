<template>
  <div>
    <nav
      class="pagination is-centered "
      role="navigation"
      aria-label="pagination"
    >
      <a
        class="pagination-previous"
        :class="{'disabled': isPreviousButtonDisabled}"
        :disabled="isPreviousButtonDisabled"
        @click="previousPage"
      >Previous</a>
      <a
        class="pagination-next"
        :class="{'disabled': isNextButtonDisabled}"
        :disabled="isNextButtonDisabled"
        @click="nextPage"
      >Next page</a>
      <ul class="pagination-list">
        <li><a class="pagination-link" aria-label="Goto page 1">1</a></li>
        <li><span class="pagination-ellipsis">&hellip;</span></li>
        <li><a class="pagination-link" aria-label="Goto page 45">45</a></li>
        <li><a class="pagination-link is-current" aria-label="Page 46" aria-current="page">46</a></li>
        <li><a class="pagination-link" aria-label="Goto page 47">47</a></li>
        <li><span class="pagination-ellipsis">&hellip;</span></li>
        <li><a class="pagination-link" aria-label="Goto page 86">86</a></li>
      </ul>
    </nav>
    <p>CurrentPage: {{ currentPage }}</p>
    <p>PageCount: {{ pageCount }}</p>
  </div>
</template>

<script>
export default {
  data () {
    return {
      currentPage: 1,
      pageCount: 5
    };
  },
  computed: {
    isPreviousButtonDisabled () {
      return this.currentPage === 1;
    },
    isNextButtonDisabled () {
      return this.currentPage === this.pageCount;
    }
  },
  watch: {},
  methods: {
    nextPage () {
      this.currentPage += 1;
    },
    previousPage () {
      this.currentPage -= 1;
    }
  }

};
</script>

<style>
.disabled{
    pointer-events: none;
}
</style>
