<template>
    <div data-e2e="voip-account-settings">
        <div class="grid-row">
            <div class="grid-unit--beta">
                <div class="typo-input-label typo-input-label--select-search-fly-out">{{ $store.state.settings.voipaccounts.formselectidentity }}</div>
                <SelectSearchFlyOut :options="identitylist" :selectedvalue="selectedIdentity" :defaultlabel="$store.state.settings.voipaccounts.formselectchoose" labelproperty="Label" valueproperty="Number" @changed="setOutboundIdentity" />
                <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.voipaccounts.helptextidentity }}</div>
            </div>
            <div class="grid-unit--beta">
                <div class="typo-input-label typo-input-label--select-search-fly-out">{{ $store.state.settings.voipaccounts.formselectdepartment }}</div>
                <SelectSearchFlyOut
                :options="departmentlist"
                :selectedvalue="departmentid == -1 ? null : departmentid"
                :defaultlabel="$store.state.settings.voipaccounts.formselectchoosedepartment"
                labelproperty="Title"
                valueproperty="Id"
                @changed="setDepartment"
                />
                <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.voipaccounts.helptextdepartment }}</div>
            </div>
        </div>
        <div class="grid-row">
            <div class="grid-unit--beta form-textfield__form-togglefield">
                <div class="form-textfield form-textfield--bground">
                    <input type="text" name="voip_voicemailaddress" :value="$store.state.settings.pbxsettings.dndlbl" readonly />
                    <label for="voip_voicemailaddress" class="form-label form-label--hidden"></label>
                </div>
                <div class="form-togglefield">
                    <input type="checkbox" name="voip_toggle_dnd" id="voip_toggle_dnd" v-model="saveObj.DND" @change="emitChangedSettings" />
                    <label for="voip_toggle_dnd"></label>
                </div>
                <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.voipaccounts.helptextdnd }}</div>
            </div>
            <div class="grid-unit--beta form-textfield__form-togglefield">
                <div :class="['form-textfield', 'form-textfield--bground', { 'form-textfield--text-grey': saveObj.Voicemail }]">
                    <input type="text" name="voip_voicemailaddress" v-model="saveObj.VMEmailAddress" @change="emitChangedSettings" :placeholder="$store.state.settings.pbxsettings.placeholdervoicemaillbl" :readonly="saveObj.Voicemail" />
                    <label for="voip_voicemailaddress" class="form-label form-label--hidden">{{ $store.state.settings.pbxsettings.voicemaillbl }}</label>
                </div>
                <div class="form-togglefield">
                    <input type="checkbox" name="voip_toggle_vm" id="voip_toggle_vm" v-model="saveObj.Voicemail" @change="emitChangedSettings" />
                    <label for="voip_toggle_vm"></label>
                </div>
                <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.voipaccounts.helptextvoicemail }}</div>
            </div>
        </div>
        <div class="grid-row">
            <div class="grid-unit--beta form-textfield__form-togglefield">
                <div :class="['form-textfield', 'form-textfield--bground', { 'form-textfield--text-grey': saveObj.FollowMeOn }]">
                    <input type="text" name="voip_callforwarding" v-model="saveObj.FollowMe" @change="emitChangedSettings" :placeholder="$store.state.settings.pbxsettings.placeholderforwardinglbl" :readonly="saveObj.FollowMeOn" />
                    <label for="voip_callforwarding" class="form-label form-label--hidden">{{ $store.state.settings.pbxsettings.forwarding }}</label>
                </div>
                <div class="form-togglefield">
                    <input type="checkbox" name="voip_toggle_fm" id="voip_toggle_fm" v-model="saveObj.FollowMeOn" @change="emitChangedSettings" />
                    <label for="voip_toggle_fm"></label>
                </div>
                <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.voipaccounts.helptextfollowmeon }}</div>
            </div>
            <div class="grid-unit--beta form-textfield__form-togglefield">
                <div :class="['form-textfield', 'form-textfield--bground', { 'form-textfield--text-grey': saveObj.NoAnswerOn }]">
                    <input type="text" name="voip_noanswernumber" v-model="saveObj.NoAnswerNumber" @change="emitChangedSettings" :placeholder="$store.state.settings.pbxsettings.placeholdernoanswerlbl" :readonly="saveObj.NoAnswerOn" />
                    <label for="voip_noanswernumber" class="form-label form-label--hidden">{{ $store.state.settings.pbxsettings.noanswerlbl }}</label>
                </div>
                <div class="form-togglefield">
                    <input type="checkbox" name="voip_toggle_nao" id="voip_toggle_nao" v-model="saveObj.NoAnswerOn" @change="emitChangedSettings" />
                    <label for="voip_toggle_nao"></label>
                </div>
                <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.voipaccounts.helptextnoansweron }}</div>
            </div>
        </div>
    </div>
</template>

<script>

import SelectSearchFlyOut from "./../uielements/SelectSearchFlyOut.vue";

export default {
  name: "VoipAccountSettings",
  props: ["showhelp", "isactive", "identitylist", "departmentlist", "departmentid", "datasettings"],
  components: {
    SelectSearchFlyOut,
  },
  data: () => {
    return {
      selectedIdentity: null,
      saveObj: {
        DND: false,
        VMEmailAddress: "",
        Voicemail: false,
        FollowMe: "",
        FollowMeOn: false,
        Overflow: "",
        OverflowOn: false,
        NoAnswerNumber: "",
        NoAnswerOn: false,
      },
    };
  },
  watch: {
    datasettings: function (newVal, oldVal) {
      if (Object.keys(newVal).length > 0) {
        this.saveObj = JSON.parse(JSON.stringify(newVal));
        this.selectedIdentity = this.saveObj.OutboundIdentity.length > 0 ? this.saveObj.OutboundIdentity : null;
        this.emitChangedSettings();
      }
    },
  },
  computed: {
    setValidation() {
      return (type) => {
        return this.isactive ? type : type + "_skip";
      };
    },
  },
  methods: {
    emitChangedSettings() {
      this.$emit("setsettings", this.saveObj);
    },
    setOutboundIdentity(newVal) {
      this.saveObj.OutboundIdentity = newVal && newVal !== "null" ? newVal : "";
      this.emitChangedSettings();
    },
    setDepartment(newVal) {
      let _changedDepartmentId = newVal && newVal !== "null" ? newVal : -1;
      this.$emit("changeddepartmentid", _changedDepartmentId);
    },
  }
};
</script>

<style lang="scss">
</style>
