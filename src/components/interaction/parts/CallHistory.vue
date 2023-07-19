<script lang="ts">

/**
 *
 * Call history
 *
 *
 * @project ContactSuite
 * @version 1.0
 * @author Erik Rosenhart
 * @copyright 2017
 * @licence MIT
 *
 * @date 10-12-2021
 * @modified
 *
 * @todo
 *
 */

import { useStore }             from 'vuex';
  import {
          defineComponent, inject
         }                        from 'vue';

export default defineComponent({
  name : 'CallHistory',
  props: {
    tabprops : {
      type    : Object,
      default : {}
    },
    isactive : {
      type : Boolean,
      default : false
    }
  },
  setup() {
    const store:object | any       = useStore(),
          toggleLoader:Function    = inject('toggleLoader');

    toggleLoader(false);

    return {
      store
    }
  }
});
</script>

<template>
    <div class="call-history-wrapper" data-e2e="call-history">
        <!-- <div>Belgeschiedenis</div> -->
    </div>
</template>

<style lang="scss" scoped>
@use "@/scss/includes/font";
@use "@/scss/includes/globals";
@use "@/scss/includes/functions" as fn;

.call-history-wrapper {
    position: absolute;
    top: 0px;
    right: 0;
    bottom: 0;
    left: 0px;
    overflow: hidden;
    // transition: left .2s ease-in-out,
    //             right .2s ease-in-out;
    z-index: 100;
    background-image: url('/assets/images/app-background.jpg');
    background-position: center center;
    background-size: cover;
    // background-image: linear-gradient(#FAFAFA, #FAFAFA 160px, #F2F2F2 160px, #F2F2F2);
}

</style>