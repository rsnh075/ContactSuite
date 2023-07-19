<template>
    <div class="select-field">
      <label v-show="label !== ''">{{ label }}}</label>
      <select @change="$emit('update:selectedValue', $event.target.value)" data-e2e="css-select">
        <option v-for="option in options" :key="option.value" :value="option.value" :selected="option.value === selectedValue">{{ option.label }}</option>
      </select>
    </div>
</template>

<script lang="ts">
  /**
   * 
   * Normal Select CS Styled
   * 
   * @param label - label on top of the selectbox, if '' label is not shown
   * @param options - List of opions {label: String, value: String, Number}
   * @param selectedValue - The value of the selected option in the optionlist
   * @event onchange - fires on the select of a option and returns the selectedValue
   * 
   * @author Wim jurriaans
   * @version 1.0
   * 
   * 
   */

  import { defineComponent } from 'vue';

  export default defineComponent({
    name : 'CsSelectField',
    props: {
      label : {
        type : String,
        default : ''
      },
      options : {
        type : Array,
        default : [],
      },
      selectedValue : {
        type : [String, Number],
        default : ''
      }
    },
    emits: ['update:selectedValue'],
  });
</script>

<style lang="scss" scoped>

  @use "@/scss/includes/font";
  @use "@/scss/includes/globals";
  @use "@/scss/includes/functions";
  
  .select-field {
    position: relative;
    background-color: transparent;
    &:before {
      content: "";
      position: absolute;
      width: 0;
      height: 0;
      top: 50%;
      right: 10px;
      border: 6px solid transparent;
      border-top-color: globals.$color-gray35;
      z-index: 2;
      pointer-events:none;
      user-select: none;
    }
    label {
      height: 100%;
      top: 2px;
      position: relative;
      opacity: 1;
      &.form-label--lowered {
        top: 5px;
        min-height: 14px;
      }
    }
    select {
      appearance: none; 
      border: none;
      border-bottom: 1px solid globals.$color-gray35;
      background-color: transparent;
      height: 40px;
      line-height: 40px;
      width: 100%;
      color: globals.$color-gray60;
      font-size: 1rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 0 30px 0 5px;
      @include font.font-normal();
      &:focus {
        outline: 0;
      }
      option {
        background-color: globals.$color-white;
        font-size: 1rem;
      }
      option[selected="selected"] {
        background-color: globals.$color-secondary;
        color: globals.$color-white;
      }
    }
  }
 
</style>