<template>
  <div>
    <div class="title">
      Edit User Profile
    </div>

    <form @submit.prevent="updateUser">
      <section class="modal-card-body">
        <div class="field">
          <label>Name*:</label>
          <input v-model="name" required type="text" class="input">
        </div>
        <div class="field">
          <label>Email*:</label>
          <input v-model="email" required type="email" class="input">
        </div>
        <div class="field">
          <label>Description:</label>
          <textarea v-model="description" class="textarea" />
        </div>
        <div class="field">
          <label>Icon URL:</label>
          <input v-model="image" type="url" class="input">
        </div>
        <div class="field">
          <label>Discord Username:</label>
          <input v-model="discord" type="text" class="input">
        </div>
      </section>

      <footer class="modal-card-foot has-text-right">
        <button class="button" @click.prevent="editUser = false; removeQuery()">
          Cancel
        </button>
        <input type="submit" class="button is-accent" value="Save">
      </footer>
    </form>
    <button class="modal-close is-large" aria-label="close" @click="editUser = false; removeQuery()" />
  </div>
</template>

<script>
export default {
  components: {},
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

  },
  created () {

  },
  methods: {

  }
};
</script>

<style>

</style>
