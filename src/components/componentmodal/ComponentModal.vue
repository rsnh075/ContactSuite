<template>
  <div :class="['dialogbox-modal', {'dialogbox-modal--visible' : visible}]" data-e2e="component-modal">
    <div class="dialogbox-pannel">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  // USAGE:
  // <component-modal :visible="myBoolean">
  //   <my-plugged-in-component @close="myBoolean = false" />
  // </component-modal>
  // example: see Assets.vue
  export default {
    name: 'ComponentModal',
    props: ['visible']
  }
</script>

<style lang="scss" scoped>

  @use "@/scss/includes/globals";

  .dialogbox-modal {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 110%;
    left: 0;
    background-color: rgba(0,0,0,.05);
    z-index: 1000000;
    opacity: 0;
    transition: opacity .2s;
    overflow: hidden;
    .dialogbox-pannel {
      display: none;
    }
    &--visible {
      bottom: 0;
      opacity: 100;
      .dialogbox-pannel {
        display: block;
      }
    }
  }

  .dialogbox-pannel {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 280px;
    min-height: 120px;
    border-radius: 3px;
    background-color: globals.$color-white;
    box-shadow: 0 0 16px 4px rgba(0,0,0,.5);
    z-index: 1000100;
  }


</style>