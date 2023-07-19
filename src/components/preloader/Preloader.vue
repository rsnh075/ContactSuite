<script lang="ts">
export default {
  name: 'Preloader'
}
</script>
<script setup lang="ts">
/**
   *
   * full screen loader
   *
   * @author Wim Jurriaans
   *
   * @version 1.0
   *
   * @todo
   *
   *
  */

import { ref, watch, inject } from 'vue';
const showLoader = inject('showLoader') as Function;

const props = defineProps({
    isvisible : {
        type     : Boolean,
        default  : false,
        required : true
    },
    message : {
        type     : String,
        default  : 'Loading...',
        required : false
    }
});

const showCloseMessage = 'Unknown error';
const showClose = ref(false);

const hideLoader = () => {
    showLoader(false);
    showClose.value = false;
}

watch(() =>
    props.isvisible,
    (pShow: boolean) => {
        if (pShow) {
            let timeout = null;
            clearTimeout(timeout);
            showClose.value = false;
            timeout = setTimeout(() => { showClose.value = true }, 20000);
        }
    },
    { immediate: true }
);

</script>

<template>
  <teleport to="#preloader" :disabled="!isvisible" v-if="isvisible" data-e2e="preloader">
    <div class="modal">
      <div class="loader">
          <div class="list-close" v-if="showClose">
            <a class="close--js" @click="hideLoader()"><span></span> <span></span></a>
          </div>
        <svg height="100" width="100">
          <circle class="loader--animate" style="animation-delay:0s" cx="50" cy="50" r="45" fill="transparent" stroke-width="7" stroke-dasharray="314" stroke-dashoffset="278.75" stroke="#EC008C" transform="rotate(-90 50 50)"  />
          <circle class="loader--animate" style="animation-delay:.075s" cx="50" cy="50" r="45" fill="transparent" stroke-width="7" stroke-dasharray="314" stroke-dashoffset="278.75" stroke="#F7941D" transform="rotate(-45 50 50)"  />
          <circle class="loader--animate" style="animation-delay:.15s" cx="50" cy="50" r="45" fill="transparent" stroke-width="7" stroke-dasharray="314" stroke-dashoffset="278.75" stroke="#662D91" transform="rotate(0 50 50)"  />
          <circle class="loader--animate" style="animation-delay:.225s" cx="50" cy="50" r="45" fill="transparent" stroke-width="7" stroke-dasharray="314" stroke-dashoffset="278.75" stroke="#A88074" transform="rotate(45 50 50)"  />
          <circle class="loader--animate" style="animation-delay:.3s" cx="50" cy="50" r="45" fill="transparent" stroke-width="7" stroke-dasharray="314" stroke-dashoffset="278.75" stroke="#F5D025" transform="rotate(90 50 50)"  />
          <circle class="loader--animate" style="animation-delay:.375s" cx="50" cy="50" r="45" fill="transparent" stroke-width="7" stroke-dasharray="314" stroke-dashoffset="278.75" stroke="#39B54A" transform="rotate(135 50 50)"  />
          <circle class="loader--animate" style="animation-delay:.45s" cx="50" cy="50" r="45" fill="transparent" stroke-width="7" stroke-dasharray="314" stroke-dashoffset="278.75" stroke="#EF4136" transform="rotate(180 50 50)"  />
          <circle class="loader--animate" style="animation-delay:.525s" cx="50" cy="50" r="45" fill="transparent" stroke-width="7" stroke-dasharray="314" stroke-dashoffset="278.75" stroke="#00AEEF" transform="rotate(225 50 50)"  />
        </svg>
        <div v-if="showClose">{{ showCloseMessage }}</div>
        <div v-else>{{ message }}</div>
      </div>
    </div>
  </teleport>
</template>

<style lang="scss" scoped>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: rgba(255, 255, 255, .4);
    opacity: 1;
    transform: opacity .4s ease-in;
    z-index: 50000;

  }
  .list-close {
      padding: 15px;
      width: 0;
      height: 0;
      border-radius: 3px;
  }
  .list-close a span {
      width: 30%;
      left: 29px;
  }

  .loader {
    width: auto;
    max-width: 280px;
    position: absolute;
    top: calc(20% + 30px);
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 13px;
    font-family: sans-serif;
    text-align: center;
    color: #000;
    text-shadow: rgb(255, 255, 255, 1) 0px 0px 2px,
                 rgb(255, 255, 255, 1) 0px 0px 4px,
                 rgb(255, 255, 255, 1) 0px 0px 6px;
    svg {
      transform: scale(.8);
    }
    z-index: 50100;
  }

</style>

<style lang="scss">
  .loader--animate {
    animation: fullopaque .6s ease-in infinite;
    opacity: .2;
  }

  @keyframes fullopaque {
    0% {
      opacity: 1;
    }
    100% {
      opacity: .2;
    }
  }

</style>