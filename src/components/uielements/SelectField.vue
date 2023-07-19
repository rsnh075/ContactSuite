<template>
    <div class="selectfield" data-e2e="select-field">
      <select :value="modelValue" @change="evt => $emit('update:modelValue', evt.target.value)" :disabled="isdisabled" :data-validate="validateon" :data-message="validatemsg">
        <option :value="valdefaultlbl">{{ defaultlbl }}</option>
        <option v-for="(opt, keyprop) in list" :key="keyprop" :value="opt[valprop]" :disabled="opt.isdisabled !== 'undefined' && opt.isdisabled" :readonly=" opt.isreadonly !== 'undefined' && opt.isreadonly">{{ opt[lblprop] }}</option>
      </select>
    </div>
</template>

<script lang="ts">
  /**
   *
   * select
   * @prop {boolean} list.isdisabled - option is disabled.
   * @prop {boolean} list.isreadonly - option is readonly.
   *
   * @author Erik Rosenhart <rsnh075@gmail.com>
   *
   * @version 1.0
   *
   * @todo
   *
   */
  import { defineComponent, emit } from 'vue';

  export default defineComponent({
    name : 'selectfield',
    props: {
      list : {
        type      : Array,
        default   : [],
        required  : true
      },
      defaultlbl  : {
        type      : [String, Number],
        required  : true
      },
      modelValue : {
        type      : [String, Number],
        default   : '',
        required  : true
      },
      valprop     : {
        type      : [String, Number],
        required  : true
      },
      lblprop     : {
        type      : [String, Number],
        required  : true
      },
      valdefaultlbl : {
        type      : [String, Number],
        default   : ''
      },
      isdisabled  : {
        type      : Boolean,
        default   : false
      },
      validateon  : {
        type      : String,
        default   : ''
      },
      validatemsg : {
        type      : String,
        default   : ''
      },
      keyprop : {
        type      : String,
        default   : 'index',
      }
    },
    emits: ['update:modelValue'],
  });
</script>

<style lang="scss" scoped>

  @use "@/scss/includes/font";
  @use "@/scss/includes/globals";
  @use "@/scss/includes/functions";



  .selectfield {
    position: relative;
    background-color: transparent;
    //overflow: hidden;
    padding-bottom: 13px;
    &:before {
      content: "";
      position: absolute;
      width: 0;
      height: 0;
      top: calc(50% + 2px);
      left: calc(100% - 20px);
      border: 6px solid transparent;
      border-top-color: globals.$color-gray35;
      z-index: 2;
      pointer-events:none;
      user-select: none;
    }
    &--disabled:before {
      border: none;
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
      margin-top: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-left: 3px;
      padding-top: 5px;
      padding-right: 30px;
      @include font.font-normal();
      &.smaller-font {
        font-size: .9rem;
        color: globals.$color-gray60;
      }
      &:focus {
        outline: 0;
      }
      option {
        background-color: globals.$color-white;
        font-size: 1rem;
      }

      option[selected] {
        background-color: globals.$color-secondary;
        color: globals.$color-white;
      }
      // &:disabled {
      // border-bottom: 1px solid globals.$color-gray25;
      // color: globals.$color-gray35;
      // user-select: none;
      // }
      option:disabled:not(:first-of-type) {
        background-color: rgba(128, 128, 128, 0.45);
      }
    }
  }

</style>