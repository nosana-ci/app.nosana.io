<template>
  <section class="section">
    <div class="title is-4">
      Edit User Profile
    </div>

    <div class="level">
      <div class="level-item has-text-centered">
        <figure class="image is-128x128">
          <img class="is-rounded" src="https://nosana.io/img/Nosana_Logomark_color.png" alt="" srcset="">
        </figure>
      </div>
    </div>
    <div class="level">
      <div class="level-item has-text-centered">
        <div class="subtitle">
          <strong>Jane Doe</strong>
        </div>
      </div>
    </div>

    <form class="p-6 m-6">
      <div class="field has-text-centered p-4 m-4">
        <ul class="steps is-horizontal has-content-centered">
          <li class="steps-segment">
            <span href="#" class="steps-marker">1</span>
          </li>
          <li class="steps-segment">
            <span href="#" class="steps-marker">2</span>
          </li>
          <li class="steps-segment is-active">
            <span class="steps-marker">3</span>
          </li>
          <li class="steps-segment">
            <span class="steps-marker">4</span>
          </li>
          <li class="steps-segment">
            <span class="steps-marker">5</span>
          </li>
        </ul>
        <br>
        <p>Lorem ipsum something to complete</p>
      </div>

      <br>
      <br>

      <div class="field">
        <div class="buttons is-centered">
          <button class="button is-medium is-dark">
            <span class="icon is-small">
              <i class="fab fa-github" />
            </span>
          </button>
          <button class="button is-medium is-dark">
            <span class="icon is-small">
              <i class="fab fa-discord" />
            </span>
          </button>
          <button class="button is-medium is-dark">
            <span class="icon is-small">
              <i class="fab fa-twitter" />
            </span>
          </button>
        </div>
      </div>

      <br>

      <div class="field is-horizontal">
        <div class="field-body">
          <div class="field">
            <label for="" class="label">First Name*</label>
            <p class="control is-expanded has-icons-left">
              <input class="input" type="text" placeholder="Jane">
              <span class="icon is-small is-left">
                <i class="fas fa-user" />
              </span>
            </p>
          </div>

          <div class="field">
            <label for="" class="label">Last Name*</label>
            <p class="control is-expanded has-icons-left">
              <input class="input" type="text" placeholder="Doe">
              <span class="icon is-small is-left">
                <i class="fas fa-user" />
              </span>
            </p>
          </div>
        </div>
      </div>

      <div class="field">
        <label for="" class="label">Email Address*</label>
        <p class="control is-expanded has-icons-left">
          <input v-model="email" class="input" type="email" placeholder="doe@nosana.io" required>
          <span class="icon is-small is-left">
            <i class="fas fa-envelope" />
          </span>
        </p>
      </div>

      <div class="field">
        <label for="" class="label">Country</label>
        <multiselect
          v-model="country"
          :options="countries"
          label="name"
          placeholder="🗺 Select Country"
          track-by="code"
        >
          <template slot="singleLabel" slot-scope="{ option }">
            {{ option.name }}
          </template>
        </multiselect>
      </div>

      <div class="field">
        <label class="label">I want to:</label>
        <label class="checkbox">
          <input type="checkbox">
          Develop with Nosana
        </label>
        <br>
        <label class="checkbox">
          <input type="checkbox">
          Earn with Nosana Network
        </label>
      </div>

      <br>

      <footer class="is-centered buttons has-radius">
        <button class="button is-fullwidth">
          Cancel
        </button>
        <button class="button is-fullwidth is-outlined is-accent">
          Save
        </button>
      </footer>
    </form>
  </section>
</template>

<script>
import Multiselect from 'vue-multiselect';
import countries from '@/static/countries.json';

export default {
  components: {
    Multiselect
  },
  middleware: 'auth',
  data () {
    return {
      countries,
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
      usedBalance: null,
      country: null
    };
  },
  computed: {

  },
  created () {

  },
  methods: {

  }
};
</script>

<style>

</style>
