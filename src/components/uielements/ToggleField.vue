<template>
  <div class="togglefield-button" data-e2e="toggle-field-button">
    <input type="checkbox"
      :id="`togglefield__${guid}`"
      name="togglefield"
      :checked="modelValue"
      @change="$emit('change:modelValue', $event.target.checked);"
      :data-e2e="datae2e"
    >
    <label :for="`togglefield__${guid}`" :style="'background-color:' + (modelValue ? togglecolor : '')"></label>
    <span v-show="label !== ''">{{ label }}</span>
  </div>
</template>

<script lang="ts">
  /**
   *
   * select
   *
   * @author Wim Jurriaans
   *
   * @version 1.0
   *
   * @todo
   *
   */

  import {
          defineComponent,
          ref
         }                       from 'vue';

  import {
          CheckboxBlank,
          CheckboxMarked
         }                       from "mdue";

  import { generateQuickGuid }   from './../../use/guid';


  export default defineComponent({
    name : 'ToggleField',
    props: {
      label: {
        type      : String,
        default   : '',
      },
      togglecolor: {
        type      : String,
        default   : '#6ABC45',
        required  : false
      },
      modelValue: {
        type      : Boolean,
        default   : '',
        required  : true
      },
      datae2e: {
        type      : String,
        default   : ''
      },
    },
    components: {
      CheckboxBlank,
      CheckboxMarked
    },
    emits: ['change:modelValue'],
    setup() {
      const guid:String         = ref(generateQuickGuid());

      return {
        guid
      }
    }
  });
</script>

<style lang="scss" scoped>

  @use "@/scss/includes/font";
  @use "@/scss/includes/globals";
  @use "@/scss/includes/functions";

  .togglefield-button {
    cursor: default;
    label {
      position: relative;
      display: block;
      width: 32px;
      height: 16px;
      border-radius: 10px;
      display: inline-block;
      margin-top: 10px;
      margin-bottom: 10px;
      // box-shadow: inset 0 1px 2px 0 rgba(0, 0, 0, 0.4);
      transition: box-shadow .2s ease-in-out;
      background-color: globals.$color-gray20;
      transition: background-color .2s ease-in-out;
      cursor: pointer;
      &:before {
        content: '';
        position: absolute;
        width: 12px;
        height: 12px;
        top: 2px;
        left: 2px;
        border-radius: 6px;
        // background-color: globals.$color-gray5;
        background-color: globals.$color-white;
        transition: left .1s ease-in-out;
        // box-shadow: 0 2px 4px 1px rgba(0, 0, 0, 0.3),
        //             inset 0 2px 0 0 rgba(255, 255, 255, .5),
        //             inset 0 -1px 0 0 rgba(0, 0, 0, .5);
      }
    }
    input[type='checkbox'] {
      position: absolute;
      left: -10000px;
      z-index: 10;
    }
    input[type='checkbox']:checked + label {
      // background-color: globals.$color-darkblue;
      &:before {
        left: calc(100% - 15px);
      }
    }
    span {
      display: table;
      text-align: center;
      font-size: .7em;
      color: globals.$color-gray35;
      word-break: keep-all;
      white-space: nowrap;
      overflow: hidden;
      margin-left: -20px;
      width: calc(100% + 40px);
    }
  }

  // .form-togglefield,
  // .form-radiotogglefield {
  //   width: 100%;
  //   height: 40px;
  //   margin-top: 10px;
  //   label {
  //     float: left;
  //     position: relative;
  //     border-radius: 10px;
  //     width: 40px;
  //     height: 20px;
  //     display: inline-block;
  //     margin-top: 10px;
  //     box-shadow: inset 0 0 0 0 $color-secondary;
  //     transition: box-shadow .2s ease-in-out;
  //     background-color: $color-gray20;
  //     &:before {
  //       content: "";
  //       position: absolute;
  //       display: block;
  //       z-index: 10;
  //       width: 16px;
  //       height: 16px;
  //       border-radius: 50%;
  //       background-color: $color-white;
  //       left: 2px;
  //       top: 50%;
  //       transform: translateY(-50%);
  //       transition: left .3s ease-in-out;
  //       cursor: pointer;
  //     }
  //     &:after {
  //       content: attr(data-label);
  //       position: absolute;
  //       left: 50px;
  //       top: 50%;
  //       transform: translateY(-50%);
  //       height: 40px;
  //       line-height: 40px;
  //       font-family: Sans-Serif;
  //       font-size: .8rem;
  //       color: $color-gray60;
  //       white-space: nowrap;
  //       cursor: pointer;
  //     }
  //   }
  //   input[type='checkbox'],
  //   input[type='radio'] {
  //     float: left;
  //     position: absolute;
  //     left: -10000px;
  //     z-index: 10;
  //     &:checked + label {
  //       box-shadow: inset 0 0 0 11px $color-secondary;
  //     }
  //     &:checked + label:before {
  //       left: calc(100% - 18px);
  //     }
  //     &:disabled + label,
  //     &:disabled + label:before {
  //       opacity: .5;
  //     }
  //   }
  //   &--nomargin { margin: 0; }
  //   &--inline-small,
  //   &--inline-small-list,
  //   &--inline-big {
  //     width: 100px;
  //     height: 35px;
  //     margin: 0 10px;
  //     float: left;
  //     label {
  //       border-radius: 8px;
  //       width: 30px;
  //       height: 16px;
  //       margin-top: 10px;
  //       background-color: $color-gray20;
  //       &:before {
  //         width: 14px;
  //         height: 14px;
  //         border-radius: 50%;
  //       }
  //       &:after {
  //         left: 36px;
  //       }
  //     }
  //     input[type='checkbox'],
  //     input[type='radio'] {
  //       &:checked + label {
  //         box-shadow: inset 0 0 0 11px $color-secondary;
  //       }
  //       &:checked + label:before {
  //         left: calc(100% - 16px);
  //       }
  //     }
  //   }
  //   &--inline-small-list {
  //     width: 100%;
  //     height: 40px;
  //     margin: 5px 0 0 0;
  //   }
  //   &--inline-big {
  //     width: 220px;
  //   }
  //   &--right label {
  //     float: right;
  //     &:after {
  //       left: auto;
  //       right: 45px;
  //     }
  //   }
  //   &--inline-right {
  //     float: right;
  //     width: 150px;
  //   }
  //   &--inline {
  //     float: left;
  //     width: 150px;
  //     margin-top: 1rem;
  //     label {
  //       float: right;
  //       &:after {
  //         left: auto;
  //         right: 50px;
  //       }
  //     }
  //   }
  // }

  // .form-togglefield--spanlabel {
  //   padding: 0 12px;
  //   width: auto;
  //   span {
  //     float: left;
  //     display: block;
  //     height: 40px;
  //     line-height: 40px;
  //     padding-right: 5px;
  //     font-size: .85em;
  //     color: $color-gray60;
  //   }
  //   label {
  //     float: left;
  //   }
  // }

  // .form-textfield__form-togglefield {
  //   .form-textfield input[type='text'] {
  //     width: calc(100% - 60px);
  //     white-space: nowrap;
  //     overflow: hidden;
  //     text-overflow: ellipsis;
  //   }
  //   .form-togglefield {
  //     position: absolute;
  //     top: 19px; right: 19px;
  //     width: auto;
  //   }
  //   .form-textfield--text-grey input[type='text']:read-only {
  //     color: $color-gray60;
  //     border-bottom: 1px solid $color-gray35;
  //     opacity: 0.5;
  //   }
  // }


</style>