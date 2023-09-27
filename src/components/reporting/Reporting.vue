<template>
  <div data-e2e="reporting">
    <report-filter v-show="hasRenderedFilters" :headerfilterscontent="$store.state.settings.reporting.headfilters" />

    <div v-show="showReloadMessage" class="reporting__message">
      <div class="typo--centered">
        {{ $store.state.settings.reporting.message }}<br /><br />
          <a class="button-primary button-primary--gray" @click="openHistoricReports()">{{ $store.state.settings.reporting.btnreload }}</a>
      </div>
    </div>

    <div v-show="showHome" class="reports-home-wrapper">
      <div class="reports-home-content">
        <div class="grid-row">
          <div class="grid-unit--alpha">
            <div class="grid-row grid-row--bottom-padding reporting-visual"></div>
          </div>
        </div>
        <div class="grid-unit--alpha">
          <div class="grid-row grid-row--bottom-padding">
            <div class="grid-unit--alpha">
              <div class="typo--paragraph-header typo--centered">
                  <span class="detailscreen__title">{{ $store.state.settings.reporting.header }}</span>
              </div>
            </div>
          </div>
          <div class="grid-row grid-row--bottom-padding">
            <div class="grid-unit--alpha">
              <div class="typo--paragraph--large typo--centered">
                <button v-for="(btn, index) in btnList" class="reportingbtn" :key="index" :class="btn.btnClassName" @click="pushUrl(btn.btnUrl)" v-html="reportingBtnLabel(btn.btnLabel)"></button>
              </div>
            </div>
          </div>
          <br />
        </div>
      </div>
    </div>

    <div v-show="!showReloadMessage && !showHome" class="report-wrapper"></div>
  </div>
</template>

<script>

import ReportFilter    from './ReportFilter.vue';
import { IPCCCReport } from '@/ipccc/js/report';

window.reportIsReady = new Event('reportisready');

export default {
  name: 'Reports',
  data: () => {
    return {
      selectedCustomerId   : -1,
      selectedCustomerName : '',
      userId               : -1,
      selectedReport       : null,
      showReloadMessage    : false,
      reportWrapper        : null,
      timer                : null,
      hasRenderedFilters   : false,
      btnList              : [],
      showHome             : false,
      storeWatch           : null
    }
  },
  inject: ["showLoader"],
  components: {
    ReportFilter
  },
  computed: {
    isMassxess() {
      return this.$store.getters.getCustomerInfo().customerId == 1;
    },
  },
  watch: {
    '$route' (to, from) {
      this.getSelectedReport();
    }
  },
  methods: {
    pushUrl(url) {
      this.$router.push({path: url});
    },
    getBtnList() {
      let _reportsMenu = this.$store.getters.getMenuItems().find(item => item.Code === 'ModuleRapportage' ).appMenu;
      this.btnList     = _reportsMenu.reduce((result, appmenu) => {
        if(appmenu.subMenu.length > 0) {
          appmenu.subMenu.forEach(item => {
            if(item.url === '/reports/VoIP/voip-incoming-calls/' || item.url === '/reports/call-groups/call-groups/' || item.url === '/reports/call-groups/agents/' || item.url === '/reports/inbound/incoming-calls/') {
            // if(item.url === '/reports/voIP/' || item.url === '/reports/call-groups/' || item.url === '/reports/call-groups/' || item.url === '/reports/inbound/') {
              result.push({
                btnLabel     : item.label['nl'],
                btnUrl       : item.url,
                btnClassName : item.className
              });
            }
          });
        }
        return result;
      }, []);
    },
    reportingBtnLabel(name) {
      switch(name) {
        case 'Belgroepen':
          return this.$store.state.settings.reporting.reportingbtnlabel[0];
        case 'Agenten':
          return this.$store.state.settings.reporting.reportingbtnlabel[1];
        case 'Nummers':
          return this.$store.state.settings.reporting.reportingbtnlabel[2];
        case 'VoIP inkomend':
          return this.$store.state.settings.reporting.reportingbtnlabel[3];
        case 'Agent Status':
          return this.$store.state.settings.reporting.reportingbtnlabel[3];
      }
    },
    getSelectedReport() {
      if(this.$route.params.id === undefined) return;
      this.showReloadMessage = false;
      this.showHome          = false;
      switch(this.$route.params.id) {
        case 'home':
          this.selectedReport    = '';
          this.showHome          = true;
          this.hasRenderedFilters = false;
          this.showLoader(false);
          break;
        case 'voip-incoming-calls':
          this.selectedReport    = 'shared/LIVE/Voip_Calls';
          break;
        case 'cdc':
          this.selectedReport    = 'shared/LIVE/Call_Groups_CDC';
          break;
        case 'extentions':
          this.selectedReport    = 'shared/LIVE/Extention';
          break;
        case 'agents':
          this.selectedReport    = 'shared/LIVE/Agent';
          break;
        case 'agent-status':
          this.selectedReport    = 'shared/LIVE/Agent_Status';
          break;
        case 'call-groups':
          this.selectedReport    = 'shared/LIVE/Call_Groups';
          break;
        case 'call-groups-aht':
          this.selectedReport    = 'shared/LIVE/AHT';
          break;
        case 'call-groups-sla':
          this.selectedReport    = 'shared/LIVE/SLA';
          break;
        case 'call-groups-queuedetails':
          this.selectedReport    = 'shared/LIVE/Call_Groups_Insights';
          break;
        case 'incoming-calls':
          this.selectedReport    = 'shared/LIVE/Calls';
          break;
        case 'calls-insights':
          this.selectedReport    = 'shared/LIVE/Calls_Insights';
          break;
        case 'call-history':
          this.selectedReport    = 'shared/LIVE/Call_History';
          break;
        case 'call-history-details':
          this.selectedReport    = 'shared/LIVE/Call_History_details';
          break;
        case 'call-history-beta':
          this.selectedReport    = 'shared/BETA/Call_History_beta';
          break;
        case 'historical-per-day':
          this.selectedReport    = 'shared/LIVE/Calls_Numbers_Historical_Per_Day';
          break;
        case 'insights-per-day':
          this.selectedReport    = 'shared/LIVE/Calls_Insights_Per_Day';
          break;
        case 'asr-insights':
          this.selectedReport    = 'shared/LIVE/ASR_Insights';
          break;
        case 'media-calls':
          this.selectedReport    = 'shared/LIVE/Media_Calls';
          break;
        case 'campagne-progress':
          this.selectedReport    = 'shared/LIVE/Campagne_Voortgang';
          break;
        case 'campagne-agents':
          this.selectedReport    = 'shared/LIVE/Campagne_Agent';
          break;
        case 'customers':
          this.selectedReport    = 'shared/LIVE/Reseller';
          break;
        case 'history':
          this.showReloadMessage = true;
          break;
        case 'traffic':
          this.selectedReport    = 'shared/LIVE/NID/Traffic';
          break;
        case 'traffic-beta':
          this.selectedReport    = 'shared/BETA/NID/Traffic_beta';
          break;
        case 'call-analytics':
          this.selectedReport    = 'shared/LIVE/NID/Call_Analytics';
          break;
        case 'call-log':
          this.selectedReport    = 'shared/LIVE/NID/Call_Log';
          break;
        case 'companies':
          this.selectedReport    = 'shared/LIVE/NID/Companies';
          break;
        //Mxs report beta
        case 'voip-incoming-calls-beta':
          this.selectedReport    = 'shared/BETA/Voip_Calls_beta';
          break;
        case 'agents-beta':
          this.selectedReport    = 'shared/BETA/Agent_beta';
          break;
        case 'call-groups-beta':
          this.selectedReport    = 'shared/BETA/Wachtrij_beta';
          break;
        case 'incoming-calls-beta':
          this.selectedReport    = 'shared/BETA/Calls_beta';
          break;
        case 'call-groups-queuedetails-beta':
          this.selectedReport    = 'shared/BETA/Wachtrij_details_beta';
          break;
        case 'customers-beta':
          this.selectedReport    = 'shared/BETA/Reseller_beta';
          break;
      }
      if(this.$route.params.id !== 'home') {
        this.showLoader(true);
        this.$route.params.id !== 'history' ? this.openReport() : this.openHistoricReports();
      }
    },
    openHistoricReports() {
      let winFeature = 'location=no, toolbar=no, menubar=no, scrollbars=yes, resizable=yes',
          name       = 'ContactSuiteReportWin';
      if(this.isMassxess) {
        window.open(this.$store.getters.getReportsLoginIDSUrl() + '?customerId=' + this.selectedCustomerId + '&customerName=' + encodeURIComponent(this.selectedCustomerName), name, winFeature);
      } else {
        window.open(this.$store.getters.getReportsLoginIDSUrl(), name, winFeature);
      }
      this.hasRenderedFilters = false;
      this.showLoader(false);
    },
    openReport() {
      if(this.reportWrapper != null) {
        //remove filters
        let _child = document.querySelector('.report-filters__body');
        if(_child)
          _child.innerHTML = '';

        IPCCCReport.OpenReport(this.reportWrapper, this.selectedCustomerId, encodeURI(this.selectedReport), null, null, -1).then(_ => {
            this.showLoader(false);
        }).catch(error => {
            this.showLoader(false);
            console.error(error);
        });
      }
      else {
        setTimeout(_ => this.openReport(), 200);
      }
    },
    reportReady() {
      if(window.ICC_FILTERCOUNT && window.ICC_FILTERCOUNT > 0) {
        this.hasRenderedFilters = true;
        this.moveFilters();
      } else {
        this.hasRenderedFilters = false;
      }
      this.showLoader(false);
    },
    moveFilters() {
      let _base   = document.querySelectorAll("[class*='js__filtercontainer-']"),
          _target = document.querySelector('.report-filters__body');

      //remove styles from source
      _base.forEach(el => {
        el.style = '';
      })
      document.querySelector('.js__filtercontainer-0 .ic3-html-box').style = '';
      this.sortFilterContainers(_base, _target);
    },
    sortFilterContainers(_source, _target) {
      const _regex = /js__filtercontainer-\s*([\w\s])/g;

      Array.from(_source).sort((a, b) => {
        a = String(a.getAttribute('class').match(_regex));
        b = String(b.getAttribute('class').match(_regex));
        return (a < b) ? -1 : (b < a) ? 1 : 0;
      }).forEach(el => {
          _target.appendChild(el);
      });
    },
  },
  mounted() {
    this.userId               = this.$store.state.loginSession.Details.UserId;
    this.selectedCustomerId   = this.$store.getters.getCustomerInfo().selectedCustomerId;
    this.selectedCustomerName = this.$store.getters.getCustomerInfo().selectedCustomerName;
    this.reportWrapper        = document.querySelector('.report-wrapper');
    this.getBtnList();

    document.querySelector('BODY').addEventListener('reportisready', this.reportReady, false);

    if(this.selectedCustomerId !== -1)
      this.getSelectedReport();

    this.storeWatch = this.$store.watch(this.$store.getters.getCustomerInfo, cObj => {
      if(cObj.selectedCustomerId != -1) {
        this.showLoader(true);
        this.selectedCustomerId   = cObj.selectedCustomerId;
        this.selectedCustomerName = cObj.selectedCustomerName;
        if(this.selectedCustomerId !== -1) {
          this.getSelectedReport();
        }
      }
    });
  },
  beforeUnmount() {
    this.storeWatch();
    document.querySelector('BODY').removeEventListener('reportisready', this.reportReady, false);
  }
}
</script>

