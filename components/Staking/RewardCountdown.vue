<template>
  <div>
    <div
      class="stake-block px-2 py-6 has-background-light is-flex is-justify-content-center is-align-items-center"
      style="height:100%"
    >
      <div class="has-text-centered py-6">
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
