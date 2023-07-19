<template>
  <div data-e2e=real-time-adherence-tresholds”>
    <div class="rtathresholds__wrapper">
      <div class="rtathresholds__col rtathresholds__col--toprow"></div>
      <div class="rtathresholds__col rtathresholds__col--toprow">
        <div class="panel panel-white">
          <ul class="rtathreshold-list rtathreshold-list__header rtathreshold-list__header--vertical" id="contentTop">
            <li v-for="(row, index) in thresholdList" :class="'js_header-' + index">
              <span>{{ row.CategoryName }}</span>
            </li>
          </ul>
        </div>  
      </div>
      <div class="rtathresholds__col rtathresholds__col--bottomrow">
        <div class="panel panel-white">
          <ul class="rtathreshold-list rtathreshold-list__header" id="contentLeft">
            <li v-for="(row, index) in thresholdList" :class="'js_leftcoll-' + index">{{ row.CategoryName }}</li>
          </ul>
        </div>  
      </div>
      <div class="rtathresholds__col rtathresholds__col--bottomrow">
        <div class="panel panel-white-flat">
          <ul class="rtathreshold-list rtathreshold-scrollAll" id="mainContent">
            <li v-for="(row, r_index) in thresholdList" class="rtathreshold-list-row">
              <span v-for="(cell, c_index) in row.Durations" :class="{'cell-empthy' : row.CategoryName == cell.CategoryName}">
                <input v-if="row.CategoryName != cell.CategoryName" 
                      type="text" 
                      class="form-threshold-input js_hover"
                      :data-pos="r_index + ',' + c_index" 
                      v-model="cell.ThresholdSeconds"
                      onFocus="this.select()" 
                      @mouseover="enterCell($event)" 
                      @mouseout="leaveCell($event)" 
                      @keydown="validateMinutes($event)">
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div class="rtathresholds__footer">
        <a :class="['button-primary', 'grid--push', {'button-primary--dimmed-gray' : !isChanged}]" @click="saveThresholds()">{{ $store.state.settings.rta.saveText }}</a>
      </div>
    </div>
  </div>
</template>

<script>


import * as Mask from './../../use/mask';
import {IPCCCConfigurator} from "../../ipccc/js/configurator";

export default {
  name: 'real-time-adherence-thresholds',  
  data: () => {
    return {
      isChanged: false,
      mainContent: null,
      contentTop: null,
      contentLeft: null,
      thresholdList: null,
      customerId: -1,
    }
  },
  inject: ['showLoader'],
  methods: {
    saveThresholds() {
      this.showLoader(true)
      let thresholdListToSend = this.convertMinutesToSeconds(this.thresholdList);

        IPCCCConfigurator.Request(this.customerId, 'rtathreshold', 'save', thresholdListToSend, null).then(result => {
        this.thresholdList = [];
        this.thresholdList = this.convertSecondsToMinutes(result);
        this.showLoader(false);
        this.isChanged = false;
      }).catch(error => {
        console.log('Error:', error);
        this.showLoader(false);
      });
    },
    convertMinutesToSeconds(list) {
      let _resultList = JSON.parse(JSON.stringify(list));
      _resultList.map(thresholds => thresholds.Durations.map(duration => duration.ThresholdSeconds *= 60));
      return _resultList;
    },
    convertSecondsToMinutes(list) {
      let _resultList = JSON.parse(JSON.stringify(list));
      _resultList.map(thresholds => thresholds.Durations.map(duration => duration.ThresholdSeconds /= 60));
      return _resultList;
    },
    contentScroll(evt) {
      let _target = evt.target;
      this.contentTop.scrollLeft   = _target.scrollLeft;
      this.contentLeft.scrollTop   = _target.scrollTop;
    },
    enterCell(evt) {
      let _coords = evt.target.getAttribute("data-pos").split(",");
      document.querySelector('.js_leftcoll-' + _coords[0]).classList.add("cell-hover");
      document.querySelector('.js_header-' + _coords[1]).classList.add("cell-hover");
    },
    leaveCell(evt) {
      let _coords = evt.target.getAttribute("data-pos").split(",");
      document.querySelector('.js_leftcoll-' + _coords[0]).classList.remove("cell-hover");
      document.querySelector('.js_header-' + _coords[1]).classList.remove("cell-hover");
    },
    validateMinutes(evt) {
      let _val    = Mask.isMaxNumberMask(evt, 999),
          _coords = evt.target.getAttribute("data-pos").split(",");
      
      this.isChanged = true;

      this.thresholdList[_coords[0]].Durations[_coords[1]].ThresholdSeconds = (_val != '') ? _val : 0;
    },
  },
  mounted() {
    this.customerId    = this.$store.state.loginSession.Details.CustomerId;
      IPCCCConfigurator.Request(this.customerId, 'rtathreshold', 'readall', null, -1).then(result => {
      this.thresholdList = this.convertSecondsToMinutes(result);
      
      this.mainContent   = document.getElementById("mainContent");
      this.contentTop    = document.getElementById("contentTop");
      this.contentLeft   = document.getElementById("contentLeft");
      this.mainContent.addEventListener('scroll', this.contentScroll, false);

    }).catch(error =>{
      console.log('Error: ' + error);
    });
    
    this.showLoader(false);
  },
  beforeUnmount() {  
    this.mainContent.removeEventListener('scroll', this.contentScroll, false);
  }, 
}
</script>
