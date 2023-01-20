<template>
  <section class="section">
    <div class="container">
      <nuxt-link :to="`/pipelines`">
        <i class="fas fa-chevron-left" /> Back
      </nuxt-link>
      <div class="is-flex">
        <div>
          <h2 class="title mb-1">
            Your Global Secrets
          </h2>
        </div>
        <nuxt-link
          class="button is-accent is-small"
          style="margin-left: auto"
          :to="`/secrets/new`"
        >
          New secret
        </nuxt-link>
      </div>
      <div v-if="!loggedInSecretManager" class="mt-3">
        <button
          class="button is-accent is-fullwidth mt-5 has-text-weight-semibold"
          @click.stop.prevent="login"
        >
          Login to Secret Manager
        </button>
      </div>
      <div v-else class="mt-5">
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
                {{ key }}
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
    </div>
    <!-- Edit popup -->
    <div class="modal" :class="{ 'is-active': editPopup }">
      <div
        class="modal-background"
        @click="editPopup = false, selectedSecret = {}"
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
              <label class="label">Secret</label>
              <div class="control">
                <textarea
                  v-model="selectedSecret[Object.keys(selectedSecret)[0]]"
                  class="textarea"
                  placeholder="Secret value"
                  required
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            class="button is-accent is-fullwidth mt-5 has-text-weight-semibold"
          >
            Save
          </button>
        </form>
        <div v-else>
          Could not find secret
        </div>
      </div>
      <button
        class="modal-close is-large"
        aria-label="close"
        @click="editPopup = false, selectedSecret = {}"
      />
    </div>
  </section>
</template>

<script>
// import { PublicKey } from '@solana/web3.js';
import axios from 'axios';
function filterObject (obj, callback) {
  return Object.fromEntries(Object.entries(obj)
    .filter(([key, val]) => callback(val, key)));
}
const secretApi = axios.create({
  baseURL: process.env.NUXT_ENV_SECRET_MANAGER_URL
});

export default {
  middleware: 'auth',
  data () {
    return {
      secrets: {},
      newSecretValue: null,
      newSecretKey: null,
      loggedInSecretManager: false,
      editPopup: false,
      selectedSecret: {}
    };
  },
  created () {
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
          text: 'Successfully removed secret',
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
      const response = await this.$axios.$get('/user/secrets');
      this.$store.dispatch('secretsToken/addToken', response.token);
    },
    async getSecrets () {
      const response = await secretApi.get('/secrets');
      this.secrets = filterObject(response.data, (val, key) => {
        const regex = /^[a-z,0-9,-]{36,36}$/;
        const uuid = key.split('_')[0];
        return !regex.test(uuid);
      });
    },
    async editSecret () {
      try {
        await secretApi.post('/secrets', {
          secrets: this.selectedSecret
        });
        this.selectedSecret = {};
        this.editPopup = false;
        this.$modal.show({
          color: 'success',
          text: 'Successfully saved secret',
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
