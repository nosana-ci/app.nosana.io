<template>
  <section class="section">
    <div class="container">
      <div v-if="flow">
        <div class="is-flex is-align-items-center">
          <div class="mr-4">
            <nuxt-link to="/" class="has-text-secondary is-size-5">
              <i class="fas fa-chevron-left" />
            </nuxt-link>
          </div>
          <div class="mr-4">
            <span v-if="curFlow === null" class="tag">loading</span>
            <span v-else-if="flow.id === curFlow.id" class="tag is-info">pending</span>
            <span v-else class="tag is-success">passed</span>
          </div>
          <div>Flow <b>#{{ flow.id }}</b> triggered {{ $moment(flow.results.input.commit.committer.date).fromNow() }}</div>
        </div>
        <hr class="my-4">
        <h1 class="title">
          {{ flow.results.input.commit.message.split('\n')[0] }}
        </h1>
        <div class="box">
          <div><i class="fas fa-coins mr-4 has-text-secondary" />Pipeline total cost <b class="has-text-secondary">42.13 NOS<b /></b></div>
          <hr>
          <div><i class="fas fa-server mr-4 has-text-secondary" />Nodes participated: <b>1</b></div>
          <hr>
          <div class="has-overflow-ellipses">
            <i class="fab fa-git mr-4 has-text-secondary" />Commit <a :href="flow.results.input.html_url" target="_blank" @click.stop>{{ flow.results.input.sha }}</a>
          </div>
          <span style="white-space: pre-wrap">{{ flow.results.input.commit.message }}</span>
        </div>
        <div class="tabs is-medium">
          <ul>
            <li :class="{'is-active': tab === 'steps'}">
              <a @click.prevent="tab='steps'">Steps</a>
            </li>
            <li :class="{'is-active': tab === 'logs'}">
              <a @click.prevent="tab='logs'">Logs</a>
            </li>
            <li :class="{'is-active': tab === 'network'}">
              <a @click.prevent="tab='network'">Network</a>
            </li>
          </ul>
        </div>
        <div v-if="tab === 'steps'">
          <div v-for="op in flow.ops" :key="op.id" class="box is-info">
            <div class="is-clickable is-flex is-flex-wrap-wrap is-align-items-center" @click="step !== op.id ? step = op.id : step = null">
              <h3 class="subtitle m-0">
                {{ op.title }}
              </h3>
              <div class="is-size-7 has-overflow-ellipses mr-4" style="margin-left: auto">
                was ran by <a :href="`https://explorer.solana.com/address/${'7E5nsBVPuPoRBsDzVjr2YKFNoqewo2EGitKq7cbhSSp4'}`" target="_blank">7E5nsBVPuPoRBsDzVjr2YKFNoqewo2EGitKq7cbhSSp4</a>
              </div>
              <div>
                <i class="fas fa-chevron-down" :class="{'fa-chevron-up': step === op.id}" />
              </div>
            </div>
            <div v-if="step === op.id">
              <div v-if="op.op === 'nos.git/ensure-repo'">
                <pre>Cloning into {{ flow.results[op.id] }}</pre>
              </div>
              <div v-else-if="op.op === 'sh'">
                <pre v-if="flow.results[op.id]">{{ flow.results[op.id].out }}</pre>
                <div v-else>
                  Op is still pending
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="tab === 'logs'">
          {{ flow }}
        </div>
        <div v-else>
          Coming soon..
        </div>
      </div>
      <div v-else>
        Loading..
      </div>
    </div>
  </section>
</template>

<script>
export default {
  data () {
    return {
      flow: null,
      step: null,
      curFlow: null,
      tab: 'steps'
    }
  },
  created () {
    this.getFlow(this.$route.params.id)
    this.getCurrentFlow()
  },
  methods: {
    async getFlow (id) {
      const flow = await this.$axios.$get(`${process.env.backendUrl}/api/flow/${id}`)
      this.flow = flow
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
