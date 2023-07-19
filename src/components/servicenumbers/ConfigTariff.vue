<template>
  <div data-e2e="service-config-tariff">
    <div class="grid-row">
      <div class="grid-unit--beta">
        <RangeSliderValues
          :label    = maxtarifflbl
          :min      = 0
          :minlabel = $store.state.settings.configtariff.maxtarifflbl[2]
          :max      = 40
          :maxlabel = $store.state.settings.configtariff.maxtarifflbl[3]
          :step     = 1
          :value    = saveTariffData.maxTariff
          @update   = updateMaxTariff
        />
      </div>
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground" v-unitslabel="{'label' : $store.state.settings.configtariff.maxtariffwarninglbl[1]}">
          <input :readonly="isreadonly" type="text" name="maxtariffwarning" id="maxtariffwarning" v-model="saveTariffData.maxTariffSeconds" :data-validate="setValidation('isNumber')" @keydown="checkIsNumber($event, 'maxTariffSeconds')">
          <label for="maxtariffwarning" class="form-label form-label--hidden">{{ $store.state.settings.configtariff.maxtariffwarninglbl[0] }}</label>
          <!-- <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.configtariff.maxtariffwarninghelp }}</div> -->
        </div>
      </div>
    </div>
    <div class="grid-row">
      <div class="grid-unit--beta">
        <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.configtariff.preliminaryprompttitel }}</h2>
      </div>
      <div class="grid-unit--beta">
        <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.configtariff.promptduringcalltitel }}</h2>
      </div>
    </div>
    <div class="grid-row">
      <div class="grid-unit--beta">
        <div class="typo-input-label">{{ $store.state.settings.configtariff.tariffpromptlbl[0] }}</div>
        <div class="prompt-select">
          <Play-button
            :soundUrl     = tariffPrompt.selectedPromptUrl
            :disabled     = !hasTariffPromptUrl
            ref           = "tariffPromptPlayer"
          />
          <SelectSearchFlyOut
            :options="promptList"
            :selectedvalue="tariffPrompt.selectedPromptId"
            :defaultlabel="$store.state.settings.configtariff.tariffpromptlbl[1]"
            labelproperty="Title"
            valueproperty="Id"
            @changed="setSelectedTariffPromptId"
          />
        </div>
      </div>
      <div class="grid-unit--beta">
        <div class="typo-input-label">{{ $store.state.settings.configtariff.warningpromptlbl[0] }}</div>
        <div class="prompt-select">
          <Play-button
            :soundUrl     = warningPrompt.selectedPromptUrl
            :disabled     = !hasWarningPromptUrl
            ref           = "warningPromptPlayer"
          />
          <SelectSearchFlyOut
            :options="promptList"
            :selectedvalue="warningPrompt.selectedPromptId"
            :defaultlabel="$store.state.settings.configtariff.warningpromptlbl[1]"
            labelproperty="Title"
            valueproperty="Id"
            @changed="setSelectedWarningPromptId"
          />
        </div>
      </div>
    </div>
    <div class="grid-row">
      <div class="grid-unit--beta">
        <div class="typo-input-label">{{ $store.state.settings.configtariff.tariffpromptlbl[0] }}</div>
        <div class="prompt-select">
          <Play-button
            :soundUrl     = maxRatePrompt.selectedPromptUrl
            :disabled     = !hasMaxRatePromptUrl
            ref           = "maxRatePromptPlayer"
          />
          <SelectSearchFlyOut
            :options="promptList"
            :selectedvalue="maxRatePrompt.selectedPromptId"
            :defaultlabel="$store.state.settings.configtariff.tariffpromptlbl[1]"
            labelproperty="Title"
            valueproperty="Id"
            @changed="setSelectedMaxRatePromptId"
          />
        </div>
      </div>
      <div class="grid-unit--beta">
        <div class="typo-input-label">{{ $store.state.settings.configtariff.callterminationpromptlbl[0] }}</div>
        <div class="prompt-select">
          <Play-button
            :soundUrl     = callTerminationPrompt.selectedPromptUrl
            :disabled     = !hasCallTerminationPromptUrl
            ref           = "callTerminationPromptPlayer"
          />
          <SelectSearchFlyOut
            :options="promptList"
            :selectedvalue="callTerminationPrompt.selectedPromptId"
            :defaultlabel="$store.state.settings.configtariff.callterminationpromptlbl[1]"
            labelproperty="Title"
            valueproperty="Id"
            @changed="setSelectedCallTerminationPromptId"
          />
        </div>
      </div>
    </div>
    <div class="grid-row">
      <div class="grid-unit--beta">
        <div class="typo-input-label">{{ $store.state.settings.configtariff.mobilecostspromptlbl[0] }}</div>
        <div class="prompt-select">
          <Play-button
            :soundUrl     = mobileCostsPrompt.selectedPromptUrl
            :disabled     = !hasMobileCostsPromptUrl
            ref           = "mobileCostsPromptPlayer"
          />
          <SelectSearchFlyOut
            :options="promptList"
            :selectedvalue="mobileCostsPrompt.selectedPromptId"
            :defaultlabel="$store.state.settings.configtariff.mobilecostspromptlbl[1]"
            labelproperty="Title"
            valueproperty="Id"
            @changed="setSelectedMobileCostsPromptId"
          />
        </div>
      </div>
      <div class="grid-unit--beta"></div>
    </div>
  </div>
</template>

<script>

  import RangeSliderValues   from './../uielements/RangeSliderValues.vue';
  import SelectSearchFlyOut  from './../uielements/SelectSearchFlyOut.vue';
  import PlayButton          from './../uielements/PlayButtonMp3.vue';
  import { UnitsLabel }      from './../../directives/unitslabel';
  import { isNumberMask }    from './../../utils/cm_mask';
  import { IPCCCConfigurator } from './../../ipccc/js/configurator';

  export default {
    name: 'ConfigTariff',
    props: {
      isactive : {
        type : Boolean,
        default : false
      },
      showhelp : {
        type : Boolean,
        default : false
      },
      custid : {
        type : Number,
        default : -1
      },
      languagecode : {
        type : Number,
        default : -1
      }
    },
    components: {
      RangeSliderValues,
      SelectSearchFlyOut,
      PlayButton
    },
    directives: {
      unitslabel : UnitsLabel,
    },
    data: () => {
      return {
        promptList                : [],
        tariffPrompt              : {
          selectedPromptId        : null,
          selectedPromptUrl       : ''
        },
        warningPrompt             : {
          selectedPromptId        : null,
          selectedPromptUrl       : ''
        },
        maxRatePrompt             : {
          selectedPromptId        : null,
          selectedPromptUrl       : ''
        },
        callTerminationPrompt     : {
          selectedPromptId        : null,
          selectedPromptUrl       : ''
        },
        mobileCostsPrompt         : {
          selectedPromptId        : null,
          selectedPromptUrl       : ''
        },
        saveTariffData            : {
          maxTariff               : 0,
          maxTariffSeconds        : 0,
        }
      }
    },
    computed: {
      setValidation() {
        return type => {
          return this.isactive ? type : type + '_skip';
        }
      },
      maxtarifflbl() {
        return this.$store.state.settings.configtariff.maxtarifflbl[0] + ' ' + (this.saveTariffData.maxTariff == 0 ?
          '' : this.$store.state.settings.configtariff.maxtarifflbl[1]);
      },
      isreadonly() {
        return false;
      },
      hasTariffPromptUrl() {
        return this.tariffPrompt.selectedPromptUrl ? this.tariffPrompt.selectedPromptUrl.length > 0 : false;
      },
      hasWarningPromptUrl() {
        return this.warningPrompt.selectedPromptUrl ? this.warningPrompt.selectedPromptUrl.length > 0 : false;
      },
      hasMaxRatePromptUrl() {
        return this.maxRatePrompt.selectedPromptUrl ? this.maxRatePrompt.selectedPromptUrl.length > 0 : false;
      },
      hasCallTerminationPromptUrl() {
        return this.callTerminationPrompt.selectedPromptUrl ? this.callTerminationPrompt.selectedPromptUrl.length > 0 : false;
      },
      hasMobileCostsPromptUrl() {
        return this.mobileCostsPrompt.selectedPromptUrl ? this.mobileCostsPrompt.selectedPromptUrl.length > 0 : false;
      },
    },
    methods: {
      updateMaxTariff(val) {
        this.saveTariffData.maxTariff = val;
      },
      stopPlayingAll() {
        this.$refs['ringtonePlayer'].stopPlaying();
      },
      checkIsNumber(evt, prop) {
        if(evt.target.readOnly == false)
          this.saveTariffData[prop] = isNumberMask(evt);
      },
      getPromptList() {
        return new Promise((resolve, reject) => {
          IPCCCConfigurator.Request(this.custid, 'prompts', 'readall', null, -1).then(response => {
            resolve(response);
            }).catch(error => {
              reject(error);
          });
        });
      },
      getPromptUrl(id) {
        return new Promise((resolve, reject) => {
          IPCCCConfigurator.Request(this.custid, 'prompts', 'playprompt', this.languagecode, id).then(soundUrl => {
              resolve(soundUrl);
            }).catch(error => {
              console.error(error);
            }
          );
        });
      },
      //Next five functions only differ in caller, optimize code when possible
      setSelectedTariffPromptId(id) {
        this.tariffPrompt.selectedPromptId  = id;
        if(id && id >= 0) {
          this.getPromptUrl(id).then(url => {
            this.tariffPrompt.selectedPromptUrl = url;
          });
        } else {
          this.tariffPrompt.selectedPromptUrl = '';
        }
      },
      setSelectedWarningPromptId(id) {
        this.warningPrompt.selectedPromptId  = id;
        if(id && id >= 0) {
          this.getPromptUrl(id).then(url => {
            this.warningPrompt.selectedPromptUrl = url;
          });
        } else {
          this.warningPrompt.selectedPromptUrl = '';
        }
      },
      setSelectedMaxRatePromptId(id) {
        this.maxRatePrompt.selectedPromptId  = id;
        if(id && id >= 0) {
          this.getPromptUrl(id).then(url => {
            this.maxRatePrompt.selectedPromptUrl = url;
          });
        } else {
          this.maxRatePrompt.selectedPromptUrl = '';
        }
      },
      setSelectedCallTerminationPromptId(id) {
        this.callTerminationPrompt.selectedPromptId  = id;
        if(id && id >= 0) {
          this.getPromptUrl(id).then(url => {
            this.callTerminationPrompt.selectedPromptUrl = url;
          });
        } else {
          this.callTerminationPrompt.selectedPromptUrl = '';
        }
      },
      setSelectedMobileCostsPromptId(id) {
        this.mobileCostsPrompt.selectedPromptId  = id;
        if(id && id >= 0) {
          this.getPromptUrl(id).then(url => {
            this.mobileCostsPrompt.selectedPromptUrl = url;
          });
        } else {
          this.mobileCostsPrompt.selectedPromptUrl = '';
        }
      },
    },
    mounted() {
      this.getPromptList().then(result => {
        this.promptList = [...result];
      })
      .catch(error => {
        console.error('error:', error);
      });
    }
  }

</script>

<style lang="scss" scoped>
  @use "@/scss/includes/functions";
  @use "@/scss/includes/globals";


  .prompt-select {
    display: flex;
    align-items: flex-end;
    .select-search-fly-out__wrapper {
      width: calc(100% - 25px);
    }
    [class^="button__icon"] {
      margin-top: 12px;
      margin-right: 5px;
      margin-left: -2px;
      width: 25px;
      height: 25px;
      line-height: 25px;
      span {
        width: 24px;
      }
    }
  }
  .detailscreen__fieldsetheader {
    width: 100%;
    margin: 0;
  }
</style>
