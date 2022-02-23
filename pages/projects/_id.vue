<template>
  <section class="section">
    <div class="container">
      <nuxt-link to="/">
        &lt; All repositories
      </nuxt-link>
      <div class="mt-2">
        <div v-if="project">
          <div class="is-flex is-align-items-center">
            <img style="height: 32px" :src="project.image" class="mr-4">
            <h2 class="title">
              {{ project.name }}
            </h2>
          </div>
          <p>
            {{ project.description }}
          </p>
          <small>
            Repositories:
            <span v-if="repositories">
              {{ repositories.filter(r => r.user_id === project.id).length }}
            </span>
            <span v-else>Loading..</span>
          </small>
        </div>
        <div v-else>
          Loading..
        </div>
      </div>

      <repository-list :commits="commits" :repositories="repositories" />
    </div>
  </section>
</template>

<script>
export default {
  data () {
    return {
      repositories: null,
      project: null,
      commits: null
    }
  },
  created () {
    this.getRepositories()
    this.getProject()
    this.getCommits()
    // setInterval(() => {
    //   console.log('refreshing repositories..')
    //   this.getRepositories()
    // }, 20000)
  },
  methods: {
    async getCommits () {
      try {
        const commits = await this.$axios.$get(`${process.env.backendUrl}/commits`)
        this.commits = commits
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        })
      }
    },
    async getRepositories () {
      try {
        const repositories = await this.$axios.$get(`${process.env.backendUrl}/repositories`)
        this.repositories = repositories.filter(r => r.user_id === this.$route.params.id)
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        })
      }
    },
    async getProject () {
      try {
        const projects = await this.$axios.$get(`${process.env.backendUrl}/projects`)
        this.project = projects.find(p => p.id === this.$route.params.id)
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
