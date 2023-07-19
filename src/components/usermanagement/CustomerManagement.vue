<template>
    <div data-e2e="customer-management">
        <BlockContentModal
        :status  = "showDontChange"
        :content = $store.state.settings.dontchange.bodycontent
        />

        <!-- DIALOG CONFIRM -->
        <Confirm-Box
        :status="showDialog"
        :header="$store.state.settings.usermanagement.deleteconformationheader"
        :bodyContent="'<p>' + $store.state.settings.usermanagement.deleteconformationtext01 + '<strong>' +  detailCustomer.Name + '</strong> ' +  $store.state.settings.usermanagement.deleteconformationtext02 + '<br>' + '<p>'"
        :acceptLabel="$store.state.settings.usermanagement.deletecustomerlabel"
        :cancelLabel="$store.state.settings.usermanagement.cancellabel"
        @accepted="deleteCustomer"
        @canceled="hideConfirm"
        />

        <!-- CUSTOMER LIST SCREEN -->
        <div class="list-wrapper">
            <div class="list-topbar">
                <div class="list-topbar__content">
                    <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
                        <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings.usermanagement.searchtxt" @keyup="filterList()">
                    </div>
                    <div class="typo-tabletitle">
                        {{totalCustomers + " " + $store.state.settings.usermanagement.customercountlabel}}
                    </div>
                    <div class="grid--push">
                        <div class="form-button__secondary form-button__secondary--add grid--push">
                            <button v-if="createNewCustomer" @click="addCustomer()">{{ $store.state.settings.usermanagement.addcustomerlabel }}</button>
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
                            <span :class="['list-content__row-cell', tabelColumnWidth]" @click="sortColumn('Name', $event)"         data-sortorder="NONE" v-html="$store.state.settings.usermanagement.colheads[0]"></span>
                            <span :class="['list-content__row-cell', tabelColumnWidth]" @click="sortColumn('Code', $event)"         data-sortorder="NONE" v-html="$store.state.settings.usermanagement.colheads[1]"></span>
                            <!-- <span :class="['list-content__row-cell', tabelColumnWidth]" @click="sortColumn('ExternalId', $event)"   data-sortorder="NONE" v-html="$store.state.settings.usermanagement.colheads[2]"></span> -->
                            <span :class="['list-content__row-cell', tabelColumnWidth]" @click="sortColumn('Location', $event)"   data-sortorder="NONE" v-html="$store.state.settings.usermanagement.colheads[6]" v-if="isMassxess"></span>
                            <span :class="['list-content__row-cell', tabelColumnWidth]" @click="sortColumn('DebtorNumber', $event)" data-sortorder="NONE" v-html="$store.state.settings.usermanagement.colheads[3]" v-if="isMassxess"></span>
                            <span :class="['list-content__row-cell', tabelColumnWidth]" @click="sortColumn('ResellerName', $event)" data-sortorder="NONE" v-html="$store.state.settings.usermanagement.colheads[4]"></span>
                            <span :class="['list-content__row-cell', tabelColumnWidth]" @click="sortColumn('CreateDate', $event)"   data-sortorder="NONE" v-html="$store.state.settings.usermanagement.colheads[5]"></span>
                        </div>
                    </div>
                    <div class="list-content" ref="scroller">
                        <ol>
                            <li v-for="(customer, _key) in orderedList" :key="customer.CustomerId" class="list-content__row list-content__row--clickable" @click="showCustomer($event)" :data-customerId="customer.CustomerId" :data-resellerId="customer.ResellerId" :data-usecasa="customer.UseCasa">
                                <span :class="['list-content__row-cell', tabelColumnWidth]" v-html="customer.Name"></span>
                                <span :class="['list-content__row-cell', tabelColumnWidth]" v-html="customer.Code"></span>
                                <!-- <span :class="['list-content__row-cell', tabelColumnWidth]" v-html="customer.ExternalId"></span> -->
                                <span :class="['list-content__row-cell', tabelColumnWidth]" v-html="setLocAndVer(customer.Location, customer.Version)" v-if="isMassxess"></span>
                                <span :class="['list-content__row-cell', tabelColumnWidth]" v-html="customer.DebtorNumber" v-if="isMassxess"></span>
                                <span :class="['list-content__row-cell', tabelColumnWidth]" v-html="customer.ResellerName"></span>
                                <span :class="['list-content__row-cell', tabelColumnWidth]" v-html="checkDate(customer.CreateDate)"></span>
                                <!--
                                <span class="list-content__row-cell list-content__row-cell--icons">
                                <a class="button__icon">&#xF1D9</a>
                                </span>
                                -->
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>

        <!-- CUSTOMER DETAIL SCREEN -->
        <div :class="['detailscreen-wrapper', {'detailscreen-wrapper--visable' : screenStatus != 'list'}]">
            <div class="detailscreen" id="detailscreen">
                <a v-if="screenStatus != 'detail-show'" :class="['button-help', {'button-help--active' : showHelp}]" @click="displayHelp">?</a>
                <!-- <a v-if="screenStatus == 'detail-show'" class="button__icon button__icon--top-right-corner" @click="editCustomer($event)">&#xF3EB;</a> -->
                <form @valid="saveCustomer()" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn'}">
                    <div class="grid-row">
                        <div class="grid-unit--gamma--double">
                        <div v-show="screenStatus != 'detail-show'" class="form-textfield form-textfield--bground">
                            <input type="text" name="customer-name" id="customer-name" :placeholder="$store.state.settings.usermanagement.formnamelabel" v-model="detailCustomer.Name" data-validate="isNotEmpty" :data-message="$store.state.settings.forms.messagecustomername" @blur="createCustomerCode">
                            <label for="customer-name" class="form-label form-label--hidden">{{ $store.state.settings.usermanagement.formnamelabel }}</label>
                            <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && screenStatus != 'detail-show')}]">{{ $store.state.settings.usermanagement.helptextcustomername }}</div>
                        </div>
                        <span v-if="screenStatus == 'detail-show'" class="detailscreen__title">{{ detailCustomer.Name }}</span>
                        </div>
                        <div v-if="screenStatus == 'detail-show' || screenStatus == 'detail-edit'" class="grid-unit--gamma">
                        <span class="detailscreen__title detailscreen__title--right detailscreen__title--small">#{{ detailCustomer.CustomerId }}</span>
                        </div>
                    </div>
                    <div class="grid-row">
                        <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.usermanagement.setlabelgeneral }}</h2>
                    </div>
                    <div class="grid-row">
                        <div class="grid-unit--beta">
                        <div class="form-textfield form-textfield--bground">
                            <input :readonly="screenStatus == 'detail-show'" type="text" name="customer-code" id="customer-code" :placeholder="$store.state.settings.usermanagement.formcodelabel" v-model="detailCustomer.Code" data-validate="isCustomerCode" :data-message="$store.state.settings.forms.messagecustomercode">
                            <label for="customer-code" class="form-label form-label--hidden">{{ $store.state.settings.usermanagement.formcodelabel }}</label>
                            <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && screenStatus != 'detail-show')}]">{{ $store.state.settings.usermanagement.helptextcustomercode }}</div>
                        </div>
                        </div>
                        <div class="grid-unit--beta">
                        <div v-if="selectedCustomerId == 1" class="form-textfield form-textfield--bground">
                            <input :readonly="screenStatus == 'detail-show'" type="number" name="customer-debitornr" id="customer-debitornr" :placeholder="$store.state.settings.usermanagement.formdebitornrlabel" v-model="detailCustomer.DebtorNumber" @blur="checkDebitor">
                            <label for="customer-debitornr" class="form-label form-label--hidden">{{ $store.state.settings.usermanagement.formdebitornrlabel }}</label>
                            <div class="form-textfield__feedback-inline">{{ debitorName }}</div>
                            <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && screenStatus != 'detail-show')}]">{{ $store.state.settings.usermanagement.helptextdebitornr }}</div>
                        </div>
                        </div>
                    </div>
                    <div class="grid-row">
                        <div class="grid-unit--beta">
                        <div class="form-textfield form-textfield--bground">
                            <input :readonly="screenStatus == 'detail-show'" type="text" name="crm-id" id="crm-id" :placeholder="$store.state.settings.usermanagement.formcrmidlabel" v-model="detailCustomer.ExternalId">
                            <label for="crm-id" class="form-label form-label--hidden">{{ $store.state.settings.usermanagement.formcrmidlabel }}</label>
                            <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && screenStatus != 'detail-show')}]">{{ $store.state.settings.usermanagement.helptextcrmnr }}</div>
                        </div>
                        </div>
                        <div class="grid-unit--beta">
                        <div :class="['form-selectfield', 'form-selectfield--inline-bground', {'form-selectfield--disabled' : screenStatus == 'detail-show'}]" v-if="selectedCustomerId == 1">
                            <label class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.usermanagement.formresellernamelabel }}</label>
                            <select :disabled="screenStatus == 'detail-show'" v-model="detailCustomer.ResellerId" @change="updateResellerId">
                            <option v-for="reseller in resellerList" :value="reseller.CustomerId">{{ reseller.Name }}</option>
                            </select>
                            <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && screenStatus != 'detail-show')}]">{{ $store.state.settings.usermanagement.helptextreseller }}</div>
                        </div>
                        </div>
                    </div>

                    <div class="grid-row">
                        <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.usermanagement.setlabeltelephony }}</h2>
                    </div>

                    <div class="grid-row">
                        <div class="grid-unit--beta">
                        <div class="typo-input-label typo-input-label--select-search-fly-out">{{ $store.state.settings.usermanagement.formselectidentity }}</div>
                        <SelectSearchFlyOut
                            :options="identityList"
                            :selectedvalue="callOutNumber"
                            :defaultlabel="$store.state.settings.usermanagement.formselectdefault"
                            labelproperty="Label"
                            valueproperty="Number"
                            :disabled="screenStatus == 'detail-show'"
                            @changed="setOutboundIdentity"
                        />
                        </div>
                        <div class="grid-unit--beta">
                        <label class="typo-input-label typo-input-label--h20">{{ $store.state.settings.usermanagement.formpbxtoestelnummerlengtelbl }}</label>
                        <RangeNumStepper
                            :minvalue="minVal"
                            :maxvalue="maxVal"
                            :inputvalue="detailCustomer.PBXToestelNummerLengte"
                            :inputdisabled="screenStatus == 'detail-show'"
                            @valuechanged="setPBXToestelNummerLengte"
                        />
                        </div>
                    </div>

                    <div class="grid-row" v-if="loggedInCustomerIsReseller">
                        <div class="grid-unit--beta">
                        <label class="typo-input-label typo-input-label--h20">{{ $store.state.settings.usermanagement.pbxrecordinglbl }}</label>
                        <div :class="['form-checkbox', 'form-checkbox--large', {'form-checkbox--disabled' : screenStatus == 'detail-show'}]">
                            <input :disabled="screenStatus == 'detail-show'" type="checkbox" name="pbxrecordinglbl" id="pbxrecordinglbl" v-model="detailCustomer.PBXRecording">
                            <label for="pbxrecordinglbl">{{ $store.state.settings.usermanagement.formoptionsvaluelbl }}</label>
                        </div>
                        </div>
                        <div class="grid-unit--beta">
                        <label class="typo-input-label typo-input-label--h20">{{ $store.state.settings.usermanagement.pbxrecordingneedsconsentlbl }}</label>
                        <div :class="['form-checkbox', 'form-checkbox--large', {'form-checkbox--disabled' : screenStatus == 'detail-show'}]">
                            <input v-show="detailCustomer.PBXRecording" :disabled="screenStatus == 'detail-show'" type="checkbox" name="pbxrecordingneedsconsentlbl" id="pbxrecordingneedsconsentlbl" v-model="detailCustomer.PBXRecordingNeedsConsent">
                            <input v-if="!detailCustomer.PBXRecording" disabled type="checkbox" value="false">
                            <label for="pbxrecordingneedsconsentlbl">{{ $store.state.settings.usermanagement.formoptionsvaluelbl }}</label>
                        </div>
                        </div>
                    </div>

                    <div class="grid-row" v-if="loggedInCustomerIsReseller">
                        <div class="grid-unit--beta">
                        <label class="typo-input-label typo-input-label--h20">{{ $store.state.settings.usermanagement.pbxqualitymonitoringlbl }}</label>
                        <div :class="['form-checkbox', 'form-checkbox--large', {'form-checkbox--disabled' : screenStatus == 'detail-show'}]">
                            <input :disabled="screenStatus == 'detail-show'" type="checkbox" name="pbxqualitymonitoringlbl" id="pbxqualitymonitoringlbl" v-model="detailCustomer.PBXQualityMonitoring">
                            <label for="pbxqualitymonitoringlbl">{{ $store.state.settings.usermanagement.formoptionsvaluelbl }}</label>
                        </div>
                        </div>
                        <div class="grid-unit--beta">
                        <label class="typo-input-label typo-input-label--h20">{{ $store.state.settings.usermanagement.showcallerwhenconsultinglbl }}</label>
                        <div :class="['form-checkbox', 'form-checkbox--large', {'form-checkbox--disabled' : screenStatus == 'detail-show'}]">
                            <input :disabled="screenStatus == 'detail-show'" type="checkbox" name="showcallerwhenconsultinglbl" id="showcallerwhenconsultinglbl" v-model="detailCustomer.ShowCallerWhenConsulting">
                            <label for="showcallerwhenconsultinglbl">{{ $store.state.settings.usermanagement.formoptionsvaluelbl }}</label>
                        </div>
                        </div>
                    </div>

                    <div class="grid-row">
                        <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.usermanagement.setlabelsession }}</h2>
                    </div>
                    <div class="grid-row">
                        <div class="grid-unit--beta">
                        <div :class="['form-range-field', {'form-range-field--disabled' : screenStatus == 'detail-show'}]">
                            <div class="form-range-field__track" ref="sessionHold"></div>
                            <div class="form-range-field__track--active" ref="currentISTValueLabel" :data-value="toClockIST(sessionTime)"></div>
                            <label class="form-range-field__output" ref="sessionHoldValue">
                            {{ $store.state.settings.usermanagement.sessionholdlabel }}: <output name="sessionHoldValue" id="sessionHoldValue">{{ toClockIST(sessionTime) }}</output> {{ $store.state.settings.usermanagement.sessionholdhhmmlabel }}
                            </label>
                            <span class="form-range-field__inline-values--start">{{ toClockIST(minSessionHold) }}</span>
                            <input type="range" :disabled="screenStatus == 'detail-show'" name="sessionHold" :min="0" :max="98" :step="sessionHoldStep" @change="hideISTLabel" @input="setSessionHoldTime" ref="sessionSlider">
                            <span class="form-range-field__inline-values--end">{{ toClockIST(maxSessionHold) }}</span>
                        </div>
                        </div>
                        <div class="grid-unit--beta">
                        <div :class="['form-checkbox', 'form-checkbox--large', 'form-checkbox--inline-range', {'form-checkbox--disabled' : screenStatus == 'detail-show'}]">
                            <input :disabled="screenStatus == 'detail-show'" type="checkbox" name="forcedlogout" id="forcedlogout" v-model="detailCustomer.ShowLogoutWarning">
                            <label for="forcedlogout">{{ $store.state.settings.usermanagement.forcedlogoutlabel }}</label>
                            <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && screenStatus != 'detail-show')}]">{{ $store.state.settings.usermanagement.helptextforcedlogout }}</div>
                        </div>
                        </div>
                    </div>
                    <div class="grid-row">
                        <div class="grid-unit--beta">
                        <div :class="['form-range-field', {'form-range-field--disabled' : screenStatus == 'detail-show'}]">
                            <div class="form-range-field__track" ref="keepInQ"></div>
                            <div class="form-range-field__track--active" ref="currentKIQValueLabel" :data-value="toClockKIQ(keepInQTime)"></div>
                            <label class="form-range-field__output" ref="keepInQValue">
                            {{ $store.state.settings.usermanagement.keepinqlabel }}: <output name="keepInQValue" id="keepInQValue">{{ toClockKIQ(keepInQTime) }}</output> {{ $store.state.settings.usermanagement.keepinqmmsslabel }}
                            </label>
                            <span class="form-range-field__inline-values--start">{{ toClockKIQ(minKeepInQ) }}</span>
                            <input type="range" :disabled="screenStatus == 'detail-show'" name="keepInQ" :min="1" :max="30" :step="keepInQStep" @change="hideKIQLabel" @input="setKeepInQTime" ref="keepInQSlider">
                            <span class="form-range-field__inline-values--end">{{ toClockKIQ(maxKeepInQ) }}</span>
                        </div>
                        </div>
                        <div class="grid-unit--beta">
                        <div class="form-textfield form-textfield--bground form-textfield--normal-form">
                            <input :readonly="screenStatus == 'detail-show'" type="text" v-model="notAvailTime" @keydown="checkNotAvailTime($event)" ref="notAvailTimeInput" placeholder="00:00:00">
                            <label class="form-label form-label--hidden">{{ $store.state.settings.usermanagement.notavaillabel }}</label>
                        </div>
                        </div>
                    </div>
                    <div v-if="selectedCustomerId == 1" class="grid-row">
                        <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.usermanagement.setlabelextra }}</h2>
                    </div>
                    <div v-if="selectedCustomerId == 1" class="grid-row">
                        <div class="grid-unit--beta">
                        <div :class="['form-checkbox', 'form-checkbox--large', {'form-checkbox--disabled' : screenStatus == 'detail-show'}]">
                            <input :disabled="screenStatus == 'detail-show'" type="checkbox" name="is-reseller" id="is-reseller" v-model="detailCustomer.IsReseller">
                            <label for="is-reseller">{{ $store.state.settings.usermanagement.isresellerlabel }}</label>
                            <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && screenStatus != 'detail-show')}]">{{ $store.state.settings.usermanagement.helptextisreseller }}</div>
                        </div>
                        </div>
                        <div class="grid-unit--beta">
                        <div v-if="$store.getters.getCustomerInfo().customerId" :class="['form-selectfield', 'form-selectfield--inline-bground', {'form-selectfield--disabled' : screenStatus == 'detail-show'}]">
                            <label class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.usermanagement.switchbatchnumberlabel }}</label>
                            <select :disabled="screenStatus == 'detail-show'" v-model="detailCustomer.SwitchBatchNumber" data-validate="isNotNegative" :data-message="$store.state.settings.forms.messageswitchbatch">
                            <option value="-1" selected>{{ $store.state.settings.usermanagement.switchbatchnumberdefaultopt }}</option>
                            <option v-for="switchbatch in switchBatchList" :value="switchbatch.Id" :key="switchbatch.Id">{{ switchbatch.Name }}</option>
                            </select>
                        </div>
                        </div>
                    </div>
                    <div class="grid-row">
                        <div class="grid-unit--alpha">
                            <div class="list-number-header list-number-header--comp-scrollbar">
                                <span class="list-number-header__field list-number-header__field--60width">{{ $store.state.settings.usermanagement.collheads[0] }}</span>
                                <button type="button" class="list-number-header__button--add" @click="addPersonalMessage()">{{ $store.state.settings.usermanagement.addpersonalmessage }}</button>
                            </div>
                            <ul class="list-number-wrapper">
                                <li v-for="(msg, index) in userStatusTextList" class="list-number-line list-number-line--nohandle" :key="index">
                                    <input type="text" class="list-number-line__field list-number-line__field--85width" v-model="msg.msg" :disabled="!msg.iseditable" data-validate="isNotEmpty" :data-message="$store.state.settings.usermanagement.validatepersonalmessage">
                                    <span class="list-number--icon">
                                        <a :class="['button__icon button__icon--edit', {'button__icon--active' : msg.iseditable}]" @click="editPersonalMessage(index)">&#xF3EB;</a>
                                        <a class="button__icon button__icon--delete" @click="deletePersonalMessage(index)">&#xF1C0;</a>
                                    </span>
                                </li>
                            </ul>
                            <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && screenStatus != 'detail-show')}]">{{ $store.state.settings.usermanagement.helptextpersonalmessage }}</div>
                        </div>
                    </div>
                </form>
                <div class="detailscreen-footer detailscreen-footer--inside">
                <span>
                    <a v-if="screenStatus == 'detail-edit'" class="button-primary button-primary--delete" @click="showConfirm">{{ $store.state.settings.usermanagement.deletecustomerlabel }}</a>
                </span>
                <span class="grid--push">
                    <a v-if="screenStatus == 'detail-edit'" class="button-primary button-primary--gray" @click="backToList">{{ $store.state.settings.usermanagement.cancellabel }}</a>
                    <a v-else class="button-primary button-primary--gray" @click="backToList">{{ $store.state.settings.usermanagement.backlabel }}</a>
                    <a v-show="screenStatus == 'detail-edit' || screenStatus == 'detail-new'" class="button-primary js-submitbtn">{{ $store.state.settings.usermanagement.savecustomerlabel }}</a>
                </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

  import { IPCCCData }      from '../../ipccc/js/data';
  import BlockContentModal  from './../dialogs/Block-content-modal.vue';
  import ConfirmBox         from './../dialogs/Confirm-box.vue';
  import { ValidateDir }    from './../../directives/validate';
  import {
          timeToClockHHMM,
          ISOdateTimetoDate,
          secondsToTimeHHMMSS,
          secondsToTimeMMSS
         }                  from './../../use/dateFunctions';
  import * as Mask          from './../../use/mask';
  import {
          scrollTo,
          convertToUrlFriendly
         }                  from './../../use/helperFunctions';
  import SelectSearchFlyOut from './../uielements/SelectSearchFlyOut.vue';
  import RangeNumStepper    from './../uielements/RangeNumStepper.vue';
  import { dynamicSort }    from '../../use/sortFunctions';
  import { IPCCCConfigurator } from './../../ipccc/js/configurator';
  import BoxProps, { ModalType } from '../../types/BoxProps';
  import ExportListToXLSX  from '../uielements/ExportListToXLSX.vue';

  export default {
    name: 'CustomerManagement',
    data() {
      return {
        selectedCustomerId   : -1,
        searchStr            : '',
        sortSetting          : {},
        totalCustomers       : 0,
        unOrderedList        : [],
        orderedList          : [],
        createNewCustomer    : true,
        screenStatus         : 'list',
        detailCustomer       : {},
        debitorName          : '',
        showHelp             : false,
        showDialog           : false,
        storeWatch           : null,

        sessionTime          : '',
        minSessionHold       : 2,
        maxSessionHold       : 1440,
        sessionHoldStep      : 1,
        trackISTW            : 0,
        trackISTLabel         : null,

        keepInQTime          : '',
        minKeepInQ           : 60,
        maxKeepInQ           : 1800,
        keepInQStep          : 1,
        trackKIQW            : 0,
        trackKIQLabel        : null,

        notAvailTime         : '',
        notAvailTimeInput    : null,

        identityList         : [],
        minVal               : 3,
        maxVal               : 7,
        switchBatchList      : [],

        userStatusTextList   : [],
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
    inject: ['showLoader', 'showModalDialog'],
    directives: {
      Validate: ValidateDir
    },
    components: {
      BlockContentModal,
      'Confirm-Box'    : ConfirmBox,
      SelectSearchFlyOut,
      RangeNumStepper,
      ExportListToXLSX
    },
    computed: {
      isMassxess() {
        return this.$store.getters.getCustomerInfo().selectedCustomerId == 1;
      },
      tabelColumnWidth() {
        return (this.$store.getters.getCustomerInfo().selectedCustomerId == 1) ? 'list-content__row-cell--16' : 'list-content__row-cell--20';
      },
      resellerList() {
        return this.unOrderedList.filter(customer => customer.IsReseller);
      },
      loggedInCustomerIsReseller() {
        return this.resellerList.filter(cust => cust.CustomerId == this.$store.getters.getCustomerInfo().customerId && cust.IsReseller == true).length > 0;
      },
      resellerList() {
        return this.unOrderedList.filter(customer => customer.IsReseller);
      },
      showDontChange() {
        return this.$store.getters.getCustomerInfo().selectedCustomerUsesCasa == false;
      },
      callOutNumber() {
        return (this.detailCustomer.CallOutNumber && this.detailCustomer.CallOutNumber.length > 0) ? this.detailCustomer.CallOutNumber : null;
      }
    },
    methods: {
      toClockIST(min) {
        return (min < this.maxSessionHold) ? timeToClockHHMM(min*60*1000) : '24:00';
      },
      toClockKIQ(sec) {
        return (sec < this.maxKeepInQ) ? secondsToTimeMMSS(sec) : '30:00';
      },
      updateSessionBar(currentPos) {
        let _perc                              = currentPos/100,
            _labelPos                          = (_perc * this.trackISTW);
        this.sessionTime                       = currentPos <= 29 ? (currentPos * 2) + 2 : ((currentPos - 29) * 20) + 60;
        this.detailCustomer.IdleSessionTimeout = this.sessionTime;
        this.trackISTLabel.style.opacity        = 1;
        this.trackISTLabel.style.width          = _labelPos - this.minSessionHold + 6 + 'px';
      },
      updateKeepInQBar(currentPos) {
        let _perc                              = currentPos/29,
            _labelPos                          = (_perc * this.trackKIQW);
        this.keepInQTime                       = currentPos * 60;
        this.detailCustomer.KeepCallersInQSeconds = this.keepInQTime;
        this.trackKIQLabel.style.opacity        = 1;
        this.trackKIQLabel.style.width          = currentPos == (this.minKeepInQ/60) ? '0px' : _labelPos - 10 + 'px';
      },
      hideISTLabel() {
        this.trackISTLabel.style.opacity = 0;
      },
      hideKIQLabel() {
        this.trackKIQLabel.style.opacity = 0;
      },
      setSessionHoldTime(evt) {
        let _newValue = evt.target.value;
        this.sessionHold = _newValue;
        this.updateSessionBar(_newValue);
      },
      setKeepInQTime(evt) {
        let _newValue = evt.target.value;
        this.keepInQ = _newValue;
        this.updateKeepInQBar(_newValue);
      },
      checkNotAvailTime(evt) {
        let _target  = evt.target;
        Mask.isTimeMaskHHMMSS(evt);
        this.setNotAvailTime(_target.value);
      },
      setNotAvailTime(time) {
        let _parts = [];
        _parts = time.split(':');
        this.detailCustomer.NotAvailTimeoutSeconds = [parseInt(_parts[0] * 3600), parseInt(_parts[1] * 60), parseInt(_parts[2])].reduce((partialSum, part) => partialSum + part, 0);
      },
      clearNotAvailTime() {
        Mask.clearTimeMask(this.$refs.notAvailTimeInput.id);
      },
      //=========================================================== START GET/SET/CREATE DATA METHODS
      getCustomers(cusId) {
        this.showLoader(true);

        IPCCCConfigurator.Request(cusId, 'customers', 'list', null, -1)
            .then(response => {
                this.totalCustomers   = 0;
                this.unOrderedList    = [...response];
                this.orderedList      = [...this.unOrderedList];
                this.totalCustomers   = this.orderedList.length;
                this.showLoader(false);
            })
            .catch(error => {
                console.error(error);
                this.showLoader(false);
            });
      },
      getIdentityList(customerId) {
        return IPCCCConfigurator.Request(customerId, 'outboundnumber', 'list', null, -1);
      },
      setLocAndVer(loc, ver) {
        return  loc.length > 0 ? loc + ' (' + ver + ')' : '';
      },
      setOutboundIdentity(newVal) {
        this.detailCustomer.CallOutNumber = (newVal && newVal !== 'null') ? newVal : '';
      },
      getCustomerById(resellerId, customerId) {
        return IPCCCConfigurator.Request(resellerId, 'customers', 'readone', null, customerId);
      },
      addCustomer() {
        this.showLoader(true);
        //GET EMPTY CUSTOMER OBJECT
        IPCCCConfigurator.Request(this.selectedCustomerId, 'customers', 'readnew', null, -1)
            .then(response => {
                this.detailCustomer                   = JSON.parse(JSON.stringify(response))[0];
                this.detailCustomer.ResellerId        = this.selectedCustomerId;
                this.detailCustomer.ResellerName      = this.getCustomerName(this.unOrderedList, this.selectedCustomerId);
                this.detailCustomer.DebtorNumber      = '';
                this.detailCustomer.SwitchBatchNumber = this.checkResellerSwitchBatch();
                this.mapUserStatusTextList();
                let _sliderPosIST = this.detailCustomer.IdleSessionTimeout <= 60 ? (this.detailCustomer.IdleSessionTimeout - 2) / 2 : ((this.detailCustomer.IdleSessionTimeout - 60) / 20) + 29; // /2 and /20 are the increments
                this.updateSessionBar(_sliderPosIST);
                this.$refs.sessionSlider.value        = _sliderPosIST;
                this.hideISTLabel();
                let _sliderPosKIQ                     = ((this.detailCustomer.KeepCallersInQSeconds - 60));
                this.updateKeepInQBar(_sliderPosKIQ);
                this.$refs.keepInQSlider.value        = _sliderPosKIQ;
                this.hideKIQLabel();
                this.screenStatus                     = 'detail-new';
                this.showLoader(false);
            })
            .catch(error => {
                console.error(error);
            });
      },
      showCustomer(evt) {
        this.showLoader(true);
        let _custId         = evt.currentTarget.getAttribute('data-customerId'),
            _resId          = evt.currentTarget.getAttribute('data-resellerId'),
            _usecasa        = evt.currentTarget.getAttribute('data-usecasa');
        //the customer is not using the idserver to login so we prevent the customer to be edited.
        if(!_usecasa) {
          this.showLoader(false);
          return;
        }
        this.getCustomerById(_resId, _custId).then(succes => {
          this.detailCustomer = JSON.parse(JSON.stringify(succes));
          this.mapUserStatusTextList();
          let _sliderPosIST = this.detailCustomer.IdleSessionTimeout <= 60 ? (this.detailCustomer.IdleSessionTimeout - 2) / 2 : ((this.detailCustomer.IdleSessionTimeout - 60) / 20) + 29;
          this.updateSessionBar(_sliderPosIST);
          this.$refs.sessionSlider.value = _sliderPosIST;
          this.hideISTLabel();
          let _sliderPosKIQ = (this.detailCustomer.KeepCallersInQSeconds / 60);
          this.updateKeepInQBar(_sliderPosKIQ);
          this.$refs.keepInQSlider.value = _sliderPosKIQ;
          this.hideKIQLabel();
          this.notAvailTime = secondsToTimeHHMMSS(this.detailCustomer.NotAvailTimeoutSeconds);
          this.getIdentityList(_custId).then(data => {
            this.identityList = [...data].reduce((acc, item) => {
              if(item.Number.length == 0) return acc;
              if(item.Label.length == 0) item.Label = item.Number;
              acc.push(item);
              return acc;
            }, []);
            this.screenStatus = 'detail-edit';
            this.showLoader(false);
          });
        }).catch(error => {
          this.showModalDialog(new BoxProps(ModalType.Alert, this.$store.state.settings.dialog.dialogalertheader, error));
          console.error(error);
          this.showLoader(false);
        });
      },
    //   editCustomer(evt) {
    //     this.screenStatus   = 'detail-edit';
    //   },
      saveCustomer() {
        this.showLoader(true);
        if(this.detailCustomer.DebtorNumber  == '') {
          this.detailCustomer.DebtorNumber = 0;
        }

        this.detailCustomer.UserStatusText = this.userStatusTextList.reduce((acc, item) => {
            acc.push(this.preventHTMLInjection(item.msg));
            return acc;
        },[]);

        IPCCCConfigurator.Request(this.selectedCustomerId, 'customers', 'save', this.detailCustomer)
        .then(response => {
          this.backToList();
          this.updateCustomerList(response);
          this.showLoader(false);
        }).catch(error => {
          console.error('error:', error);
          this.showLoader(false);
        });
      },
      deleteCustomer() {
        this.showLoader(true);
        this.detailCustomer.DeleteDate = new Date();
        IPCCCConfigurator.Request(this.selectedCustomerId, 'customers', 'delete', this.detailCustomer)
        .then(response => {
            this.removeCustomerFromList(response)
            .then(() => {
                this.orderedList      = [...this.unOrderedList];
                this.totalCustomers   = this.orderedList.length;
                this.filterList();
                this.sortColumn();
                this.hideConfirm();
                this.backToList();
                this.showLoader(false);
            })
            .catch((e) => {
                console.error(e);
                this.backToList();
                this.showLoader(false);
            });
        }).catch(error => {
            console.error(error);
            this.showLoader(false);
        });
      },
      backToList() {
        this.resetDisplay();
        this.screenStatus   = 'list';
        this.showHelp       = false;
      },
      setPBXToestelNummerLengte(val) {
        this.detailCustomer.PBXToestelNummerLengte = val;
      },
      //=========================================================== END GET/SET DATA METHODS

      //=========================================================== START DISPLAY LIST METHODS
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
            if(this.selectedCustomerId == 1) {
              _keys = item['Name'].toLowerCase().indexOf(str) != -1 ||
                      item['Code'].toLowerCase().indexOf(str) != -1 ||
                      String(item['CustomerId']).toLowerCase().indexOf(str) != -1 ||
                      // String(item['ExternalId']).toLowerCase().indexOf(str) != -1 ||
                      item['Location'].toLowerCase().indexOf(str) != -1 ||
                      String(item['DebtorNumber']).indexOf(str) != -1 ||
                      item['ResellerName'].toLowerCase().indexOf(str) != -1 ||
                      String(ISOdateTimetoDate(item['CreateDate'])).indexOf(str) != -1;
            } else {
              _keys = item['Name'].toLowerCase().indexOf(str) != -1 ||
                      item['Code'].toLowerCase().indexOf(str) != -1 ||
                      // String(item['ExternalId']).toLowerCase().indexOf(str) != -1 ||
                      item['ResellerName'].toLowerCase().indexOf(str) != -1 ||
                      String(ISOdateTimetoDate(item['CreateDate'])).indexOf(str) != -1;
            }
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
      setHighlightedRow(id) {
        let _wrapper = null;
        document.querySelectorAll('[data-customerid]').forEach(el => {
          _wrapper = el.parentElement.parentElement;
          if(el.getAttribute('data-customerid') == id) {
            el.classList.add('list-content__row--mutated');
            scrollTo(_wrapper, (el.offsetTop - el.offsetHeight), 300);
          } else
            el.classList.remove('list-content__row--mutated');
        });
        if(id == -2 && _wrapper !== null)
          scrollTo(_wrapper, 0, 200);
      },
      updateCustomerList(customer) {
        let _id    = customer.CustomerId,
            _isNew = true;
        this.unOrderedList.map(cust => { // Watch out for newly added properties. Add them here (2x, some differences like CustomerId and UseCasa, because of the save response incorrect data)
          if(cust.CustomerId == _id) {
            cust.Name         = customer.Name;
            cust.Code         = customer.Code;
            cust.ExternalId   = customer.ExternalId;
            cust.DebtorNumber = customer.DebtorNumber;
            cust.ResellerId   = customer.ResellerId;
            cust.ResellerName = customer.ResellerName;
            cust.Location     = customer.Location;
            cust.Version      = customer.Version;
            cust.CreateDate   = customer.CreateDate;
            _isNew            = false;
          }
        });
        if(_isNew) this.addCustomerToList(customer).then(() => {
          this.totalCustomers   = 0;
          this.orderedList      = [...this.unOrderedList];
          this.totalCustomers   = this.orderedList.length;
          this.filterList();
          this.sortColumn();
          setTimeout(() => {
            this.setHighlightedRow(_id);
          }, 500);
        }, error =>{
          console.error(error);
        });
      },
      addCustomerToList(customer) {
        return new Promise((resolve, reject) => {
          try {
            this.unOrderedList.push({  // Watch out for newly added properties. Add them here (2x, some differences like CustomerId and UseCasa, because of the save response incorrect data)
              CustomerId   : customer.CustomerId,
              Name         : customer.Name,
              Code         : customer.Code,
              ExternalId   : customer.ExternalId,
              DebtorNumber : customer.DebtorNumber,
              ResellerId   : customer.ResellerId,
              ResellerName : customer.ResellerName,
              Location     : customer.Location,
              Version      : customer.Version,
              CreateDate   : customer.CreateDate,
              UseCasa      : customer.UseCasa,
            });
            resolve();
          } catch(error) {
            reject(error);
          }
        });
      },
      removeCustomerFromList() {
        return new Promise((resolve, reject) => {
          try {
            let _index = -1;

            this.unOrderedList.map((cust, index) => {
              if(cust.CustomerId == this.detailCustomer.CustomerId) _index = index;
            });

            try {
              this.unOrderedList.splice(_index, 1);
              resolve();
            } catch(error) {
              reject(error);
            }
          } catch(error) {
            reject(error);
          }
        });
      },
      showConfirm() {
        this.showDialog = true;
      },
      hideConfirm() {
        //this.$refs.scroller.scrollTop = 0;
        // this.deleteInfoRead = false;
        this.showDialog     = false;
      },
      //=========================================================== END DISPLAY LIST METHODS

      //=========================================================== START HELPER METHODS
      mapUserStatusTextList() {
        this.userStatusTextList = [];
        if(this.detailCustomer.UserStatusText?.length > 0) {
            this.detailCustomer.UserStatusText.forEach((msg, index) => {
                this.userStatusTextList.push({
                    index : index,
                    msg : msg,
                    iseditable : false,
                });
            });
        }
      },
      addPersonalMessage() {
        if(this.screenStatus == 'detail-edit' || this.screenStatus == 'detail-new') {
            this.userStatusTextList.push({
                index : this.userStatusTextList.length,
                msg : '',
                iseditable : true
            });
        }
      },
      deletePersonalMessage(index) {
        if(this.screenStatus == 'detail-edit' || this.screenStatus == 'detail-new') {
            this.userStatusTextList.splice(index, 1);
        }
      },
      editPersonalMessage(index) {
        if(this.screenStatus == 'detail-edit' || this.screenStatus == 'detail-new') {
            this.userStatusTextList.forEach(msg => {
            if(msg.index == index)
                msg.iseditable = !msg.iseditable;
            else
                msg.iseditable = false;
            });
        }
      },
      preventHTMLInjection(msg) {
        return msg.replace(/>/g, "");
      },
      checkDate(createDate) {
        let _displayDateFormat = ISOdateTimetoDate(createDate);
        return (_displayDateFormat == '01-01-1980') ? '-' : _displayDateFormat;
      },
      updateResellerId(evt) {
        let _target = evt.target,
            _rId    = _target.value,
            _rName  = _target.options[_target.selectedIndex].innerHTML;

        this.detailCustomer.ResellerId = _rId;
        this.detailCustomer.ResellerName = _rName;
      },
      checkResellerSwitchBatch() {
        let _firstResellerSwitchBatch = this.switchBatchList.find(batch => batch.ResellerId == this.detailCustomer.ResellerId);
        return _firstResellerSwitchBatch ? _firstResellerSwitchBatch.Id : -1;
      },
      getCustomerName(list, id) {
        let _name = list.filter(cust => cust.CustomerId == id)
        return (_name.length > 0) ? _name[0].Name : 'Resellen not found';
      },
      createCustomerCode(evt) {
        if(this.screenStatus == 'detail-new') {
          let _val = evt.target.value;
          this.detailCustomer.Code = convertToUrlFriendly(_val, 20);
        }
      },
      checkDebitor(evt) {
        let _val = evt.target.value;
        IPCCCConfigurator.Request(this.selectedCustomerId, 'debtor', 'readone', null, _val)
            .then(response => {
                if(response.Name != '')
                    this.debitorName = response.Name;
                else
                    this.debitorName = this.$store.state.settings.usermanagement.nodebitorfound;
            }).catch(error => {
                console.error('Error: ' + error);
            });
      },
      shakeIt() {
        let _elm = document.querySelector("#detailscreen");
        _elm.classList.add('detailscreen--shake');
        setTimeout(() => {
          _elm.classList.remove('detailscreen--shake');
        }, 1000);
      },
      displayHelp() {
        this.showHelp = !this.showHelp;
      },
      resetDisplay() {
        this.sessionTime = '';
        this.keepInQTime = '';
        this.notAvailTime = '';
        this.debitorName = '';
        this.detailCustomer = {};
        this.clearNotAvailTime();
        document.querySelectorAll('span[data-name="validCheck"]').forEach(el => el.style.display = 'none');
        document.querySelectorAll('span[data-name="validMessage"]').forEach(el => el.style.display = 'none');
      },
      //=========================================================== END HELPER METHODS
    },
    beforeMount() {

    },
    mounted() {
      this.selectedCustomerId = this.$store.getters.getCustomerInfo().selectedCustomerId;
      this.trackISTW             = parseInt(window.getComputedStyle(this.$refs.sessionHold).getPropertyValue('width'));
      this.trackISTLabel         = this.$refs.currentISTValueLabel;
      this.trackKIQW             = parseInt(window.getComputedStyle(this.$refs.keepInQ).getPropertyValue('width'));
      this.trackKIQLabel         = this.$refs.currentKIQValueLabel;

      if(this.selectedCustomerId !== -1) {
        if(this.isMassxess) {
          //get SWITCHBATCH
          IPCCCData.RequestData('SWITCHBATCH')
          .then(result => {
            this.switchBatchList = [...JSON.parse(result)];
          })
          .catch(error => console.log(error));
        }
        this.getCustomers(this.selectedCustomerId);

        this.storeWatch = this.$store.watch(this.$store.getters.getCustomerInfo, cObj => {
          this.selectedCustomerId = cObj.selectedCustomerId;
          this.screenStatus       = 'list';
          this.showHelp           = false;
          this.getCustomers(cObj.selectedCustomerId);
        });
      }
    },
    beforeUnmount() {
      this.storeWatch();
    }
  }
</script>
