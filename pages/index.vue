<template>
  <section class="section">
    <div class="container">
      <h1 class="title is-4">
        Projects on <b class="has-text-accent">TestNet</b>
      </h1>
      <nuxt-link v-if="loggedIn" to="/repositories/new" class="button is-accent is-outlined">
        Add new repository
      </nuxt-link>
      <div v-if="projects" class="columns is-multiline mt-4">
        <div v-for="project in projects" :key="project.id" class="column is-6 is-one-fifth-fullhd is-3-widescreen is-4-desktop">
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
                <div v-if="!commits">
                  Loading..
                </div>
                <div v-else-if="!repositories.filter(r => r.user_id === project.id).map(r => r.commits).flat().length">
                  no commits
                </div>
                <div
                  v-else
                  class="is-flex"
                >
                  <div
                    v-for="commit in repositories.filter(r => r.user_id === project.id).map(r => r.commits).flat()"
                    :key="commit.id"
                    class="mx-1"
                    @click.stop=""
                  >
                    <nuxt-link :to="`/jobs/${commit.id}`" class="has-tooltip-arrow" :data-tooltip="commit.commit">
                      <commit-status :status="commit.status" />
                    </nuxt-link>
                  </div>
                </div>
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
      commits: null,
      projects: null
    }
  },
  computed: {
    loggedIn () {
      return this.$sol && this.$sol.token
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
        this.getCommits()
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        })
      }
    },
    async getCommits () {
      try {
        const commits = await this.$axios.$get(`${process.env.backendUrl}/commits`)
        this.commits = commits
        for (let i = 0; i < this.repositories.length; i++) {
          this.$set(this.repositories[i], 'commits', commits.filter(c => c.repository_id === this.repositories[i].id))
        }
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
        // this.projects.push(...projects)
        // this.projects.push(...projects)
        // this.projects.push(...projects)
        // this.projects.push(...projects)
        // this.projects.push(...projects)
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
