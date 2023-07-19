<template>
  <div :class="['detailscreen-wrapper', { 'detailscreen-wrapper--visable': visibility }]" data-e2e="cost-center-view">
    <div v-if="itemData != null" class="detailscreen" ref="detailscreen">
      <!-- <a :class="['button-help', { 'button-help--active': showHelp }]" @click="displayHelp">?</a> -->
      <div class="grid-row">
        <div class="grid-unit--alpha detailscreen-wrapper__title">
          <span class="detailscreen__title">{{ header }}</span>
        </div>
      </div>
      <form @valid="saveItem()" @notvalid="shakeIt()" v-validate="{ submitBtns: 'js-submitbtn' }">
        <div class="grid-row">
          <div class="grid-unit--beta">
            <div class="form-textfield form-textfield--bground">
              <input type="text" name="itemName" id="itemName" v-model="itemData.Name" :placeholder="$store.state.settings.costcenter.nameplaceholder" data-validate="isNotEmpty" :data-message="$store.state.settings.costcenter.validatename" />
              <label for="itemName" class="form-label form-label--hidden">{{ $store.state.settings.costcenter.namelbl }}</label>
              <div :class="['typo-helptext', { 'typo-helptext--active': showHelp }]">{{ $store.state.settings.costcenter.helptextname }}</div>
            </div>
          </div>
          <div class="grid-unit--beta">
            <div class="form-textfield form-textfield--bground">
              <!-- <input type="text" name="itemDescription" id="itemDescription" readonly v-model="itemData.Name" :placeholder="$store.state.settings.costcenter.nameplaceholder" data-validate="isNotEmpty" :data-message="$store.state.settings.costcenter.validatedescription"> -->
              <input type="text" name="itemDescription" id="itemDescription" readonly v-model="itemData.Name" :placeholder="$store.state.settings.costcenter.nameplaceholder" />
              <label for="itemDescription" class="form-label form-label--hidden">{{ $store.state.settings.costcenter.descriptionlbl }}</label>
              <div :class="['typo-helptext', { 'typo-helptext--active': showHelp }]">{{ $store.state.settings.costcenter.helptextdescription }}</div>
            </div>
          </div>
        </div>
      </form>
      <!-- BUTTONS -->
      <div class="detailscreen-footer detailscreen-footer--inside">
        <div class="grid-unit--alpha">
          <!--
          <span>
            <a class="button-primary button-primary--delete" @click="deleteItem()">{{ $store.state.settings.costcenter.deletelbl }}</a>
          </span>
          -->
          <span class="grid--push">
            <a class="button-primary button-primary--gray" @click="closeItem()">{{ $store.state.settings.costcenter.cancellbl }}</a>
            <a class="button-primary js-submitbtn" :disabled="readonly">{{ $store.state.settings.costcenter.savelbl }}</a>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { ValidateDir } from "./../../directives/validate";

export default {
  name: "CostCenterView",
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
  directives: {
    Validate: ValidateDir,
  },
  data() {
    return {
      numberList: [],
      itemData: this.data,
      header: "",
      showHelp: false,
      readonly: true,
    };
  },
  inject: ["showLoader"],
  watch: {
    $route(to, from) {
      this.showLoader(false);
    },
    visibility: function (newStatus, oldStatus) {
      if (oldStatus !== newStatus && newStatus) {
        this.itemData = { ...this.data };
        this.header = this.itemData.Id !== -1 ? this.$store.state.settings.costcenter.headeredit : this.$store.state.settings.costcenter.headernew;
      }
    },
  },
  methods: {
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
    saveItem() {
      this.showHelp = false;
      this.$emit("save", this.itemData);
    },
    deleteItem() {
      this.showHelp = false;
      this.$emit("delete", this.itemData.Id);
    },
    closeItem() {
      this.showHelp = false;
      this.$emit("cancel");
    },
  },
  mounted() {
    this.showLoader(false);
  },
};
</script>
