<template>
    <div :class="['detailscreen-wrapper', {'detailscreen-wrapper--visable' : visibility}]" data-e2e="config-view">
        <div v-if="configData != null" class="detailscreen" ref="detailscreen">
            <a :class="['button-help', {'button-help--active' : showHelp}]" @click="displayHelp">?</a>
            <div class="grid-row">
                <div class="grid-unit--alpha detailscreen-wrapper__title">
                    <span class="detailscreen__title">{{ header }}
                        <span class="detailscreen__title-id">{{ configId }}</span>
                    </span>
                </div>
            </div>
            <form @valid="saveConfig()" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn'}">
                <div class="grid-row">
                    <div class="grid-unit--beta">
                        <div class="form-textfield form-textfield--bground">
                            <input type="text" name="configName" id="configName" v-model="configData.Name" :placeholder="$store.state.settings.virtualqueue.nameplaceholder" data-validate="isNotEmpty" :data-message="$store.state.settings.virtualqueue.validatename">
                            <label for="configName" class="form-label form-label--hidden">{{ $store.state.settings.virtualqueue.namelbl }}</label>
                        </div>
                    </div>
                    <div class="grid-unit--beta">
                        <div class="form-textfield form-textfield--bground">
                            <input type="text" name="formDescription" id="formDescription" v-model="configData.Description" :placeholder="$store.state.settings.virtualqueue.descriptionplaceholder" data-validate="isNotEmpty" :data-message="$store.state.settings.virtualqueue.validatedescription">
                            <label for="formDescription" class="form-label form-label--hidden">{{ $store.state.settings.virtualqueue.descriptionlbl }}</label>
                        </div>
                    </div>
                </div>
                <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.virtualqueue.momentheader }}</h2>
                <div class="grid-row">
                    <div class="grid-unit--beta">
                        <label class="form-label form-label--list">{{ $store.state.settings.virtualqueue.formmomentcalloutlbl[0] }}</label>
                        <div class="form-radio-small form-radio-small--list form-radio-small--wh100perc">
                            <input type="radio" id="radio_one" value="false" v-model="picked">
                            <label for="radio_one">{{ $store.state.settings.virtualqueue.formmomentcalloutlbl[1] }}</label>
                            <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.virtualqueue.helptextcustomerfirst }}</div>
                        </div>
                        <div class="form-radio-small form-radio-small--list form-radio-small--wh100perc">
                            <input type="radio" id="radio_two" value="true" v-model="picked">
                            <label for="radio_two">{{ $store.state.settings.virtualqueue.formmomentcalloutlbl[2] }}</label>
                            <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.virtualqueue.helptextagentfirst }}</div>
                        </div>
                    </div>
                    <div class="grid-unit--beta">
                        <RangeSliderValues
                        :label   = "$store.state.settings.virtualqueue.calloutattemptslbl"
                        :min     = 1
                        :max     = 3
                        :step    = 1
                        :value   = "configData.MaxCallAttempts"
                        @update  = updateCallOutAttempts
                        />
                        <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.virtualqueue.helptextmaxcallattempts }}</div>
                    </div>
                </div>
                <div class="grid-row" v-show="!configData.IsCallMeBack">
                    <div class="grid-unit--beta"></div>
                    <div class="grid-unit--beta">
                        <RangeSliderValues
                        :label   = "$store.state.settings.virtualqueue.callouttimelbl"
                        :min     = 30
                        :max     = 300
                        :step    = 10
                        :value   = "configData.CallThresholdSeconds"
                        @update  = updateDailoutTime
                        />
                        <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.virtualqueue.helptextcallthresholdseconds }}</div>
                    </div>
                </div>
                <div class="grid-row">
                    <div class="grid-unit--beta">
                        <div class="form-textfield form-textfield--bground" v-unitslabel="{'label' : $store.state.settings.virtualqueue.callouttimeoutlblunit}">
                            <input type="text" name="formtimeout" id="formtimeout" v-model.number="configData.CallTimeoutSecs" data-validate="isZeroOrFiveToNinety" :data-message="$store.state.settings.virtualqueue.validatecalltimeout">
                            <label for="formtimeout" class="form-label form-label--hidden">{{ $store.state.settings.virtualqueue.callouttimeoutlbl }}</label>
                            <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.virtualqueue.helptextcalltimeoutsecs }}</div>
                        </div>
                    </div>
                    <div class="grid-unit--beta">
                        <div class="form-selectfield form-selectfield--inline-bground ">
                            <label class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.virtualqueue.welcomepromptlbl }}</label>
                            <div class="prompt-select">
                                <PlayButton
                                :soundUrl     = "selectedPrompt"
                                ref           = "promptPlayer"
                                />
                                <select v-model="configData.WhisperPromptId" @change="setPromptUrl()">
                                    <option value="-1" selected>{{ $store.state.settings.virtualqueue.defaultpromptlbl }}</option>
                                    <option v-for="prompt in promptList" :value="prompt.Id">{{ prompt.Title }}</option>
                                </select>
                            </div>
                            <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.virtualqueue.helptextwhisperpromptid }}</div>
                        </div>
                    </div>
                </div>
                <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.virtualqueue.smsheader }}</h2>
                <div class="grid-row">
                    <div class="grid-unit--alpha">
                        <SwitchableTextArea
                        :label="$store.state.settings.virtualqueue.smssuccesslbl"
                        :value="configData.SMSTextForQueue"
                        :active="configData.SendQueueSMS"
                        @onchange="setSMS($event, 'SMSTextForQueue', 'SendQueueSMS')"
                        />
                        <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.virtualqueue.helptextsendqueuesms }}</div>
                    </div>
                    <div class="grid-unit--alpha">
                        <SwitchableTextArea
                        :label="$store.state.settings.virtualqueue.smsturnlbl"
                        :value="configData.SMSTextForPreCall"
                        :active="configData.SendPreCallSMS"
                        @onchange="setSMS($event, 'SMSTextForPreCall', 'SendPreCallSMS')"
                        />
                        <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.virtualqueue.helptextsendprecallsms }}</div>
                    </div>
                    <div class="grid-unit--alpha">
                        <SwitchableTextArea
                        :label="$store.state.settings.virtualqueue.smsmissedlbl"
                        :value="configData.SMSTextForError"
                        :active="configData.SendErrorSMS"
                        @onchange="setSMS($event, 'SMSTextForError', 'SendErrorSMS')"
                        />
                        <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.virtualqueue.helptextsenderrorsms }}</div>
                    </div>
                </div>
                <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.virtualqueue.cloudappheader }}</h2>
                <div class="grid-row">
                    <div class="grid-unit--alpha previewUrl">
                        {{ configData.AgentUrl }}
                    </div>
                    <div class="grid-unit--alpha">
                        <SwitchableTextField
                        :label="$store.state.settings.virtualqueue.cloudapplbl"
                        :value="agentUrlDomain"
                        :active="configData.SendAgentUrl"
                        @onchange="setUrl($event)"
                        />
                        <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.virtualqueue.helptextsendagenturl }}</div>
                    </div>
                    <div class="grid-unit--alpha">
                        <ol class="urllist-wrapper__header">
                            <li class="urllist-line">
                                <span>{{ $store.state.settings.virtualqueue.parameterlbl }}</span>
                                <span>{{ $store.state.settings.virtualqueue.getlbl }}</span>
                            </li>
                        </ol>
                        <ol :class="['urllist-wrapper', {'urllist-wrapper--disabled' : !configData.SendAgentUrl}]">
                            <li v-for="(line, index) in parameterList" class="urllist-line">
                                <span>
                                    <input type="text" v-model="line.paraname" @keyup="setUrl($event)" :data-index="index"/>
                                </span>
                                <span>{{ line.valuename }}</span>
                            </li>
                        </ol>
                        <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.virtualqueue.helptextparameterlist }}</div>
                    </div>
                </div>
            </form>
            <div class="detailscreen-footer detailscreen-footer--inside">
                <div class="grid-unit--alpha">
                    <span>
                        <a class="button-primary button-primary--delete" @click="deleteConfig()">{{ $store.state.settings.virtualqueue.deletelbl }}</a>
                    </span>
                    <span class="grid--push">
                        <a class="button-primary button-primary--gray" @click="closeConfig()">{{ $store.state.settings.virtualqueue.cancellbl }}</a>
                        <a class="button-primary js-submitbtn" :disabled="readonly">{{ $store.state.settings.virtualqueue.savelbl }}</a>
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

  import { ValidateDir }       from './../../directives/validate';
  import RangeSliderValues     from './../uielements/RangeSliderValues.vue';
  import PlayButton            from './../uielements/PlayButtonMp3.vue';
  import { UnitsLabel }        from './../../directives/unitslabel';
  import SwitchableTextArea    from './../uielements/SwitchableTextArea.vue';
  import SwitchableTextField   from './../uielements/SwitchableTextField.vue';
  import { dynamicSortMultiple } from '../../use/sortFunctions';
  import { IPCCCConfigurator } from '../../ipccc/js/configurator';
  import { LanguageCode } from '../../helpers/languageLib';

  export default {
    name: 'ConfigView',
    props: {
      visibility : {
        type : Boolean,
        default : false
      },
      data : {
        type : Object,
        default : null
      },
      customerid : {
        type : Number,
        default : -1
      }
    },
    directives: {
      Validate   : ValidateDir,
      Unitslabel : UnitsLabel
    },
    components: {
      RangeSliderValues,
      PlayButton,
      SwitchableTextArea,
      SwitchableTextField
    },
    computed: {
      configId() {
        return this.configData.Id === -1 ? '' : `#${this.configData.Id}`
      }
    },
    data() {
      return {
        promptList      : [],
        configData      : this.data,
        header          : '',
        showHelp        : false,
        readonly        : true,
        selectedPrompt  : '',
        parameterList   : [],
        agentUrlDomain  : '',
        picked          : 'false',
      }
    },
    inject: ['showLoader'],
    watch: {
      '$route' (to, from) {
        this.showLoader(false);
      },
      visibility: function(oldStatus, newStatus) {
        if(oldStatus !== newStatus) {
          this.configData = {...this.data};
          this.setPicked();
          this.setPromptUrl();
          if(this.configData.AgentUrl !== '' && this.visibility) {
            this.deCompseUrl();
          }
          this.header     = this.configData.Id !== -1 ? this.$store.state.settings.virtualqueue.headeredit : this.$store.state.settings.virtualqueue.headernew;
        }
      },
      picked: function(newVal) {
        if(newVal == 'true') this.configData.IsCallMeBack = true;
        else this.configData.IsCallMeBack = false;
      }
    },
    methods: {
      displayHelp() {
        this.showHelp = !this.showHelp;
      },
      shakeIt() {
        let _elm = this.$refs.detailscreen;
        _elm.classList.add('detailscreen--shake');
        setTimeout(() => {
          _elm.classList.remove('detailscreen--shake');
        }, 1000);
      },
      updateCallOutAttempts(evt) {
        this.configData.MaxCallAttempts = evt;
      },
      updateDailoutTime(evt) {
        this.configData.CallThresholdSeconds = evt;
      },
      saveConfig() {
        this.$emit('save', this.configData);
      },
      deleteConfig() {
        this.$emit('delete', this.configData.Id);
      },
      closeConfig() {
        this.$emit('cancel');
      },
      getPrompts() {
          IPCCCConfigurator.Request(this.customerid, 'prompts', 'readall', null, -1).then(result => {
          this.promptList = result.filter(prompt => prompt.PromptFiles.length > 0 && prompt.PromptFiles[0].LanguageCode > 0);
          this.promptList.sort(dynamicSortMultiple('Title'));
          this.showLoader(false);
        }).catch(error => {
          console.error('Error: ' + error);
          this.showLoader(false);
        });
      },
      setPromptUrl() {
          IPCCCConfigurator.Request(this.customerid, 'prompts', 'playprompt', LanguageCode.Nederlands, this.configData.WhisperPromptId).then(soundUrl => {
          this.selectedPrompt = soundUrl;
        }).catch(error => {
          this.selectedPrompt = '';
          console.error('Error: ', error);
        });
      },
      setPicked() {
        if(this.configData.IsCallMeBack) this.picked = 'true';
        else this.picked = 'false';
      },
      setSMS(evt, valueProp, checkboxProp) {
        this.configData[valueProp] = evt.value;
        this.configData[checkboxProp] = evt.active;
      },
      composeUrl(index) {
        let _queryStr = this.parameterList.reduce((qStr, element) => {
                          if(element.paraname !== '') {
                            qStr.push(`${element.paraname}=%${element.valuename}%`)
                          }
                          return qStr;
                        }, []);

        if(this.agentUrlDomain === '') {
          this.configData.AgentUrl = '';
        } else if(this.agentUrlDomain !== '' && _queryStr.length === 0) {
          this.configData.AgentUrl = this.agentUrlDomain;
        } else {
          this.configData.AgentUrl = `${this.agentUrlDomain}?${_queryStr.join('&')}`;
        }
      },
      setUrl(evt) {
        if(Object.prototype.toString.call(evt) === '[object Object]') {
          this.agentUrlDomain          = evt.value;
          this.configData.SendAgentUrl = evt.active;
          this.composeUrl(-1);
        } else {
          this.composeUrl(evt.target.getAttribute('data-index'));
        }
      },
      deCompseUrl() {
        let _urlParts = this.configData.AgentUrl.split('?');
        this.agentUrlDomain = _urlParts[0];
        if(_urlParts.length > 1) {
          let _queryArray = _urlParts[1].replace(/%/gm, '').split(/&|=/);
          _queryArray.forEach((element, index) => {
            if(index%2 === 0) {
              let _index = this.parameterList.findIndex(item => item.valuename === _queryArray[index+1]);
              if(_index !== -1)
                this.parameterList[_index].paraname = element
            }
          });
        }
      },
    },
    mounted() {
      this.parameterList = [{
        valuename : 'Number',
        paraname  : ''
      }, {
        valuename : 'Outbound_identity',
        paraname  : ''
      }, {
        valuename : 'CallId',
        paraname  : ''
      }, {
        valuename : 'Callgroup',
        paraname  : ''
      }, {
        valuename : 'CallMeNow_Config',
        paraname  : ''
      }, {
        valuename : 'Context',
        paraname  : ''
      }, {
        valuename : 'Source',
        paraname  : ''
      }, {
        valuename : 'Date',
        paraname  : ''
      }, {
        valuename : 'Time',
        paraname  : ''
      }, {
        valuename : 'Param_1_Value',
        paraname  : ''
      }, {
        valuename : 'Param_2_Value',
        paraname  : ''
      }, {
        valuename : 'Param_3_Value',
        paraname  : ''
      }, {
        valuename : 'Param_4_Value',
        paraname  : ''
      }, {
        valuename : 'Param_5_Value',
        paraname  : ''
      }]
      this.showLoader(false);
    }
  }
</script>

<style lang="scss" scoped>

  @use "@/scss/includes/functions";
  @use "@/scss/includes/globals";

  .detailscreen__title-id {
    float: right;
    color: globals.$color-gray40;
  }

  .prompt-select {
    select {
      width: calc(100% - 35px);
    }
    .button__icon-play--small {
      margin-top: 10px !important;
    }
    [class^="button__icon"] {
      margin-top: 16px;
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

  .urllist-wrapper {
    position: relative;
    width: 100%;
    height: 245px;
    border: 1px solid transparent;
    border-color: globals.$color-gray30 transparent;
    overflow: hidden;
    overflow-y: scroll;
    &__header {
      overflow: hidden;
      width: calc(100% - 17px);
      height: 35px;
      color: globals.$color-gray35;
      font-family: 'Open Sans SemiBold', sans-serif;
      font-size: .7rem;
      span {
        height: 35px;
        line-height: 35px;
        padding: 0 3px;
      }
    }
  }

  .urllist-line {
    position: relative;
    width: 100%;
    height: 40px;
    span {
      float: left;
      display: block;
      width: 50%;
      height: 40px;
      line-height:  40px;
      font-size: .9rem;
      color: globals.$color-gray50;
      padding: 0 3px;
    }
    &:nth-child(even) {
      background-color: globals.$color-gray2;
    }
    input {
      width: 90%;
      height: 36px;
      line-height: 36px;
      border: none;
      border-bottom: 1px solid globals.$color-gray35;
      background-color: transparent;
      padding-left: 3px;
      padding-top: 10px;
      resize:none;
      color: globals.$color-gray60;
      font-size: 1rem;
    }
  }

  .urllist-wrapper--disabled {
    opacity: .6;
    user-select: none;
    pointer-events: none;
    input {
      pointer-events: none;
      user-select: none;
    }
  }

  .previewUrl {
    color: globals.$color-home;
    font-size: .9rem;
    word-wrap: break-word;
    overflow: hidden;
  }

</style>
