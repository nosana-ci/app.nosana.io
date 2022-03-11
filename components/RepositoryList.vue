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
        <tr v-for="repository in repositories" :key="repository.id" class="is-clickable" @click="$router.push(`/repositories/${repository.id}`)">
          <td class="py-4">
            <span class="tag is-success">{{ repository.status }}</span>
          </td>
          <td><a :href="'https://github.com/'+ repository.repository" target="_blank" @click.stop>{{ repository.repository }}</a></td>
          <td>on commit to main/master branch</td>
          <td>
            <div
              v-if="commits"
              class="is-flex"
            >
              <div
                v-for="commit in commits.filter(c => repository.id === c.repository_id).slice(-6)"
                :key="commit.id"
                class="mx-1"
                @click.stop=""
              >
                <nuxt-link :to="`/jobs/${commit.id}`">
                  <commit-status :status="commit.status" class="has-tooltip-arrow" :data-tooltip="commit.commit.substring(0,7)" />
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
    },
    commits: {
      type: Array,
      default: null
    }
  }
}
</script>
