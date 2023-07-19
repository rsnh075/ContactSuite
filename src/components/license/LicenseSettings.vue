<template>
  <div data-e2e="license-setting">
    <!-- DIALOG CONFIRM -->
    <div :class="['dialog__modal', {'dialog__modal--open' : showDialog}]">
      <div :class="['dialog__window', 'dialog__window--w500', {'dialog__window--open' : showDialog}]" id="dialog-window">
        <div class="dialog__window-header dialog__window-header--important dialog__window-header--transparent">
          <span>{{ $store.state.settings.license.deleteuserconformationheader }}</span>
        </div>
        <div class="dialog__window-body">
          <div class="grid-row">
            <p v-if="licenseDetail.Name" v-html="$store.state.settings.license.deleteuserconformationtext01 + '<strong>' +  licenseDetail.Name + '</strong>' +  $store.state.settings.license.deleteuserconformationtext02"></p>
          </div>
        </div>
        <div class="grid-unit--alpha dialog__window-footer dialog__window-footer--confirm">
          <a class="button-primary button-primary--important dialog__window-ok" @click="deleteLicense">{{ $store.state.settings.license.deletelicenselabel }}</a>
          <a class="button-primary dialog__window-cancel" @click="hideConfirm">{{ $store.state.settings.license.deletecancellabel }}</a>
        </div>
      </div>
    </div>
    <!-- LLICENSE LIST SCREEN -->
    <div class="list-wrapper">
      <div class="list-topbar">
        <div class="list-topbar__content">
          <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
            <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings.license.searchtxt" @keyup="filterList()">
          </div>
          <div class="typo-tabletitle">
            {{totalLicense + " " + $store.state.settings.license.licensecountlabel}}
          </div>
          <div class="grid--push">
            <div class="form-button__secondary form-button__secondary--add grid--push">
              <button @click="showLicense($event)" :data-licenseId="-1">{{ $store.state.settings.license.addlicenselabel }}</button>
            </div>
          </div>
        </div>
      </div>
      <div class="list-content-wrapper">
        <div class="list-content--back">
          <div class="list-content--header">
            <ExportListToXLSX
            :data="orderedList"
            :customBtnStyles="exportListBtnStyles"
            :customWrapperStyles="exportListWrapperStyles"
            />
            <div class="list-content__row--header">
              <span class="list-content__row-cell list-content__row-cell--25" @click="sortColumn('Name', $event)" data-sortorder="NONE" v-html="$store.state.settings.license.colheads[0]"></span>
              <span class="list-content__row-cell list-content__row-cell--75" v-html="$store.state.settings.license.colheads[1]"></span>
            </div>
          </div>
          <div class="list-content">
            <ol>
              <li v-for="(license, _key) in orderedList" class="list-content__row list-content__row--clickable" @click="showLicense($event)" :data-licenseId="license.LicenseId">
                <span class="list-content__row-cell list-content__row-cell--25" v-html="license.Name"></span>
                <span class="list-content__row-cell list-content__row-cell--75" v-html="license.ShortDescription"></span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
    <!---- LICENSE-DETAIL ---->
    <div :class="['detailscreen-wrapper', {'detailscreen-wrapper--visable' : screenStatus != 'list'}]">
      <div class="detailscreen" id="detailscreen">
        <a :class="['button-help', {'button-help--active' : showHelp}]" @click="displayHelp">?</a>
        <form @valid="saveLicense()" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn'}">
          <div class="grid-row">
            <div class="grid-unit--alpha">
              <span class="detailscreen__title">{{ licenseDetail.Name }}</span>
            </div>
          </div>
          <div class="grid-row">
            <div class="grid-unit--beta">
              <div class="form-textfield form-textfield--bground">
                <input type="text" name="license-name" id="license-name" :placeholder="$store.state.settings.license.detailnamelabel" v-model="licenseDetail.Name" data-validate="isNotEmpty" :data-message="$store.state.settings.forms.messagefirstname">
                <label for="license-name" class="form-label form-label--hidden">{{ $store.state.settings.license.detailnamelabel }}</label>
                <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.license.helptextname }}</div>
              </div>
            </div>
            <div class="grid-unit--beta">
              <div class="form-textfield form-textfield--bground">
                <input type="text" name="license-code" id="license-code" :placeholder="$store.state.settings.license.detailcodelabel" v-model="licenseDetail.ArticleCode" data-validate="isNotEmpty" :data-message="$store.state.settings.forms.messagearticlecode">
                <label for="license-code" class="form-label form-label--hidden">{{ $store.state.settings.license.detailcodelabel }}</label>
                <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.license.helptextcode }}</div>
              </div>
            </div>
          </div>
          <div class="grid-row">
            <div class="grid-unit--beta">
              <div class="form-selectfield form-selectfield--inline-bground">
                <label class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.license.detailthemelabel }}</label>
                <select id="license-theme" name="license-theme" v-model.sync="licenseDetail.Theme" data-validate="isNotNull" :data-message="$store.state.settings.forms.messagechoosetheme">
                  <option value="null" selected>{{ $store.state.settings.license.detailthemedefaulttext }}</option>
                  <option v-for="theme in themes" :value="theme.className">{{ theme.label }}</option>
                </select>
                <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.license.helptexttheme }}</div>
              </div>
            </div>
            <div class="grid-unit--beta">
              <div class="form-textfield form-textfield--bground">
                <input type="text" name="datepicker" id="datepicker" :placeholder="$store.state.settings.license.detailvallidtolabel" v-model="licenseDetail.ValidTill" data-validate="isNotNull" :data-message="$store.state.settings.forms.messagevalidtill">
                <label for="datepicker" class="form-label form-label--hidden">{{ $store.state.settings.license.detailvallidtolabel }}</label>
                <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.license.helptextvalidto }}</div>
              </div>
            </div>
          </div>
          <div class="grid-row">
            <div class="grid-unit--alpha">
              <div class="form-checkbox form-checkbox--large">
                <input type="checkbox" name="is-internal" id="is-internal" v-model="licenseDetail.Internal">
                <label for="is-internal">{{ $store.state.settings.license.detailinternallabel }}</label>
                <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.license.helptextinternal }}</div>
              </div>
            </div>
            <div class="grid-unit--alpha">
              <div class="form-textarea form-textarea--description form-textarea--description-short">
                <label>{{ $store.state.settings.license.detailshortdesclabel }}</label>
                <textarea v-model="licenseDetail.ShortDescription" maxlength="180"></textarea>
                <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.license.helptextshortdesc }}</div>
              </div>
            </div>
            <div class="grid-unit--alpha">
              <div class="form-textarea form-textarea--description form-textarea--description-long">
                <label>{{ $store.state.settings.license.detaildesclabel }}</label>
                <textarea v-model="licenseDetail.LongDescription" maxlength="550"></textarea>
                <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.license.helptextlongdesc }}</div>
              </div>
            </div>
          </div>
          <div class="grid-row">
            <div class="grid-unit--alpha">
              <label class="form-label--list">{{ $store.state.settings.license.detailassetslabel }}</label>
              <ol class="list-asset-wrapper">
                <li class="list-asset-line form-checkbox" v-for="(row, index) in licenseDetail.Assets" :data-assetid="row.AssetId">
                  <input type="checkbox" :name="row.AssetId" :id="row.AssetId" :checked="row.LicenseId == licenseDetail.LicenseId" @change="setAssetToLicense($event)" :data-licenseId="row.LicenseId" :data-index="index">
                  <label :for="row.AssetId">{{ row.Description }}</label>
                </li>
              </ol>
            </div>
            <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.license.helptextassets }}</div>
          </div>
        </form>
        <div class="detailscreen-footer detailscreen-footer--inside">
          <span>
            <a v-if="screenStatus == 'detail-show'" class="button-primary button-primary--delete" @click="showConfirm">{{ $store.state.settings.license.btndeletelabel }}</a>
          </span>
          <span class="grid--push">
            <a v-show="screenStatus == 'detail-show'" class="button-primary button-primary--gray" @click="backToList">{{ $store.state.settings.license.btncancellabel }}</a>
            <a v-show="screenStatus == 'detail-show'" class="button-primary button-primary js-submitbtn">{{ $store.state.settings.license.btnsavelabel }}</a>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { ValidateDir }          from './../../directives/validate';
import { scrollTo }             from './../../use/helperFunctions';
import {
        ISOdateTimetoDate,
        saveFormatDate,
        pikaDayToDDMMYYYY
        }                        from './../../use/dateFunctions';
import PikaDay                  from 'pikaday';
import { dynamicSort }          from '../../use/sortFunctions';
import { IPCCCConfigurator } from './../../ipccc/js/configurator';
import ExportListToXLSX         from '../uielements/ExportListToXLSX.vue';

export default {
   name: 'LicenseSettings',
   data: () => {
        return {
            customerId           : -1,
            searchStr            : '',
            sortSetting          : {},
            totalLicense         : 0,
            unOrderedList        : [],
            orderedList          : [],
            licenseDetail        : {},
            isNewLicense         : false,
            screenStatus         : 'list',
            showHelp             : false,
            validDate            : '',
            datePicker           : null,
            themes: [
                {
                "className" : "redTheme",
                "label"     : "Red Theme"
                }, {
                "className" : "yellowTheme",
                "label"     : "Yellow Theme"
                }, {
                "className" : "orangeTheme",
                "label"     : "Orange Theme"
                }, {
                "className" : "blueTheme",
                "label"     : "Blue Theme"
                }, {
                "className" : "greenTheme",
                "label"     : "Green Theme"
                }, {
                "className" : "purpleTheme",
                "label"     : "Purple Theme"
                }, {
                "className" : "bronseTheme",
                "label"     : "Bronse Theme"
                }, {
                "className" : "pinkTheme",
                "label"     : "Pink Theme"
                }
            ],
            showDialog           : false,
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
    inject: ["showLoader"],
    components: {
        ExportListToXLSX
    },
    directives: {
        Validate: ValidateDir
    },
    methods: {
        filterList() {
            this.orderedList    = this.filterListOnString(this.unOrderedList, this.searchStr.toLowerCase());
            this.totalCustomers = this.orderedList.length;
            this.sortColumn();
        },
        filterListOnString(list, str) {
            if(str != '') {
                let _rawList = [...list],
                    _keys;
                return _rawList.filter(item => {
                _keys = item['Name'].toLowerCase().startsWith(str);
                return _keys;
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
                this.setHighlightedRow(-2);
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
                this.orderedList    = this.filterListOnString(this.unOrderedList, this.searchStr.toLowerCase());
                this.totalCustomers = this.orderedList.length;
                if(e != null)
                    _t.setAttribute('data-sortOrder', 'NONE');
                break;
            }
        },
        showLicense(evt) {
            this.showLoader(true);
            let _id               = evt.currentTarget.getAttribute('data-licenseId'),
                _dataOperation    = (_id == -1) ? 'readnew' : 'readone';

            this.isNewLicense     = _id == -1;

            IPCCCConfigurator.Request(this.customerId, 'license', _dataOperation, null, _id).then(response => {
                this.licenseDetail           = response;
                this.licenseDetail.ValidTill = ISOdateTimetoDate(new Date(this.licenseDetail.ValidTill));
                if(_id == -1) this.licenseDetail.Theme = "null";
                this.screenStatus            = 'detail-show';
                this.showLoader(false);
            }).catch(error => {
                console.error(error);
                this.showLoader(false);
            });
        },
        setAssetToLicense(evt) {
            let _target = evt.target,
                _lid    = _target.getAttribute('data-licenseId'),
                _index  = _target.getAttribute('data-index');

            if(_lid != this.licenseDetail.LicenseId) {
                this.licenseDetail.Assets[_index].LicenseId = this.licenseDetail.LicenseId;
            } else {
                this.licenseDetail.Assets[_index].LicenseId = (this.isNewLicense) ? -2 : -1;
            }
        },
        saveLicense() {
            this.showLoader(true);
            let _objectToSave = JSON.parse(JSON.stringify(this.licenseDetail)),
            _lid = _objectToSave.LicenseId;

            _objectToSave.ValidTill = saveFormatDate(_objectToSave.ValidTill);
            //_objectToSave.Assets    = _objectToSave.Assets.filter(asset => asset.LicenseId == _lid)

            IPCCCConfigurator.Request(this.customerId, 'license', 'save', _objectToSave, _lid)
            .then(response => {
                this.isNewLicense = false;
                this.updateLicenseList(response);
            })
            .catch(error => {
                console.error(error);
            });
        },
        deleteLicense() {
            this.showLoader(true);
            let _lid = this.licenseDetail.LicenseId;
            this.licenseDetail.ValidTill = saveFormatDate(this.licenseDetail.ValidTill);
            this.licenseDetail.Assets    = this.licenseDetail.Assets.filter(asset => asset.LicenseId == _lid);
            IPCCCConfigurator.Request(this.customerId, 'license', 'delete', this.licenseDetail, -1).then(response => {
                let _licenseToDeleteIndex;
                this.totalLicense         = 0;
                this.unOrderedList.forEach((license, index) => {
                    if(license.LicenseId == response.LicenseId) {
                    _licenseToDeleteIndex = index;
                    }
                });
                this.unOrderedList.splice(_licenseToDeleteIndex, 1);
                this.orderedList        = [...this.unOrderedList];
                this.totalLicense       = this.orderedList.length;
                this.filterList();
                this.sortColumn();
                this.hideConfirm();
                this.backToList();
                this.showLoader(false);
            }).catch(error => {
                console.error(error);
            });
        },
        showConfirm() {
            this.showDialog = true;
        },
        hideConfirm() {
            this.showDialog = false;
        },
        backToList() {
            this.resetDisplay();
            this.screenStatus  = 'list';
            this.showLoader(false);
        },
        displayHelp() {
            this.showHelp = !this.showHelp;
        },
        shakeIt() {
            let _elm = document.querySelector("#detailscreen");
            _elm.classList.add('detailscreen--shake');
            setTimeout(() => {
                _elm.classList.remove('detailscreen--shake');
            }, 1000);
        },
        resetDisplay() {
            this.licenseDetail = {};
            document.querySelectorAll('span[data-name="validCheck"]').forEach(el => el.style.display = 'none');
            document.querySelectorAll('span[data-name="validMessage"]').forEach(el => el.style.display = 'none');
        },
        setDatePicker() {
            this.datePicker = new PikaDay({
                field: document.getElementById('datepicker'),
                format: 'DD-MM-YYYY',
                minDate: new Date(),
                i18n: this.$store.state.settings.datepicker,
                onSelect: () => {
                    // this.validDate = this.datePicker.toString();
                    this.validDate = pikaDayToDDMMYYYY(this.datePicker);
                    this.licenseDetail.ValidTill = this.validDate;
                },
            })
        },
        updateLicenseList(licenseData) {
            let _licenseToUpdateIndex = -1;
            this.unOrderedList.map((license, index) => {
                if(license.LicenseId == licenseData.LicenseId) {
                    _licenseToUpdateIndex = index;
                }
            });

            if(_licenseToUpdateIndex != -1) {
                let _objToUpdate = this.unOrderedList[_licenseToUpdateIndex];
                _objToUpdate.Name             = licenseData.Name;
                _objToUpdate.ShortDescription = licenseData.ShortDescription;
            } else {
                let _objectToAdd = {
                    'LicenseId'        : licenseData.LicenseId,
                    'Name'             : licenseData.Name,
                    'ShortDescription' : licenseData.ShortDescription

                };
                this.unOrderedList.push(_objectToAdd);
            }

            this.orderedList        = [...this.unOrderedList];
            this.totalLicense       = this.orderedList.length;

            this.filterList();
            this.sortColumn();
            this.setHighlightedRow(licenseData.LicenseId);
            this.backToList();
        },
        setHighlightedRow(id) {
            let _wrapper = null;
            document.querySelectorAll('[data-LicenseId]').forEach(el => {
                _wrapper = el.parentElement.parentElement;
                if (el.getAttribute('data-LicenseId') == id) {
                    el.classList.add('list-content__row--mutated');
                    scrollTo(_wrapper, (el.offsetTop - el.offsetHeight), 300);
                } else
                    el.classList.remove('list-content__row--mutated');
            });
            if(id == -2 && _wrapper !== null) {
                scrollTo(_wrapper, 0, 200);
            }
        },
        init() {
            IPCCCConfigurator.Request(this.customerId, 'license', 'list', null, -1)
            .then(response => {
                this.totalLicense     = 0;
                this.unOrderedList    = [...response];
                this.orderedList      = [...this.unOrderedList];
                this.totalLicense     = this.orderedList.length;
                this.showLoader(false);
            })
            .catch(error => {
                console.error(error);
                this.showLoader(false);
            });
        },
    },
    mounted() {
        this.setDatePicker();

        this.customerId     = this.$store.getters.getCustomerInfo().selectedCustomerId;

        if(this.customerId !== -1) {
            this.init();
        }

        this.storeWatch = this.$store.watch(this.$store.getters.getCustomerInfo, cObj => {
            this.showLoader(true);
            if(this.customerId !== -1) {
            this.totalLicense     = 0;
            this.unOrderedList    = this.orderedList      = [];
            this.backToList();
            }
            this.customerId = cObj.selectedCustomerId;
            this.init();
        });
    },
    beforeUnmount() {
        this.storeWatch();
    }
}
</script>
