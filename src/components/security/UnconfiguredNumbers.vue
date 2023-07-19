<template>
  <div data-e2e="unconfigured-numbers">
    <!-- AUDIT TRAIL LIST SCREEN -->
    <div class="list-wrapper">
      <div class="list-topbar">
        <div class="list-topbar__content">
          <div class="form-textfield form-textfield--date form-textfield--date-on-gray-small">
            <input id="datepicker" type="text" v-model="selectedDate">
          </div>
          <div class="form-togglefield form-togglefield--inline form-togglefield--inline--w100">
            <input type="checkbox" id="showbarchart" name="showbarchart" v-model="showBarChart" @change="toggleBarchart()">
            <label for="showbarchart" :data-label="$store.state.settings.unconfigurednumbers.showbarchartlbl"></label>
          </div>
        </div>
      </div>
      <div :class="['unconfigurednumbers--chart-wrapper', {'unconfigurednumbers--chart-wrapper--show' : showBarChart}]">
        <div class="unconfigurednumbers--chart-container">
          <Hor-bar-chart
            :datavalues="chartData"
            :startlabel="chartStartLbl"
            :startlabelindent="startLabelIndent"
            :endlabel="chartEndLbl"
            :rowheight="rowHeight"
            :rowgap="rowGap"
          />
        </div>
      </div>
      <div :class="['list-content-wrapper', {'list-content-wrapper--lowered200' : showBarChart}]">
        <div class="list-content--back">
          <div class="list-content--header">
            <ExportListToXLSX
            :data="numbersData"
            :customBtnStyles="exportListBtnStyles"
            :customWrapperStyles="exportListWrapperStyles"
            />
            <div class="list-content__row--header">
              <span class="list-content__row-cell list-content__row-cell--10">
                <div class="form-selectfield form-selectfield--listheader">
                  <select @change="addFilter($event, 'datum')">
                    <option value="" selected>{{ headerlabels[0] }}</option>
                    <option v-for="time in timeIntervals" :value="time">{{ time }}</option>
                  </select>
                </div>
              </span>
              <span class="list-content__row-cell list-content__row-cell--30">
                <div class="form-selectfield form-selectfield--listheader">
                  <select @change="addFilter($event, 'ani')">
                    <option value="" selected>{{ headerlabels[1] }}</option>
                    <option v-for="ani in aniList" :value="ani">{{ ani }}</option>
                  </select>
                </div>
              </span>
              <span class="list-content__row-cell list-content__row-cell--30">
                <div class="form-selectfield form-selectfield--listheader">
                  <select @change="addFilter($event, 'dnis')">
                    <option value="" selected>{{ headerlabels[2] }}</option>
                    <option v-for="dnis in dnisList" :value="dnis">{{ dnis }}</option>-->
                  </select>
                </div>
              </span>
              <span class="list-content__row-cell list-content__row-cell--20">
                <div class="form-selectfield form-selectfield--listheader">
                  <select @change="addFilter($event, 'klantnaam')">
                    <option value="" selected>{{ headerlabels[3] }}</option>
                    <option v-for="klantnaam in klantnaamList" :value="klantnaam">{{ klantnaam }}</option>
                  </select>
                </div>
              </span>
            </div>
          </div>
          <div class="list-content" ref="scroller">
            <ol>
              <li v-for="row in numbersData" class="list-content__row list-content__row--clickable" @click="showDescription(row)">
                <span class="list-content__row-cell list-content__row-cell--10" v-html="row.datum"></span>
                <span class="list-content__row-cell list-content__row-cell--30" v-html="row.ani"></span>
                <span class="list-content__row-cell list-content__row-cell--30" v-html="row.dnis"></span>
                <span class="list-content__row-cell list-content__row-cell--20" v-html="row.klantnaam"></span>
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
      :cancelLabel   = "$store.state.settings.unconfigurednumbers.detailcloselbl"
      @accepted      = ""
      @canceled      = "hideDescription"
    />
  </div>
</template>

<script>

  import JSONFormatter         from 'json-formatter-js';
  import MessageBox            from './../dialogs/Message-box.vue';
  import HorBarChart           from './../charts/HorBarChart.vue';
  import ExportListToXLSX      from '../uielements/ExportListToXLSX.vue';
  import {
          pikaDayToDDMMYYYY,
          timestampToHHMM,
          todayNL,
          todayUK
                            }  from './../../use/dateFunctions';
  import PikaDay               from 'pikaday';
  import { IPCCCLogClient } from './../../ipccc/js/logclient';

  const FORMAT_CONFIG = {
    hoverPreviewEnabled    : false,
    hoverPreviewArrayCount : 100,
    hoverPreviewFieldCount : 5,
    theme                  : '',
    animateOpen            : true,
    animateClose           : true,
    useToJSON              : true,
    exportListBtnStyles    : {
        top: '9px',
        right: '8px',
        zIndex: 1
    },
    exportListWrapperStyles : {
        top: '9px',
        right: '8px',
    },
  };

  export default {
    'name' : 'UnconfiguredNumbers',
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
        numbersData        : null,
        aniList            : [],
        dnisList           : [],
        klantnaamList      : [],
        filterObj: {
          datum       : '',
          ani         : '',
          dnis        : '',
          klantnaam   : '',
        },
        showMessage        : false,
        messageHeader      : null,
        messageBody        : null,
        messageBodyHeader  : null,
        isLoaded           : false,
        storeWatch         : null,
        chartData          : [],
        chartStartLbl      : 'Label',
        chartEndLbl        : 'Count',
        showBarChart       : false,
        rowGap             : 0.5,
        rowHeight          : 2,
        startLabelIndent   : 10,
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
      'Message-box'        : MessageBox,
      'Hor-bar-chart'      : HorBarChart,
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
          datum       : '',
          ani         : '',
          dnis        : '',
          klantnaam   : '',
        };

        let _tillDate = '';
        if(this.datePicker.getDate() == null) {
          _tillDate = new Date();
        } else {
          _tillDate = new Date(this.datePicker.getDate());
        }
        _tillDate = _tillDate.setDate(_tillDate.getDate() + 1);

        this.tillDate = new Date(_tillDate);

        IPCCCLogClient.WFM_UnconfiguredNumbers(this.fromDate, this.tillDate).then(succes => {
          if(succes.ErrorMessage == '') {
            this.rawData = [...succes.Records];
            this.rawData.map(log => {
              log.datum = timestampToHHMM(log.datum);
            });
            this.aniList = this.rawData.reduce((acc, cur) => {
              if(acc.indexOf(cur.ani) === -1) acc.push(cur.ani);
              return acc;
            }, []);
            this.dnisList = this.rawData.reduce((acc, cur) => {
              if(acc.indexOf(cur.dnis) === -1) acc.push(cur.dnis);
              return acc;
            }, []);
            this.klantnaamList = this.rawData.reduce((acc, cur) => {
              if(acc.indexOf(cur.klantnaam) === -1) acc.push(cur.klantnaam);
              return acc;
            }, []);
            setTimeout(() => {
              this.filterList(this.getUnconfiguredNumbersCount);
            }, 500);
          } else {
            console.error(succes.ErrorMessage);
            this.showLoader(false);
          }
        }).catch(error => {
          console.error(error);
          this.showLoader(false);
        });
      },
      getUnconfiguredNumbersCount() {
        IPCCCLogClient.WFM_UnconfiguredNumbersCount(this.fromDate, this.tillDate, ).then(succes => {
          if(succes.ErrorMessage == '') {
            this.chartData = succes.Records;
          } else {
            console.error(succes.ErrorMessage);
          }
          this.showLoader(false);
        }).catch(error => {
          console.error(error);
          this.showLoader(false);
        });
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
        this.numbersData = this.rawData.filter(log => {
          if((_getHour(log.datum) == _getHour(this.filterObj['datum']) || this.filterObj['datum'] == '') &&
            (log.ani   == this.filterObj['ani']   || this.filterObj['ani']   == '') &&
            (log.dnis   == this.filterObj['dnis']   || this.filterObj['dnis']   == '') &&
            (log.klantnaam   == this.filterObj['klantnaam']   || this.filterObj['klantnaam']   == '')
            )
            return log;
        });
        if(typeof callback === 'function') callback();
      },
      showDescription(_row) {
        const _labels     = this.$store.state.settings.unconfigurednumbers.messagelabels;
        const _bodyHeader = `
          <h2>${_labels[0]}</h2>
          <div><span>${_labels[1]}: </span><span>${_row.datum}</span></div>
          <div><span>${_labels[2]}: </span><span>${_row.ani}</span></div>
          <div><span>${_labels[3]}: </span><span>${_row.dnis}</span></div>
          <div><span>${_labels[4]}: </span><span>${_row.klantnaam}</span></div>
        `;

        this.messageBodyHeader.innerHTML = _bodyHeader;
        if(_row != null) {
          const _formatter = new JSONFormatter(_row, 1, FORMAT_CONFIG);
          this.messageBody.appendChild(_formatter.render());
          this.showMessage = true;
        }
      },
      hideDescription() {
        this.messageBody.innerHTML       = '';
        this.messageBodyHeader.innerHTML = '';
        this.showMessage                 = false;
      },
      toggleBarchart() {
        this.showBarChart != this.showBarChart;
      }
    },
    mounted() {
      this.selectedCustomerId     = this.$store.getters.getCustomerInfo().selectedCustomerId;
      this.selectedDate   = (this.$store.state.browserLanguage == 'nl') ? todayNL() : todayUK();
      this.headerlabels   = this.$store.state.settings.unconfigurednumbers.columnlabels;
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

      this.storeWatch = this.$store.watch(this.$store.getters.getCustomerInfo, cObj => {
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


  .unconfigurednumbers {
    &--chart-wrapper {
      position: absolute;
      top: 120px;
      max-width: 1280px;
      width: 100%;
      left: 50%;
      transform: translateX(-50%);
      padding: 0 2rem;
      opacity: 0;
      transition: opacity 0.15s ease-in-out;
      &--show {
       opacity: 1;
      }
    }
    &--chart-container {
      width: 100%;
      background-color: globals.$color-white;
      overflow: auto;
      border: 1px solid globals.$color-gray15;
      padding: 6px 12px 6px 12px;
      height: 88px;
      overflow: auto;
    }
  }
  .list-content-wrapper--lowered200 {
    top : 220px;
    transition: top 0.15s ease-in-out;
  }

  .form-togglefield--inline--w100 {
    width: 100px;
  }
</style>
