<template>
  <section class="section py-4">
    <div class="container">
      <nuxt-link :to="`/repositories/${id}`" class="has-text-accent has-text-weight-semibold">
        <i class="fas fa-chevron-left" /> Cancel
      </nuxt-link>
      <div class="mt-2">
        <div class="is-flex-desktop is-align-items-flex-start is-justify-content-space-between mb-4">
          <div v-if="repository">
            <h2 class="title mb-1 mr-2">
              {{ repository.repository }}
            </h2>
            <p class="is-size-7 mb-3">
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
        <div v-if="branches && !pipelineEditor && !loading">
          Choose the branch where you want to edit the pipeline.<br>
          <div class="select mb-1 mt-2">
            <select
              v-model="editBranch"
              required
              @change="changeBranch"
            >
              <option
                v-for="branch in branches"
                :key="branch.name"
                :selected="branch.name === defaultBranch"
                :value="branch.name"
              >
                {{ branch.name }} <span v-if="branch.name === defaultBranch">(Default)</span>
              </option>
            </select>
          </div>
        </div>
        <form v-if="(repository && !loading && (pipeline || pipelineEditor))" @submit.prevent="edit">
          <div class="columns">
            <div class="column is-9">
              <div v-if="canEdit && useTemplate && readme(useTemplate)" class="mb-5">
                <div class="box has-background-white">
                  <span class="is-size-7 has-text-grey pb-5">README.md</span><br>
                  <div
                    ref="readme"
                    class="py-4 px-5 readme"
                    :class="{'expanded': expand}"
                    v-html="readme(useTemplate)"
                  />
                  <div class="fade has-text-centered" :class="{'expanded': expand}">
                    <span v-if="!expand" @click="expand = !expand">Expand <i class="fa-solid fa-chevron-down" /></span>
                    <span v-else @click="expand = !expand">Collapse <i class="fa-solid fa-chevron-up" /></span>
                  </div>
                </div>
              </div>
              <code-editor
                v-model="pipeline"
                :highlight-lines="validation.errorLines"
                :readonly="!canEdit"
                :max-height="true"
                class="py-3 pt-2 code-editor mb-6"
              />
              <br>
            </div>
            <div v-if="canEdit" class="control column is-3 px-5">
              <h3 class="subtitle has-text-weight-semibold is-size-4 mb-3">
                Commit changes
              </h3>
              <div v-if="branches && pipelineEditor">
                <p class="is-size-7">
                  Choose the branch where you want to edit the pipeline.
                </p>
                <div class="select mb-2 mt-2" style="width: 100%;">
                  <select
                    v-model="editBranch"
                    required
                    style="width: 100%;"
                    @change="changeBranch"
                  >
                    <option
                      v-for="branch in branches"
                      :key="branch.name"
                      :selected="branch.name === defaultBranch"
                      :value="branch.name"
                    >
                      {{ branch.name }} <span v-if="branch.name === defaultBranch">(Default)</span>
                    </option>
                  </select>
                </div>
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
                Commit the changes
              </button>
              <nuxt-link :to="`/repositories/${id}`" class="button is-outlined is-fullwidth">
                Cancel the changes
              </nuxt-link>
              <div
                v-if="validation.valid === false
                  && validation.errors.length > 0"
                class="notification is-danger is-light is-size-7 p-3 px-4 mt-4"
              >
                <p class="is-size-6 has-text-weight-semibold">
                  Pipeline syntax error
                </p>
                <p v-for="error in validation.errors" :key="error">
                  <!-- {{ error }} -->
                  -
                  <span v-if="validation.errors">
                    {{ error.instancePath }}
                    {{ error.message }}
                    <span v-if="error.keyword === 'additionalProperties'">
                      : {{ error.params.additionalProperty }}
                    </span>
                  </span>
                </p>
              </div>
            </div>
          </div>
        </form>
        <div v-else-if="(loading || !repository)">
          Loading...
        </div>
        <div v-else-if="(repository && !pipeline && !pipelineEditor && canEdit)">
          <h2 class="title is-4 mb-1 mt-5">
            Set up your pipeline
          </h2>
          <p>
            Select a template to get started or start with
            <a
              href="#"
              @click.prevent="(pipelineEditor = true, pipeline = templates.find(t => t.name === 'Blank').template)"
            >a blank template.</a>
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
                <button
                  class="button is-accent is-small mt-2"
                  @click="(pipeline = template.template, useTemplate = template.id)"
                >
                  Use this template
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { validateYaml, parseYaml } from '@nosana/schema-validator';
import { marked } from 'marked';

export default {
  beforeRouteLeave (to, from, next) {
    if (!this.savedPipeline) {
      if (this.confirmStay()) {
        next(false);
      } else {
        next();
      }
    } else {
      next();
    }
  },
  data () {
    return {
      previousEditBranch: null,
      editBranch: null,
      id: this.$route.params.id,
      repository: null,
      user: null,
      activeTab: 'pipeline',
      pipeline: null,
      loading: false,
      commitMessage: null,
      branches: null,
      defaultBranch: null,
      templates: null,
      saving: false,
      validation: {
        valid: null,
        errors: null,
        errorLines: []
      },
      pipelineEditor: null,
      pipelineBeforeEdit: null,
      savedPipeline: false,
      readmeMD: null,
      useTemplate: false,
      expand: false
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
    // this.getPipeline();
    this.getBranches();
  },
  mounted () {
    window.addEventListener('beforeunload', this.beforeWindowUnload);
  },
  beforeDestroy () {
    window.removeEventListener('beforeunload', this.beforeWindowUnload);
  },
  methods: {
    async edit () {
      try {
        this.saving = true;
        const pipeline = parseYaml(this.pipeline);
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
          branch: this.editBranch
        });
        setTimeout(() => {
          this.saving = false;
          this.savedPipeline = true;
          this.$modal.show({
            color: 'success',
            title: 'Saved!',
            text: 'Successfully updated repository.',
            image: 'icons/saved.svg',
            onConfirm: () => {
              this.$router.push(`/repositories/${this.id}`);
            }
          });
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
    async getPipeline (branch) {
      try {
        this.loading = true;
        this.pipeline = await this.$axios.$get(`/repositories/${this.id}/pipeline?branch=${branch}`);
        this.pipelineBeforeEdit = this.pipeline;
        // this.pipeline = await null;
        this.loading = false;
      } catch (error) {
        this.pipelineBeforeEdit = null;
        this.pipeline = null;
        this.loading = false;
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
        this.defaultBranch = result.default_branch;
        this.branches = result.branches;
        this.editBranch = this.defaultBranch;
        await this.getPipeline(this.editBranch);
        this.loading = false;
      } catch (error) {
        this.$router.push(`/repositories/${this.id}`);
        this.$modal.show({
          color: 'danger',
          text: 'Cannot get all repository info.\nProbably because there\'s something wrong with the Github Connection.',
          title: 'Error'
        });
      }
    },
    confirmLeave () {
      return window.confirm('Do you really want to leave? You have unsaved changes!');
    },

    confirmStay () {
      return this.pipeline !== this.pipelineBeforeEdit && !this.confirmLeave();
    },

    beforeWindowUnload (e) {
      if (!this.savedPipeline) {
        if (this.confirmStay()) {
        // Cancel the event
          e.preventDefault();
          // Chrome requires returnValue to be set
          e.returnValue = '';
        }
      }
    },
    readme (id) {
      const template = this.templates.find(t => t.id === parseInt(id)).readme;
      if (template) {
        return marked(template);
      }
      return null;
    },
    changeBranch (event) {
      if (!this.savedPipeline) {
        if (!this.confirmStay()) {
          this.editBranch = event.target.value;
          this.getPipeline(this.editBranch); this.pipelineEditor = false; this.useTemplate = false;
        } else {
          // stay
          this.editBranch = this.previousEditBranch;
        }
      } else {
        this.editBranch = event.target.value;
        this.getPipeline(this.editBranch); this.pipelineEditor = false; this.useTemplate = false;
      }
      this.previousEditBranch = this.editBranch;
    }
  }
};
</script>
<style scoped lang="scss">
.code-editor {
  max-height: 600px;
}

.readme {
  max-height: 200px;
  overflow: hidden;
  &.expanded {
    max-height: none;
  }
  ::v-deep p {
    margin-bottom: .5rem;
    font-size: .9rem;
  }
  ::v-deep h1, h2, h3, h4 {
    font-weight: bold;
  }
  ::v-deep h1 {
    font-size: 1.5rem;
    border-bottom: $dark solid 1px;
    margin-bottom: .8rem;
    padding-bottom: .5rem;
  }
}

.fade {
  border-radius: 15px;
  transition: all 0.2 ease;
  background: linear-gradient(0deg, rgba(252,252,252,1) 10%, rgba(10,10,10,0) 100%);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 15px;
  span {
    font-size: .9rem;
    cursor: pointer;
    i {
      font-size: .8rem;
    }
  }
  &.expanded {
    position: relative;
    background: none;
    height: auto;
    padding-bottom: 0px;
  }
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
  .notification {

    word-wrap: break-word;

  }
</style>
