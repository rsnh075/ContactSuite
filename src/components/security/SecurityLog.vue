<script lang="ts">
export default {
    name: 'SecurityLog'
}
</script>
<script setup lang="ts">

import MessageBox            from './../dialogs/Message-box.vue';
import VirtualListViewer     from './../uielements/VirtualListViewer.vue';
import ExportListToXLSX      from '../uielements/ExportListToXLSX.vue';
import {
		pikaDayToDDMMYYYY,
		timestampToHHMM,
		todayNL,
		todayUK,
		ISOdateTimetoDate }  from './../../use/dateFunctions';
import PikaDay               from 'pikaday';
import { IPCCCLogClient } from './../../ipccc/js/logclient';
import { useStore } from 'vuex';
import { computed, inject, onBeforeUnmount, onMounted, reactive, ref } from '@vue/runtime-core';

const   store				= useStore(),
		showLoader			= inject<Function>('showLoader'),
		selectedCustomerId	= ref(-1),
        datePicker			= ref(null),
        fromDate			= ref(new Date()),
        tillDate			= ref(new Date()),
        selectedDate		= ref(null),
        todayDate			= ref(null),
        headerlabels		= ref([]),
        timeIntervals		= ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00' ],
        rawData				= ref(null),
        logData				= ref([]),
        unames				= ref([]),
        snames				= ref([]),
        actions				= ref([]),
        successes			= ref([]),
        ipaddresses			= ref([]),
        filterObj			= ref(
		{
			timestamp   : '',
			username    : '',
			servicename : '',
			action      : '',
			success     : '',
			ipaddress   : '',
		}),
        showMessage        = ref(false),
        messageHeader      = ref(null),
        messageBody        = ref(null),
        messageBodyHeader  = ref(null),
        isLoaded           = ref(false),
		isMassxess			= computed(() => store.getters.getCustomerInfo().customerId == 1),
		realTime			= computed(() => todayDate.value == selectedDate.value),
        exportListBtnStyles = {
            top: '9px',
            right: '8px',
            zIndex: 1
        },
        exportListWrapperStyles = {
            top: '9px',
            right: '8px',
        };

let unSubscribe = null;

    const setDatePicker = () => {
        datePicker.value = new PikaDay({
			field    : document.getElementById('datepicker'),
			// format   : (store.state.browserLanguage == 'nl') ? 'DD-MM-YYYY' : 'MM-DD-YYYY',
			format: 'DD-MM-YYYY',
			maxDate  : new Date(),
			i18n     : store.state.settings.datepicker,
			onSelect : () => {
				selectedDate.value = pikaDayToDDMMYYYY(datePicker.value.getDate());
				fromDate.value     = new Date(datePicker.value.getDate());
				if(isLoaded.value) {
					showLoader(true);
					updateDate(selectedCustomerId.value);
				}
			},
        });
    };
const clearFilters = () => {
		filterObj.value = {
			timestamp   : '',
			username    : '',
			servicename : '',
			action      : '',
			success     : '',
			ipaddress   : '',
		};
		unames.value      = [];
		snames.value      = [];
		actions.value     = [];
		successes.value   = [];
        ipaddresses.value = [];
};

const updateDate = (cusId) => {
	clearFilters();

	let _tillDate:number | Date = null;
	if(datePicker.value.getDate() == null) {
		_tillDate = new Date();
	} else {
		_tillDate = new Date(datePicker.value.getDate());
	}
	_tillDate = _tillDate.setDate(_tillDate.getDate() + 1);

	tillDate.value = new Date(_tillDate);
	showLoader(true);
	IPCCCLogClient.SecurityLog(fromDate.value, tillDate.value, cusId, realTime.value)
	.then(success => {
		if(success.ErrorMessage == '') {
			rawData.value = [...success.Records];
			rawData.value.map(log => {
				log.timestamp = timestampToHHMM(log.timestamp);
			});
			unames.value = rawData.value.reduce((acc, cur) => {
				if(acc.indexOf(cur.username) === -1) acc.push(cur.username);

				if(snames.value.indexOf(cur.servicename) === -1)
					snames.value.push(cur.servicename);

				if(actions.value.indexOf(cur.action) === -1)
					actions.value.push(cur.action);

				if(successes.value.indexOf(cur.success) === -1)
					successes.value.push(cur.success);

				if(ipaddresses.value.indexOf(cur.ipaddress) === -1)
					ipaddresses.value.push(cur.ipaddress);

				return acc;
			}, []);
			unames.value.sort();
			snames.value.sort();
			actions.value.sort();
			successes.value.sort();
			ipaddresses.value.sort();
			filterList(() => showLoader(false));
		} else {
			console.error(success.ErrorMessage);
			showLoader(false);
		}
	}).catch(error => {
        console.error(error);
        showLoader(false);
	});
};

const getSuccess = (success) => {
	return success ? store.state.settings.securitylog.successlabels[0] : store.state.settings.securitylog.successlabels[1];
};

const addFilter = (evt, filter = '') => {
    showLoader(true);
	if(filter != '')
		filterObj.value[filter] = evt.target.value;
	else
		filterObj.value[filter] = '';

	filterList(() => showLoader(false));
};

const filterList = (callback) => {
	const _getHour = t => parseInt(t.split(':')[0]);
	logData.value = rawData.value.filter(log => {
		if((_getHour(log.timestamp) == _getHour(filterObj.value['timestamp']) || filterObj.value['timestamp'] == '') &&
		(log.username           == filterObj.value['username']    || filterObj.value['username']    == '') &&
		(log.servicename        == filterObj.value['servicename'] || filterObj.value['servicename'] == '') &&
		(log.action             == filterObj.value['action']      || filterObj.value['action']      == '') &&
		(log.success.toString() == filterObj.value['success']     || filterObj.value['success']     == '') &&
		(log.ipaddress          == filterObj.value['ipaddress']   || filterObj.value['ipaddress']   == '')
		)
		return log;
	});
	if(typeof callback === 'function') callback();
};

const showDescription = (r) => {
	const _labels     = store.state.settings.securitylog.messagelabels;
	const _bodyHeader = `
		<h2>${_labels[0]}: ${r.customername}</h2>
		<div><span>${_labels[1]}: </span><span>${r.username}</span></div>
		<div><span>${_labels[2]}: </span><span>${r.sessionid}</span></div>
		<div><span>${_labels[3]}: </span><span>${r.ipaddress}</span></div>
		<div><span>${_labels[4]}: </span><span>${r.servicename}</span></div>
		<div><span>${_labels[5]}: </span><span>${r.action}</span></div>
		<div><span>${_labels[6]}: </span><span>${getSuccess(r.success)}</span></div>
		<div><span>${_labels[7]}: </span><span>${r.info}</span></div>
	`;
	messageBodyHeader.value.innerHTML = _bodyHeader;
	if(isMassxess.value && r.sessionid.length > 0) {
		getSessionLogLink(r.sessionid)
		.then(([sloglink, sloglinkdwnld]) => {
			if(sloglink) {
				messageBodyHeader.value.appendChild(sloglink);
				messageBodyHeader.value.appendChild(sloglinkdwnld);
			}
			showMessage.value = true;
		}).catch((e) => {console.error(e)});
	} else {
		showMessage.value = true;
	}
};

const getSessionLogLink = (sid) => {
	return new Promise((resolve, reject) => {
		showLoader(true);
		let _file,
			_url           = window.URL || window.webkitURL,
			_sloglink      = document.createElement('a'),
			_sloglinkdwnld = document.createElement('a'),
			_date          = ISOdateTimetoDate( new Date() );
		IPCCCLogClient.SessionLog(sid)
		.then(success => {
			if(!success.ErrorMessage && success.ErrorMessage !== '') {
				_file               = new Blob([success], {type: 'text/plain', endings: 'native'}),
				_sloglink.innerHTML = store.state.settings.securitylog.sloglinktitle + _date + '.txt';
				_sloglink.href      = _url.createObjectURL(_file);
				_sloglink.target    = '_blank';
				_sloglink.setAttribute('class', 'sloglink');
				_sloglinkdwnld.innerHTML = '&#xF1DA';
				_sloglinkdwnld.href      = _url.createObjectURL(_file);
				_sloglinkdwnld.setAttribute('download', store.state.settings.securitylog.sloglinktitle + '_' + sid + '_' + _date + '.txt');
				_sloglinkdwnld.setAttribute('class', 'sloglinkdwnld');
				resolve([_sloglink, _sloglinkdwnld]);
			} else {
				console.error(success.ErrorMessage);
			}
			showLoader(false);
		}).catch(error => {
			console.error(error);
			showLoader(false);
		});
	});
};

const hideDescription = () => {
	messageBody.value.innerHTML       = '';
	messageBodyHeader.value.innerHTML = '';
	showMessage.value                 = false;
};


onMounted(() => {
	selectedCustomerId.value     = store.getters.getCustomerInfo().selectedCustomerId;
	todayDate.value      = selectedDate.value = (store.state.browserLanguage == 'nl') ? todayNL() : todayUK();
	headerlabels.value   = store.state.settings.securitylog.columnlabels;
	showLoader(true);

	setDatePicker();
	isLoaded.value      = true;
	let _today         = new Date();
	fromDate.value.setDate(_today.getDate());
	fromDate.value.setHours(0);
	fromDate.value.setMinutes(0);
	fromDate.value.setSeconds(0);

	if(selectedCustomerId.value !== -1) updateDate(selectedCustomerId.value);

	messageBodyHeader.value = document.getElementById('LOGHeader');
	messageBody.value = document.getElementById('LOGBody');

	unSubscribe = store.watch(() => store.getters.getCustomerInfo(), cObj => {
		console.log('getting customerinfo again');
		if(cObj.selectedCustomerId != -1) {
			showLoader(true);
			selectedCustomerId.value = cObj.selectedCustomerId;
			updateDate(cObj.selectedCustomerId);
		}
	});
});

onBeforeUnmount(() => {
    unSubscribe();
    isLoaded.value = false;
});

</script>

<template>
	<div data-e2e="security-log">
		<!-- SECURITY LOG LIST SCREEN -->
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
                        :data="logData"
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
						<span class="list-content__row-cell list-content__row-cell--15">
							<div class="form-selectfield form-selectfield--listheader">
							<select @change="addFilter($event, 'username')">
								<option value="" selected>{{ headerlabels[1] }}</option>
								<option v-for="uname in unames" :value="uname">{{ uname }}</option>
							</select>
							</div>
						</span>
						<span class="list-content__row-cell list-content__row-cell--15">
							<div class="form-selectfield form-selectfield--listheader">
							<select @change="addFilter($event, 'servicename')">
								<option value="" selected>{{ headerlabels[2] }}</option>
								<option v-for="sname in snames" :value="sname">{{ sname }}</option>-->
							</select>
							</div>
						</span>
						<span class="list-content__row-cell list-content__row-cell--15">
							<div class="form-selectfield form-selectfield--listheader">
							<select @change="addFilter($event, 'action')">
								<option value="" selected>{{ headerlabels[3] }}</option>
								<option v-for="action in actions" :value="action">{{ action }}</option>
							</select>
							</div>
						</span>
						<span class="list-content__row-cell list-content__row-cell--10">
							<div class="form-selectfield form-selectfield--listheader">
							<select @change="addFilter($event, 'success')">
								<option value="" selected>{{ headerlabels[4] }}</option>
								<option v-for="success in successes" :value="success">{{ getSuccess(success) }}</option>
							</select>
							</div>
						</span>
						<span class="list-content__row-cell list-content__row-cell--15">
							<div class="form-selectfield form-selectfield--listheader">
							<select @change="addFilter($event, 'ipaddress')">
								<option value="" selected>{{ headerlabels[5] }}</option>
								<option v-for="ipaddress in ipaddresses" :value="ipaddress">{{ ipaddress }}</option>
							</select>
							</div>
						</span>
						<span class="list-content__row-cell list-content__row-cell--20">{{ headerlabels[6] }}</span>
						</div>
					</div>
					<VirtualListViewer v-if="logData.length > 0" class="list-content"
						:data      = "logData"
						rowClasses = "list-content__row--virtual list-content__row--clickable"
					>
						<template v-slot="{ row, index }">
							<div :class="['list__row', {'list__row--zebra' : index % 2 == 0}]" @click="showDescription(row)">
								<span class="list-content__row-cell list-content__row-cell--10" v-html="row.timestamp"></span>
								<span class="list-content__row-cell list-content__row-cell--15" v-html="row.username"></span>
								<span class="list-content__row-cell list-content__row-cell--15" v-html="row.servicename"></span>
								<span class="list-content__row-cell list-content__row-cell--15" v-html="row.action"></span>
								<span class="list-content__row-cell list-content__row-cell--10" v-html="getSuccess(row.success)"></span>
								<span class="list-content__row-cell list-content__row-cell--15" v-html="row.ipaddress"></span>
								<span class="list-content__row-cell list-content__row-cell--20" v-html="row.info"></span>
							</div>
						</template>
					</VirtualListViewer>
				</div>
			</div>
		</div>
		<!-- DETAIL POPUP -->
		<Message-box
			:status        = "showMessage"
			:headerContent = "messageHeader"
			bodyContent    = "<div class='dialog__LOGHeader' id='LOGHeader'></div>
							  <div class='grid-unit--alpha dialog__LOG' id='LOGBody'></div>"
			acceptLabel    = ""
			:cancelLabel   = "store.state.settings.securitylog.detailcloselbl"
			@canceled      = "hideDescription"
		/>
	</div>
</template>