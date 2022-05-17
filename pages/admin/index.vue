<template>
  <section class="section admin-page">
    <div class="container">
      <h2 class="subtitle mt-6">
        Users
      </h2>
      <div class="block">
        <h2 class="subtitle has-text-weight-bold">
          <span v-if="userCount !== null && !loadingUserCount">{{
            userCount
          }}</span><span v-else>...</span> users
          <a @click="getUsers"><small class="is-size-7">refresh</small></a>
        </h2>
      </div>
      <form
        @submit.prevent="
          page = 1;
          getUsers();
        "
      >
        <div class="field has-addons">
          <div class="control">
            <input
              v-model="search"
              class="input"
              type="text"
              placeholder="Search.."
            >
          </div>
          <div class="control">
            <button class="button is-info" type="submit">
              Search
            </button>
          </div>
        </div>
      </form>

      <br>

      <div class="field has-addons">
        <div class="control">
          <div class="select">
            <select
              v-model="filter"
              @change="
                page = 1;
                getUsers();
              "
            >
              <option value="">
                - Status -
              </option>
              <option value="ACTIVE">
                ACTIVE
              </option>
              <option value="BANNED">
                BANNED
              </option>
            </select>
          </div>
        </div>

        <div class="control">
          <div class="select">
            <select
              v-model="repoFilter"
              @change="
                page = 1;
                getUsers();
              "
            >
              <option value="">
                - Repo -
              </option>
              <option value="CONNECTED">
                Connected
              </option>
              <option value="NOREPOS">
                No Repos
              </option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="loading" class="has-text-centered subtitle">
        <progress class="progress is-small is-primary" max="100">
          Loading
        </progress>
      </div>
      <div class="table-container">
        <table class="table is-fullwidth is-striped is-hoverable">
          <thead>
            <tr>
              <th />
              <th>Address</th>
              <th>Repos</th>
              <th>Commits</th>
              <th>Name</th>
              <th>Email</th>
              <th>Description</th>
              <th>Discord</th>
              <th>Created</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="u in users"
              :key="u.id"
              class="is-size-7"
              @click="getUser(u.user_id)"
            >
              <td><img v-if="u.image" style="height: 20px; max-width: fit-content;" :src="u.image"></td>
              <td>
                <span class="blockchain-address">{{ u.address }}</span>
              </td>
              <td>{{ u.repositories }}</td>
              <td>{{ u.commits }}</td>
              <td>{{ u.name }}</td>
              <td>{{ u.email }}</td>
              <td>
                <div class="description">
                  {{ u.description }}
                </div>
              </td>
              <td>{{ u.discord }}</td>
              <td>{{ u.created_at }}</td>
              <td>
                {{ u.status }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav
        v-if="userCount && users"
        class="pagination"
        role="navigation"
        aria-label="pagination"
      >
        <span>{{ (page - 1) * 20 + 1 }}-{{ (page - 1) * 20 + users.length }} of
          {{ userCount }}</span>
        <a
          class="pagination-previous"
          :disabled="page == 1"
          @click="page = page - 1"
        >Previous</a>
        <a
          class="pagination-next"
          :disabled="!maxPage || page == maxPage"
          @click="page = page + 1"
        >Next page</a>
        <ul class="pagination-list">
          <li v-if="page > 2">
            <a class="pagination-link" @click="page = 1">1</a>
          </li>
          <li v-if="page > 3">
            <span class="pagination-ellipsis">&hellip;</span>
          </li>
          <li v-if="page > 1">
            <a class="pagination-link" @click="page = page - 1">{{
              page - 1
            }}</a>
          </li>
          <li>
            <a class="pagination-link is-current" aria-current="page">{{
              page
            }}</a>
          </li>
          <li v-if="page < maxPage">
            <a class="pagination-link" @click="page = page + 1">{{
              page + 1
            }}</a>
          </li>
          <li v-if="maxPage > page + 2">
            <span class="pagination-ellipsis">&hellip;</span>
          </li>
          <li v-if="maxPage > page + 1">
            <a class="pagination-link" @click="page = maxPage">{{ maxPage }}</a>
          </li>
        </ul>
      </nav>
    </div>
    <div class="has-text-centered container mt-6">
      <div class="has-text-centered mb-4">
        <a
          class="button is-outlined is-danger is-small"
          style="border-radius: 6px"
          @click="$sol.logout()"
        >
          Logout
        </a>
      </div>
    </div>
  </section>
</template>

<script>

export default {
  components: {

  },
  middleware: 'auth',
  data () {
    return {
      loading: false,
      loadingUserCount: false,
      error: null,
      userCount: null,
      users: null,
      user: null,
      page: 1,
      search: '',
      filter: '',
      repoFilter: ''
    };
  },
  computed: {
    maxPage () {
      return Math.ceil(this.userCount / 20);
    }
  },
  watch: {
    page () {
      this.getUsers();
    }
  },

  mounted () {
    this.getUsers();
  },
  methods: {
    async setUserStatus (userId, status) {
      try {
        await this.$axios.post(
          `/admin/user/${userId}/ustatus`,
          {
            status
          }
        );
        this.getUsers();
      } catch (e) {
        console.error(e);
      }
    },
    async getUser (id) {
      this.loading = true;
      try {
        const response = await this.$axios.get(`/admin/user/${id}`);
        this.user = response.data;
        window.open('/projects/' + id);
      } catch (error) {
        console.error(error);
      }
      this.loading = false;
    },
    async getUsers () {
      this.loading = true;
      try {
        const response = await this.$axios.get(
          `/admin/users?page=${this.page}&q=${this.search}&f=${this.filter}&r=${this.repoFilter}`
        );
        this.users = response.data.users;
        this.userCount = response.data.count;
      } catch (error) {
        console.error(error);
      }
      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.description {
  max-width: 250px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow:hidden;
  margin: 0;
}
</style>
