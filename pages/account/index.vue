<template>
  <section class="section">
    <h1 class="title is-4">
      Your Account
    </h1>
    <div>
      <div>
        <div class="columns">
          <div v-if="user" class="column is-4">
            <div class="is-flex is-align-items-flex-start is-justify-content-flex-start">
              <div class="project-icon mr-4">
                <img v-if="user.image" style="height: 32px" :src="user.image">
              </div>
              <div style="max-width: 100%;">
                <h2 v-if="user.name" class="title is-6 has-text-weight-semibold">
                  {{ user.name }}
                  <a @click.prevent="editUser = true"><i class="fas fa-edit" /></a>
                </h2>
                <h2 class="subtitle is-6 mb-1">
                  <a target="_blank" :href="`https://solscan.io/address/${$auth.user.address}`" class="blockchain-address" style="max-width: 140px;">
                    {{ $auth.user.address }}
                  </a>
                </h2>
                <a v-if="!user.name" @click.prevent="editUser = true"><i class="fas fa-edit" /> Edit User info</a>
                <p class="is-size-7 has-overflow-ellipses" style="height: 40px;">
                  <span v-if="user.description">{{ user.description }}</span>
                </p>
              </div>
            </div>
          </div>
          <div v-if="!user || !user.name" class="column is-8">
            <div class="columns">
              <div class="column is-one-third">
                <a
                  class="box is-secondary step"
                  :class="{'has-background-white': loggedIn}"
                  @click="$sol.loginModal = true"
                >
                  <div class="is-flex is-justify-content-space-between">
                    <div>1</div>
                    <div v-if="loggedIn">
                      <img :src="require('@/assets/img/icons/done.svg')">
                    </div>
                    <div v-else>
                      <img :src="require('@/assets/img/icons/pending.svg')">
                    </div>
                  </div>
                  <div class="has-text-centered my-2">
                    <img src="~assets/img/icons/wallet.svg">
                    <p>Connect Wallet</p>
                  </div>
                </a>
              </div>
              <div class="column is-one-third">
                <nuxt-link
                  class="box is-secondary step"
                  :class="{'has-background-white': user && repositories
                             && repositories.filter(r => r.user_id === user.user_id).length,
                           'disabled': !loggedIn}"
                  to="/repositories/new"
                >
                  <div class="is-flex is-justify-content-space-between">
                    <div>2</div>
                    <div v-if="user && repositories && repositories.filter(r => r.user_id === user.user_id).length">
                      <img :src="require('@/assets/img/icons/done.svg')">
                    </div>
                    <div v-else>
                      <img :src="require('@/assets/img/icons/pending.svg')">
                    </div>
                  </div>
                  <div class="has-text-centered my-2">
                    <img v-if="loggedIn" src="~assets/img/icons/repository.svg">
                    <img v-else src="~assets/img/icons/repository_grey.svg">
                    <p>Add Repository</p>
                  </div>
                </nuxt-link>
              </div>
              <div class="column is-one-third">
                <a
                  class="box is-secondary step"
                  :class="{'has-background-white': user && repositories
                             && repositories.filter(r => r.user_id === user.user_id).length,
                           'disabled': !(loggedIn && user && repositories
                             && repositories.filter(r => r.user_id === user.user_id).length)}"
                  @click.stop="editUser = true"
                >
                  <div class="is-flex is-justify-content-space-between">
                    <div>3</div>
                    <div v-if="user && user.isApproved">
                      <img :src="require('@/assets/img/icons/done.svg')">
                    </div>
                    <div v-else-if="user && user.name">
                      <img :src="require('@/assets/img/icons/running.svg')">
                    </div>
                    <div v-else>
                      <img :src="require('@/assets/img/icons/pending.svg')">
                    </div>
                  </div>
                  <div class="has-text-centered my-2">
                    <img
                      v-if="loggedIn && user && repositories &&
                        repositories.filter(r => r.user_id === user.user_id).length"
                      src="~assets/img/icons/project.svg"
                    >
                    <img v-else src="~assets/img/icons/project_grey.svg">
                    <p>Request Funds</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
          <template v-else>
            <div class="column is-2">
              <div class="box">
                <small>TestNet Balance</small>
                <div class="has-text-weight-semibold">
                  <span
                    v-if="!balance && balance !== 0"
                  >...</span>
                  <span v-else>{{ Math.trunc(balance*10000)/10000 }}</span> <span class="has-text-accent">NOS</span>
                </div>
              </div>
            </div>
            <div class="column is-2">
              <div class="box">
                <small>Used for Jobs</small>
                <div class="has-text-weight-semibold">
                  {{ usedBalance }} <span class="has-text-accent">NOS</span>
                </div>
              </div>
            </div>
            <div class="column is-2">
              <div class="box">
                <small>NOS Rewards</small>
                <div class="has-text-weight-semibold">
                  {{ reward }} <span class="has-text-accent">NOS</span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div v-if="user" class="mt-6">
      <nuxt-link to="/repositories/new" class="button is-accent is-outlined is-pulled-right">
        Add new repository
      </nuxt-link>
      <h2 class="subtitle has-text-weight-semibold">
        Repositories
      </h2>

      <repository-list :repositories="repositories" />
    </div>
    <div class="has-text-centered mt-6">
      <a class="has-text-danger" @click.prevent="$sol.logout">Logout</a>
    </div>
  </section>
</template>

<script>
import RepositoryList from '@/components/RepositoryList.vue';

export default {
  components: { RepositoryList },
  middleware: 'auth',
  data () {
    return {
      user: null,
      image: null,
      description: null,
      discord: null,
      email: null,
      name: null,
      editUser: false,
      repositories: null,
      commits: null,
      balance: null,
      usedBalance: null
    };
  },
  computed: {
    loggedIn () {
      return this.$auth && this.$auth.loggedIn;
    },
    reward () {
      let reward = 0;
      if (this.balance > 0) {
        reward += 500;
      }

      return Math.min(reward + this.usedBalance, 10000);
    }
  },
  watch: {
    '$route.query.settings' () {
      if (this.$route.query.settings) {
        this.editUser = true;
      }
    }
  },
  created () {
    this.getUser();
    this.getUserRepositories();
    this.getUserJobPrices();
    if (this.$route.query.settings) {
      this.editUser = true;
    }
  },
  methods: {
    removeQuery () {
      this.$router.replace({ query: null });
    },
    async getUser () {
      try {
        const user = await this.$axios.$get('/user');
        this.name = user.name;
        this.description = user.description;
        this.discord = user.discord;
        this.email = user.email;
        this.image = user.image;
        this.user = user;
        this.balance = (await this.$sol.getNosBalance(this.user.generated_address)).uiAmount;
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    async getUserJobPrices () {
      try {
        const totalCosts = await this.$axios.$get('/user/jobs/price');
        this.usedBalance = totalCosts / 1e6;
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    async getUserRepositories () {
      try {
        const repositories = await this.$axios.$get('/user/repositories');
        this.repositories = repositories;
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    async updateUser () {
      try {
        const user = await this.$axios.$post('/user', {
          name: this.name,
          image: this.image,
          description: this.description,
          discord: this.discord,
          email: this.email
        });
        this.$auth.fetchUser();
        this.user = user;
        this.editUser = false;
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

<style lang="scss" scoped>
.modal-card{
  overflow: auto;
}
.project-icon {
  border-radius: 100%;
  background: $secondary;
  display:flex;
  justify-content: center;
  min-width: 75px;
  height: 75px;
  align-items: center;
  border: 1px solid grey;
}
</style>
