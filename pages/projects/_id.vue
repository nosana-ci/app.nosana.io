<template>
  <section class="section">
    <div class="container">
      <nuxt-link to="/repositories/new" class="is-pulled-right button is-accent is-outlined">
        Add new repository
      </nuxt-link>
      <nuxt-link to="/">
        &lt; Back to projects
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

      <div class="table-container">
        <table class="table is-striped is-fullwidth is-hoverable">
          <thead>
            <tr>
              <th>Status</th>
              <th>Repository</th>
              <th>Trigger</th>
              <th>Commit</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="repository in repositories" :key="repository.id" class="is-clickable" @click="$router.push('/repositories/'+repository.id)">
              <td class="py-4">
                <span class="tag is-success">{{ repository.status }}</span>
              </td>
              <td><a :href="'https://github.com/'+ repository.repository" target="_blank" @click.stop>{{ repository.repository }}</a></td>
              <td>on commit to main/master branch</td>
              <td>
                <nuxt-link class="button is-accent is-outlined has-text-weight-semibold" :to="$route.params.id + '/jobs'">
                  View Jobs
                </nuxt-link>
              </td>
            </tr>
            <tr v-if="!repositories || !repositories.length" class="has-text-centered has-text-weight-bold">
              <td v-if="!repositories" colspan="4">
                Loading repositories..
              </td>
              <td v-else colspan="4">
                No repositories
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
      repositories: null,
      project: null
    }
  },
  created () {
    this.getRepositories()
    this.getProject()
    // setInterval(() => {
    //   console.log('refreshing repositories..')
    //   this.getRepositories()
    // }, 20000)
  },
  methods: {
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
