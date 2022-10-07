<template>
  <section class="section">
    <div class="container">
      <nuxt-link to="/markets">
        &lt; All markets
      </nuxt-link>
      <div class="mt-2">
        <div v-if="market">
          <div class="is-flex is-align-items-center">
            <h2 class="title">
              {{ id }}
            </h2>
            <div v-if="user && (user.roles && user.roles.includes('admin'))">
              <nuxt-link :to="`/markets/${id}/edit`" class="button is-accent is-outlined is-pulled-right">
                Edit market
              </nuxt-link>
            </div>
          </div>
        </div>
        <div v-else>
          Loading..
        </div>
      </div>
      {{ market }}
    </div>
  </section>
</template>

<script>
export default {
  data () {
    return {
      id: this.$route.params.id,
      user: null,
      market: null,
      loading: false
    };
  },
  watch: {
    '$auth.loggedIn' (loggedIn) {
      if (loggedIn) {
        this.getUser();
      }
    }
  },
  created () {
    this.getMarket();
    this.getUser();
  },
  methods: {
    async getUser () {
      try {
        const user = await this.$axios.$get('/user');
        this.user = user;
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    async getMarket () {
      this.loading = true;
      try {
        this.market = await this.$axios.$get(`/markets/${this.id}`);
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
