<template>
  <section class="section">
    <div>
      <div v-if="!loggedIn">
        <h1 class="title has-text-centered">
          Loading..
        </h1>
        <img class="image mx-auto" src="https://nosana.io/img/Nosana_Logomark_black.svg" alt="" srcset="" style="max-height: 200px;">
      </div>
    </div>
  </section>
</template>

<script>
export default {
  layout: 'logged-out',
  data () {
    return {
    };
  },
  computed: {
    loggedIn () {
      return (this.$auth && this.$auth.loggedIn);
    }
  },
  watch: {
    '$auth.loggedIn' (loggedIn) {
      if (loggedIn) {
        this.$router.push('/pipelines');
      }
    }
  },
  mounted () {
    if (this.loggedIn) {
      this.$router.push('/pipelines');
    } else {
      this.$router.push('/login');
    }
  },
  methods: {
  }
};

</script>
