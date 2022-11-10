<template>
  <section class="section">
    <div class="container">
      <nuxt-link :to="`/repositories/${id}`">
        <i class="fas fa-chevron-left" /> Cancel
      </nuxt-link>
      <div v-if="repository" class="is-flex">
        <div>
          <h2 class="title mb-1">
            Secrets for {{ repository.repository }}
          </h2>
          <p>
            <a :href="'https://github.com/'+ repository.repository" target="_blank" @click.stop>https://github.com/{{ repository.repository }}</a>
          </p>
        </div>
        <nuxt-link
          v-if="repository && user && (repository.user_id === user.user_id)"
          class="button is-accent is-small"
          style="margin-left: auto"
          :to="`/repositories/${id}/secrets/new`"
        >
          New secret
        </nuxt-link>
      </div>
      <div v-if="!loggedInSecretManager" class="mt-3">
        <p>Connect your wallet to see your secrets.</p>
        <button
          class="button is-accent is-fullwidth mt-5 has-text-weight-semibold"
          @click.stop.prevent="$sol.loginModal = true"
        >
          Connect Wallet
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
                {{ key }}
              </td>
              <td class="py-3">
                Todo actions
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>
        Loading..
      </div>
    </div>
  </section>
</template>

<script>
import { PublicKey } from '@solana/web3.js';
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
      loggedInSecretManager: false
    };
  },
  computed: {
    publicKey () {
      return this.$sol ? this.$sol.publicKey : null;
    },
    loggedIn () {
      return this.$sol && this.$sol.publicKey;
    }
  },
  watch: {
    '$sol.publicKey': function (pubkey) {
      if (pubkey) {
        this.login();
      }
    }
  },
  created () {
    this.getUser();
    if (this.loggedIn) {
      this.login();
    }
  },
  methods: {
    addSecret () {
      if (this.newSecretKey) {
        this.$set(this.secrets, this.newSecretKey, this.newSecretValue);
        this.newSecretKey = null;
        this.newSecretValue = null;
      }
    },
    async login () {
      const timestamp = Math.floor(+new Date() / 1000);
      const signature = await this.$sol.sign(timestamp, 'nosana_secret');
      const response = await secretApi.post('/login', {
        address: new PublicKey(this.publicKey).toBuffer(),
        signature,
        timestamp
      });
      secretApi.defaults.headers.Authorization = 'Bearer ' + response.data.token;
      this.loggedInSecretManager = true;
      this.getSecrets();
    },
    async getSecrets () {
      const response = await secretApi.get('/secrets');
      this.secrets = response.data;
    },
    async edit () {
      try {
        await secretApi.post('/secrets', {
          secrets: this.secrets
        });
        this.$modal.show({
          color: 'success',
          text: 'Successfully saved secrets',
          title: 'Saved!',
          persistent: true,
          cancel: false,
          onConfirm: () => {
            this.$router.push(`/repositories/${this.id}`);
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
    }
  }
};
</script>

<style scoped lang="scss">
table {
  max-width: 800px;
  width: 100%;
  border: 1px solid #F2F5F1;
}
</style>
