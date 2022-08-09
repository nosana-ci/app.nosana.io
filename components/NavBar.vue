<template>
  <div>
    <div class="is-flex is-justify-content-center">
      <div class="py-4 px-6 has-text-centered">
        <nuxt-link to="/">
          <img class="logo" width="150" :src="require('@/assets/img/Nosana_Logo_horizontal_color_black.svg')">
        </nuxt-link>
      </div>
      <a
        id="navbar-burger"
        role="button"
        class="navbar-burger"
        aria-label="menu"
        :class="{'is-active': mobileMenu}"
        aria-expanded="false"
        data-target="navbar"
        @click="mobileMenu = !mobileMenu"
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </a>
    </div>

    <div :class="{'is-hidden-mobile': !mobileMenu}">
      <hr class="has-background-grey-lighter">
      <div class="has-text-centered my-4">
        <nuxt-link
          class="button is-accent has-text-weight-semibold"
          exact-active-class="is-active"
          to="/account"
          :class="{'is-outlined': loggedIn}"
        >
          <div v-if="!loggedIn" class="blockchain-address" style="max-width: 140px;" @click="$sol.loginModal = true">
            Connect Wallet
          </div>
          <template v-else>
            <span v-if="$auth.user.image" class="icon is-small has-background-light m-1 has-radius">
              <img :src="$auth.user.image">
            </span>
            <div class="blockchain-address" style="max-width: 140px;">
              {{ $auth.user.address }}
            </div>
          </template>
        </nuxt-link>
      </div>
      <aside class="menu">
        <ul class="menu-list">
          <li>
            <nuxt-link
              to="/account"
              exact-active-class="is-active"
              @click.native="mobileMenu = false;"
            >
              <div class="link-content">
                <span class="icon is-medium p-1 m-1 has-radius">
                  <i class="fa-solid fa-user" />
                </span>
                Account
              </div>
            </nuxt-link>
          </li>
          <li>
            <nuxt-link
              to="/"
              exact-active-class="is-active"
              @click.native="mobileMenu = false;"
            >
              <div class="link-content">
                <span class="icon is-medium p-1 m-1 has-radius">
                  <i class="fa-solid fa-bars-staggered" />
                </span>
                Pipelines
              </div>
            </nuxt-link>
          </li>
          <li>
            <nuxt-link
              to="/stats"
              exact-active-class="is-active"
              @click.native="mobileMenu = false;"
            >
              <div class="link-content">
                <span class="icon is-medium p-1 m-1 has-radius">
                  <i class="fa-solid fa-chart-line" />
                </span>
                Statistics
              </div>
            </nuxt-link>
          </li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<script>
export default {
  components: { },
  data () {
    return {
      mobileMenu: false,
      showDropdown: false
    };
  },
  computed: {
    loggedIn () {
      return (this.$auth && this.$auth.loggedIn);
    }
  },
  methods: {
    toggleDropdown () {
      this.showDropdown = !this.showDropdown;
    }
  }
};
</script>

<style scoped lang="scss">
@import "bulma/sass/utilities/mixins";

@include touch{
}
</style>
