<template>
  <div v-show="totalPages > 1" class="container">
    <nav
      class="pagination is-centered"
      role="navigation"
      aria-label="pagination"
    >
      <a
        class="pagination-previous"
        type="button"
        :disabled="isInFirstPage"
        aria-label="Go to previous page"
        :class="{ 'is-disabled': isInFirstPage }"
        @click="changePage(1)"
      >
        First
      </a>
      <a
        class="pagination-next"
        type="button"
        :disabled="isInLastPage"
        aria-label="Go to next page"
        :class="{ 'is-disabled': isInLastPage }"
        @click="changePage(totalPages)"
      >
        Last
      </a>
      <ul class="pagination-list">
        <li>
          <a
            class="pagination-link"
            :class="{ 'is-disabled': isInFirstPage }"
            type="button"
            :disabled="isInFirstPage"
            aria-label="Go to first page"
            @click="changePage(currentPage - 1)"
          >
            Previous
          </a>
        </li>

        <li v-for="(page, index) in pages" :key="index">
          <a
            type="button"
            :disabled="page.isDisabled"
            class="pagination-link"
            :class="{ 'is-current': isPageActive(page.name) }"
            :aria-label="`Go to page number ${page.name}`"
            @click="changePage(page.name)"
          >
            {{ page.name }}
          </a>
        </li>

        <li>
          <a
            class="pagination-link"
            type="button"
            :disabled="isInLastPage"
            aria-label="Go to last page"
            :class="{ 'is-disabled': isInLastPage }"
            @click="changePage(currentPage + 1)"
          >
            Next
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  props: {
    totalPages: {
      type: Number,
      required: true
    },
    maxVisibleButtons: {
      type: Number,
      required: false,
      default: 3
    },
    perPage: {
      type: Number,
      required: true
    },
    currentPage: {
      type: Number,
      required: true
    }
  },
  computed: {
    startPage () {
      if (this.currentPage === 1) {
        return 1;
      }
      if (this.totalPages === 2) {
        return this.totalPages - 1;
      }
      if (this.currentPage === this.totalPages) {
        return this.totalPages - this.maxVisibleButtons + 1;
      }
      return this.currentPage - 1;
    },
    endPage () {
      return Math.min(
        this.startPage + this.maxVisibleButtons - 1,
        this.totalPages
      );
    },
    pages () {
      const range = [];

      for (let i = this.startPage; i <= this.endPage; i += 1) {
        range.push({
          name: i,
          isDisabled: i === this.currentPage
        });
      }

      return range;
    },
    isInFirstPage () {
      return this.currentPage === 1;
    },
    isInLastPage () {
      return this.currentPage === this.totalPages;
    }
  },
  methods: {
    changePage (page) {
      this.$emit('pagechanged', page);
      this.$router.replace({ query: { page } });
    },
    isPageActive (page) {
      return this.currentPage === page;
    }
  }
};
</script>

<style lang="scss" scoped>
.is-disabled {
  pointer-events: none;
}
</style>
>
