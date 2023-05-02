<template>
  <div>
    <nav class="navbar is-fixed-top has-background-secondary" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <nuxt-link class="navbar-item" to="/">
          <img class="logo" width="150" :src="require('@/assets/img/Nosana_Logo_horizontal_color_black.svg')">
        </nuxt-link>

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

      <div id="navbarBasicExample" class="navbar-menu">
        <div class="navbar-end">
          <nuxt-link exact-active-class="is-active" to="/pipelines" class="navbar-item mr-4">
            Pipelines
          </nuxt-link>
          <a class="navbar-item mr-4" href="https://docs.nosana.io" target="_blank">
            Docs <i class="ml-1 fa-solid fa-arrow-up" style="transform: rotate(45deg);" />
          </a>
          <a class="navbar-item mr-4" href="https://app.nosana.io/stake" target="_blank">
            Staking <i class="ml-1 fa-solid fa-arrow-up" style="transform: rotate(45deg);" />
          </a>
          <div class="navbar-item ml-4 has-dropdown is-hoverable">
            <a class="navbar-link">
              <figure class="image is-32x32 mr-2">
                <img v-if="$auth.user.image" :src="$auth.user.image" class="is-rounded has-border">
                <img
                  v-else-if="userTier"
                  :src="require(`@/assets/img/tiers/icons/tier${userTier.tier}.svg`)"
                  class="is-rounded"
                >
                <img
                  v-else-if="$auth.user.github_name"
                  :src="require(`@/assets/img/icons/github.svg`)"
                  class="is-rounded"
                >
                <img
                  v-else
                  :src="require(`@/assets/img/default-profile.svg`)"
                  class="is-rounded"
                >
              </figure>
              <span v-if="$auth.user.name" class="title is-6 has-text-weight-semibold">
                {{ $auth.user.name }}
              </span>
              <span v-if="$auth.user.github_name">
                {{ $auth.user.github_name }}
              </span>
              <span
                v-else-if="!$auth.user.name &&
                  $auth.user.address && $sol"
                class="blockchain-address"
                style="max-width: 100px;"
              >
                {{ $auth.user.address }}
              </span>
            </a>

            <div class="navbar-dropdown py-0">
              <nuxt-link to="/account/edit" class="navbar-item py-3">
                <img class="mr-2" :src="require('@/assets/img/icons/account-nav.svg')" style="width: 20px;">
                Account
              </nuxt-link>
              <hr class="navbar-divider my-0">
              <a
                class="navbar-item py-3"
                style="border-bottom-left-radius: 5px; border-bottom-right-radius: 5px;"
                @click.prevent="$sol.logout"
              >
                <img class="mr-2" :src="require('@/assets/img/icons/logout.svg')" style="width: 20px;">
                Logout
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div class="mobile-menu is-hidden-desktop" :class="{'is-hidden-mobile': !mobileMenu}">
        <aside class="menu">
          <ul class="menu-list mt-5">
            <li>
              <nuxt-link
                to="/account/edit"
                exact-active-class="is-active"
                @click.native="mobileMenu = false;"
              >
                <span class="icon is-medium p-1 m-1 has-radius">
                  <i class="fa-solid fa-user" />
                </span>
                Account
              </nuxt-link>
            </li>
            <li>
              <nuxt-link
                to="/pipelines"
                exact-active-class="is-active"
                @click.native="mobileMenu = false;"
              >
                <span class="icon is-medium p-1 m-1 has-radius">
                  <i class="fa-solid fa-rocket" />
                </span>
                Pipelines
              </nuxt-link>
            </li>
            <li>
              <a
                href="https://docs.nosana.io"
                target="_blank"
                @click.native="mobileMenu = false;"
              >
                <span class="icon is-medium p-1 m-1 has-radius">
                  <i class="fa-solid fa-arrow-up" style="transform: rotate(45deg);" />
                </span>
                Docs
              </a>
            </li>
            <li>
              <a
                href="https://app.nosana.io/stake"
                target="_blank"
                @click.native="mobileMenu = false;"
              >
                <span class="icon is-medium p-1 m-1 has-radius">
                  <i class="fa-solid fa-arrow-up" style="transform: rotate(45deg);" />
                </span>
                Staking
              </a>
            </li>
            <hr>
            <li v-if="loggedIn">
              <a
                class="navbar-item ml-4 mb-4 is-flex"
                style="border-bottom-left-radius: 5px; border-bottom-right-radius: 5px;"
                @click.prevent="$sol.logout"
              >
                <img class="mr-2" :src="require('@/assets/img/icons/logout.svg')" style="width: 20px;">
                Logout
              </a>
            </li>
          </ul>
        </aside>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  components: { },
  data () {
    return { mobileMenu: false };
  },
  computed: {
    userTier () {
      return this.$stake && this.$stake.stakeData &&
      this.$stake.stakeData.tierInfo && this.$stake.stakeData.tierInfo.userTier
        ? this.$stake.stakeData.tierInfo.userTier
        : null;
    },
    loggedIn () {
      return (this.$auth && this.$auth.loggedIn);
    }
  }
};
</script>

<style scoped lang="scss">
.navbar {
  font-family: $family-headers;
  @media screen and (min-width: 1024px) {
    padding: 0 30px;
  }
  .navbar-item {
    font-size: 14px;
    font-weight: 500;
    img {
      max-height: 2rem;
    }
  }
}

.nuxt-link-exact-active {
  color: $accent;
}

@media screen and (min-width: 1024px) {
  .navbar-dropdown {
    background-color: $grey-light;
    border: 1px solid #DDE3DB;
    border-top: none;
  }

  .has-dropdown {
    padding: 10px 0;
    .navbar-link:hover {
      background-color: $grey-darker !important;
      border-radius: 5px;
    }
  }
}

.menu-list {
  li {
    margin: 5px 0;
  }
  a{
    &.is-active {
      background-color: $grey-dark;
      color: $accent;
    }
  }
}

.account {
  h2:hover {
    text-decoration: underline;
  }
}
</style>
