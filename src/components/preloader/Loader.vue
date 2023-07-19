<template>
  <div class="modal" data-e2e="loader">
      <div class="loader">
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
        <div class="label">{{ message }}</div>
      </div>
    </div>
</template>

<script lang="ts">
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
 
  export default {
    name : "Loader",
    props : {
      message : {
        type     : String,
        default  : 'Loading...',
        required : false
      }
    }
  }

</script>

<style lang="scss" scoped>
  .modal {
    position: absolute;
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
  .loader {
    position: absolute;
    width: auto;
    max-width: 280px;
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
      transform: scale(.5);
    }
    z-index: 100;
    .label {
      margin-top: -20px;
    }
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