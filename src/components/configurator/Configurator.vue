<template>
  <div data-e2e="configurator">
    <div class="list-wrapper">
      <div class="list-topbar">
        <div class="list-topbar__content">
          <div class="form-selectfield form-selectfield--small-300 form-selectfield--topbar" v-if="showcompanies">
            <select v-model="companycode" @change="getList">
              <option value="-1">{{ $store.state.settings.configurator.mail2script.clientid }}</option>
              <option v-for="company in companycodelist" :value="company.Id">{{ company.Name }}</option>
            </select>
          </div>
          <div class="form-button__secondary form-button__secondary--add grid--push">
            <button v-on:click="dialogOpen($event, 'new', 'window', $store.state.settings.configurator.mail2script.dialogHeaderAddText)" :disabled="companycode == -1">{{ $store.state.settings.configurator.mail2script.addscript }}</button>
          </div>
        </div>
      </div>
      <div class="list-content-wrapper">
        <div class="list-content--back">
          <div class="list-content--header">
            <ExportListToXLSX
            :data="scriptlist"
            :customBtnStyles="exportListBtnStyles"
            :customWrapperStyles="exportListWrapperStyles"
            />
            <div class="list-content__row--header">
              <span class="list-content__row-cell">{{ $store.state.settings.configurator.mail2script.emailadresheader }}</span>
              <span class="list-content__row-cell">{{ $store.state.settings.configurator.mail2script.servicenumberheader }}</span>
              <span class="list-content__row-cell">{{ $store.state.settings.configurator.mail2script.expirationheader }}</span>
              <span class="list-content__row-cell list-content__row-cell--icon">&nbsp;</span>
              <span class="list-content__row-cell list-content__row-cell--icon">&nbsp;</span>
            </div>
          </div>
          <div class="list-content">
            <ol>
              <li v-for="(script, _key) in scriptlist" class="list-content__row">
                <span class="list-content__row-cell">{{ script.RecipientEmailAddress }}</span>
                <span class="list-content__row-cell">{{ getServiceNumber(script.ServiceNumberId) }}</span>
                <span class="list-content__row-cell">{{ displayNiceDate(script.ValidTill) }}</span>
                <span class="list-content__row-cell list-content__row-cell--icons">
                  <a class="button__icon button__icon--edit" @click="dialogOpen($event, 'edit', 'window', $store.state.settings.configurator.mail2script.dialogHeaderEditText)" :data-index="_key">&#xF3EB;</a>
                  <a v-if="checkIsPassed(script.ValidTill)" class="button__icon button__icon--delete" @click="dialogOpen($event, 'delete', 'alert', $store.state.settings.configurator.mail2script.dialogHeaderDeleteText);" :data-index="_key">&#xF3E5;</a>
                  <a v-else class="button__icon button__icon--delete button__icon button__icon--delete-inactive" @click="dialogOpen($event, 'activate', 'window', $store.state.settings.configurator.mail2script.dialogHeaderUnDeleteText);" :data-index="_key">&#xF059;</a>
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>
      <div :class="['dialog__modal', {'dialog__modal--open' : showDialog}]">
        <div :class="['dialog__window', {'dialog__window--open' : showDialog}, {'dialog__window-alert' : dialogIsAlert}]">
          <div class="dialog__window-header">
            <span class="dialog__window-title">{{ dialogHeader }}</span>
            <a class="dialog__window-close" @click="dialogClose">
              <span></span>
              <span></span>
            </a>
          </div>
          <div class="dialog__window-body">
            <div v-show="dialogIsAlert">
              <p>{{ dialogBodyAlertText }}</p>
            </div>
            <div v-show="!dialogIsAlert">
              <form action="" onsubmit="return false;">
                <legend></legend>
                <fieldset>
                  <div v-if="currentAction == 'new' && currentAction != 'activate'" class="form-field-inline--1-3 form-textfield form-textfield--domain-add">
                    <input v-if="currentAction == 'new'" type="text" :placeholder="$store.state.settings.configurator.mail2script.emallabel" v-model="currentEmailAddress" @keyup="">
                    <span v-if="currentAction == 'new'">{{ $store.state.settings.configurator.mail2script.mailDomain }}</span>
                    <label class="form-label form-label--hidden">{{ $store.state.settings.configurator.mail2script.emallabel }}</label>
                  </div>
                  <div v-else class="form-field-inline--1-3 form-textfield">
                    <input type="text" :placeholder="$store.state.settings.configurator.mail2script.emallabel" v-model="currentEmailAddress" disabled >
                    <label class="form-label form-label--hidden">{{ $store.state.settings.configurator.mail2script.emallabel }}</label>
                  </div>

                  <div v-if="currentAction == 'activate'" class="form-field-inline--1-3 form-selectfield">
                    <select v-model="currentServicenumber" disabled >
                      <option value="-1" selected>{{ $store.state.settings.configurator.mail2script.defaultservicenumberlabel }}</option>
                      <option v-for="(snNumber, _key) in serviceNumberList" :value="snNumber.Id">{{ snNumber.Nummer }}</option>
                    </select>
                  </div>

                  <div v-else class="form-field-inline--1-3 form-selectfield">
                    <select v-model="currentServicenumber">
                      <option value="-1" selected>{{ $store.state.settings.configurator.mail2script.defaultservicenumberlabel }}</option>
                      <option v-for="(snNumber, _key) in serviceNumberList" :value="snNumber.Id">{{ snNumber.Nummer }}</option>
                    </select>
                  </div>

                  <div class="form-field-inline--1-3 form-textfield">
                    <input type="text" id="datepicker" :placeholder="$store.state.settings.configurator.mail2script.datelabel" v-model="currentExpirationDate">
                    <label class="form-label form-label--hidden">{{ $store.state.settings.configurator.mail2script.datelabel }}</label>
                  </div>
                </fieldset>
              </form>
            </div>
          </div>
          <div class="dialog__window-footer">
            <a class="button-primary dialog__window-ok" @click="saveMail2Script">{{ dialogOkText }}</a>
            <a class="button-primary dialog__window-cancel" @click="dialogClose">{{ $store.state.settings.configurator.mail2script.dialogCancelText }}</a>
          </div>
        </div>
      </div>
    </div>
    </div>
</template>

<script>

  import PikaDay               from 'pikaday';
  import {
          currentDateTime,
          dateIsPassed,
          ISOdateTimetoDate,
          saveFormatDate,
          yesterdaysDate,
          pikaDayToDDMMYYYY
         }                   from './../../use/dateFunctions';
  import { IPCCCConfigurator } from './../../ipccc/js/configurator';
  import ExportListToXLSX    from '../uielements/ExportListToXLSX.vue';

  export default {
    name: 'Configurator',
    data() {
      return {
        showcompanies          : false,
        companycodelist       : null,
        companycode           : -1,
        scriptlist            : [],
        serviceNumberList     : [],
        currentEmailAddress   : '',
        currentServicenumber  : -1,
        currentExpirationDate : null,
        showDialog            : false,
        dialogHeader          : '',
        dialogIsAlert         : false,
        dialogBodyAlertText   : '', //store.state.settings.configurator.mail2script.dialogBodyDeleteText,
        dialogOkText          : '', //store.state.settings.configurator.mail2script.dialogOkText,
        currentAction         : '',
        mutatedItem           : {},
        picker                : null,
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
        ExportListToXLSX
    },
    methods: {
      getList() {
        if(this.companycode === -1) {
            return;
        }
          this.showLoader(true);
          IPCCCConfigurator.Request(this.companycode, "emailtoscript", "readall", "", "").then(data => {
              this.scriptlist = data;
            IPCCCConfigurator.Request(this.companycode, "servicenumber", "readall", "", "").then(snlist => {
                this.serviceNumberList = snlist.filter(nr => nr.CommunicatieType == 3 && nr.KlantId == this.companycode);
              this.showLoader(false);
            }).catch(error => {
              console.error('error fetching servicenumbers', error);
            })
          }).catch(error => {
            console.error('error fetching emailtoscript', error);
          })
        },
      dialogOpen(e, action, type, headerTxt) {
        let _index                 = e.target.getAttribute('data-index');
        this.dialogHeader          = headerTxt;
        this.dialogIsAlert         = (type == 'alert');
        this.showDialog            = true;
        this.currentAction         = action;
        this.currentEmailAddress   = "";
        this.currentServicenumber  = "";
        this.currentExpirationDate = currentDateTime();
        switch(action) {
          case 'activate':
            this.dialogOkText          = this.$store.state.settings.configurator.mail2script.dialogOkText;
            this.fillDataLine(_index);
            break;
          case 'edit':
            this.dialogOkText          = this.$store.state.settings.configurator.mail2script.dialogOkText;
            this.fillDataLine(_index);
            break;
          case 'delete':
            this.dialogOkText          = this.$store.state.settings.configurator.mail2script.dialogDeleteText;
            this.fillDataLine(_index);
            break;
          case 'new':
            this.dialogOkText          = this.$store.state.settings.configurator.mail2script.dialogOkText;
            this.currentEmailAddress   = '';
            this.currentServicenumber  = -1;
            this.currentExpirationDate = currentDateTime();
            break;
        }
      },
      dialogClose() {
        this.showDialog     = false;
        setTimeout(() => {
          this.dialogHeader   = '';
          this.dialogIsAlert  = false;
        }, 500);
      },
      fillDataLine(index) {
        if(this.scriptlist.length > 0) {
          this.currentEmailAddress   = this.scriptlist[index].RecipientEmailAddress;
          this.currentServicenumber  = this.checkServiceNr(this.scriptlist[index].ServiceNumberId);
          this.currentExpirationDate = this.displayNiceDate(this.scriptlist[index].ValidTill);
          console.log('1. now set to', this.currentExpirationDate);
        }
      },
      saveMail2Script() {
        this.showLoader(true);

        if(this.currentAction == 'delete')
          this.currentExpirationDate = yesterdaysDate();

        this.mutatedItem = {
          CustomerId: this.companycode,
          RecipientEmailAddress: this.currentEmailAddress,
          ServiceNumberId: this.currentServicenumber,
          ValidTill: saveFormatDate(this.currentExpirationDate),
        }

        if(this.currentAction == 'new')
          this.mutatedItem.RecipientEmailAddress = this.currentEmailAddress + this.$store.state.settings.configurator.mail2script.mailDomain;

        IPCCCConfigurator.Request(this.companycode, "emailtoscript", "save", this.mutatedItem, "").then(data => {
          this.dialogClose();
          this.getList(); // refresh data
          this.showLoader(false);
        }).catch(error => {
          console.log(error)
        });
      },
      getServiceNumber(n) {
        let _label = [];

        _label = this.serviceNumberList.filter(item => item.Id == n);

        if(_label.length > 0)
          return _label[0].Nummer;
        else
          return '-';
      },
      setDatePicker() {
        this.picker = new PikaDay({
          field  : document.getElementById('datepicker'),
          format : 'DD-MM-YYYY',
          i18n   : this.$store.state.settings.datepicker,
          onSelect: () => {
            this.currentExpirationDate = pikaDayToDDMMYYYY(this.picker.getDate());
          },
        });
      },
      checkServiceNr(nr) {
        return (nr == "-") ? -1 : nr;
      },
      checkDate(d) {
        return (d == "") ? currentDateTime() : d;
      },
      checkIsPassed(d) {
        return !dateIsPassed(d);
      },
      displayNiceDate(date) {
        let _d = '';
        if(date != null) {
          _d = ISOdateTimetoDate(new Date(date));
        }
        return _d;
      }
    },
    mounted() {
      this.dialogBodyAlertText   = this.$store.state.settings.configurator.mail2script.dialogBodyDeleteText;
      this.dialogOkText          = this.$store.state.settings.configurator.mail2script.dialogOkText;

      this.mutatedItem = {
        CustomerId            : null,
        RecipientEmailAddress : "",
        ServiceNumberId       : -1,
        ValidTill             : null,
      }

        IPCCCConfigurator.GetCustomers().then(result => {
            this.companycodelist   = result;
            this.showcompanies      = (this.companycodelist.length > 1);
            if(!this.showcompanies) {
                this.getList();
            }
        }).catch(error => {
            console.error(error);
        });

      this.setDatePicker();
      this.showLoader(false);
    }
  }
</script>
