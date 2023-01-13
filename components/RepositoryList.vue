<template>
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
        <tr
          v-for="repository in repositories"
          :key="repository.id"
          class="is-clickable"
          @click="$router.push(`/repositories/${repository.id}`)"
        >
          <td class="py-4">
            <span
              class="tag"
              :class="{'is-success': repository.status === 'ACTIVE', 'is-info': repository.status === 'PENDING'}"
            >{{ repository.status }}</span>
          </td>
          <td>{{ repository.repository }}</td>
          <td>
            <span
              class="has-tooltip-arrow"
              :class="{'has-tooltip': repository.secret}"
              :data-tooltip="repository.secret ?
                ('Github Webhook:\n' + backendUrl + '/webhook/github/' + repository.secret) : null"
              @click.stop="repository.secret ?
                copyToClipboard(backendUrl + '/webhook/github/' + repository.secret)
                : $router.push(`/repositories/${repository.id}`)"
            >on commit to {{ repository.branches }} branch(es)</span>
          </td>
          <td>
            <div
              v-if="repository.commits"
              class="is-flex"
            >
              <div
                v-for="commit in repository.commits.slice().reverse()"
                :key="commit.id"
                class="mx-1"
                @click.stop=""
              >
                <nuxt-link :to="`/jobs/${commit.id}`">
                  <commit-status
                    :status="commit.status"
                    class="has-tooltip-arrow"
                    :data-tooltip="commit.commit.substring(0,7)"
                  />
                </nuxt-link>
              </div>
            </div>
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
</template>
<script>
export default {
  props: {
    repositories: {
      type: Array,
      default: null
    }
  },
  data () {
    return {
      backendUrl: process.env.NUXT_ENV_BACKEND_URL
    };
  },
  methods: {
    copyToClipboard (content) {
      navigator.clipboard.writeText(content).then(() => {
        alert('Webhook URL copied!');
      });
    }
  }
};
</script>
