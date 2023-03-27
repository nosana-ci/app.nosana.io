<template>
  <div>
    <div class="is-flex is-justify-content-center">
      <div class="py-3 px-6 has-text-centered">
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
      <hr class="has-background-grey-dark mt-0">
      <div class="my-4">
        <div v-if="!loggedIn" class="has-text-centered">
          <nuxt-link
            class="button is-accent has-text-weight-semibold has-text-centered"
            exact-active-class="is-active"
            to="/account/edit"
            :class="{'is-outlined': loggedIn}"
          >
            <div style="max-width: 185px;">
              Login
            </div>
          </nuxt-link>
        </div>
        <div v-else>
          <nuxt-link to="/account/edit">
            <div class="is-flex is-align-items-center is-justify-content-flex-start mb-5 account">
              <div class="ml-3 mr-3">
                <figure class="image is-32x32">
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
              </div>
              <div style="max-width: 100%;">
                <h2 v-if="$auth.user.name" class="title is-6 has-text-weight-semibold">
                  {{ $auth.user.name }}
                </h2>
                <h2
                  v-if="!$auth.user.name &&
                    $auth.user.address && $sol"
                  class="subtitle is-6 mb-0 has-text-weight-semibold"
                >
                  <span
                    class="blockchain-address"
                    style="max-width: 140px;"
                  >
                    {{ $auth.user.address }}
                  </span>
                </h2>
                <h2 v-else-if="$auth.user.github_name" class="subtitle is-6 mb-0 has-text-weight-semibold">
                  {{ $auth.user.github_name }}
                </h2>
              </div>
            </div>
          </nuxt-link>
        </div>
      </div>
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
          <li v-if="loggedIn" class="is-hidden-desktop">
            <a
              class="button ml-3 is-outlined is-danger is-small"
              style="max-width: 80px;"
              @click.prevent="$sol.logout"
            >Logout</a>
          </li>
          <!-- <li>
            <nuxt-link
              to="/stake"
              exact-active-class="is-active"
              @click.native="mobileMenu = false;"
            >
              <span class="icon is-medium p-1 m-1 has-radius">
                <i class="fa-solid fa-coins" />
              </span>
              Staking & rewards
            </nuxt-link>
          </li> -->
          <!-- <li>
            <nuxt-link
              to="/markets"
              exact-active-class="is-active"
              @click.native="mobileMenu = false;"
            >
              <span class="icon is-medium p-1 m-1 has-radius">
                <i class="fa-solid fa-store" />
              </span>
              Markets
            </nuxt-link>
          </li> -->
          <!-- <li>
            <nuxt-link
              to="/stats"
              exact-active-class="is-active"
              @click.native="mobileMenu = false;"
            >
              <span class="icon is-medium p-1 m-1 has-radius">
                <i class="fa-solid fa-chart-line" />
              </span>
              Network statistics
            </nuxt-link>
          </li> -->
        </ul>
      </aside>
    </div>
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
.menu {
font-size: 14px;
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
