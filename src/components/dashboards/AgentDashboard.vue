<template>
    <div data-e2e="agent-dashboard">
        <ContextMenu
        :visability  = "contextMenuVisability"
        :position    = "contextPosition"
        :itemList    = "contextMenuItems"
        @mouseisout  = "contextMenu"
        >
            <template v-slot="{ row }">
                <div class="context-item" @click="handleContextAction(row.eventtype)">
                    <component v-if="row.icon !== ''" :is="row.icon" class="context-item__icon" />
                    <span :class="['context-item__label', {'context-item__label--header' : row.eventtype === 'null'}]" :data-e2e="row.label">{{ row.label }}</span>
                </div>
            </template>
        </ContextMenu>
        <AgentToCallgroup
            v-show="atocVisible"
            :visible="atocVisible"
            :user="agentToCallgroupUser"
            @close="agentToCallgroupClose"
        />
        <div class="vlist-ribbon">
            <div class="vlist-ribbon__group--left">
                <div class="vlist-ribbon__group">
                    <div class="vlist-ribbon__item vlist-ribbon__item--select">
                        <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
                            <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings.agentDashboard.searchtxt" @keyup="filterList()">
                        </div>
                    </div>
                </div>
                <div class="vlist-ribbon__group vlist-ribbon__group--two">
                    <div class="vlist-ribbon__item">
                        <toggle-field v-model="showTimeInSec"
                        @change="toggleTime"
                        :label="$store.state.settings.agentDashboard.showtimeinsec"
                        />
                    </div>
                    <div class="vlist-ribbon__item">
                        <toggle-field v-model="showOffQueue"
                        @change="toggleOffQueue"
                        :label="$store.state.settings.agentDashboard.showoffqueue"
                        />
                    </div>
                </div>
                <div class="vlist-ribbon__group">
                    <div class="vlist-ribbon__item vlist-ribbon__item--select">
                        <div class="form-selectfield">
                            <label class="form-label vlist-ribbon__item--select-label">{{ $store.state.settings.agentDashboard.statuslabel }}</label>
                            <select v-model="alertStatus" @change="setAlertStatus">
                                <option value="-1">{{ $store.state.settings.agentDashboard.statusalertlbl}}</option>
                                <option v-for="status in statusList" :value="status.StatusId">{{ status.Label }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="vlist-ribbon__item vlist-ribbon__item--range">
                        <RangeSliderSelect
                            :label     = "$store.state.settings.agentDashboard.timelabel"
                            :min       = "1"
                            :max       = "120"
                            :step      = "1"
                            :value     = "alertTreshold"
                            unit       = "min"
                            @onchange  = "updateStatusTreshold"
                        />
                    </div>
                </div>
            </div>
            <div class="vlist-ribbon__group--right">
                <div class="vlist-ribbon__group">
                    <div class="vlist-ribbon__item vlist-ribbon__item--select">
                        <div class="form-multiselectfield">
                            <label class="form-label vlist-ribbon__label">{{ $store.state.settings.agentDashboard.grouplabel }}</label>
                            <VueMultiselect
                                v-model          = "selectedRoutingGroups"
                                :options         = "selectableRoutingGroups"
                                :multiple        = "true"
                                :searchable      = "false"
                                :close-on-select = "false"
                                :clear-on-select = "false"
                                :placeholder     = "$store.state.settings.agentDashboard.rgSelectorDefaulttxt"
                                label            = "Name"
                                track-by         = "Name"
                            />
                        </div>
                    </div>
                </div>
                <div class="vlist-ribbon__group vlist-ribbon__group--one">
                    <div class="vlist-ribbon__item vlist-ribbon__item--togglelist">
                        <MenuToggleList
                            :list="columnList"
                            @propChanged="propchanged"
                        />
                        <label>{{ $store.state.settings.agentDashboard.columnslbl }}</label>
                    </div>
                </div>
                <div v-if="!isdashboardwindow" class="vlist-ribbon__group vlist-ribbon__group--one">
                    <div class="vlist-ribbon__item vlist-ribbon__item--button">
                        <div class="button__icon" @click="openDashboardWin()">
                            <open-in-new />
                            <label>{{ $store.state.settings.agentDashboard.newwindow }}</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="columnList.length > 0" class="vlist-wrapper">

            <div class="vlist__row vlist-header__row">
                <span class="vlist__cell--pin">&nbsp;</span>
                <span class="vlist__cell--icon">&nbsp;</span>
                <span @click="sortColumn($event, 'GebruikerNaam')" data-sortorder="NONE" class="vlist__cell--name">{{ $store.state.settings.agentDashboard.tableheadtxt[0] }}</span>
                <span v-if="columnList[0].Active" @click="sortColumn($event, 'statusLabel')"     data-sortorder="NONE" class="vlist__cell--dynamic" :class="getColWidth">{{ $store.state.settings.agentDashboard.tableheadtxt[1] }}</span>
                <span v-if="columnList[1].Active" @click="sortColumn($event, 'StatusSeconden')"  data-sortorder="NONE" class="vlist__cell--dynamic" :class="getColWidth">{{ $store.state.settings.agentDashboard.tableheadtxt[2] }}</span>
                <span v-if="columnList[2].Active" @click="sortColumn($event, 'AantalCalls')"     data-sortorder="NONE" class="vlist__cell--dynamic" :class="getColWidth">{{ $store.state.settings.agentDashboard.tableheadtxt[3] }}</span>
                <span v-if="columnList[3].Active" @click="sortColumn($event, 'ATT')"             data-sortorder="NONE" class="vlist__cell--dynamic" :class="getColWidth">{{ $store.state.settings.agentDashboard.tableheadtxt[4] }}</span>
                <span v-if="columnList[4].Active" @click="sortColumn($event, 'AWT')"             data-sortorder="NONE" class="vlist__cell--dynamic" :class="getColWidth">{{ $store.state.settings.agentDashboard.tableheadtxt[5] }}</span>
                <span v-if="columnList[5].Active" @click="sortColumn($event, 'AHT')"             data-sortorder="NONE" class="vlist__cell--dynamic" :class="getColWidth">{{ $store.state.settings.agentDashboard.tableheadtxt[6] }}</span>
                <span v-if="columnList[6].Active" @click="sortColumn($event, 'break')"           data-sortorder="NONE" class="vlist__cell--dynamic" :class="getColWidth">{{ $store.state.settings.agentDashboard.tableheadtxt[7] }}</span>
            </div>
            <!-- START AGENT LIST -->
            <VirtualListViewer
                class="vlist-content"
                :data       = "enrichedList"
                rowClasses  = "vlist-content__row vlist-content__row--clickable"
                >
                <template v-slot="{ row, index }">
                    <div :class="['vlist__row', {'vlist__row--zebra' : index % 2 == 0, 'vlist__row--statusalert' : row.statusAlert}]" :key="row.GebruikerId + (Math.random() * 100)" :data-onqueue="row.OnQueue ? 'on' : 'off'">
                        <span :class="['vlist__cell--pin', {'vlist__cell--pin-pinned' : pinnedAgents.indexOf(row.GebruikerId) !== -1}]" @click="pinAgent(row.GebruikerId)">
                            <pin v-if="row.pinIcon" />
                            <pin-off v-else />
                        </span>
                        <span class="vlist__cell--icon">
                            <span v-if="row.Coached" class="vlist__cell--icon-iscoached">
                                <school />
                            </span>
                            <span class="vlist__cell--icon-statusdot" :style="bgColor(row.statusColor)"></span>
                            <span class="vlist__cell--icon-initials" v-html="row.initials"></span>
                        </span>
                        <span class="vlist__cell--name">
                            <span>{{ row.GebruikerNaam }}</span>
                            <span>
                                <PhoneIncoming v-if="row.CallOrigin == CallOrigin.PBXInOut || row.CallOrigin == CallOrigin.DirectRootIn" />
                                <PhoneOutgoing v-if="row.CallOrigin == CallOrigin.VoIPOut" />
                                <ArrowBottomLeft v-if="row.CallOrigin == CallOrigin.ServiceNumber" />
                            </span>
                        </span>
                        <span v-if="columnList[0].Active"  class="vlist__cell--dynamic vlist__cell--status" :class="getColWidth">
                            <span :style="bgColor(row.statusColor)"></span>
                            {{ row.statusLabel }}
                        </span>
                        <span v-if="columnList[1].Active"  class="vlist__cell--dynamic" :class="getColWidth" v-html="row.StatusSeconden"></span>
                        <span v-if="columnList[2].Active"  class="vlist__cell--dynamic" :class="getColWidth" v-html="row.AantalCalls"></span>
                        <span v-if="columnList[3].Active"  class="vlist__cell--dynamic" :class="getColWidth" v-html="row.ATT"></span>
                        <span v-if="columnList[4].Active"  class="vlist__cell--dynamic" :class="getColWidth" v-html="row.AWT"></span>
                        <span v-if="columnList[5].Active"  class="vlist__cell--dynamic" :class="getColWidth" v-html="row.AHT"></span>
                        <span v-if="columnList[6].Active"  class="vlist__cell--dynamic" :class="getColWidth" v-html="row.break"></span>
                        <div v-if="permissionToSupervise(row)" :data-e2e="row.GebruikerNaam" class="vlist__cell--contextmenu" @click="contextMenu($event, row.GebruikerId, row.GebruikerNaam)">
                            <dots-vertical />
                        </div>
                    </div>
                </template>
            </VirtualListViewer>
            <!-- END AGENT LIST -->
        </div>
        <div v-if="columnList.length > 0" class="vlist-footer">
            <span class="vlist__cell--pin">&nbsp;</span>
            <span class="vlist__cell--icon">&nbsp;</span>
            <span class="vlist__cell--name">{{ agentTotals }}</span>
            <span v-if="columnList[0].Active" class="vlist__cell--dynamic" :class="getColWidth">{{ queueTotals }}</span>
            <span v-if="columnList[1].Active" class="vlist__cell--dynamic" :class="getColWidth">&nbsp;</span>
            <span v-if="columnList[2].Active" class="vlist__cell--dynamic" :class="getColWidth">{{ totalCalls }}</span>
            <span v-if="columnList[3].Active" class="vlist__cell--dynamic" :class="getColWidth">{{ avgAct }}</span>
            <span v-if="columnList[4].Active" class="vlist__cell--dynamic" :class="getColWidth">{{ avgAwt }}</span>
            <span v-if="columnList[5].Active" class="vlist__cell--dynamic" :class="getColWidth">{{ avgAht }}</span>
            <span v-if="columnList[6].Active" class="vlist__cell--dynamic" :class="getColWidth">{{ avgPause }}</span>
        </div>
    </div>
</template>

<script>

/**
 *
 * uniqByKeepLast and updateStatusus: fix for getting one contactupdate multiple times within 5 x 1000ms
 *
 * TODO
 * if CS browsertab is not active then desubscribe and retun then subscribe.
 *
 * @version 1.0
 * @author Erik Rosenhart
 *
 * @todo
 *
 */

//  const CallOrigin = {
//     NoCall : 0, //geen icoon
//     ServiceNumber : 1,
//     DirectRootIn : 2,
//     PBXInOut : 3,
//     VoIPOut : 4
//  }


import { IPCCCStatus }              from './../../ipccc/js/status.js';
import { IPCCCContacts }            from './../../ipccc/js/contacts.js'
import { IPCCCDashboard }           from './../../ipccc/js/dashboard.js';
import { IPCCCUserSettings }        from './../../ipccc/js/usersettings.js';
import { dynamicSort }              from './../../use/sortFunctions';
import { durationTime  }            from './../../use/dateFunctions';
import VirtualListViewer            from './../uielements/VirtualListViewer.vue';
import RangeSliderSelect            from './../v2_components/RangeSliderSelect.vue';
import ContextMenu                  from './../v2_components/ContextMenu.vue';
import AgentToCallgroup             from './Agent-to-callgroup.vue';
import MenuToggleList               from './MenuToggleList.vue';
import VueMultiselect               from 'vue-multiselect';
import ToggleField                  from './../uielements/ToggleField.vue';
import { nextTick }                 from '@vue/runtime-core';

import { LANGUAGE }                 from './../../settings/langlabels';

import {
        School,
        Pin,
        PinOff,
        DotsVertical,
        OpenInNew,
        Adjust,
        Glasses,
        ArrowDecision,
        PhoneIncoming,
        PhoneOutgoing,
        ArrowTopRight,
        ArrowBottomLeft
        }                            from 'mdue';

export default {
    name: 'Agents',
    props: ['isdashboardwindow'],
    data: () => {
        return {
            callTypes               : IPCCCDashboard.Enums.CallTypes,
            agentData               : null,
            statusList              : [],
            pinnedAgents            : [],
            routingGroups           : [],
            userMetrics             : [],
            notSortedList           : [],
            enrichedList            : [],
            statusTimes             : [],
            pauseId                 : 8,
            showOffQueue            : false,
            showTimeInSec           : false,
            // startTime               : 0,
            // timer                   : null,
            // ticker                  : 0,
            // agentsToUpdate          : [],
            // updateTimer             : null,
            // updateBuffer            : 1000,
            // countUpdates            : 0,
            // maxUpdates              : 5,
            sortSetting             : {},
            searchStr               : '',
            supervisedRoutingGroups : [],
            selectedRoutingGroups   : [],
            numberOfAgents          : 0,
            agentsInQueue           : 0,
            totalCalls              : 0,
            avgAct                  : 0,
            avgAwt                  : 0,
            avgAht                  : 0,
            avgPause                : 0,
            alertStatus             : -1,
            alertTreshold           : 10,
            contextMenuVisability   : false,
            contextPosition         : {
            x : 0,
            y : 0,
            },
            contextMenuItems        : [],
            currentAgentId          : -1,
            atocVisible             : false,
            agentToCallgroupUser    : null,
            getSettingsDone         : false,
            columnList              : [],
            listNames               : [],
            CallOrigin : {
                NoCall : 0, //geen icoon
                ServiceNumber : 1,
                DirectRootIn : 2,
                PBXInOut : 3,
                VoIPOut : 4
            }
        }
    },
    components: {
    VirtualListViewer,
    RangeSliderSelect,
    ContextMenu,
    AgentToCallgroup,
    MenuToggleList,
    VueMultiselect,
    School,
    Pin,
    PinOff,
    DotsVertical,
    ToggleField,
    OpenInNew,
    Adjust,
    Glasses,
    ArrowDecision,
    PhoneOutgoing,
    PhoneIncoming,
    ArrowBottomLeft,
    ArrowTopRight
},
    inject: ['showLoader'],
    computed: {
        getColWidth() {
            return 'colwidth' + this.columnList.filter(item => item.Active).length;
        },
        superviseableAgents() {
            return this.supervisedRoutingGroups.map(rg => rg.Id);
        },
        selectableRoutingGroups() {
            return this.routingGroups.map(rg => ({Id: rg.Id, Name: rg.Description}));
        },
        agentTotals() {
            let _str = (this.enrichedList.length > 1) ? ' ' + this.$store.state.settings.agentDashboard.agents[0] : ' ' + this.$store.state.settings.agentDashboard.agents[1];
            return this.numberOfAgents + _str;
        },
        queueTotals() {
            return this.agentsInQueue + ' ' + this.$store.state.settings.agentDashboard.available;
        }
    },
    watch: {
      selectedRoutingGroups: function(newVal, oldVal) {
        if(this.getSettingsDone) {
          this.setRoutingGroups();
        }
      }
    },
    methods: {
        contextMenu(evt, agentId = -1) {
            if(evt.type.toLowerCase() === 'mouseisout') {
                this.currentAgentId        = -1;
                this.contextMenuVisability = false;
            } else {
                this.currentAgentId             = agentId;
                this.contextMenuItems[2].active = this.isdashboardwindow ? false :
                                                    this.$store.getters.getPermission('PerformanceCoach') && !this.$store.state.navigation.hasActiveLine;
                                                    // (!this.$store.state.commands.SupervisorCoach &&
                                                    // !this.$store.state.commands.SupervisorHangupAgent &&
                                                    // !this.$store.state.commands.SupervisorJoin &&
                                                    // !this.$store.state.commands.SupervisorListen &&
                                                    // !this.$store.state.commands.SupervisorLogout &&
                                                    // !this.$store.state.commands.SupervisorMuteAgent &&
                                                    // !this.$store.state.commands.SupervisorSetStatus);
                this.contextMenuItems[4].icon   = this.pinnedAgents.indexOf(agentId) !== -1 ? 'PinOff' : 'Pin';
                this.contextMenuItems[4].label  = this.pinnedAgents.indexOf(agentId) !== -1 ? this.$store.state.settings.agentDashboard.contextmenu[5] : this.$store.state.settings.agentDashboard.contextmenu[4];
                this.contextMenuVisability      = true;
                this.contextPosition            = {
                                                    x : evt.clientX,
                                                    y : evt.clientY,
                                                    };
            }
        },
        handleContextAction(eventType) {
            switch(eventType) {
                case 'status':
                    this.setAgentStatus(this.currentAgentId);
                    this.contextMenuVisability = false;
                    break;
                case 'coaching':
                    this.coachAgent(this.currentAgentId);
                    this.contextMenuVisability = false;
                    break;
                case 'callgroups':
                    this.agentToCallgroupOpen(this.currentAgentId);
                    this.contextMenuVisability = false;
                    break;
                case 'pin':
                    this.pinAgent(this.currentAgentId);
                    this.contextMenuVisability = false;
                    break;
                default:
                    return false;
            }
        },
        filterList() {
            this.enrichedList    = this.filterListOnString(this.notSortedList, this.searchStr.toLowerCase());
            this.numberOfAgents  = this.enrichedList.length;
            let _count           = this.enrichedList.filter(a => [2, 3, 4].indexOf(a.StatusId) > -1);
            this.agentsInQueue   = _count.length;
        },
        filterListOnString(list, str) {
            if(str != '') {
            let _rawList = [...list];
            return _rawList.filter(item => {
                return item.GebruikerNaam.toLowerCase().indexOf(str) != -1 ||
                    item.statusLabel.toLowerCase().indexOf(str) != -1;
            });
            } else {
            return [...list];
            }
        },
        sortColumn(evt = null, prop) {
            let _order,
                _t;

            if(evt != null) {
            _t     = evt.currentTarget;
            _order = _t.getAttribute('data-sortorder');
            document.querySelectorAll('[data-sortorder]').forEach( a => a.setAttribute('data-sortorder', 'NONE'));
            this.sortSetting = {
                'prop'  : prop,
                'order' : _order
            }
            } else {
            _order = this.sortSetting.order;
            prop   = this.sortSetting.prop;
            }

            switch(_order) {
            case 'NONE':
                this.enrichedList.sort(dynamicSort(prop));
                if(evt != null)
                _t.setAttribute('data-sortOrder', 'ASC');
                break;
            case 'ASC':
                this.enrichedList.sort(dynamicSort('-' + prop));
                if(evt != null)
                _t.setAttribute('data-sortOrder', 'DES');
                break;
            case 'DES':
                this.enrichedList = this.filterListOnString(this.notSortedList, this.searchStr.toLowerCase());
                //this.setTotals();
                if(evt != null)
                _t.setAttribute('data-sortOrder', 'NONE');
                break;
            }
        },
        // startTicker() {
        //   this.timer = setInterval(() => {
        //     this.ticker++;
        //     this.updateStatusTime();
        //   }, 1000);
        // },
        // stopTicker() {
        //   if(this.timer !== null) {
        //     clearInterval(this.timer);
        //     this.ticker = 0;
        //     this.timer  = null;
        //   }
        // },
        // updateStatusTime() {
        //   this.enrichedList.forEach(agent => {
        //     agent.StatusSeconden = this.showTimeInSec ? Math.round(agent.startTime + this.ticker) : durationTime(agent.startTime + this.ticker);
        //   });
        // },
        updateRow(UserId, prop, value) {
            let _indexToMutate = this.enrichedList.findIndex(agent => agent.GebruikerId == UserId);
            this.enrichedList[_indexToMutate][prop] = value;
        },
        pinAgent(UserId) {
            if(this.pinnedAgents.indexOf(UserId) !== -1) {
            let _index = this.pinnedAgents.findIndex(el => el == UserId);
            this.pinnedAgents.splice(_index, 1);
            } else {
            this.pinnedAgents.push(UserId);
            }
            this.updateRow(UserId, 'pinIcon', this.setPinIcon(UserId));
            this.enrichAgentData();
        },
        setPinIcon(UserId) {
            return this.pinnedAgents.indexOf(UserId) !== -1;
        },
        bgColor(color) {
            return `background-color:${color}`;
        },
        // getStatusCharacteristics(id) {
        //   let _status = this.statusList.find(status => status.StatusId == id),
        //       _result;
        //   if(_status) {
        //     _result = {
        //       color : `#${_status.Color}`,
        //       label : _status.Label
        //     };
        //   } else {
        //     _result = {
        //       color : '#FFFFFF',
        //       label : '-'
        //     };
        //   }
        //   return _result;
        // },
        //ENRICH DATA
        checkIfAgentIsInRoutingGroup(agentRoutinggroups, selRgIds) {
            if(agentRoutinggroups.length > 0 && selRgIds.length > 0) {
            return agentRoutinggroups.some(rgId => selRgIds.includes(rgId));
            } else {
            return true;
            }
        },
        enrichAgentData() {
            // this.stopTicker();
            this.agentData.postMessage({
            data                  : JSON.parse(JSON.stringify(this.userMetrics)),
            routingGroups         : JSON.parse(JSON.stringify(this.routingGroups)),
            selectedRoutingGroups : this.selectedRoutingGroups.map(rg => rg.Id),
            statusList            : JSON.parse(JSON.stringify(this.statusList)),
            coacheable            : this.$store.getters.getPermission('PerformanceCoach'),
            pinnedAgents          : JSON.parse(JSON.stringify(this.pinnedAgents)),
            showOffQueue          : this.showOffQueue,
            showTimeInSec         : this.showTimeInSec,
            alertStatus           : this.alertStatus,
            alertTreshold         : this.alertTreshold,
            });

        },
        // uniqByKeepLast(a, key) {
        //   return ([...new Map(a.map(x => [key(x), x])).values()]);
        // },
        // updateStatusus(agents) {
        //   clearInterval(this.updateTimer);
        //   agents.forEach(agent => {
        //     let _agentToUpdate            = this.enrichedList.find(a => a.GebruikerId == agent.UserId),
        //         _status                   = this.getStatusCharacteristics(agent.StatusId);
        //     if(_agentToUpdate) {
        //       _agentToUpdate.StatusId       = agent.StatusId;
        //       _agentToUpdate.statusColor    = _status.color;
        //       _agentToUpdate.statusLabel    = _status.label;
        //       _agentToUpdate.startTime      = -1 * this.ticker;
        //       _agentToUpdate.StatusSeconden = durationTime(0);
        //     }
        //   });
        //   this.countUpdates   = 0;
        //   this.agentsToUpdate = [];
        // },
        // contactUpdate(updatedContact) {
        //   clearInterval(this.updateTimer);
        //   if(updatedContact.UserId !== -1) {
        //     this.countUpdates++;
        //     this.agentsToUpdate.push(updatedContact);
        //     this.agentsToUpdate = this.uniqByKeepLast(this.agentsToUpdate, item => item.a);
        //     if(this.countUpdates <= this.maxUpdates) {
        //       this.updateTimer = setTimeout(this.updateStatusus, this.updateBuffer, this.agentsToUpdate);
        //     } else {
        //       this.updateStatusus( JSON.parse(JSON.stringify(this.agentsToUpdate)) );
        //     }
        //   }
        // },
        agentDashboardSubscribe(data) {
            if(typeof data !== 'undefined') {
            this.routingGroups      = data.Routinggroups;
            this.userMetrics        = data.UserMetrics;
            this.enrichAgentData();
            this.showLoader(false);
            }
        },
        getAgentData() {
            IPCCCDashboard.Subscribe('SUPVISUSERMETRICS', this.agentDashboardSubscribe)
            .catch(e => console.error('Error: ', e));
        },
        deSubscripe(ready) {
            // this.stopTicker();
            IPCCCDashboard.Desubscribe('SUPVISUSERMETRICS', this.agentDashboardSubscribe);
            // IPCCCContacts.Update.removeHandler(this.contactUpdate);
            if(typeof ready === 'function')
            ready();
        },
        coachAgent(aId) {
            this.$store.commit('SET_SNACKBAR', {
            isVisible: true,
            module: 'CoachUser',
            templatename: 'coach-user-snackbar',
            data: {
                userId   : aId,
                liveUser : this.enrichedList.find(agent => agent.GebruikerId == aId),
            },
            });
        },
        setAgentStatus(aId) {
            this.$store.commit('SET_SNACKBAR', {
            isVisible: true,
            module: 'SetUserStatus',
            templatename: 'setuser-status-snackbar',
            data: {
                userId   : aId,
                liveUser : this.enrichedList.find(agent => agent.GebruikerId == aId),
            },
            });
        },
        agentToCallgroupOpen(aId) {
            let _agent = this.enrichedList.find(agent => agent.GebruikerId == aId);
            this.agentToCallgroupUser = {
            userId    : aId,
            fullName  : _agent.GebruikerNaam,
            liveUser  : _agent,
            };
            this.atocVisible = true;
        },
        agentToCallgroupClose() {
            this.atocVisible = false;
        },
        permissionToSupervise(user) {
            return (this.$store.getters.getPermission('PerformanceCoach') || this.$store.getters.getPermission('BeheerAgentenDashboard')) &&
            user.GebruikerId != this.$store.state.loginSession.Details.UserId &&
            user.inRoutingGroups.some(rg => this.superviseableAgents.indexOf(rg) >= 0);
        },
        toggleOffQueue() {
            this.showOffQueue = !this.showOffQueue;
            this.setSettings();
            this.enrichAgentData();
        },
        toggleTime() {
            this.showTimeInSec = !this.showTimeInSec;
            this.setSettings();
            this.enrichAgentData();
        },
        setAlertStatus() {
            this.setSettings();
            this.enrichAgentData();
        },
        updateStatusTreshold(evt) {
            this.alertTreshold = evt;
            this.setSettings();
            this.enrichAgentData();
        },
        setRoutingGroups() {
            this.setSettings();
            this.enrichAgentData();
        },
        openDashboardWin() {
            let _loc = `${window.siteroot}dashboard.html?sessionId=${this.$store.state.loginSession.SessionId}&lang=${this.$store.getters.getLang()}&dashcomp=AgentDashboard&ver=${Math.random()}`;
            window.dashboardWinRef = window.open(_loc, 'ContactSuite Dashboard');
        },
        setSettings() {
            let _filterSettings = {
                showTimeInSec         : this.showTimeInSec,
                showOffQueue          : this.showOffQueue,
                alertStatus           : this.alertStatus,
                alertTreshold         : this.alertTreshold,
                selectedRoutingGroups : this.selectedRoutingGroups,
                columnList            : this.columnList,
            };
            IPCCCUserSettings.Save('AgentDashboardSettings', 'AgentDashboardUserSettings', JSON.stringify(_filterSettings))
            .catch(error => {
                console.error(error);
            });
        },
        getSettings() {
            return new Promise((resolve, reject) => {
                IPCCCUserSettings.Get('AgentDashboardSettings')
                .then(result => {
                    if(result.length > 0 && result[0].Name == 'AgentDashboardUserSettings') {
                        let _data = JSON.parse(result[0].Data),
                            _columnListNames = this.$store.state.settings.agentDashboard.tableheadtxt.filter(item => item != this.$store.state.settings.agentDashboard.tableheadtxt[0]);
                        if(_data.showTimeInSec)         this.showTimeInSec           = _data.showTimeInSec;
                        if(_data.showOffQueue)          this.showOffQueue            = _data.showOffQueue;
                        if(_data.alertStatus)           this.alertStatus             = _data.alertStatus;
                        if(_data.alertTreshold)         this.alertTreshold           = _data.alertTreshold;
                        if(_data.selectedRoutingGroups) this.selectedRoutingGroups   = _data.selectedRoutingGroups;
                        if(_data.columnList && _data.columnList.length == _columnListNames.length) {
                            this.columnList = _data.columnList;
                        }
                    }
                    // } else {
                    //NO SETTINGS FOUND ALL DEFAULT;
                    // }
                    resolve();
                })
                .catch(error => {
                    reject(error);
                });
            });
        },
        getColumnList() {
            let _listNames = this.$store.state.settings.agentDashboard.tableheadtxt.filter(item => item != this.$store.state.settings.agentDashboard.tableheadtxt[0]);
            let _list = _listNames.reduce((acc, item, index, arr) => {
                let _item  = {};
                _item.Name = arr[index];
                _item.Id   = index;
                if(index <= _listNames.length) {
                    _item.Active = true;
                } else {
                    _item.Active = false;
                }
                return acc.concat(_item);
            }, []);
            this.columnList = _list;
        },
        propchanged(list) {
            this.columnList = list;
            this.setSettings();
        },
        setContextMenu() {
            this.contextMenuItems = [
                {
                    icon      : '',
                    label     : this.$store.state.settings.agentDashboard.contextmenu[0],
                    eventtype : 'null',
                    active    : true,
                }, {
                    icon      : 'Adjust',
                    label     : this.$store.state.settings.agentDashboard.contextmenu[1],
                    eventtype : 'status',
                    active    : this.isdashboardwindow ? false : this.$store.getters.getPermission('PerformanceCoach'),
                }, {
                    icon      : 'Glasses',
                    label     : this.$store.state.settings.agentDashboard.contextmenu[2],
                    eventtype : 'coaching',
                    active    : this.isdashboardwindow ? false : this.$store.getters.getPermission('PerformanceCoach'),
                }, {
                    icon      : 'ArrowDecision',
                    label     : this.$store.state.settings.agentDashboard.contextmenu[3],
                    eventtype : 'callgroups',
                    active    : this.$store.getters.getPermission('BeheerAgentenDashboard'),
                }, {
                    icon      : 'Pin',
                    label     : this.$store.state.settings.agentDashboard.contextmenu[4],
                    eventtype : 'pin',
                    active    : true,
                }
            ];
        },
    },
    created() {
        if(this.$store.state.settings) {
            this.setContextMenu();
        } else {
            this.$store.commit('SET_SETTINGS_UPDATE', { data: Object.assign({}, LANGUAGE.language[this.$store.getters.getLang()]) });
            this.setContextMenu();
        }
    },
    mounted() {
        this.showLoader(true);

        const settingReady = () => {
            let workerUrl            = window.siteroot + 'assets/webworkers/enrichAgentData.js';
            this.agentData           = new Worker(workerUrl);

            this.agentData.onmessage = (evt) => {
                this.enrichedList   = JSON.parse(JSON.stringify(evt.data.data));
                this.numberOfAgents = evt.data.totals.totalAgents;
                this.agentsInQueue  = evt.data.totals.queueTotals;
                this.totalCalls     = evt.data.totals.totalCalls;
                this.avgAct         = evt.data.totals.avgAct;
                this.avgAwt         = evt.data.totals.avgAwt;
                this.avgAht         = evt.data.totals.avgAht;
                this.avgPause       = evt.data.totals.avgPause;

                this.notSortedList  = [...this.enrichedList];

                this.filterList();
                this.sortColumn(null, this.sortSetting.prop);
                // this.startTicker();
                if(this.showLoader) this.showLoader(false);
            };

            this.supervisedRoutingGroups = this.$store.state.loginSession.Details.SupervisedRoutingGroups;

            IPCCCStatus.GetCompanyStatusList()
            .then(success => {
                this.statusList = [...success];
                this.getAgentData();
            })
            .catch(e => console.log('Error: ' + e));

            // IPCCCContacts.Update.addHandler(this.contactUpdate);
        }

        this.getColumnList();

        this.getSettings().then(settings => {
            this.getSettingsDone = true;
            settingReady();
        }).catch(error => {
            console.error('Settings not loaded or not set', error);
            settingReady();
        });
    },
    beforeUnmount() {
        this.deSubscripe(_ => {
            this.$store.commit('SET_SNACKBAR', {
                isVisible: false,
                module: '',
                templatename: '',
                data: {},
            });
        });
        this.agentData.terminate();
    }
}

</script>

<style lang="scss" scoped>


@use "@/scss/includes/font";
@use "@/scss/includes/globals";
@use "@/scss/includes/functions";

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
        &--one {
            width: 80px;
            &--check {
            width: 100px;
            }
        }
        &--two {
            width: 160px;
        }
        &--three {
            width: 240px;
        }
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
        .vlist-ribbon__item--togglelist {
            text-align: center;
            padding: 0 10px;
            label {
                display: block;
                color: globals.$color-gray35;
                font-family: 'Open Sans SemiBold', sans-serif;
                font-size: .7rem;
                width: 100%;
                white-space: nowrap;
                overflow: visible;
            }
        }
        .vlist-ribbon__item--button {
            padding: 0;
            min-width: 80px;
            max-width: 80px;
            min-height: 80px;
            max-height: 80px;
            text-align: center;
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
            white-space: nowrap;
            overflow: hidden;
            }
        }
        .vlist-ribbon__item--select {
            min-width: 280px;
            // max-width: 300px;
        }
        .vlist-ribbon__item--range {
            min-width: 120px;
            // max-width: 120px;
        }
    }
}

.multiselect__placeholder {
    opacity: 1 !important;
}

.button__icon {
    cursor: pointer;
    user-select: none;
    width: 80px;
    height: 80px;
    margin: 0;
    svg {
        width: 22px;
        height: 22px;
        vertical-align: bottom;
    }
    span {
        float: left;
        text-align: center;
        font-size: .7em;
        color: globals.$color-gray35;
        @include font.font-normal();
        word-break: keep-all;
        white-space: nowrap;
        overflow: hidden;
        margin-top: -5px;
        width: 80px;
    }
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
        @include font.font-normal();
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
    height: calc(100% - 46px);
    min-height: calc(100% - 46px);
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
        float: left;
        padding: 0 6px;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-size: .9rem;
        overflow: hidden;
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
    border-bottom: 1px solid globals.$color-gray15;
    overflow: hidden;
    padding-right: 20px;
    width: 100%;
}

.vlist-content__row {
    height: 45px;
    line-height: 45px;
    color: globals.$color-gray60;
    font-size: .9rem;
    width: 100%;
}

.vlist__row[data-onqueue='off'] {
    box-shadow: inset 0 0 0 25px rgb(globals.$color-unavailable, 10%);

    & ~ .vlist__row[data-onqueue='off'] {
        border-top: none;
    }
}

.vlist__row--zebra {
    background-color: globals.$color-gray5;
}

.vlist__row--clickabl[data-clickable="not-clickable"] {
    cursor: default;
}

.vlist__cell--pin {
    color: globals.$color-gray40;
    width: 20px;
    cursor: pointer;
    &-pinned {
        color: globals.$color-gray80 !important;
    }
    svg {
        margin-top: 2px;
        margin-bottom: -2px;
    }
}

.vlist__cell--icon {
    width: 45px;
    &-initials {
        position: relative;
        display: block;
        float: left;
        width: 35px;
        height: 35px;
        line-height: 35px;
        margin: 5px 0 0 3px;
        text-align: center;
        color: globals.$color-white;
        background-color: globals.$color-gray20;
        border-radius: 50%;
    }
    &-iscoached {
        position: absolute !important;
        top: -12px;
        left:-2px;
        width: 20px;
        font-family: 'Material Design Icons';
        color: globals.$color-gray60;
        z-index: 10;
    }
    &-statusdot {
        position: absolute !important;
        top: 29px;
        right: -2px;
        width: 12px;
        height: 12px;
        z-index: 20;
        border-radius: 50%;
    }
  }

.vlist__row span.vlist__cell--icon {
    overflow: visible;
}

.vlist-header__row .vlist__cell--name,
.vlist-footer .vlist__cell--name {
    width: calc(25% - 65px);
}

.vlist-content .vlist__cell--name {
    width: calc(25% - 65px);
    display: flex;
    justify-content: flex-start;
    span:first-of-type {
        margin-right: auto;
    }
    span:last-of-type {
        width: 20px;
        color: globals.$color-gray60;
        font-size: 1.2rem;
        svg {
            margin-top: 2px;
            margin-bottom: -2px;
        }
    }
}

.vlist__cell--dynamic {
    width: 8%;
    &.colwidth1 { width: 70%; }
    &.colwidth2 { width: 35%; }
    &.colwidth3 { width: 23.333%; }
    &.colwidth4 { width: 17.5%; }
    &.colwidth5 { width: 14%; }
    &.colwidth6 { width: 11.666%; }
    &.colwidth7 { width: 10%; }
    &.colwidth8 { width: 8.75%; }
    &.colwidth9 { width: 7.777%; }
    &.colwidth10 { width: 7%; }
    &.colwidth11 { width: 6.363%; }
    div {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
}

.vlist__cell--status {
    span {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 4px;
    }
}

.vlist__cell--status {
    border-right: 1px solid globals.$color-gray20;
}

.vlist-footer .vlist__cell--status,
.vlist-header__row  .vlist__cell--status {
    border-right: none;
}

.vlist__cell--contextmenu {
    position: absolute;
    top: 1px;
    right: 2px;
    width: 43px;
    height: 43px;
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
        float: left;
        margin: 10px 8px 0 -5px;
        width: 20px;
        height: 20px;
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