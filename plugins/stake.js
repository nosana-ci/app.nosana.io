import Vue from 'vue';

export default (context, inject) => {
  const stake = new Vue({
    data () {
      return {
        interval: null,
        stakeData: null,
        stakeEndDate: null
      };
    },
    mounted () {
      this.refreshStake();
      if (!this.interval) {
        this.interval = setInterval(() => {
          console.log('refresh staking info..');
          this.refreshStake();
        }, 30000);
      }
    },
    beforeDestroy () {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    },
    methods: {
      clear () {
        this.stakeData = null;
        this.stakeDataEnd = null;
      },
      async refreshStake () {
        const stakeData = await context.$axios.$get('/user/stake');
        if (stakeData && stakeData.user_id && parseInt(stakeData.time_unstake) !== 0 && parseInt(stakeData.time_unstake) !== '00') {
          this.stakeEndDate = context.$moment.unix(stakeData.time_unstake).add(stakeData.duration, 's');
          // this.stakeEndDate = this.$moment.unix(1659698174);
        } else {
          this.stakeEndDate = null;
        }
        this.stakeData = stakeData;
      }
    }
  });

  inject('stake', stake);
};
