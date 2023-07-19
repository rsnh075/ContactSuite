<template>
  <div data-e2e="campaign-tab-general">
    <div class="grid-row">
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground">
          <input type="text" name="dataItemTitle" :placeholder="$store.state.settings.campaignmanager.formtitle" v-model="dataitem.Name" :data-validate="setValidation('isAtLeastTwoChar')" :data-message="$store.state.settings.campaignmanager.helptexttitle">
          <label for="dataItemTitle" class="form-label form-label--hidden">{{ $store.state.settings.campaignmanager.formtitle }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.campaignmanager.helptexttitle }}</div>
        </div>
      </div>
      <div class="grid-unit--beta">
        <div class="typo-input-label typo-input-label--select-search-fly-out">{{ $store.state.settings.campaignmanager.formcallflow }}</div>
        <SelectSearchFlyOut
          :options="workprocesses"
          :selectedvalue="selectedWorkProcessId"
          :defaultlabel="$store.state.settings.campaignmanager.formselectdefaultwp"
          labelproperty="Name"
          valueproperty="Id"
          @changed="setWorkProcessId"
        />
        <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.campaignmanager.helptextworkprocessid }}</div>
        <div class="hidden-validation">
          <input type="hidden" :value="dataitem.WorkProcessId" :data-validate="setValidation('isNotMinusOne')" :data-message="$store.state.settings.campaignmanager.formselectdefaultwp">
        </div>
      </div>
    </div>
    <div class="grid-row">
      <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.campaignmanager.startcriteriatxt }}</h2>
    </div>
    <div class="grid-row">
      <div v-if="showTelephonyFields" class="grid-unit--beta">
        <div class="typo-input-label typo-input-label--select-search-fly-out">{{ $store.state.settings.campaignmanager.formcallgroup }}</div>
        <SelectSearchFlyOut
          :options="routinggroups"
          :selectedvalue="selectedRoutingGroupId"
          :defaultlabel="$store.state.settings.campaignmanager.formselectdefaultrg"
          labelproperty="Titel"
          valueproperty="Id"
          @changed="setRoutingGroupId"
        />
        <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.campaignmanager.helptextroutinggroupid }}</div>
      </div>
      <div v-if="showTelephonyFields" class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground" v-unitslabel="{'label' : $store.state.settings.unitlabels.seconds}">
          <input type="text" name="dataItemAgentAvailability" v-model="dataitem.AgentAvailability" :data-validate="setValidation('^[0-9]$|^[1-9][0-9]$|^[1-4][0-9][0-9]|^[5][0][0]$')" :data-message="$store.state.settings.campaignmanager.validateavailability">
          <label for="dataItemAgentAvailability" class="form-label form-label--hidden">{{ $store.state.settings.campaignmanager.formagentavailability }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.campaignmanager.helptextavailability }}</div>
        </div>
      </div>
    </div>
    <div class="grid-row">
      <div v-if="showTelephonyFields" class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground" v-unitslabel="{'label' : $store.state.settings.unitlabels.percent}">
          <input type="text" name="dataItemSuccessRate" v-model="dataitem.SuccessRate" :data-validate="setValidation('isNotEmptyNr')" :data-message="$store.state.settings.campaignmanager.validatesuccessrate">
          <label for="dataItemSuccessRate" class="form-label form-label--hidden">{{ $store.state.settings.campaignmanager.formsuccessrate }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.campaignmanager.helptextsuccessrate }}</div>
        </div>
      </div>
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground">
          <input type="text" name="dataItemMaxSimultaneousCalls" v-model="dataitem.MaxSimultaneousCalls" :data-validate="setValidation('^[1-9]$|^[1-9][0-9]$|^[1-9][0-9][0-9]$')" :data-message="$store.state.settings.campaignmanager.validatemaxsimultaneouscalls">
          <label v-if="showTelephonyFields" for="dataItemMaxSimultaneousCalls" class="form-label form-label--hidden">{{ $store.state.settings.campaignmanager.formmaxsimultaneouscalls }}</label>
          <label v-else for="dataItemMaxSimultaneousCalls" class="form-label form-label--hidden">{{ $store.state.settings.campaignmanager.formmaxtextmessages }}</label>
          <div v-if="showTelephonyFields" :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.campaignmanager.helptextmaxsimultaneouscalls }}</div>
          <!-- <div v-else :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.campaignmanager.helptextxxxxx }}</div> -->
        </div>
      </div>
      <div v-if="showTelephonyFields" class="grid-unit--beta"></div>
    </div>
    <div class="grid-row">
      <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.campaignmanager.scheduletxt }}</h2>
    </div>
    <div class="grid-row">
      <div class="grid-unit--beta">
        <div class="form-checkbox form-checkbox--medium form-checkbox--fill-lablespace">
          <input type="checkbox" name="dataItemAutoActivate" id="dataItemAutoActivate" v-model="dataitem.AutoActivate">
          <label for="dataItemAutoActivate">{{ $store.state.settings.campaignmanager.formautoactivate }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.campaignmanager.helptextautoactivate }}</div>
        </div>
      </div>
      <div class="grid-unit--beta">
        <div class="typo-input-label typo-input-label--select-search-fly-out">{{ $store.state.settings.campaignmanager.formopeninghours }}</div>
        <SelectSearchFlyOut
          :options="openinghours"
          :selectedvalue="selectedOpeningHoursId"
          :defaultlabel="$store.state.settings.campaignmanager.formselectdefaultoh"
          labelproperty="Title"
          valueproperty="Id"
          @changed="setOpeningHoursId"
        />
        <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.campaignmanager.helptextopeninghours }}</div>
      </div>
    </div>
    <div class="grid-row">
      <div class="grid-unit--delta">
        <div class="form-textfield form-textfield--bground form-textfield--normal-form">
          <input id="datepickerCampaignFrom" type="text" v-model="fromDate" autocomplete="off">
          <label class="form-label form-label--hidden">{{ $store.state.settings.campaignmanager.formfromdate }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.campaignmanager.helptextfromdate }}</div>
        </div>
      </div>
      <div class="grid-unit--delta">
        <div class="form-textfield form-textfield--bground form-textfield--normal-form">
          <input type="text" v-model="fromTime" @keydown="checkTime($event, 'from')">
        </div>
      </div>
      <div class="grid-unit--delta">
        <div class="form-textfield form-textfield--bground form-textfield--normal-form">
          <input id="datepickerCampaignTill" type="text" v-model="tillDate" autocomplete="off">
          <label class="form-label form-label--hidden">{{ $store.state.settings.campaignmanager.formtilldate }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.campaignmanager.helptexttilldate }}</div>
        </div>
      </div>
      <div class="grid-unit--delta">
        <div class="form-textfield form-textfield--bground form-textfield--normal-form">
          <input type="text" v-model="tillTime" @keydown="checkTime($event, 'till')">
          <label class="form-label form-label--hidden">{{ $store.state.settings.campaignmanager.formtilltime }}</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import * as Mask           from './../../use/mask';
  import { UnitsLabel }      from './../../directives/unitslabel';
  import SelectSearchFlyOut  from './../uielements/SelectSearchFlyOut.vue';
  import {
          toISODate,
          ISOdateTimetoTime,
          ISOdateTimetoDate,
          pikaDayToDDMMYYYY
         }                   from './../../use/dateFunctions';
  import PikaDay             from 'pikaday';

  export default {
    name: 'CampaignTabGeneral',
    props: {
      showhelp : {
        type     : Boolean,
        default  : false
      },
      isactive : {
        type     : Boolean,
        default  : false
      },
      dataitem : {
        type     : Object,
        default  : false
      },
      workprocesses : {
        type     : Array,
        default  : []
      },
      routinggroups : {
        type     : Array,
        default  : []
      },
      openinghours : {
        type     : Array,
        default  : []
      },
    },
    data: () => {
      return {
        datepickerFrom   : null,
        datepickerTill   : null,
        fromDate         : '',
        fromTime         : '',
        tillDate         : '',
        tillTime         : '',
      }
    },
    components: {
      SelectSearchFlyOut
    },
    directives: {
      unitslabel : UnitsLabel
    },
    computed: {
      setValidation() {
        return type => {
          return this.isactive ? type : type + '_skip';
        }
      },
      selectedWorkProcessId() { return this.dataitem.WorkProcessId >= 0 ? this.dataitem.WorkProcessId : null; },
      selectedRoutingGroupId() { return this.dataitem.RoutingGroupId >= 0 ? this.dataitem.RoutingGroupId : null; },
      selectedOpeningHoursId() { return this.dataitem.OpeningHours2Id > 0 ? this.dataitem.OpeningHours2Id : null; },
      showTelephonyFields() { return this.dataitem.CommunicationType == 1; },
    },
    methods: {
      setWorkProcessId(id) {
        //TODO verplicht maken
        this.dataitem.WorkProcessId = id == 'null' ? -1 : parseInt(id);
      },
      setRoutingGroupId(id) {
        this.dataitem.RoutingGroupId = id == 'null' ? -1 : parseInt(id);
      },
      setOpeningHoursId(id) {
        this.dataitem.OpeningHours2Id = id == 'null' ? -1 : parseInt(id);
      },
      checkTime(evt, fromtill) {
        let _target  = evt.target;
        Mask.isTimeMask(evt);
        if (fromtill == 'from')
          this.fromTime = _target.value;
        else
          this.tillTime = _target.value;
        //TODO
        this.setDataItemDateTime(fromtill);
      },
      setDataItemDateTime(fromtill) {
        let _parts = [];
        if (fromtill == 'from') {
          _parts = this.fromDate.split('-');
          this.dataitem.From = _parts[2].concat('-' + _parts[1] + '-' + _parts[0] + 'T' + this.fromTime);
        } else {
          _parts = this.tillDate.split('-');
          this.dataitem.Till = _parts[2].concat('-' + _parts[1] + '-' + _parts[0] + 'T' + this.tillTime);
        }
        // if (fromtill == 'from')
        //   this.dataitem.From = toISODate(this.fromDate).split('T')[0].concat('T' + this.fromTime);
        // else
        //   this.dataitem.Till = toISODate(this.tillDate).split('T')[0].concat('T' + this.tillTime);
      },
      setFromDate(date) {
        this.fromDate = date;
        this.setDataItemDateTime('from');
      },
      setTillDate(date) {
        this.tillDate = date;
        this.setDataItemDateTime('till');
      },
      setDatePickerFrom() {
        this.datepickerFrom = new PikaDay({ 
          field: document.getElementById('datepickerCampaignFrom'),
          format: 'DD-MM-YYYY',
          minDate: new Date(),
          i18n: this.$store.state.settings.datepicker,
          onSelect: () => {
            this.setFromDate(pikaDayToDDMMYYYY(this.datepickerFrom));
          },
        })
      },
      setDatePickerTill() {
        this.datepickerTill = new PikaDay({
          field: document.getElementById('datepickerCampaignTill'),
          format: 'DD-MM-YYYY',
          minDate: new Date(),
          i18n: this.$store.state.settings.datepicker,
          onSelect: () => {
            this.setTillDate(pikaDayToDDMMYYYY(this.datepickerTill));
          },
        })
      },
    },
    mounted() {
      this.fromDate = ISOdateTimetoDate(this.dataitem.From);
      this.fromTime = ISOdateTimetoTime(this.dataitem.From);
      this.tillDate = ISOdateTimetoDate(this.dataitem.Till);
      this.tillTime = ISOdateTimetoTime(this.dataitem.Till);
      this.setDatePickerFrom();
      this.setDatePickerTill();
    }
  }

</script>
