<template>
  <section class="section">
    <div class="container">
      <nuxt-link :to="`/repositories/${id}`">
        <i class="fas fa-chevron-left" /> Cancel
      </nuxt-link>
      <div class="mt-2">
        <form v-if="repository" @submit.prevent="edit">
          <div class="is-flex is-align-items-center">
            <h2 class="title">
              Edit Secrets for {{ repository.repository }}
            </h2>
          </div>
          <p>
            <a :href="'https://github.com/'+ repository.repository" target="_blank" @click.stop>https://github.com/{{ repository.repository }}</a>
          </p>
          <div v-for="value, key in secrets" :key="key" class="field py-3">
            <label class="label">{{ key }}</label>
            <div class="control">
              <input v-model="secrets[key]" required class="input" type="text">
            </div>
          </div>
          <input v-model="newSecretKey" class="input" type="text" placeholder="Secret Name">
          <input v-model="newSecretValue" class="input" type="text" placeholder="Secret Value">
          <a @click.stop="addSecret(newSecret)">Add new secret +</a>
          <div class="control">
            <button
              v-if="!loggedIn"
              class="button is-accent is-fullwidth mt-5 has-text-weight-semibold"
              @click.stop.prevent="$sol.loginModal = true"
            >
              Connect Wallet
            </button>
            <button v-else type="submit" class="button is-accent" :disabled="!secrets">
              Update secrets
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
      secrets: null,
      newSecretValue: null,
      newSecretKey: null
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
