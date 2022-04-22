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
        <li v-for="(page, index) in pages" :key="page">
          <a
            class="pagination-link"
            :class="{'is-current': currentPage === index + 1}"
            aria-label="Goto page 1"
            arie-current="page"
          >{{ index + 1 }}</a>
        </li>
        <!-- <li><span class="pagination-ellipsis">&hellip;</span></li> -->
      </ul>
    </nav>
    <p>CurrentPage: {{ currentPage }}</p>
    <p>PageCount: {{ pageCount }}</p>
  </div>
</template>

<script>
export default {
  props: {
    pages: {
      type: Object,
      default () {
        return {};
      }
    }
  },
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
