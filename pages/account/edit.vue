<template>
  <section class="section">
    <div class="level">
      <div class="level-item has-text-centered">
        <figure class="image is-128x128">
          <img v-if="image" class="is-rounded" :src="image" alt="" srcset="">
          <img
            v-else-if="userTier"
            class="is-rounded"
            :src="require(`@/assets/img/tiers/icons/tier${userTier.tier}.svg`)"
            alt=""
            srcset=""
          >
          <img v-else class="is-rounded" :src="require(`@/assets/img/default-profile.svg`)" alt="" srcset="">
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
    <div
      v-if="user"
      class="level is-flex-direction-row is-flex is-justify-content-center is-align-items-center connected-icons"
    >
      <div
        :class="{'disabled has-tooltip': !user.address, 'has-tooltip-accent': user.address}"
        class="mx-2"
        :data-tooltip="
          !user.address
            ? 'Connect your Solana wallet'
            : `Connected: ${user.address}`"
      >
        <img
          class="is-rounded has-border"
          :src="require(`@/assets/img/icons/solana.png`)"
          @click="addWallet"
        >
      </div>

      <div
        :class="{'disabled has-tooltip': !user.github_account_id, 'has-tooltip-accent': user.github_account_id}"
        class="mx-2"
        :data-tooltip="
          !user.github_account_id
            ? 'Connect your Github account'
            : `Connected: ${user.github_name}`"
        @click="goToGithub"
      >
        <img class="is-rounded has-border" :src="require(`@/assets/img/icons/github.svg`)">
      </div>
    </div>
    <!-- <div class="level-item has-text-centered">
        <button
          v-if="!user.address"
          class="button is-outlined is-accent has-"
          :class="{ 'is-loading': loading }"
          @click="$sol.loginModal = true, $sol.addWalletToExistingAccount = true"
        >
          Connect wallet to account
        </button>
        <button
          v-if="!user.github_account_id"
          class="button is-outlined is-accent has-"
          :class="{ 'is-loading': loading }"
          @click="goToGithub"
        >
          Connect Github to account
        </button>
      </div> -->

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
          Earn with the Nosana Network
        </label>
        <br>
        <label class="checkbox">
          <input v-model="wantToParticipateNft" type="checkbox">
          Participate in the next free NFT raffle
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

      <div class="is-centered buttons has-radius mb-4">
        <button
          class="button is-fullwidth is-outlined is-accent"
          :class="{ 'is-loading': loading }"
        >
          Save
        </button>
      </div>
    </form>

    <div class="mx-auto mt-5" style="max-width: 522px;">
      <hr>
      <div v-if="nfts && nfts.length > 0">
        <h1 class="title is-4 mb-5 mt-5">
          Your Nosana<b class="has-text-accent"> NFTs</b>
        </h1>
        <div class="columns px-1 is-multiline">
          <div
            v-for="nft in nfts"
            :key="nft.name"
            class="column is-one-third-desktop pb-1"
          >
            <div class="card">
              <a href="#" @click.prevent="openNft(nft)">
                <div class="card-image">
                  <figure class="image is-1by1">
                    <img v-if="nft.json" :src="nft.json.image" alt="">
                    <div
                      v-else
                      class="loader-wrapper is-active is-flex is-justify-content-center is-align-items-center"
                    >
                      <div class="loader is-loading" />
                    </div>
                  </figure>
                </div>
                <div class="card-content p-2 has-text-centered">
                  <div class="content">
                    <span style="font-size: .9rem;">{{ nft.name }}</span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div v-if="activeNft" class="modal" :class="{ 'is-active': openNftPopup && activeNft }">
        <div
          class="modal-background"
          @click="openNftPopup = false;"
        />
        <div class="modal-card has-radius">
          <header class="modal-card-head">
            <p class="modal-card-title">
              {{ activeNft.name }}
            </p>
            <button class="delete" aria-label="close" @click="openNftPopup = false;" />
          </header>
          <section class="modal-card-body pb-5">
            <img v-if="activeNft.json" style="width: 100%;" :src="activeNft.json.image" alt="">
            <div v-else class="loader-wrapper is-active is-flex is-justify-content-center is-align-items-center">
              <div class="loader is-loading" />
            </div>
            <div v-if="activeNft.json">
              <p>{{ activeNft.json.description }}</p>
              <h3 class="mb-2 mt-5 has-text-weight-semibold subtitle">
                Attributes
              </h3>
              <div class="columns is-multiline is-mobile p-2 py-4">
                <div
                  v-for="trait in activeNft.json.attributes"
                  :key="trait.trait_type"
                  class="column is-one-fifth-widescreen is-3-tablet is-6-mobile p-1"
                >
                  <a
                    class="opensea-link"
                    target="_blank"
                    :href="`https://opensea.io/collection/nosana-burner-phone-collection?search[stringTraits][0][name]=${trait.trait_type}&search[stringTraits][0][values][0]=${trait.value}`"
                  >
                    <div class="has-radius has-text-centered nft-attribute py-2 px-2">
                      <div class="is-uppercase has-text-accent has-text-weight-semibold">
                        {{ trait.trait_type }}
                      </div>
                      <div class="is-size-7">
                        {{ trait.value }}
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            <button
              v-if="activeNft.json && image !== activeNft.json.image"
              class="button is-accent mt-3"
              @click="image = activeNft.json.image, updateUser()"
            >
              Set NFT as Profile Picture
            </button>
          </section>
        </div>
      </div>
    </div>
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
      wantToParticipateNft: null,
      image: null,
      completionIndex: 0,
      balance: null,
      editUser: false,
      repositories: null,
      commits: null,
      usedBalance: null,
      completionRange: range(5),
      loading: false,
      activeNft: null,
      openNftPopup: false
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
        this.name, this.email,
        this.wantToDevelop || this.wantToEarn || this.wantToParticipateNft,
        this.description, this.userTier, this.image
      ];
    },
    userCompletion () {
      const finishedItems = this.completionArray.filter(el => (el !== null && el !== undefined) && el !== '' && el !== false).length;
      return Math.round(finishedItems / this.completionArray.length * 100);
    },
    nfts () {
      return this.$sol ? this.$sol.nfts : null;
    }
  },
  watch: {
    '$sol.addWalletToExistingAccount': function (pubkey) {
      this.getUser();
    }
  },
  created () {
    this.getUser();
    this.refreshStake();
  },
  methods: {
    goToGithub () {
      if (!this.user.github_account_id) {
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${process.env.NUXT_ENV_GITHUB_APP_CLIENT_ID}&redirect_uri=${window.location.origin}/account/edit`;
      }
    },
    addWallet () {
      if (!this.user.address) {
        this.$sol.loginModal = true;
        this.$sol.addWalletToExistingAccount = true;
      }
    },
    async getNfts (address) {
      if (this.loggedIn && address && this.$sol) {
        await this.$sol.getNfts(address);
      }
    },
    async refreshStake () {
      await this.$stake.refreshStake();
    },
    async authenticateGithub (code) {
      try {
        await this.$axios.$post('/user/add-github', {
          code
        });
        this.$modal.show({
          color: 'success',
          title: 'Synced Github Account'
        });
        // remove query params
        window.history.replaceState(null, null, window.location.pathname);
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    },
    async getUser () {
      try {
        const user = await this.$axios.$get('/user');
        this.user = user;
        this.name = user.name;
        this.description = user.description;
        this.description = user.description;
        this.firstName = user.first_name;
        this.lastName = user.last_name;
        this.email = user.email;
        this.discord = user.discord;
        this.github = user.github;
        this.twitter = user.twitter;
        this.country = JSON.parse(user.country);
        this.wantToDevelop = user.want_to_develop;
        this.wantToEarn = user.want_to_earn;
        this.wantToParticipateNft = user.want_to_participate_nft;
        this.image = user.image;
        this.completionIndex = user.completion_index ?? 0;
        this.getNfts(this.user.address);
        if (this.$route.query.code) {
          this.authenticateGithub(this.$route.query.code);
        }
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
        wantToParticipateNft: this.wantToParticipateNft,
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
    },
    openNft (nft) {
      if (nft.json) {
        this.openNftPopup = true;
        this.activeNft = nft;
      }
    }

  }
};
</script>

<style scoped lang="scss">
.loader-wrapper {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
}
.opensea-link {
  color: $text;
}
.nft-attribute {
  background-color: rgba(102, 255, 99, 0.2);
  border: solid 1px $accent;
  .is-uppercase {
    font-size: 10px;
  }
  div {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.connected-icons {
  img {
    border-radius: 50%;
    width: 45px;
    height: 45px;
    object-fit: contain;
    border-width: 3px;
    padding: 7px;
  }
  div.disabled {
    img {
      cursor: pointer;
      background-color: #fff;
      filter: grayscale(.8);
      &:hover {
        opacity: .5;
      }
    }
  }
  div:not(.disabled) img {
    border-color: $accent;
  }
}
</style>
