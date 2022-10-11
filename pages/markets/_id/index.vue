<template>
  <section class="section">
    <div class="container">
      <nuxt-link to="/markets">
        &lt; All markets
      </nuxt-link>
      <div v-if="market">
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
        <div class="box">
          <div class="mb-4">
            <i class="fas fa-list mr-4 has-text-accent" />
            Market Address <a
              target="_blank"
              :href="$sol.explorer + '/address/' + id"
              class="blockchain-address-inline"
            >{{ id }}</a>
          </div>
          <div class="mb-4">
            <i class="fas fa-user mr-4 has-text-accent" />
            Authority <a
              target="_blank"
              :href="$sol.explorer + '/address/' + market.authority"
              class="blockchain-address-inline"
            >{{ market.authority }}</a>
          </div>
          <div class="mb-4">
            <i class="fas fa-coins mr-4 has-text-accent" />
            Job Price
            <b class="has-text-accent">
              {{ parseInt(
                market.jobPrice, 16)/1e6
              }}
              NOS</b>
          </div>
          <div class="mb-4">
            <i class="fas fa-clock mr-4 has-text-accent" />
            Job Timeout
            <b class="has-text-accent">
              {{ parseInt(market.jobTimeout, 16) / 60 }} min
            </b>
          </div>
          <div class="mb-4">
            <i class="fas fa-calendar mr-4 has-text-accent" />
            Job Expiration Time
            <b class="has-text-accent">
              {{ parseInt(market.jobExpiration, 16) / 60 / 60 / 24 }} days
            </b>
          </div>
          <div class="mb-4">
            <i class="fas fa-layer-group mr-4 has-text-accent" />
            Node XNOS Minimum
            <b class="has-text-accent">
              {{ parseInt(
                market.nodeXnosMinimum, 16)/1e6
              }}
              XNOS</b>
          </div>
        </div>
        <div class="">
          <h2 class="subtitle">
            Queue
          </h2>
          {{market}}
          <div />
        </div>
      </div>
      <div v-else-if="!loading">
        Market not found
      </div>
      <div v-else>
        Loading..
      </div>
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
