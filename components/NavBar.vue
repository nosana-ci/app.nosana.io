<template>
  <div>
    <div class="container">
      <nav class="navbar" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
          <nuxt-link class="navbar-item" to="/">
            <img class="logo" :src="require('@/assets/img/Nosana_Logo_horizontal_color_black.svg')">
          </nuxt-link>
          <a
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
        <div class="navbar-menu" :class="{'is-active': mobileMenu}">
          <div class="navbar-end is-align-items-center">
            <nuxt-link
              id="pipelines"
              class="dropdown-item"
              to="/"
              exact-active-class="is-active"
              @click.native="mobileMenu = false; showDropdown = false"
            >
              <div class="link-content">
                <span
                  class="icon is-medium p-1 m-1 has-radius is-hidden-desktop"
                >
                  <i class="fa-solid fa-grip-lines" />
                </span>
                Pipelines
              </div>
            </nuxt-link>
            <div
              v-if="!loggedIn"
              key=""
              class="navbar-item"
              exact-active-class="is-active"
              @click="mobileMenu = false"
            >
              <nuxt-link
                class="button is-accent is-outlined has-text-weight-semibold"
                exact-active-class="is-active"
                to="/account"
                @click="$sol.loginModal = true"
              >
                <div class="blockchain-address" style="max-width: 140px;" @click="$sol.loginModal = true">
                  Connect Wallet
                </div>
              </nuxt-link>
            </div>
            <div class="navbar-item has-dropdown " :class="{'is-active': showDropdown}">
              <a
                class="navbar-link button is-outlined has-text-weight-semibold is-hidden-touch"
                aria-haspopup="true"
                aria-controls="dropdown-menu"
                @click="toggleDropdown"
              >
                <span v-if="$auth.user.image" class="icon is-small has-background-light m-1 has-radius">
                  <img :src="$auth.user.image">
                </span>
                <div class="blockchain-address" style="max-width: 140px;">
                  {{ $auth.user.address }}
                </div>
              </a>
              <div
                class="navbar-dropdown"
              >
                <nuxt-link
                  id="links"
                  exact-active-class="is-active"
                  to="/account"
                  class="dropdown-item"
                  @click.native="toggleDropdown(); mobileMenu = false"
                >
                  <div class="link-content">
                    <span
                      class="icon is-medium p-1 m-1 has-radius"
                    >
                      <i class="fa-solid fa-user" />
                    </span>
                    View Profile
                  </div>
                </nuxt-link>
                <nuxt-link
                  id="links"
                  :to="{ path: 'account', query: { settings: 'true' }}"
                  exact-active-class="is-active"
                  class="dropdown-item"
                  @click.native="toggleDropdown(); mobileMenu = false"
                >
                  <div class="link-content">
                    <span
                      class="icon is-medium p-1 m-1 has-radius"
                    >
                      <i class="fa-solid fa-gear" />
                    </span>
                    Settings
                  </div>
                </nuxt-link>
                <a
                  id="links"
                  exact-active-class="is-active"
                  class="dropdown-item has-text-danger"
                  @click="$sol.logout(); toggleDropdown; mobileMenu = false"
                >
                  <div class="link-content">
                    <span
                      class="icon is-medium p-1 m-1 has-radius"
                    >
                      <i class="fa-solid fa-power-off" />
                    </span>
                    Logout
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
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

<style lang="scss">
@import "bulma/sass/utilities/mixins";

@include touch{
  #pipelines{
    padding: 15px 0;
  }
}

@include desktop{
  #pipelines.dropdown-item.is-active, button.dropdown-item.is-active {
    background-color: white;
    color: black;
    font-weight: 700;
  }
}

#links{
  padding: 15px 0;
}

.navbar-dropdown{
  padding: 0;
}

.link-content{
  max-width: 165px;
  margin: 0 auto;
}

.navbar {
  &.is-transparent {
    background: transparent;
  }

  .logo {
    height: 38px;
    max-width: none;
    max-height: none;
    margin-top: 0px;
  }
}
</style>
