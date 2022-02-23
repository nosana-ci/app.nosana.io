<template>
  <section class="section">
    <div class="container">
      <div class="columns">
        <div class="column is-4">
          <h1 class="title is-4">
            Projects on <b class="has-text-accent">TestNet</b>
          </h1>
          <p class="has-limited-width-small">
            Below you can find open-source repositories of projects that are running their pipelines on the Nosana TestNet
          </p>
        </div>
        <div class="column is-8">
          <div class="columns">
            <div class="column is-one-third">
              <a class="box is-secondary step" :class="{'has-background-white': loggedIn}" @click="$sol.loginModal = true">
                <div class="is-flex is-justify-content-space-between">
                  <div>1</div>
                  <div v-if="loggedIn">
                    <img :src="require('@/assets/img/icons/done.svg')">
                  </div>
                  <div v-else>
                    <img :src="require('@/assets/img/icons/pending.svg')">
                  </div>
                </div>
                <div class="has-text-centered my-2">
                  <img src="~assets/img/icons/wallet.svg">
                  <p>Connect Wallet</p>
                </div>
              </a>
            </div>
            <div class="column is-one-third">
              <nuxt-link class="box is-secondary step" :class="{'has-background-white': user && repositories && repositories.filter(r => r.user_id === user.user_id).length, 'disabled': !loggedIn}" to="/repositories/new">
                <div class="is-flex is-justify-content-space-between">
                  <div>2</div>
                  <div v-if="user && repositories && repositories.filter(r => r.user_id === user.user_id).length">
                    <img :src="require('@/assets/img/icons/done.svg')">
                  </div>
                  <div v-else>
                    <img :src="require('@/assets/img/icons/pending.svg')">
                  </div>
                </div>
                <div class="has-text-centered my-2">
                  <img v-if="loggedIn" src="~assets/img/icons/repository.svg">
                  <img v-else src="~assets/img/icons/repository_grey.svg">
                  <p>Add Repository</p>
                </div>
              </nuxt-link>
            </div>
            <div class="column is-one-third">
              <nuxt-link class="box is-secondary step" :class="{'has-background-white': user && repositories && repositories.filter(r => r.user_id === user.user_id).length, 'disabled': !(loggedIn && user && repositories && repositories.filter(r => r.user_id === user.user_id).length)}" to="/account?edit=true">
                <div class="is-flex is-justify-content-space-between">
                  <div>3</div>
                  <div v-if="user && user.isApproved">
                    <img :src="require('@/assets/img/icons/done.svg')">
                  </div>
                  <div v-else-if="user && user.name">
                    <img :src="require('@/assets/img/icons/running.svg')">
                  </div>
                  <div v-else>
                    <img :src="require('@/assets/img/icons/pending.svg')">
                  </div>
                </div>
                <div class="has-text-centered my-2">
                  <img v-if="loggedIn && user && repositories && repositories.filter(r => r.user_id === user.user_id).length" src="~assets/img/icons/project.svg">
                  <img v-else src="~assets/img/icons/project_grey.svg">
                  <p>Request Funds</p>
                </div>
              </nuxt-link>
            </div>
          </div>
        </div>
      </div>
      <div class="is-flex is-justify-content-space-between has-background-secondary columns p-2">
        <div style="max-width: 100%; width: 400px">
          <input v-model="search" class="input" placeholder="search repositories">
        </div>
        <nuxt-link to="/repositories/new" class="button is-accent is-small has-text-white">
          + Add new repository
        </nuxt-link>
      </div>
      <div v-if="repositories" class="columns is-multiline mt-4 has-background-secondary">
        <div v-if="!filteredRepositories.length" class="has-text-centered subtitle">
          No repositories found
        </div>
        <div v-for="repository in filteredRepositories" :key="repository.id" class="column is-6 is-3-fullhd is-3-widescreen is-4-desktop">
          <a class="box has-background-white is-clickable" @click="$router.push('/repositories/'+repository.id)">
            <div class="is-flex is-align-items-flex-start is-justify-content-flex-start">
              <div class="project-icon mr-4">
                <img v-if="projects && projects.find(p => repository.user_id === p.id)" style="height: 32px" :src="projects.find(p => repository.user_id === p.id).image">
              </div>
              <div>
                <h2 class="title is-6 has-text-weight-semibold" style="min-height: 36px">
                  {{ repository.repository }}
                </h2>
                <h2 class="subtitle is-6 mb-1">
                  <span v-if="projects && projects.find(p => repository.user_id === p.id)">{{ projects.find(p => repository.user_id === p.id).name }}</span>

                </h2>
                <p class="is-size-7 has-overflow-ellipses" style="height: 40px;">
                  <span v-if="projects && projects.find(p => repository.user_id === p.id)">{{ projects.find(p => repository.user_id === p.id).description }}</span>
                </p>
              </div>
            </div>

            <div class="mt-2">
              <span v-if="repositories">
                <div v-if="!commits">
                  Loading..
                </div>
                <div v-else-if="!repository.commits.length">
                  no pipelines
                </div>
                <div
                  v-else
                  class="is-flex is-align-items-flex-end"
                >
                  <div class="mr-2">
                    <div
                      class="tag is-small"
                      :class="{
                        'is-success': repository.commits.slice(-1)[0].status === 'COMPLETED',
                        'is-info': repository.commits.slice(-1)[0].status === 'RUNNING',
                        'is-danger': repository.commits.slice(-1)[0].status === 'FAILED'
                      }"
                    >{{ repository.commits.slice(-1)[0].status }}</div>
                    <div class="is-size-7">
                      {{ $moment(repository.commits.slice(-1)[0].created_at ).fromNow() }}
                    </div>
                  </div>
                  <div
                    v-for="commit in repository.commits.slice(-6)"
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
      user: null,
      search: null
    }
  },
  computed: {
    loggedIn () {
      return this.$sol && this.$sol.token
    },
    filteredRepositories () {
      let filteredRepositories = this.repositories
      // Search campaigns
      if (filteredRepositories && this.search !== null && this.projects) {
        filteredRepositories = filteredRepositories.filter((r) => {
          const project = this.projects.find(p => p.id === r.user_id)
          return r.repository.toLowerCase().includes(this.search.toLowerCase()) ||
            (project && project.name && project.name.toLowerCase().includes(this.search.toLowerCase()))
        })
      }

      return filteredRepositories
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
.project-icon {
border-radius: 100%;
background: $secondary;
display:flex;
justify-content: center;
min-width: 75px;
height: 75px;
align-items: center;
border: 1px solid grey;
}
.step {
   min-height: 160px;
 }
</style>
