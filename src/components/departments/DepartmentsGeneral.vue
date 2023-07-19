<template>
  <div data-e2e="departments-general">
    <div class="grid-row">
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground" v-charcount="{'fieldName' : 'itemName', 'maxChars' : 30, 'targetClass' : 'form-textfield__feedback-inline'}">
          <input type="text" name="itemName" id="itemName" v-model="datadetail.Title" :placeholder="$store.state.settings.departments.nameplaceholder" :data-validate="setValidation('isNotEmpty')" :data-message="$store.state.settings.departments.validatename">
          <label for="detailName" class="form-label form-label--hidden">{{ $store.state.settings.departments.namelbl }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.departments.helptextname }}</div>
        </div>
      </div>
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground" v-charcount="{'fieldName' : 'itemDescription', 'maxChars' : 110, 'targetClass' : 'form-textfield__feedback-inline'}">
          <!-- <input type="text" name="itemDescription" id="itemDescription" readonly v-model="datadetail.Description" :placeholder="$store.state.settings.departments.descriptionplaceholder" data-validate="isNotEmpty" :data-message="$store.state.settings.departments.validatedescription"> -->
          <input type="text" name="itemDescription" id="itemDescription" readonly v-model="datadetail.Description" :placeholder="$store.state.settings.departments.descriptionplaceholder">
          <label for="descriptionlabel" class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.departments.descriptionlbl }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.departments.helptextdescription }}</div>
        </div>
      </div>
    </div>  
    <div class="grid-row">
      <div class="grid-unit--beta">
        <div class="form-selectfield form-selectfield--inline-bground">
          <label class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.departments.costcenterlbl }}</label>
          <select v-model="datadetail.CostCenterId">
            <option value="-1">{{ $store.state.settings.departments.formselectkeydefault }}</option>
            <option v-for="cs in costcenters" :value="cs.Id">{{ cs.Name }}</option>
          </select>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.departments.helptextcostcenter }}</div>
        </div>
      </div>
      <div class="grid-unit--beta">
        <div class="form-selectfield form-selectfield--inline-bground">
          <label class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.departments.identitylbl }}</label>
          <select v-model="datadetail.OutboundIdentity">
            <option value="">{{ $store.state.settings.departments.formselectidentitydefault }}</option>
            <option v-for="i in identitylist" :value="i.Number">{{ i.Label }}</option>
          </select>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.departments.helptextidentity }}</div>
        </div>
      </div>
    </div>
    <div class="grid-row">
      <div class="grid-unit--beta">
        <label class="typo-input-label typo-input-label--h20">{{ $store.state.settings.departments.conversationnotelbl }}</label>
        <div class="form-radio-small form-radio-small--inline">
          <input type="radio" id="conversationnote_radio_one" v-model="datadetail.ShowConversationNote" value="false">
          <label for="conversationnote_radio_one">{{ $store.state.settings.departments.conversationnoteOff }}</label>
        </div>
        <div class="form-radio-small form-radio-small--inline">
          <input type="radio" id="conversationnote_radio_two" v-model="datadetail.ShowConversationNote" value="true">
          <label for="conversationnote_radio_two">{{ $store.state.settings.departments.conversationnoteOn }}</label>
        </div>
        <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.departments.helptextconversationnote }}</div>
      </div>
      <div class="grid-unit--beta">
        <div class="form-selectfield form-selectfield--inline-bground">
          <label class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.departments.formnotetemplatelbl }}</label>
          <select v-model="datadetail.ConversationNoteTemplateId">
            <option :value="-1" selected>{{ $store.state.settings.departments.formnotetemplatechooselbl }}</option>
            <option v-for="template in notetemplatelist" :key="template.Id" :value="template.Id">{{ template.Name }}</option>
          </select>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.departments.helptextnotetemplate }}</div>
        </div>
      </div>
    </div>
    <div class="grid-row">
      <div class="grid-unit--beta">
        <label class="typo-input-label typo-input-label--h20">{{ $store.state.settings.departments.openlinelbl }}</label>
        <div class="form-radio-small form-radio-small--inline">
          <input type="radio" id="openline_radio_one" v-model="datadetail.UseOpenLine" value="false">
          <label for="openline_radio_one">{{ $store.state.settings.departments.openlineOff }}</label>
        </div>
        <div class="form-radio-small form-radio-small--inline">
          <input type="radio" id="openline_radio_two" v-model="datadetail.UseOpenLine" value="true">
          <label for="openline_radio_two">{{ $store.state.settings.departments.openlineOn }}</label>
        </div>
        <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.departments.helptextopenline }}</div>
      </div>
      <div class="grid-unit--beta"></div>
    </div>
  </div>
</template>

<script>

  import { CharCount }   from './../../directives/charcount';

  export default {
    name: 'DepartmentsGeneral',
    props: {
      visibility : {
        type : Boolean,
        default : false
      },
      datadetail : {
        type : Object,
        default : {}
      },
      costcenters : {
        type : Array,
        default : -1
      },
      identitylist : {
        type : Array,
        default : -1
      },
      notetemplatelist : {
        type : Array,
        default : -1
      },
      showhelp : {
        type : Boolean,
        default : false
      },
      isactive : {
        type : Boolean,
        default : false
      }
    },
    directives: {
      charcount  : CharCount
    },
    data() {
      return {
      }
    },
    computed: {
      setValidation() {
        return type => {
          return this.isactive ? type : type + '_skip';
        }
      },
    }
  }
</script>
