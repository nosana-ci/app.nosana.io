<template>
  <section class="section">
    <div class="container">
      <nuxt-link v-if="repository" :to="`/projects/${repository.user_id}`">
        &lt; Back to repositories
      </nuxt-link>
      <div class="mt-2">
        <div v-if="repository">
          <div class="is-flex is-align-items-center">
            <h2 class="title">
              {{ repository.repository }}
            </h2>
          </div>
          <p>
            <a :href="'https://github.com/'+ repository.repository" target="_blank" @click.stop>https://github.com/{{ repository.repository }}</a>
          </p>
        </div>
        <div v-else>
          Loading..
        </div>
      </div>

      <div class="table-container">
        <table class="table is-striped is-fullwidth is-hoverable">
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Message</th>
              <th>Commit</th>
              <th>Transaction</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="commit in commits" :key="commit.id" class="is-clickable" @click="$router.push(`/jobs/${commit.id}`)">
              <td> {{ commit.id }}</td>
              <td>{{ commit.payload.message.split('\n')[0] }}</td>
              <td><a :href="commit.payload.url" target="_blank" @click.stop>{{ commit.commit }}</a></td>
              <td>{{ commit.tx }}</td>
              <td class="py-4">
                <span class="tag is-success">{{ commit.status }}</span>
              </td>
            </tr>
            <tr v-if="!commits || !commits.length" class="has-text-centered has-text-weight-bold">
              <td v-if="!commits" colspan="4">
                Loading commits..
              </td>
              <td v-else colspan="4">
                No commits
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
      commits: null,
      repository: null,
      project: null
    }
  },
  created () {
    this.getCommits()
    this.getRepository()
    // setInterval(() => {
    //   console.log('refreshing repositories..')
    //   this.getCommits()
    // }, 20000)
  },
  methods: {
    async getCommits () {
      try {
        const commits = await this.$axios.$get(`${process.env.backendUrl}/repositories/${this.$route.params.id}/commits`)
        this.commits = commits
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        })
      }
    },
    async getRepository () {
      try {
        const repositories = await this.$axios.$get(`${process.env.backendUrl}/repositories`)
        this.repository = repositories.find(r => r.id === this.$route.params.id)
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
 td {
   vertical-align: middle;
 }
</style>
