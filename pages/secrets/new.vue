<template>
  <section class="section">
    <div class="container">
      <nuxt-link to="/secrets">
        <i class="fas fa-chevron-left" /> Cancel
      </nuxt-link>
      <div>
        <div class="is-flex is-align-items-center">
          <h2 class="title">
            Add new global secret
          </h2>
        </div>
      </div>
      <div v-if="!loggedInSecretManager" class="mt-3">
        <button
          class="button is-accent is-fullwidth mt-5 has-text-weight-semibold"
          @click.stop.prevent="login"
        >
          Login to secret manager
        </button>
      </div>
      <div v-else class="mt-2">
        <form @submit.prevent="addSecret">
          <div class="field">
            <label class="label">Name</label>
            <div class="control">
              <input
                v-model="newSecretKey"
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
                v-model="newSecretValue"
                class="textarea"
                placeholder="Secret value"
                required
              />
            </div>
          </div>
          <div class="control">
            <button type="submit" class="button is-accent">
              Add secret
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script>
import axios from 'axios';
console.log(process.env.NUXT_ENV_SECRET_MANAGER_URL);
const secretApi = axios.create({
  baseURL: process.env.NUXT_ENV_SECRET_MANAGER_URL
});

export default {
  middleware: 'auth',
  data () {
    return {
      secrets: {},
      loggedInSecretManager: false,
      newSecretKey: null,
      newSecretValue: null
    };
  },
  created () {
    this.checkToken();
  },
  methods: {
    async login () {
      const response = await this.$axios.$get('/user/secrets');
      this.$store.dispatch('secretsToken/addToken', response.token);
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
            this.$router.push('/secrets');
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
    }
  }
};
</script>
