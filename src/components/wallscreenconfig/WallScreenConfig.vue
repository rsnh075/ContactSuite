<template>
  <div :class="['detailscreen-wrapper', {'detailscreen-wrapper--visable' : status}]" data-e2e="wall-screen-config">
      <div class="detailscreen detailscreen--stretch" ref="detailscreen">
        <!-- <a :class="['button-help', {'button-help--active' : showHelp}]" @click.stop.prevent="displayHelp">?</a> -->
        <form @valid="saveScreenConfig()" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn'}">
          <div class="grid-row">
            <div class="grid-unit--70">
              <span class="wallscreen__title">{{ $store.state.settings.wallscreen.mainheader }}</span>
              <div class="grid-row">
                <div class="grid-unit--beta">
                  <div class="form-textfield form-textfield--bground">
                    <input type="text" name="screen-name" id="screen-name" :placeholder="$store.state.settings.wallscreen.namelabel" v-model="screenData.Name" data-validate="isNotEmpty" :data-message="$store.state.settings.wallscreen.validationtxtname">
                    <label for="screen-name" class="form-label form-label--hidden">{{ $store.state.settings.wallscreen.namelabel }}</label>
                    <!-- <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.wallscreen.namehelp }}</div> -->
                  </div>
                </div>
                <div class="grid-unit--beta">
                  <div class="form-textfield form-textfield--bground">
                    <input type="text" name="screen-description" id="screen-description" :placeholder="$store.state.settings.wallscreen.descriptionlabel" v-model="screenData.Description" data-validate="isNotEmpty" :data-message="$store.state.settings.wallscreen.validationtxtdescription">
                    <label for="screen-description" class="form-label form-label--hidden">{{ $store.state.settings.wallscreen.descriptionlabel }}</label>
                    <!-- <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.wallscreen.descriptionhelp }}</div> -->
                  </div>
                </div> 
              </div> 
              <div class="grid-row">
                <DashboardConfigurator
                  :bgcolor="screenData.BackgroundColor"
                  :logo="screenData.ImageByteStream"
                  :selectedSubscription="screenData.Subscription"
                  :selectedRGs="screenData.Routinggroups"
                  :selectedDataPoints="screenData.DataPoints"
                  :selectedTotalDataPoints="screenData.TotalDataPoints"
                  @colorisset="setColor"
                  @resetbrand="resetBranding"
                  @logoisset="setLogo"
                  @addSelectedRG="addSelectedRG"
                  @removeSelectedRG="removeSelectedRG"
                  @addSelectedDataPoint="addSelectedDataPoint"
                  @removeSelectedDataPoint="removeSelectedDataPoint"
                  @addSelectedTotalDataPoint="addSelectedTotalDataPoint"
                  @removeSelectedTotalDataPoint="removeSelectedTotalDataPoint"
                />
              </div>
            </div>
            <div class="grid-unit--30">
              <DeviceList
                :selectedDevices="screenData.Devices"
                :disabledDevices="disabledDevices"
                @addSelectedDevice="addSelectedDevice"
                @removeSelectedDevice="removeSelectedDevice"
              />
            </div>  
          </div>
          <div class="grid-row">
            <div class="grid-unit--alpha">
              <span>
                <a class="button-primary button-primary--delete" @click="deleteScreenConfig()">{{ $store.state.settings.devices.deletebtnlbl }}</a>
              </span>
              <span class="grid--push">
                <a class="button-primary button-primary--gray" @click="cancelScreenConfig()">{{ $store.state.settings.devices.closebtnlbl }}</a>
                <a class="button-primary js-submitbtn">{{ $store.state.settings.devices.savebtnlbl }}</a>
              </span>
            </div>  
          </div>
        </form>  
      </div>
  </div>
</template>

<script>

import DashboardConfigurator    from './DashboardConfigurator.vue';
import DeviceList               from './DeviceList.vue';
import { ValidateDir }          from './../../directives/validate';

export default {
    name: "WallScreenConfig",
    props: ['status', 'screendata', 'disabledDevices'],
     data: () => {
      return {
        showHelp                 : false,
        screenData               : {
          Name                   : '',
          Description            : '',
          BackgroundColor        : '',
          ImageByteStream        : '',
          Subscription           : 'routinggroupinfo',
          Devices                : [],
          Routinggroups          : [],
          DataPoints             : [],
          TotalDataPoints        : []
        },
      }
    },
    inject: ["showLoader"],
    watch: {
      'status': function(newVal, oldVal) {
        this.screenData = {...this.screendata};
      },
    },
    components: {
      DashboardConfigurator,
      DeviceList,
    },
    directives: {
      Validate: ValidateDir
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
      setColor(bgcolor) {
        this.screenData.BackgroundColor = bgcolor;
      },
      setLogo(byteStr) {
        this.screenData.ImageByteStream = byteStr;
      },
      resetBranding() {
        this.screenData.BackgroundColor = '';
        this.screenData.ImageByteStream = '';
      },
      deleteScreenConfig() {
        this.$emit('deleteConfig', this.screenData);
      },
      cancelScreenConfig() {
        this.$emit('cancelConfig');
      },
      saveScreenConfig() {
        this.$emit('saveConfig', this.screenData);
      },
      addSelectedDevice(selectedDevice) {
        this.screenData.Devices.push(selectedDevice);
      },
      removeSelectedDevice(selectedDeviceId) {
        let _index = this.screenData.Devices.findIndex(el => el.DeviceId == selectedDeviceId);
        this.screenData.Devices.splice(_index, 1);
      },
      addSelectedRG(selectedRG) {
        this.screenData.Routinggroups.push(selectedRG);
      },
      removeSelectedRG(selectedRGId) {
        let _index = this.screenData.Routinggroups.findIndex(el => el.Id == selectedRGId);
        this.screenData.Routinggroups.splice(_index, 1);
      },
      addSelectedDataPoint(selectedDataPoint) {
        this.screenData.DataPoints.push(selectedDataPoint);
      },
      removeSelectedDataPoint(selectedDataPointName) {
        let _index = this.screenData.DataPoints.findIndex(el => el.name == selectedDataPointName);
        this.screenData.DataPoints.splice(_index, 1);
      },
      addSelectedTotalDataPoint(selectedTotalDataPoint) {
        this.screenData.TotalDataPoints.push(selectedTotalDataPoint);
      },
      removeSelectedTotalDataPoint(selectedTotalDataPointName) {
        let _index = this.screenData.TotalDataPoints.findIndex(el => el.name == selectedTotalDataPointName);
        this.screenData.TotalDataPoints.splice(_index, 1);
      }
    },
    mounted() {
      this.showLoader(false);
    },
  }
</script>

<style lang="scss" scoped>
  @use "@/scss/includes/functions";
  @use "@/scss/includes/globals";

  .wallscreen__title {
    display: block;
    height: 35px;
    line-height: 35px;
    color: globals.$color-gray40;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-family: 'Open Sans SemiBold', sans-serif;
    font-size: 1.2rem;
    border-bottom: 1px solid globals.$color-gray20;
    margin-bottom: 10px;
  }

  div#wallscreenconfig {
    padding: 1px 6px 1px 10px;
    margin: 8px;
  }

</style>