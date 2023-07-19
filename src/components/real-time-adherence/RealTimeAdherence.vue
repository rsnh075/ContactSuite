<template>
  <div data-e2e=real-time-adherence”>
    <div class="dashboard-wrapper">
      <div class="dashboard-row--alpha dashboard-topbar">
        <div class="list-topbar__title">
          <span class="typo-dashboardtitle">{{ $store.state.settings.rta.title }}</span>
        </div>
        <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small form-textfield--search--dashboardtop">
          <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings.addressbook.searchtxt" @keyup="filterList()">
        </div>
        <div class="form-togglefield form-togglefield--inline">
          <input type="checkbox" id="show-all" name="show-all" v-model="showAllAgents" @change="toggleAdherend">
          <label for="show-all" :data-label="$store.state.settings.rta.showall"></label>
        </div>
      </div>
      <div class="dashboard-header dashboard-header--rta">
        <ol class="dashboard-header__labels dashboard-header__labels--agentinfo">
          <li class="dashboard-header__labels-col dashboard-header__labels-col--rta">&nbsp;</li>
          <li class="dashboard-header__labels-col dashboard-header__labels-col--rta">{{ $store.state.settings.rta.tableheadtxt[0] }}</li>
          <li class="dashboard-header__labels-col dashboard-header__labels-col--rta">{{ $store.state.settings.rta.tableheadtxt[1] }}</li>
          <li class="dashboard-header__labels-col dashboard-header__labels-col--rta">{{ $store.state.settings.rta.tableheadtxt[2] }}</li>
          <li class="dashboard-header__labels-col dashboard-header__labels-col--rta">{{ $store.state.settings.rta.tableheadtxt[3] }}</li>
          <li class="dashboard-header__labels-col dashboard-header__labels-col--rta">{{ $store.state.settings.rta.tableheadtxt[4] }}</li>
          <li class="dashboard-header__labels-col dashboard-header__labels-col--rta">{{ $store.state.settings.rta.tableheadtxt[5] }}</li>
        </ol>
      </div>
      <div class="dashboard-data dashboard-data--rta" :class="{'dashboard-data--rta--snack-open' : true}">
        <ol>
          <li v-for="agent in agentMetrics" :key="agent.UserID" class="dashboard-content__rows dashboard-content__rows--agentinfo">
            <a class="button__row" @click="detailedPlanning($event, agent)">
              <span class="dashboard-content__rows-col dashboard-content__rows-col--agentinfo">
                <i :class="[ statusIconName[agent.StatusID] ]"></i>
                <span :style="{borderColor: getStatusColor(statusList, agent.StatusID)}"></span>
              </span>
              <span class="dashboard-content__rows-col dashboard-content__rows-col--rta">{{ agent.AgentName }}</span>
              <span class="dashboard-content__rows-col dashboard-content__rows-col--rta">{{ agent.CurrentCategory }}</span>
              <span class="dashboard-content__rows-col dashboard-content__rows-col--rta">{{ agent.PlannedActivity }}</span>
              <span class="dashboard-content__rows-col dashboard-content__rows-col--rta" v-html="showTime(agent.OutOfAdherenceDuration, ticker)"></span>
              <span class="dashboard-content__rows-col dashboard-content__rows-col--rta">
                <span :style="{backgroundColor: getStatusColor(statusList, agent.StatusID)}"></span>
                {{ agent.CurrentStatus }}
              </span>
              <span class="dashboard-content__rows-col dashboard-content__rows-col--rta">{{ agent.TeamManager }}</span>
            </a>  
          </li>
        </ol>
      </div>  
    </div>
  </div>
</template>

<script>

import { dynamicSort }      from '../../use/sortFunctions';
import { durationTime,
         substractDurations,
         timeToMillisec  }  from './../../use/dateFunctions';
import {IPCCCStatus}        from '../../ipccc/js/status';
import { IPCCCDashboard }   from './../../ipccc/js/dashboard.js';

export default {
  name: 'real-time-adherence',
  data: () => {
    return {
      searchStr: '',
      rawAgentMetrics: null,
      agentMetrics: [],
      statusList: [],
      showAllAgents: false,
      statusIconName: '',
      timer: -1,
      ticker: 0
    }
  },
  inject: ['showLoader'],
  methods: {
    detailedPlanning(evt, agent) {
      this.showLoader(true);
      this.$store.commit('SET_SNACKBAR', {
        isVisible: true,
        module: 'RtaDetails',
        templatename: 'rta-details-snackbar',
        data: {
          'userId'      : agent.UserID,
          'aName'       : agent.AgentName,
          'statusId'    : agent.StatusID,
          'statusColor' : this.getStatusColor(this.statusList, agent.StatusID),
          'statusIcon'  : this.getStatusIconName(agent.StatusID)
        },
      });
    },
    filterList() {
      if(this.rawAgentMetrics.length > 0) {
        this.agentMetrics = this.filterListOnString(this.rawAgentMetrics, this.searchStr.toLowerCase());
        if(!this.showAllAgents) 
          this.agentMetrics = this.filterAdherendAgents([...this.agentMetrics]);
        
        this.sortOnDuration();
      }
    },
    filterListOnString(list, str) {
      if(str != '') {
        let _rawList = [...list];
        return _rawList.filter(item => {
          return item.AgentName.toLowerCase().indexOf(str) != -1 ||
                 item.CurrentCategory.toLowerCase().indexOf(str) != -1 ||
                 item.CurrentStatus.toLowerCase().indexOf(str) != -1 ||
                 item.TeamManager.toLowerCase().indexOf(str) != -1;
               });
      } else {
        return [...list];
      }
    },
    sortOnDuration() {
      this.agentMetrics.sort(dynamicSort('-OutOfAdherenceDuration'));
    },
    getRTAStatus(duration, thresHold) {
      let _val = substractDurations(duration, thresHold);
      return _val > 0;
    },
    getStatusIconName(id) {
      return this.statusIconName[id];
    },
    getStatusColor(list, id) {
        if (list === undefined) return;
      let _labelObj = list.filter( ( obj ) => {
        return (obj && obj.StatusId == id);
      });
      return '#' + String((_labelObj && _labelObj.length > 0) ? _labelObj[0].Color : 'FFFFFF');
    },
    addRTAStatus(list) {
      list.map(item => {
        item.isAdherent = this.getRTAStatus(item.OutOfAdherenceDuration, item.ThresHold);
      });
      return list;
    },
    toggleAdherend() {
      if(this.agentMetrics.length > 0) {
        this.showAllAgents != this.showAllAgents;
        this.agentMetrics   = [];

        if(this.showAllAgents) 
          this.agentMetrics = [...this.rawAgentMetrics];
        else 
          this.agentMetrics = this.filterAdherendAgents([...this.rawAgentMetrics]);

        this.filterList();
      }
    },
    filterAdherendAgents(list) {
      let _list = list.filter(agent => {
        return agent.isAdherent == true;
      });
      return _list;
    },
    startTicker() {
      if(this.timer == -1) {
        this.timer = setInterval(() => {
            this.ticker++;
        }, 1000);
      }
    },
    stopTicker() {
      if(this.timer != -1) {
        clearInterval(this.timer);
        this.timer  = -1;
      }
    },
    deSubscribe() {
      IPCCCDashboard.Desubscribe('RTA', this.updateRTA);

      this.rawAgentMetrics         = null;
      this.agentMetrics            = null;
      this.statusList              = null;
      
      this.$store.commit('SET_SNACKBAR', {
        isVisible: false,
        module: '',
        templatename: '',
        data: {},
      });
      
      this.stopTicker();
    },
    showTime(time, ticker) {
      let _tms    = timeToMillisec(time),
          _result = '-';
      
      _result =  (_tms > 0) ? '<span class="typo--attention">' + durationTime((_tms/1000) + ticker) + '</span>' : '-';

      return _result;      
    },
    updateRTA(data) {
        if (typeof data === undefined) return;

        this.stopTicker();
        this.timer  = -1;
        this.ticker = 0;
        this.rawAgentMetrics = this.addRTAStatus(data);

        if(this.showAllAgents) 
            this.agentMetrics = [...this.rawAgentMetrics];
        else 
            this.agentMetrics = this.filterAdherendAgents([...this.rawAgentMetrics]);
        
        this.sortOnDuration();
        this.filterList();
        this.startTicker();
    }
  },
  mounted() {
    this.statusIconName = this.$store.state.settings.agentDashboard.statusIconName;
    IPCCCStatus.GetCompanyStatusList().then(success => {
      this.statusList      = success;
      IPCCCDashboard.Subscribe('RTA', this.updateRTA);
    }, (error) => {})        
    
    this.showLoader(false);
  },
  beforeUnmount() {
    this.deSubscribe();
  }
}
</script>

<style lang="scss" scoped>
  @use "@/scss/includes/dashboard";

</style>