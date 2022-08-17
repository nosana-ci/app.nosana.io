<template>
  <section class="section">
    <div class="columns">
      <div class="column is-4">
        <h1 class="title is-4">
          Statistics for <b v-if="network === 'devnet'" class="has-text-accent">DevNet</b>
          <b v-else class="has-text-accent">TestNet</b>
        </h1>
        <p class="has-limited-width-small">
          Below you can find live statistics about the number of commits, jobs, users and repositories
          on the Nosana TestNet
        </p>
      </div>
    </div>
    <div v-if="stats" class="columns is-multiline is-mobile">
      <div
        v-for="(value, stat) in stats"
        :key="stat"
        class="column is-2-widescreen is-one-fifth-desktop is-3-tablet is-6-mobile"
      >
        <div class="box has-text-centered">
          <div class="is-size-7">
            {{ stat.split("_").map((w) => (w[0].toUpperCase() + w.substring(1))).join(" ") }}
          </div>
          <h2
            class="title is-4"
            :class="{
              'has-text-info': stat.includes('running'),
              'has-text-danger': stat.includes('failed'),
              'has-text-warning': stat.includes('queued'),
              'has-text-success': stat.includes('success'),
              'has-text-accent': stat.includes('reward')
            }"
          >
            <ICountUp :end-val="value" /> <small v-if="stat.includes('reward')" class="is-size-6">NOS</small>
          </h2>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import ICountUp from 'vue-countup-v2';

export default {
  components: {
    ICountUp
  },
  data () {
    return {
      stats: null,
      interval: null
    };
  },
  created () {
    this.getStats();
    if (!this.interval) {
      this.interval = setInterval(() => {
        console.log('refreshing stats..');
        this.getStats();
      }, 60000);
    }
  },
  beforeDestroy () {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },
  methods: {
    async getStats () {
      try {
        const stats = await this.$axios.$get('/stats');
        stats.total_jobs_rewards = stats.total_jobs_rewards / 1e6;
        console.log(stats);
        this.stats = stats;
      } catch (error) {
        console.error(error);
      }
    }
  }
};
</script>
