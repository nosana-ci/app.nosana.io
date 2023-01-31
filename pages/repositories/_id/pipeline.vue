<template>
  <section class="section py-4">
    <div class="container">
      <nuxt-link :to="`/repositories/${id}`" class="has-text-accent has-text-weight-semibold">
        <i class="fas fa-chevron-left" /> Cancel
      </nuxt-link>
      <div class="mt-2">
        <form v-if="(repository && !loading && (pipeline || pipelineEditor))" @submit.prevent="edit">
          <div class="is-flex is-align-items-flex-start is-justify-content-space-between mb-4">
            <div>
              <h2 class="title mb-2">
                Pipeline
              </h2>
              <p>
                <a :href="'https://github.com/'+ repository.repository" target="_blank" @click.stop>https://github.com/{{ repository.repository }}</a>
              </p>
            </div>
            <div class="buttons">
              <nuxt-link :to="`/repositories/${id}/pipeline`" class="button is-accent px-5">
                Pipeline
              </nuxt-link>
              <nuxt-link :to="`/repositories/${id}/secrets`" class="button is-accent px-5 is-outlined">
                Secrets
              </nuxt-link>
              <nuxt-link :to="`/repositories/${id}/edit`" class="button is-accent px-5 is-outlined">
                Settings
              </nuxt-link>
            </div>
          </div>

          <div class="columns mt-4">
            <div class="column is-9">
              <p v-if="canEdit">
                Changes made to your pipeline will be pushed to the <code>.nosana-ci.yml</code>
                in your Github repository.
                Learn more about the <a href="https://docs.nosana.io/pipelines/intro.html" target="_blank">Nosana pipeline syntax</a>.
              </p>
              <code-editor
                v-model="pipeline"
                :highlight-lines="validation.errorLines"
                :readonly="!canEdit"
                class="py-3 pt-4 code-editor"
              />
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
              <button
                type="submit"
                class="button is-accent is-fullwidth mb-2"
                :disabled="!pipeline"
                :class="{'is-loading': saving}"
              >
                Commit changes
              </button>
              <nuxt-link :to="`/repositories/${id}`" class="button is-outlined is-fullwidth">
                Cancel changes
              </nuxt-link>
              <div
                v-if="validation.valid === false
                  && validation.errors.length > 0"
                class="notification is-danger is-light is-size-7 p-3 px-4 mt-4"
              >
                <p class="is-size-6 has-text-weight-semibold">
                  Pipeline syntax error
                </p>
                <span v-if="validation.errors">{{ validation.errors[0].message }}</span>
              </div>
            </div>
          </div>
        </form>
        <div v-else-if="(loading || !repository)">
          Loading..
        </div>
        <div v-else-if="(repository && !pipeline && !pipelineEditor && canEdit)">
          <h2 class="title is-2 mb-2">
            Setup your pipeline
          </h2>
          <p>
            Select a template to get started or start with
            <a
              href="#"
              @click.prevent="(pipelineEditor = true)"
            >a blank template</a>
          </p>
          <div class="columns is-multiline mt-4">
            <div
              v-for="template in templates"
              :key="template.name"
              class="column is-4"
            >
              <div class="box has-background-light" style="height: 100%;">
                <div class="is-flex is-justify-content-space-between">
                  <h2 class="is-size-4 has-text-weight-semibold mb-0 has-text-black">
                    {{ template.name }}
                  </h2>
                  <div v-if="template.icon" class="template-icon is-flex has-text-centered has-background-white">
                    <img :src="template.icon">
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
    <!-- TODO: make this in modalpopup component-->
    <div class="modal saved-modal" :class="{'is-active' : successPopup}">
      <div class="modal-background" />
      <div
        class="modal-content has-background-white has-text-centered mx-3 pt-6 pb-5 has-radius-medium
      has-limited-width-small"
      >
        <img
          :src="require(`@/assets/img/icons/saved.svg`)"
        >
        <h3 class="title is-3 mb-3">
          Saved!
        </h3>
        <p>
          Successfully updated repository.
        </p>
        <button class="button is-accent mt-5 is-less-wide mb-3" @click="$router.push(`/repositories/${id}`);">
          OK
        </button>
      </div>
    </div>
  </section>
</template>

<script>
import { validateYaml, parseYaml } from '@nosana/schema-validator';

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
      templates: null,
      saving: false,
      validation: {
        valid: null,
        errors: null,
        errorLines: []
      },
      pipelineEditor: null,
      successPopup: false
    };
  },
  computed: {
    canEdit () {
      return this.repository && this.user &&
                  (this.repository.user_id === this.user.user_id || (this.user.roles && this.user.roles.includes('admin')));
    }
  },
  watch: {
    pipeline (pipeline) {
      if (pipeline) {
        this.pipelineEditor = true;
        try {
          const validated = validateYaml(pipeline);
          this.validation.valid = validated.valid;
          this.validation.errors = validated.errors;
          this.validation.errorLines = [];
          if (validated.errors) {
            for (const err of validated.errors) {
              if (err.linePos) {
                for (const line of err.linePos) {
                  this.validation.errorLines.push(line.line);
                }
              }
            }
          }
        } catch (error) {
          console.error('error', error);
          this.validation.errorLines = [];
          this.validation.valid = false;
          this.validation.errors = [error];
          try {
          // line number is in the error message, so extract it from there
            this.validation.errorLines.push(parseInt((error.message).match(/[0-9]+/)[0]));
          } catch (err) {
            console.log(err);
          }
        }
      }
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
        this.saving = true;
        const pipeline = parseYaml(this.pipeline);
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
        setTimeout(() => {
          this.saving = false;
          this.successPopup = true;
        }, 2000);
      } catch (error) {
        console.error(error);
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Could not save pipeline'
        });
        this.saving = false;
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
      } catch (error) {
        if (error.response?.data?.type !== 'NotFoundError') {
          this.$modal.show({
            color: 'danger',
            text: error,
            title: 'Error'
          });
        }
      }
      if (!this.pipeline) {
        this.templates = await this.$axios.$get('/pipeline-templates');
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
  .notification {

    word-wrap: break-word;

  }
</style>
