<template>
  <div :class="['detailscreen-wrapper', { 'detailscreen-wrapper--visable': visibility }]" data-e2e="ip-whitelist-view">
    <div v-if="itemData != null" class="detailscreen" ref="detailscreen">
      <a :class="['button-help', { 'button-help--active': showHelp }]" @click="displayHelp">?</a>
      <div class="grid-row">
        <div class="grid-unit--alpha detailscreen-wrapper__title">
          <span class="detailscreen__title">{{ header }}</span>
        </div>
      </div>
      <form @valid="saveItem()" @notvalid="shakeIt()" v-validate="{ submitBtns: 'js-submitbtn' }">
        <div class="grid-row">
          <div class="grid-unit--beta">
            <div class="form-textfield form-textfield--bground">
              <IPfield :ipaddress="itemData.StartAdres" :tabindex="0" :setfocus="focusFirst" @ipchange="updateStartIp" @ready="gotoNextField" />
              <label for="startip" class="form-label form-label--hidden">{{ $store.state.settings["ip-whitelist"].startiplbl }}</label>
              <div :class="['typo-helptext', { 'typo-helptext--active': showHelp }]">{{ $store.state.settings["ip-whitelist"].helptextstartip }}</div>
            </div>
          </div>
          <div class="grid-unit--beta">
            <div class="form-textfield form-textfield--bground">
              <IPfield :ipaddress="itemData.EindAdres" :tabindex="5" :setfocus="focusSecond" @ipchange="updateEndIp" @lastready="unlocSave" />
              <label for="endip" class="form-label form-label--hidden">{{ $store.state.settings["ip-whitelist"].endiplbl }}</label>
              <div :class="['typo-helptext', { 'typo-helptext--active': showHelp }]">{{ $store.state.settings["ip-whitelist"].helptextendip }}</div>
            </div>
          </div>
          <div class="grid-row">
            <div class="grid-unit--alpha">
              <div class="form-textfield form-textfield--bground">
                <input type="text" name="itemDescription" id="itemDescription" v-model="itemData.Description" :placeholder="$store.state.settings['ip-whitelist'].descriptionplaceholder" />
                <label for="itemDescription" class="form-label form-label--hidden">{{ $store.state.settings["ip-whitelist"].descriptionlbl }}</label>
                <div :class="['typo-helptext', { 'typo-helptext--active': showHelp }]">{{ $store.state.settings["ip-whitelist"].helptextdescription }}</div>
              </div>
            </div>
          </div>
        </div>
      </form>
      <!-- BUTTONS -->
      <div class="detailscreen-footer detailscreen-footer--inside">
        <div class="grid-unit--alpha">
          <span>
            <a class="button-primary button-primary--delete" @click="deleteItem()">{{ $store.state.settings["ip-whitelist"].deletelbl }}</a>
          </span>
          <span class="grid--push">
            <a class="button-primary button-primary--gray" @click="closeItem()">{{ $store.state.settings["ip-whitelist"].cancellbl }}</a>
            <a :class="['button-primary js-submitbtn', { 'button-primary--disabled': !canSave }]">{{ $store.state.settings["ip-whitelist"].savelbl }}</a>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { ValidateDir } from "./../../directives/validate";
import IPfield from "./../uielements/IPfield.vue";

export default {
  name: "IPWhitelistView",
  props: {
    visibility: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: null,
    },
  },
  components: {
    IPfield,
  },
  directives: {
    Validate: ValidateDir,
  },
  data() {
    return {
      numberList: [],
      itemData: this.data,
      header: "",
      showHelp: false,
      focusFirst: false,
      focusSecond: false,
      canSave: false,
    };
  },
  inject: ["showLoader"],
  watch: {
    $route(to, from) {
      this.showLoader(false);
    },
    visibility: function (newStatus, oldStatus) {
      if (oldStatus !== newStatus && newStatus) {
        this.itemData = JSON.parse(JSON.stringify(this.data));
        this.focusFirst = true;
        this.header = this.itemData.Id !== -1 ? this.$store.state.settings["ip-whitelist"].headeredit : this.$store.state.settings["ip-whitelist"].headernew;
      } else {
        this.resetDetail();
      }
    },
  },
  methods: {
    unlocSave() {
      this.canSave = true;
    },
    gotoNextField() {
      this.focusFirst = false;
      this.focusSecond = true;
    },
    updateStartIp(ip) {
      this.itemData.StartAdres = ip;
    },
    updateEndIp(ip) {
      this.itemData.EindAdres = ip;
    },
    displayHelp() {
      this.showHelp = !this.showHelp;
    },
    shakeIt() {
      let _elm = this.$refs.detailscreen;
      _elm.classList.add("detailscreen--shake");
      setTimeout(() => {
        _elm.classList.remove("detailscreen--shake");
      }, 1000);
    },
    resetDetail() {
      this.showHelp = false;
      this.focusFirst = false;
      this.focusSecond = false;
      this.canSave = false;
    },
    saveItem() {
      this.resetDetail();
      this.$emit("save", this.itemData);
    },
    deleteItem() {
      this.resetDetail();
      this.$emit("delete", this.itemData);
    },
    closeItem() {
      this.resetDetail();
      this.$emit("cancel");
    },
  },
  mounted() {
    this.showLoader(false);
  },
};
</script>
