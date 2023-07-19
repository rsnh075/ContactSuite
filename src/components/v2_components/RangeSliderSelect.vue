<template>
  <div class="range-field" data-e2e="v2-range-slider-select">
    <label class="range-label">{{ label }}</label>
    <div class="range-value range-opener--js" @click="openFlyout">{{ rangeValue }}&nbsp;{{ unit }}</div>
    <div :class="['range-flyout', 'range--js', {'range-flyout--open' : flyOutStatus}]">
      <div class="range-minlabel range--js">{{ min }}</div> 
      <div class="range-input range--js">  
        <input class="range--js" type="range" name="outputvolume" :min="min" :max="max" :step="step" v-model="rangeValue" @input="updateValue()" @mouseup="updateValue()" @change="changeValue()" ref="rSlider"> 
        <div class="range-field__track--active range--js">
          <div class="range--js" :style="setWidth(rangeValue)"></div> 
        </div>
      </div>
      <div class="range-maxlabel range--js">{{ max }}</div>
    </div>
  </div>
</template>

<script>

  export default {
    name : 'RangeSliderSelect',
    props : {
      label : {
        type    : String,
        default : 'Label',
      },
      min : {
        type    : Number,
        default : 0,
      },
      max : {
        type    : Number,
        default : 0,
      },
      step : {
        type    : Number,
        default : 1,
      },
      value : {
        type    : Number,
        default : 0,
      },
      unit : {
        type    : String,
        default : '',
      },
    },
    data: () => {
      return {
        rangeValue   : 0,
        flyOutStatus : false
      }
    },
    watch: {
      value: function(newVal, oldVal) {
        this.rangeValue = newVal;
        this.updateValue();
      }
    },
    methods: {
      setWidth(val) {
        return `width:${((val-this.min)/(this.max-this.min))*100}%`;
      },
      updateValue() {
        this.$emit('update', +this.rangeValue);
      },
      changeValue() {
        this.flyOutStatus = false;
        this.$emit('onchange', +this.rangeValue);
      },
      openFlyout() {
        this.flyOutStatus = true;
      },
      closeFlyout(evt) {
        evt.stopPropagation();
        if(this.flyOutStatus && !evt.target.classList.contains('range-opener--js') && !evt.target.classList.contains('range--js'))
          this.flyOutStatus = false;
      }
    },
    mounted() {
      this.rangeValue = this.value;

      window.addEventListener('click', this.closeFlyout, false);
    },
    beforeUnmount() {
      window.removeEventListener('click', this.closeFlyout, false);
    }
  }
</script>

<style lang="scss" scoped>
  
  @use "@/scss/includes/font";
  @use "@/scss/includes/globals";
  @use "@/scss/includes/functions";

  .range-field {
    position: relative;
    float: left;
    width: 100%;
    .range-label {
      display: block;
      margin-top: -4px;
      font-size: .8rem;
      color: globals.$color-gray35;
      font-family: 'Open Sans SemiBold', sans-serif;
      margin-bottom: 10px;
      span {
        padding-left: 5px;
        font-weight: bold;
      }
    }
    .range-flyout {
      position: absolute;
      left: -10px;
      top: calc(100% + 10px);
      padding: 10px 10px 16px 10px;
      border-radius: 3px;
      box-shadow: 0 1px 10px 0 rgba(0, 0, 0, .3);
      background-color: globals.$color-white;
      width: 200px;
      display: none;
      &:before {
        content: '';
        position: absolute;
        border: 8px solid transparent;
        width: 0;
        height: 0;
        border-bottom-color: globals.$color-white;
        left: 10px;
        bottom: 100%;
      }
      &--open {
        display: block;
      }
    }
    .range-minlabel,
    .range-maxlabel {
      display: block;
      float: left;
      width: 30px;
      height: 20px;
      line-height: 20px;
      font-size: .9em;
      text-align: center;
      padding-top: 4px;
    }
    .range-value {
      position: relative;
      padding-right: 35px;
      margin-top: -10px;
      height: 30px;
      line-height: 30px;
      font-size: 1rem;
      border-bottom: 1px solid globals.$color-gray35;
      white-space: nowrap;
      overflow: hidden;
      color: globals.$color-gray60;
      &:after {
        content: '';
        position: absolute;
        width: 0;
        height: 0;
        top: calc(50% - 2px);
        left: calc(100% - 20px);
        border: 6px solid transparent;
        border-top-color: globals.$color-gray35;
        z-index: 2;
        pointer-events:none;
        user-select: none;
      }
    }
    .range-input {
      position: relative;
      display: block;
      float: left;
      width: calc(100% - 60px);
      input[type=range] {
        position: relative;
        width: 100%;
        height: 2px;
        appearance: none;
        border-radius: 1px;
        background: globals.$color-gray15; //$color-home;
        border: none;
        outline:none;
        &::-webkit-slider-thumb {
          background: globals.$color-home;
          appearance: none;
          width: 13px;
          height: 13px;
          border-radius: 50%; 
          cursor: pointer;
        }
        &::-moz-range-thumb {
          background: globals.$color-home;
          width: 13px;
          height: 13px;
          border-radius: 50%; 
          cursor: pointer;
        }
      }
    }
  }

  .range-field__track--active {
    //appearance: none;
    position: absolute;
    top: 14px;
    width: 100%;
    height: 2px;
    background-color: transparent;
    div {
      position: absolute;
      width: 0;
      height: 2px;
      border-radius: 1px;
      background: globals.$color-home;
    }
  }

</style>