<template>
  <section class="section">
    <div class="table-container">
      <table class="table is-striped is-fullwidth is-hoverable">
        <thead>
          <tr>
            <th>#</th>
            <th>Address</th>
            <th>XNOS</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(user, index) in leaderboard"
            :key="user.address"
          >
            <td>{{ index+1 }}</td>
            <td>{{ user.address }}</td>
            <td>{{ user.xnos }}</td>
          </tr>
          <tr
            v-if="!leaderboard || !leaderboard.length"
            class="has-text-centered has-text-weight-bold"
          >
            <td v-if="!leaderboard" colspan="5">
              Loading users..
            </td>
            <td v-else colspan="5">
              No users
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <pagination-helper
      v-if="leaderboard && leaderboard.length > 0 && pagination"
      :total-pages="Math.ceil(pagination.total / pagination.perPage)"
      :per-page="pagination.perPage"
      :current-page="parseInt(pagination.currentPage)"
      @pagechanged="getLeaderboard"
    />
  </section>
</template>
<script>
import PaginationHelper from '@/components/Pagination/PaginationHelper.vue';
export default {
  components: { PaginationHelper },
  middleware: 'auth',
  data () {
    return {
      loading: false,
      leaderboard: null,
      queryPage: this.$route.query.page || 1,
      pagination: null
    };
  },

  mounted () {
    this.getLeaderboard(this.queryPage);
  },
  methods: {
    async getLeaderboard (page) {
      try {
        const leaderboard = await this.$axios.$get(
          `/stake/leaderboards?page=${page}`
        );
        this.leaderboard = leaderboard.data;
        this.pagination = leaderboard.pagination;
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    }
  }
};
</script>
