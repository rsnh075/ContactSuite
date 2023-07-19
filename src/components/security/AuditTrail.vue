<template>
  <div data-e2e="audit-trail">
    <!-- AUDIT TRAIL LIST SCREEN -->
    <div class="list-wrapper">
      <div class="list-topbar">
        <div class="list-topbar__content">
          <div class="form-textfield form-textfield--date form-textfield--date-on-gray-small">
            <input id="datepicker" type="text" v-model="selectedDate">
          </div>
        </div>
      </div>
      <div class="list-content-wrapper">
        <div class="list-content--back">
          <div class="list-content--header">
            <ExportListToXLSX
            :data="auditData"
            :customBtnStyles="exportListBtnStyles"
            :customWrapperStyles="exportListWrapperStyles"
            />
            <div class="list-content__row--header">
              <span class="list-content__row-cell list-content__row-cell--10">
                <div class="form-selectfield form-selectfield--listheader">
                  <select @change="addFilter($event, 'timestamp')">
                    <option value="" selected>{{ headerlabels[0] }}</option>
                    <option v-for="time in timeIntervals" :value="time">{{ time }}</option>
                  </select>
                </div>
              </span>
              <span class="list-content__row-cell list-content__row-cell--25">
                <div class="form-selectfield form-selectfield--listheader">
                  <select @change="addFilter($event, 'username')">
                    <option value="" selected>{{ headerlabels[1] }}</option>
                    <option v-for="name in names" :value="name">{{ name }}</option>
                  </select>
                </div>
              </span>
              <span class="list-content__row-cell list-content__row-cell--15">
                <div class="form-selectfield form-selectfield--listheader">
                  <select @change="addFilter($event, 'loggroup')">
                    <option value="" selected>{{ headerlabels[2] }}</option>
                    <option v-for="part in parts" :value="part">{{ part }}</option>-->
                  </select>
                </div>
              </span>
              <span class="list-content__row-cell list-content__row-cell--15">
                <div class="form-selectfield form-selectfield--listheader">
                  <select @change="addFilter($event, 'label')">
                    <option value="" selected>{{ headerlabels[3] }}</option>
                    <option v-for="key in keys" :value="key">{{ key }}</option>
                  </select>
                </div>
              </span>
              <span class="list-content__row-cell list-content__row-cell--15">
                <div class="form-selectfield form-selectfield--listheader">
                  <select @change="addFilter($event, 'audittype')">
                    <option value="" selected>{{ headerlabels[4] }}</option>
                    <option v-for="action in actions" :value="action">{{ action }}</option>
                  </select>
                </div>
              </span>
              <span class="list-content__row-cell list-content__row-cell--20">{{ headerlabels[5] }}</span>
            </div>
          </div>
          <div class="list-content" ref="scroller">
            <ol>
              <li v-for="row in auditData" class="list-content__row list-content__row--clickable" @click="showDescription(row)">
                <span class="list-content__row-cell list-content__row-cell--10" v-html="row.timestamp"></span>
                <span class="list-content__row-cell list-content__row-cell--25" v-html="checkUserName(row)"></span>
                <span class="list-content__row-cell list-content__row-cell--15" v-html="row.loggroup"></span>
                <span class="list-content__row-cell list-content__row-cell--15" v-html="row.label"></span>
                <span class="list-content__row-cell list-content__row-cell--15" v-html="row.audittype"></span>
                <span class="list-content__row-cell list-content__row-cell--20" v-html="getChanges(row)"></span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
    <!-- DETAIL POPUP -->
    <Message-box
      :status        = "showMessage"
      :headerContent = "messageHeader"
      bodyContent    = "<div class='dialog__JSONHeader' id='JSONHeader'></div>
                        <div class='grid-unit--alpha dialog__JSON' id='JSONBody'></div>"
      acceptLabel    = ""
      :cancelLabel   = "$store.state.settings.audittrail.detailcloselbl"
      @accepted      = ""
      @canceled      = "hideDescription"
    />
  </div>
</template>

<script>

  import JSONFormatter    from 'json-formatter-js';
  import MessageBox       from './../dialogs/Message-box.vue';
  import ExportListToXLSX from '../uielements/ExportListToXLSX.vue';
  import PikaDay          from 'pikaday';
  import {
          pikaDayToDDMMYYYY,
          timestampToHHMM,
          todayNL,
          todayUK
         }                  from './../../use/dateFunctions';

  const FORMAT_CONFIG = {
    hoverPreviewEnabled    : false,
    hoverPreviewArrayCount : 100,
    hoverPreviewFieldCount : 5,
    theme                  : '',
    animateOpen            : true,
    animateClose           : true,
    useToJSON              : true
  };
  import { IPCCCLogClient } from './../../ipccc/js/logclient';

  export default {
    'name' : 'AuditTrail',
    data() {
      return {
        selectedCustomerId : -1,
        datePicker         : null,
        fromDate           : new Date(),
        tillDate           : new Date(),
        selectedDate       : null,
        headerlabels       : [],
        timeIntervals      : ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00' ],
        rawData            : null,
        auditData          : null,
        names              : [],
        parts              : [],
        keys               : [],
        actions            : [],
        filterObj: {
          timestamp   : '',
          username    : '',
          loggroup    : '',
          label        : '',
          audittype   : '',
        },
        showMessage        : false,
        messageHeader      : null,
        messageBody        : null,
        messageBodyHeader  : null,
        isLoaded           : false,
        storeWatch         : null,
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
      'Message-box'           : MessageBox,
      ExportListToXLSX
    },
    methods: {
      setDatePicker() {
        this.datePicker = new PikaDay({
          field    : document.getElementById('datepicker'),
          // format   : (this.$store.state.browserLanguage == 'nl') ? 'DD-MM-YYYY' : 'MM-DD-YYYY',
          format: 'DD-MM-YYYY',
          maxDate  : new Date(),
          i18n     : this.$store.state.settings.datepicker,
          onSelect : () => {
            // this.selectedDate = this.datePicker.toString();
            this.selectedDate = pikaDayToDDMMYYYY(this.datePicker.getDate());
            this.fromDate     = new Date(this.datePicker.getDate());
            if(this.isLoaded) {
              this.showLoader(true);
              this.updateDate(this.selectedCustomerId);
            }
          },
        });
      },
      updateDate(cusId) {
        this.filterObj = {
          timestamp   : '',
          username    : '',
          loggroup    : '',
          label        : '',
          audittype   : '',
        };

        let _tillDate = '';
        if(this.datePicker.getDate() == null) {
          _tillDate = new Date();
        } else {
          _tillDate = new Date(this.datePicker.getDate());
        }
        _tillDate = _tillDate.setDate(_tillDate.getDate() + 1);

        this.tillDate = new Date(_tillDate);
        IPCCCLogClient.AuditLog(this.fromDate, this.tillDate, cusId).then(succes => {
          if(succes.ErrorMessage == '') {
            this.rawData = [...succes.Records];
            this.rawData.map(log => {
              log.timestamp = timestampToHHMM(log.timestamp);
            });
            this.names = this.rawData.reduce((acc, cur) => {
              if(acc.indexOf(cur.username) === -1) acc.push(cur.username);
              return acc;
            }, []);
            this.parts = this.rawData.reduce((acc, cur) => {
              if(acc.indexOf(cur.loggroup) === -1) acc.push(cur.loggroup);
              return acc;
            }, []);
            this.keys = this.rawData.reduce((acc, cur) => {
              if(acc.indexOf(cur.label) === -1) acc.push(cur.label);
              return acc;
            }, []);
            this.actions = this.rawData.reduce((acc, cur) => {
              if(acc.indexOf(cur.audittype) === -1) acc.push(cur.audittype);
              return acc;
            }, []);
            this.filterList(() => this.showLoader(false));
          } else {
            console.error(succes.ErrorMessage);
            this.showLoader(false);
          }
        }).catch(error => {
          console.error(error);
          this.showLoader(false);
        });
      },
      getChanges(row) {
        let _list = [];
        try {
          let _changes = JSON.parse(row.changes);
          if(_changes && _changes.length) {
            _changes.map(desc => {
              _list.push(desc.Property);
            });
          } else {
            _list.push(_changes.Message);
          }
        } catch(err) {
          _list = [];
        }
        return _list.join(', ');
      },
      checkUserName(row) {
        let _name = '';
        if(row.usercustomername != row.customername)
          _name += row.usercustomername.startsWith('Massxess') ? 'ContactSuite' : row.usercustomername;
        _name += ' ' + row.username;
        return _name;
      },
      addFilter(evt, filter = '') {
        this.showLoader(true);
        if(filter != '')
          this.filterObj[filter] = evt.target.value;
        else
          this.filterObj[filter] = '';

        this.filterList(() => this.showLoader(false));
      },
      filterList(callback) {
        const _getHour = t => parseInt(t.split(':')[0]);
        this.auditData = this.rawData.filter(log => {
          if((_getHour(log.timestamp) == _getHour(this.filterObj['timestamp']) || this.filterObj['timestamp'] == '') &&
            (log.username   == this.filterObj['username']   || this.filterObj['username']   == '') &&
            (log.loggroup   == this.filterObj['loggroup']   || this.filterObj['loggroup']   == '') &&
            (log.label      == this.filterObj['label']      || this.filterObj['label']       == '') &&
            (log.audittype  == this.filterObj['audittype']  || this.filterObj['audittype']  == '')
            )
            return log;
        });
        if(typeof callback === 'function') callback();
      },
      showDescription(r) {
        const _row        = r;
        const _labels     = this.$store.state.settings.audittrail.messagelabels;
        const _bodyHeader = `
          <h2>${_labels[0]}: ${r.customername}</h2>
          <div><span>${_labels[1]}: </span><span>${r.username}</span></div>
          <div><span>${_labels[2]}: </span><span>${r.loggroup}</span></div>
          <div><span>${_labels[3]}: </span><span>${r.label}</span></div>
          <div><span>${_labels[4]}: </span><span>${r.audittype}</span></div>
        `;

        this.messageBodyHeader.innerHTML = _bodyHeader;
        if(r.changes != null) {
          const _json      = JSON.parse(r.changes);
          const _formatter = new JSONFormatter(_json, 1, FORMAT_CONFIG);
          this.messageBody.appendChild(_formatter.render());
          this.showMessage = true;
        }
      },
      hideDescription() {
        this.messageBody.innerHTML       = '';
        this.messageBodyHeader.innerHTML = '';
        this.showMessage                 = false;
      }
    },
    mounted() {
      this.selectedCustomerId   = this.$store.getters.getCustomerInfo().selectedCustomerId;
      this.selectedDate         = (this.$store.state.browserLanguage == 'nl') ? todayNL() : todayUK();
      this.headerlabels         = this.$store.state.settings.audittrail.columnlabels;
      this.showLoader(true);

      this.setDatePicker();
      this.isLoaded      = true;
      let _today         = new Date();
      this.fromDate.setDate(_today.getDate());
      this.fromDate.setHours(0);
      this.fromDate.setMinutes(0);
      this.fromDate.setSeconds(0);

      if(this.selectedCustomerId !== -1) this.updateDate(this.selectedCustomerId);

      this.messageBody = document.getElementById('JSONBody');
      this.messageBodyHeader = document.getElementById('JSONHeader');

      this.storeWatch = this.$store.watch(() => this.$store.getters.getCustomerInfo(), cObj => {
        if(cObj.selectedCustomerId != -1) {
          this.showLoader(true);
          this.selectedCustomerId = cObj.selectedCustomerId;
          this.updateDate(cObj.selectedCustomerId);
        }
      });

    },
    beforeUnmount() {
      this.storeWatch();
      this.isLoaded = false;
    }
  }
</script>

<style lang="scss">

@use "@/scss/includes/functions";
@use "@/scss/includes/globals";
@use "@/scss/includes/font";

.dialog__JSONHeader div span {
  color: globals.$color-gray60;
	font-size: 0.8rem;
	&:first-of-type {
		@include font.font-bold();
	}
}

</style>