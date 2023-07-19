<template>
  <div data-e2e="queues-dashboard">
    <ContextMenu
      :visability  = "contextMenuVisability"
      :position    = "contextPosition"
      :itemList    = "contextMenuItems"
      @mouseisout  = "contextMenu"
    >
      <template v-slot="{ row }">
        <div class="context-item" @click="handleContextAction(row.eventtype)">
          <span v-if="row.icon !== ''" class="context-item__icon" v-html="'&#x' + row.icon"></span>
          <span :class="['context-item__label', {'context-item__label--header' : row.eventtype === 'null'}]">{{ row.label }}</span>
        </div>
      </template>
    </ContextMenu>
    <QueueToAgentTemp
      v-show="qtoaVisible"
      :visible="qtoaVisible"
      :queue="qtoaGroup"
      @close="qtoaClose"
    />
    <!-- <div v-if="groupMetrics" class="vlist-ribbon"> -->
    <div class="vlist-ribbon">
      <div class="vlist-ribbon__group--left">
        <div class="vlist-ribbon__group">
          <div class="vlist-ribbon__item vlist-ribbon__item--select">
            <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
              <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings.queueDashboard.searchtxt" @keyup="filterList()">
            </div>
          </div>
        </div>
        <div class="vlist-ribbon__group">
          <div class="vlist-ribbon__item">
            <div class="form-togglefield vlist-ribbon__togglefield">
              <input type="checkbox" id="showtimeinsec" name="showtimeinsec" v-model="showTimeInSec" @change="toggleTime">
              <label for="showtimeinsec"></label>
              <span>{{ $store.state.settings.queueDashboard.showtimeinsec }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="vlist-ribbon__group--right">
        <div class="vlist-ribbon__group">
          <div class="vlist-ribbon__item vlist-ribbon__item--select">
            <div class="form-multiselectfield">
              <label class="form-label vlist-ribbon__label">{{ $store.state.settings.queueDashboard.grouplabel }}</label>
              <vue-multiselect
                v-model          = "selectedRoutingGroups"
                :options         = "routingGroups"
                :multiple        = "true"
                :searchable      = "false"
                :close-on-select = "false"
                :clear-on-select = "false"
                :placeholder     = "$store.state.settings.queueDashboard.rgSelectorDefaulttxt"
                label            = "Name"
                track-by         = "Name"
              >
              </vue-multiselect>
              <!-- <multiselect
                v-model="selectedRoutingGroups"
                :options="routingGroups"
                :multiple="true"
                :searchable="false"
                :close-on-select="false"
                :placeholder="$store.state.settings.queueDashboard.rgSelectorDefaulttxt"
                label="Name"
                track-by="Name"
                @input="showGroupMetrics()"
              >
                <template slot="selection" slot-scope="{ values, search, isOpen }">
                  <span class="multiselect__single" v-if="values.length && !isOpen">
                    {{ values.length }} {{ $store.state.settings.queueDashboard.queueslenthtxt }}
                  </span>
                </template>
              </multiselect> -->
            </div>
          </div>
        </div>
        <div class="vlist-ribbon__group">
          <div class="vlist-ribbon__item vlist-ribbon__item--button">
            <!-- <div class="menu-toggle-list__icon button__icon" @click="openDashboardWin()">&#xF3CC;</div> -->
            <MenuToggleList :list="columnList" @propChanged="propchanged" />
            <label>{{ $store.state.settings.queueDashboard.columnslbl }}</label>
          </div>
        </div>
      </div>
    </div>

    <div v-if="columnList.length > 0" class="vlist-wrapper">
      <div class="vlist-header__row--bottomborder">
        <div class="vlist__row vlist-header__row">
          <!-- <span class="vlist__cell--pin">&nbsp;</span> -->
          <span class="vlist__cell--icon">&nbsp;</span>
          <span @click="sortColumn('Title', $event)" data-sortorder="NONE" class="vlist__cell--name">{{ $store.state.settings.queueDashboard.tableheadtxt[0] }}</span>
          <span v-if="columnList[0].Active"  @click="sortColumn('NumberOfCallsInWaitingQueue', $event)"          data-sortorder="NONE" class="vlist__cell--dynamic" :class="getColWidth"><div>{{ $store.state.settings.queueDashboard.tableheadtxt[1] }}</div><div>{{ $store.state.settings.queueDashboard.tablesubheadertxt[0] }}</div></span>
          <span v-if="columnList[1].Active"  @click="sortColumn('nrOfVirtualCallsInQWaitingQueue', $event)"      data-sortorder="NONE" class="vlist__cell--dynamic" :class="getColWidth"><div>{{ $store.state.settings.queueDashboard.tableheadtxt[2] }}</div><div>{{ $store.state.settings.queueDashboard.tablesubheadertxt[0] }}</div></span>
          <span v-if="columnList[2].Active"  @click="sortColumn('LongestWaitingTime', $event)"                   data-sortorder="NONE" class="vlist__cell--dynamic" :class="getColWidth"><div>{{ $store.state.settings.queueDashboard.tableheadtxt[3] }}</div><div>{{ $store.state.settings.queueDashboard.tablesubheadertxt[0] }}</div></span>
          <span v-if="columnList[3].Active"  @click="sortColumn('AgentsCalling', $event)"                        data-sortorder="NONE" class="vlist__cell--dynamic" :class="getColWidth"><div>{{ $store.state.settings.queueDashboard.tableheadtxt[4] }}</div><div>{{ $store.state.settings.queueDashboard.tablesubheadertxt[0] }}</div></span>
          <span v-if="columnList[4].Active"  @click="sortColumn('AgentsAvailable', $event)"                      data-sortorder="NONE" class="vlist__cell--dynamic" :class="getColWidth"><div>{{ $store.state.settings.queueDashboard.tableheadtxt[5] }}</div><div>{{ $store.state.settings.queueDashboard.tablesubheadertxt[0] }}</div></span>
          <span v-if="columnList[5].Active"  @click="sortColumn('AgentsNotAvaliable', $event)"                   data-sortorder="NONE" class="vlist__cell--dynamic" :class="getColWidth"><div>{{ $store.state.settings.queueDashboard.tableheadtxt[6] }}</div><div>{{ $store.state.settings.queueDashboard.tablesubheadertxt[0] }}</div></span>
          <span v-if="columnList[6].Active"  @click="sortColumn('PercentageAnsweredWithinSLA', $event)"          data-sortorder="NONE" class="vlist__cell--dynamic" :class="getColWidth"><div>{{ $store.state.settings.queueDashboard.tableheadtxt[7] }}</div><div>{{ $store.state.settings.queueDashboard.tablesubheadertxt[2] }}</div></span>
          <span v-if="columnList[7].Active"  @click="sortColumn('reachability', $event)"                         data-sortorder="NONE" class="vlist__cell--dynamic" :class="getColWidth"><div>{{ $store.state.settings.queueDashboard.tableheadtxt[8] }}</div><div>{{ $store.state.settings.queueDashboard.tablesubheadertxt[1] }}</div></span>
          <span v-if="columnList[8].Active"  @click="sortColumn('AverageSpeedOfAnswer', $event)"                 data-sortorder="NONE" class="vlist__cell--dynamic" :class="getColWidth"><div>{{ $store.state.settings.queueDashboard.tableheadtxt[9] }}</div><div>{{ $store.state.settings.queueDashboard.tablesubheadertxt[1] }}</div></span>
          <span v-if="columnList[9].Active"  @click="sortColumn('NumberOfAnsweredCalls', $event)"                data-sortorder="NONE" class="vlist__cell--dynamic" :class="getColWidth"><div>{{ $store.state.settings.queueDashboard.tableheadtxt[10] }}</div><div>{{ $store.state.settings.queueDashboard.tablesubheadertxt[1] }}</div></span>
          <span v-if="columnList[10].Active" @click="sortColumn('NumberOfAbortedCalls', $event)"                 data-sortorder="NONE" class="vlist__cell--dynamic" :class="getColWidth"><div>{{ $store.state.settings.queueDashboard.tableheadtxt[11] }}</div><div>{{ $store.state.settings.queueDashboard.tablesubheadertxt[1] }}</div></span>
          <span v-if="columnList[11].Active" @click="sortColumn('PercentageAnsweredWithinSLAOverall', $event)"   data-sortorder="NONE" class="vlist__cell--dynamic" :class="getColWidth"><div>{{ $store.state.settings.queueDashboard.tableheadtxt[12] }}</div><div>{{ $store.state.settings.queueDashboard.tablesubheadertxt[1] }}</div></span>
          <span v-if="columnList[12].Active" @click="sortColumn('PercentageAnsweredInCorrectGroup', $event)"     data-sortorder="NONE" class="vlist__cell--dynamic" :class="getColWidth"><div>{{ $store.state.settings.queueDashboard.tableheadtxt[13] }}</div><div>{{ $store.state.settings.queueDashboard.tablesubheadertxt[1] }}</div></span>
        </div>
      </div>

      <VirtualListViewer class="vlist-content"
        :data       = "groupMetrics"
        rowClasses  = "vlist-content__row vlist-content__row--clickable"
        >
        <template v-slot="{ row, startindex, index }">
          <div :class="['vlist__row', {'vlist__row--zebra' : index % 2 == 0}]" :key="row.RoutingGroupId + (Math.random() * 100)">
            <span class="vlist__cell--icon">
              <span class="vlist__cell--icon-initials" v-html="getInitials(row.Title)"></span>
            </span>
            <span class="vlist__cell--name" v-html="row.Title"></span>
            <span v-if="columnList[0].Active"  class="vlist__cell--dynamic" :class="getColWidth"><span class="vlist__cell--statusdot" :style="{backgroundColor: getQueueStatusColor(row.NumberOfCallsInWaitingQueue)}"></span>{{ row.NumberOfCallsInWaitingQueue }}</span>
            <span v-if="columnList[1].Active"  class="vlist__cell--dynamic" :class="getColWidth">{{ row.nrOfVirtualCallsInQWaitingQueue }}</span>
            <span v-if="columnList[2].Active"  class="vlist__cell--dynamic" :class="getColWidth">{{ showTime(row.LongestWaitingTime) }}</span>
            <span v-if="columnList[3].Active"  class="vlist__cell--dynamic" :class="getColWidth">{{ row.AgentsCalling }}</span>
            <span v-if="columnList[4].Active"  class="vlist__cell--dynamic" :class="getColWidth">{{ row.AgentsAvailable }}</span>
            <span v-if="columnList[5].Active"  class="vlist__cell--dynamic" :class="getColWidth">{{ row.AgentsNotAvaliable }}</span>
            <span v-if="columnList[6].Active"  class="vlist__cell--dynamic" :class="getColWidth">{{ checkAndRoundValueSLA(row.PercentageAnsweredWithinSLA, row.RoutingGroupId, row.Title) }}&nbsp;%</span>
            <span v-if="columnList[7].Active"  class="vlist__cell--dynamic" :class="getColWidth">{{ row.reachability }}&nbsp;%</span>
            <span v-if="columnList[8].Active"  class="vlist__cell--dynamic" :class="getColWidth">{{ showTime(row.AverageSpeedOfAnswer) }}</span>
            <span v-if="columnList[9].Active"  class="vlist__cell--dynamic" :class="getColWidth">{{ row.NumberOfAnsweredCalls }}</span>
            <span v-if="columnList[10].Active" class="vlist__cell--dynamic" :class="getColWidth">{{ row.NumberOfAbortedCalls }}</span>
            <span v-if="columnList[11].Active" class="vlist__cell--dynamic" :class="getColWidth">{{ checkAndRoundValueSLAOverall(row.PercentageAnsweredWithinSLAOverall, row.RoutingGroupId, row.Title) }}&nbsp;%</span>
            <span v-if="columnList[12].Active" class="vlist__cell--dynamic" :class="getColWidth">{{ Math.round(row.PercentageAnsweredInCorrectGroup) }}&nbsp;%</span>

            <div v-if="supervisedCallGroup(row.RoutingGroupId)" class="vlist__cell--contextmenu" @click="contextMenu($event, row.RoutingGroupId)">&#xF1D9;</div>
          </div>
        </template>
      </VirtualListViewer>

    </div>
    <div v-if="columnList.length > 0" class="vlist-footer">
      <div>
        <span class="vlist__cell--icon">&nbsp;</span>
        <span class="vlist__cell--name">{{ queueTotals }}&nbsp;{{ $store.state.settings.queueDashboard.queues }}</span>
        <span v-if="columnList[0].Active"  class="vlist__cell--dynamic" :class="getColWidth">{{ totals.NumberOfCallsInWaitingQueue }}</span>
        <span v-if="columnList[1].Active"  class="vlist__cell--dynamic" :class="getColWidth">{{ totals.nrOfVirtualCallsInQWaitingQueue }}</span>
        <span v-if="columnList[2].Active"  class="vlist__cell--dynamic" :class="getColWidth">&nbsp;</span>
        <span v-if="columnList[3].Active"  class="vlist__cell--dynamic" :class="getColWidth">{{ totals.AgentsCalling }}</span>
        <span v-if="columnList[4].Active"  class="vlist__cell--dynamic" :class="getColWidth">&nbsp;</span>
        <span v-if="columnList[5].Active"  class="vlist__cell--dynamic" :class="getColWidth">&nbsp;</span>
        <span v-if="columnList[6].Active"  class="vlist__cell--dynamic" :class="getColWidth">&nbsp;</span>
        <span v-if="columnList[7].Active"  class="vlist__cell--dynamic" :class="getColWidth">{{ calcReachability(totals.NumberOfAnsweredCalls, totals.NumberOfOfferedCalls) }}%</span>
        <span v-if="columnList[8].Active"  class="vlist__cell--dynamic" :class="getColWidth">{{ calcASA() }}</span>
        <span v-if="columnList[9].Active"  class="vlist__cell--dynamic" :class="getColWidth">{{ totals.NumberOfAnsweredCalls }}</span>
        <span v-if="columnList[10].Active" class="vlist__cell--dynamic" :class="getColWidth">{{ totals.NumberOfAbortedCalls }}</span>
        <span v-if="columnList[11].Active" class="vlist__cell--dynamic" :class="getColWidth">&nbsp;</span>
        <span v-if="columnList[12].Active" class="vlist__cell--dynamic" :class="getColWidth">&nbsp;</span>
      </div>
    </div>

  </div>
</template>

<script>

  import { dynamicSort }    from './../../use/sortFunctions';
  import { durationTime  }  from './../../use/dateFunctions';
  import ContextMenu        from './../v2_components/ContextMenu.vue';
  import VirtualListViewer  from './../uielements/VirtualListViewer.vue';
  import QueueToAgentTemp   from './QueueToAgentTemp.vue';
  import MenuToggleList     from './MenuToggleList.vue';
  import VueMultiselect     from 'vue-multiselect';
  import { IPCCCDashboard } from './../../ipccc/js/dashboard.js';
  import { IPCCCUserSettings } from './../../ipccc/js/usersettings.js';
  import { nextTick } from '@vue/runtime-core';

  export default {
    name: 'QueuesDashboard',
    data: () => {
      return {
        queueDashboardSubscribe : null,
        rawGroupMetrics         : null,
        groupMetrics            : [],
        selectedGroupMetrics    : null,
        queueTotals             : 0,
        totals                  : [],
        showTimeInSec           : false,
        searchStr               : '',
        sortSetting             : {},
        selectedRoutingGroups   : [],
        msColValue              : [],
        msColOptions            : [],
        selectedRGIds           : [],

        pinnedCallGroups        : [],
        contextMenuVisability   : false,
        contextPosition         : {
          x : 0,
          y : 0,
        },
        contextMenuItems        : [],
        currentCallGroupId      : -1,

        qtoaVisible             : false,
        qtoaGroup               : {},
        routingGroups           : [],
        supervisedObj           : [],
        supervisedArr           : [],
        columnList              : [],
        listNames               : [],
        saveTimer               : null,
        agentToCallgroupUser    : null,
        getSettingsDone         : false,
      }
    },
    inject: ['showLoader'],
    components: {
      ContextMenu,
      VirtualListViewer,
      QueueToAgentTemp,
      MenuToggleList,
      VueMultiselect
    },
    directives: {
      mounted: {
        inserted: function(el, binding) {
          binding.value;
        }
      }
    },
    computed: {
      getColWidth() {
        return 'colwidth' + this.columnList.filter(item => item.Active).length;
      },
      permissionToSupervise() {
        return this.$store.getters.getPermission('BeheerGroepenDashboard')
      },
    },
    watch: {
      selectedRoutingGroups: function(newVal, oldVal) {
        if(this.getSettingsDone) this.showGroupMetrics();
      }
    },
    methods: {
      contextMenu(evt, callGroupId = -1) {
        if(evt.type.toLowerCase() === 'mouseisout') {
          this.currentCallGroupId    = -1;
          this.contextMenuVisability = false;
        } else {
          this.currentCallGroupId        = callGroupId;
          // this.contextMenuItems[2].icon  = this.pinnedCallGroups.indexOf(callGroupId) !== -1 ? 'F404' : 'F403';
          // this.contextMenuItems[2].label = this.pinnedCallGroups.indexOf(callGroupId) !== -1 ? this.$store.state.settings.queueDashboard.contextmenu[3] : this.$store.state.settings.queueDashboard.contextmenu[2];
          this.contextMenuVisability     = true;
          this.contextPosition           = {
                                             x : evt.clientX,
                                             y : evt.clientY,
                                           };
        }
      },
      handleContextAction(eventType) {
        switch(eventType) {
          case 'agents':
            this.qtoaOpen(this.currentCallGroupId);
            this.contextMenuVisability = false;
            break;
          case 'pin':
            this.pinCallGroup(this.currentCallGroupId);
            this.contextMenuVisability = false;
            break;
          default:
            return false;
        }
      },
      setSupervisedArr() {
        this.supervisedArr = this.supervisedObj.map(rg => rg.Id);
      },
      supervisedCallGroup(rgid) {
        return this.permissionToSupervise && this.supervisedArr.indexOf(rgid) >= 0;
      },
      getData(result) {
        if(typeof result !== 'undefined') {
          this.routingGroups        = [];
          this.rawGroupMetrics      = result.RoutingGroupInfoList.map(rg => {
            rg.reachability                    = this.calcReachability(rg.NumberOfAnsweredCalls, rg.NumberOfOfferedCalls, rg.RoutingGroupId, rg.Title);
            rg.nrOfVirtualCallsInQWaitingQueue = rg.NumberOfCmbIVRCallsInQWaitingQueue + rg.NumberOfCmbAPICallsInQWaitingQueue;
            this.routingGroups.push({Id: rg.RoutingGroupId, Name: rg.Title});
            return rg;
          });
          this.selectedRGIds        = this.selectedRoutingGroups.map(obj => obj.Id);
          this.selectedGroupMetrics = this.filterRawGroups();
          this.filterList();
          this.sortColumn();
        } else {
            this.rawGroupMetrics = [];
            this.groupMetrics    = [];
            this.queueTotals     = 0;
            this.totals          = [];
        }
        this.showLoader(false);
      },
      showGroupMetrics() {
        this.setSettings();
        this.selectedRGIds = this.selectedRoutingGroups.map(obj => obj.Id);
        this.selectedGroupMetrics = this.filterRawGroups();
        this.filterList();
        this.sortColumn();
      },
      getQueueStatusColor(nr) {
        return (nr > 3) ? '#BA2726' : '#74B40E';
      },
      getInitials(title) {
        let _initials  = '',
            _parts     = title.split(' '),
            _l         = _parts.length;

        _initials += _parts[0].charAt(0).toUpperCase();
        if(_l - 1 != 0)
          _initials += _parts[_l - 1].charAt(0).toUpperCase();

        return _initials;
      },
      showTime(t) {
        let _t = Math.round(t);
        if(this.showTimeInSec)
          return _t;
        else
          return isNaN(_t) ? _t : durationTime(_t);
      },
      toggleTime() {
        this.showTimeInSec != this.showTimeInSec;
        this.setSettings();
      },
      filterRawGroups() {
        return this.rawGroupMetrics.filter((rg) => {
          return (this.selectedRGIds.length == 0 || this.selectedRGIds.indexOf(rg.RoutingGroupId) >= 0);
        });
      },
      filterList() {
        if(this.selectedGroupMetrics.length > 0) {
          this.groupMetrics = this.filterListOnString(this.selectedGroupMetrics, this.searchStr.toLowerCase());
          this.setTotals();
        } else {
          this.groupMetrics = [];
          this.queueTotals  = 0;
          this.totals       = [];
        }
      },
      filterListOnString(list, str) {
        if(str != '') {
          let _rawList = [...list];
          return _rawList.filter(item => {
            return item.Title.toLowerCase().indexOf(str) != -1
          });
        } else {
          return [...list];
        }
      },
      sortColumn(key, e = null) {
        let _order,
            _t;

        if(e != null) {
          _t     = e.currentTarget;
          _order = _t.getAttribute('data-sortorder');
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
            this.groupMetrics.sort(dynamicSort(key));
            if(e != null)
              _t.setAttribute('data-sortOrder', 'ASC');
            break;
          case 'ASC':
            this.groupMetrics.sort(dynamicSort('-' + key));
            if(e != null)
              _t.setAttribute('data-sortOrder', 'DES');
            break;
          case 'DES':
            this.groupMetrics = this.filterListOnString(this.selectedGroupMetrics, this.searchStr.toLowerCase());
            this.setTotals();
            if(e != null)
              _t.setAttribute('data-sortOrder', 'NONE');
            break;
        }
      },
      setTotals() {
        this.queueTotals     = this.groupMetrics.length;
        this.totals          = [];
        this.totals          = this.groupMetrics.reduce((acc, gr) => {
          return {
            NumberOfVirtualCallsInQWaitingQueue  : acc.NumberOfVirtualCallsInQWaitingQueue  + gr.NumberOfVirtualCallsInQWaitingQueue,
            NumberOfCallsInWaitingQueue          : acc.NumberOfCallsInWaitingQueue          + gr.NumberOfCallsInWaitingQueue,
            AgentsCalling                        : acc.AgentsCalling                        + gr.AgentsCalling,
            AgentsNotAvaliable                   : acc.AgentsNotAvaliable                   + gr.AgentsNotAvaliable,
            AverageSpeedOfAnswer                 : acc.AverageSpeedOfAnswer                 + gr.AverageSpeedOfAnswer,
            AgentsAvailable                      : acc.AgentsAvailable                      + gr.AgentsAvailable,
            NumberOfAnsweredCalls                : acc.NumberOfAnsweredCalls                + gr.NumberOfAnsweredCalls,
            NumberOfAbortedCalls                 : acc.NumberOfAbortedCalls                 + gr.NumberOfAbortedCalls,
            NumberOfOfferedCalls                 : acc.NumberOfOfferedCalls                 + gr.NumberOfOfferedCalls,
            PercentageAnsweredWithinSLA          : acc.PercentageAnsweredWithinSLA          + gr.PercentageAnsweredWithinSLA,
            PercentageAnsweredInCorrectGroup     : acc.PercentageAnsweredInCorrectGroup     + gr.PercentageAnsweredInCorrectGroup,
            TotalCallingTime                     : acc.TotalCallingTime                     + (gr.AverageSpeedOfAnswer * gr.NumberOfAnsweredCalls)
          }
        }, {
          NumberOfVirtualCallsInQWaitingQueue  : 0,
          NumberOfCallsInWaitingQueue          : 0,
          AgentsCalling                        : 0,
          AgentsNotAvaliable                   : 0,
          AverageSpeedOfAnswer                 : 0,
          AgentsAvailable                      : 0,
          NumberOfAnsweredCalls                : 0,
          NumberOfAbortedCalls                 : 0,
          NumberOfOfferedCalls                 : 0,
          PercentageAnsweredWithinSLA          : 0,
          PercentageAnsweredInCorrectGroup     : 0,
          TotalCallingTime                     : 0
        });
      },
      calcASA() {
        return this.totals.TotalCallingTime == 0 || this.totals.NumberOfAnsweredCalls == 0 ? this.showTime(0) : this.showTime(this.totals.TotalCallingTime / this.totals.NumberOfAnsweredCalls);
      },
      calcReachability(NumberOfAnsweredCalls, NumberOfOfferedCalls, rgid = '-', rgtitle = '-') {
        let _reachability = NumberOfOfferedCalls > 0 ? Math.round((NumberOfAnsweredCalls / NumberOfOfferedCalls) * 100) : 100;
        return _reachability;
      },

      // pinCallGroup(CallGRoupId) {
      //   if(this.pinnedAgents.indexOf(UserId) !== -1) {
      //     let _index = this.pinnedAgents.findIndex(el => el == UserId);
      //     this.pinnedAgents.splice(_index, 1);
      //   } else {
      //     this.pinnedAgents.push(UserId);
      //   }
      //   this.updateRow(UserId, 'pinIcon', this.setPinIcon(UserId));
      //   this.enrichAgentData();
      // },
      // setPinIcon(UserId) {
      //   return this.pinnedAgents.indexOf(UserId) !== -1 ? '&#xF403' : '&#xF404';
      // },

      qtoaOpen(qId) {
        let _callgroup = this.groupMetrics.find(callgroup => callgroup.RoutingGroupId == qId);
        this.qtoaGroup = {
          groupId: qId,
          groupName: _callgroup.Title,
          groupColor: this.getQueueStatusColor(_callgroup.NumberOfCallsInWaitingQueue)
        };
        this.qtoaVisible = true;
      },
      qtoaClose() {
        this.qtoaVisible = false;
      },
      //----------------------------------------------------------HELPER COLUMN FUNCTIONS
      setSettings() {
        let _filterSettings = {
          showTimeInSec         : this.showTimeInSec,
          selectedRoutingGroups : this.selectedRoutingGroups,
          columnList            : this.columnList
        };

        IPCCCUserSettings.Save('QueuesDashboardSettings', 'QueuesDashboardUserSettings', JSON.stringify(_filterSettings))
        .catch(error => {
          console.error(error);
        });
      },
      getSettings() {
        return new Promise((resolve, reject) => {
            IPCCCUserSettings.Get('QueuesDashboardSettings').then(result => {
                if (result.length > 0 && result[0].Name == 'QueuesDashboardUserSettings') {
                    let _data            = JSON.parse(result[0].Data),
                    _columnListNames = this.$store.state.settings.queueDashboard.tableheadtxt.filter(item => item != this.$store.state.settings.queueDashboard.tableheadtxt[0]);
                    if (_data.showTimeInSec)         this.showTimeInSec         = _data.showTimeInSec;
                    if (_data.selectedRoutingGroups) this.selectedRoutingGroups = _data.selectedRoutingGroups;
                    if (_data.columnList && _data.columnList.length == _columnListNames.length) {
                        _data.columnList.forEach((column, index) => column.Name = _columnListNames[index]);
                        this.columnList = _data.columnList;
                    }
                }
                // else {
                //NO SETTINGS FOUND ALL DEFAULT;
                // }
                resolve();
            }).catch(error => {
                reject(error);
            });
        });
      },
      getColumnList() {
        let _listNames = this.$store.state.settings.queueDashboard.tableheadtxt.filter(item => item != this.$store.state.settings.queueDashboard.tableheadtxt[0]);
        let _list = _listNames.reduce((acc, item, index, arr) => {
          let _item  = {};
          _item.Name = arr[index];
          _item.Id   = index;
          if(index <= _listNames.length)
            _item.Active = true;
          else
            _item.Active = false;
          return acc.concat(_item);
        }, []);
        this.columnList = _list;
      },
      propchanged(list) {
        this.columnList = list;
        this.setSettings();
      },
      checkAndRoundValueSLA(val, rgid = '-', rgtitle = '-') {
        return Math.round(val);
      },
      checkAndRoundValueSLAOverall(val, rgid = '-', rgtitle = '-') {
        return Math.round(val);
      },
    },
    created() {
      this.contextMenuItems = [
        {
          icon      : '',
          label     : this.$store.state.settings.queueDashboard.contextmenu[0],
          eventtype : 'null',
          active    : true,
        }, {
          icon      : 'F9BA',
          label     : this.$store.state.settings.queueDashboard.contextmenu[1],
          eventtype : 'agents',
          active    : this.$store.getters.getPermission('BeheerGroepenDashboard'),
        }
        // , {
        //   icon      : 'F403',
        //   label     : this.$store.state.settings.queueDashboard.contextmenu[2],
        //   eventtype : 'pin',
        //   active    : true,
        // }
      ];
    },
    mounted() {
      this.showLoader(true);
      this.supervisedObj  = this.$store.state.loginSession.Details.SupervisedRoutingGroups;
      this.getColumnList();
      this.setSupervisedArr();
      this.getSettings().then(_ => {
        this.getSettingsDone = true;
        IPCCCDashboard.Subscribe('ROUTINGGROUPINFO', this.getData);
      }).catch(error => {
        console.error('Settings not loaded or not set ', error);
      })
    },
    beforeUnmount() {
      IPCCCDashboard.Desubscribe('ROUTINGGROUPINFO', this.getData);
      this.queueTotals  = 0;
      this.totals       = [];
    }
  }
</script>

<style lang="scss" scoped>

  @use "@/scss/includes/functions";
  @use "@/scss/includes/globals";
  @use "@/scss/includes/font";

  .vlist-wrapper,
  .vlist-ribbon,
  .vlist-footer {
    position: absolute;
    right: 20px;
    left: 20px;
    background-color: globals.$color-white;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);
  }

  .vlist-ribbon {
    display: flex;
    top: 20px;
    height: 80px;
    z-index: 200;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
    background-color: functions.tint(globals.$color-black, 95%);
    .vlist-ribbon__group {
      display: flex;
      flex-wrap: nowrap;
      justify-content: flex-start;
      align-items: center;
      position: relative;
      height: 100%;
      &:not(:last-child):after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        border-left: 1px solid globals.$color-gray20;
      }
      &--left,
      &--right {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
      }
      &--left {
        justify-content: flex-start;
      }
      &--right {
        justify-content: flex-start;
      }
      // &--one {
      //   width: 80px;
      //   &--check {
      //     width: 100px;
      //   }
      // }
      // &--two {
      //   width: 160px;
      // }
      // &--three {
      //   width: 240px;
      // }
      .vlist-ribbon__item {
        float: left;
        width: 80px;
        padding: 0 20px;
        .form-textfield--search,
        .form-multiselectfield,
        .form-selectfield {
          margin-top: -2px;
          .multiselect {
            margin-top: -8px !important;
          }
          select {
            margin-left: 0;
            margin-top: -6px;
          }
        }
      }
      .vlist-ribbon__item--button {
        min-width: 80px;
        max-width: 80px;
        div {
          color: globals.$color-performance;
          &:hover {
            color: functions.tint(globals.$color-performance, 30%);
            background-color: transparent;
          }
        }
        label {
          display: block;
          color: globals.$color-gray35;
          font-family: 'Open Sans SemiBold', sans-serif;
          font-size: .7rem;
          width: 100%;
          margin-left: -30%;
          width: calc(100% + 30px);
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
        }
      }
      .vlist-ribbon__item--select {
        min-width: 300px;
        max-width: 300px;
      }
      .vlist-ribbon__item--range {
        min-width: 120px;
        max-width: 120px;
      }
    }
  }

  .multiselect__placeholder {
    opacity: 1 !important;
  }

  .vlist-ribbon__label {
    margin: -4px 0 0 0;
    padding: 0;
    font-size: .8em;
  }

  .vlist-ribbon__item--select-label {
    margin: 6px 0 0 0;
    padding: 0;
    font-size: .8em;
  }

  .vlist-ribbon__togglefield {
    label {
      margin: 0 5px 10px 5px;
      display: block;
      border-radius: 8px;
      width: 32px;
      height: 16px;
      &:before {
        border-radius: 7px;
        width: 14px;
        height: 14px;
      }
    }
    input[type='checkbox']:checked + label:before {
      left: calc(100% - 15px);
    }
    span {
      display: table;
      text-align: center;
      font-size: .7em;
      color: globals.$color-gray35;
      font-family: 'Open Sans SemiBold', sans-serif;
      word-break: keep-all;
      white-space: nowrap;
      overflow: hidden;
      margin-left: -20px;
      width: calc(100% + 40px);
    }
  }

  .vlist-wrapper {
    top: 120px;
    bottom: 75px;
    z-index: 100;
  }

  .vlist-footer {
    bottom: 20px;
    height: 50px;
    z-index: 50;
    span[class^="vlist__cell"] {
      position: relative;
      display: block;
      float: left;
      padding: 0 2px;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-size: .9rem;
      height: 50px;
      line-height: 50px;
    }
  }

  .vlist-content {
    width: 100%;
    background-color: globals.$color-white;
    height: calc(100% - 56px);
    min-height: calc(100% - 56px);
    overflow-x: hidden;
    overflow-y: scroll;
  }


  .vlist__row {
    position: relative;
    height: 45px;
    line-height: 45px;
    width: 100%;
    span[class^="vlist__cell"] {
      position: relative;
      display: block;
      float: left;
      padding: 0 6px;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-size: .9rem;
    }
    &--statusalert:before {
      content: '';
      position: absolute;
      top: 0;
      right: calc(100% - 4px);
      bottom: 0;
      left: 0;
      background-color: globals.$color-warning;
      z-index: 10;
    }
  }

  .vlist-header__row {
    height: 55px;
    line-height: 55px;
    &--bottomborder {
      width: 100%;
      border-bottom: 1px solid globals.$color-gray15;
    }
  }

  .vlist-content__row {
    height: 45px;
    line-height: 45px;
    color: globals.$color-gray60;
    font-size: .9rem;
    width: 100%;
  }

  .vlist__row--zebra {
    background-color: globals.$color-gray5;
  }

  .vlist__row--clickabl[data-clickable="not-clickable"] {
    cursor: default;
  }

  // .vlist__cell--pin {
  //   font-family: 'Material Design Icons';
  //   color: globals.$color-gray40;
  //   width: 20px;
  //   cursor: pointer;
  //   &-pinned {
  //     color: globals.$color-gray80 !important;
  //   }
  // }

  .vlist__cell--icon {
    width: 40px;
    padding-left: 15px;
    &-initials {
      position: relative;
      display: block;
      float: left;
      width: 35px;
      height: 35px;
      line-height: 35px;
      margin: 5px 0 0 0;
      text-align: center;
      color: globals.$color-white;
      background-color: globals.$color-gray20;
      border-radius: 50%;
    }
    &-statusdot {
      position: absolute !important;
      top: 30px;
      right: 0px;
      width: 12px;
      height: 12px;
      z-index: 20;
      border-radius: 50%;
    }
  }

  .vlist__cell--name {
    width: calc(15% - 40px);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    &:after {
      margin-top: 7px;
    }
  }

  .vlist__cell--statusdot {
    margin-top: 15px;
    display: inline-block;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    margin-right: 4px;
  }

  .vlist__cell--dynamic {
    width: 8%;
    &:after {
      margin-top: -47px;
    }
    &.colwidth1 { width: 80%; }
    &.colwidth2 { width: 40%; }
    &.colwidth3 { width: 26.666%; }
    &.colwidth4 { width: 20%; }
    &.colwidth5 { width: 16%; }
    &.colwidth6 { width: 13.333%; }
    &.colwidth7 { width: 11.428%; }
    &.colwidth8 { width: 10%; }
    &.colwidth9 { width: 8.888%; }
    &.colwidth10 { width: 8%; }
    &.colwidth11 { width: 7.272%; }
    &.colwidth12 { width: 6.666%; }
    &.colwidth13 { width: 6.1538%; }
    &.colwidth14 { width: 5.714%; }
    &.colwidth15 { width: 5.333%; }
    &.colwidth16 { width: 5%; }
    &.colwidth17 { width: 4.705%; }
    div {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    div:first-of-type {
      height: 30px;
      line-height: 38px;
    }
    div:last-of-type {
      color: globals.$color-gray80;
      font-family: 'Open Sans Regular', sans-serif;
      font-size: 0.7rem;
      height: 25px;
      line-height: 15px;
    }
  }

  .vlist__cell--contextmenu {
    position: absolute;
    top: 1px;
    right: 2px;
    width: 43px;
    height: 43px;
    font-family: 'Material Design Icons';
    border-radius: 50%;
    text-align: center;
    color: globals.$color-gray35;
    cursor: pointer;
    &:hover {
        background-color: globals.$color-gray5;
        color: globals.$color-performance;
    }
  }

  .vlist_cell--coach {
    position: absolute;
    top: 1px;
    right: 14px;
    width: 43px;
    height: 43px;
    font-family: 'Abel', sans-serif;
    font-size: .75rem;
    text-align: center;
    padding-top: 11px;
    cursor: pointer;
    color: globals.$color-purple;
    background-color: transparent;
    border-left: 1px solid globals.$color-gray15;
    z-index: 10;
    &:before {
      content: '\F2AA';
      position: absolute;
      top: -10px;
      left: 50%;
      display:block;
      transform: translateX(-50%);
      font-family: 'Material Design Icons';
      font-size: 1.5rem;
    }
    &:hover {
      color: globals.$color-white;
      background-color: globals.$color-purple;
    }
  }

  .context-item {
    height: 40px;
    line-height: 40px;
    padding: 0 30px 0 20px;
    cursor: pointer;
    &:hover {
      background-color: globals.$color-gray5;
    }
    &__icon {
      margin-right: 5px;
      font-family: 'Material Design Icons';
      font-weight: normal;
      font-style: normal;
      color: globals.$color-gray60;
    }
    &__label {
      padding-right: 10px;
      font-size: .9em;
      color: globals.$color-gray60;
      &--header {
        font-family: 'Open Sans Bold', sans-serif;
      }
    }
  }

</style>

















































