<template>
  <div :class="radioGroupStyle" data-e2e="radio-group">
    <span v-for="(radio, index) in radiogroup" :key="index">
      <input type="radio" :id="`radio_${guid}_${index}`" name="radio-group" :value="radio.value" :checked="radio.value === modelValue" @change="updateValue">
      <label :for="`radio_${guid}_${index}`" class="radio__label">
        <radiobox-marked class="svg__icon" />
        <radiobox-blank class="svg__icon" />
        {{ radio.label }}
      </label>
    </span>
  </div>
</template>

<script lang="ts">
  /**
  /* 
  /* 
  /* 
  /* 
  /*    
  /* @version 0.1
  /* @author Wim Jurriaans
  /* 
  /*
  */
  
  import { ref, computed, ComputedRef }       from "vue";
  import {  
          RadioboxMarked,
          RadioboxBlank
         }                       from "mdue";
  import { generateQuickGuid }   from './../../use/guid';


  export default {
    name : "RadioGroup",
    props : {
      radiogroup : {
        type: Array,
        default: []
      },
      additionalstyling: {
        type: String,
        default: ''
      },
      modelValue: {
        type: String,
        default: ''
      }
    },
    components: {
      RadioboxMarked,
      RadioboxBlank
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      const guid:String         = ref(generateQuickGuid());
      
      const radioGroupStyle:ComputedRef  = computed(() => `radio-group ${props.additionalstyling}`);

      const updateValue = (evt:Event):void => {
        emit('update:modelValue', evt.target.value);
      };

      return {
        guid,
        radioGroupStyle,
        updateValue
      }
    }
  };

</script>

<style lang="scss" scoped>

  @use "@/scss/includes/globals";

  .radio-group {
    width: 100%;
    height: auto;
    background-color: globals.$color-white;
    padding: 3px;
  }

  .radio-group [type=radio] {
    position: absolute;
    top: -2000px;
  }

  .radio-group .radio__label {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: flex-start;
    align-items: center;
    float: left;
    user-select: none;
    font-size: 0.9em;
    margin-right: 5px;
    height: 40px;
    line-height: 40px;
    .svg__icon {
      fill: globals.$color-home;
      width: 16px;
      height: 16px;
      margin-right: 2px;
      &:nth-child(1) {
        display: none;
      }
      &:nth-child(2) {
        display: inline-block;
      }
    }
  }

  .radio-group [type=radio]:checked + .radio__label {
    .svg__icon:nth-child(1) {
      display: inline-block;
    }
    .svg__icon:nth-child(2) {
      display: none;
    }
  }

</style>