<template>
  <div class="rangenumstepper__textfield rangenumstepper__stepper" data-e2e="range-number-stepper">
    <input ref="rangeNumStepperInput" :disabled="inputdisabled" type="number" v-model="inputValue" :min="minvalue" :max="maxvalue" :step="stepvalue" @keyup="checkVal">
    <a class="rangenumstepper-contols rangenumstepper__stepper-contols--minus" @click="modifyVal">&#xF377;</a>
    <a class="rangenumstepper-contols rangenumstepper__stepper-contols--plus" @click="modifyVal">&#xF419;</a>
  </div>
</template>

<script lang="ts">

/**
 *
 *
 * Min, Max, Step, disabled and Current values
 *
 * @author Erik Rosenhart <rsnh075@gmail.com>
 *
 * @version 1.0
 *
 * @todo
 *
 */

import { toNumber } from '@vue/shared';

export default {
    name: 'RangeNumStepper',
    props: {
        minvalue  : {
            type    : Number,
            default : 0,
        },
        maxvalue  : {
            type    : Number,
            default : 0,
        },
        stepvalue  : {
            type    : Number,
            default : 1,
        },
        inputvalue  : {
            type    : Number,
            default : 0,
        },
        inputdisabled  : {
            type    : Boolean,
            default : false,
        },
    },
    data() {
        return {
            changeTimer        : null,
            inputValue         : this.inputvalue,
        }
    },
    watch: {
        inputvalue: function(newVal, oldVal) {
            this.inputValue = newVal;
        }
    },
    methods: {
        emitValueChanged() {
            this.$emit('valuechanged', this.inputValue);
        },
        modifyVal(evt) {
            evt.stopPropagation();
            if(this.inputdisabled) return;
            let _target = evt.target,
                _add    = (_target.classList.contains('rangenumstepper__stepper-contols--minus')) ? -this.stepvalue : this.stepvalue;

            let _inputVal = this.inputValue;

            if(_add < 0 && _inputVal > this.minvalue) {
                this.inputValue = _inputVal + _add;
            }

            if(_add > 0 && _inputVal < this.maxvalue) {
                this.inputValue = _inputVal + _add;
            }

            this.emitValueChanged();

        },
        pasteNumber(currentVal) {
            setTimeout(() => {
                if(currentVal && !isNaN(currentVal) && currentVal >= this.minvalue && currentVal <= this.maxvalue) {
                    this.inputValue = currentVal;
                }
                else {
                    this.inputValue = this.minvalue;
                }
            });
        },
        checkVal(evt:KeyboardEvent) {
            clearTimeout(this.changeTimer);
            this.changeTimer = setTimeout(() => {
                let _inputVal = this.inputValue;

                if(evt.ctrlKey && evt.key == 'x' || evt.ctrlKey && evt.key == 'v') {
                    this.pasteNumber(parseInt(_inputVal, 10));
                }

                if(_inputVal < this.minvalue) {
                    this.inputValue = this.minvalue;
                }

                if(_inputVal > this.maxvalue) {
                    this.inputValue = this.maxvalue;
                }
            }, 200);
        },
    },
    mounted() {
        this.$refs['rangeNumStepperInput'].addEventListener('paste', (event) => {
            event.preventDefault();
            let paste = (event.clipboardData).getData('text');
            if (paste && typeof paste === 'string') this.pasteNumber(parseInt(paste, 10));
        });
    }
}
</script>

<style lang="scss">

  @use "@/scss/includes/functions";
  @use "@/scss/includes/globals";

  .rangenumstepper__textfield {
    position: relative;
    width: 100%;
    input[type='text'],
    input[type='email'],
    input[type='password'],
    input[type='tel'],
    input[type='number'] {
      // @include font-normal();
      font-family: 'Open Sans Regular', sans-serif;
      height: 35px;
      line-height: 35px;
      padding-top: 5px;
      width: 100%;
      border: none;
      border-bottom: 1px solid globals.$color-gray35;
      background-color: globals.$color-gray2;
      padding-left: 5px;
      resize:none;
      color: globals.$color-gray60;
      font-size: 1rem;
    }
  }

  .rangenumstepper-contols {
    position: absolute;
    width: 31px;
    height: 31px;
    line-height: 31px;
    text-align: center;
    top: 50%;
    transform: translateY(-50%);
    // @include font-icon();
    font-family: 'Material Design Icons';
    font-size: 1.4em;
    color: globals.$color-gray40;
    cursor: pointer;
    &:hover {
      color: globals.$color-availability;
    }
  }

  .rangenumstepper__stepper {
    position: relative;
    input[type='number'] {
      padding-right: 70px;
    }
    .rangenumstepper__stepper-contols {
      &--minus {
        right: 33px;
      }
      &--plus {
        right: 3px;
      }
    }
  }

</style>
