<template>
  <div :style="`background-color:${selectedColor}`" class="dataset-wrapper" id="wallscreenconfig" data-e2e="dashboard-configurator">
    <div class="dataset__row-top--branding">
      <!-- IMAGE PLAGEHOLDER -->
      <img v-if="logoByteString != ''" :src="logoByteString" ref="brandLogo" class="branding-logo">
      <div :class="['dataset__branding-menu', {'dataset__branding-menu--open' : brandingMenuOpen}]">
        <!-- EDIT -->
        <div class="button__wrapper">
          <a v-if="!brandingMenuOpen" class="button__button" @click="toggleBrandMenu()">&#xF3EB;</a>
          <a v-else class="button__button" @click="toggleBrandMenu()">&#xF156;</a>
        </div>  
        <!-- DELETE -->
        <div class="button__wrapper">
          <a class="button__button" @click="resetBrand()">&#xF1C0;</a>
        </div>  
        <!-- LOGO -->
        <ImageLoader
          :destSize="logoSizeStr" 
          :backgroundcolor="selectedColor"
          :imagestr="logoByteString"  
          @saveimage="saveBiteString"
        />
        <!-- COLOR -->
        <ColorPicker 
          :defaultcolors="defaultColors" 
          :selectedcolor="selectedColor"
          size="small"
          @select="setColor"
        />
      </div>
    </div>
        <!-- ROUTINGGROUPS -->
    <div class="grid-row">
      <ol class="dataset__row-one-line-list">
        <li class="dataset__row-top--routinggroups--empty">
          <div class="dataset__cell">
            <span class="dataset__cell-label"></span>
            <span class="dataset__icon-remove"></span>
          </div>
        </li>
        <li v-for="routinggroup in selectedRGs" :key="'RG1_' + routinggroup.Id" :class="['dataset__row-top--routinggroups', {'dataset__row-top--routinggroups--hidden' : !routinggroup.selected}]" :data-rgid="routinggroup.Id">
          <div class="dataset__cell">
            <span class="dataset__cell-label">{{ routinggroup.Titel }}</span>
            <span class="dataset__icon-remove" @click="removeSelectedRG(routinggroup.Id)">&#xF156;</span> 
          </div>
        </li>
        <li v-if="availableRGSlots.length > 0" class="dataset__row-top--routinggroups dataset__row-top--add-routinggroup">
          <div class="dataset__cell">
            <span class="dataset__cell-label">{{ availableRGSlots[0] }}</span>
            <AddMultiSelectSearchFlyOut
              :selectBoxConfig="flyOutRGConfig"
              :list="routingGroupList"
              @addSelected="addSelectedRG"
            />
          </div>
        </li>
        <li v-for="(availableRGslot, index) in availableRGSlots" class="dataset__row-top--routinggroups dataset__row-top--add-routinggroup--disabled" v-show="index != 0">
          <div class="dataset__cell">
            <span class="dataset__cell-label">{{ availableRGslot }}</span>
            <span class="dataset__cell-button">&#xF419;</span>
          </div>
        </li>
      </ol>
    </div>
    <!-- DATAPOINTS -->
    <div class="grid-row">
      <ol class="dataset__row-multi-line-list">
        <li v-for="datapoint in selectedDataPoints" :class="['dataset__row-middle', 'dataset__row-middle--datapoints', {'dataset__row-middle--datapoints--hidden' : !datapoint.selected}]">
          <div class="dataset__cell">
            <span class="dataset__cell-label">{{ datapoint.label }}</span>
            <span class="dataset__icon-remove" @click="removeSelectedDataPoint(datapoint.name)">&#xF156;</span>
          </div>
          <div class="dataset__cell dataset__cell-empty" v-if="countSelectedRGs >= 1"><div class="dataset__cell-label">{{ datapoint.unit }}</div></div>
          <div class="dataset__cell dataset__cell-empty" v-if="countSelectedRGs >= 2"><div class="dataset__cell-label">{{ datapoint.unit }}</div></div>
          <div class="dataset__cell dataset__cell-empty" v-if="countSelectedRGs >= 3"><div class="dataset__cell-label">{{ datapoint.unit }}</div></div>
        </li>
        <li v-if="availableDPSlots.length > 0" class="dataset__row-middle--datapoints dataset__row-middle--add-datapoint">
          <div class="dataset__cell">
            <span class="dataset__cell-label">{{ availableDPSlots[0] }}</span>
            <AddMultiSelectSearchFlyOut
              :selectBoxConfig="flyOutDPConfig"
              :list="dataPointList"
              @addSelected="addSelectedDataPoint"
            />
          </div>
        </li>
        <li v-for="(availableDPSlot, index) in availableDPSlots" class="dataset__row-middle--datapoints dataset__row-middle--add-datapoint--disabled" v-show="index != 0">
          <div class="dataset__cell">
            <span class="dataset__cell-label">{{ availableDPSlot }}</span>
            <span class="dataset__cell-button">&#xF419;</span>
          </div>
        </li>
      </ol>
    </div>
    <div class="grid-row">
      <h2 :class="['detailscreen__fieldsetheader', 'detailscreen__fieldsetheader--nomarginleftright', {'detailscreen__fieldsetheader--invertedcolor' : colorIsInverted}]">{{ $store.state.settings.wallscreen.headertotals }}</h2>
    </div>
    <!-- TOTALDATAPOINTS -->
    <div class="grid-row">
      <ol class="dataset__row-multi-line-list dataset__row-multi-line-list--totaldatapoints">
        <li v-for="totaldatapoint in selectedTotalDataPoints" :class="['dataset__row-middle', 'dataset__row-middle--totaldatapoints', {'dataset__row-middle--totaldatapoints--hidden' : !totaldatapoint.selected}]">
          <div class="dataset__cell">
            <span class="dataset__cell-label">{{ totaldatapoint.label }}</span>
            <span class="dataset__icon-remove" @click="removeSelectedTotalDataPoint(totaldatapoint.name)">&#xF156;</span>
          </div>
        </li>
        <li v-if="availableTDPSlots.length > 0" class="dataset__row-middle--datapoints dataset__row-middle--add-totaldatapoint">
          <div class="dataset__cell">
            <span class="dataset__cell-label">{{ availableTDPSlots[0] }}</span>
            <AddMultiSelectSearchFlyOut
              :selectBoxConfig="flyOutTDPConfig"
              :list="totalDataPointList"
              @addSelected="addSelectedTotalDataPoint"
            />
          </div>
        </li>
        <li v-for="(availableTDPSlot, index) in availableTDPSlots" class="dataset__row-middle--datapoints dataset__row-middle--add-totaldatapoint--disabled" v-show="index != 0">
          <div class="dataset__cell">
            <span class="dataset__cell-label">{{ availableTDPSlot }}</span>
            <span class="dataset__cell-button">&#xF419;</span>
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>

<script>
  import ColorPicker                   from './../uielements/ColorPicker.vue';
  import ImageLoader                   from './../uielements/ImageLoader.vue';
  import AddMultiSelectSearchFlyOut    from './../uielements/AddMultiSelectSearchFlyOut.vue';
  import { SUBSCRIPTION_LABELS }       from './subscriptionlabels'
  import { dynamicSort }               from '../../use/sortFunctions';
  import { getLuminance, hexToRgb }    from './../../use/helperFunctions';
import { IPCCCConfigurator } from '../../ipccc/js/configurator';

  export default {
    name : 'DashboardConfigurator',
    props : ['bgcolor', 'logo', 'selectedSubscription', 'selectedRGs', 'selectedDataPoints', 'selectedTotalDataPoints'],
    data: () => {
      return {
        storeWatch                    : null,
        defaultColors                 : ['#018DE2', '#2ECC71', '#F4D03F', '#E74C3C', '#AAB7B8', '#B7950B', '#6C3483', '#1F618D', '#D7BDE2', '#F5CBA7', '#EAFAF1', '#FFFFFF', '#000000', '#CC0000'],
        selectedColor                 : '#FFFFFF',
        logoSizeStr                   : '360x110',
        logoByteString                : '',
        brandingMenuOpen              : false,
        routingGroupList              : [],
        dataPointList                 : [],
        totalDataPointList            : [],
        countSelectedRGs              : 0,
        countSelectedDPs              : 0,
        countSelectedTDPs             : 0,
        flyOutRGConfig                : {
          filterProperty              : 'Titel',
          title                       : '',
        },
        flyOutDPConfig                : {
          filterProperty              : 'label',
          title                       : '',
        },
        flyOutTDPConfig : {
          filterProperty              : 'label',
          title                       : '',
        },
        maxSelectedRGs                : 3,
        maxSelectedDataPoints         : 5,
        maxSelectedTotalDPs           : 6,
        colorIsInverted               : false,
        availableRGSlots              : [],
        availableDPSlots              : [],
        availableTDPSlots             : [],
      }
    },
    inject: ["showLoader"],
    components: {
      ColorPicker,
      ImageLoader,
      AddMultiSelectSearchFlyOut
    },
    watch: {
      'bgcolor' : function(newVal, oldVal) {
        this.selectedColor = this.bgcolor;
        this.textColorCheck(this.selectedColor);
      },
      'logo' : function(newVal, oldVal) {
        this.logoByteString = this.logo;
      },
      'selectedRGs.length' : function(newVal, oldVal) {
        this.onSelectedRGsChanged();
      },
      'selectedRGs' : function(newVal, oldVal) {
        this.onSelectedRGsChanged();
      },
      'selectedDataPoints.length' : function() {
        this.onSelectedDataPointsChanged();
      },
      'selectedDataPoints' : function(newVal, oldVal) {
        this.onSelectedDataPointsChanged();
      },
      'selectedTotalDataPoints.length' : function(newVal, oldVal) {
        this.onSelectedTotalDataPointsChanged();
      },
      'selectedTotalDataPoints' : function(newVal, oldVal) {
        this.onSelectedTotalDataPointsChanged();
      }
    },
    methods: {
      //------------START BRANDING------------//
      onSelectedRGsChanged() {
        this.routingGroupList.forEach((rg, index) => {
          let _selectedIndex = this.selectedRGs.findIndex(selectedRG => rg.Id == selectedRG.Id);
          if(_selectedIndex == -1)
            this.routingGroupList[index].selected = false;
          else
            this.routingGroupList[index].selected = true;
        });
        this.countSelectedRGs = this.selectedRGs.length;
        this.availableRGSlots = this.fillAvailableSlots(this.$store.state.settings.wallscreen.routinggroupslottxt, (this.maxSelectedRGs - this.countSelectedRGs));
      },
      onSelectedDataPointsChanged() {
        this.dataPointList.forEach((datapoint, index) => {
          let _selectedIndex = this.selectedDataPoints.findIndex(selectedDataPoint => datapoint.name == selectedDataPoint.name);
          if(_selectedIndex == -1)
            this.dataPointList[index].selected = false;
          else
            this.dataPointList[index].selected = true;
        });
        this.countSelectedDPs = this.selectedDataPoints.length;
        this.availableDPSlots = this.fillAvailableSlots(this.$store.state.settings.wallscreen.datapointslottxt, (this.maxSelectedDataPoints - this.countSelectedDPs));
      },
      onSelectedTotalDataPointsChanged() {
        this.totalDataPointList.forEach((totaldatapoint, index) => {
          let _selectedIndex = this.selectedTotalDataPoints.findIndex(selectedDataPoint => totaldatapoint.name == selectedDataPoint.name);
          if(_selectedIndex == -1)
            this.totalDataPointList[index].selected = false;
          else
            this.totalDataPointList[index].selected = true;
        });
        this.countSelectedTDPs = this.selectedTotalDataPoints.length;
        this.availableTDPSlots = this.fillAvailableSlots(this.$store.state.settings.wallscreen.totaldatapointslottxt, (this.maxSelectedTotalDPs - this.countSelectedTDPs));
      },
      toggleBrandMenu() {
        this.brandingMenuOpen = !this.brandingMenuOpen;
      },
      resetBrand() {
        this.selectedColor   = '#FFFFFF';
        this.colorIsInverted = false;
        this.logoByteString  = '';
        this.$emit('resetbrand');
      },
      setColor(color) {
        this.selectedColor = color;
        this.$emit('colorisset', color);
      },
      saveBiteString(imgStr) {
        this.logoByteString = imgStr;
        this.$emit('logoisset', imgStr);
      },
      textColorCheck(color) {
        let _rgb          = hexToRgb(color),
            _colorWheight = getLuminance(_rgb.r, _rgb.g, _rgb.b);
        
        if(_colorWheight > 0.65)
          this.colorIsInverted = false;
        else
          this.colorIsInverted = true;
      },
      //------------START ROUTINGGROUPS------------//
      hasAgentsRights() {
        return this.$store.getters.getPermission('BeheerGroepen');
      },
      hasDevicesRights() {
        return this.$store.getters.getPermission('BestemmingenToestellen');
      },
      getRoutingGroupList() {
         IPCCCConfigurator.Request(this.$store.getters.getCustomerInfo().selectedCustomerId, 'routinggroup', 'list', null, -1).then(
          response => {
            let _response;
            if(this.hasAgentsRights() && !this.hasDevicesRights()) {
              _response = response.filter(rg => rg.RoutinggroupType == 1);
            }
            if(this.hasDevicesRights() && !this.hasAgentsRights()) {
              _response = response.filter(rg => rg.RoutinggroupType == 2);
            }
            if(this.hasDevicesRights() && this.hasAgentsRights()) {
              _response = response;
            }
            if(!this.hasDevicesRights() && !this.hasAgentsRights()) {
              _response = [];
            }
            this.routingGroupList = _response;
            this.routingGroupList.forEach(rg => rg.selected = false);
            this.showLoader(false);
          }, error => {
            console.error(error);
            this.showLoader(false);
        }).catch(error => {
            console.log(error);
        });
      },
      addSelectedRG(item) {
        this.$emit('addSelectedRG', item);
      },
      removeSelectedRG(id) {
        this.$emit('removeSelectedRG', id);
      },
      fillAvailableSlots(value, len) {
        let arr = [];
        for (var i = 0; i < len; i++) {
          arr.push(value);
        }
        return arr;
      },
      //------------START DATAPOINTS------------//
      getDataPointList() {
        this.dataPointList = SUBSCRIPTION_LABELS[this.selectedSubscription].datapoints;
        this.dataPointList.forEach(datapoint => datapoint.selected = false);
        this.dataPointList.sort(dynamicSort('label'));
      },
      addSelectedDataPoint(item) {
        this.$emit('addSelectedDataPoint', item);
      },
      removeSelectedDataPoint(name) {
        this.$emit('removeSelectedDataPoint', name);
      },
      //------------START TOTALDATAPOINTS------------//
      getTotalDataPointList() {
        this.totalDataPointList = SUBSCRIPTION_LABELS[this.selectedSubscription].totaldatapoints;
        this.totalDataPointList.forEach(totaldatapoint => totaldatapoint.selected = false);
        this.totalDataPointList.sort(dynamicSort('label'));
      },
      addSelectedTotalDataPoint(item) {
        this.$emit('addSelectedTotalDataPoint', item);
      },
      removeSelectedTotalDataPoint(name) {
        this.$emit('removeSelectedTotalDataPoint', name);
      },
    },
    mounted() {
      this.showLoader(true);
      this.flyOutRGConfig.title  = this.$store.state.settings.wallscreen.headerselectboxrg;
      this.flyOutDPConfig.title  = this.$store.state.settings.wallscreen.headerselectboxdp;
      this.flyOutTDPConfig.title = this.$store.state.settings.wallscreen.headerselectboxtdp;

      if(this.$store.getters.getCustomerInfo().selectedCustomerId != -1)
        this.getRoutingGroupList();
        this.getDataPointList();
        this.getTotalDataPointList();
      
      this.storeWatch = this.$store.watch(this.$store.getters.getCustomerInfo, cObj => {
        this.getRoutingGroupList();
        this.getDataPointList();
        this.getTotalDataPointList();
      });
      
    },
    beforeUnmount() {
      this.storeWatch();
    }
  }
</script>

<style lang="scss">
  
  @use "@/scss/includes/functions";
  @use "@/scss/includes/globals";
  
  #wallscreenconfig {
    .dataset-wrapper {
      padding: 10px;
      margin: 1.2em .5em;
      min-height: 300px;
      box-shadow: 0 0 4px 0 rgba(0, 0, 0, .2);
    }

    .dataset__row-one-line-list {
      white-space: nowrap;
      overflow-x: hidden;
      margin-top: 14px;
      margin-bottom: 14px;
    }

    .dataset__row-multi-line-list {
      width: 100%;
      &--totaldatapoints {
        width: calc(100% + 10px);
      }
      .dataset__cell {
        float: left;
        width: 180px;
        margin-right: 14px;
        margin-bottom: 14px;
      }
      .dataset__cell-empty {
        width: calc((100% - 225px) / 3);
        &:nth-of-type(4) {
          margin-right: 0;
        }
      }
    }
    
    .dataset__row-top--branding {
      position: absolute;
      width: 180px;
      height: 56px;
      margin-top: 14px;
    }

    .dataset__row-top--routinggroups {
      float: left;
      width: calc((100% - 183px) / 3);
      padding-left: 14px;
      height: 56px;
      &--hidden {
        display: none;
      }
    }

    .dataset__row-top--routinggroups:not(.dataset__row-top--add-routinggroup):not(.dataset__row-top--add-routinggroup--disabled) {
      width: calc((100% - 186px) / 3);
    }
    // .dataset__row-middle--datapoints:not(.dataset__row-middle--add-datapoint):not(.dataset__row-middle--add-datapoint--disabled) .dataset__cell {
    //   width: calc((100% - 177px) / 3);
    // }

    .dataset__row-top--routinggroups--empty {
      float: left;
      width: 180px;
      vertical-align: middle;
      .dataset__cell {
        background-color: transparent;
        box-shadow: none;
      }
    }

    .dataset__row-middle {
      overflow: hidden;
    }

    .dataset__row-middle--datapoints {
      display: block;
      &--hidden {
        display: none;
      }
    }

    .dataset__row-middle--totaldatapoints,
    .dataset__row-middle--add-totaldatapoint,
    .dataset__row-middle--add-totaldatapoint--disabled {
      float: left;
      width: calc(100% / 3);
      padding-right: 14px;
      &--hidden {
        display: none;
      }
      .dataset__cell {
        width: 100%;
        display: block;
        margin-bottom: 14px;
      }
    }

    .thirdtotaldatapoint {
      padding-right: 0;
    }

    .dataset__row-middle--add-datapoint,
    .dataset__row-middle--add-totaldatapoint,
    .dataset__row-top--add-routinggroup {
      &--disabled .dataset__cell {
        color: globals.$color-gray20;
        box-shadow: none;
        border: dashed 2px globals.$color-gray10;
        background-color: rgba(255, 255, 255, 0.8);
        &-button {
          position: absolute;
          padding-top: 6px;
          width: 40px;
          height: 40px;
          right: 5px;
          top: 5px;
          border-radius: 50%;
          font-size: 1.45rem;
          font-family: 'Material Design Icons';
          font-weight: normal;
          font-style: normal;
          text-align: center;
        }
      }
      .dataset__cell {
        color: globals.$color-gray60;
        box-shadow: none;
        border: dashed 2px globals.$color-gray20;
        background-color: rgba(255, 255, 255, 0.8);
      }
      button {
        right: 5px;
        left: initial;
        top: 5px;
      }
    }

    .dataset__row-middle--add-datapoint,
    .dataset__row-middle--add-datapoint--disabled {
      display: inline-block;
      position: relative;
      width: 100%;
    }

    .dataset__cell,
    .dataset__cell-empty {
      display: block;
      position: relative;
      width: 100%;
      height: 54px;
      background-color: rgba(255, 255, 255, 0.8);
      color: globals.$color-gray60;
      .dataset__cell-label {
        overflow: hidden;
        display: block;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .dataset__icon-remove {
        position: absolute;
        width: 32px;
        height: 32px;
        padding-top: 9px;
        text-align: center;
        right: 4px;
        top: 50%;
        transform: translateY(-50%);
        font-family: 'Material Design Icons';
        font-weight: bold;
        font-size: 0.8rem;
        color: globals.$color-gray60;
        transition: color 250ms;
        cursor: pointer;
        &:hover {
          color: globals.$color-warning;
        }
      }
    }

    .dataset__cell {
      padding: 16px 40px 16px 10px;
      border-radius: 3px;
      box-shadow: 1px 1px 2px 0 rgba(0, 0, 0, .2);
    }

    .dataset__cell-empty {
      padding: 16px 0px 16px 0;
      box-shadow: none;
      text-align: center;
      border: 1px dashed #C00;
    }

    .dataset__branding-menu {
      position: absolute;
      top: 50%;
      right: 3px;
      transform: translateY(-50%);
      background-color: rgba(255, 255, 255, 0.8);
      border-radius: 3px;
      box-shadow: 0 0 3px 0 rgba(0,0,0,.4);
      z-index: 100;
      width: 34px;
      height: 34px;
      overflow: hidden;
      display: flex;
      flex-direction: row-reverse;
      opacity: .5;
      &--open {
        width: auto;
        overflow: visible;
        opacity: 1;
      }
    }

    .dataset__row-top--branding:hover .dataset__branding-menu {
      opacity: 1;
    } 

    .button__wrapper {
      position: relative;
      display: block;
      float: left;
      width: 30px;
      height: 30px;
      line-height: 30px;
      margin: 2px;
    }

    .button__button {
      position: relative;
      display: block;
      float: left;
      width: 30px;
      height: 30px;
      line-height: 30px;
      text-align: center;
      cursor: pointer;
      font-family: 'Material Design Icons';
      font-weight: normal;
      font-style: normal;
      font-size: 1.4em;
      color: globals.$color-gray40;
      z-index: 100;
      user-select: none;
      &:hover {
        color: globals.$color-gray60;
      }
    }

    .branding-logo {
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: 1;
    }
  }

</style>