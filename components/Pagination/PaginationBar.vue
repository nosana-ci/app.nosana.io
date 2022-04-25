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
        nuxt-link-go-back
        @click="previousPage"
      >
        Previous
      </a>
      <a
        class="pagination-next"
        :class="{'disabled': isNextButtonDisabled}"
        :disabled="isNextButtonDisabled"
        @click="nextPage"
      >
        Next page
      </a>
      <ul class="pagination-list">
        <li v-for="(page, index) in totalPages" :key="index">
          <a
            class="pagination-link"
            :class="{'is-current': currentPage === index }"
            aria-label="Goto page 1"
            arie-current="page"
            @click="goToPage(index)"
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
    commits: {
      type: Array,
      default () {
        return [];
      }
    },
    commitsPerPage: {
      type: Number,
      default: 3
    }
  },
  data () {
    return {
      currentPage: 0
    };
  },
  computed: {
    isPreviousButtonDisabled () {
      return this.currentPage === 0;
    },
    isNextButtonDisabled () {
      return this.currentPage >= this.totalPages - 1;
    },
    totalPages () {
      return Math.ceil(this.commits.length / this.commitsPerPage);
    }
  },
  watch: {},
  methods: {
    nextPage () {
      this.currentPage += 1;
      this.$emit('goToPpage', this.currentPage);
    },
    previousPage () {
      this.currentPage -= 1;
      this.$emit('goToPpage', this.currentPage);
    },
    goToPage (index) {
      this.currentPage = index;
      this.$emit('goToPpage', index, this.commitsPerPage);
    }
  }

};
</script>

<style>
.disabled{
    pointer-events: none;
}
</style>
