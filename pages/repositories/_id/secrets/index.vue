<template>
  <section class="section py-4">
    <div class="container">
      <nuxt-link :to="`/repositories/${id}`" class="has-text-accent has-text-weight-semibold">
        <i class="fas fa-chevron-left" /> Back
      </nuxt-link>
      <div v-if="repository" class="mt-2">
        <div class="is-flex-desktop is-align-items-flex-start is-justify-content-space-between mb-4">
          <div>
            <h2 class="title mb-1">
              Secrets
            </h2>
            <p class="is-size-7">
              <a :href="'https://github.com/'+ repository.repository" target="_blank" @click.stop>https://github.com/{{ repository.repository }}</a>
            </p>
          </div>
          <div class="buttons">
            <nuxt-link :to="`/repositories/${id}/pipeline`" class="button is-accent px-5 is-outlined">
              Pipeline
            </nuxt-link>
            <nuxt-link :to="`/repositories/${id}/secrets`" class="button is-accent px-5">
              Secrets
            </nuxt-link>
            <nuxt-link :to="`/repositories/${id}/edit`" class="button is-accent px-5 is-outlined">
              Settings
            </nuxt-link>
          </div>
        </div>
        <nuxt-link
          v-if="repository && user && (repository.user_id === user.user_id) && loggedInSecretManager"
          class="button is-accent is-small"
          style="margin-left: auto"
          :to="`/repositories/${id}/secrets/new`"
        >
          New secret
        </nuxt-link>
      </div>
      <p v-if="!loggedInSecretManager" class="mt-3">
        Login to the secret manager to manage your repository secrets.
      </p>
      <div v-if="!loggedInSecretManager">
        <button
          class="button is-accent is-widest mt-5 has-text-weight-semibold"
          @click.stop.prevent="login"
        >
          Login to secret manager
        </button>
      </div>
      <div v-else-if="repository" class="mt-5">
        <table class="table is-striped has-radius">
          <thead>
            <tr>
              <th class="py-3 px-4">
                Repository secrets
              </th>
              <th class="is-size-7 py-2 px-3" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="value, key in secrets"
              :key="key"
              class="p-5 market-row"
            >
              <td class="px-4 py-3">
                {{ key.replace(id+"_","") }}
              </td>
              <td class="py-3 px-5" style="text-align: right;">
                <i class="fas fa-edit px-2" @click="openEditPopup(key, value)" />
                <i class="fas fa-trash" @click="removeSecretConfirm(key)" />
              </td>
            </tr>
            <tr v-if="Object.keys(secrets).length === 0">
              <td class="px-4 py-3 has-text-grey">
                No secrets found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>
        Loading...
      </div>
    </div>
    <!-- Edit popup -->
    <div class="modal" :class="{ 'is-active': editPopup }">
      <div
        class="modal-background"
        @click="closeModal"
      />
      <div class="modal-content has-background-white has-radius-medium p-5">
        <h3 class="has-text-centered subtitle is-4 has-text-weight-semibold">
          Edit secret
        </h3>
        <form v-if="selectedSecret" @submit.prevent="editSecret">
          <div
            class="mt-5 has-radius-medium has-background-grey-lighter m-0 p-5"
          >
            <div class="field">
              <label class="label">Name</label>
              <div class="control">
                <input
                  v-model="Object.keys(selectedSecret)[0]"
                  readonly
                  disabled
                  class="input"
                  type="text"
                  placeholder="Secret name"
                  required
                >
              </div>
            </div>
            <div class="field">
              <label class="label">Secret
                <button
                  class="button is-small is-light ml-2"
                  @click.prevent="hideSecretToggle = !hideSecretToggle"
                >
                  <span class="icon is-small">
                    <i v-if="hideSecretToggle" class="fas fa-eye small" />
                    <i v-else class="fas fa-eye-slash small" />
                  </span>
                </button>
              </label>
              <div class="control">
                <textarea
                  v-if="!hideSecretToggle"
                  v-model="selectedSecret[Object.keys(selectedSecret)[0]]"
                  type="password"
                  class="textarea"
                  placeholder="Secret value"
                  :disabled="hideSecretToggle"
                  required
                />
                <textarea
                  v-else
                  v-model="obfuscateText"
                  type="text"
                  class="textarea"
                  placeholder="Secret value"
                  :disabled="hideSecretToggle"
                  required
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            class="button is-accent is-fullwidth mt-5 has-text-weight-semibold"
            :disabled="hideSecretToggle"
          >
            Save
          </button>
        </form>
        <div v-else>
          Could not find the secret
        </div>
      </div>
      <button
        class="modal-close is-large"
        aria-label="close"
        @click="closeModal"
      />
    </div>
  </section>
</template>

<script>
// import { PublicKey } from '@solana/web3.js';
import axios from 'axios';
console.log(process.env.NUXT_ENV_SECRET_MANAGER_URL);
const secretApi = axios.create({
  baseURL: process.env.NUXT_ENV_SECRET_MANAGER_URL
});

export default {
  middleware: 'auth',
  data () {
    return {
      id: this.$route.params.id,
      repository: null,
      user: null,
      secrets: {},
      newSecretValue: null,
      newSecretKey: null,
      loggedInSecretManager: false,
      editPopup: false,
      selectedSecret: {},
      hideSecretToggle: true
    };
  },
  computed: {
    obfuscateText () {
      const secret = this.selectedSecret[Object.keys(this.selectedSecret)[0]];
      if (secret) {
        return secret.replace(/./g, '●');
      } else {
        return '';
      }
    }
  },
  created () {
    this.getUser();
    this.checkToken();
  },
  methods: {
    openEditPopup (key, value) {
      this.editPopup = true;
      this.$set(this.selectedSecret, key, value);
    },
    removeSecretConfirm (key) {
      this.$modal.show({
        color: 'danger',
        title: 'Are you sure you want to remove this secret?',
        onConfirm: () => {
          this.removeSecret(key);
        }
      });
    },
    async removeSecret (key) {
      try {
        await secretApi.delete('/secrets', {
          data: {
            key
          }
        });
        this.$modal.show({
          color: 'success',
          text: 'Secret successfully removed',
          title: 'Removed!',
          persistent: true,
          cancel: false,
          onConfirm: () => {
            this.getSecrets();
          }
        });
      } catch (error) {
        console.error(error);
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    async login () {
      // const timestamp = Math.floor(+new Date() / 1000);
      // const signature = await this.$sol.sign(timestamp, 'nosana_secret');
      // const response = await secretApi.post('/login', {
      //   address: this.publicKey,
      //   signature: bs58.encode(signature.data),
      //   timestamp
      // });
      const response = await this.$axios.$get('/user/secrets');
      this.$store.dispatch('secretsToken/addToken', response.token);
    },
    async getSecrets () {
      const prefix = this.id + '_';
      const response = await secretApi.get('/secrets?prefix=' + prefix);
      this.secrets = response.data;
    },
    async editSecret () {
      try {
        await secretApi.post('/secrets', {
          secrets: this.selectedSecret
        });
        this.closeModal();
        this.$modal.show({
          color: 'success',
          text: 'Successfully saved the secret',
          title: 'Saved!',
          persistent: true,
          cancel: false,
          onConfirm: () => {
            this.getSecrets();
          }
        });
      } catch (error) {
        this.selectedSecret = {};
        this.editPopup = false;
        console.error(error);
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    async getUser () {
      try {
        const user = await this.$axios.$get('/user');
        this.user = user;
        await this.getRepository();
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
      if (!this.user || !this.repository || ((!this.user.roles || !this.user.roles.includes('admin')) && !this.user.user_id === this.repository.user_id)) {
        this.$router.push(`/repositories/${this.id}`);
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
    async checkToken () {
      const token = this.$store.state.secretsToken.token;
      if (!token) {
        console.log('Theres no token, need to sign');
        await this.login();
      } else {
        const currentTime = Date.now() / 1000;
        const tokenParts = token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));

        if (payload.exp < currentTime || !this.$store.state.secretsToken.token) {
          console.log('Token expired, need to sign');
          await this.login();
        } else {
          console.log('Token still valid');
        }
      }

      secretApi.defaults.headers.Authorization = 'Bearer ' + this.$store.state.secretsToken.token;
      this.loggedInSecretManager = true;
      this.getSecrets();
    },
    closeModal () {
      this.selectedSecret = {};
      this.editPopup = false;
      this.hideSecretToggle = true;
    }
  }
};
</script>

<style scoped lang="scss">
table {
  max-width: 600px;
  width: 100%;
  border: 1px solid #F2F5F1;
  td {
    i {
      cursor: pointer;
      &:hover {
        color: $grey-darker;
      }
    }
  }
}
</style>
