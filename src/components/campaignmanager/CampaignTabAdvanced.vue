<template> 
  <div data-e2e="campaign-tab-advanced">
    <div class="grid-row">
      <div class="grid-unit--beta">
        <div class="select-wrapper select-wrapper--paddingbottom">
          <div class="typo-input-label typo-input-label--select-search-fly-out">{{ $store.state.settings.campaignmanager.formoutboundnumberslbl }}</div>
          <SelectSearchFlyOut
            :options="outboundnumbers"
            :selectedvalue="selectedOutboundIdentity"
            :defaultlabel="$store.state.settings.campaignmanager.formselectdefauloundnumber"
            labelproperty="Label"
            valueproperty="Number"
            @changed="setOutboundIdentity"
          />
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.campaignmanager.helptextoutboundnumbers }}</div>
        </div>
        <div v-if="showTelephonyFields" class="form-selectfield form-selectfield--inline-bground">
          <label class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.campaignmanager.formvoicemailprofileslbl }}</label>
          <select v-model="dataitem.VoicemailProfileId">
            <option value="-1">{{ $store.state.settings.campaignmanager.formselectdefaultvoicemailprofile }}</option>
            <option v-for="profile in voicemailprofiles" :key="profile.Id" :value="profile.Id">{{ profile.Name }}</option>
          </select>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.campaignmanager.helptextvoicemailprofileid }}</div>
        </div>
        <div>
          <div class="select-wrapper select-wrapper--paddingtop">
            <div class="typo-input-label typo-input-label--select-search-fly-out">{{ $store.state.settings.campaignmanager.formdepartmentslbl }}</div>
            <SelectSearchFlyOut
              :options="departments"
              :selectedvalue="selectedDepartmentId"
              :defaultlabel="$store.state.settings.campaignmanager.formselectdefaultdepartment"
              labelproperty="Title"
              valueproperty="Id"
              @changed="setDepartmentId"
            />
            <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.campaignmanager.helptextdepartments }}</div>
          </div>
        </div>
      </div>
      <div class="grid-unit--beta">
        <label class="typo-input-label typo-input-label--h20">{{ $store.state.settings.campaignmanager.advancedoptionlbl[0] }}</label>
        <div class="form-checkbox form-checkbox--medium">
          <input type="checkbox" name="advancedoption1" id="advancedoption1" v-model="dataitem.CleanupListAtNight">
          <label for="advancedoption1">{{ $store.state.settings.campaignmanager.advancedoptionlbl[1] }}</label>
        </div>
        <div v-if="showTelephonyFields" class="form-checkbox form-checkbox--medium">
          <input type="checkbox" name="advancedoption2" id="advancedoption2" v-model="dataitem.CallAnonymous">
          <label for="advancedoption2">{{ $store.state.settings.campaignmanager.advancedoptionlbl[2] }}</label>
        </div>
        <div v-if="showTelephonyFields" class="form-checkbox form-checkbox--medium">
          <input type="checkbox" name="advancedoption3" id="advancedoption3" v-model="dataitem.RecordCall">
          <label for="advancedoption3">{{ $store.state.settings.campaignmanager.advancedoptionlbl[3] }}</label>
        </div>
      </div>
    </div>
    <div class="grid-row">
      <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.campaignmanager.maintenancetxt }}</h2>
    </div>
    <div class="grid-row">
      <div class="grid-unit--beta">
        <label class="form-label form-label--list-inline">{{ $store.state.settings.campaignmanager.formpremoverecordslbl }}</label>
        <div class="form-radio-small form-radio-small--inline">
          <input type="radio" id="radio_one" value="time" v-model="picked">
          <label for="radio_one">{{ $store.state.settings.campaignmanager.formremoverecordsradiolbl[0] }}</label>
        </div>
        <div class="form-radio-small form-radio-small--inline">
          <input type="radio" id="radio_two" value="duration" v-model="picked">
          <label for="radio_two">{{ $store.state.settings.campaignmanager.formremoverecordsradiolbl[1] }}</label>
        </div>
        <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.campaignmanager.helptextadvancedoption }}</div>
      </div>
      <div v-show="picked == 'duration'" class="grid-unit--zeta">
        <div class="form-textfield form-textfield--bground form-textfield--normal-form" v-unitslabel="{'label' : $store.state.settings.unitlabels.days}">
          <input type="text" v-model="duration.days" @keydown="checkIsNumber($event, 'days')">
          <label class="form-label form-label--hidden">{{ $store.state.settings.campaignmanager.formafterdurationlbl }}</label>
        </div>
      </div>
      <div v-show="picked == 'duration'" class="grid-unit--zeta">
        <div class="form-textfield form-textfield--bground form-textfield--normal-form" v-unitslabel="{'label' : $store.state.settings.unitlabels.hours}">
          <input type="text" v-model="duration.hours" @keydown="checkIsNumber($event, 'hours')">
        </div>
      </div>
      <div v-show="picked == 'duration'" class="grid-unit--zeta">
        <div class="form-textfield form-textfield--bground form-textfield--normal-form" v-unitslabel="{'label' : $store.state.settings.unitlabels.minutes}">
          <input type="text" v-model="duration.minutes" @keydown="checkIsNumber($event, 'minutes')">
        </div>
      </div>
      <div v-show="picked == 'time'" class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground form-textfield--normal-form">
          <input type="text" v-model="dataitem.ListEmptyTime" @keydown="checkTime($event)">
          <label class="form-label form-label--hidden">{{ $store.state.settings.campaignmanager.formontimelbl }}</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import SelectSearchFlyOut  from './../uielements/SelectSearchFlyOut.vue';
  import * as Mask           from './../../use/mask';
  import { UnitsLabel }      from './../../directives/unitslabel';
  

  export default {
    name: 'CampaignTabAdvanced',
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
      outboundnumbers : {
        type     : Array,
        default  : []
      },
      voicemailprofiles : {
        type     : Array,
        default  : []
      },
      departments : {
        type     : Array,
        default  : []
      },
    },
    data: () => {
      return {
        picked          : '',
        // durationDays    : 0,
        // durationHours   : 0,
        // durationMinutes : 0,
        duration        : {
          days          : 0,
          hours         : 0,
          minutes       : 0
        }
      }
    },
    directives: {
      unitslabel : UnitsLabel,
    },
    components: {
      SelectSearchFlyOut
    },
    computed: {
      selectedOutboundIdentity() { return this.dataitem.OutboundIdentity.length > 0 ? this.dataitem.OutboundIdentity : null; },
      selectedDepartmentId() { return this.dataitem.DepartmentId >= 0 ? this.dataitem.DepartmentId : null; },
      showTelephonyFields() { return this.dataitem.CommunicationType == 1; }
    },
    watch: {
      picked: function(newVal) {
        if(newVal == 'duration' && this.dataitem.ListItemRemovalDelay == -1) this.setListItemRemovalDelayDefault();
        if(newVal == 'time' && this.dataitem.ListEmptyTime.length == 0) this.setListEmptyTimeDefault();
      }
    },
    methods: {
      setOutboundIdentity(number) {
        this.dataitem.OutboundIdentity = number == 'null' ? '' : number;
      },
      setDepartmentId(id) {
        this.dataitem.DepartmentId = id == 'null' ? -1 : parseInt(id);
      },
      startPicked() {
        if(this.dataitem.ListItemRemovalDelay == -1) {
          if(this.dataitem.ListEmptyTime.length == 0) {
            this.setListItemRemovalDelayDefault();
            this.picked = 'duration';
          } else {
            this.picked = 'time';
          }
        } else {
          this.picked = 'duration';
          this.getListItemRemovalDelay();
        }
      },
      getListItemRemovalDelay() {
        let _minutes = this.dataitem.ListItemRemovalDelay;
        this.duration.days = Math.floor(_minutes / (24 * 60));
        this.duration.hours = Math.floor((_minutes - (this.duration.days * 24 * 60)) / 60);
        this.duration.minutes = _minutes - ((this.duration.days * 24 * 60) + (this.duration.hours * 60));
      },
      setListItemRemovalDelayDefault() {
        this.dataitem.ListItemRemovalDelay = 0;
        this.duration.days = 0;
        this.duration.hours = 0;
        this.duration.minutes = 0;
        this.dataitem.ListEmptyTime = ''; //ListItemRemovalDelay is now active
      },
      setListItemRemovalDelay() {
        let _minutes = this.duration.days * 24 * 60 + this.duration.hours * 60 + this.duration.minutes;
        this.dataitem.ListItemRemovalDelay = _minutes;
        // this.dataitem.ListItemRemovalDelay = this.durationDays * 24 * 60 + this.durationHours * 60 + this.durationMinutes;
        if(this.dataitem.ListEmptyTime.length > 0) this.dataitem.ListEmptyTime = ''; //ListItemRemovalDelay is now active
      },
      setListEmptyTimeDefault() {
        let _time = new Date().toISOString().split('T')[1].substring(0, 5);
        this.dataitem.ListEmptyTime = _time;
        this.dataitem.ListItemRemovalDelay = -1; //EmptyTime is now active
      },
      //==================================================================Helpers
      checkTime(evt) {
        Mask.isTimeMask(evt);
        this.dataitem.ListEmptyTime = evt.target.value;
      },
      checkIsNumber(evt, prop) {
        this.duration[prop] = parseInt(Mask.isNumberMask(evt));
        this.setListItemRemovalDelay();
      }
    },
    mounted() {
      this.startPicked();
    }
  }

</script>

<style lang="scss" scoped>

  .select-wrapper {
    display: grid;
    &--paddingbottom {
      padding-bottom: 10px;
    }
    &--paddingtop {
      padding-bottom: 10px;
    }
  }
  .form-selectfield.form-selectfield--inline-bground select {
    box-shadow: none;
  }

</style>
