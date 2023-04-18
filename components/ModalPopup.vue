<template>
  <div v-if="color === 'success'" class="modal" :class="{'is-active' : visible}">
    <div class="modal-background" @click="hide()" />
    <div
      class="modal-content has-background-white has-text-centered mx-3 pt-6 pb-5 has-radius-medium
      has-limited-width-small px-6 success-modal"
    >
      <img
        v-if="image"
        :src="require(`@/assets/img/${image}`)"
      >
      <h3 class="title is-3 mb-3">
        {{ title }}
      </h3>
      <p>
        {{ text }}
      </p>
      <button class="button is-accent mt-5 is-fullwidth mb-2" @click="confirm">
        {{ confirmText }}
      </button>
      <button class="modal-close" aria-label="close" @click="hide" />
    </div>
  </div>
  <div
    v-else-if="(color === 'warning' || color === 'danger' || color === 'info') && typeof onConfirm === 'function'"
    class="modal"
    :class="{ 'is-active': visible }"
  >
    <div class="modal-background" />
    <article class="message has-limited-width" :class="['is-' + color]" style="z-index: 100;">
      <div class="message-header py-4 px-5">
        <p>{{ title }}</p>
      </div>
      <div class="message-body">
        <div>
          <ul v-if="(text instanceof Array)" class="headline">
            <!-- eslint-disable-next-line -->
          <li v-for="textValue in text" v-html="textValue" />
          </ul>
          <!-- eslint-disable-next-line -->
        <h5 v-else style="white-space:pre-wrap" v-html="text" />
        </div>
        <div class="has-text-right mt-4">
          <button
            v-if="cancel"
            class="button is-light"
            :class="{'is-loading': loading, ['is-' + color]: true}"
            @click="hide"
          >
            {{ cancelText }}
          </button>
          <button class="button" :class="{'is-loading': loading, ['is-' + color]: true}" @click="confirm">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </article>
  </div>
  <div v-else class="modal" :class="{ 'is-active': visible }">
    <div class="modal-background" @click="!persistent ? hide() : null" />
    <div class="modal-content content box has-no-shadow" style="border: none" :class="['has-background-' + color]">
      <h2 v-if="title && title.length" :class="{'has-text-white': color !== 'white'}">
        {{ title }}
      </h2>
      <div>
        <ul v-if="(text instanceof Array)" class="headline" :class="{'has-text-white': color !== 'white'}">
          <!-- eslint-disable-next-line -->
          <li v-for="textValue in text" v-html="textValue" />
        </ul>
        <!-- eslint-disable-next-line -->
        <h5 v-else style="white-space:pre-wrap" :class="{'has-text-white': color !== 'white'}" v-html="text" />
      </div>
      <div class="has-text-right">
        <button v-if="cancel" class="button" :class="{'is-loading': loading}" @click="hide">
          {{ cancelText }}
        </button>
        <button class="button is-primary" :class="{'is-loading': loading}" @click="confirm">
          {{ confirmText }}
        </button>
      </div>
    </div>
    <button v-if="!persistent" class="modal-close is-large" aria-label="close" @click="hide" />
  </div>
</template>

<script>
// we must import our Modal plugin instance
// because it contains reference to our Eventbus
import events from '@/plugins/events.js';
export default {
  data () {
    return {
      visible: false,
      title: 'Info',
      text: '',
      color: 'white',
      cancel: true,
      persistent: false,
      confirmText: 'OK',
      cancelText: 'Cancel',
      onConfirm: {},
      loading: false,
      image: false,
      successCancel: false
    };
  },
  beforeMount () {
    // here we need to listen for emited events
    // we declared those events inside our plugin
    events.$on('showModal', (params) => {
      this.show(params);
    });
    events.$on('closeModal', () => {
      this.hide();
    });
  },
  methods: {
    hide () {
      // method for closing modal
      this.visible = false;
    },
    resetValues () {
      this.visible = false;
      this.title = 'Info';
      this.text = '';
      this.color = 'white';
      this.cancel = true;
      this.persistent = false;
      this.confirmText = 'OK';
      this.cancelText = 'Cancel';
      this.onConfirm = {};
      this.image = false;
    },
    async confirm () {
      // we must check if this.onConfirm is function
      if (typeof this.onConfirm === 'function') {
        // run passed function and then close the modal
        this.loading = true;
        try {
          if (await this.onConfirm() !== false) {
            this.hide();
          }
        } catch (e) {
          console.error(e);
          let error = 'something went wrong, try again later';
          console.log(e.response);
          if (e.response && e.response.data && e.response.data.message) {
            error = e.response.data.message;
          }
          this.$modal.show({
            color: 'error',
            text: error,
            title: 'Error'
          });
        }
        this.loading = false;
      } else {
        // we only close the modal
        this.hide();
      }
    },
    show (params) {
      this.resetValues();
      // making modal visible
      this.visible = true;
      // setting title and text
      this.title = params.title;
      if (params.text instanceof Error) {
        const e = params.text;
        let error = 'something went wrong';
        if (e.response && e.response.data) {
          if (e.response.data.error) {
            error = e.response.data.error;
          } else if (e.response.data.message) {
            error = e.response.data.message;
          } else if (e.response.data.errorMessage) {
            error = e.response.data.errorMessage;
          } else if (typeof e.response.data === 'string') {
            error = e.response.data;
          }
        } else if (e.message) {
          error = e.message;
        }
        this.text = error;
      } else {
        this.text = params.text;
      }
      // setting callback function
      this.onConfirm = params.onConfirm;
      if (typeof this.onConfirm !== 'function') { this.cancel = false; }
      if (params.confirmText) { this.confirmText = params.confirmText; }
      if (params.cancelText) { this.cancelText = params.cancelText; }
      // eslint-disable-next-line
      if (params.hasOwnProperty('cancel')) { this.cancel = params.cancel }
      // eslint-disable-next-line
      if (params.hasOwnProperty('persistent')) { this.persistent = params.persistent }
      if (params.color) { this.color = params.color; }
      if (params.image) { this.image = params.image; }
      if (params.title) { this.title = params.title; } else if (params.color === 'error') { this.title = 'Error'; }
    }
  }
};
</script>
<style lang="scss" scoped>
  .success-modal {
    position: relative;
    .modal-close {
      background-color: rgba(10, 10, 10, 0.2);
      right: 10px; top: 10px;
      position: absolute;
      &:hover {
        background-color: rgba(10, 10, 10, 0.3);
      }
    }
  }
</style>
