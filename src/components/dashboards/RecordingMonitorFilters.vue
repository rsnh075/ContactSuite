<script setup lang="ts">
import { ref } 						from '@vue/reactivity';
import { inject, onMounted, computed, watchEffect }        from '@vue/runtime-core';
import { useStore }					from 'vuex';
import { useHelperFunctions }       from '../../use/useHelperFunctions';
import { FilterDataOptions,
         FilterDataRequestValues,
         FilterDataValues,
         MultiRangeScale
        }         from '../../types/RecordingMonitor';
import { IPCCCData }                from "../../ipccc/js/data";
import { ValidateDir as vValidate }	from '../../directives/validate';
import PikaDay                      from 'pikaday';
import {
          ISOToDDMMYYYY,
		  pikaDayToDDMMYYYY,
       }                   			from '../../use/dateFunctions';
import * as Mask          			from '../../utils/cm_mask';
import { ChevronDown, ChevronUp, ContentPaste, Sync, Close } from 'mdue';
import { reactive } from 'vue';
import MultiSelectSearchFlyOut from './../uielements/MultiSelectSearchFlyOut.vue';
import MultiRangeSlider from './../uielements/MultiRangeSlider.vue';
import { EnumNoteColors, EnumPRRequestType } from '../../types/RecordingMonitor';
// import * as temp from './temp.json';

const emits  = defineEmits(['getlistdata', 'filterlistdata']);

const store:object | any    = useStore(),
      showLoader			= inject('showLoader') as Function,
      useHelperFn           = useHelperFunctions();

const filterDataRequestValues = reactive(new FilterDataRequestValues()),
      filterDataValues        = reactive(new FilterDataValues()),
      filterDataValuesDef     = new FilterDataValues(),
      filterDataOptions       = reactive(new FilterDataOptions()),
      filterDataOptionsDef    = new FilterDataOptions(),
      multiRangeScale         = MultiRangeScale.Scale,
	  fromDate				  = ref(''),
	  fromTime				  = ref('00:00:00'),
	  tillDate				  = ref(''),
	  tillTime				  = ref('23:59:59'),
      multirangeslider        = ref(null);

const recordingColors = reactive(
    Object.entries(EnumNoteColors)
    .map(([key, value]) => ({
        Name: key,
        Color: value,
        Icon : 'F763',
        selected: false
    }))
);

const getDefaultData = () => {
    resetFilterData();
    let _defaultDaysAgoInMs     = new Date().setDate( new Date().getDate() - 1 ); // default - 1
    let _defaultDaysAgoParts    = new Date(_defaultDaysAgoInMs).toLocaleString('nl', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute : '2-digit' }).split(' ');
    let _defaultDaysDateParts   = _defaultDaysAgoParts[0].split('-');
    let _currentDateTimeParts   = new Date().toLocaleString('nl', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute : '2-digit' }).split(' ');
    let _currentDateParts       = _currentDateTimeParts[0].split('-');
    filterDataRequestValues.From = _defaultDaysDateParts[2] + '-' + _defaultDaysDateParts[1] + '-' + _defaultDaysDateParts[0] + 'T' + '00:00:00';
    filterDataRequestValues.Till = _currentDateParts[2] + '-' + _currentDateParts[1] + '-' + _currentDateParts[0] + 'T' + '23:59:59';
    setFilterDataFrom(filterDataRequestValues.From);
    setFilterDataTill(filterDataRequestValues.Till);

    getFilterThenListData();
}

const getFilterDataOptions = () => {
    return new Promise((resolve, reject) => {
        filterDataRequestValues['Type'] = EnumPRRequestType.Filters;
        IPCCCData.RequestData("PerformanceRecordings", filterDataRequestValues)
        .then(result => {
            resolve(JSON.parse(result));
            // resolve(JSON.parse(temp.default));
        }).catch (error => {
            reject(error);
        });
    });
};

const stripSip = (rawNr) => rawNr?.indexOf('@') ? rawNr.split('@')[0] : rawNr;

const fillFilterDataOptions = (data) => {
    return new Promise((resolve, reject) => {
        filterDataOptions.NoteColors = recordingColors;
        filterDataValues.NoteColors == recordingColors;
        for (const prop in data) {
            if (prop == 'Destinations' || prop == 'Senders') {
                filterDataOptions[prop] = data[prop].map(option => (
                    {
                        Name : stripSip(option),
                        NameWithSip : option,
                        selected : false
                    }
                ));
            } else if (prop == 'MinRecordingLength' || prop == 'MaxRecordingLength') {
                filterDataOptions[prop] = data[prop];
                filterDataValues[prop == 'MinRecordingLength' ? 'MinLength' : 'MaxLength'] = data[prop];
            } else {
                if (Array.isArray(data[prop])) {
                    filterDataOptions[prop] = data[prop];
                    filterDataOptions[prop].forEach(option => option.selected = false);
                } else {
                    filterDataOptions[prop] = data[prop];
                }
            }
        }
        resolve(true);
    });
}

const getListData = () => {
    filterDataRequestValues['Type'] = EnumPRRequestType.Search;
    emits('getlistdata', filterDataRequestValues);
}

const getFilterThenListData = () => {
    showLoader(true);
    getFilterDataOptions()
    .then((data) => {
        fillFilterDataOptions(data)
        .then(() => {
            setTimeout(() => {
                getListData();
            }, 500);
        })
    })
    .catch(() => showLoader(false))
}

const onReset = () => {
    resetFilterData();
    getFilterThenListData();
}

const resetFilterData = () => {
	for (const prop in filterDataValuesDef) {
        filterDataValues[prop] = JSON.parse(JSON.stringify(filterDataValuesDef[prop]));
    }
    for (const prop in filterDataOptionsDef) {
        filterDataOptions[prop] = JSON.parse(JSON.stringify(filterDataOptionsDef[prop]));
    }
    caseIdDummy.value = "";
    multirangeslider.value.reset();
    recordingColors.forEach(color => color.selected = false);
}

const filterListData = () => {
    const _filterList = Object.entries(filterDataValues).reduce((acc, [key, value]) => {
        if (Array.isArray(value)) {
            if (value.length > 0) acc[key] = value;
        } else if (value !== undefined && value !== filterDataValuesDef[key]) {
            acc[key] = value;
        }
        return acc;
    }, {});
    if (window.debugState) console.log('FilterList on', _filterList);
    emits('filterlistdata', _filterList);
};

const handleChangedOptions = (option, prop, propvalue) => {
    if (!option) {
        filterDataValues[prop] = [];
        if (filterDataOptions[prop]) {
            filterDataOptions[prop].forEach(opt => opt.selected = false);
        }
        return;
    };

    let _selectedIndex = filterDataOptions[prop].findIndex(item => item[propvalue] == option[propvalue]);
    filterDataOptions[prop][_selectedIndex].selected = !option.selected;

    if (filterDataOptions[prop][_selectedIndex].selected && !filterDataValues[prop].includes(option[propvalue])) { //select
        filterDataValues[prop].push(option[propvalue]);
    }
    if (!filterDataOptions[prop][_selectedIndex].selected && filterDataValues[prop].includes(option[propvalue])) { //deselect
        filterDataValues[prop].splice(filterDataValues[prop].indexOf(option[propvalue]), 1);
    }
};

const resetSelected = (prop) => {
    if (filterDataOptions[prop]) {
        filterDataOptions[prop].forEach(opt => opt.selected = false);
        filterDataValues[prop] = [];
    }
};

const setRecordingId = async () => {
    filterDataValues.RecordingId = await useHelperFn.pasteClicpBoardText('');
};
const caseIdDummy = ref("");
watchEffect(() => {
    if (caseIdDummy.value == "") {
        filterDataValues.CaseId = -1;
    } else if (!isNaN(parseInt(caseIdDummy.value))) {
        filterDataValues.CaseId = parseInt(caseIdDummy.value);
    }
});
const setCaseId = async () => {
    caseIdDummy.value = await useHelperFn.pasteClicpBoardText('');
};

const setSelectedRange = (min:number, max:number) => {
    if (window.debugState) console.log('Min', min, 'Max', max);
    filterDataValues.MinLength = min;
    filterDataValues.MaxLength = max;
};

const filterDropDownIsOpen = ref(false);
const filterDropDownToggle = () => {
    filterDropDownIsOpen.value = !filterDropDownIsOpen.value;
}

// const checkTime = (evt, fromtill) => {
// 	let _target  = evt.target;
// 	Mask.isTimeMask(evt);
// 	if (fromtill == 'from')
// 		fromTime.value = _target.value;
// 	else
// 		tillTime.value = _target.value;
// 	setFilterDataDateTime(fromtill);
// }

const fromTillIsValid = computed(() => {
    let dFrom:any = new Date(filterDataRequestValues.From),
        dTill:any = new Date(filterDataRequestValues.Till),
        diff  = dTill - dFrom;
    if (
        filterDataRequestValues.From &&
        filterDataRequestValues.From !== '' &&
        filterDataRequestValues.Till &&
        filterDataRequestValues.Till !== '' &&
        diff >= 0
    ) return true;
    else return false;
});

const setFilterDataFrom = (newVal) => {
	fromDate.value   = ISOToDDMMYYYY(newVal);
	// fromTime.value   = ISOToHHMM(newVal);
}

const setFilterDataTill = (newVal) => {
	tillDate.value   = ISOToDDMMYYYY(newVal);
	// tillTime.value   = ISOToHHMM(newVal);
}

const setFilterDataDateTime = (fromtill) => {
	let _parts = [];
	if (fromtill == 'from') {
		_parts = fromDate.value.split('-');
		filterDataRequestValues.From = _parts[2].concat('-' + _parts[1] + '-' + _parts[0] + 'T' + fromTime.value);
	} else {
		_parts = tillDate.value.split('-');
		filterDataRequestValues.Till = _parts[2].concat('-' + _parts[1] + '-' + _parts[0] + 'T' + tillTime.value);
	}
    if (fromTillIsValid.value) {
        resetFilterData();
        getFilterThenListData();
    }
}

const setFromDate = (date) => {
	fromDate.value = date;
	setFilterDataDateTime('from');
}

const setTillDate = (date) => {
	tillDate.value = date;
	setFilterDataDateTime('till');
}

const setDatePickerFrom = () => {
	const datepickerFrom = new PikaDay({
		field: document.getElementById('datepickerRecordingMonitorFiltersFrom'),
		format: 'DD-MM-YYYY',
		// minDate: new Date(),
		i18n: store.state.settings.datepicker,
		onSelect: () => {
			setFromDate(pikaDayToDDMMYYYY(datepickerFrom.getDate()));
		},
	})
}
// setDatePickerFrom();

const setDatePickerTill = () => {
	const datepickerTill = new PikaDay({
		field: document.getElementById('datepickerRecordingMonitorFiltersTill'),
		format: 'DD-MM-YYYY',
		// minDate: new Date(),
		i18n: store.state.settings.datepicker,
		onSelect: () => {
			setTillDate(pikaDayToDDMMYYYY(datepickerTill.getDate()));
		}
	})
}
// setDatePickerTill();
onMounted(() => {
	setDatePickerFrom();
	setDatePickerTill();
    getDefaultData();
})
</script>

<template>
    <div data-e2e="filters">
        <div class="filters-wrapper">
            <form @valid="filterListData" v-validate="{'submitBtns' : 'js-submitbtn--filterrecordingmonitorlist'}" autocomplete="off">
                <div class="filters-body">
                    <div class="filters-header">
                        <h2 class="filters-h2">{{ store.state.settings.recordingmonitorfilters.headertop }}</h2>
                    </div>
                    <div class="grid-row">
                        <div class="grid-unit--beta">
                            <div class="form-textfield form-textfield--bground">
                                <input id="datepickerRecordingMonitorFiltersFrom" type="text" v-model="fromDate" autocomplete="off">
                                <label class="form-label form-label--hidden">{{ store.state.settings.recordingmonitorfilters.formfromdate }}</label>
                            </div>
                        </div>
                        <!-- <div class="grid-unit--delta">
                            <div class="form-textfield form-textfield--bground form-textfield--normal-form">
                                <input type="text" v-model="fromTime" @keydown="checkTime($event, 'from')">
                            </div>
                        </div> -->
                        <div class="grid-unit--beta">
                            <div class="form-textfield form-textfield--bground">
                                <input id="datepickerRecordingMonitorFiltersTill" type="text" v-model="tillDate" autocomplete="off">
                                <label class="form-label form-label--hidden">{{ store.state.settings.recordingmonitorfilters.formtilldate }}</label>
                            </div>
                        </div>
                        <!-- <div class="grid-unit--delta">
                            <div class="form-textfield form-textfield--bground form-textfield--normal-form">
                                <input type="text" v-model="tillTime" @keydown="checkTime($event, 'till')">
                            </div>
                        </div> -->
                    </div>
                    <div class="filters-header--filters">
                        <h2 class="filter-header-h3">{{ store.state.settings.recordingmonitorfilters.header }}</h2>
                    </div>
                    <div class="grid-row">
                        <div class="grid-unit--alpha">
                            <MultiRangeSlider ref="multirangeslider"
                            :label="store.state.settings.recordingmonitorfilters.multiRangeSliderLabel"
                            :scale="multiRangeScale"
                            :lowestMin="filterDataOptions.MinRecordingLength"
                            :highestMax="filterDataOptions.MaxRecordingLength"
                            :selectedMin="filterDataValues.MinLength"
                            :selectedMax="filterDataValues.MaxLength"
                            @sendrange="setSelectedRange"
                            />
                        </div>
                    </div>
                    <div class="grid-row">
                        <div class="grid-unit--beta">
                            <div class="typo-input-label">{{ store.state.settings.recordingmonitorfilters.callgrouplabel }}</div>
                            <MultiSelectSearchFlyOut :key="0"
                            :options="filterDataOptions.Routinggroups"
                            :defaultlabel="store.state.settings.recordingmonitorfilters.defaultselectedRG"
                            labelproperty="Name"
                            valueproperty="Name"
                            @changed="handleChangedOptions($event, 'Routinggroups', 'Name')"
                            @resetselected="resetSelected('Routinggroups')"
                            />
                        </div>
                        <div class="grid-unit--beta">
                            <div class="typo-input-label">{{ store.state.settings.recordingmonitorfilters.destinationlabel }}</div>
                            <MultiSelectSearchFlyOut :key="1"
                            :options="filterDataOptions.Destinations"
                            :defaultlabel="store.state.settings.recordingmonitorfilters.defaultselectedDestination"
                            labelproperty="Name"
                            valueproperty="NameWithSip"
                            @changed="handleChangedOptions($event, 'Destinations', 'Name')"
                            @resetselected="resetSelected('Destinations')"
                            />
                        </div>
                    </div>
                    <div class="grid-row">
                        <div class="grid-unit--beta">
                            <div class="typo-input-label">{{ store.state.settings.recordingmonitorfilters.scriptlabel }}</div>
                            <MultiSelectSearchFlyOut :key="2"
                            :options="filterDataOptions.Scripts"
                            :defaultlabel="store.state.settings.recordingmonitorfilters.defaultselectedScript"
                            labelproperty="Name"
                            valueproperty="Name"
                            @changed="handleChangedOptions($event, 'Scripts', 'Name')"
                            @resetselected="resetSelected('Scripts')"
                            />
                        </div>
                        <div class="grid-unit--beta">
                            <div class="typo-input-label">{{ store.state.settings.recordingmonitorfilters.senderlabel }}</div>
                            <MultiSelectSearchFlyOut :key="3"
                            :options="filterDataOptions.Senders"
                            :defaultlabel="store.state.settings.recordingmonitorfilters.defaultselectedSender"
                            labelproperty="Name"
                            valueproperty="NameWithSip"
                            @changed="handleChangedOptions($event, 'Senders', 'Name')"
                            @resetselected="resetSelected('Senders')"
                            />
                        </div>
                    </div>
                    <div class="grid-row">
                        <div class="grid-unit--beta">
                            <div class="typo-input-label">{{ store.state.settings.recordingmonitorfilters.userlabel }}</div>
                            <MultiSelectSearchFlyOut :key="4"
                            :options="filterDataOptions.Users"
                            :defaultlabel="store.state.settings.recordingmonitorfilters.defaultselectedUser"
                            labelproperty="Name"
                            valueproperty="Name"
                            @changed="handleChangedOptions($event, 'Users', 'Name')"
                            @resetselected="resetSelected('Users')"
                            />
                        </div>
                        <div class="grid-unit--beta">
                            <div class="typo-input-label">{{ store.state.settings.recordingmonitorfilters.filterrecordingcolorlabel }}</div>
                            <!-- <div class="selectrecordingcolor-box">
                                <select v-model="filterRecordingColors" multiple :style="`background-color:${filterRecordingColors && filterRecordingColors[0] ? filterRecordingColors[0] : ''}`">
                                    <option value="" style="background-color:#FFF" selected>{{ store.state.settings.recordingmonitorfilters.defaultselectedrecordingcolor }}</option>
                                    <option v-for="option in recordingColors" :style="`background-color:${option}`" :value="option"></option>
                                </select>
                            </div> -->

                            <MultiSelectSearchFlyOut :key="5"
                            :options="recordingColors"
                            :defaultlabel="store.state.settings.recordingmonitorfilters.defaultselectedrecordingcolor"
                            labelproperty="Name"
                            valueproperty="Color"
                            iconproperty="Icon"
                            iconcolorproperty="Color"
                            iconsize="1.2em"
                            @changed="handleChangedOptions($event, 'NoteColors', 'Color')"
                            @resetselected="resetSelected('NoteColors')"
                            />
                        </div>
                    </div>
                    <div class="grid-row">
                        <h3 class="filter-header-h3">{{ store.state.settings.recordingmonitorfilters.filterheaderh3 }}</h3>
                    </div>
                    <div :class="['filter-dropdown', {'filter-dropdown--minimized' : !filterDropDownIsOpen}]">
                        <div class="filter-dropdown__body">
                            <div class="grid-row">
                                <div class="grid-unit--alpha grid-unit--alpha-less-v-padding">
                                    <div class="form-textfield form-textfield--bground">
                                        <input type="text" name="recordingRecordingId" id="recordingRecordingId" v-model="filterDataValues.RecordingId">
                                        <label class="form-label form-label--hidden" for="recordingRecordingId">{{ store.state.settings.recordingmonitorfilters.formrecordingidlabel }}</label>
                                        <div v-if="filterDataValues.RecordingId == ''" class="form-textfield__pastefromclipboard" @click="setRecordingId"><ContentPaste /></div>
                                        <Close v-if="filterDataValues.RecordingId !== ''" class="form-textfield__clear" @click="filterDataValues.RecordingId = ''" />
                                    </div>
                                </div>
                            </div>
                            <div class="grid-row">
                                <div class="grid-unit--alpha grid-unit--alpha-less-v-padding">
                                    <div class="form-textfield form-textfield--bground form-textfield--nopaddingbottom">
                                        <input type="text" name="recordingRecordingId" id="recordingCaseId" v-model="caseIdDummy">
                                        <label class="form-label form-label--hidden" for="recordingCaseId">{{ store.state.settings.recordingmonitorfilters.formcaseidlabel }}</label>
                                        <div v-if="caseIdDummy == ''" class="form-textfield__pastefromclipboard" @click="setCaseId"><ContentPaste /></div>
                                        <Close v-if="caseIdDummy !== ''" class="form-textfield__clear" @click="caseIdDummy = ''" />
                                    </div>
                                </div>
                            </div>
                            <div class="grid-row">
                                <div class="grid-unit--alpha">
                                    <div class="typo-input-label">{{ store.state.settings.recordingmonitorfilters.formcategorylabel }}</div>
                                    <MultiSelectSearchFlyOut
                                    :options="filterDataOptions.Categories"
                                    :defaultlabel="store.state.settings.recordingmonitorfilters.defaultcategory"
                                    labelproperty="Name"
                                    valueproperty="Name"
                                    @changed="handleChangedOptions($event, 'Categories', 'Name')"
                                    @resetselected="resetSelected('Categories')"
                                    />
                                </div>
                            </div>
                            <div class="grid-row">
                                <div class="grid-unit--alpha">
                                    <div class="typo-input-label">{{ store.state.settings.recordingmonitorfilters.formsubcategorylabel }}</div>
                                    <MultiSelectSearchFlyOut
                                    :options="filterDataOptions.Subcategories"
                                    :defaultlabel="store.state.settings.recordingmonitorfilters.defaultsubcategory"
                                    labelproperty="Name"
                                    valueproperty="Name"
                                    @changed="handleChangedOptions($event, 'Subcategories', 'Name')"
                                    @resetselected="resetSelected('Subcategories')"
                                    />
                                </div>
                            </div>
                            <div class="grid-row">
                                <div class="grid-unit--alpha">
                                    <div class="typo-input-label">{{ store.state.settings.recordingmonitorfilters.formreasonlabel }}</div>
                                    <MultiSelectSearchFlyOut
                                    :options="filterDataOptions.Reasons"
                                    :defaultlabel="store.state.settings.recordingmonitorfilters.defaultreason"
                                    labelproperty="Name"
                                    valueproperty="Name"
                                    @changed="handleChangedOptions($event, 'Reasons', 'Name')"
                                    @resetselected="resetSelected('Reasons')"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="filter-dropdown__toggle" @click="filterDropDownToggle()">
                            <ChevronDown v-if="!filterDropDownIsOpen" class="filter-dropdown__toggle-down" />
                            <ChevronUp v-else class="filter-dropdown__toggle-up" />
                        </div>
                    </div>
                </div>
                <div class="filters-footer">
                    <div class="grid-row">
                        <div class="grid-unit--alpha">
                            <a class="button-primary button-primary--gray recordingmonitor-resetbtn" @click="onReset()">
                                <Sync class="recordingmonitor-resetbtn__icon" />{{ store.state.settings.recordingmonitorfilters.cancellbl }}
                            </a>
                            <span class="grid--push">
                                <button type="button" class="button-primary js-submitbtn--filterrecordingmonitorlist" :disabled="!fromTillIsValid">
                                    {{ store.state.settings.recordingmonitorfilters.savelbl }}
                                </button>
                            </span>
                        </div>
                    </div>
                </div>
            </form>
        </div>

    </div>
</template>

<style lang="scss" scoped>

@use "@/scss/includes/globals";
@use "@/scss/includes/functions";
@use "@/scss/includes/font";

.filters-wrapper {
    background-color: globals.$color-white;
    width: 459px;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    overflow-x: hidden;
}

.filters-header {
    &--filters {
        height: 25px;
    }
    .filters-h2 {
        @include font.font-bold();
        color: globals.$color-gray80;
        padding: 15px 0 0 20px;
        font-size: 1.3rem;
        line-height: 1.3rem;
    }
}

@keyframes delay-overflow {
  from { overflow: visible; }
}
@keyframes delay-no-overflow {
  from { overflow: hidden; }
}

.filters-body {
    [class*=grid-unit] {
        padding: 0.5rem 1.5rem 0.5rem 1.5rem;
    }
    line-height: initial;
    .form-textfield--bground label {
      line-height: initial;
    }
    .grid-row .grid-unit--delta:nth-child(2) {
        padding: 0 0.25rem 0 1.5rem
    }
    .grid-row .grid-unit--delta:nth-child(3) {
        padding:  0 1.5rem 0 0.25rem
    }
    .selectrecordingcolor-box {
        margin: 19px 0 0 0;
        position: relative;
        &:before {
            content: "";
            position: absolute;
            width: 0;
            height: 0;
            top: 13px;
            right: 10px;
            border: 6px solid transparent;
            border-top-color: #a6a6a6;
            border-top-color: globals.$color-gray35;
            z-index: 2;
            pointer-events: none;
            user-select: none;
        }
        select {
            box-shadow: inset 0 -30px 0px 0px rgba(0, 0, 0, 0.025);
            appearance: none;
            width: 100%;
            height: 30px;
            border: none;
            border-bottom: 1px solid #a6a6a6;
            text-indent: 3px;
            text-align: left;
            color: globals.$color-gray60;
            @include font.font-normal();
            font-size: 1rem;
        }
    }
    .filter-header-h3 {
        @include font.font-medium();
        color: globals.$color-gray60;
        padding-left: 20px;
        margin-top: 0.5rem;
        font-size: 1.1rem;
        line-height: 1rem;
    }
    .filter-dropdown {
        position: relative;
        overflow: visible;
        width: 100%;
        height: 428px;
        transition: height 0.15s ease-in-out;
        animation: 0.15s delay-no-overflow;
        &--minimized {
            height: 30px;
            overflow: hidden;
            animation: 0.15s delay-overflow;
        }
        .filter-dropdown__body {
            position: absolute;
            top: 0;
            bottom: 30px;
            width: 100%;
        }
        .filter-dropdown__toggle {
            position: absolute;
            bottom: 0;
            left: 1.5rem;
            right: 1.5rem;
            height: 30px;
            background-color: globals.$color-white;
            background: linear-gradient(180deg,
                globals.$color-white calc(50% - 1px),
                globals.$color-gray20 calc(50%),
                globals.$color-white calc(50% + 1px)
            );
            cursor: pointer;
            transition: top .25s ease-in-out;
            text-align: center;
        }
        .filter-dropdown__toggle-up,
        .filter-dropdown__toggle-down {
            color: globals.$color-gray20;
            background-color: globals.$color-white;
            height: 30px;
            width: 30px;
        }
    }
}

.filters-footer {
    padding: 1rem 0 3rem 0;
    .recordingmonitor-resetbtn {
        color: globals.$color-gray80;
        &__icon {
            vertical-align: middle;
            font-size: 1.2rem;
            margin: -3px 6px 0 -10px;
            color: globals.$color-gray25;
        }
    }
}

</style>