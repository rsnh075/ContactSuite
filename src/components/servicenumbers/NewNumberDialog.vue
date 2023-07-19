
<template>
  <div :class="['dialog__modal', {'dialog__modal--open' : $store.state.numberDialogStatus}]" data-e2e="new-number-dialog">
    <div :class="['dialog__window', {'dialog__window--open' : $store.state.numberDialogStatus}]">
      <!-- <a :class="['button-help', {'button-help--active' : showHelp}]" @click="displayHelp">?</a> -->
      <div class="grid-row">
        <div class="grid-unit--alpha detailscreen-wrapper__title">
          <span class="detailscreen__title">{{ dialogHeaderText }}</span>
        </div>
      </div>
      <div class="grid-row grid-row--less-padding">
        <!-- <div :class="['grid-unit--alpha typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.servicenrconfig.helptextaddnumbers }}</div> -->
      </div>
      <div class="grid-row grid-row--less-padding">
        <div class="grid-unit--beta">
          <h2 class="typo-h2-underline">{{ $store.state.settings.portal.numbersavailable }}</h2>
        </div>
        <div class="grid-unit--beta">
          <h2 class="typo-h2-underline">{{ $store.state.settings.portal.numberschosen }}</h2>
        </div>
      </div>
      <div class="grid-row grid-row--less-padding">
        <div class="grid-unit--beta">
          <div class="form-textfield form-textfield--search form-textfield--search-on-white">
            <input type="text" id="nrSearch" ref="nrSearch" @keyup="filterNumbers($event)" :placeholder="$store.state.settings.portal.searchlbl">
          </div>
        </div>
      <div class="grid-unit--beta">&nbsp;</div>
      </div>
      <div class="grid-row grid-row--less-padding">
        <div class="grid-unit--beta">
          <ul class="list-number-wrapper list-number-wrapper--30perc">
            <li v-for="(nr, index) in serviceNumberList" class="list-servicenumber-line" :key="index">
              <a href="javascript:;" @click="selectNumber('add', index)">{{ nr.Number }}</a>
            </li>
          </ul>
          <a href="javascript:;" @click="selectAll('add')" class="button__icon button__icon-all-to-left">&#xF13E</a>
        </div>
        <div class="grid-unit--beta">
          <ul class="list-number-wrapper list-number-wrapper--30perc">
            <li v-for="(nr, index) in selectedServiceNumberList" class="list-servicenumber-line list-servicenumber-line--delete" :key="index">
              <a href="javascript:;" @click="selectNumber('remove', index)">{{ nr.Number }}</a>
            </li>
          </ul>
          <a href="javascript:;" @click="selectAll('remove')" class="button__icon button__icon-all-to-right">&#xF13D</a>
        </div>
      </div>
      <div class="detailscreen-footer detailscreen-footer--inside">
        <div class="grid-unit--alpha">
          <span class="grid--push">
            <a class="button-primary button-primary--gray" @click="dialogClose">{{ $store.state.settings.portal.dialogCancelText }}</a>
            <a :class="['button-primary', {'button-primary--disabled' : !okToNext}]" @click="configChosenNumbers()">{{ $store.state.settings.portal.dialogNextText }}</a>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  /**
   *
   *
   * added Description for ISN
   *
   * @author Erik Rosenhart <rsnh075@gmail.com>
   *
   * @version 1.0
   *
   * @todo
   * test and speedup large data list
   * Add virtual list
   * Remove search mask (maby enter or btn to get rid of keyup)
   *
   */

  import * as Mask              from './../../utils/cm_mask';
  import { IPCCCConfigurator }  from './../../ipccc/js/configurator.js';

  export default {
    name: 'NewNumberDialog',
    data() {
      return {
        dialogHeaderText          : '',
        rawNumberList             : [],
        serviceNumberList         : [],
        selectedServiceNumberList : [],
        customerId                : -1,
        itemsFound                : 0,
        numberWatch               : null,
        // showHelp                  : false,
        searchStr                 : '',
      };
    },
    inject: ['showLoader'],
    computed: {
      okToNext() {
        return this.selectedServiceNumberList.length > 0;
      }
    },
    methods: {
    //   displayHelp() {
    //     this.showHelp = !this.showHelp;
    //   },
      dialogClose(e) {
        this.$store.commit('SET_NUMBERDIALOG', false);
      },
      filterNumbers(evt) {
        // Mask.isPhoneNumberPartMask(evt);
        this.searchStr         = evt.target.value;
        this.serviceNumberList = this.filterNumberList();
      },
      filterNumberList() {
        return (this.searchStr !== '') ?
        JSON.parse(JSON.stringify(this.rawNumberList.filter(nr => this.selectedServiceNumberList.find(_nr => _nr.Number == nr.Number) == undefined))).filter(nr => nr.Number.indexOf(this.searchStr) != -1) :
        JSON.parse(JSON.stringify(this.rawNumberList.filter(nr => this.selectedServiceNumberList.find(_nr => _nr.Number == nr.Number) == undefined)));
      },
      getNumbers() {
        IPCCCConfigurator.Request(this.$store.getters.getCustomerInfo().selectedCustomerId, 'portalfreeservicenumbers', 'readall', '', -1)
        .then(result => {
          this.rawNumberList     = JSON.parse(JSON.stringify(result.Numbers));
          this.serviceNumberList = this.filterNumberList();
          this.showLoader(false);
        })
        .catch(error => {
          this.showLoader(false);
          console.error(error);
        });
      },
      selectNumber(type, index) {
        if (type == 'add') {
          this.selectedServiceNumberList.push(this.serviceNumberList[index]);
          this.serviceNumberList.splice(index, 1);
        } else {
          this.serviceNumberList.push(this.selectedServiceNumberList[index]);
          this.serviceNumberList.sort();
          this.selectedServiceNumberList.splice(index, 1);
        }
      },
      selectAll(type) {
        if (type == 'add') {
          this.selectedServiceNumberList = JSON.parse(JSON.stringify(this.rawNumberList));
          this.serviceNumberList         = [];
        } else {
          this.serviceNumberList         = JSON.parse(JSON.stringify(this.rawNumberList));
          this.selectedServiceNumberList = [];
        }
      },
      configChosenNumbers() {
        if(!this.okToNext) return;
        this.$store.commit('SET_NUMBERDIALOG', false);
        this.$emit('configNumbers', this.selectedServiceNumberList);
      }
    },
    mounted() {
      this.dialogHeaderText   = this.$store.state.settings.portal.addnumbersdialogtitle,

      this.numberWatch        = this.$store.watch(this.$store.getters.numberDialogStatus, status => {
        this.showLoader(true);
        this.serviceNumberList         = [];
        this.selectedServiceNumberList = [];
        this.itemsFound                = 0;
        this.totalItems                = 0;
        this.customerId                = this.$store.getters.getCustomerInfo().selectedCustomerId;
        this.searchStr                 = '';
        if(typeof this.$refs['nrSearch'] !== 'undefined') {
          Mask.clearTimeMask('nrSearch');
        }

        this.getNumbers();
      });
    },
    beforeUnmount() {
      this.$store.state.numberDialogStatus = false;
    }
  }
</script>
