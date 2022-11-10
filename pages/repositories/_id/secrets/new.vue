<template>
  <section class="section">
    <div class="container">
      <nuxt-link :to="`/repositories/${id}/secrets`">
        <i class="fas fa-chevron-left" /> Cancel
      </nuxt-link>
      <div v-if="repository">
        <div class="is-flex is-align-items-center">
          <h2 class="title">
            Add new secret for {{ repository.repository }}
          </h2>
        </div>
        <p>
          <a :href="'https://github.com/'+ repository.repository" target="_blank" @click.stop>https://github.com/{{ repository.repository }}</a>
        </p>
      </div>
      <div v-if="!loggedInSecretManager" class="mt-3">
        <p>Connect your wallet to add a secret for this repository.</p>
        <button
          class="button is-accent is-fullwidth mt-5 has-text-weight-semibold"
          @click.stop.prevent="$sol.loginModal = true"
        >
          Connect Wallet
        </button>
      </div>
      <div v-else class="mt-2">
        <form v-if="repository" @submit.prevent="addSecret">
          <div class="field">
            <label class="label">Name</label>
            <div class="control">
              <input v-model="newSecretKey" class="input" type="text" placeholder="Secret name" required>
            </div>
          </div>
          <div class="field">
            <label class="label">Secret</label>
            <div class="control">
              <textarea v-model="newSecretValue" class="textarea" placeholder="Secret value" required />
            </div>
          </div>
          <div class="control">
            <button type="submit" class="button is-accent">
              Add secret
            </button>
          </div>
        </form>
        <div v-else>
          Loading..
        </div>
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
      loggedInSecretManager: false,
      newSecretKey: null,
      newSecretValue: null
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
    async addSecret () {
      try {
        await secretApi.post('/secrets', {
          secrets: { [this.newSecretKey]: this.newSecretValue }
        });
        this.$modal.show({
          color: 'success',
          text: 'Successfully saved secret',
          title: 'Saved!',
          persistent: true,
          cancel: false,
          onConfirm: () => {
            this.$router.push(`/repositories/${this.id}/secrets`);
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
