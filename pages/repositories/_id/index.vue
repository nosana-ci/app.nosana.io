<template>
  <section class="section">
    <div class="container">
      <nuxt-link v-if="repository" to="/">
        <i class="fas fa-chevron-left" /> All repositories
      </nuxt-link>
      <div class="mt-2">
        <div v-if="repository">
          <div class="is-flex is-align-items-center mb-2">
            <h2 class="title mb-0 mr-2">
              {{ repository.repository }}
            </h2>
            <nuxt-link v-if="repository && user && (repository.user_id === user.id || user.roles.includes('admin'))" class="button is-outlined is-accent is-small" style="margin-left: auto" :to="`/repositories/${id}/edit`">
              edit
            </nuxt-link>
          </div>
          <p>
            <a :href="'https://github.com/'+ repository.repository" target="_blank" @click.stop>https://github.com/{{ repository.repository }}</a>
          </p>
          <p>
            <span class="has-tooltip-arrow" :class="{'has-tooltip': repository.secret}" :data-tooltip="repository.secret ? ('Github Webhook:\n' + backendUrl + '/webhook/github/' + repository.secret) : null" @click.stop="repository.secret ? copyToClipboard(backendUrl + '/webhook/github/' + repository.secret) : null">Trigger on commit to {{ repository.branches }} branch(es)</span>
          </p>
          <p>
            Pipeline price: <b class="has-text-accent">{{ repository.job_price/1e6 }} NOS</b>
          </p>
          <p class="is-size-7">
            <a @click="showPipeline = !showPipeline"><span v-if="showPipeline">Hide</span><span v-else>Show</span> pipeline</a>
          </p>
          <div v-if="repository && showPipeline">
            <editor v-model="repository.pipeline" :readonly="true" />
          </div>
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
              <th>Created</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="commit in commits" :key="commit.id" class="is-clickable" @click="$router.push(`/jobs/${commit.id}`)">
              <td> {{ commit.id }}</td>
              <td>{{ commit.payload.message.split('\n')[0] }}</td>
              <td><a :href="commit.payload.url" target="_blank" @click.stop>{{ commit.commit }}</a></td>
              <td>{{ $moment(commit.created_at ).fromNow() }}</td>
              <td class="py-4">
                <div
                  class="tag is-small"
                  :class="{
                    'is-accent': commit.status === 'COMPLETED',
                    'is-info': commit.status === 'RUNNING',
                    'is-warning': commit.status === 'QUEUED',
                    'is-danger': commit.status === 'FAILED'
                  }"
                >
                  {{ commit.status }}
                </div>
              </td>
            </tr>
            <tr v-if="!commits || !commits.length" class="has-text-centered has-text-weight-bold">
              <td v-if="!commits" colspan="5">
                Loading commits..
              </td>
              <td v-else colspan="5">
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
      showPipeline: true,
      commits: null,
      repository: null,
      project: null,
      id: this.$route.params.id,
      user: null,
      backendUrl: process.env.NUXT_ENV_BACKEND_URL
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
    this.getCommits()
    this.getRepository()
    if (this.$sol && this.$sol.token) {
      this.getUser()
    }
    // setInterval(() => {
    //   console.log('refreshing repositories..')
    //   this.getCommits()
    // }, 20000)
  },
  methods: {
    copyToClipboard (content) {
      navigator.clipboard.writeText(content).then(() => {
        alert('Webhook URL copied!')
      })
    },
    async getUser () {
      try {
        const user = await this.$axios.$get('/user')
        this.user = user
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
        const commits = await this.$axios.$get(`/repositories/${this.id}/commits`)
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
        this.repository = await this.$axios.$get(`/repositories/${this.id}`)
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
