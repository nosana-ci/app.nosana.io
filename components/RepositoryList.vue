<template>
  <div class="table-container">
    <table class="table is-striped is-bordered  is-fullwidth is-hoverable">
      <thead>
        <tr class="has-background-light">
          <th class="py-2 px-5">
            <div class="px-3">
              Status
            </div>
          </th>
          <th class="py-2 px-5">
            <div class="px-3">
              Repository
            </div>
          </th>
          <th class="py-2 px-5">
            <div class="px-3">
              Commit
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="repository in repositories"
          :key="repository.id"
          class="is-clickable"
          @click="$router.push(`/repositories/${repository.id}`)"
        >
          <td style="max-width: 100px;">
            <div>
              <span
                class="tag is-outlined is-light"
                :class="{'is-success': repository.status !== 'DEACTIVATED' || repository.status !== 'INACTIVE',
                         'is-danger': repository.status === 'DEACTIVATED' || !repository.github_installation_id}"
              >
                <span v-if="!repository.github_installation_id">
                  INACTIVE
                </span>
                <span v-else>
                  {{ repository.status !== 'DEACTIVATED' ?
                    'ACTIVE' : repository.status }}
                </span>
              </span>
            </div>
          </td>

          <td>
            <div>
              {{ repository.repository }}
            </div>
          </td>
          <td>
            <div
              v-if="repository.jobs"
              class="is-flex"
            >
              <div
                v-for="job in repository.jobs.slice().reverse()"
                :key="job.uuid"
                class="mx-1"
                @click.stop=""
              >
                <nuxt-link :to="`/jobs/${job.uuid}`">
                  <job-status
                    v-if="job.job"
                    :status="job.status"
                    class="has-tooltip-arrow"
                    :data-tooltip="job.uuid.substring(0,7)"
                  />
                </nuxt-link>
              </div>
            </div>
            <div v-else>
              No jobs yet..
            </div>
          </td>
        </tr>
        <tr v-if="!repositories || !repositories.length" class="has-text-centered has-text-weight-bold">
          <td v-if="!repositories" colspan="4">
            Loading repositories...
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
