<template>
  <div>
    <div class="stake-block p-5 has-background-light" style="height: 100%">
      <div class="columns is-vcentered">
        <div class="column is-5 is-offset-1">
          <img width="175" src="~assets/img/burner-phone-logo.svg">
        </div>
        <div class="column is-6">
          <p>Next mint</p>
          <h1 class="title mb-4">
            Subscribe
          </h1>
          <p class="block">
            <small>Fill in your account details to get notified for the next mint</small>
          </p>
          <p class="block">
            <nuxt-link to="/account?settings=true" class="button is-accent is-outlined">
              <b>Subscribe</b>
            </nuxt-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
