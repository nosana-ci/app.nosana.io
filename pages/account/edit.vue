<template>
  <section class="section">
    <div class="level">
      <div class="level-item has-text-centered">
        <figure class="image is-128x128">
          <img class="is-rounded" src="https://nosana.io/img/NOS_logo.png" alt="" srcset="">
        </figure>
      </div>
    </div>
    <div class="level">
      <div class="level-item has-text-centered">
        <div class="subtitle">
          <strong>{{ name ? name : 'Username' }}</strong>
        </div>
      </div>
    </div>

    <form class="mx-auto" style="max-width: 522px;" @submit.prevent="updateUser">
      <div class="field has-background-grey-lighter py-2 px-5 has-radius has-text-centered">
        <label for="" class="is-small has-text-grey">Profile Completed</label>
        <progress class="progress is-success" :value="userCompletion" :max="100">
          {{ userCompletion }}
        </progress>
        <!-- <div class="level is-mobile"> -->
          <!-- <div v-for="(idx, index) in completionArray" :key="index" class="level-item has-text-centered"> -->
            <!-- <progress v-if="index < userCompletion" class="progress is-success is-small mx-1" value="100" /> -->
            <!-- <progress v-else class="progress is-success is-small" value="0" /> -->
          <!-- </div> -->
        <!-- </div> -->
      </div>

      <!-- <div class="field has-text-centered p-4 m-4"> -->
      <!-- <ul class="steps is-horizontal has-content-centered"> -->
      <!-- <li -->
      <!-- v-for="(idx, index) in completionRange" -->
      <!-- :key="index" -->
      <!-- class="steps-segment" -->
      <!-- :class="{ 'is-active': index === completionIndex }" -->
      <!-- > -->
      <!-- <span href="#" class="steps-marker"> -->
      <!-- <span class="icon is-small"> -->
      <!-- <i class="fa-solid fa-circle-check" /> -->
      <!-- </span> -->
      <!-- </span> -->
      <!-- </li> -->
      <!-- </ul> -->
      <!-- <br> -->
      <!-- <p>Profile completion</p> -->
      <!-- </div> -->
      <!--  -->
      <!-- <div class="field"> -->
      <!-- <div class="buttons is-centered"> -->
      <!-- <button class="button is-medium is-light has-background-grey"> -->
      <!-- <span class="icon is-small"> -->
      <!-- <i class="fab fa-github fa-font-light" /> -->
      <!-- </span> -->
      <!-- </button> -->
      <!-- <button class="button is-medium is-light has-background-grey"> -->
      <!-- <span class="icon is-small"> -->
      <!-- <i class="fab fa-discord fa-font-light" /> -->
      <!-- </span> -->
      <!-- </button> -->
      <!-- <button class="button is-medium is-light has-background-grey"> -->
      <!-- <span class="icon is-small"> -->
      <!-- <i class="fab fa-twitter fa-font-light" /> -->
      <!-- </span> -->
      <!-- </button> -->
      <!-- </div> -->
      <!-- </div> -->
      <!-- <br> -->

      <!-- <div class="field is-horizontal"> -->
      <!-- <div class="field-body"> -->
      <!-- <div class="field has-background-grey-lighter py-2 px-5 has-radius"> -->
      <!-- <label for="" class="is-small has-text-grey">First Name*</label> -->
      <!-- <p class="control is-expanded has-icons-left"> -->
      <!-- <input v-model="firstName" class="input" type="text" placeholder="Jane"> -->
      <!-- <span class="icon is-small is-left"> -->
      <!-- <i class="fas fa-user" /> -->
      <!-- </span> -->
      <!-- </p> -->
      <!-- </div> -->
      <!--  -->
      <!-- <div class="field has-background-grey-lighter py-2 px-5 has-radius"> -->
      <!-- <label for="" class="is-small has-text-grey">Last Name*</label> -->
      <!-- <p class="control is-expanded has-icons-left"> -->
      <!-- <input v-model="lastName" class="input" type="text" placeholder="Doe"> -->
      <!-- <span class="icon is-small is-left"> -->
      <!-- <i class="fas fa-user" /> -->
      <!-- </span> -->
      <!-- </p> -->
      <!-- </div> -->
      <!-- </div> -->
      <!-- </div> -->

      <div class="field has-background-grey-lighter py-2 px-5 has-radius">
        <label for="" class="is-small has-text-grey">Name</label>
        <p class="control is-expanded has-icons-left">
          <input v-model="name" type="text" class="input" placeholder="Nosana">
          <span class="icon is-small is-left">
            <i class="fas fa-user" />
          </span>
        </p>
      </div>

      <div class="field has-background-grey-lighter py-2 px-5 has-radius">
        <label for="" class="is-small has-text-grey">Email Address</label>
        <p class="control is-expanded has-icons-left">
          <input v-model="email" class="input" type="email" placeholder="doe@nosana.io">
          <span class="icon is-small is-left">
            <i class="fas fa-image" />
          </span>
        </p>
      </div>

      <!-- <div class="field has-background-grey-lighter py-2 px-5 has-radius"> -->
      <!-- <label for="" class="is-small has-text-grey">Country</label> -->
      <!-- <multiselect -->
      <!-- v-model="country" -->
      <!-- :options="countries" -->
      <!-- label="name" -->
      <!-- placeholder="🗺 Select Country" -->
      <!-- track-by="code" -->
      <!-- > -->
      <!-- <template slot="singleLabel" slot-scope="{ option }"> -->
      <!-- {{ option.name }} -->
      <!-- </template> -->
      <!-- </multiselect> -->
      <!-- </div> -->

      <div class="field has-background-grey-lighter py-2 px-5 has-radius">
        <label class="is-small has-text-grey">I want to:</label>
        <br>
        <label class="checkbox">
          <input v-model="wantToDevelop" type="checkbox">
          Develop with Nosana
        </label>
        <br>
        <label class="checkbox">
          <input v-model="wantToEarn" type="checkbox">
          Earn with Nosana Network
        </label>
      </div>

      <div v-if="wantToDevelop" class="field has-background-grey-light py-2 px-5 has-radius">
        <label for="" class="is-small-has-text-grey">Image Link</label>
        <p class="control is-expanded has-icons-left">
          <input v-model="image" class="input" type="url" placeholder="https://nosana.io/img/NOS_logo.png">
          <span class="icon is-small is-left">
            <i class="fas fa-image" />
          </span>
        </p>
      </div>

      <div v-if="wantToDevelop" class="field has-background-grey-lighter py-2 px-5 has-radius">
        <label for="" class="is-small has-text-grey">Description</label>
        <p class="control is-expanded has-icons-left">
          <textarea v-model="description" class="textarea" placeholder="Tell us about yourself" />
        </p>
      </div>

      <br>

      <footer class="is-centered buttons has-radius">
        <button
          class="button is-fullwidth is-outlined is-accent"
          :class="{ 'is-loading': loading }"
        >
          Save
        </button>
      </footer>
    </form>
  </section>
</template>

<script>
// // import Multiselect from 'vue-multiselect';
import countries from '@/static/countries.json';

const range = index => [...Array(index).keys()];

export default {
  components: {
    // // Multiselect
  },
  middleware: 'auth',
  data () {
    return {
      countries,
      user: null,
      name: null,
      description: null,
      firstName: null,
      lastName: null,
      email: null,
      discord: null,
      github: null,
      twitter: null,
      country: null,
      wantToDevelop: null,
      wantToEarn: null,
      image: null,
      completionIndex: 0,
      balance: null,
      editUser: false,
      repositories: null,
      commits: null,
      usedBalance: null,
      completionRange: range(5),
      loading: false
    };
  },
  computed: {
    loggedIn () {
      return this.$auth && this.$auth.loggedIn;
    },
    userTier () {
      return this.$stake?.stakeData?.tierInfo?.userTier;
    },
    completionArray () {
      return [
        this.name, this.email, this.wantToDevelop || this.wantToEarn, this.description, this.userTier, this.image
      ];
    },
    userCompletion () {
      const finishedItems = this.completionArray.filter(el => (el !== null && el !== undefined) && el !== '' && el !== false).length;
      return Math.round(finishedItems / this.completionArray.length * 100);
    }
  },
  created () {
    this.getUser();
    this.refreshStake();
  },
  methods: {
    async refreshStake () {
      await this.$stake.refreshStake();
    },

    async getUser () {
      try {
        const user = await this.$axios.$get('/user');
        this.name = user.name;
        this.description = user.description;
        this.description = user.description;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.email = user.email;
        this.discord = user.discord;
        this.github = user.github;
        this.twitter = user.twitter;
        this.country = JSON.parse(user.country);
        this.wantToDevelop = user.wantToDevelop;
        this.wantToEarn = user.wantToEarn;
        this.image = user.image;
        this.completionIndex = user.completionIndex ?? 0;
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },

    async updateUser () {
      this.loading = true;
      const userUpdate = {
        name: this.name,
        description: this.description,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        discord: this.discord,
        github: this.github,
        twitter: this.twitter,
        country: this.country,
        wantToDevelop: this.wantToDevelop,
        wantToEarn: this.wantToEarn,
        image: this.image,
        completionIndex: this.completionIndex
      };
      console.log(userUpdate);

      try {
        const user = await this.$axios.$post('/user', userUpdate);
        console.log(user);
        this.$auth.fetchUser();
        this.user = user;
        // this.$router.push('/account');
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
      this.loading = false;
    }

  }
};
</script>

<style>

</style>
