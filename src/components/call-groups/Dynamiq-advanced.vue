<template> 
  <div data-e2e="dynamiq-advanced">
    <div class="grid-row">
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground" v-unitslabel="{'label' : $store.state.settings.unitlabels.seconds}">
          <input :readonly="isreadonly" type="text" name="queueCallTimeout" id="queueCallTimeout" v-model="queuedetail.CallTimeout" :data-validate="setValidation('isZeroOrFiveToNinety')" :data-message="$store.state.settings.dynamiq.validatecalltimeout" @keydown="checkIsNumber($event, 'CallTimeout')">
          <label for="queueCallTimeout" class="form-label form-label--hidden">{{ $store.state.settings.dynamiq.formcalltimeout }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextcalltimeout }}</div>
        </div>
      </div>
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground" v-unitslabel="{'label' : $store.state.settings.unitlabels.seconds}">
          <input :readonly="isreadonly" type="text" name="queueQueueTimeout" id="queueQueueTimeout" v-model="queuedetail.QueueTimeout" :data-validate="setValidation('isbetweenZeroToNNNN')" :data-message="$store.state.settings.dynamiq.validatequeuetimeout">
          <label for="queueQueueTimeout" class="form-label form-label--hidden">{{ $store.state.settings.dynamiq.formqueuetimeout }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextqueuetimeout }}</div>
        </div>
      </div>
    </div>
    <div class="grid-row">
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground" v-unitslabel="{'label' : $store.state.settings.unitlabels.seconds}">
          <input :readonly="isreadonly" type="text" name="queuehandlingtime" id="queuehandlingtime" v-model="queuedetail.HandlingTime" :data-validate="setValidation('isAtLeastOne')" :data-message="$store.state.settings.dynamiq.validatehandlingtime" @keydown="checkIsNumber($event, 'HandlingTime')">
          <label for="queuehandlingtime" class="form-label form-label--hidden">{{ $store.state.settings.dynamiq.formhandlingtime }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptexthandlingtime }}</div>
        </div>
      </div>
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground">
          <input :readonly="isreadonly" type="text" name="queuepriority" id="queuepriority" v-model="queuedetail.Priority" :data-validate="setValidation('isbetweenOneToNN')" :data-message="$store.state.settings.dynamiq.validatepriority" @keydown="checkIsNumber($event, 'Priority')">
          <label for="queuepriority" class="form-label form-label--hidden">{{ $store.state.settings.dynamiq.formpriority }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextpriority }}</div>
        </div>
      </div>
    </div>
    <div class="grid-row" v-show="!rgtypeisnumbers">
      <div class="grid-unit--beta">
        <label class="form-label form-label--list-inline">{{ $store.state.settings.dynamiq.formopenlinelbl }}</label>
        <div class="form-checkbox form-checkbox--large">
          <input :disabled="isreadonly" type="checkbox" name="queuepenline" id="queueopenline" v-model="queuedetail.OpenLine">
          <label for="queueopenline">{{ $store.state.settings.dynamiq.formopenlinecheckboxlbl }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextopenline }}</div>
        </div>
      </div>
      <div class="grid-unit--beta">
        <label class="form-label form-label--list-inline">{{ $store.state.settings.dynamiq.formexpresslinelbl }}</label>
        <div class="form-checkbox form-checkbox--large">
          <input :disabled="isreadonly" type="checkbox" name="queueexpressline" id="queueexpressline" v-model="queuedetail.EmergencyLine">
          <label for="queueexpressline">{{ $store.state.settings.dynamiq.formexpresslinecheckboxlbl }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextexpressline }}</div>
        </div>
      </div>
    </div>
    <div class="grid-row" v-show="!rgtypeisnumbers">
      <div class="grid-unit--beta">
        <label class="form-label form-label--list-inline">{{ $store.state.settings.dynamiq.formdtmfforwardlbl }}</label>
        <div class="form-checkbox form-checkbox--large">
          <input :disabled="isreadonly" type="checkbox" name="queuedtmfforward" id="queuedtmfforward" v-model="queuedetail.DTMFForward">
          <label for="queuedtmfforward">{{ $store.state.settings.dynamiq.formdtmfforwardcheckboxlbl }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextdtmfforward }}</div>
        </div>
      </div>
      <div class="grid-unit--beta">
        <label class="form-label form-label--list-inline">{{ $store.state.settings.dynamiq.formnotepopuplbl }}</label>
        <div class="form-checkbox form-checkbox--large">
          <input :disabled="isreadonly" type="checkbox" name="queuenotepopup" id="queuenotepopup" v-model="queuedetail.ShowConversationNote">
          <label for="queuenotepopup">{{ $store.state.settings.dynamiq.formnotepopupcheckboxlbl }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextnotepopup }}</div>
        </div>
      </div>

      <div class="grid-unit--beta">
        <label class="form-label form-label--list-inline">{{ $store.state.settings.dynamiq.formcdcpopuplbl }}</label>
        <div class="form-checkbox form-checkbox--large">
          <input :disabled="isreadonly" type="checkbox" name="queuecdcpopup" id="queuecdcpopup" v-model="queuedetail.UseCDC">
          <label for="queuecdcpopup">{{ $store.state.settings.dynamiq.formcdcpopupcheckboxlbl }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextcdcpopup }}</div>
        </div>
      </div>
      <div class="grid-unit--beta"></div>
      
    </div>
    <div class="grid-row" v-show="!rgtypeisnumbers">
      <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.dynamiq.preferredagenttxt }}</h2>
    </div>
    <div class="grid-row" v-show="!rgtypeisnumbers">
      <div class="grid-unit--beta">
        <label class="form-label form-label--list-inline">{{ $store.state.settings.dynamiq.formpreferredagentlbl }}</label>
        <div class="form-radio-small form-radio-small--inline">
          <input :disabled="isreadonly" type="radio" id="radio_one" value="Off" v-model="picked">
          <label for="radio_one">{{ $store.state.settings.dynamiq.formlastspokentoradiolbl[0] }}</label>
        </div>
        <div class="form-radio-small form-radio-small--inline">
          <input :disabled="isreadonly" type="radio" id="radio_two" value="On" v-model="picked">
          <label for="radio_two">{{ $store.state.settings.dynamiq.formlastspokentoradiolbl[1] }}</label>
        </div>
        <div class="form-radio-small form-radio-small--inline">
          <input :disabled="isreadonly" type="radio" id="radio_three" value="Priority" v-model="picked">
          <label for="radio_three">{{ $store.state.settings.dynamiq.formlastspokentoradiolbl[2] }}</label>
        </div>
        <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextlar }}</div>
      </div>
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground" v-unitslabel="{'label' : $store.state.settings.unitlabels.days}">
          <input :readonly="isreadonly || LARIsOff" type="text" name="queueCallTimeoutRouting" id="queueCallTimeoutRouting" v-model="queuedetail.LastAgentRoutingPeriod" :data-validate="setValidation(regLARIsOff('isAtLeastOne'))" :data-message="$store.state.settings.dynamiq.validatelartimeout" @keydown="checkIsNumber($event, 'LastAgentRoutingPeriod')">
          <label for="queueCallTimeoutRouting" class="form-label form-label--hidden">{{ $store.state.settings.dynamiq.formlartimeout }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextlartimeout }}</div>
        </div>
      </div>
    </div>
    <div class="grid-row" v-show="!rgtypeisnumbers">
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground" v-unitslabel="{'label' : $store.state.settings.unitlabels.seconds}">
          <input :readonly="isreadonly || LARIsOff" type="text" name="queueCallTimeoutAgent" id="queueCallTimeoutAgent" v-model="queuedetail.LastAgentRoutingTimeout" :data-validate="setValidation(regLARIsOff(regVarQueueTimeout))" :data-message="$store.state.settings.dynamiq.validatelarmaxextrawaiting" @keydown="checkIsNumber($event, 'LastAgentRoutingTimeout')">
          <label for="queueCallTimeoutAgent" class="form-label form-label--hidden">{{ $store.state.settings.dynamiq.formlarmaxextrawaiting }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextlarmaxextrawaiting }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import * as Mask          from './../../utils/cm_mask';
  import { UnitsLabel }     from './../../directives/unitslabel';
  import * as toRegexRange  from './../../utils/cm_to_regex_range';

  export default {
    name: 'DynamiqAdvanced',
    props: ['showhelp', 'queuedetail', 'isreadonly', 'isactive', 'rgtypeisnumbers'],
    data: () => {
      return {
        picked          : '',
      }
    },
    directives: {
      unitslabel : UnitsLabel,
    },
    watch: {
      picked: function(newVal) {
        if(newVal == 'Off') {
          this.queuedetail.LastAgentRouting = this.queuedetail.LastAgentRoutingPriority = false;
        } else if(newVal == 'On') {
          this.queuedetail.LastAgentRouting         = true;
          this.queuedetail.LastAgentRoutingPriority = false;
        } else if(newVal == 'Priority') {
          this.queuedetail.LastAgentRouting = this.queuedetail.LastAgentRoutingPriority = true;
        }
      },
      isactive: function(newVal) {
        this.setPicked();
      }
    },
    computed: {
      LARIsOff() {
        return this.picked == 'Off';
      },
      setValidation() {
        return type => {
           return this.isactive ? type : type + '_skip';
        }
      },
      regLARIsOff() {
        return type => {
          return this.LARIsOff ? 'isAll' : type;
        }
      },
      regVarQueueTimeout() {
        if(this.queuedetail.QueueTimeout == 0) {
          return '^[1-9]$|^[1-9][0-9]*$';
        } else if(this.queuedetail.QueueTimeout == 1) {
          return '^[1]$';
        } else {
          let _val50perc    = parseInt(this.queuedetail.QueueTimeout / 2),
              _valStr       = _val50perc.toString();

          return toRegexRange.regex_range(1, _valStr);
        }
      }
    },
    methods: {
      setPicked() {
        if(this.queuedetail.LastAgentRouting && !this.queuedetail.LastAgentRoutingPriority)
          this.picked = 'On';
        else if(this.queuedetail.LastAgentRouting && this.queuedetail.LastAgentRoutingPriority)
          this.picked = 'Priority';
        else
          this.picked = 'Off';
      },
      checkIsNumber(evt, prop) {
        if(evt.target.readOnly == false)
          this.queuedetail[prop] = Mask.isNumberMask(evt);
      }
    },
    mounted() {
      this.setPicked();
    }
  }

</script>
