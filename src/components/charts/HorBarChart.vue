<template>
  <div class="horbarchart-container" data-e2e="hor-bar-chart">
    <svg class="horbarchart" :viewBox="viewboxParams">
      <g v-for="(row, index) in sortedValues" :key="index" :transform="calcTransform(index)">
        <rect :width="getRectWidth(row[endlabel])" :height="rowheight"></rect>
        <text v-if="startlabel != ''" :class="['horbarchart-text--start', {'text--white' : startlabelindent == 0}]" :x="0.35 - startlabelindent" :y="0.75 * rowheight">{{ row[startlabel] }}</text>
        <text v-if="endlabel != ''" class="horbarchart-text--end" :x="getEndlabelPos(row[endlabel])" :y="0.75 * rowheight">{{ row[endlabel] }}</text>
      </g>
    </svg>
  </div>
</template>

<script>

  export default {
    name: 'HorBarChart',
    props: {
      datavalues : {
        type     : Array,
        default  : [],
      },
      startlabel : {
        type     : String,
        default  : '',
      },
      startlabelindent : {
        type     : Number,
        default  : 10,
      },
      endlabel : {
        type     : String,
        default  : '',
      },
      rowheight  : {
        type     : Number,
        default  : 2,
      },
      rowgap  : {
        type     : Number,
        default  : 0.5,
      }
    },
    data: () => {
      return {
        sortedValues   : [],
        viewBoxHeight  : 2.5, //default
        highestValue   : 100, //default
      }
    },
    computed: {
      viewboxParams() {
        return '-' + this.startlabelindent + ' 0 ' + (100 + this.startlabelindent) + ' ' + this.viewBoxHeight;
      }
    },
    watch: {
      datavalues: function doesUpdate() {
        this.sortedValues = [];
        this.processData();
      },
    },
    methods: {
      processData() {
        this.sortedValues = this.datavalues;
        this.highestValue = this.datavalues && this.datavalues.length > 0  ? this.getHighestVal() : 100;
        this.viewBoxHeight = this.datavalues && this.datavalues.length > 0 ? this.datavalues.length * (this.rowheight + this.rowgap) : (this.rowheight + this.rowgap);
      },
      getHighestVal() {
        let _highestNum = this.datavalues.reduce((acc, num) => {
          if(acc < num[this.endlabel])
            return acc = num[this.endlabel];
          else
            return acc;
        }, 0);
        return _highestNum;
      },
      getRectWidth(rectLength) {
        return (100 / this.highestValue) * rectLength;
      },
      getEndlabelPos(rectLength) {
        return ((100 / this.highestValue) * rectLength) - 0.35;
      },
      calcTransform(index) {
        let _amount = (index * (this.rowheight + this.rowgap));
        return 'translate(0, ' + _amount + ')';
      },
    },
    mounted() {
      this.viewBoxHeight = this.rowheight + this.rowgap; //minimal height (not zero!)
      this.processData();
    }
  }

</script>

<style lang="scss">

  @use "@/scss/includes/functions";
  @use "@/scss/includes/globals";

.horbarchart-container {
  width: 100%;
  height: 100%;
}

.horbarchart rect {
  fill: globals.$color-performance;
}

.horbarchart text {
  font-family: 'Open Sans Regular', sans-serif;
  font-size: 1.3px;
}

.horbarchart-text--start {
  fill: globals.$color-gray60;
  text-anchor: start;
  &.text--white {
    fill: globals.$color-white;
  }
}

.horbarchart-text--end {
  fill: globals.$color-white;
  text-anchor: end;
}

</style>