<template>
  <section class="section">
    <div class="container">
      <nuxt-link to="/markets">
        &lt; All markets
      </nuxt-link>
      <div v-if="market">
        <div class="mt-2">
          <div v-if="market">
            <div class="is-flex is-align-items-center is-justify-content-space-between mb-5">
              <h2 class="title mb-0">
                {{ id }}
              </h2>
              <div v-if="user && (user.roles && user.roles.includes('admin')) && market.authority === user.address">
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
            <i class="fas fa-suitcase mr-4 has-text-accent" />
            Job Type
            <b class="has-text-accent" style="text-transform: capitalize;">{{ jobTypes[market.jobType] }}</b>
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
            Node Minimum Stake
            <b class="has-text-accent">
              {{ parseInt(
                market.nodeXnosMinimum, 16)/1e6
              }}
              XNOS</b>
          </div>
          <div class="mb-4">
            <i class="fas fa-key mr-4 has-text-accent" />
            Node Access Key
            <a
              target="_blank"
              :href="$sol.explorer + '/address/' + market.nodeAccessKey"
              class="blockchain-address-inline"
            >{{ market.nodeAccessKey }}</a>
          </div>
        </div>
        <div class="py-5 queues columns">
          <div class="node-queue column is-half">
            <h2 class="subtitle">
              <span v-if="market.queueType === 0">
                Job
              </span>
              <span v-else-if="market.queueType === 1">
                Node
              </span>
              Queue
            </h2>
            <p v-if="market.queue.length > 0" class="mb-2">
              Total of: {{ market.queue.length }} <span v-if="market.queueType === 0">
                job(s)
              </span>
              <span v-else-if="market.queueType === 1">
                node(s)
              </span> in queue
            </p>
            <div v-if="market.queue.length > 0" class="table-container has-background-light p-5 mb-0 has-radius-medium">
              <table class="table is-striped is-fullwidth is-hoverable mb-3">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Address</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in market.queue"
                    :key="index"
                  >
                    <td class="is-size-6">
                      {{ index +1 }}
                    </td>
                    <td>
                      <a
                        v-if="market.queueType === 0"
                        style="max-width: 300px;"
                        class="blockchain-address"
                        :href="'/jobs/' + item"
                      >{{ item }}</a>
                      <a
                        v-else
                        style="max-width: 300px;"
                        class="blockchain-address"
                        target="_blank"
                        :href="$sol.explorer + '/address/' + item"
                      >{{ item }}</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else>
              There are no jobs or nodes in queue
            </p>
          </div>
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
      loading: false,
      jobTypes: {
        0: 'default',
        1: 'small',
        2: 'medium',
        3: 'large',
        4: 'gpu',
        255: 'unknown'
      }
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
.title {
  max-width: 600px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
table {
  background-color: transparent;
}
</style>
