<template>
  <div class="table-container">
    <table class="table is-striped is-fullwidth is-hoverable">
      <thead>
        <tr class="has-background-light">
          <th class="py-2 px-5">
            Status
          </th>
          <th class="py-2 px-5">
            Repository
          </th>
          <th class="py-2 px-5">
            Commit
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
          <td>
            <div class="p-3">
              <span
                class="tag"
                :class="{'is-success': repository.status === 'ACTIVE', 'is-info': repository.status === 'PENDING'}"
              >{{ repository.status }}</span>
            </div>
          </td>

          <td>
            <div class="p-3">
              {{ repository.repository }}
            </div>
          </td>
          <td>
            <div
              v-if="repository.commits"
              class="is-flex p-3"
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
            <div v-else class="p-3">
              No jobs yet..
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
