<template>
  <section class="section">
    <div class="container">
      <h1 class="title">
        Nosana Platform
      </h1>
      <div class="table-container">
        <table class="table is-striped is-fullwidth is-hoverable">
          <thead>
            <tr>
              <th>Status</th>
              <th>Flow</th>
              <th>Trigger</th>
              <th>Commit</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="flow in flows" :key="flow.id" class="is-clickable" @click="$router.push('/flows/'+flow.id)">
              <td>
                <span v-if="curFlow === null" class="tag">loading</span>
                <span v-else-if="flow.id === curFlow.id" class="tag is-info">pending</span>
                <span v-else class="tag is-success">passed</span>
              </td>
              <td>{{ flow.title }}</td>
              <td>{{ flow.results.input.commit.message.split('\n')[0] }}</td>
              <td><a :href="flow.results.input.html_url" target="_blank" @click.stop>{{ flow.results.input.sha.substring(0,7) }}</a></td>
            </tr>
            <tr v-if="!flows || !flows.length" class="has-text-centered has-text-weight-bold">
              <td v-if="!flows" colspan="4">
                Loading flows..
              </td>
              <td v-else colspan="4">
                No flows
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  data () {
    return {
      flows: null,
      curFlow: null
    }
  },
  created () {
    this.getFlows()
    this.getCurrentFlow()
  },
  methods: {
    async getFlows () {
      const flows = await this.$axios.$get(`${process.env.backendUrl}/api/flows`)
      this.flows = flows
    },
    async getCurrentFlow () {
      const flow = await this.$axios.$get(`${process.env.backendUrl}/api/cur-flow`)
      this.curFlow = flow
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
