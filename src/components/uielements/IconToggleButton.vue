<template>
  <a class="icon-button" @click="$emit('click')" data-e2e="icon-toggle-button">
    <component v-if="status" :is="iconOn" />
    <component v-else :is="iconOff" />
  </a>
</template>

<script lang="ts">
  /**
  /* Icon button 
  /* @prop iconOn - svg icon on status
  /* @prop iconOff - svg icon off status
  /* @prop color - svg icon color
  /* @event click - emits click
  /*    
  /* @version 0.2
  /* @author Wim Jurriaans
  /* 
  /*
  */

  import { 
          defineComponent, 
          ref 
         }                   from 'vue';
  
  
  export default defineComponent({
    name : "IconToggleButton",
    props : {
      iconOn: {
        type: Object,
        default: null
      },
      iconOff: {
        type: Object,
        default: null
      },
      status: {
        type: Boolean,
        default: false
      }
    },
    emits: ['click'],
  });

</script>

<style lang="scss" scoped>

  @use "@/scss/includes/globals";

  .icon-button {
    position: relative;
    display: block;
    width: 40px;
    height: 40px;
    display: block;
    cursor: pointer;
    svg {
      width: 26px;
      height: 26px;
      margin: 7px;
    }
    &:hover svg {
      opacity: .8;
    }
  }

</style>