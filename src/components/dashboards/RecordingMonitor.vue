<script lang="ts">
export default {
    inheritAttrs: false,
    customOptions: {
        name: "RecordingMonitor"
    },
    components: {
        LaneToggler,
        RecordingMonitorFilters,
        RecordingMonitorPlayer,
        ExportListToXLSX,
    }
}
</script>

<script setup lang="ts">

import { inject } from "@vue/runtime-core";
import { ref, computed } from "@vue/reactivity";
import { markRaw, onMounted, reactive } from "vue";
import { useStore } from 'vuex';
import {
		convertISOToDateTime,
        secondsToTimeHHMMSS
		}						from '../../use/dateFunctions';
import {
        PhoneIncoming,
        PhoneOutgoing,
        ArrowTopRight,
        ArrowBottomLeft,
        Magnify
        }                  from 'mdue';
import BoxProps, { ModalType } from '../../types/BoxProps';
import VirtualListViewer    from './../uielements/VirtualListViewer.vue';
import { dynamicSort }      from '../../use/sortFunctions';
import { IPCCCData } from "../../ipccc/js/data";
import { IPCCCDashboard } from "../../ipccc/js/dashboard";
import LaneToggler from "../uielements/LaneToggler.vue";
import RecordingMonitorFilters from "./RecordingMonitorFilters.vue";
import RecordingMonitorPlayer from "./RecordingMonitorPlayer.vue";
import { EnumFilterDataValues, EnumRecordingType } from '../../types/RecordingMonitor';
import { IPCCCUserSettings }  from '../../ipccc/js/usersettings.js';
import ExportListToXLSX  from '../uielements/ExportListToXLSX.vue';
import { EnumNoteColors } from '../../types/RecordingMonitor';

const store:object | any = useStore(),
	selectedCustomerId	 = ref(-1),
	showLoader			 = inject('showLoader') as Function,
	showModalDialog		 = inject('showModalDialog') as Function,
	rawList				 = ref([]),
	displayList			 = ref([]),
	totalItems			 = ref(0),
    callTypes            = IPCCCDashboard.Enums.CallTypes,
	filterValues		 = ref({}),
    autoPlay             = ref(false),
    isMassxess           = computed(() => store.getters.getCustomerInfo().customerId === 1),
    onlyUserIdRecordings = computed(() => !store.getters.getPermission('OpnamenAfspelenBelgroep'));

function getUserSettings() {
    IPCCCUserSettings.Get('RecordingMonitorSettings')
    .then((result) => {
        if(result.length > 0 && result[0].Name == 'RecordingMonitorUserSettings') {
            let _data = JSON.parse(result[0].Data);
            if (_data.autoPlay) autoPlay.value = _data.autoPlay;
        }
    })
    .catch((error) => {
        console.error('Settings not loaded or not set' + error);
    });
}

function saveUserSettings() {
    let _filterSettings = {
        autoPlay         : autoPlay.value
    };
    IPCCCUserSettings.Save('RecordingMonitorSettings', 'RecordingMonitorUserSettings', JSON.stringify(_filterSettings))
    .catch(error => {
        console.error(error);
    });
}

let sortSetting;

showLoader(true);

const getListData = (requestObj) => {
    // if (isMassxess) {
    //     requestObj.CustomerId = store.getters.getCustomerInfo().selectedCustomerId;
    // }
	IPCCCData.RequestData("PerformanceRecordings", requestObj)
	.then(result => {
		rawList.value = transformDataRequest(JSON.parse(result));
		filterList();
		showLoader(false);
	}).catch (error => {
		showLoader(false);
		console.error(error);
        showModalDialog(new BoxProps(ModalType.Alert, 'Error', store.state.settings.unexpectederrortxt));
	});
};

const setRecordingNoteColor = (setObj) => {
    // if (isMassxess) {
    //     setObj.CustomerId = store.getters.getCustomerInfo().selectedCustomerId;
    // }
	IPCCCData.RequestData("PerformanceRecordings", setObj)
	.then(result => {
        const _selRecIndex = rawList.value.findIndex((rec) => rec.Id == setObj.Id);
        if (_selRecIndex !== -1) {
            rawList.value[_selRecIndex].Note = setObj.Note;
            rawList.value[_selRecIndex].Color = setObj.Color;
        }
		showLoader(false);
	}).catch (error => {
        showLoader(false);
	});
};

onMounted(() => {
    getUserSettings();
})

function setAutoPlay() {
    autoPlay.value = !autoPlay.value;
    saveUserSettings();
}

const selectedRecordingNote = ref('');
const selectedRecordingColor = ref('');
const selectedRecordingId = ref('');
const selectedRecordingCaseId = ref('');
const selectedRecordingScript = ref('');
const openRecordingPlayer = (listitem) => {
    if (listitem.Id !== selectedRecordingId.value &&
        listitem.Type !== EnumRecordingType.Fax &&
        listitem.Type !== EnumRecordingType.Chat
    ) {
        showLoader(true);
        selectedRecordingId.value = listitem.Id;
        selectedRecordingCaseId.value = listitem.CaseId.toString();
        selectedRecordingScript.value = listitem.Script;
        selectedRecordingNote.value = listitem.Note;
        selectedRecordingColor.value = listitem.Color;
        setSelectedRow(listitem.Id);
    }
};

//=========================================================== START DISPLAY LIST METHODS

const checkEmpty = (str) => {
    if(str) {
        str = str.trim();
        return (str == '') ? '-' : str;
    } else {
        return '-';
    }
}

const getIconComponent = (ctype) => {
    switch(ctype) {
        case callTypes.PBXInbound: //PBX in
            return PhoneIncoming;

        case callTypes.PBXOutbound: //PBX uit
            return PhoneOutgoing;

        case callTypes.OutboundCampaign: //SN uit
            return ArrowTopRight;

        case callTypes.IncomingServiceNumber: //SN in
            return ArrowBottomLeft;

        default:
            return null;
    }
};

const stripSip = (rawNr) => rawNr?.indexOf('@') ? rawNr.split('@')[0] : rawNr;

const transformDataRequest = (data) => {
    return data.reduce((acc, item) => {
        if (onlyUserIdRecordings.value && item.UserId !== store.getters.getUserId()) return acc;
        item.Date = convertISOToDateTime(item.Date, store.getters.getLang());
        item.viewLength = secondsToTimeHHMMSS(item.Length);
        item.callTypeIcon = markRaw(getIconComponent(item.CallType));
        item.Sender = stripSip(item.Sender);
        item.Destination = stripSip(item.Destination);
        item.Category = checkEmpty(item.Category);
        item.Subcategory = checkEmpty(item.Subcategory);
        item.Reason = checkEmpty(item.Reason);
        item.selectedRow = false;
        acc.push(item);
        return acc;
    }, []);
}

const filterList = (filtervalues = null) => {
    if (filtervalues && Object.entries(filtervalues).length > 0) filterValues.value = filtervalues;
    else filterValues.value = {};

    displayList.value = filterListOnFilterValues(rawList.value);
    totalItems.value = displayList.value.length;
    sortColumn();
}

const filterListOnFilterValues = (list) => {
    let _rawList = [...list];
    if (filterValues.value && Object.entries(filterValues.value).length > 0) {
        _rawList = _rawList.filter(item => {
            return Object.entries(filterValues.value).every(([key, value]) => {
                const filterKey = EnumFilterDataValues[key] || key;
                if (Array.isArray(value)) {
                    return value.some(filterValue => item[filterKey].includes(filterValue));
                } else {
                    switch(filterKey) {
                        case 'MinLength':
                            return item['Length'] >= value;
                        case 'MaxLength':
                            return item['Length'] <= value;
                        case 'Id':
                            return item['Id'] == filterValues.value['RecordingId'];
                        case 'CaseId':
                            return item['CaseId'] == filterValues.value['CaseId'];
                        default:
                            return true;
                    }
                }
            });
        });
    }
    return _rawList;
}

const sortColumn = (key = null, e = null) => {
    let _order,
        _t;

    if (e != null) {
        _t = e.target;
        _order = _t.getAttribute("data-sortOrder");
        document
            .querySelectorAll("[data-sortorder]")
            .forEach((a) => a.setAttribute("data-sortorder", "NONE"));
        sortSetting = {
            key: key,
            order: _order,
        };
    } else {
        _order = sortSetting?.order ? sortSetting.order : "NONE";
        key = sortSetting?.key ? sortSetting?.key : "-";
    }

    switch (_order) {
        case "NONE":
            displayList.value.sort(dynamicSort(key));
            if (e != null) _t.setAttribute("data-sortOrder", "ASC");
            break;
        case "ASC":
            displayList.value.sort(dynamicSort("-" + key));
            if (e != null) _t.setAttribute("data-sortOrder", "DES");
            break;
        case "DES":
            displayList.value = filterListOnFilterValues(rawList.value);
            totalItems.value = displayList.value.length;
            if (e != null) _t.setAttribute("data-sortOrder", "NONE");
            break;
    }
};

let selectedIndex = (-1);
const setSelectedRow = id => {
    if (selectedIndex > -1) {
        rawList.value[selectedIndex].selectedRow = false;
    }
    let selectedRowIndex = rawList.value.findIndex(row => row.Id === id);
    rawList.value[selectedRowIndex].selectedRow = true;
    selectedIndex = selectedRowIndex;
};

const filterLaneClass   = ref("filterlaneframe--open"),
    laneState           = ref("open"),
    laneMax             = ref("open"),
    laneMin             = ref("closed"),
    laneIcon            = markRaw(Magnify);

const setFrame = (direction:string):void => {
    switch(direction) {
        case 'open':
            laneState.value = direction;
            filterLaneClass.value = `filterlaneframe--${direction}`;
            break;
        case 'closed':
            laneState.value = direction;
            filterLaneClass.value = `filterlaneframe--${direction}`;
            break;
    }
}


//Export List
const exportListBtnStyles = {
    top: '9px',
    right: '25px',
    zIndex: 1
};

const exportListWrapperStyles = {
    top: '9px',
    right: '25px',
}

const recordingColors = reactive(
    Object.entries(EnumNoteColors)
    .map(([key, value]) => ({
        Name: key,
        Color: value,
        Icon : 'F763',
        selected: false
    }))
);

</script>

<template>
    <div :class="['recording-wrapper', filterLaneClass]" data-e2e="performance-recordings">
        <div class="recording-list-player-wrapper">
            <div class="list-wrapper">
                <ExportListToXLSX
                :data="displayList"
                :customBtnStyles="exportListBtnStyles"
                :customWrapperStyles="exportListWrapperStyles"
                />
                <div class="list-content-wrapper">
                    <div class="list-content--back">
                        <div class="list-content--header">
                            <div class="list-content__row--header">
                                <span class="list-content__row-cell list-content__row-cell--15" style="min-width: 130px;" :title="store.state.settings.recordingmonitor.collheads[0]" @click="sortColumn('Date', $event)" data-sortorder="NONE" v-html="store.state.settings.recordingmonitor.collheads[0]"></span>
                                <span class="list-content__row-cell list-content__row-cell--10" style="min-width: 85px;" :title="store.state.settings.recordingmonitor.collheads[1]" @click="sortColumn('viewLength', $event)" data-sortorder="NONE" v-html="store.state.settings.recordingmonitor.collheads[1]"></span>
                                <span class="list-content__row-cell list-content__row-cell--5" :title="store.state.settings.recordingmonitor.collheads[2]" @click="sortColumn('CallType', $event)" data-sortorder="NONE" v-html="store.state.settings.recordingmonitor.collheads[2]"></span>
                                <span class="list-content__row-cell list-content__row-cell--10" :title="store.state.settings.recordingmonitor.collheads[3]" @click="sortColumn('Sender', $event)" data-sortorder="NONE" v-html="store.state.settings.recordingmonitor.collheads[3]"></span>
                                <span class="list-content__row-cell list-content__row-cell--10" :title="store.state.settings.recordingmonitor.collheads[4]" @click="sortColumn('Destination', $event)" data-sortorder="NONE" v-html="store.state.settings.recordingmonitor.collheads[4]"></span>
                                <span class="list-content__row-cell list-content__row-cell--10" :title="store.state.settings.recordingmonitor.collheads[5]" @click="sortColumn('Callgroup', $event)" data-sortorder="NONE" v-html="store.state.settings.recordingmonitor.collheads[5]"></span>
                                <span class="list-content__row-cell list-content__row-cell--15" :title="store.state.settings.recordingmonitor.collheads[6]" @click="sortColumn('UserName', $event)" data-sortorder="NONE" v-html="store.state.settings.recordingmonitor.collheads[6]"></span>
                                <span class="list-content__row-cell list-content__row-cell--10" :title="store.state.settings.recordingmonitor.collheads[7]" data-sortorder="NONE" v-html="store.state.settings.recordingmonitor.collheads[7]"></span>
                                <span class="list-content__row-cell list-content__row-cell--10" :title="store.state.settings.recordingmonitor.collheads[8]" data-sortorder="NONE" v-html="store.state.settings.recordingmonitor.collheads[8]"></span>
                                <span class="list-content__row-cell list-content__row-cell--5" :title="store.state.settings.recordingmonitor.collheads[9]" data-sortorder="NONE" v-html="store.state.settings.recordingmonitor.collheads[9]"></span>
                            </div>
                        </div>
                        <VirtualListViewer class="list-content" rowClasses="list-content__row--virtual list-content__row--clickable" :data="displayList">
                            <template v-slot="{ row, index }">
                                <div :class="['list-row', {'list__row--zebra' : index % 2 == 0}, {'list__row--selected' : row.selectedRow}]" :data-promptId="index" @click="openRecordingPlayer(row)">
                                    <span class="list-content__row-cell list-content__row-cell--15" style="min-width: 130px;"><span class="list-content-list-color"  :style="`background-color:${row.Color}`"></span>{{ row.Date }}</span>
                                    <span class="list-content__row-cell list-content__row-cell--10" style="min-width: 85px;">{{ row.viewLength }}</span>
                                    <span class="list-content__row-cell list-content__row-cell--5"><component class="list-content__component__icon" :is="row.callTypeIcon"></component></span>
                                    <span class="list-content__row-cell list-content__row-cell--10">{{ row.Sender }}</span>
                                    <span class="list-content__row-cell list-content__row-cell--10">{{ row.Destination }}</span>
                                    <span class="list-content__row-cell list-content__row-cell--10">{{ row.Callgroup }}</span>
                                    <span class="list-content__row-cell list-content__row-cell--15">{{ row.UserName }}</span>
                                    <span class="list-content__row-cell list-content__row-cell--10">{{ row.Category }}</span>
                                    <span class="list-content__row-cell list-content__row-cell--10">{{ row.Subcategory }}</span>
                                    <span class="list-content__row-cell list-content__row-cell--5">{{ row.Reason }}</span>
                                </div>
                            </template>
                        </VirtualListViewer>
                    </div>
                </div>
            </div>
            <RecordingMonitorPlayer
            class="recording-player-section"
            :autoPlay="autoPlay"
            :selectedRecordingId="selectedRecordingId"
            :selectedRecordingCaseId="selectedRecordingCaseId"
            :selectedRecordingScript="selectedRecordingScript"
            :selectedRecordingNote="selectedRecordingNote"
            :selectedRecordingColor="selectedRecordingColor"
            @setRecordingNoteColor="setRecordingNoteColor"
            @setAutoPlay="setAutoPlay"
            />
        </div>

        <div class="recording-togglerlane">
            <LaneToggler
            :laneState="laneState"
            :laneMax="laneMax"
            :laneMin="laneMin"
            :laneIcon="laneIcon"
            @setLane="setFrame"
            />
        </div>


        <div class="recording-filterlane">
            <RecordingMonitorFilters
            @getlistdata="getListData"
            @filterlistdata="filterList"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>

@use "@/scss/includes/font";
@use "@/scss/includes/globals";
@use "@/scss/includes/functions";

.recording-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
}

.recording-list-player-wrapper {
    position: absolute;
    inset: 1rem 519px 0 0;
    z-index: 600;
    transition: inset .2s ease-in-out;
    .list-wrapper {
        position: relative;
        // left: 0;
        // top: 0;
        width: 100%;
        height: calc(100% - 185px);
        z-index: 0;
        .list-content-wrapper {
            max-width: none;
            padding: 0 1rem;
            top: 0;
            bottom: 1rem;
            .list-content--back {
                inset: 0 1rem;
            }
            .list-content-list-color {
                position: absolute;
                left: 0;
                width: 5px;
                height: 100%;
            }
        }
    }
    .recording-player-section {
        position: absolute;
        height: 170px;
        left: 1rem;
        width: calc(100% - 2rem);
        bottom: 1rem;
        z-index: -1;
    }
}
.filterlaneframe--closed .recording-list-player-wrapper {
    inset: 1rem 60px 0 0;
}
.recording-togglerlane {
    position: absolute;
    right: calc(100% - 459px);
    top: 0;
    bottom: 0;
    left: calc(100% - 519px);
    width: 60px;
    height: 100%;
    transition: left, right .2s ease-in-out;
}

.filterlaneframe--closed .recording-togglerlane {
    right: calc(100%);
    left: calc(100% - 60px);
}
.recording-filterlane {
    position: absolute;
    // inset: 0 0 0 calc(100% - 459px);
    right: 0;
    height: 100%;
    width: 459px;
    background-color: globals.$color-white;
    transition: width .2s ease-in-out;
}
.filterlaneframe--closed .recording-filterlane {
    width: 0;
}


</style>
