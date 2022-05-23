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
                <div>Pipelines</div>
              </nuxt-link>
              <div v-if="mobileMenu">
                <nuxt-link
                  class="navbar-item"
                  to="/account"
                  exact-active-class="is-active"
                  @click.native="mobileMenu = false"
                >
                  <div>View Profile</div>
                </nuxt-link>
                <a
                  class="navbar-item"
                  exact-active-class="is-active"
                  @click="changeRoute"
                >
                  <div>Settings</div>
                </a>
                <a
                  class="navbar-item"
                  to="/"
                  exact-active-class="is-active"
                  @click="$sol.logout(); mobileMenu = false"
                >
                  <div>Log out</div>
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
                <div class="blockchain-address" style="max-width: 140px;">
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
                    v-for="link in links"
                    :key="link.text"
                    style="text-align: left"
                    :to="link.url"
                    class="dropdown-item"
                    :class="{'is-active': link === value}"
                    @click.native="toggleDropdown(); select(link)"
                  >
                    <span
                      class="icon is-medium p-1 m-1 has-radius"
                    >
                      <i :class="link.icon" />
                    </span>
                    {{ link.text }}
                  </nuxt-link>
                  <a
                    style="text-align: left"
                    class="dropdown-item has-text-danger"
                    @click="toggleDropdown; $sol.logout()"
                  >
                    <span
                      class=" icon is-medium p-1 m-1 has-radius"
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
  components: {},
  data () {
    return {
      links: [
        { text: 'View Profile', url: '/account', icon: 'fa-solid fa-user' },
        { text: 'Settings', url: '/settings', icon: 'fa-solid fa-gear' }
      ],
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
    changeRoute () {
      this.$router.push({ path: 'account', query: { settings: 'true' } });
      this.mobileMenu = false;
    },
    select (option) {
      this.value = option;
    },
    toggleDropdown (value) {
      this.dropdownMenu = !this.dropdownMenu;
    }
  }
};
</script>

<style lang="scss">
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
