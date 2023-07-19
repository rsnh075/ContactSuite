<template>
  <div class="range-field" data-e2e="range-slider-values">
    <label class="range-label">{{ label }}<span>{{ checkRangeValue }}</span></label>
    <div class="range-minlabel">{{ getMinLabel() }}</div>
    <div class="range-input">  
      <input type="range" name="outputvolume" :min="min" :max="max" :step="step" v-model="rangeValue" @input="updateValue()" @mouseup="updateValue()" ref="rSlider"> 
      <div class="range-field__track--active">
        <div :style="setWidth(rangeValue)"></div> 
      </div>
    </div>
    <div class="range-maxlabel">{{ getMaxLabel() }}</div>
  </div>
</template>

<script>

  export default {
    name : 'RangeSliderValues',
    props : {
      label : {
        type    : String,
        default : 'Label',
      },
      min : {
        type    : Number,
        default : 0,
      },
      minlabel : {
        type    : String,
        default : ''
      },
      max : {
        type    : Number,
        default : 0,
      },
      maxlabel : {
        type    : String,
        default : ''
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
    computed: {
      checkRangeValue() {
        return this.minlabel.length > 0 && this.rangeValue == this.min ? this.minlabel : this.rangeValue;
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
        this.$emit('update', parseInt(this.rangeValue));
      },
      changeValue() {
        this.$emit('change', parseInt(this.rangeValue));
      },
      getMinLabel() {
        return this.minlabel.length > 0 ? this.minlabel : this.min;
      },
      getMaxLabel() {
        return this.maxlabel.length > 0 ? this.maxlabel : this.max;
      }
    },
    mounted() {
      this.rangeValue = this.value;
    },
  }
</script>

<style lang="scss" scoped>
  
  @use "@/scss/includes/functions";
  @use "@/scss/includes/globals" as g;

  .range-field {
    position: relative;
    float: left;
    width: 100%;
    .range-label {
      display: block;
      margin-bottom: 10px;
      font-size: .7rem;
      font-family: 'Open Sans SemiBold', sans-serif;
      span {
        padding-left: 5px;
        font-weight: bold;
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
        background: g.$color-gray15; //$color-home;
        border: none;
        outline:none;
        &::-webkit-slider-thumb {
          background: g.$color-home;
          appearance: none;
          width: 13px;
          height: 13px;
          border-radius: 50%; 
          cursor: pointer;
        }
        &::-moz-range-thumb {
          background: g.$color-home;
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
      background: g.$color-home;
    }
  }

</style>