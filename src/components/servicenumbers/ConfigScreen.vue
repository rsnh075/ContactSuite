<template>
  <div :class="['detailscreen-wrapper', {'detailscreen-wrapper--visable' : modalopen}]" data-e2e="service-config-screen">
    <div class="detailscreen detailscreen--fit" id="detailscreenX">
      <a v-if="showHelpOn" :class="['button-help', {'button-help--active' : showHelp}]" @click="displayHelp">?</a>
      <form @valid="onSave()" @notvalid="shakeIt()" v-validateasyncformcomponents="{'submitBtns' : 'js-submitbtn'}" autocomplete="off">
        <input type="hidden" data-reset="" ref="reset">
        <div class="grid-row">
          <div class="grid-unit--gamma--double">
            <span v-if="type == 'internalservicenumber' && !isnewisn" class="detailscreen__title">{{ getISNFirstPartOfNumber() }}</span>
            <span v-else class="detailscreen__title">{{ title }}</span>
          </div>
          <div class="grid-unit--gamma">
            <span class="detailscreen__title detailscreen__title--right detailscreen__title--small">{{ getTypeLabel(numbertype, $store.state.settings.servicenumbers) }}</span>
          </div>
        </div>
        <div class="grid-row">
          <div class="grid-unit--alpha">
            <TabBar
              :tabdata="tabdata"
              @switchtab="showActive"
            />
          </div>
        </div>
        <!-- GROUP PARAMS -->
        <section v-show="type === 'voipgroup' && tabdata[0].isactive">
          <div class="grid-row">
            <div class="grid-unit--beta">
              <div class="form-textfield form-textfield--bground">
                <input type="text" name="Groupname" v-model="extraData.groupName" :data-validate="setValidation((type === 'voipgroup'), 'isNotEmpty')" :data-message="$store.state.settings.servicenrconfig.groupnamemessage">
                <label for="Groupname" class="form-label form-label--hidden">{{ $store.state.settings.servicenrconfig.groupname }}</label>
                <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.servicenrconfig.helptextgroupname }}</div>
              </div>
            </div>
            <div class="grid-unit--beta">
              <div class="form-textfield form-textfield--bground">
                <input type="text" name="voiceEmail" v-model="extraData.voiceEmail" :data-validate="setValidation((type === 'voipgroup'), 'isEmail')" :data-message="$store.state.settings.servicenrconfig.voicemailmessage">
                <label for="voiceEmail" class="form-label form-label--hidden">{{ $store.state.settings.servicenrconfig.voiceemail }}</label>
                <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.servicenrconfig.helptextvoiceemail }}</div>
              </div>
            </div>
          </div>
          <div class="grid-row">
            <div class="grid-unit--beta">
              <label class="form-label form-label--list-inline">{{ $store.state.settings.servicenrconfig.distribution }}</label>
              <div class="form-radio-small form-radio-small--inline">
                <input type="radio" id="distribution_one" v-model="extraData.distribution" value="true">
                <label for="distribution_one">{{ $store.state.settings.servicenrconfig.groupring }}</label>
              </div>
              <div class="form-radio-small form-radio-small--inline">
                <input type="radio" id="distribution_two" v-model="extraData.distribution" value="false">
                <label for="distribution_two">{{ $store.state.settings.servicenrconfig.longestidle }}</label>
              </div>
              <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.servicenrconfig.helptextdistribution }}</div>
            </div>
            <div class="grid-unit--beta">
              <label class="form-label form-label--list-inline">{{ $store.state.settings.servicenrconfig.takeover }}</label>
              <div class="form-radio-small form-radio-small--inline">
                <input type="radio" id="takeover_one" v-model="extraData.takeover" value="true">
                <label for="takeover_one">{{ $store.state.settings.servicenrconfig.takeovertrue }}</label>
              </div>
              <div class="form-radio-small form-radio-small--inline">
                <input type="radio" id="takeover_two" v-model="extraData.takeover" value="false">
                <label for="takeover_two">{{ $store.state.settings.servicenrconfig.takeoverfalse }}</label>
              </div>
              <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.servicenrconfig.helptexttakeover }}</div>
            </div>
          </div>
        </section>
        <!-- EMAIL PARAMS -->
        <section v-show="type === 'email' && tabdata[0].isactive">
          <div class="grid-row">
            <div class="grid-unit--beta">
              <div class="form-textfield form-textfield--bground">
                <input type="text" name="email" v-model="extraData.eMail" :data-validate="setValidation((type === 'email'), 'isEmail')" :data-message="$store.state.settings.servicenrconfig.emailmessage">
                <label for="email" class="form-label form-label--hidden">{{ $store.state.settings.servicenrconfig.email }}</label>
                <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.servicenrconfig.helptextemail }}</div>
              </div>
            </div>
            <div class="grid-unit--beta">
              <div class="form-textfield form-textfield--bground">
                <input type="text" name="subject" v-model="extraData.subject" :data-validate="setValidation((type === 'email'), 'isNotEmpty')" :data-message="$store.state.settings.servicenrconfig.subjectmessage">
                <label for="subject" class="form-label form-label--hidden">{{ $store.state.settings.servicenrconfig.subject }}</label>
                <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.servicenrconfig.helptextsubject }}</div>
              </div>
            </div>
          </div>
          <div class="grid-row">
            <div class="grid-unit--alpha">
              <div class="form-textarea form-textarea--description form-textarea--description-short">
                <label>{{ $store.state.settings.servicenrconfig.body }}</label>
                <textarea maxlength="180" v-model="extraData.body"></textarea>
                <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.servicenrconfig.helptextbody }}</div>
              </div>
            </div>
          </div>
        </section>
        <!-- ISN PARAMS -->
        <section v-show="type == 'internalservicenumber' && tabdata[0].isactive">
          <div class="grid-row">
            <div class="grid-unit--beta">
              <div class="form-textfield form-textfield--bground" v-charcount="{'fieldName' : 'isntitle', 'maxChars' : 24, 'targetClass' : 'form-textfield__feedback-inline', 'maxCharsColor' : '#6ABC45'}">
                <input type="text" name="isntitle" v-model="extraISNData.Title" :data-validate="setValidation((type === 'internalservicenumber'), 'isNotEmpty')" :data-message="$store.state.settings.servicenrconfig.isntitlemessage">
                <label for="isntitle" class="form-label form-label--hidden">{{ $store.state.settings.servicenrconfig.isntitlelbl }}</label>
                <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.servicenrconfig.helptextisntitle }}</div>
              </div>
            </div>
            <div class="grid-unit--beta">
              <div class="form-textfield form-textfield--bground" v-charcount="{'fieldName' : 'isndescription', 'maxChars' : 44, 'targetClass' : 'form-textfield__feedback-inline', 'maxCharsColor' : '#6ABC45'}">
                <input type="text" name="isndescription" v-model="extraISNData.Description">
                <label for="isndescription" class="form-label form-label--hidden">{{ $store.state.settings.servicenrconfig.isndescriptionlbl }}</label>
                <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.servicenrconfig.helptextisndescription }}</div>
              </div>
            </div>
          </div>
          <div class="grid-row">
            <div class="grid-unit--beta">
              <div v-if="isnewisn" class="form-textfield form-textfield--bground" v-charcount="{'fieldName' : 'isnNumber', 'maxChars' : isnlength, 'targetClass' : 'form-textfield__feedback-inline', 'maxCharsColor' : '#6ABC45'}">
                <input type="text" name="isnNumber" id="isnNumber" v-model="extraISNData.Number" :data-validate="setValidation((type === 'internalservicenumber'), isnNumberRule)" :data-message="$store.state.settings.servicenrconfig.isnnumbermessage" @keyup="checkNrExistsAlready($event)">
                <label for="isnNumber" class="form-label form-label--hidden">{{ $store.state.settings.servicenrconfig.isnnumberlbl }}</label>
                <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.servicenrconfig.helptextisnnumber }}</div>
              </div>
              <div v-else class="form-textfield form-textfield--bground">
                <input disabled type="text" name="isnNumber" id="isnNumber" :value="getISNFirstPartOfNumber()">
                <label for="isnNumber" class="form-label form-label--hidden">{{ $store.state.settings.servicenrconfig.isnnumberlbl }}</label>
                <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.servicenrconfig.helptextisnnumber }}</div>
              </div>
              <div class="form-selectfield form-selectfield--no-margin">
                <label for="costcenterlbl" class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.configadvanced.costcenterlbl[0] }}</label>
                <select id="costcenterlbl" name="costcenterlbl" v-model="extraISNData.KostenPlaatsId">
                  <option value="-1">{{ $store.state.settings.configadvanced.costcenterlbl[1] }}</option>
                  <option v-for="costcenter in costcenterlist" :key="costcenter.Id" :value="costcenter.Id">{{ costcenter.Name }}</option>
                </select>
              </div>
            </div>
            <div class="grid-unit--beta">
              <label class="typo-input-label typo-input-label--h20">{{ $store.state.settings.configadvanced.advancedoptionlbl[0] }}</label>
              <div class="form-checkbox form-checkbox--medium">
                <input type="checkbox" name="isnadvancedoption3" id="isnadvancedoption3" v-model="extraISNData.QM">
                <label for="isnadvancedoption3">{{ $store.state.settings.configadvanced.advancedoptionlbl[3] }}</label>
              </div>
              <!-- <div class="form-checkbox form-checkbox--medium">
                <input type="checkbox" name="isnadvancedoption4" id="isnadvancedoption4" v-model="extraISNData.RecordEveryCall">
                <label for="isnadvancedoption4">{{ $store.state.settings.configadvanced.advancedoptionlbl[4] }}</label>
              </div> -->
            </div>
          </div>
        </section>
        <!-- LIST HEADER -->
        <section v-show="type !== 'email' && tabdata[0].isactive">
          <div class="grid-row">
            <div class="grid-unit--alpha">
              <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
                <input type="text" v-model="searchStr" :placeholder="$store.state.settings.servicenrconfig.searchldl" @keyup="filterList($event)">
              </div>
              <div v-if="type === 'couple'" class="typo-tabletitle">
                {{ totalInList }}&nbsp;{{ $store.state.settings.servicenrconfig.callflowstotals }}
              </div>
              <div v-else class="typo-tabletitle">
                {{ totalInList }}&nbsp;{{ $store.state.settings.servicenrconfig.totals }}
              </div>
              <div class="grid--push">
                <div class="form-button__secondary form-button__secondary--add grid--push">
                  <button type="button" v-if="type === 'couple' || type == 'internalservicenumber'" @click="coupleCallFlow($event)">{{ $store.state.settings.servicenrconfig.addcallflowlbl }}</button>
                  <input type="hidden" v-model="totalSelected" :data-validate="setValidation((type === 'couple'), 'isNotZero')" :data-message="$store.state.settings.servicenrconfig.listmessage">
                </div>
              </div>
            </div>
          </div>
          <!-- LOOKUP LIST -->
          <div class="grid-row">
            <div class="grid-unit--alpha" v-if="hasUnKnownCallPlan">
              <div class="typo--attention">{{ $store.state.settings.servicenrconfig.hasunknowncallplanlbl }} {{ extradata.selectedCallPlanWPName }}</div>
            </div>
            <div class="grid-unit--alpha">
              <div class="config__listheader">
                <span v-if="type === 'couple'" class="coll35">{{ $store.state.settings.servicenrconfig.headerlabels[2] }}</span>
                <span v-else class="coll35">{{ $store.state.settings.servicenrconfig.headerlabels[0] }}</span>
                <span class="coll65">{{ $store.state.settings.servicenrconfig.headerlabels[1] }}</span>
              </div>
              <div v-if="hasUnKnownCallPlan" class="config__lookup-list--disabled"></div>
              <ol class="config__lookup-list">
                <li v-for="item in listContent" class="config__lookup-list-item" :data-selected="isSelected(item[params.collName01], extraData.selected, extraData.selectedCallPlanWPName)" @click="onSelect(item[params.selectProp], item[params.collName01])" >
                  <span class="coll35">{{ item[params.collName01] }}</span>
                  <span class="coll65">{{ item[params.collName02] }}</span>
                </li>
              </ol>
            </div>
          </div>
        </section>
        <section>
          <ConfigBlacklist ref="blacklist" v-show="tabdata[1].isactive && type !=='internalservicenumber'"
            :isactive="tabdata[1].isactive"
            :blacklistdata="blacklistdata"
            :selectedsnid="extradata.selectedSnId"
            @changedblacklistdata="changedBlackListdata"
          />
          <!-- <ConfigTariff v-show="tabdata[2].isactive"
            :isactive="tabdata[2].isactive"
            :showhelp="showHelp"
            :custid="custid"
            :languagecode="extradata.selectedLangId"
          /> -->
          <ConfigAdvanced v-show="tabdata[2].isactive && type !=='internalservicenumber'"
            :isactive="tabdata[2].isactive"
            :showhelp="showHelp"
            :costcenterlist="costcenterlist"
            :advanceddata="advanceddata"
            @changedadvanceddata="changedAdvancedData"
          />
        </section>
        <div class="grid-row">
          <div class="grid-unit--alpha">
            <span v-if="couplingIsSaved">
              <a class="button-primary button-primary--decouple" @click="onDecouple()">{{ $store.state.settings.servicenrconfig.decouplebtnlbl }}</a>
            </span>
            <span class="grid--push">
              <a class="button-primary button-primary--gray" @click="onCancel()">{{ $store.state.settings.servicenrconfig.cancellbl }}</a>
              <a class="button-primary js-submitbtn">{{ $store.state.settings.servicenrconfig.savelbl }}</a>
            </span>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>

  import { ValidateAsyncDir }    from './../../directives/validateasyncformcomponents';
  import TabBar             from './../uielements/TabBar.vue';
  import ConfigBlacklist    from './ConfigBlacklist.vue';
  import ConfigTariff       from './ConfigTariff.vue';
  import ConfigAdvanced     from './ConfigAdvanced.vue';
  import { CharCount }      from './../../directives/charcount';

  export default {
    name: 'ConfigScreen',
    props: ['params', 'modalopen', 'custid', 'title', 'type', 'data', 'extradata', 'blacklistdata', 'costcenterlist', 'numbertype', 'advanceddata', 'isnewisn', 'isnnotallowedlist', 'isnlength', 'extraisndata'],
    components: {
      TabBar,
      ConfigBlacklist,
      ConfigTariff,
      ConfigAdvanced
    },
    data() {
      return {
        listContent      : [],
        totalInList      : 0,
        searchStr        : '',
        showHelp         : false,
        hasUnKnownCallPlan : false,
        extraData        : {
          groupName        : '',
          voiceEmail       : '',
          eMail            : '',
          distribution     : '',
          takeover         : '',
          subject          : '',
          body             : '',
          selected         : null
        },
        extraISNData       : {
          Title            : '',
          Description      : '',
          Number           : '',
          QM               : false,
        //   RecordEveryCall  : false,
          KostenPlaatsId   : -1
        },
        totalSelected      : 0,
        tabdata            : [
          {
            tablabel  : '', //depending on the type
            isvisable : true,
            isactive  : true,
            isvalid   : true
          },{
            tablabel  : this.$store.state.settings.servicenrconfig.tabbarlbl[0],
            isvisable : true,
            isactive  : false,
            isvalid   : true
          },{
            tablabel  : this.$store.state.settings.servicenrconfig.tabbarlbl[2],
            isvisable : true,
            isactive  : false,
            isvalid   : true
          },
        ],
        isnNumberRule        : 'isNotEmpty',
      }
    },
    inject: ['showLoader'],
    directives: {
      validateasyncformcomponents : ValidateAsyncDir,
      charcount  : CharCount,
    },
    watch: {
      modalopen: function(newVal, oldVal) {
        this.setSettingsToDefault();
        this.hasUnKnownCallPlan = false;
        this.extraData          = {...this.extradata};
        if(this.type == 'internalservicenumber') this.extraISNData = {...this.extraisndata};
        this.listContent        = this.data;
        this.totalInList        = this.listContent.length;
        this.totalSelected      = (this.type === 'voipgroup') ? this.extraData.selected.length : (this.extraData.selected === '') ? 0 : 1;
        if((this.type === 'couple' || this.type === 'internalservicenumber') && this.extraData.selected >= 0 && !this.isnewisn) {
          //get selected callplan, if selectable
          let _selCP = this.listContent.find(plan => plan.Name.toLowerCase() === this.extraData.selectedCallPlanWPName.toLowerCase())
          if(_selCP && _selCP !== 'undefined' && _selCP.ScriptType !== 'Flash') {
            this.hasUnKnownCallPlan = false;
            this.extraData.selected = _selCP.Id;
          } else {
            this.hasUnKnownCallPlan = true;
          }
        }
        this.setTabs();
        this.$refs.reset.dispatchEvent(new Event('reset'));
      },
    },
    computed: {
        couplingIsSaved() {
            return this.type === 'voipgroup' ? this.extraData.savedSelected ? this.extraData.savedSelected.length > 0 : false : (this.extraData.savedSelected > 1 || (this.type == 'email' && this.extraData.savedSelected?.toString().length > 0));
        },
        isCoupled() {
            return this.type === 'voipgroup' ? this.extraData.selected ? this.extraData.selected.length > 0 : false : (this.extraData.selected > 1);
        },
        showHelpOn() {
            return this.modalopen && (
                        this.tabdata[2].isactive ||
                        this.tabdata[0].isactive && (
                            this.type === 'internalservicenumber' ||
                            this.type === 'voipgroup'
                        )
                    );
        }
    },
    methods: {
      resetDetail() {
        this.$refs.blacklist.destroyDatePicker();
      },
      setValidation(visible, valType) {
        return visible ? valType : valType + '_skip';
      },
      shakeIt() {
        let _elm = document.querySelector("#detailscreenX");
        _elm.classList.add('detailscreen--shake');
        setTimeout(() => {
          _elm.classList.remove('detailscreen--shake');
        }, 1000);
      },
      displayHelp() {
        this.showHelp = !this.showHelp;
      },
      isSelected(itemVal, currentVal, currentWPName = '-') {
        if(this.type === 'voipgroup') {
          return currentVal.indexOf(itemVal) > -1;
        } else if(this.type === 'couple' || this.type === 'internalservicenumber') {
          return this.isCoupled ? (itemVal == currentWPName) : (itemVal == currentVal);
        } else {
          return (itemVal == currentVal);
        }
      },
      filterList(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        this.listContent = this.data.filter(item => {
          if(item[this.params.collName01].toLowerCase().indexOf(this.searchStr.toLowerCase()) != -1 || item[this.params.collName02].toLowerCase().indexOf(this.searchStr.toLowerCase()) != -1) {
            return item;
          };
        });
        this.totalInList = this.listContent.length;
      },
      onCancel() {
        this.resetDetail();
        this.$emit('oncancel');
      },
      onDecouple() {
        this.resetDetail();
        this.$emit('ondecouple');
      },
      onSave() {
        this.showLoader(true);
        if(this.isnewisn) this.hasUnKnownCallPlan = this.extraData.selected == -1;
        if(this.type === 'internalservicenumber') this.extraData.extraISNData = this.extraISNData;
        this.$emit('onsave', this.extraData, this.type, !this.hasUnKnownCallPlan);
      },
      onSelect(newVal, newCallPlanName = '-') {
        if(this.type === 'voipgroup') {
          this.updateList(newVal);
          this.totalSelected      = this.extraData.selected.length;
        } else {
          this.totalSelected      = 1;
          this.extraData.selected = newVal;
          if(this.type === 'couple' || this.type === 'internalservicenumber') this.extraData.selectedCallPlanWPName = newCallPlanName;
        }
      },
      updateList(val) {
        let _index = this.extraData.selected.findIndex(v => v == val);
        if(_index === -1) {
          this.extraData.selected.push(val);
        } else {
          this.extraData.selected.splice(_index, 1);
        }
      },
      addNumber(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        this.$router.push({path : '/management/voipaccounts/'});
      },
      coupleCallFlow(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        this.$router.push({path : '/availability/call-flow/manage/'});
      },
      changedBlackListdata(data) {
        this.extraData.blackListData = data;
      },
      changedAdvancedData(data) {
        if(!this.isnewisn) this.extraData.advancedData = data;
      },
      checkNrExistsAlready(evt) {
        //also check if the length is valid
        let _val = evt.target.value;
        if(this.isnewisn && _val.length != this.isnlength)  {
          //isEmail is used to initiate false validation, so false is intended because the length is incorrect
          this.isnNumberRule = 'isEmail';
        } else if(this.isnewisn && this.isnnotallowedlist.indexOf(_val) != -1) {
          //isEmail is used to initiate false validation, so false is intended because nr already exists
          this.isnNumberRule = 'isEmail';
        } else if(this.isnewisn && _val.length == 0) {
          this.isnNumberRule = 'isNotEmpty';
        } else {
          this.isnNumberRule = 'isNotEmpty'
        }
      },
      //==========================================VIEW HELPER FUNCTIONS
      showActive(clickedTabIndex) {
        let _activeTabIndex  = this.tabdata.findIndex(tab => tab.isactive);
        if(clickedTabIndex != _activeTabIndex) {
          this.tabdata[_activeTabIndex].isactive = false;
          this.tabdata[clickedTabIndex].isactive = true;
        }
      },
      setSettingsToDefault() {
        this.searchStr = '';
        // this.totalInList = 0;
        this.totalSelected = 0;
      },
      setTabs() {
        this.tabdata.forEach(tab => tab.isactive = false);
        this.tabdata[0].isactive = true;
        this.tabdata.forEach(tab => tab.isvisible = true);
        if(this.modalopen) {
          this.tabdata[1].isvisable = true;
          this.tabdata[2].isvisable = true;
          switch(this.type) {
            case 'couple':
              this.tabdata[0].tablabel = this.$store.state.settings.servicenrconfig.tabbarlblone[0];
              break;
            case 'voipaccount':
              this.tabdata[0].tablabel = this.$store.state.settings.servicenrconfig.tabbarlblone[1];
              break;
            case 'voipgroup':
              this.tabdata[0].tablabel = this.$store.state.settings.servicenrconfig.tabbarlblone[2];
              break;
            case 'email':
              this.tabdata[0].tablabel = this.$store.state.settings.servicenrconfig.tabbarlblone[3];
              break;
            case 'internalservicenumber':
              this.tabdata[0].tablabel = this.$store.state.settings.servicenrconfig.tabbarlblone[4];
              this.tabdata[1].isvisable = false;
              this.tabdata[2].isvisable = false;
              break;
          }
        } else {
          this.tabdata[0].tablabel = '';
        }
      },
      getTypeLabel(typeIndex, store) {
        return this.type == 'internalservicenumber' ? store.numbertypelabels[3] : store.numbertypelabels[typeIndex];
      },
      getISNFirstPartOfNumber() {
        return this.title?.includes('@') ? this.title.split('@')[0] : this.title;
      },
    },
    mounted() {

    }
  }
</script>

<style lang="scss" scoped>
  @use "@/scss/includes/config";

  .button-primary.button-primary--gray {
    margin-right: 10px;
  }
</style>
