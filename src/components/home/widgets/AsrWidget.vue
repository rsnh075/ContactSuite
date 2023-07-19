<template>
  <div id="asr-widget" data-e2e="asr-widget">
    <div class="widget widget--asr">
      <h2 class="widget-header">{{ $store.state.settings.widgets.calldistribution }}</h2>
      <h4 class="widget-subhead">{{ $store.state.settings.widgets.lastupdatedlbl }}&nbsp;{{ lastUpdated }}</h4>
    </div>
    <div v-if="dividerList.length > 0" class="widget--asr__select">
      <label>{{ $store.state.settings.widgets.asrselectlabel }}</label>
      <select v-model="currentDivider" @change="setDivider(currentDivider)">
        <option v-for="(divider, index) in dividerList" :value="index" :key="index">{{ divider.Name }}</option>
      </select>
      <hr class="widget--asr__hr">
    </div>
    <div v-if="dividerList.length > 0" class="widget-content widget-content--asr">
      <donut-chart v-if="hasDataToShow"
        :datavalues="asrDividerData"
        :showtime="false"
        :innerradius="55"
      />
      <div v-else class="list-message"><span>{{ $store.state.settings.widgets.asrzerocallscounted }}</span></div>
    </div>
  </div>
</template>

<script>
  import DonutChart               from './../../charts/DonutChart.vue';
  import { IPCCCUserSettings }    from '../../../ipccc/js/usersettings.js';
  import { IPCCCData }            from '../../../ipccc/js/data.js';

  export default {
    name: 'ASRWidget',
    props: [],
    components: {
      'donut-chart'         : DonutChart,
    },
    data: () => {
      return {
        customerId      : -1,
        asrDividerData  : [],
        lastUpdated     : '',
        updateTimer     : 0,
        updateInterval  : 1,
        colors          : ["#2ED8C3", "#2A8A96", "#0090E3", "#3C67BC"],
        dividerList     : [],
        currentDivider  : 0,
      }
    },
    computed: {
      hasDataToShow() {
        return this.dividerList.length > 0 &&
          this.dividerList[this.currentDivider]?.Counters &&
          this.dividerList[this.currentDivider]?.Counters.length > 0 &&
          this.dividerList[this.currentDivider]?.Counters.some(d => d.Count > 0);
      }
    },
    watch: {
      '$route' (to, from) {
        if(to.path !== '/home/') {
          this.stopInterval();
        } else {
          this.getData();
        }
      }
    },
    methods: {
      getData() {
        this.customerId = this.$store.getters.getCustomerInfo().customerId;
        IPCCCData.RequestData('CALLDIVIDERCOUNTERS')
        .then(result => {
          let _data = [...JSON.parse(result)];
          // _data[this.currentDivider].Counters.forEach(el => el.Count = el.Count + Math.floor(Math.random() * 100) + 1); //For testing with data >
          this.dividerList = _data;
          if(this.hasDataToShow) {
            this.asrDividerData = _data[this.currentDivider].Counters.reduce((acc, curr, index) => {
              acc = acc.concat({
                color : this.colors[index],
                data  : curr.Count,
                id    : index + 1,
                label : curr.Name
              });
              return acc;
            }, []);
          }
          this.setLastUpdated();
        })
        .catch(error => {
          console.log('Error: ', error);
          this.dividerList = this.asrDividerData = [];
          this.setLastUpdated();
        });
      },
      setDivider(dividerIndex) {
        this.currentDivider = dividerIndex;
        this.setSettings();
        this.getData();
      },
      getCurrentTime() {
        return new Date().toTimeString().substring(0, 5);
      },
      setLastUpdated() {
        this.lastUpdated = this.getCurrentTime();
        this.startInterval();
      },
      startInterval() {
        clearInterval(this.updateTimer);
        this.updateTimer = setInterval(this.getData, (this.updateInterval * 60 * 1000));
      },
      stopInterval() {
        clearInterval(this.updateTimer);
      },
      //----------------------------------------------------------USERSETTINGS
      setSettings() {
        let _filterSettings = {
          currentDivider : this.currentDivider
        };

        IPCCCUserSettings.Save('ASRWidgetSettings', 'ASRWidgetUserSettings', JSON.stringify(_filterSettings)).catch(_ => console.error('ASRWidgetUserSettings not saved'));
      },
      getSettings() {
        IPCCCUserSettings.Get('ASRWidgetSettings')
        .then(result => {
          result.forEach(setting => {
            if(setting.Name === 'ASRWidgetUserSettings') {
              let _data = JSON.parse(setting.Data);
              if(_data.currentDivider) this.currentDivider = _data.currentDivider;
            } else {
              //NO SETTINGS FOUND ALL DEFAULT;
            }
          });
          this.getData();
        })
        .catch(error => {
          console.error('Settings not loaded or not set ', error);
        })
      },
    },
    mounted() {

      if(this.$store.getters.getCustomerInfo().customerId != -1) {
       this.getSettings();
      }

      this.$store.watch(this.$store.getters.getCustomerInfo, obj => {
        if(obj.customerId != -1 && this.$router.currentRoute.value.path === '/home/') {
          this.getSettings();
        }
      });
    }
  }
</script>

<style lang="scss" scoped>
  @use "@/scss/includes/globals";
  @use "@/scss/includes/widget";

  #asr-widget {
    width: 100%;
    min-height: 404px;
    height: 404px;
    max-height: 404px;
  }
  .widget {
    padding: 0;
  }
  .widget--asr {
    width: 100%;
    box-shadow: none;
    height: 390px;
    &__hr {
      margin-top: 2px;
      opacity: 0.4;
    }
    &__select {
      height: 60px;
      position: absolute;
      padding-top: 3px;
      top: 72px;
      left: 1rem;
      right: 1rem;
      &:before {
        content: "";
        position: absolute;
        width: 0;
        height: 0;
        top: calc(50% + 4px);
        left: calc(100% - 1.4rem);
        border: 8px solid transparent;
        border-top-color: globals.$color-gray35;
        z-index: 2;
        pointer-events:none;
        user-select: none;
      }
      label {
        position: relative;
        display: block;
        width: 100%;
        height: 20px;
        line-height: 20px;
        font-size: .7rem;
        text-indent: 2px;
        color: globals.$color-gray40;
        overflow: hidden;
        margin-bottom: -10px;
        padding-top: 3px;
      }
      select {
        appearance: none;
        border: none;
        background-color: transparent;
        height: 35px;
        line-height: 35px;
        width: calc(100% - 10px);
        color: globals.$color-gray60;
        font-size: .9rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        // @include font-normal();
        font-family: 'Open Sans Regular', sans-serif;
        margin-top: 2px;
        padding-top: 5px;
        padding-right: 30px;
        text-indent: 2px;
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
  }

  .widget-subhead {
    color: globals.$color-gray40;
    font-size: .8em;
    font-family: 'Abel', sans-serif;
    font-weight: normal;
  }

  .widget-content--asr {
    left: 20px;
    right: 20px;
    top: 125px;
    overflow: hidden;
    .chart__legend {
      top: 153px;
    }
  }

</style>
