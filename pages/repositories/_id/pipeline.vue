<template>
  <section class="section">
    <div class="container">
      <nuxt-link :to="`/repositories/${id}`">
        <i class="fas fa-chevron-left" /> Cancel
      </nuxt-link>
      <div class="mt-2">
        <form v-if="(repository && !loading && pipeline)" @submit.prevent="edit">
          <div class="is-flex is-align-items-center">
            <h2 class="title">
              {{ repository.repository }} Pipeline
            </h2>
          </div>
          <p>
            <a :href="'https://github.com/'+ repository.repository" target="_blank" @click.stop>https://github.com/{{ repository.repository }}</a>
          </p>

          <div class="tabs mt-3">
            <ul>
              <li
                class="px-3"
                :class="{'is-active': activeTab === 'pipeline'}"
                @click="activeTab = 'pipeline'"
              >
                <a class="p-3">Pipeline</a>
              </li>
            </ul>
          </div>
          <div class="columns">
            <div v-if="activeTab === 'pipeline'" class="column is-9">
              <p v-if="canEdit">
                Changes made to your pipeline will be pushed to the <code>.nosana-ci.yml</code>
                in your Github repository.
              </p>
              <code-editor v-model="pipeline" :readonly="!canEdit" class="py-3 pt-4 code-editor" />
            </div>
            <div v-if="canEdit" class="control column is-3 px-5">
              <h3 class="subtitle has-text-weight-semibold is-size-4">
                Commit changes
              </h3>
              <span class="is-size-7">Branch</span>
              <div class="select is-fullwidth mb-1">
                <select v-model="selectedBranch" required>
                  <option
                    v-for="branch in branches"
                    :key="branch.name"
                    :selected="(branch.name === defaultBranch)"
                    :value="branch.name"
                  >
                    {{ branch.name }} <span v-if="branch.name === defaultBranch">(Default)</span>
                  </option>
                </select>
              </div>
              <span class="is-size-7">Commit message (optional)</span>
              <input
                v-model="commitMessage"
                class="input is-fullwidth mb-4"
                type="text"
                placeholder="Update .nosana-ci.yml pipeline"
              >
              <button type="submit" class="button is-accent is-fullwidth mb-2" :disabled="!pipeline">
                Commit changes
              </button>
              <nuxt-link :to="`/repositories/${id}`" class="button is-outlined is-fullwidth">
                Cancel changes
              </nuxt-link>
            </div>
          </div>
        </form>
        <div v-else-if="(loading || !repository)">
          Loading..
        </div>
        <div v-else-if="(repository && !pipeline && canEdit)">
          <h2 class="title is-2 mb-2">
            Setup your <span class="has-text-accent">Nosana pipeline</span>
          </h2>
          <p>
            Select a template to get started or start with
            <!-- TODO: better solution for pipeline = ''-->
            <a
              href="#"
              @click.prevent="(pipeline = ' ')"
            >a blank template</a>
          </p>
          <div class="columns is-multiline mt-4">
            <div
              v-for="template in templates"
              :key="template.name"
              class="column is-4"
            >
              <div class="box has-background-light">
                <div class="is-flex is-justify-content-space-between">
                  <h2 class="is-size-4 has-text-weight-semibold mb-0 has-text-black">
                    {{ template.name }}
                  </h2>
                  <div v-if="template.icon" class="template-icon is-flex has-text-centered has-background-white">
                    <img :src="require(`@/assets/img/icons/${template.icon}`)">
                  </div>
                </div>
                <p>{{ template.description }}</p>
                <button class="button is-accent is-small mt-2" @click="(pipeline = template.template)">
                  Use template
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          Not found
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { parse } from 'yaml';

export default {
  data () {
    return {
      id: this.$route.params.id,
      repository: null,
      user: null,
      activeTab: 'pipeline',
      pipeline: null,
      loading: false,
      commitMessage: null,
      branches: null,
      defaultBranch: null,
      selectedBranch: null,
      templates: null
    };
  },
  computed: {
    canEdit () {
      return this.repository && this.user &&
                  (this.repository.user_id === this.user.user_id || (this.user.roles && this.user.roles.includes('admin')));
    }
  },
  created () {
    this.getUser();
    this.getRepository();
    this.getPipeline();
    this.getBranches();
  },
  methods: {
    async edit () {
      try {
        const pipeline = parse(this.pipeline);
        // TODO: change for nice yaml scheme checker
        if (!pipeline.global) {
          throw new Error('Your yaml does not include a `global` config');
        }
        if (!pipeline.nosana) {
          throw new Error('Your yaml does not include a `nosana` config');
        }
        if (!pipeline.jobs || !Array.isArray(pipeline.jobs) || !pipeline.jobs.length) {
          throw new Error('Your yaml does not include a array `jobs` config');
        }
        if (!pipeline.global.image) {
          throw new Error('Your yaml does not include a `global.image` config');
        }
        if (!pipeline.nosana.description) {
          throw new Error('Your yaml does not include a `nosana.description` config');
        }
        pipeline.jobs.forEach((job, index) => {
          if (!job.name) {
            throw new Error(`Job ${index + 1} does not include a 'name'`);
          }
          if (!job.commands || !Array.isArray(job.commands) || !job.commands.length) {
            throw new Error(`Job ${index + 1} does not include a 'commands' array`);
          }
        });

        await this.$axios.$post(`/repositories/${this.id}`, {
          pipeline: this.pipeline,
          commit_message: this.commitMessage ? this.commitMessage : 'Update .nosana-ci.yml pipeline',
          branch: this.selectedBranch
        });
        this.$modal.show({
          color: 'success',
          text: 'Successfully updated repository',
          title: 'Saved!',
          persistent: true,
          cancel: false,
          onConfirm: () => {
            this.$router.push(`/repositories/${this.id}`);
          }
        });
      } catch (error) {
        console.error(error);
        if (error.name === 'YAMLParseError') {
          this.$modal.show({
            color: 'danger',
            text: error,
            title: 'Could not parse YAML'
          });
        } else {
          this.$modal.show({
            color: 'danger',
            text: error,
            title: 'Could not parse YAML'
          });
        }
      }
    },
    async getUser () {
      try {
        const user = await this.$axios.$get('/user');
        this.user = user;
      } catch (error) {
      }
    },
    async getRepository () {
      try {
        this.repository = await this.$axios.$get(`/repositories/${this.id}`);
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    async getPipeline () {
      try {
        this.loading = true;
        this.pipeline = await this.$axios.$get(`/repositories/${this.id}/pipeline`);
        // this.pipeline = await null;
        this.loading = false;

        if (!this.pipeline) {
          this.templates = await this.$axios.$get('/pipeline-templates');
        }
      } catch (error) {
        if (error.code !== 404) {
          this.$modal.show({
            color: 'danger',
            text: error,
            title: 'Error'
          });
        }
      }
    },
    async getBranches () {
      try {
        this.loading = true;
        const result = await this.$axios.$get(`/repositories/${this.id}/branches`);
        this.branches = result.branches;
        this.defaultBranch = result.default_branch;
        this.selectedBranch = this.defaultBranch;
        this.loading = false;
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    }
  }
};
</script>
<style scoped lang="scss">
  .code-editor {
    max-height: 80vh;
    overflow-y: scroll;
  }

  .template-icon {
    box-shadow: 1px 1px rgba(140,149,159,0.15);
    width: 42px;
    height: 42px;
    border-radius: 50%;
    padding: 7px;
    flex-shrink: 0;
    img {
      object-fit:scale-down;
    }
  }
</style>
