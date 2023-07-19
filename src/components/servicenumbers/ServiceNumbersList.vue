<template>
  <div ref="outherRef" data-e2e="service-numbers-list">
    <!-- DIALOG CONFIRM -->
    <Confirm-Box
      :status="showDialog"
      :header="$store.state.settings.scriptmanager.confirmheader"
      :bodyContent="dialogText"
      :acceptLabel="$store.state.settings.servicenumbers.acceptlbl"
      :cancelLabel="$store.state.settings.servicenumbers.cancellbl"
      @accepted="okConfirm"
      @canceled="cancelConfirm"
    />

    <UpgradeBox
      :status='showUpgradeBox'
      :headerContent='$store.state.settings.servicenrconfig.chosennumbersheader'
      :acceptLabel="$store.state.settings.servicenrconfig.savelbl"
      :cancelLabel="$store.state.settings.servicenrconfig.cancellbl"
      :numberlist="selectedNumbers"
      @savenumbers='saveAddedNewNumbers'
      @canceled='cancelAddNewNumbers'
    />

    <ConfigScreen
      :modalopen="showConfig"
      :custid="selectedCustomerId"
      :params="configParams"
      :title="selectedSN"
      :type="configType"
      :data="configData"
      :extradata="extraData"
      :blacklistdata="blackListData"
      :costcenterlist="costCenterList"
      :numbertype="callFlowParams.NumberType"
      :advanceddata="advancedData"
      :isnewisn="isNewISN"
      :isnnotallowedlist="isnNotAllowedList"
      :isnlength="isnLength"
      :extraisndata="extraISNData"
      @onsave="saveConfig"
      @ondecouple="decoupleAndCloseConfig"
      @oncancel="closeConfigDialog"
    />

    <DestinationTypeScreen
      :modalopen="showDestinationType"
      :title="selectedSN"
      :numbertype="callFlowParams.NumberType"
      @onselect="onSelectedType"
      @oncancel="closeDestinationTypeDialog"
    />

    <NewNumberTypeDialog
      :modalopen="showNewNumberType"
      @onselect="onSelectedNewNumberType"
      @oncancel="closeNewNumberType"
    />

    <!-- CONTEXTMENU -->
    <div class="list-content__row-menu" ref="contextMenu" @mouseleave="closeContextMenu($event)" @click="clickedOnList($event)">
      <a class="button__icon">&#xF1D9;</a>
      <ol>
        <li class="list-content__menu-item list-content__menu-item-head">
          {{ $store.state.settings.servicenumbers.rowlbls[0] }}
        </li>
        <li v-if="callFlowParams.NumberType === 2" class="list-content__menu-item voipaccount--js">
          <span>&#xF3FE;</span>{{ $store.state.settings.servicenumbers.rowlbls[1] }}
        </li>
        <li v-if="callFlowParams.NumberType === 2" class="list-content__menu-item voipgroup--js">
          <span>&#xF848;</span>{{ $store.state.settings.servicenumbers.rowlbls[2] }}
        </li>
        <li v-if="callFlowParams.NumberType === 2" class="list-content__menu-item email--js">
          <span>&#xF212;</span>{{ $store.state.settings.servicenumbers.rowlbls[3] }}
        </li>
        <li v-if="callFlowParams.NumberType === 1 && callFlowParams.IsISN" class="list-content__menu-item isn--js">
          <span>&#xF9BA;</span>{{ $store.state.settings.servicenumbers.rowlbls[4] }}
        </li>
        <li v-if="callFlowParams.NumberType === 1 && !callFlowParams.IsISN" class="list-content__menu-item couple--js">
          <span>&#xF9BA;</span>{{ $store.state.settings.servicenumbers.rowlbls[4] }}
        </li>
        <li v-if="callFlowParams.CurrentSelectedId > 1" class="list-content__menu-item list-content__menu-item--alert decouple--js">
          <span>&#xFDCB;</span>{{ $store.state.settings.servicenumbers.rowlbls[5] }}
        </li>
        <li v-if="hasAddNumberRights" class="list-content__menu-item list-content__menu-item--special list-content__menu-item--alert delete--js">
          <span>&#xFA79;</span>{{ $store.state.settings.servicenumbers.rowlbls[6] }}
        </li>
      </ol>
    </div>

    <!-- LIST -->
    <div class="list-wrapper">
      <div class="list-topbar">
        <div class="list-topbar__content">
          <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
            <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings.servicenumbers.searchtxt" @keyup="filterList()">
          </div>
          <div class="typo-tabletitle">
            {{ totalNumbers }} {{ $store.state.settings.servicenumbers.numbercountlabel }}
          </div>
          <div v-if="hasAddNumberRights" class="grid--push">
            <div class="form-button__secondary form-button__secondary--add grid--push">
              <button @click="openNewNumberTypeDialog()">{{ $store.state.settings.portal.addnumberlabel }}</button>
            </div>
          </div>
        </div>
      </div>
      <div class="list-content-wrapper list-content-wrapper--paging" ref="listContentWrapper">
        <div class="list-content--back">
          <div class="list-content--header">
            <ExportListToXLSX
            :data="partList"
            :customBtnStyles="exportListBtnStyles"
            :customWrapperStyles="exportListWrapperStyles"
            />
            <div class="list-content__row--header">
              <span class="list-content__row-cell list-content__row-cell--10" @click="sortColumn('LanguageId', $event)"     data-sortorder="NONE" v-html="$store.state.settings.servicenumbers.collheads[0]"></span>
              <span class="list-content__row-cell list-content__row-cell--15" @click="sortColumn('Number', $event)"         data-sortorder="NONE" v-html="$store.state.settings.servicenumbers.collheads[1]"></span>
              <span class="list-content__row-cell list-content__row-cell--15" @click="sortColumn('NumberType', $event)"     data-sortorder="NONE" v-html="$store.state.settings.servicenumbers.collheads[2]"></span>
              <span class="list-content__row-cell list-content__row-cell--15" @click="sortColumn('sortTariff', $event)"     data-sortorder="NONE" v-html="$store.state.settings.servicenumbers.collheads[3]"></span>
              <span class="list-content__row-cell list-content__row-cell--30" @click="sortColumn('Title', $event)"          data-sortorder="NONE" v-html="$store.state.settings.servicenumbers.collheads[4]"></span>
              <span class="list-content__row-cell list-content__row-cell--15" @click="sortColumn('Till', $event)"           data-sortorder="NONE" v-html="$store.state.settings.servicenumbers.collheads[5]"></span>
            </div>
          </div>
          <div class="list-content">
            <ol @click="clickedOnList($event)" ref="theList">
              <li v-for="(number, index) in partList" :key="number.Id" :class="['list-content__row', 'list-content__row--hover-action', {'list-content__row--attention' : number.isNotActive }]" :data-id="number.Id" :data-index="index">
              <!-- <li v-for="(number, index) in partList" :key="number.Id" class="list-content__row list-content__row--hover-action" :data-id="number.Id" :data-index="index">  -->
                <span class="list-content__row-cell list-content__row-cell--hoverhand list-content__row-cell--10 select-type--js"><div :class="flag(number.LanguageId)"></div></span>
                <span class="list-content__row-cell list-content__row-cell--hoverhand list-content__row-cell--15 select-type--js">{{ stripSip(number.Number) }}</span>
                <span class="list-content__row-cell list-content__row-cell--hoverhand list-content__row-cell--15 select-type--js">{{ getTypeLabel(number.NumberType, $store.state.settings.servicenumbers) }}</span>
                <span class="list-content__row-cell list-content__row-cell--hoverhand list-content__row-cell--15 select-type--js">&euro;&nbsp;{{ toEuro(number.TariffInCents) }}&nbsp;{{ perLabel(number.TariffIsPerCall, $store.state.settings.portal.tarifflabel) }}&nbsp;{{ placeSetup(number.TariffSetup, $store) }}</span>
                <span v-if="number.NumberType == 1" class="list-content__row-cell list-content__row-cell--hoverhand list-content__row-cell--30 select-type--js" v-html="number.WPName"></span>
                <span v-else class="list-content__row-cell list-content__row-cell--hoverhand list-content__row-cell--30 select-type--js" v-html="number.Title"></span>
                <span class="list-content__row-cell list-content__row-cell--hoverhand list-content__row-cell--15 select-type--js">{{ formatDateTime(number.Till, $store.state.browserLanguage) }}</span>
                <div class="list-content__row-cell list-content__row-cell--icons sublist--js">
                  <a class="button__icon" @mouseenter="hoverRow($event, number)">&#xF1D9;</a>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
      <div class="list-paging" v-if="totalNumbers > listStep">
        <button @click="prevPage()" class="button_pageing button_pageing--previous">&#xF4AE;</button>
        <span class="type-navtext">{{ totalNumbersStr }}</span>
        <button @click="nextPage()" class="button_pageing button_pageing--next">&#xF4AD;</button>
      </div>
    </div>
    <new-number-dialog
      @configNumbers="showUpgradeAlert"
    />
  </div>
</template>

<script>

/**
 *
 * isNotActive (Red text in row) shows support that SN needs attention (based on now > Till || From > now)
 * selected is WorkprocessId but changed to CallPlan id for save!
 * hasUnKnownCallPlan prevents save of callplan !hasUnKnownCallPlan saves callplan (var name is badly chosen)
 * added search string 'isn' & 'esn'
 *
 * @author Erik Rosenhart <rsnh075@gmail.com>
 *
 * @version 2.0
 *
 * @todo
 * check if saveISNAdvanced is changed, for now saveISNAdvanced for ISN is always saved
 *
 */

  import { dynamicSort }              from './../../use/sortFunctions';
  import { IPCCCConfigurator }        from './../../ipccc/js/configurator.js';
  import ConfigScreen                 from './ConfigScreen.vue';
  import DestinationTypeScreen        from './DestinationTypeScreen.vue';
  import NewNumberTypeDialog          from './NewNumberTypeDialog.vue';
  import ConfirmBox                   from '../dialogs/Confirm-box.vue';
  import UpgradeBox                   from './Upgrade-box.vue';
  import NewNumberDialog              from './NewNumberDialog.vue';
  import ExportListToXLSX             from '../uielements/ExportListToXLSX.vue';
  import {
            convertISOToDateTime,
            ISOdateTimetoDate
          }                           from './../../use/dateFunctions';
  import { scrollTo }                 from './../../use/helperFunctions';
  export default {
    name: 'ServiceNumbersList',
      data() {
      return {
        orderedList           : [],
        unOrderedList         : [],
        partList              : [],
        listFrom              : 0,
        listTo                : 0,
        listStep              : 100,
        currentPage           : 0,
        searchStr             : '',
        sortSetting           : {},
        totalNumbersStr       : '',
        totalNumbers          : 0,
        selectedCustomerId    : 1,
        showConfig            : false,
        callFlowParams        : {
          CurrentValue      : '',
          CurrentSelectedId : -1,
          NumberType        : -1,
          LookupFunction    : 'workprocess',
          LookupLabel       : 'Name',
          LookupValue       : 'Id',
        },
        selectedServiceNumberId : -1,
        selectedSN              : '',
        dialogText              : '',
        showDialog              : false,
        serviceNumberSaveObject : null,
        configType              : 'voipaccount',
        configData              : {},
        configParams            : {},
        extraData               : {},
        extraISNData            : {},
        blackListData           : [],
        showUpgradeBox          : false,
        confirmAction           : 'delete',

        selectedNumbers         : [],
        externalCall            : false,
        showDestinationType     : false,
        showNewNumberType       : false,
        costCenterList          : [],
        advancedData            : {},
        isNewISN                : false,
        isnLength               : null,
        isnNotAllowedList       : [],
        exportListBtnStyles  : {
            top: '9px',
            right: '8px',
            zIndex: 1
        },
        exportListWrapperStyles : {
            top: '9px',
            right: '8px',
        },
      }
    },
    inject: ['showLoader'],
    components: {
      ConfigScreen,
      DestinationTypeScreen,
      NewNumberTypeDialog,
      'Confirm-Box'        : ConfirmBox,
      UpgradeBox,
      'new-number-dialog'  : NewNumberDialog,
      ExportListToXLSX
    },
    computed: {
      flag() {
        return function(langId) {
          return 'flag flag_' + langId;
        }
      },
      hasAddNumberRights() {
        return this.$store.getters.getPermission('NummerToewijzen');
      }
    },
    methods: {
      // toEuro(cents) {
      //   return (cent/100).toLocaleString("nl-NL", {style:"currency", currency:"EURO"});
      // },
      openNewNumberTypeDialog() {
        this.showNewNumberType = true
      },
      hoverRow(evt, number) {
        evt.stopPropagation();
        this.selectedServiceNumberId          = number.Id;
        this.callFlowParams.CurrentSelectedId = number.WorkprocessId;
        this.callFlowParams.NumberType        = number.NumberType;
        this.selectedSN                       = number.Number;
        this.$refs.contextMenu.style.top      = '';
        this.$refs.contextMenu.style.left     = '';

        setTimeout(() => {
          let _target           = evt.target,
              _targetProps      = _target.getBoundingClientRect(),
              _menuProps        = this.$refs.contextMenu.getBoundingClientRect(),
              _listWrapper      = this.$refs.listContentWrapper,
              _listWrapperProps = _listWrapper.getBoundingClientRect();;

          if(((_targetProps.top - _listWrapperProps.top) + _menuProps.height) > (_listWrapper.scrollTop + _listWrapperProps.height)) {
            this.$refs.contextMenu.style.top      = (_targetProps.top + _targetProps.height - _menuProps.height) + 'px';
            this.$refs.contextMenu.classList.add('list-content__row-menu--flip');
          } else {
            this.$refs.contextMenu.style.top      = _targetProps.top + 'px';
            this.$refs.contextMenu.classList.remove('list-content__row-menu--flip');
          }

          this.$refs.contextMenu.style.left     = (_targetProps.left - _menuProps.width) + 'px';
        });
      },
      closeContextMenu(evt) {
        evt.stopPropagation();
        this.$refs.contextMenu.style.left     = '';
        this.$refs.contextMenu.style.top      = '';
        this.$refs.contextMenu.classList.remove('list-content__row-menu--flip');
      },
      perLabel(perCall, lbl) {
        return perCall ? lbl[0] : lbl[1];
      },
      placeSetup(isSetup, store) {
        return isSetup ? store.state.settings.portal.setuptariff : '';
      },
      getTypeLabel(typeIndex, store) {
        return store.numbertypelabels[typeIndex];
      },
      okConfirm() {
        if(this.confirmAction !== 'delete') {
          this.callFlowParams.CurrentSelectedId = -1;
          this.getDataDetail('decouple');
        } else {
          this.getDataDetail('delete');
        }
        this.showDialog     = false;
      },
      cancelConfirm() {
        this.selectedSN     = '';
        this.dialogText     = '';
        this.showDialog     = false;
      },
      //=========================================================== START DISPLAY LIST METHODS
      filterList() {
        this.showLoader(true);
        this.orderedList    = this.filterListOnString(this.unOrderedList, this.searchStr.toLowerCase());
        this.totalNumbers   = this.orderedList.length;
        this.sortColumn();
      },
      filterListOnString(list, str) {
        if(str != '') {
          let _rawList = [...list];
          return _rawList.filter(item => {
              if(String(item['Number']).toLowerCase().indexOf(str) != -1 ||
                item['NumberType'].toString().indexOf(str) != -1 ||
                (str.toLowerCase() == 'isn' && item['IsISN']) ||
                (str.toLowerCase() == 'esn' && !item['IsISN']) ||
                item['Title'].toLowerCase().indexOf(str) != -1 ||
                item['Till'].toString().indexOf(str) != -1) {
                return item;
              };
          });
        } else {
          return [...list];
        }
      },
      sortColumn(key, e = null) {
        let _order,
            _t;

        if(e != null) {
          _t     = e.target;
          _order = _t.getAttribute('data-sortOrder');
          document.querySelectorAll('[data-sortorder]').forEach( a => a.setAttribute('data-sortorder', 'NONE'));
          this.sortSetting = {
            'key': key,
            'order' : _order
          }
        } else {
          _order = this.sortSetting.order;
          key    = this.sortSetting.key;
        }

        switch(_order) {
          case 'NONE':
            this.orderedList.sort(dynamicSort(key));
            if(e != null)
              _t.setAttribute('data-sortOrder', 'ASC');
            break;
          case 'ASC':
            this.orderedList.sort(dynamicSort('-' + key));
            if(e != null)
              _t.setAttribute('data-sortOrder', 'DES');
            break;
          case 'DES':
            this.orderedList       = this.filterListOnString(this.unOrderedList, this.searchStr.toLowerCase());
            this.totalNumbersStr   = this.orderedList.length;
            if(e != null)
              _t.setAttribute('data-sortOrder', 'NONE');
            break;
        }
        this.resetPagePart();
        this.showLoader(false);
      },
      prevPage() {
        if(this.listFrom >= this.listStep) {
          this.listTo        = this.listFrom;
          this.listFrom     -= this.listStep;
          this.partList      = [...this.orderedList.slice(this.listFrom, this.listTo)];
          this.currentPage  -= 1;
          [...this.$refs.theList.querySelectorAll("[data-id]")].forEach(row => row.classList.remove('list-content__row--mutated'));
          this.showTotals();
        }
      },
      nextPage() {
        if(this.listTo < this.totalNumbers) {
          this.listFrom      = this.listTo;
          this.listTo       += ((this.listTo + this.listStep) < this.totalNumbers) ? this.listStep : (this.totalNumbers - this.listFrom);
          this.partList      = [...this.orderedList.slice(this.listFrom, this.listTo)];
          this.currentPage  += 1;
          [...this.$refs.theList.querySelectorAll("[data-id]")].forEach(row => row.classList.remove('list-content__row--mutated'));
          this.showTotals();
        }
      },
      resetPagePart() {
        this.listFrom     = this.currentPage != 0 ? this.currentPage * this.listStep : 0;
        this.listTo       = this.currentPage != 0 ? (this.currentPage + 1) * this.listStep : this.listStep;
        this.partList     = this.orderedList.slice(this.listFrom, this.listTo);
        this.partList.forEach(nr => nr.Number = nr.Number == '' ? '-' : nr.Number);
        this.showTotals();
      },
      showTotals() {
        this.totalNumbers     = this.orderedList.length;
        let _endStep          = (this.listTo >= this.totalNumbers) ? this.totalNumbers : this.listStep;
        this.totalNumbersStr  = this.listFrom + ' tot ' + _endStep + ' van ' + this.totalNumbers;
      },
      clickedOnList(evt) {
        let _target                           = evt.target,
            _trigger                          = [..._target.classList].find(cls => cls.indexOf('--js') != -1);

        this.$refs.contextMenu.style.top      = '';
        this.$refs.contextMenu.style.left     = '';

        switch(_trigger) {
          case 'voipaccount--js':
            this.getDataDetail('voipaccount');
            break;
          case 'voipgroup--js':
            this.getDataDetail('voipgroup');
            break;
          case 'email--js':
            this.getDataDetail('email');
            break;
          case 'isn--js':
            this.showISN();
            break;
          case 'couple--js':
            this.getDataDetail('couple');
            break;
          case 'decouple--js':
            this.decoupleConfig();
            break;
          case 'delete--js':
            this.dialogText    = `<p>${this.$store.state.settings.servicenrconfig.confirmmessagedelete}<br><br><b>${this.selectedSN}</b></p>`;
            this.confirmAction = 'delete'
            this.showDialog    = true;
            break;
          case 'select-type--js':
            this.handleRowIsClicked(_target);
            break;
        }
      },
      handleRowIsClicked(__target) {
        let _selectedPartId                   = __target.parentElement.attributes['data-id'].value,
            _number                           = this.partList.find(part => part.Id == _selectedPartId),
            _selectedSaveAction               = _number.SaveParameters.SaveAction;
        this.selectedServiceNumberId          = _number.Id;
        this.callFlowParams.CurrentSelectedId = _number.WorkprocessId;
        this.callFlowParams.NumberType        = _number.NumberType;
        this.selectedSN                       = _number.Number;

        if(_selectedSaveAction === 2) this.getDataDetail('voipaccount');
        else if(_selectedSaveAction === 3) this.getDataDetail('voipgroup');
        else if(_selectedSaveAction === 4) this.getDataDetail('email');
        else if(_number.NumberType == 1 && _number.IsISN) this.showISN();
        else if(_number.NumberType == 1 && !_number.IsISN) this.getDataDetail('couple');
        else this.showDestinationType = true;
      },
      decoupleAndCloseConfig() {
        this.decoupleConfig()
        this.closeConfigDialog()
      },
      decoupleConfig() {
        this.dialogText    = `<p>${this.$store.state.settings.servicenrconfig.confirmmessagedecouple}<br><br><b>${this.selectedSN}</b></p>`;
        this.confirmAction = 'decouple';
        this.showDialog    = true;
      },
      onSelectedType(val) {
        this.showDestinationType = false;
        this.getDataDetail(val);
      },
      onSelectedNewNumberType(val) {
        this.showNewNumberType = false;
        if(val == 'externalservicenumber') this.$store.commit('SET_NUMBERDIALOG', true);
        if(val == 'internalservicenumber') this.startNewISN();
      },
      closeDestinationTypeDialog() {
        this.showDestinationType = false;
      },
      closeNewNumberType() {
        this.showNewNumberType = false;
      },
      getAdvancedData() {
        return {
          Title                 : this.serviceNumberSaveObject.Title,
          Description           : this.serviceNumberSaveObject.Description,
          LanguageId            : this.serviceNumberSaveObject.LanguageId,
          KostenPlaatsId        : this.serviceNumberSaveObject.KostenPlaatsId,
          AniMayShown           : this.serviceNumberSaveObject.AniMayShown,
          AniAlwaysSecret       : this.serviceNumberSaveObject.AniAlwaysSecret,
          BellerNietOphangen    : this.serviceNumberSaveObject.BellerNietOphangen,
          QM                    : this.serviceNumberSaveObject.QM,
        //   RecordEveryCall       : this.serviceNumberSaveObject.RecordEveryCall,
          RecordingNeedsConsent : this.serviceNumberSaveObject.RecordingNeedsConsent,
          Environment           : this.serviceNumberSaveObject.Environment,
          UseBlacklist           : this.serviceNumberSaveObject.UseBlacklist,
          Till                  : this.serviceNumberSaveObject.Till
        };
      },
      handleCoupleCallFlow(Id, SaveAction) {
        this.showLoader(true);
        this.serviceNumberSaveObject.WorkprocessId               = Id;
        this.serviceNumberSaveObject.SaveParameters.SaveAction   = SaveAction;

        IPCCCConfigurator.Request(this.selectedCustomerId, 'servicenumbers2', 'save', this.serviceNumberSaveObject, -1)
        .then(result => {
          if(this.isNewISN) this.isNewISN = false;
          let _indexToUpdate   = this.unOrderedList.findIndex(sn => sn.Id === this.selectedServiceNumberId);

          result.sortTime      = Date.parse(result.From);
          result.DateSince     = ISOdateTimetoDate(new Date(result.From));
          result.sortTariff    = result.Tariff;
          result.Tariff        = this.toEuro(result.Tariff);

          this.unOrderedList[_indexToUpdate] = Object.assign({}, result);
          if(this.callFlowParams.CurrentSelectedId === -1)
            this.unOrderedList[_indexToUpdate].WorkprocessId = this.callFlowParams.CurrentSelectedId;

          if(SaveAction == 5) this.unOrderedList[_indexToUpdate].WorkprocessId = result.WorkprocessId;

          if(SaveAction == 6) { //decouple
            this.unOrderedList[_indexToUpdate].WorkprocessId = -1;
            this.unOrderedList[_indexToUpdate].WPName        = '-';
          }

          this.orderedList   = [...this.unOrderedList];
          this.partList      = this.orderedList.slice(this.listFrom, this.listTo);

          this.serviceNumberSaveObject = Object.assign({});

          this.handleBackToList([this.selectedServiceNumberId]);

          // this.heiglightRow([this.selectedServiceNumberId]);

          // this.showConfig = false;
          // this.showLoader(false);
        })
        .catch(error => {
          console.error(error);
          this.showLoader(false);
        });
      },
      toEuro(cents) {
        let _cents    = cents.toString(),
          _halfCents  = _cents.split('.'),
          _nrOfDigets = _halfCents[0].length,
          _euros      = '0,00';

        switch (_nrOfDigets) {
          case 1:
            _euros = '0,0' + _halfCents[0];
            break;
          case 2:
            _euros = '0,' + _halfCents[0];
            break;
          default:
            _euros =
              _halfCents[0].substring(0, _nrOfDigets - 2) +
              ',' +
              _halfCents[0].substring(_nrOfDigets - 2, _nrOfDigets);
            break;
        }

        return _halfCents.length > 1 ? _euros + _halfCents[1] : _euros;
      },
      getData(ready) {
        IPCCCConfigurator.Request(this.selectedCustomerId, 'servicenumbers2', 'list', null, -1)
        .then(result => {
          let _now     = new Date().getTime();
          this.unOrderedList = [...result];
          this.unOrderedList.forEach(n => {
            n.sortTime      = Date.parse(n.From);
            n.DateSince     = ISOdateTimetoDate(new Date(n.From));
            n.sortTariff    = n.Tariff;
            n.Tariff        = this.toEuro(n.Tariff);
            n.isNotActive   = new Date(n.Till).getTime() < _now || new Date(n.From).getTime() > _now;
          });
          this.orderedList  = [...this.unOrderedList];

          [...this.$refs.theList.querySelectorAll("[data-id]")].forEach(row => row.classList.remove('list-content__row--mutated'));
          this.$refs.theList.scrollTop = 0;

          this.resetPagePart();
          if(typeof ready !== 'undefined')
            setTimeout(ready);
          if(this.externalCall) {
            this.handleExternalCall();
          }
          this.showLoader(false);
        })
        .catch(error => {
          console.error(error);
          this.showLoader(false);
        });
      },
      getDataDetail(action) { //Get selected number details
        this.showLoader(true);
        IPCCCConfigurator.Request(this.selectedCustomerId, 'servicenumbers2', 'readone', null, this.selectedServiceNumberId)
        .then(result => {
          this.serviceNumberSaveObject = {...result};
          if(action !== 'decouple' && action !== 'couple')
            action !== 'delete' ? this.getVoipAccountNumbers(action) : this.deleteNumber();
          else {
            action === 'decouple' ? this.handleCoupleCallFlow(-1, 6) : this.showCallFlows(action);
          }
        })
        .catch(error => {
          console.error(error);
          this.showLoader(false);
        });
      },
      getVoipAccountNumbers(type) {
        IPCCCConfigurator.Request(this.selectedCustomerId, 'voipaccount', 'list', null, -1)
        .then(response => {
          switch(type) {
            case 'voipaccount':
              this.showVoipAccountNumbers(response, type);
              break;
            case 'voipgroup':
              this.showVoipAccountGroups(response, type);
              break;
            case 'email':
              this.showEmail(type);
              break;
          }
        }, error => {
          this.showLoader(false);
          console.error('Error: ' + error);
        });
      },
      showVoipAccountNumbers(voipList, type) {
        this.configParams = {
          collName01 : 'InternalNumber',
          collName02 : 'Description',
          selectProp : 'InternalNumber'
        };
        this.configType     = type;
        this.configData     = voipList;
        this.advancedData   = this.getAdvancedData();
        this.extraData      = {
          savedSelected  : this.serviceNumberSaveObject.SaveParameters.VoIPAccountNumber,
          selected       : this.serviceNumberSaveObject.SaveParameters.VoIPAccountNumber,
          selectedSnId   : this.serviceNumberSaveObject.Id
        };
        this.getBlacklistData().then(data => {
          this.blackListData = data;
          this.showConfig    = true;
          this.showLoader(false);
        });
      },
      showVoipAccountGroups(voipList, type) {
        this.configParams = {
          collName01 : 'InternalNumber',
          collName02 : 'Description',
          selectProp : 'InternalNumber'
        };
        this.configType     = type;
        this.configData     = voipList;
        this.advancedData   = this.getAdvancedData();
        this.extraData      = Object.assign({}, {
                                            groupName      : this.serviceNumberSaveObject.SaveParameters.RoutinggroupName,
                                            voiceEmail     : this.serviceNumberSaveObject.SaveParameters.EmailAddress,
                                            distribution   : this.serviceNumberSaveObject.SaveParameters.Groupring,
                                            takeover       : this.serviceNumberSaveObject.SaveParameters.TakeOver,
                                            savedSelected  : this.serviceNumberSaveObject.SaveParameters.VoIPAccounts.map(nr => nr.InternalNumber),
                                            selected       : this.serviceNumberSaveObject.SaveParameters.VoIPAccounts.map(nr => nr.InternalNumber),
                                            selectedSnId   : this.serviceNumberSaveObject.Id
                                           });
        this.getBlacklistData().then(data => {
          this.blackListData = data;
          this.showConfig    = true;
          this.showLoader(false);
        });
      },
      showEmail(type) {
        this.configParams = {
          collName01 : '',
          collName02 : '',
          selectProp : ''
        };
        this.configType     = type;
        this.configData     = [];
        this.advancedData   = this.getAdvancedData();
        this.extraData      = Object.assign({}, {
                                            eMail          : this.serviceNumberSaveObject.SaveParameters.EmailAddress,
                                            subject        : this.serviceNumberSaveObject.SaveParameters.EmailSubject,
                                            body           : this.serviceNumberSaveObject.SaveParameters.EmailBody,
                                            savedSelected  : this.serviceNumberSaveObject.SaveParameters.EmailAddress,
                                            selected       : this.serviceNumberSaveObject.SaveParameters.EmailAddress,
                                            selectedSnId   : this.serviceNumberSaveObject.Id
                                           });
        this.getBlacklistData().then(data => {
          this.blackListData = data;
          this.showConfig    = true;
          this.showLoader(false);
        });
      },
      showISN() {
        if(this.showLoader) this.showLoader(true);
        this.getCallFlowList().then(response => {
          this.configParams = {
            collName01 : 'Name',
            collName02 : 'Description',
            selectProp : 'Id'
          };
          this.configType     = 'internalservicenumber';
          this.configData     = response;
          this.blackListData  = [];
          this.advancedData   = {};
          if(this.isNewISN) { //new ISN
            this.extraData = Object.assign({}, {
                                              selected : -1,
                                              selectedCallPlanWPName : ''
                                          });
            this.extraISNData = {
              Title            : '',
              Description      : '',
              Number           : '',
              QM               : false,
            //   RecordEveryCall  : false,
              KostenPlaatsId   : -1
            }
            this.showConfig    = true;
          } else { //edit ISN
            IPCCCConfigurator.Request(this.selectedCustomerId, 'servicenumbers2', 'readone', null, this.selectedServiceNumberId)
            .then(result => {
              this.serviceNumberSaveObject = {...result};
              this.extraData      = Object.assign({}, {
                                              savedSelected           : this.serviceNumberSaveObject.WorkprocessId,
                                              selected                : this.serviceNumberSaveObject.WorkprocessId,
                                              selectedSnId            : this.serviceNumberSaveObject.Id,
                                              selectedCallPlanWPName  : this.serviceNumberSaveObject.WPName
                                             });
              this.extraISNData = {
                Title            : this.serviceNumberSaveObject.Title,
                Description      : this.serviceNumberSaveObject.Description,
                Number           : this.serviceNumberSaveObject.Number,
                QM               : this.serviceNumberSaveObject.QM,
                // RecordEveryCall  : this.serviceNumberSaveObject.RecordEveryCall,
                KostenPlaatsId   : this.serviceNumberSaveObject.KostenPlaatsId
              }
              this.showConfig    = true;
            })
            .catch(error => {
              console.error(error);
              this.showLoader(false)
            });
          }

          this.showLoader(false)
        }).catch(error => {
          console.error(error);
          this.showLoader(false)
        });
      },
      startNewISN() {
        this.showLoader(true)
        this.selectedSN = this.$store.state.settings.servicenrconfig.newisntitle;
        IPCCCConfigurator.Request(this.selectedCustomerId, 'ISN', 'isninfo',  null, -1)
        .then(succes => {
          this.isnLength          = succes.NumberLength;
          this.isnNotAllowedList  = succes.NotAllowed;
          this.isNewISN           = true;
          this.showISN();
        })
        .catch(error => {
          console.error('Error: ', error);
          this.selectedSN = '';
          this.isNewISN = false;
          this.showLoader(false)
        });
      },
      showUpgradeAlert(evt) {
        this.selectedNumbers = [...evt];
        this.showUpgradeBox  = true;
      },
      showCallFlows(type = 'couple') {
        this.showLoader(true);
        this.getCallFlowList().then(response => {
          this.configParams = {
            collName01 : 'Name',
            collName02 : 'Description',
            selectProp : 'Id'
          };
          this.configType     = type;
          this.configData     = response;
          this.advancedData   = this.getAdvancedData();
          this.extraData      = Object.assign({}, {
                                              savedSelected          : this.serviceNumberSaveObject.WorkprocessId,
                                              selected               : this.serviceNumberSaveObject.WorkprocessId,
                                              selectedSnId           : this.serviceNumberSaveObject.Id,
                                              selectedCallPlanWPName : this.serviceNumberSaveObject.WPName
                                             });
          this.getBlacklistData().then(data => {
            this.blackListData = data;
            this.showConfig    = true;
            this.showLoader(false);
          });

        }).catch(error => {
          console.error(error);
          this.showLoader(false);
        });
      },
      getCallFlowList() {
        return new Promise((resolve, reject) => {
          IPCCCConfigurator.Request(this.selectedCustomerId, 'workprocess', 'readall', null, -1)
          .then(response => {
            resolve(response.filter(script => script.Versions.some(v => v.Active)));
          })
          .catch(error => {
            reject(error);
            this.showLoader(false);
          });
        });
      },
      getBlacklistData() {
        return new Promise((resolve, reject) => {
          let _id = {Id: this.selectedServiceNumberId};
          IPCCCConfigurator.Request(this.selectedCustomerId, 'servicenumberblacklist', 'readall', null, this.selectedServiceNumberId)
          .then(response => {
            resolve(response);
          })
          .catch(error => {
            reject(error);
          });
        });
      },
      saveBlackListData(data) {
        return new Promise((resolve, reject) => {
          if(data.blackListData) {
            let _data = data.blackListData.filter(number => number.isedited);
            IPCCCConfigurator.Request(this.selectedCustomerId, 'servicenumberblacklist', 'save', _data, this.selectedServiceNumberId)
            .then(response => {
              resolve();
            })
            .catch(error => {
              reject(error);
            });
          } else {
            resolve();
          }
        });
      },
      getCostCenterList() {
        IPCCCConfigurator.Request(this.selectedCustomerId, 'CostCenter', 'list', null, -1)
        .then(result => {
          this.costCenterList = [...result];
        })
        .catch(error => {
          console.error(error);
        });
      },
      cancelAddNewNumbers(numbers) {
        this.showUpgradeBox  = false;
        this.selectedNumbers = [];
      },
      saveAddedNewNumbers(evt) {
        this.showLoader(true);
        let _numbersToBeSaved = {
          Total   : evt.length,
          Numbers : [...evt]
        };

        let _selectedNumbers = evt.map(nr => {
          return nr.Number;
        });

        IPCCCConfigurator.Request(this.$store.getters.getCustomerInfo().selectedCustomerId, 'portalfreeservicenumbers', 'save', _numbersToBeSaved, -1)
        .then(result => {
          this.getData(() => {
            let _mutatedIds = this.unOrderedList.reduce((acc, nr) => {
              if(_selectedNumbers.indexOf((nr.Number).toString()) !== -1) {
                acc = acc.concat(nr.Id);
              }
              return acc;
            }, []);
            this.heiglightRow(_mutatedIds);
            this.filterList();
            this.resetPagePart();
            this.showUpgradeBox = false;
          });
        })
        .catch(error => {
          this.showUpgradeBox = false;
          this.showLoader(false);
          console.error(error);
        });
      },
      saveAdvancedData(data) {
        return new Promise((resolve, reject) => {
          if(data.advancedData) {
            this.serviceNumberSaveObject.Title                     = data.advancedData.Title;
            this.serviceNumberSaveObject.Description               = data.advancedData.Description;
            this.serviceNumberSaveObject.LanguageId                = data.advancedData.LanguageId;
            this.serviceNumberSaveObject.KostenPlaatsId            = data.advancedData.KostenPlaatsId;
            this.serviceNumberSaveObject.AniMayShown               = data.advancedData.AniMayShown;
            this.serviceNumberSaveObject.AniAlwaysSecret           = data.advancedData.AniAlwaysSecret;
            this.serviceNumberSaveObject.BellerNietOphangen        = data.advancedData.BellerNietOphangen;
            this.serviceNumberSaveObject.QM                        = data.advancedData.QM;
            // this.serviceNumberSaveObject.RecordEveryCall           = data.advancedData.RecordEveryCall;
            this.serviceNumberSaveObject.RecordingNeedsConsent     = data.advancedData.RecordingNeedsConsent;
            this.serviceNumberSaveObject.Environment               = data.advancedData.Environment;
            this.serviceNumberSaveObject.Till                      = data.advancedData.Till;
            this.serviceNumberSaveObject.UseBlacklist              = data.advancedData.UseBlacklist;
            this.serviceNumberSaveObject.SaveParameters.SaveAction = 7;
            IPCCCConfigurator.Request(this.selectedCustomerId, 'servicenumbers2', 'save', this.serviceNumberSaveObject, -1)
            .then(response => {
              resolve();
            })
            .catch(error => {
              reject(error);
            });
          } else {
            resolve();
          }
        });
      },
      saveISNAdvanced(data) {
        return new Promise(
          (resolve, reject) => {
            data.advancedData = data.extraISNData;
            //set missing to returned save obj of ISN save
            data.advancedData.AniAlwaysSecret = this.serviceNumberSaveObject.AniAlwaysSecret;
            data.advancedData.AniMayShown = this.serviceNumberSaveObject.AniMayShown;
            data.advancedData.BellerNietOphangen = this.serviceNumberSaveObject.BellerNietOphangen;
            data.advancedData.Environment = this.serviceNumberSaveObject.Environment;
            data.advancedData.LanguageId = this.serviceNumberSaveObject.LanguageId;
            data.advancedData.RecordingNeedsConsent = this.serviceNumberSaveObject.RecordingNeedsConsent;
            data.advancedData.Till = this.serviceNumberSaveObject.Till;
            this.saveAdvancedData(data)
            .then(resolve())
            .catch(e => reject(e))
          }
        )
      },
      saveNewISN(nr) {
        return new Promise(
          (resolve, reject) => {
            IPCCCConfigurator.Request(this.selectedCustomerId, 'ISN', 'save',  nr, -1)
            .then(succes => {
              resolve(succes)
            })
            .catch(e => {
              reject(e)
            });
          }
        )
      },
      saveConfig(data, type, savedata = true) { //savedata true = couple callflow
        if(type == 'internalservicenumber' && this.isNewISN) { //new ISN
          this.saveNewISN(data.extraISNData.Number).then(saveobj => {
            this.serviceNumberSaveObject = saveobj[0];
            this.unOrderedList.push(this.serviceNumberSaveObject);
            this.selectedServiceNumberId          = this.serviceNumberSaveObject.Id;
            this.callFlowParams.CurrentSelectedId = this.serviceNumberSaveObject.WorkprocessId;
            this.callFlowParams.NumberType        = this.serviceNumberSaveObject.NumberType;
            this.selectedSN                       = this.serviceNumberSaveObject.Number;
            this.saveISNAdvanced(data).then(_ => {
              if(savedata) this.handleCoupleCallFlow(data.selected, 5);
              else this.handleBackToList([this.serviceNumberSaveObject.Id]);
            }).catch(e => console.log('Error: ', e))
          }).catch(e => console.log('Error: ', e))
        } else if(type == 'internalservicenumber' && !this.isNewISN) { //ISN
          this.saveISNAdvanced(data).then(_ => {
            if(savedata) this.handleCoupleCallFlow(data.selected, 5);
            else this.handleBackToList([this.serviceNumberSaveObject.Id]);
          }).catch(e => console.log('Error: ', e))
        } else { //ExtSN, voipaccount, voipgroup, email
          this.saveBlackListData(data).then(_ => {
            this.saveAdvancedData(data).then(_ => {
              if(savedata) {
                switch(type) {
                  case 'voipaccount':
                    this.serviceNumberSaveObject.SaveParameters.VoIPAccountNumber = data.selected;
                    this.serviceNumberSaveObject.SaveParameters.SaveAction        = 2;
                    this.serviceNumberSaveObject.Id                               = this.selectedServiceNumberId;
                    this.saveData(this.serviceNumberSaveObject, type);
                    break;
                  case 'voipgroup':
                    this.serviceNumberSaveObject.SaveParameters.SaveAction        = 3;
                    this.serviceNumberSaveObject.SaveParameters.RoutinggroupName  = data.groupName;
                    this.serviceNumberSaveObject.SaveParameters.EmailAddress      = data.voiceEmail;
                    this.serviceNumberSaveObject.SaveParameters.Groupring         = data.distribution;
                    this.serviceNumberSaveObject.SaveParameters.LongestIdle       = !this.serviceNumberSaveObject.SaveParameters.Groupring;
                    this.serviceNumberSaveObject.SaveParameters.TakeOver          = data.takeover;
                    this.serviceNumberSaveObject.SaveParameters.VoIPAccounts      = data.selected.map(nr => ({ InternalNumber: nr, Description : ''}));
                    this.serviceNumberSaveObject.Id                               = this.selectedServiceNumberId;
                    this.saveData(this.serviceNumberSaveObject, type);
                    break;
                  case 'email':
                    this.serviceNumberSaveObject.SaveParameters.EmailAddress      = data.eMail;
                    this.serviceNumberSaveObject.SaveParameters.EmailSubject      = data.subject;
                    this.serviceNumberSaveObject.SaveParameters.EmailBody         = data.body;
                    this.serviceNumberSaveObject.SaveParameters.SaveAction        = 4;
                    this.serviceNumberSaveObject.Id                               = this.selectedServiceNumberId;
                    this.saveData(this.serviceNumberSaveObject, type);
                    break;
                  case 'couple':
                    let _SaveAction = 5;
                    this.handleCoupleCallFlow(data.selected, _SaveAction);
                    break;
                }
              } else {
                this.unOrderedList.forEach(item => {
                  if(item.Number === this.serviceNumberSaveObject.Number) {
                    let _tillUTC = new Date(this.serviceNumberSaveObject.Till).toUTCString();
                    item.Till = new Date(_tillUTC).toISOString();
                  }
                });
                this.handleBackToList([data.selectedSnId]);
              }
            });
          }).catch(error => {
            console.error('error:', error);
          });
        }
      },
      handleBackToList(id) {
        this.filterList();
        this.resetPagePart();
        this.closeConfigDialog();
        this.heiglightRow(id);
        this.showLoader(false);
      },
      closeConfigDialog() {
        this.configType              = 'voipaccount';
        this.configData              = {};
        this.advancedData            = {};
        this.extraData               = {};
        this.extraISNData            = {};
        this.blackListData           = [];
        this.selectedSN              = '';
        this.isNewISN                = false;
        this.serviceNumberSaveObject = null;
        this.showConfig              = false;
      },
      saveData(dataObj, type) { //Only for voipaccount/voipgroup/email
        IPCCCConfigurator.Request(this.selectedCustomerId, 'servicenumbers2', 'save', dataObj , -1)
        .then(result => {
          this.unOrderedList.forEach(item => {
            if(item.Number === result.Number) {
                item.Till = this.serviceNumberSaveObject.Till;
                item.SaveParameters = {...result.SaveParameters};
                item.Title          = type === 'voipaccount' ? result.SaveParameters.VoIPAccountNumber : type === 'voipgroup' ? result.SaveParameters.RoutinggroupName : result.SaveParameters.EmailAddress;
                item.Description    = result.Description;
                item.WorkprocessId  = result.WorkprocessId;
            }
          });
          this.handleBackToList([dataObj.Id]);
        })
        .catch(error => {
          console.error(error);
          this.closeConfigDialog();
          this.showLoader(false);
        });
      },
      deleteNumber() {
        let _dataObj = this.serviceNumberSaveObject;
        IPCCCConfigurator.Request(this.selectedCustomerId, 'servicenumbers2', 'delete', _dataObj , -1)
        .then(result => {
          this.removeNumberFromList(result.Id);
          this.heiglightRow([-1]);
          this.filterList();
          this.resetPagePart();
          this.closeConfigDialog();
          this.showLoader(false);
        })
        .catch(error => {
          console.error(error);
          this.showLoader(false);
        });
      },
      removeNumberFromList(id) {
        let _mutatedList = this.unOrderedList.filter(item => {
          return parseInt(item.Id) !== parseInt(id)
        });
        this.orderedList  = this.unOrderedList = _mutatedList;
      },
      handleExternalCall() {
        this.$store.commit('SET_SERVICENR_OBJ', {});
        this.externalCall = false;
        this.filterList();
      },
      stripSip(rawNr) {
        return rawNr?.indexOf('@') ? rawNr.split('@')[0] : rawNr;
      },
      formatDateTime: function (datetime, _Language) {
          let _datetime = null;
        if(datetime) {
            _datetime = convertISOToDateTime(datetime, _Language);
        }
        return _datetime;
      },
      heiglightRow(id) {
        let _lastVal = id[id.length-1];

        if(_lastVal != -1) {
          let _index = this.orderedList.findIndex(number => number.Id == _lastVal);
          this.currentPage = Math.floor(_index / this.listStep);
          this.listFrom    = this.currentPage * this.listStep;
          this.listTo      = this.listFrom + this.listStep;
          this.partList    = [...this.orderedList.slice(this.listFrom, this.listTo)];
          this.showTotals();
        }

        setTimeout(() => {
          let _rows    = this.$refs.theList.querySelectorAll("[data-id]"),
              _lastRow = null;

          [..._rows].forEach(row => {
            let _needle = parseInt(row.getAttribute('data-id'));
            if( id.indexOf(_needle) !== -1) {
              row.classList.add('list-content__row--mutated');
              _lastRow = row;
            } else {
              row.classList.remove('list-content__row--mutated');
            }
          });

          if(_lastRow)
            scrollTo(this.$refs.theList.parentElement, (_lastRow.offsetTop - _lastRow.offsetHeight), 300);
        })

      }
    },
    mounted() {
      this.selectedCustomerId = this.$store.getters.getCustomerInfo().selectedCustomerId;

      let _nrObj = this.$store.getters.getServiceNumberObj();
      if(Object.entries(_nrObj).length !== 0 && _nrObj.constructor === Object) {
        this.searchStr = _nrObj.selectedNumber;
        this.externalCall = true;
      }

      if(this.selectedCustomerId != -1)
        this.getData();
        this.getCostCenterList();

      this.$store.watch(this.$store.getters.getCustomerInfo, cObj => {
        this.showLoader(true);
        this.selectedCustomerId = cObj.selectedCustomerId;
        this.getData();
        this.getCostCenterList();
      });


    },
    beforeUnmount() {
      this.showConfig = false;
    }
  }
</script>

<style lang="scss" scoped>
  @use "@/scss/includes/flags";
  @use "@/scss/includes/status";
</style>
