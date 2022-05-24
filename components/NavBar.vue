<template>
  <div>
    <nav class="navbar is-transparent" role="navigation" aria-label="main navigation">
      <div class="container">
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

        <div id="navbar" class="navbar-menu" :class="{'is-active': mobileMenu}">
          <div class="navbar-start" />
          <div class="navbar-end is-align-items-center">
            <div>
              <nuxt-link
                class="navbar-item"
                to="/"
                exact-active-class="is-active"
                @click.native="mobileMenu = false"
              >
                <div class="align-pipelines">
                  <span
                    class="icon is-medium p-1 m-1 has-radius is-hidden-desktop"
                  >
                    <i class="fa-solid fa-grip-lines" />
                  </span>
                  Pipelines
                </div>
              </nuxt-link>
              <div v-if="mobileMenu" class="is-hidden-desktop">
                <nuxt-link
                  class="navbar-item"
                  to="/account"
                  exact-active-class="is-active"
                  @click.native="mobileMenu = false"
                >
                  <div class="has-text-left mx-auto" style="width: 125px">
                    <span
                      class="icon is-medium p-1 m-1 has-radius"
                    >
                      <i class="fa-solid fa-user" />
                    </span>
                    View Profile
                  </div>
                </nuxt-link>
                <nuxt-link
                  class="navbar-item"
                  exact-active-class="is-active"
                  :to="{ path: 'account', query: { settings: 'true' }}"
                  @click.native="mobileMenu = false"
                >
                  <div class="has-text-left mx-auto" style="width: 125px">
                    <span
                      class="icon is-medium p-1 m-1 has-radius"
                    >
                      <i class="fa-solid fa-gear" />
                    </span>
                    Settings
                  </div>
                </nuxt-link>

                <a
                  class="navbar-item has-text-danger"
                  to="/"
                  exact-active-class="is-active"
                  @click="$sol.logout(); mobileMenu = false"
                >
                  <div class="has-text-left mx-auto" style="width: 125px">
                    <span
                      class="icon is-medium p-1 m-1 has-radius"
                    >
                      <i class="fa-solid fa-power-off" />
                    </span>
                    Log out
                  </div>
                </a>
              </div>
            </div>
            <div v-if="!loggedIn" class="navbar-item" exact-active-class="is-active" @click="mobileMenu = false">
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
            <div
              v-else
              class="navbar-item dropdown"
              :class="{'is-active': dropdownMenu && !mobileMenu}"
              exact-active-class="is-active"
              @click="mobileMenu = false"
            >
              <div class="dropdown-trigger">
                <button
                  class="button is-accent has-text-weight-semibold"
                  aria-haspopup="true"
                  aria-controls="dropdown-menu"
                  @click="toggleDropdown"
                >
                  <span v-if="$auth.user.image" class="icon is-small has-background-light p-1 has-radius">
                    <img :src="$auth.user.image">
                  </span>
                  <div class="blockchain-address" style="max-width: 140px;">
                    {{ $auth.user.address }}
                  </div>
                </button>
              </div>
              <div
                id="dropdown-menu"
                class="dropdown-menu ml-4"
                style="min-width: 214px;"
                role="menu"
              >
                <div class="dropdown-content" style="dropdown-content-shadow: none">
                  <nuxt-link
                    exact-active-class="is-active"
                    style="text-align: left"
                    to="/account"
                    class="dropdown-item"
                    @click.native="toggleDropdown"
                  >
                    <span
                      class="icon is-medium p-1 m-1 has-radius"
                    >
                      <i class="fa-solid fa-user" />
                    </span>
                    View Profile
                  </nuxt-link>
                  <nuxt-link
                    :to="{ path: 'account', query: { settings: 'true' }}"
                    exact-active-class="is-active"
                    style="text-align: left"
                    class="dropdown-item"
                    @click.native="toggleDropdown"
                  >
                    <span
                      class="icon is-medium p-1 m-1 has-radius"
                    >
                      <i class="fa-solid fa-gear" />
                    </span>
                    Settings
                  </nuxt-link>
                  <a
                    exact-active-class="is-active"
                    style="text-align: left"
                    class="dropdown-item has-text-danger"
                    @click="toggleDropdown; $sol.logout()"
                  >
                    <span
                      class="icon is-medium p-1 m-1 has-radius"
                    >
                      <i class="fa-solid fa-power-off" />
                    </span>
                    Logout
                  </a>
                </div>
              </div>
              <!-- <nuxt-link
                class="button is-accent has-text-weight-semibold"
                exact-active-class="is-active"
                to="/account"
              >
                <span v-if="$auth.user.image" class="icon is-small has-background-light p-1 has-radius">
                  <img :src="$auth.user.image">
                </span>
                <div class="blockchain-address" style="max-width: 140px;">
                  {{ $auth.user.address }}
                </div>
              </nuxt-link> -->
            </div>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>

export default {
  components: { },
  data () {
    return {
      mobileMenu: false,
      dropdownMenu: false,
      value: ''
    };
  },
  computed: {
    loggedIn () {
      return (this.$auth && this.$auth.loggedIn);
    }
  },
  methods: {
    toggleDropdown (value) {
      this.dropdownMenu = !this.dropdownMenu;
    }
  }
};
</script>

<style lang="scss">
.align-pipelines{
  @media only screen and(max-width: 1024px){
  text-align: left;
  width: 125px;
  margin: 0 auto;
  }
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
    margin-right: 8px;
  }

  .navbar-menu {
    margin-top: 8px;
    justify-content: center;

    .navbar-item {
      font-weight: 500;
      padding: 10px 20px;
      text-align: center;
      font-size: .9rem;

      &:after {
        display: block;
        width: 0;
        height: 2px;
        position: absolute;
        transition: width 0.5s;
        bottom: 10px;
        content: "";
      }

      &.is-active {
        font-weight: 700;

        &:after {
          width: calc(100% - 1.5rem - 15px);
        }
      }
    }
  }
}
</style>
