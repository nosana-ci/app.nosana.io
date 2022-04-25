<template>
  <div>
    <nav
      class="pagination is-centered "
      role="navigation"
      aria-label="pagination"
    >
      <a
        class="pagination-previous"
        :class="{'disabled': isInFirstPage}"
        :disabled="isInFirstPage"
        @click="onClickPreviousPage"
      >
        Previous
      </a>
      <a
        class="pagination-next"
        :class="{'disabled': isInLastPage}"
        :disabled="isInLastPage"
        @click="onClickNextPage"
      >
        Next page
      </a>
      <ul class="pagination-list">
        <li v-for="(page, index) in totalPages" :key="index">
          <a
            class="pagination-link"
            :class="{'is-current': isPageActive(index) }"
            aria-label="Goto page 1"
            arie-current="page"
            @click="onClickPage(index)"
          >
            {{ index }}
          </a>
        </li>
        <!-- <li><span class="pagination-ellipsis">&hellip;</span></li> -->
      </ul>
    </nav>
    <p>CurrentPage: {{ currentPage }}</p>
  </div>
</template>

<script>
export default {
  props: {
    maxVisibleButtons: {
      type: Number,
      required: false,
      default: 3
    },
    totalPages: {
      type: Number,
      default: 0,
      required: false
    },
    perPage: {
      type: Number,
      default: 5,
      required: false
    },
    currentPage: {
      type: Number,
      default: 0,
      required: false
    }
  },
  computed: {
    isInFirstPage () {
      return this.currentPage === 0;
    },
    isInLastPage () {
      return this.currentPage >= this.totalPages - 1;
    },
    startPage () {
      if (this.currentPage === 1) {
        return 1;
      }
      if (this.currentPage === this.totalPages) {
        return this.totalPages - this.maxVisibleButtons;
      }
      return this.currentPage - 1;
    },
    pages () {
      const range = [];

      for (
        let i = this.startPage;
        i < Math.min(this.startPage + this.maxVisibleButtons - 1, this.totalPages);
        i++
      ) {
        range.push({
          name: i,
          isDisabled: i === this.currentPage
        });
      }

      return range;
    }
  },
  methods: {
    isPageActive (page) {
      return this.currentPage === page;
    },
    onClickPreviousPage () {
      this.$emit('pagechanged', this.currentPage - 1);
    },
    onClickPage (page) {
      this.$emit('pagechanged', page);
    },
    onClickNextPage () {
      this.$emit('pagechanged', this.currentPage + 1);
    }
  }
};
</script>

<style>
.disabled{
    pointer-events: none;
}
</style>
