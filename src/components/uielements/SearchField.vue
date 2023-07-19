<template>
  <div class="search-field">
    <magnify class="magnify" />
    <input type="text" v-model="currentValue" :placeholder="placeholder" data-e2e="search-field_input" />
    <close class="clear" v-if="len > 0" @click="clear" />
  </div>
</template>

<script lang="ts">
  /**
   * 
   * @param minChars - minimal number of chars before the change event will fire
   * @param placeholder - placeholder tekst
   * @event oninput - fires on input, after the minChar condition is met
   * 
   *    
   * @version 0.1
   * @author Wim Jurriaans
   * 
   *
  */
  
  import { ref, computed, watch }       from "vue";
  import {  
          Magnify,
          Close
         }                       from "mdue";
  import { generateQuickGuid }   from './../../use/guid';


  export default {
    name : "SearchField",
    props : {
      minChars : {
        type: Number,
        default: 1
      },
      placeholder: {
        type: String,
        default: ''
      }
    },
    components: {
      Magnify,
      Close
    },
    emits: ['oninput'],
    setup(props, { emit }) {
      const currentValue  = ref(''),
            toggleIcon    = ref(false),
            guid          = ref(generateQuickGuid());
      
      const handleInput = ():void => {
        if(len.value >= props.minChars)
          emit('oninput', currentValue.value.trim());
      };

      watch(currentValue, (newVal:string, oldVal:string) => {
        if (newVal.trim() === oldVal.trim()) {
          return;
        }
        if (newVal.trim().length === 0) {
          clear();
        }
        handleInput();
      })

      const clear = ():void => {
        currentValue.value = '';
        emit('oninput', currentValue.value);
      }

      const len = computed(() => currentValue.value.length);

      return {
        guid,
        toggleIcon,
        currentValue,
        len,
        clear
      }
    }
  };

</script>

<style lang="scss" scoped>

  @use "@/scss/includes/globals";

  .search-field {
    position: relative;
    width: 100%;
    height: auto;
    background-color: globals.$color-white;
    input[type=text] {
      width: 100%;
      height: 40px;
      line-height: 40px;
      padding: 0 33px 0 40px;
      border: none;
      background-color: globals.$color-gray5;
      color: globals.$color-gray60;
      border-radius: 5px;
      font-size: 1em;
    }
    .magnify {
      position: absolute;
      left: 6px;
      top: 50%;
      transform: translateY(-50%);
      width: 26px;
      height: 26px;
      fill: globals.$color-gray20;
    }
    .clear {
      position: absolute;
      right: 6px;
      top: 50%;
      transform: translateY(-50%);
      fill: globals.$color-gray20;
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
  }


  

</style>