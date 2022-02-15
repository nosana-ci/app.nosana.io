<template>
  <section class="section">
    <div class="container">
      <nuxt-link to="/repositories/new" class="is-pulled-right button is-accent is-outlined">
        Add new repository
      </nuxt-link>
      <h1 class="title is-4">
        Projects on <b class="has-text-accent">TestNet</b>
      </h1>
      <div class="columns">
        <div v-for="project in projects" :key="project.id" class="column is-4">
          <div class="box is-clickable" @click="$router.push('/projects/'+project.id)">
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
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  data () {
    return {
      repositories: null,
      projects: null
    }
  },
  created () {
    this.getRepositories()
    this.getProjects()
    // setInterval(() => {
    //   console.log('refreshing repositories..')
    //   this.getRepositories()
    // }, 20000)
  },
  methods: {
    async getRepositories () {
      try {
        const repositories = await this.$axios.$get(`${process.env.backendUrl}/repositories`)
        this.repositories = repositories
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        })
      }
    },
    async getProjects () {
      try {
        const projects = await this.$axios.$get(`${process.env.backendUrl}/projects`)
        this.projects = projects
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
