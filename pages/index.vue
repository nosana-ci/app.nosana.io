<template>
  <section class="section">
    <div class="container">
      <nuxt-link to="/repositories/new" class="is-pulled-right button is-accent is-outlined">
        Add new repository
      </nuxt-link>
      <h1 class="title is-4">
        Repositories from <b class="has-text-accent">GitHub</b>
      </h1>

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
                <span class="tag is-success">passed</span>
              </td>
              <td>{{ repository.repository }}</td>
              <td>{{ repository }}</td>
              <td><a :href="'https://github.com/'+ repository.repository" target="_blank" @click.stop>{{ 'https://github.com/'+ repository.repository }}</a></td>
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
      repositories: null
    }
  },
  created () {
    this.getRepositories()
    setInterval(() => {
      console.log('refreshing repositories..')
      this.getRepositories()
    }, 20000)
  },
  methods: {
    async getRepositories () {
      const repositories = await this.$axios.$get(`${process.env.backendUrl}/repositories`)
      this.repositories = repositories
    }
  }
}
</script>

<style lang="scss" scoped>
 td {
   vertical-align: middle;
 }
</style>
