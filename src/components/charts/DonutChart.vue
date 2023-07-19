<template>
  <div>
    <svg viewBox="-100 -100 200 200" class="chart__donut">
      <g transform="rotate(-90)">
        <path v-for="pie in sortedValues" :d="pieDimensions(pie.cum, pie.data)" :fill="pie.color" :fill-opacity=".8" @mouseover="showVal(pie.data, pie.label)" @mouseout="hideVal(pie.label)" :ref="`slice_${pie.label}`" />
        <circle v-if="innerradius != 0" cx="0" cy="0" :r="(innerradius/100) * 100" fill="white" />
      </g>
    </svg>
    <div v-if="alternatetime && !showHoverValue" class="chart__info">
      <span>{{ $store.state.statusLbl }}</span>
      <span >{{ $store.getters.getCurrentStatusTime().time }}</span>
    </div>
    <div v-else class="chart__info">
      <span>{{ selectedLabel }}</span>
      <span>{{ selectedTime }}</span>
    </div>
    <div v-if="legendheaders && legendheaders.length !== 0" class="chart__legend-header">
      <span class="chart__legend-bull"></span>
      <span>{{ legendheaders[0] }}</span>
      <span class="datastamp">{{ legendheaders[1] }}</span>
    </div>
    <div :class="['chart__legend', {'chart__legend--hasheader' : legendheaders.length !== 0}]">
      <ol>
        <li v-for="data in sortedValues" class="chart__legend-label" @mouseover="showVal(data.data, data.label)" @mouseout="hideVal(data.label)">
          <span class="chart__legend-bull" :style='"background-color:" + data.color'></span>
          <span :class="[{'active-item' : data.id === id}]">{{ data.label }}</span>
          <span :class="['datastamp', {'active-item' : data.id === id}]">{{ formatData(data.data) }}</span>
        </li>
      </ol>
    </div>
  </div>
</template>

<script>
  import { durationTime  }  from './../../use/dateFunctions';

  export default {
    name: 'DonutChart',
    props: {
      datavalues : {
        type    : Array,
        default : [],
      },
      showtime : {
        type    : Boolean,
        default : true,
      },
      innerradius : {
        type    : Number,
        default : 0,
      },
      id : {
        type    : Number,
        default : -1,
      },
      alternatetime : {
        type    : Boolean,
        default : false,
      },
      legendheaders : {
        type    : Array,
        default : () => [],
      }
    },
    data: () => {
      return {
        chartData      : [],
        selectedLabel  : '',
        selectedTime   : '',
        sortedValues   : [],
        dataProcessed  : false,
        startPointX    : 100,
        startPointY    : 0,
        showHoverValue : false,
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
        let _activeIndex    = -1;
        this.sortedValues = this.datavalues.reduce((acc, item, index) => {
          let _cum = index > 0 ? parseInt(acc[index-1].cum) + parseInt(acc[index-1].data) : 0;

          if(item.id === this.id) _activeIndex = index;

          acc.push({...item,
                    cum : _cum
                  })
          return acc;
        }, []);

        if(_activeIndex != -1) {
          this.sortedValues.unshift(this.sortedValues.splice(_activeIndex, 1)[0]);
          this.selectedLabel = this.sortedValues[0].label;
          this.selectedTime  = this.$store.getters.getCurrentStatusTime().time;
        }

      },
      calcTotalValue(data, prop) {
        return data.reduce((total, amount) => total + parseInt(amount[prop]), 0);
      },
      calcValue(val, total) {
        if (total == 0) return 0;
        return (val/total)*(2*Math.PI);
      },
      calcCoordinate(axis, val) {
        let _axis = axis === 'x' ? 'cos' : 'sin';
        return Math.round(Math[_axis](val) * 1000) / 10;
      },
      pieDimensions(startval, endval) {
        let _total     = this.calcTotalValue(this.datavalues, 'data'),
            _val       = this.calcValue(startval + endval, _total),
            _cumval    = this.calcValue(startval, _total),
            _largeArc  = (endval/_total) < .5 ? 0 : 1,
            _x         = this.calcCoordinate('x', _val),
            _y         = this.calcCoordinate('y', _val),
            _startX    = this.calcCoordinate('x', _cumval),
            _startY    = this.calcCoordinate('y', _cumval);

        let _pie  = `M0,0 L${_startX},${_startY} A100,100 0 ${_largeArc},1 ${_x},${_y} Z`;

        return _pie;
      },
      showVal(val, label) {
          const path = this.$refs["slice_" + label][0];
        path.setAttribute('fill-opacity','1');
        this.selectedTime   = this.formatData(val);
        this.selectedLabel  = label;
        this.showHoverValue = true;
      },
      hideVal(label) {
        const path = this.$refs["slice_" + label][0];
        path.setAttribute('fill-opacity','.8');
        this.selectedLabel  = this.sortedValues[0].label;
        this.selectedTime   = this.formatData(this.sortedValues[0].data);
        this.showHoverValue = false;
      },
      formatData(val) {
        return this.showtime ? durationTime(val) : val;
      },
    },
    mounted() {
      this.processData();
    }
  }

</script>

<style lang="scss" scoped>
  @use "@/scss/includes/chart";
</style>
