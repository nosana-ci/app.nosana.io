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
      <div class="my-4">
        <div v-if="!loggedIn" class="has-text-centered">
          <nuxt-link
            class="button is-accent has-text-weight-semibold has-text-centered"
            exact-active-class="is-active"
            to="/account/edit"
            :class="{'is-outlined': loggedIn}"
          >
            <div class="blockchain-address" style="max-width: 185px;" @click="$sol.loginModal = true">
              Connect Wallet
            </div>
          </nuxt-link>
        </div>
        <div v-else class="is-flex is-align-items-flex-start is-justify-content-flex-start">
          <div class="mr-4">
            <figure class="image is-32x32">
              <img v-if="$auth.user.image" :src="$auth.user.image" class="is-rounded has-border">
              <img
                v-else-if="userTier"
                :src="require(`@/assets/img/tiers/icons/tier${userTier.tier}.svg`)"
                class="is-rounded"
              >
            </figure>
          </div>
          <div style="max-width: 100%;">
            <h2 v-if="$auth.user.name" class="title is-6 has-text-weight-semibold">
              {{ $auth.user.name }}
              <nuxt-link to="/account/edit">
                <i class="fas fa-edit" />
              </nuxt-link>
            </h2>
            <h2 v-else class="title is-6 has-text-weight-semibold">
              <nuxt-link to="/account/edit">
                <i class="fas fa-edit" /> Edit User info
              </nuxt-link>
            </h2>

            <h2 class="subtitle is-7 mb-1">
              <a target="_blank" :href="`https://solscan.io/address/${$auth.user.address}`" class="blockchain-address" style="max-width: 140px;">
                {{ $auth.user.address }}
              </a>
            </h2>
            <div class="">
              <a class="has-text-danger is-size-7" @click.prevent="$sol.logout">Logout</a>
            </div>
          </div>
        </div>
      </div>
      <aside class="menu">
        <ul class="menu-list">
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
            <nuxt-link
              to="/stake"
              exact-active-class="is-active"
              @click.native="mobileMenu = false;"
            >
              <span class="icon is-medium p-1 m-1 has-radius">
                <i class="fa-solid fa-coins" />
              </span>
              Staking & Rewards
            </nuxt-link>
          </li>
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
          <li>
            <nuxt-link
              to="/stats"
              exact-active-class="is-active"
              @click.native="mobileMenu = false;"
            >
              <span class="icon is-medium p-1 m-1 has-radius">
                <i class="fa-solid fa-chart-line" />
              </span>
              Network Statistics
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
      i {
        color: $accent;
      }
    }
  }
}
</style>
