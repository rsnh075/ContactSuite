<template>
  <div class="detailscreen-wrapper detailscreen-wrapper--visable" data-e2e="voip-account">
    <div id="detailscreen" class="detailscreen">
      <a :class="['button-help', { 'button-help--active': showHelp }]" @click="displayHelp">?</a>
        <!-- <div class="grid-row">
        {{data}}
        </div> -->
      <div class="grid-row">
        <div class="grid-unit--gamma--double detailscreen-wrapper__title">
          <div :class="activeIcon(data.Online, data.Active)"></div>
          <span class="detailscreen__title">{{ $store.state.settings.voipaccounts.accounttitle }}</span>
        </div>
        <div class="grid-unit--gamma">
            <span class="detailscreen__title detailscreen__title--right detailscreen__title--small">#{{ 1 }}</span>
          </div>
      </div>
      <div class="grid-row">
        <div class="grid-unit--alpha">
          <TabBar :tabdata="tabdata" @switchtab="showActive" />
        </div>
      </div>
      <form @valid="saveDetail()" @notvalid="shakeIt()" v-validate="{ submitBtns: 'js-submitbtn' }" :data-partial="validationStatus">
        <div class="grid-row tabs-content-wrapper" ref="tabContent">
          <div v-show="tabdata[0].isactive" class="js-tabcontent">
            <div class="grid-row">
              <div class="grid-unit--beta">
                <div class="form-textfield form-textfield--bground" v-charcount="{ fieldName: 'internalNumber', maxChars: data.PBXNumberLength, targetClass: 'form-textfield__feedback-inline', maxCharsColor: '#6ABC45' }">
                  <input
                    :disabled="detailstatus == 'edit'"
                    type="text"
                    name="internalNumber"
                    id="internalNumber"
                    v-model="data.InternalNumber"
                    :data-validate="setValidation(intNrRule)"
                    :data-message="$store.state.settings.voipaccounts.validateintnrempty"
                    @keyup="checkNrExistsAlready($event)"
                  />
                  <label for="internalNumber" class="form-label form-label--hidden">{{ $store.state.settings.voipaccounts.forminternalnumber }}</label>
                  <div :class="['typo-helptext', { 'typo-helptext--active': showHelp }]">{{ $store.state.settings.voipaccounts.helptextinternalnumber }}</div>
                </div>
              </div>
              <div class="grid-unit--beta">
                <div class="form-textfield form-textfield--bground" v-charcount="{ fieldName: 'description', maxChars: 60, targetClass: 'form-textfield__feedback-inline' }">
                  <input type="text" name="description" id="description" v-model="data.Description" data-validate="isNotEmpty" :data-message="$store.state.settings.voipaccounts.validatedescription" />
                  <label for="description" class="form-label form-label--hidden">{{ $store.state.settings.voipaccounts.formdescription }}</label>
                  <div :class="['typo-helptext', { 'typo-helptext--active': showHelp }]">{{ $store.state.settings.voipaccounts.helptextdescription }}</div>
                </div>
              </div>
            </div>
            <div class="grid-row" v-if="detailstatus != 'new'">
              <div class="grid-unit--beta">
                <label class="form-label form-label--list-inline">{{ $store.state.settings.voipaccounts.formactivation }}</label>
                <div class="form-radio-small form-radio-small--inline">
                  <input type="radio" id="radio_two" value="3" v-model="picked" />
                  <label for="radio_two">{{ $store.state.settings.voipaccounts.formactivationradio[1] }}</label>
                </div>
                <div class="form-radio-small form-radio-small--inline">
                  <input type="radio" id="radio_three" value="1" v-model="picked" />
                  <label for="radio_three">{{ $store.state.settings.voipaccounts.formactivationradio[2] }}</label>
                </div>
                <div :class="['typo-helptext', { 'typo-helptext--active': showHelp }]">{{ $store.state.settings.voipaccounts.helptextactivation }}</div>
              </div>
              <div class="grid-unit--beta">
                <div class="form-textfield form-textfield--bground">
                  <input disabled type="text" name="formOnline" id="formOnline" v-model="niceDateTime" />
                  <label for="formOnline" class="form-label form-label--hidden">{{ $store.state.settings.voipaccounts.formonline }}</label>
                  <div :class="['typo-helptext', { 'typo-helptext--active': showHelp }]">{{ $store.state.settings.voipaccounts.helptextonline }}</div>
                </div>
              </div>
            </div>
            <div class="grid-row" v-if="detailstatus != 'new'">
              <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.voipaccounts.authenticationtitle }}</h2>
            </div>
            <div class="grid-row" v-if="detailstatus != 'new'">
              <div class="grid-unit--beta">
                <div class="form-textfield form-textfield--bground" v-copytoclipboard="{ fieldName: 'formUname', targetClass: 'form-textfield__copytoclipboard' }">
                  <input disabled type="text" name="formUname" id="formUname" v-model="data.UserName" />
                  <label for="formUname" class="form-label form-label--hidden">{{ $store.state.settings.voipaccounts.formuname }}</label>
                  <div :class="['typo-helptext', { 'typo-helptext--active': showHelp }]">{{ $store.state.settings.voipaccounts.helptextuname }}</div>
                </div>
              </div>
              <div class="grid-unit--beta">
                <div class="form-textfield form-textfield--bground" v-copytoclipboard="{ fieldName: 'formPword', targetClass: 'form-textfield__copytoclipboard' }">
                  <input disabled type="text" name="formPword" id="formPword" v-model="data.Password" />
                  <label for="formPword" class="form-label form-label--hidden">{{ $store.state.settings.voipaccounts.formpword }}</label>
                  <div :class="['typo-helptext', { 'typo-helptext--active': showHelp }]">{{ $store.state.settings.voipaccounts.helptextpword }}</div>
                </div>
              </div>
            </div>
            <div class="grid-row" v-if="detailstatus != 'new'">
              <div class="grid-unit--alpha">
                <div class="form-textfield form-textfield--bground form-textfield--50split form-textfield--split-char" v-copytoclipboard="{ fieldName: 'formSipAcount', targetClass: 'form-textfield__copytoclipboard' }" data-splitchar="@">
                  <input disabled type="text" name="formSipAcount" id="formSipAcount" v-model="sipAcount" />
                  <label for="formSipAcount" class="form-label form-label--hidden">{{ $store.state.settings.voipaccounts.formsipaddress }}</label>
                  <div :class="['typo-helptext', { 'typo-helptext--active': showHelp }]">{{ $store.state.settings.voipaccounts.helptextsipaddress }}</div>
                </div>
                <div class="form-textfield form-textfield--bground form-textfield--50split" v-copytoclipboard="{ fieldName: 'formSipDomain', targetClass: 'form-textfield__copytoclipboard' }">
                  <input disabled type="text" name="formSipDomain" id="formSipDomain" v-model="sipDomain" />
                  <label for="formSipDomain" class="form-label form-label--hidden">{{ $store.state.settings.voipaccounts.formdomain }}</label>
                </div>
              </div>
            </div>

            <div class="grid-row">
              <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.voipaccounts.autoconfigtitle }}</h2>
            </div>

            <div class="grid-row">
              <div class="grid-unit--beta typo--paragraph" v-if="detailstatus == 'new'">
                <span>{{ $store.state.settings.voipaccounts.autoconfigdesc }}</span>
                <span class="grid--push"
                  ><a href="javascript:;" @click="toggleModal()">{{ $store.state.settings.voipaccounts.tocertifieddevices }}</a></span
                >
              </div>
              <div class="grid-unit--beta">
                <div v-if="detailstatus !== 'edit'" class="form-checkbox form-checkbox--large">
                  <input :disabled="detailstatus == 'edit'" type="checkbox" name="webrtc" id="webrtc" v-model="iswebrtc" @change="handleWebRTCMac" />
                  <label for="webrtc">{{ $store.state.settings.voipaccounts.webrtclbl }}</label>
                </div>

                <div class="form-textfield form-textfield--bground" ref="macField">
                  <input
                    :disabled="(detailstatus === 'edit' && savedMac !== 'WEBRTC' && this.savedMac !== '') || iswebrtc"
                    type="text"
                    :name="macid"
                    :id="macid"
                    v-model="data.MACAddress"
                    :placeholder="$store.state.settings.voipaccounts.formmacaddressplaceholder"
                    :data-validate="setValidation(macRule)"
                    :data-message="$store.state.settings.voipaccounts.validatemacaddress"
                    @keydown="controleInputMac($event, 'MACAddress')"
                    @keyup="checkMac($event)"
                  />
                  <label :for="macid" class="form-label form-label--hidden">{{ $store.state.settings.voipaccounts.formmacaddress }}</label>
                  <div :class="['typo-helptext', { 'typo-helptext--active': showHelp }]">{{ $store.state.settings.voipaccounts.helptextmacaddress }}</div>
                </div>
              </div>
              <div class="grid-unit--beta" v-if="detailstatus != 'new'"></div>
            </div>
          </div>

          <div v-show="tabdata[1].isactive" class="js-tabcontent">
            <VoipAccountSettings
              :showhelp="showHelp"
              :isactive="tabdata[1].isactive"
              :identitylist="identitylist"
              :departmentlist="departmentlist"
              :departmentid="data.DepartmentId"
              :datasettings="datasettings"
              @setsettings="setsettings"
              @changeddepartmentid="setDepartmentId"
            />
          </div>
        </div>
      </form>
      <!-- BUTTONS -->
      <div class="detailscreen-footer detailscreen-footer--inside">
        <span v-if="detailstatus == 'edit'">
          <a class="button-primary button-primary--delete" @click="deleteDetail()">{{ $store.state.settings.voipaccounts.deletebtnlbl }}</a>
        </span>
        <span class="grid--push">
          <a class="button-primary button-primary--gray" @click="closeDetail()">{{ $store.state.settings.voipaccounts.closebtnlbl }}</a>
          <a v-if="detailstatus == 'new'" class="button-primary js-submitbtn" @mousedown="setSubmitAction('savenext')">{{ $store.state.settings.voipaccounts.savenextbtnlbl }}</a>
          <a class="button-primary js-submitbtn" @mousedown="setSubmitAction('save')">{{ $store.state.settings.voipaccounts.savebtnlbl }}</a>
        </span>
      </div>
    </div>

    <voip-account-modal v-if="statusVoipModal" :devicelist="deviceList" :rawlist="rawphtypeslist" @togglemodal="toggleModal" />
  </div>
</template>

<script>

import * as Mask from "./../../utils/cm_mask";
import { ValidateDir } from "./../../directives/validate";
import { CharCount } from "./../../directives/charcount";
import { CopyToClipboard } from "./../../directives/copytoclipboard";
import TabBar from "./../uielements/TabBar.vue";
import VoipAccountSettings from "./Voip-account-settings.vue";
import VoipAccountModal from "./Voip-account-modal.vue";
import { 
          convertISOToDateTime
        }                   from './../../use/dateFunctions';

export default {
  name: "VoipAccount",
  props: ["detailstatus", "data", "nrlist", "rawphtypeslist", "macid", "datasettings", "identitylist", "departmentlist"],
  components: {
    VoipAccountModal,
    TabBar,
    VoipAccountSettings,
  },
  data: function () {
    return {
      showHelp: false,
      submitAction: "",
      statusVoipModal: false,
      deviceList: {},
      intNrRule: "isNotEmpty",
      macRule: "isAll",
      intNrMsg: "",
      sipAcount: "",
      sipDomain: "",
      niceDateTime: "",
      iswebrtc: false,
      savedMac: "",
      tabList: null,
      tabSwitched: false,
      tabdata: [
        {
          tablabel: this.$store.state.settings.voipaccounts.tabbarlbl[0],
          isvisable: true,
          isactive: true,
          isvalid: true,
        },
        {
          tablabel: this.$store.state.settings.voipaccounts.tabbarlbl[1],
          isvisable: true,
          isactive: false,
          isvalid: true,
        },
      ],
    };
  },
  directives: {
    Validate: ValidateDir,
    charcount: CharCount,
    copytoclipboard: CopyToClipboard,
  },
  computed: {
    picked: {
      get: function () {
        return this.data.Activation;
      },
      set: function (newVal) {
        this.data.Activation = newVal;
      },
    },
    setValidation(type) {
      return (type) => {
        return this.tabdata[0].isactive ? type : type + "_skip";
      };
    },
    validationStatus() {
      return this.tabSwitched ? "partial" : "form";
    },
  },
  methods: {
    setsettings(saveobj) {
      this.$emit("setsettings", saveobj);
    },
    setDepartmentId(dId) {
      this.$emit("setdepartmentid", dId);
    },
    handleWebRTCMac() {
      this.data.MACAddress = this.iswebrtc ? "WEBRTC" : "";
      if (this.iswebrtc) this.$refs.macField.querySelector("[data-name='validMessage']").style.display = "none";
    },
    checkNrExistsAlready(evt) {
      //also check if the length is valid
      let _val = evt.target.value;
      if (this.detailstatus == "new" && _val.length != this.data.PBXNumberLength) {
        //isEmail is used to initiate false validation, so false is intended because the length is incorrect
        this.intNrRule = "isEmail";
        this.intNrMsg = this.$store.state.settings.voipaccounts.validateintnrempty;
      } else if (this.detailstatus == "new" && this.nrlist.indexOf(_val) != -1) {
        //isEmail is used to initiate false validation, so false is intended because nr already exists
        this.intNrRule = "isEmail";
        this.intNrMsg = this.$store.state.settings.voipaccounts.validateintnrexists;
      } else if (this.defaultstatus == "new" && _val.length == 0) {
        this.intNrRule = "isNotEmpty";
        this.intNrMsg = this.$store.state.settings.voipaccounts.validateintnrempty;
      } else {
        this.intNrRule = "isNotEmpty";
        this.intNrMsg = this.$store.state.settings.voipaccounts.validateintnrempty;
      }
    },
    checkMac(evt) {
      let _val = evt.target.value;
      if (this.detailstatus == "new" && _val.length > 0 && !this.iswebrtc) {
        this.macRule = "isMacAddress";
      } else if (this.detailstatus == "edit" && (this.savedMac === "WEBRTC" || this.savedMac === "")) {
        this.macRule = "isMacAddress";
      } else {
        this.macRule = "isAll";
      }
    },
    saveDetail() {
      if (this.submitAction == "save") {
        this.$emit("save", this.data);
      } else {
        this.$emit("save", this.data, "next");
      }
    },
    deleteDetail() {
      this.$emit("delete", this.data);
    },
    closeDetail() {
      this.$emit("setdetailstatus", "list");
    },
    setSubmitAction(newVal) {
      this.submitAction = newVal;
    },
    controleInputMac(evt, prop) {
      if (evt.target.disabled == false) {
        this.data[prop] = Mask.isMacAddressMask(evt);
      }
    },
    //==========================================VIEW HELPER FUNCTIONS
    showActive(clickedTabIndex) {
      let _activeTabIndex = this.tabdata.findIndex((tab) => tab.isactive);
      if (clickedTabIndex != _activeTabIndex) {
        this.tabdata[_activeTabIndex].isactive = false;
        this.tabdata[clickedTabIndex].isactive = true;
      }
    },
    activeIcon(onlineStatus, activeStatus) {
      if (onlineStatus && activeStatus) return "detailscreen__title-connect-icon";
      else return "detailscreen__title-disconnect-icon";
    },
    formatDateTime(datetime) {
      return this.$store.state.settings.voipaccounts.formonlineprefix + " " + convertISOToDateTime(datetime, this.$store.state.browserLanguage);
    },
    displayHelp() {
      this.showHelp = !this.showHelp;
    },
    shakeIt() {
      let _elm = document.querySelector("#detailscreen");
      _elm.classList.add("detailscreen--shake");
      setTimeout(() => {
        _elm.classList.remove("detailscreen--shake");
      }, 1000);

      let _notValidTabs = [];

      [].forEach.call(this.$refs["tabContent"], (tab, index) => {
        let _errorFields = tab.querySelectorAll('[data-name="validMessage"]');

        [].forEach.call(_errorFields, (errorfield) => {
          if (errorfield.style.display !== "none" && index != this.tabdata.findIndex((tab) => tab.active)) _notValidTabs.push(index);
        });
      });
      this.tabdata.forEach((tab, index) => (tab.isvalid = _notValidTabs.indexOf(index) == -1));
    },
    toggleModal() {
      this.statusVoipModal = !this.statusVoipModal;
    },
    splitSipAddress() {
      let _SIP = this.data.SIPAddress.substring(4, this.data.SIPAddress.length).split("@");
      this.sipAcount = _SIP[0];
      this.sipDomain = _SIP[1];
    },
  },
  mounted() {
    this.intNrMsg = this.$store.state.settings.voipaccounts.validateintnrempty;
    if (this.data.LastRegistration == null) this.niceDateTime = this.$store.state.settings.voipaccounts.formonlineprefix + " -";
    else this.niceDateTime = this.formatDateTime(this.data.LastRegistration);

    if (this.data.SIPAddress !== null) this.splitSipAddress();

    this.savedMac = this.data.MACAddress;
  },
};
</script>
