<template>
  <div data-e2e="dynamiq-general">
    <div class="grid-row">
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground">
          <input :readonly="isreadonly" type="text" name="queueTitle" :placeholder="$store.state.settings.dynamiq.formtitle" v-model="queuedetail.Name" @keyup="testTitleIsValid()" :data-validate="setValidation(validationOnTitle)" :data-message="$store.state.settings.dynamiq.validatetitletext">
          <label for="queueTitle" class="form-label form-label--hidden">{{ $store.state.settings.dynamiq.formtitle }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptexttitle }}</div>
        </div>
      </div>
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground" v-charcount="{'fieldName' : 'queueDescription', 'maxChars' : 110, 'targetClass' : 'form-textfield__feedback-inline'}">
          <input :readonly="isreadonly" type="text" name="queueDescription" :placeholder="$store.state.settings.dynamiq.formdescription" v-model="queuedetail.Description">
          <label for="queueDescription" class="form-label form-label--hidden">{{ $store.state.settings.dynamiq.formdescription }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextdescription }}</div>
        </div>
      </div>  
    </div>
    <div class="grid-row">
      <div class="grid-unit--beta" data-e2e="distribution">
        <div class="form-selectfield form-selectfield--inline-bground">
          <label class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.dynamiq.formselectdistribution }}</label>
          <select :disabled="isreadonly" v-model="distDummy" :data-validate="setValidation('isNotZero')" :data-message="$store.state.settings.dynamiq.validatedistribution">
            <option value="0">{{ $store.state.settings.dynamiq.formselectdistributionoptions[0] }}</option>
            <option value="1">{{ $store.state.settings.dynamiq.formselectdistributionoptions[1] }}</option>
            <option value="4">{{ $store.state.settings.dynamiq.formselectdistributionoptions[2] }}</option>
            <option value="5">{{ $store.state.settings.dynamiq.formselectdistributionoptions[3] }}</option>
          </select>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextdistribution }}</div>
        </div>
      </div>
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground">
          <input :readonly="isreadonly" type="text" name="user-email" id="user-email" :placeholder="$store.state.settings.dynamiq.formemaillabel" v-model="queuedetail.EmailAddress" :data-validate="setValidation('isEmptyStringOrEmail')" :data-message="$store.state.settings.dynamiq.validateemailaddress">
          <label for="user-email" class="form-label form-label--hidden">{{ $store.state.settings.dynamiq.formemaillabel }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextemail }}</div>
        </div>
      </div>  
    </div>
    <div class="grid-row" data-e2e="notetemplate">
      <div class="grid-unit--beta">
        <div class="form-selectfield form-selectfield--inline-bground">
          <label class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.dynamiq.formnotetemplatelbl }}</label>
          <select :disabled="isreadonly" v-model="queuedetail.ConversationNoteTemplateId">
            <option :value="-1" selected>{{ $store.state.settings.dynamiq.formnotetemplatechooselbl }}</option>
            <option v-for="template in notetemplatelist" :key="template.Id" :value="template.Id">{{ template.Name }}</option>
          </select>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextkey }}</div>
        </div>
      </div>
      <div class="grid-unit--beta"></div>
    </div>
    <div class="grid-row">
      <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.dynamiq.blacklisttxt }}</h2>
    </div>
    <div class="grid-row">
      <div class="grid-unit--beta" data-e2e="blacklist">
        <div class="form-selectfield form-selectfield--inline-bground">
          <label class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.dynamiq.formselectkey }}</label>
          <select :disabled="isreadonly" v-model="queuedetail.BlacklistKey">
            <option :value="ckeckEmptyBLK" selected>{{ $store.state.settings.dynamiq.formselectkeydefault }}</option>
            <option v-for="key in blacklistKeys" :value="key">{{ key }}</option>
          </select>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextkey }}</div>
        </div>
      </div>
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground" v-unitslabel="{'label' : $store.state.settings.dynamiq.formdayunit}">
          <input :readonly="isreadonly || queuedetail.BlacklistKey == ckeckEmptyBLK" type="text" name="blacklist-time" id="blacklist-time" :placeholder="$store.state.settings.dynamiq.formblacklisttimelabel" v-model="queuedetail.BlacklistBlockDays" :data-validate="setValidation('isNotEmpty')" :data-message="$store.state.settings.dynamiq.validateblacklisttime" @keydown="checkIsNumber($event, 'BlacklistBlockDays')">
          <label for="user-email" class="form-label form-label--hidden">{{ $store.state.settings.dynamiq.formblacklisttimelabel }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextblacklisttime }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import * as Mask         from './../../utils/cm_mask';
  import { CharCount }     from './../../directives/charcount';
  import { UnitsLabel }    from './../../directives/unitslabel';

  export default {
    name: 'DynamiqGeneral',
    props: ['showhelp', 'queuedetail', 'isreadonly', 'isactive', 'routinggroupnames', 'savedrgname', 'notetemplatelist'],
    data: () => {
      return {
        blacklistKeys      : ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '*'],
        validationOnTitle  : 'isAtLeastTwoChar',
      }
    },
    directives: {
      charcount  : CharCount,
      unitslabel : UnitsLabel,
    },
    computed: {
      setValidation() {
        return type => {
          return this.isactive ? type : type + '_skip';
        }
      },
      distDummy: {
        get: function() {
          if(this.queuedetail.Groupring == true)
            return '5';
          else
            return this.queuedetail.Distribution;
        },
        set: function(newVal) {
          if(newVal == '5') {
            this.queuedetail.Distribution = '4';
            this.queuedetail.Groupring = true;
          } else {
            this.queuedetail.Distribution = newVal;
            this.queuedetail.Groupring = false;
          }
        }
      },
      ckeckEmptyBLK() {
        if(this.queuedetail.BlacklistKey == ' ')
          return ' ';
        else
          return '';
      }
    },
    watch: {
      savedrgname: function(newVal) {
        this.validationOnTitle = 'isAtLeastTwoChar';
      }
    },
    methods: {
      checkIsNumber(evt, prop) {
        if(evt.target.readOnly == false)
          this.queuedetail[prop] = Mask.isNumberMask(evt);
      },
      setDistributionDummy() {
        if(this.queuedetail.Groupring == true)
          this.distributionDummy = '5';
        else
          this.distributionDummy = this.queuedetail.Distribution;
      },
      testTitleIsValid() {
        if(this.queuedetail.Name.length > 0 && (this.routinggroupnames.some(rgname => rgname == this.queuedetail.Name) == false || this.savedrgname == this.queuedetail.Name)) {
          this.validationOnTitle = 'isAtLeastTwoChar';
        } else {
          this.validationOnTitle = 'isEmail'; //force validation to fail.
        } 
      },
    },
    mounted() {      
    }
  }

</script>
