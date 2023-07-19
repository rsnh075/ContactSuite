<template>
  <div data-e2e="service-config-advanced">
    <div class="grid-row">
      <div class="grid-unit--beta">
        <label class="typo-input-label">{{ $store.state.settings.configadvanced.languagepromptlbl }}</label>
        <CountrySelect
          :selectedvalue="saveObj.LanguageId"
          @change="setSelectedLang"
        />
        <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.servicenrconfig.helptextlanguageprompt }}</div>
        <div class="form-selectfield form-selectfield--no-margin">
          <label for="costcenterlbl" class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.configadvanced.costcenterlbl[0] }}</label>
          <select id="costcenterlbl" name="costcenterlbl" v-model="saveObj.KostenPlaatsId" @change="emitAvancedChanges()">
            <option value="-1">{{ $store.state.settings.configadvanced.costcenterlbl[1] }}</option>
            <option v-for="costcenter in costcenterlist" :key="costcenter.Id" :value="costcenter.Id">{{ costcenter.Name }}</option>
          </select>
        </div>
        <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.servicenrconfig.helptextcostcentername }}</div>
      </div>
      <div class="grid-unit--beta">
        <label class="typo-input-label typo-input-label--h20">{{ $store.state.settings.configadvanced.advancedoptionlbl[0] }}</label>
        <div class="form-checkbox form-checkbox--medium">
          <input type="checkbox" name="advancedoption1" id="advancedoption1" v-model="saveObj.AniAlwaysSecret" @change="setAniMayShown()">
          <label for="advancedoption1">{{ $store.state.settings.configadvanced.advancedoptionlbl[1] }}</label>
        </div>
        <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.servicenrconfig.helptextanialwayssecret }}</div>
        <div class="form-checkbox form-checkbox--medium">
          <input type="checkbox" name="advancedoption2" id="advancedoption2" v-model="saveObj.BellerNietOphangen" @change="emitAvancedChanges()">
          <label for="advancedoption2">{{ $store.state.settings.configadvanced.advancedoptionlbl[2] }}</label>
        </div>
        <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.servicenrconfig.helptextbellernietophangen }}</div>
        <div class="form-checkbox form-checkbox--medium">
          <input type="checkbox" name="advancedoption3" id="advancedoption3" v-model="saveObj.QM" @click="showAlert" @change="emitAvancedChanges()">
          <label for="advancedoption3">{{ $store.state.settings.configadvanced.advancedoptionlbl[3] }}</label>
        </div>
        <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.servicenrconfig.helptextqm }}</div>
        <!-- <div class="form-checkbox form-checkbox--medium">
          <input type="checkbox" name="advancedoption4" id="advancedoption4" v-model="saveObj.RecordEveryCall" @change="emitAvancedChanges()">
          <label for="advancedoption4">{{ $store.state.settings.configadvanced.advancedoptionlbl[4] }}</label>
        </div> -->
        <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.servicenrconfig.helptextrecordeverycall }}</div>
        <div class="form-checkbox form-checkbox--medium">
          <input type="checkbox" name="advancedoption5" id="advancedoption5" v-model="saveObj.RecordingNeedsConsent" @change="emitAvancedChanges()">
          <label for="advancedoption5">{{ $store.state.settings.configadvanced.advancedoptionlbl[5] }}</label>
        </div>
        <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.servicenrconfig.helptextrecordingneedsconsent }}</div>
        <div class="form-checkbox form-checkbox--medium">
          <input type="checkbox" name="advancedoption6" id="advancedoption6" v-model="saveObj.UseBlacklist" @change="emitAvancedChanges()">
          <label for="advancedoption6">{{ $store.state.settings.configadvanced.advancedoptionlbl[6] }}</label>
        </div>
        <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.servicenrconfig.helptextuseblacklist }}</div>
      </div>
    </div>
    <div class="grid-row">
      <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.configadvanced.administrativelbl }}</h2>
    </div>
    <div class="grid-row">
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground" v-charcount="{'fieldName' : 'generaltitle', 'maxChars' : 120, 'targetClass' : 'form-textfield__feedback-inline'}">
          <input type="text" name="generaltitle" :placeholder="$store.state.settings.configadvanced.formtitlelbl" v-model="saveObj.Title" @change="emitAvancedChanges()">
          <label for="generaltitle" class="form-label form-label--hidden">{{ $store.state.settings.configadvanced.formtitlelbl }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.servicenrconfig.helptexttitle }}</div>
        </div>
      </div>
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground" v-charcount="{'fieldName' : 'generaldescription', 'maxChars' : 120, 'targetClass' : 'form-textfield__feedback-inline'}">
          <input type="text" name="generaldescription" :placeholder="$store.state.settings.configadvanced.descriptionlbl[1]" v-model="saveObj.Description" @change="emitAvancedChanges()">
          <label for="generaldescription" class="form-label form-label--hidden">{{ $store.state.settings.configadvanced.descriptionlbl[0] }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.servicenrconfig.helptextdescription }}</div>
        </div>
      </div>
    </div>
    <div class="grid-row">
        <div class="grid-unit--beta">
            <label class="typo-input-label typo-input-label--h20">{{ $store.state.settings.configadvanced.environmentlbl[0] }}</label>
            <div class="form-radio-small form-radio-small--inline">
                <input type="radio" id="radio_one" value="1" v-model="picked">
                <label for="radio_one">{{ $store.state.settings.configadvanced.environmentlbl[1] }}</label>
            </div>
            <div class="form-radio-small form-radio-small--inline">
                <input type="radio" id="radio_two" value="2" v-model="picked">
                <label for="radio_two">{{ $store.state.settings.configadvanced.environmentlbl[2] }}</label>
            </div>
            <div class="form-radio-small form-radio-small--inline">
                <input type="radio" id="radio_three" value="3" v-model="picked">
                <label for="radio_three">{{ $store.state.settings.configadvanced.environmentlbl[3] }}</label>
            </div>
            <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.servicenrconfig.helptextenvironment }}</div>
        </div>

        <div class="grid-unit--delta">
            <div class="form-textfield form-textfield--bground form-textfield--normal-form">
                <input id="datepickerAdvanced" type="text" :placeholder="$store.state.settings.configadvanced.enddatelbl[1]" v-model="endDate" autocomplete="off">
                <label class="form-label form-label--hidden">{{ $store.state.settings.configadvanced.enddatelbl[0] }}</label>
                <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.servicenrconfig.helptextenddatetime }}</div>
            </div>
        </div>
        <div class="grid-unit--delta">
            <div class="form-textfield form-textfield--bground form-textfield--normal-form">
                <input type="text" :placeholder="$store.state.settings.configadvanced.endtimelbl[1]" v-model="endTime" @keydown="checkTime($event)">
                <label class="form-label form-label--hidden">{{ $store.state.settings.configadvanced.endtimelbl[0] }}</label>
            </div>
        </div>

    </div>
  </div>
</template>

<script>

  import CountrySelect  from './../uielements/CountrySelect.vue';
  import { CharCount }  from './../../directives/charcount';
  import BoxProps, { ModalType } from '../../types/BoxProps';
  import * as Mask      from './../../utils/cm_mask';
  import {
          ISOdateTimetoDate,
          ISOdateTimetoDateEn,
          pikaDayToDDMMYYYY,
          saveFormatDate,
          dateToLocalTimeHHMM
          }             from './../../use/dateFunctions';
  import PikaDay          from 'pikaday';

  export default {
    name: 'ConfigAdvanced',
    props: {
      isactive : {
        type : Boolean,
        default : false
      },
      showhelp : {
        type : Boolean,
        default : false
      },
      costcenterlist : {
        type : Array,
        default : []
      },
      advanceddata : {
        type : Object,
        default : {}
      }
    },
    components: {
      CountrySelect
    },
    directives: {
      charcount : CharCount,
    },
    data: () => {
      return {
        saveObj                  : {
          LanguageId             : null,
          AniMayShown            : true,
          AniAlwaysSecret        : false,
          BellerNietOphangen     : false,
          QM                     : false,
        //   RecordEveryCall        : false,
          RecordingNeedsConsent  : false,
          UseBlacklist           : false,
          KostenPlaatsId         : -1,
          Title                  : '',
          Description            : '',
          Environment            : 1
        },
        picked                   : 1,
        endDate                  : '',
        endTime                  : '',
      }
    },
    inject: ['showModalDialog'],
    computed: {
      setValidation() {
        return type => {
          return this.isactive ? type : type + '_skip';
        }
      },
    },
    watch: {
      advanceddata: function(newVal, oldVal) {
        if(newVal) {
          this.saveObj.Title                 = newVal.Title;
          this.saveObj.Description           = newVal.Description;
          this.saveObj.LanguageId            = newVal.LanguageId;
          this.saveObj.KostenPlaatsId        = newVal.KostenPlaatsId;
          this.saveObj.AniMayShown           = newVal.AniMayShown; //AniAlwaysSecret : !AniMayShown
          this.saveObj.AniAlwaysSecret       = newVal.AniAlwaysSecret;
          this.saveObj.BellerNietOphangen    = newVal.BellerNietOphangen;
          this.saveObj.QM                    = newVal.QM;
        //   this.saveObj.RecordEveryCall       = newVal.RecordEveryCall;
          this.saveObj.RecordingNeedsConsent = newVal.RecordingNeedsConsent;
          this.picked                        = newVal.Environment;
          this.saveObj.Till                  = newVal.Till;
          this.saveObj.UseBlacklist          = newVal.UseBlacklist;
          this.setTillDateTime(newVal.Till);
        }
      },
      picked: function(newVal) {
        this.saveObj.Environment = parseInt(newVal);
        this.emitAvancedChanges();
      },
    },
    methods: {
      setSelectedLang(val) {
        this.saveObj.LanguageId = val;
        this.emitAvancedChanges();
      },
      setAniMayShown() {
        this.saveObj.AniMayShown = !this.saveObj.AniAlwaysSecret;
        this.emitAvancedChanges();
      },
      setTillDateTime(dt) {
        this.saveObj.Till = dt;
        this.endDate      = (this.$store.state.browserLanguage === 'nl') ? ISOdateTimetoDate(dt) : ISOdateTimetoDateEn(dt),
        this.endTime      = dateToLocalTimeHHMM(dt);
      },
      setTillDate(val) {
        this.endDate      = val;
        let _time         = this.saveObj.Till.split('T')[1];
        this.saveObj.Till = saveFormatDate(val).split('T')[0].concat('T' + _time);
        this.emitAvancedChanges();
      },
      checkTime(evt) {
        let _target  = evt.target;
        Mask.isTimeMask(evt);
        this.endTime = _target.value;
        this.setTillTime(_target.value);
      },
      setTillTime(time) {
        let _parts        = this.saveObj.Till.split('T'),
            _date         = _parts[0];
        this.saveObj.Till = _date.concat('T' + time);
        this.emitAvancedChanges();
      },
      setDatePicker() {
        this.datePickerAdvanced = new PikaDay({
          field: document.getElementById('datepickerAdvanced'),
          format   : (this.$store.state.browserLanguage == 'nl') ? 'DD-MM-YYYY' : 'MM-DD-YYYY',
          minDate: new Date(),
          i18n: this.$store.state.settings.datepicker,
          onSelect: () => {
            this.setTillDate(pikaDayToDDMMYYYY(this.datePickerAdvanced.getDate()));
          },
        })
      },
      destroyDatePicker() {
        if(this.datePickerAdvanced) {
          this.datePickerAdvanced.destroy();
        }
      },
      showAlert(evt) {
        let _target = evt.target,
            _val    = _target.checked;
        if (_val) {
            let _boxProps = new BoxProps(ModalType.Message, this.$store.state.settings.dialog.dialogconfirmheader, this.$store.state.settings.configadvanced.dialogbody);
            _boxProps.buttonLabels.cancelLabel = "";
            this.showModalDialog(_boxProps);
        }
      },
      emitAvancedChanges() {
        this.$emit('changedadvanceddata', this.saveObj);
      },
    },
    mounted() {
      this.setDatePicker();
    },
    beforeUnmount() {
      this.destroyDatePicker();
    }
  }

</script>

<style lang="scss">
  .country-select__wrapper {
    margin-bottom: 15px;
  }

</style>
