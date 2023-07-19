<template>
    <div class="widget widget--agent" data-e2e="agent-widget">
      <h2 class="widget-header">{{ agentname }}</h2>
      <div class="widget-content__tab-wrapper">
        <a :class="['widget-content__tab', {'widget-content__tab--active' : activeTab == 2}]" @click="toggleTabs(2)" :data-label="tabLabels[2]">&#xF126;</a>
        <a :class="['widget-content__tab', {'widget-content__tab--active' : activeTab == 1}]" @click="toggleTabs(1)" :data-label="tabLabels[1]">&#xF8DE;</a>
        <a :class="['widget-content__tab', {'widget-content__tab--active' : activeTab == 0}]" @click="toggleTabs(0)" :data-label="tabLabels[0]">&#xF2DA;</a>
      </div>
      <div v-show="activeTab == 0" class="widget-content widget-content__tab-content">
        <table class="widget-agent__history-table">
            <tr>
              <th>&nbsp;</th>
              <th>{{ $store.state.settings.agentInfo.historytablehead[0] }}</th>
              <th>{{ $store.state.settings.agentInfo.historytablehead[1] }}</th>
              <!--<th>{{ $store.state.settings.agentInfo.historytablehead[2] }}</th>-->
            </tr>
            <tr v-for="(call, index) in agentData.RecentCalls" :key="index">
              <td :class="getIconClassName(call.CallType, call.Answered)"></td>
              <td v-if="$store.state.commands.Callout" @click=callNumber($event)>{{ stripSip(call.TelephoneNumber) }}</td>
              <td v-else class="status-number--disabled">{{ stripSip(call.TelephoneNumber) }}</td>
              <td>{{ getDateToTime(call.StartTime) }}</td>
              <!--<td>{{ durationTime(call.CallDuration) }}</td>-->
            </tr>
            <tr v-if="agentData != null && (agentData.RecentCalls != null && agentData.RecentCalls.length == 0)">
              <td colspan='4' class="widget-agent__history-message">
                <p>{{ $store.state.settings.agentInfo.nohistorytxt }}</p>
              </td>
            </tr>
          </table>

      </div>
      <div v-show="activeTab == 1" class="widget-content widget-content__tab-content">
        <div class="widget-agent__stats-numbers-cell">
          <span>{{ $store.state.settings.agentInfo.statsgrid[0] }}</span>
          <span>{{ displayNummer }}</span>
        </div>
        <div class="widget-agent__stats-numbers-cell">
          <span>{{ $store.state.settings.agentInfo.statsgrid[1] }}</span>
          <span>{{ SNAnswered }}</span>
        </div>
        <div class="widget-agent__stats-numbers-cell">
          <span>{{ $store.state.settings.agentInfo.statsgrid[2] }}</span>
          <span>{{ SNMissed }}</span>
        </div>
        <div class="widget-agent__stats-numbers-cell">
          <span>{{ $store.state.settings.agentInfo.statsgrid[3] }}</span>
          <span>{{ avgCallTime }}<span>({{ teamavgCallTime }})</span></span>
        </div>
        <div class="widget-agent__stats-numbers-cell">
          <span>{{ $store.state.settings.agentInfo.statsgrid[4] }}</span>
          <span>{{ avgWrapUpTime }}<span>({{ teamavgWrapUpTime }})</span></span>
        </div>
        <div class="widget-agent__stats-numbers-cell">
          <span>{{ $store.state.settings.agentInfo.statsgrid[5] }}</span>
          <span>{{ avgHandelingTime }}<span>({{ teamavgHandelingTime }})</span></span>
        </div>
      </div>
      <div v-show="activeTab == 2" class="widget-content widget-content__tab-content">
        <donut-chart v-if="dataReady"
          :datavalues="chartSet"
          :innerradius="55"
          :alternatetime="true"
          :id="currentSatusId"
          :legendheaders="$store.state.settings.agentInfo.legend"
        />
      </div>
    </div>
</template>

<script>

  /**
   *
   * Device switch
   *
   * @version 1.0
   * @author Erik Rosenhart
   *
   * @todo
   * @info
   * donut-chart on DEV doesn't seem to work, also the StatusTimes history on the session is not send only current status.
   *
   */

  import { IPCCCStatus }    from './../../../ipccc/js/status.js';
  import { IPCCCDashboard } from './../../../ipccc/js/dashboard.js';
  import DonutChart         from './../../charts/DonutChart.vue';
  import {
           durationTime,
           dateToTime
          }           from './../../../use/dateFunctions.ts';
  import {  hexToRgb,
            cancelEvent } from './../../../use/helperFunctions';
import { IPCCCCallControl } from '../../../ipccc/js/callcontrol.js';
import { IPCCC } from '../../../ipccc/js/ipccc.js';
import { useSetDevice }         from '../../../use/setDeviceFunction';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'AgentWidget',
    props: [],
    components: {
      'donut-chart'         : DonutChart,
    },
    data: () => {
      return {
        activeTab               : 2,
        agentname               : '',
        department              : '',
        location                : '',
        liveUserList            : null,
        ipcccControl            : null,
        statusList              : [],
        agentDashboardSubscribe : false,
        agentData               : {},
        callTypes               : IPCCCDashboard.Enums.CallTypes,
        currentPhoneNumber      : '',
        workPlaceLogin          : false,
        displayNummer           : '',
        SNAnswered              : 0,
        SNMissed                : 0,
        avgCallTime             : '',
        avgWrapUpTime           : '',
        avgHandelingTime        : '',
        teamTotalCalls          : '',
        teamTotalCallSeconds    : '',
        teamTotalWrapupSeconds  : '',
        teamavgCallTime         : '',
        teamavgWrapUpTime       : '',
        teamavgHandelingTime    : '',
        chartSet                : null,
        dataReady               : false,
        agentChart              : null,
        labelSet                : [],
        currentSatusId          : -1,
        addedStatus             : null,
        addedStatusIndex        : -1,
        isNewStatus             : false,
        statusIconName          : '',
        tabLabels               : '',
        statusTimer             : null,
        setDeviceFn             : useSetDevice(),
      }
    },
    watch: {
      '$route' (to, from) {
        if(to.path !== '/home/') {
          this.deSubscribe();
        } else {
          this.getData();
        }
      },
    },
    methods: {
      toggleTabs(index) {
        this.activeTab = index;
      },
      getStatusIconName(id) {
        return statusIconName[id];
      },
      getStatusColor(list, id) {
        let _labelObj = list.filter( ( obj ) => {
          return (obj && obj.StatusId == id);
        });
        return '#' + String((_labelObj && _labelObj.length > 0) ? _labelObj[0].Color : 'FFFFFF');
      },
      getStatusLabel(list, id) {
        let _labelObj = list.filter( obj => (obj && obj.StatusId == id));
        return String((_labelObj != null && _labelObj.length > 0) ? _labelObj[0].Label : '-');
      },
      getStatusId(list, lbl) {
        let _idObj = list.filter( obj  => (obj && obj.Label == lbl));
        return String((_idObj != null && _idObj.length > 0) ? _idObj[0].StatusId : '-1');
      },
      subscriptionData(result) {
        if(typeof result !== 'undefined') {
          this.agentData              = JSON.parse(JSON.stringify(result));
          this.SNAnswered             = this.agentData.SNAnswered.Count;
          this.SNMissed               = this.agentData.SNMissed.Count;
          this.teamTotalCalls         = this.agentData.TeamTotalCalls;
          this.teamTotalCallSeconds   = this.agentData.TeamTotalCallSeconds;
          this.teamTotalWrapupSeconds = this.agentData.TeamTotalWrapupSeconds;
          this.currentPhoneNumber     = this.agentData.Phonenumber;
          this.getDeviceText();
          this.calcAvg();

          this.createDataSet(this.agentData.StatusTimes);

          this.$nextTick(() => {
              if(this.addedStatus != null && this.addedStatus.StatusId != this.currentSatusId) {
                this.addData();
              } else if(this.addedStatus != null && this.addedStatus.StatusId == this.currentSatusId) {
                this.updateAddedData();
              } else {
                this.updateStartData();
              }
          })

        } else {
          this.statusTimer = setInterval(this.getData(), 500);
        }
      },
      getData() {
        IPCCCDashboard.Subscribe('AGENTINFO', this.subscriptionData)
        .then(_ => this.agentDashboardSubscribe = true)
        .catch(e => console.error('Error: ', e));
      },
      addData() {
        let _status         = this.chartSet.find(_obj => _obj.label == this.addedStatus.StatusLbl);
        this.currentSatusId = this.addedStatus.StatusId;

        if(this.chartSet && _status) {
          let _id  = this.getStatusId(this.statusList, _status.label),
              _aId = this.agentData.StatusTimes.findIndex((_obj) => _obj.StatusId == _id);
          this.isNewStatus      = false;
          this.addedStatusIndex = _aId;
        } else {
          this.isNewStatus      = true;
          this.agentData.StatusTimes.push(this.addedStatus);
          this.addedStatusIndex = this.agentData.StatusTimes.length - 1;
        }
        if (this.addedStatusIndex > -1) {
            this.agentData.StatusTimes[this.addedStatusIndex].StatusTime += this.$store.getters.getCurrentStatusTime().mSec / 1000;
            this.createDataSet(this.agentData.StatusTimes);
        }
      },
      updateAddedData() {
        if(this.isNewStatus) {
          this.agentData.StatusTimes.push(this.addedStatus);
          this.agentData.StatusTimes[this.addedStatusIndex].StatusTime = this.$store.getters.getCurrentStatusTime().mSec / 1000;
        } else {
          this.agentData.StatusTimes[this.addedStatusIndex].StatusTime += this.$store.getters.getCurrentStatusTime().mSec / 1000;
        }

        this.createDataSet(this.agentData.StatusTimes);
      },
      updateStartData() {
        this.addedStatusIndex = this.agentData.StatusTimes.findIndex(obj => obj.StatusId == this.currentSatusId);


        if(this.addedStatusIndex !== -1) {
          this.agentData.StatusTimes[this.addedStatusIndex].StatusTime += this.$store.getters.getCurrentStatusTime().mSec / 1000;
        } else {
          this.addedStatus      = {
                                    StatusId   : this.$store.state.statusId,
                                    StatusLbl  : this.$store.state.statusLbl,
                                    StatusTime : this.$store.getters.getCurrentStatusTime().mSec / 1000,
                                  };
          this.isNewStatus      = true;
          this.agentData.StatusTimes.push(this.addedStatus);
          this.addedStatusIndex = this.agentData.StatusTimes.length - 1;
        }
        this.createDataSet(this.agentData.StatusTimes);
      },
      getIconClassName(ctype, answered) {
        switch(ctype) {
          case this.callTypes.PBXInbound:
            return answered ? 'pbxinbound' : 'pbxinbound--unanswered';

          case this.callTypes.PBXOutbound:
            return answered ? 'pbxoutbound' : 'pbxoutbound--unanswered';

          case this.callTypes.OutboundCampaign:
            return answered ? 'outboundcampaign' : 'outboundcampaign--unanswered';

          case this.callTypes.IncomingServiceNumber:
            return answered ? 'incomingservicenumber' : 'incomingservicenumber--unanswered';

          default:
            return '';
        }
      },
      stripSip(rawNr) {
        return rawNr?.indexOf('@') ? rawNr.split('@')[0] : rawNr;
      },
      callNumber(evt) {
        let phoneNumber = evt.currentTarget.innerHTML;
        IPCCCCallControl.Call(phoneNumber)
        .catch(error => {
            console.error(error.Message);
            if (this.$store.getters.getHasWebPhone() && error.Message == "Uw telefoontoestel is geblokkeerd") {
                this.setDeviceFn.handleWebRTCErrorState();
            }
        });
        cancelEvent(evt);
      },
      calcAvg() {
        let act  = 0,
            awt  = 0,
            tact = 0,
            tawt = 0;

        if(this.agentData.SNAnswered.Count > 0) {
          act = this.agentData.PersonalTotalCallSeconds/this.agentData.SNAnswered.Count
          awt = this.agentData.PersonalTotalWrapupSeconds/this.agentData.SNAnswered.Count
        }

        if(this.agentData.TeamTotalCallSeconds > 0 && this.agentData.TeamTotalCalls > 0)
          tact = this.agentData.TeamTotalCallSeconds/this.agentData.TeamTotalCalls;

        if(this.agentData.TeamTotalWrapupSeconds > 0 && this.agentData.TeamTotalCalls > 0)
          tawt = this.agentData.TeamTotalWrapupSeconds/this.agentData.TeamTotalCalls;

        this.avgCallTime          = durationTime(act);
        this.avgWrapUpTime        = durationTime(awt);
        this.avgHandelingTime     = durationTime(act + awt);

        this.teamavgCallTime      = durationTime(tact);
        this.teamavgWrapUpTime    = durationTime(tawt);
        this.teamavgHandelingTime = durationTime(tact + tawt);
      },
      createDataSet(set) {
        let _chartData = [];

        set.forEach(s => {
          let hexC = this.getStatusColor(this.statusList, s.StatusId),
              rgbC = hexToRgb(hexC);

          _chartData.push({
            id       : s.StatusId,
            data     : s.StatusTime,
            color    : `rgba(${rgbC.r}, ${rgbC.g}, ${rgbC.b}, 1)`,
            label    : this.getStatusLabel(this.statusList, s.StatusId)
          });
        });
        this.chartSet  = JSON.parse(JSON.stringify(_chartData));

        if(!this.dataReady)
          this.dataReady = true;
      },
      getDeviceText() {
        if(this.workPlaceLogin) {
          let _labels = IPCCC.LoginSession.Details.Devices,
               _label = _labels.filter((l => {
                return l.Address == this.currentPhoneNumber;
               }));
          this.displayNummer = (_label.length > 0) ? _label[0].Label : '-';
        } else {
          this.displayNummer = this.stripSip(this.currentPhoneNumber);
        }
      },
      getDateToTime(d) {
        return dateToTime(d);
      },
      deSubscribe() {
        IPCCCDashboard.Desubscribe('AGENTINFO', this.subscriptionData)
        this.agentDashboardSubscribe = false;
        clearInterval(this.statusTimer);
        this.statusTimer = null;
      }
    },
    mounted() {
      this.agentname            = this.$store.state.loginSession.Details.FullName;
      this.currentPhoneNumber   = this.$store.state.loginSession.Details.PhoneNumber;
      this.workPlaceLogin       = this.$store.state.loginSession.Details.WorkplaceLogin;
      this.statusIconName       = this.$store.state.settings.agentDashboard.statusIconName;
      this.tabLabels            = [this.$store.state.settings.agentInfo.historyhead, this.$store.state.settings.agentInfo.statshead, this.$store.state.settings.agentInfo.statushead];
      this.currentSatus         = this.$store.state.statusLbl;
      this.currentSatusId       = this.$store.state.statusId;
      this.agentChart           = document.getElementById('agentChart');
      IPCCCStatus.GetStatusList().then(list => {
        this.statusList = list
      });

      if(this.$router.currentRoute.value.path === '/home/')
        this.getData();

      this.$store.watch(this.$store.getters.statusChanged, statusChanged => {
        if(statusChanged.StatusId != this.currentSatusId) {
          this.addedStatus      = statusChanged;
          this.isNewStatus      = false;
          //if not subscribed then subscribe
          if(!this.agentDashboardSubscribe && this.$router.currentRoute.value.path === '/home/')
            this.getData();
        } else {
          this.addedStatus      = null;
        }
      });

      this.$store.watch(this.$store.getters.getCurrentSelDevice, lbl => {
        this.getDeviceText();
      });
    }
})
</script>

<style lang="scss" scoped>
    @use "@/scss/includes/widget";
    @use "@/scss/includes/globals";

  .widget {
    box-shadow: none;
  }

.pbxinbound,
.pbxoutbound,
.outboundcampaign,
.incomingservicenumber,
.pbxinbound--unanswered,
.pbxoutbound--unanswered,
.outboundcampaign--unanswered,
.incomingservicenumber--unanswered {
    position: relative;

    &:before {
        font-family: "Material Design Icons";
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-size: 1.3rem;
        // @include font-icon();
    }
}

.pbxinbound:before {
    content: '\F3F7';
    color: globals.$color-secondary;
}
.pbxinbound--unanswered:before {
    content: '\F3F7';
    color: globals.$color-unavailable;
}

.pbxoutbound:before {
    content: '\F3FB';
    color: globals.$color-secondary;
}
.pbxoutbound--unanswered:before {
    content: '\F3FB';
    color: globals.$color-unavailable;
}

.outboundcampaign:before {
    content: '\F05C';
    color: globals.$color-secondary;
}
.outboundcampaign--unanswered:before {
    content: '\F05C';
    color: globals.$color-unavailable;
}

.incomingservicenumber:before {
    content: '\F042';
    color: globals.$color-secondary;
}
.incomingservicenumber--unanswered:before {
    content: '\F042';
    color: globals.$color-unavailable;
}
</style>
