<template>
  <div>
    <img :src="icon">
  </div>
</template>

<script>

export default {
  props: {
    status: {
      type: String,
      default: null
    }
  },
  data () {
    let icon
    if (this.status === 'PENDING') {
      icon = require('@/assets/img/icons/pending.svg')
    } else if (this.status === 'RUNNING') {
      icon = require('@/assets/img/icons/running.svg')
    } else if (this.status === 'COMPLETED') {
      icon = require('@/assets/img/icons/done.svg')
    } else if (this.status === 'FAILED') {
      icon = require('@/assets/img/icons/failed.svg')
    } else if (this.status === 'CANCELLED') {
      icon = require('@/assets/img/icons/pending.svg')
    }
    return {
      icon
    }
  }
}
</script>
