<template>
  <div>
    <div
      class="stake-block px-2 py-6 has-background-light is-flex is-justify-content-center is-align-items-flex-start"
      style="height:100%"
    >
      <div class="has-text-centered py-6">
        <div v-if="expectedRewards !== null" class="box has-text-centered mb-6">
          <p>Expected daily rewards</p>
          <h2 class="title is-3 has-text-success mb-0">
            <ICountUp
              :end-val="parseFloat(expectedRewards)"
              :options="{ decimalPlaces: 0, duration:0.1 }"
              style="opacity:0"
            />
            <ICountUp
              :end-val="parseFloat(expectedRewards)"
              :options="{ decimalPlaces: 0 }"
              style="position:absolute;width: 100%;text-align: center;left: 0;"
            />
          </h2>
          <p>NOS</p>
        </div>
        <h2 class="subtitle">
          <b>Reward program starting in</b>
        </h2>
        <div>
          <client-only>
            <countdown :end-time="new Date('2022-08-29T13:14:15.000Z')">
              <span
                slot="process"
                slot-scope="{ timeObj }"
              >
                <div class="columns is-mobile is-multiline">
                  <div class="column is-3-desktop  is-6-touch">
                    <div class="has-background-grey-light has-radius title mb-0 p-4">
                      {{ timeObj.d }}d
                    </div>
                  </div>

                  <div class="column is-3-desktop  is-6-touch">
                    <div class="has-background-grey-light has-radius title mb-0 p-4">
                      {{ timeObj.h }}h
                    </div>
                  </div>

                  <div class="column is-3-desktop  is-6-touch">
                    <div class="has-background-grey-light has-radius title mb-0 p-4">
                      {{ timeObj.m }}m
                    </div>
                  </div>

                  <div class="column is-3-desktop  is-6-touch">
                    <div class="has-background-grey-light has-radius title mb-0 p-4">
                      {{ timeObj.s }}s
                    </div>
                  </div>
                </div>

              </span>
              <span slot="finish">
                <h1 class="title">Now LIVE</h1>
              </span>
            </countdown>
          </client-only>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ICountUp from 'vue-countup-v2';

export default {
  components: {
    ICountUp
  },
  props: ['xnos', 'stakeData'],
  data () {
    return {
      totals: null
    };
  },
  computed: {
    expectedRewards () {
      if (!this.totals) { return null; }
      let totalXnos = this.totals.xnos;
      if (this.stakeData) {
        totalXnos -= this.stakeData.amount;
      }
      return (this.xnos * 1e6 / (totalXnos + this.xnos * 1e6)) * (8000000 / 365);
    }
  },
  mounted () {
    this.getStakeTotals();
  },
  methods: {
    async getStakeTotals () {
      try {
        this.totals = await this.$axios.$get('/stake/totals');
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        });
      }
    }
  }
};
</script>
