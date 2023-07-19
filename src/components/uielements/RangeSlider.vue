<template>
  <div class="range-field" data-e2e="range-slider">
    <label class="range-label">{{ label }}</label> 
    <input type="range" name="outputvolume" :min="min" :max="max" :step="step" v-model="rangeValue" @input="updateValue()" @mouseup="updateValue()" ref="rSlider"> 
    <div class="range-field__track--active" :style="setWidth(rangeValue)"></div> 
  </div>
</template>

<script>
  export default {
    name : 'RangeSlider',
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
      }
    },
    data: () => {
      return {
        rangeValue : 0,
      }
    },
    watch: {
      value: function(newVal, oldVal) {
        this.rangeValue = newVal;
        this.updateValue();
      }
    },
    computed: {
      setWidth : function() {
        return function(val) {
          return `width:${val}%`;
        }
      },
    },
    methods: {
      updateValue() {
        this.$emit('update', parseInt(this.rangeValue));
      },
      changeValue() {
        this.$emit('change', parseInt(this.rangeValue));
      }
    },
    mounted() {
      this.rangeValue = this.value;
    },
  }
</script>

<style lang="scss">
  
  @use "@/scss/includes/functions";
  @use "@/scss/includes/globals";

  .range-field {
    position: relative;
    float: left;
    width: 100%;
    .range-label {
      display: block;
      margin-bottom: 10px;
      font-size: .7rem;
      font-family: 'Open Sans SemiBold', sans-serif;
    }
    input[type=range] {
      position: relative;
      width: 100%;
      height: 2px;
      appearance: none;
      border-radius: 1px;
      background: globals.$color-gray15; //globals.$color-home;
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

  .range-field__track--active {
    position: absolute;
    top: 34px;
    width: 10%;
    height: 2px;
    appearance: none;
    border-radius: 1px;
    background: globals.$color-home;
  }

</style>