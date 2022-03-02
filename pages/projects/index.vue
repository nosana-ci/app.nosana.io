<template>
  <section class="section">
    <div class="container">
      <div class="columns">
        <div class="column is-4">
          <h1 class="title is-4">
            Projects on <b class="has-text-accent">TestNet</b>
          </h1>
        </div>
      </div>
      <div v-if="projects" class="columns is-multiline mt-4">
        <div v-for="project in projects" :key="project.id" class="column is-6 is-one-fifth-fullhd is-3-widescreen is-4-desktop">
          <a class="box has-background-white is-clickable" @click="$router.push('/projects/'+project.id)">
            <div class="is-flex is-align-items-flex-start is-justify-content-flex-start">
              <img style="height: 32px" :src="project.image" class="mr-4">
              <div>
                <h2 class="title is-5 has-text-weight-semibold">
                  {{ project.name }}
                </h2>
                <h2 class="subtitle is-6 mb-0">
                  {{ project.email }}
                </h2>
                <p class="is-size-7">
                  {{ project.description }}
                </p>
              </div>
            </div>

            <div class="mt-2">
              Repositories:
              <span v-if="repositories">
                {{ repositories.filter(r => r.user_id === project.id).length }}
                <div v-if="!commits">
                  Loading..
                </div>
                <div v-else-if="!repositories.filter(r => r.user_id === project.id).map(r => r.commits).flat().length">
                  no pipelines
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
                    <nuxt-link :to="`/jobs/${commit.id}`" class="has-tooltip-arrow" :data-tooltip="commit.commit.substring(0,7)">
                      <commit-status :status="commit.status" />
                    </nuxt-link>
                  </div>
                </div>
              </span>
              <span v-else>Loading..</span>
            </div>
          </a>
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
      projects: null,
      user: null
    }
  },
  computed: {
    loggedIn () {
      return this.$sol && this.$sol.token
    }
  },
  watch: {
    '$sol.token' (token) {
      if (token) {
        this.getUser()
      }
    }
  },
  created () {
    this.getRepositories()
    this.getProjects()
    if (this.$sol && this.$sol.token) {
      this.getUser()
    }
    // setInterval(() => {
    //   console.log('refreshing repositories..')
    //   this.getRepositories()
    // }, 20000)
  },
  methods: {
    async getUser () {
      try {
        const user = await this.$axios.$get(`${process.env.backendUrl}/user`)
        this.name = user.name
        this.description = user.description
        this.image = user.image
        this.user = user
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
 .step {
   min-height: 160px;
 }
</style>
