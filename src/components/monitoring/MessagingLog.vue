<script lang="ts">
export default {
    name: 'MessagingLog'
}
</script>
<script setup lang="ts">
import MessageBox				from '../dialogs/Message-box.vue';
import VirtualListViewer		from '../uielements/VirtualListViewer.vue';
import ExportListToXLSX         from '../uielements/ExportListToXLSX.vue';

import {
		pikaDayToDDMMYYYY,
		timestampToHHMM,
		todayNL,
		todayUK,
		convertISOToDateTime
		}						from './../../use/dateFunctions';
import PikaDay					from 'pikaday';
import { IPCCCLogClient }		from './../../ipccc/js/logclient';
import { useStore }				from 'vuex';
import { computed,
		inject,
		onBeforeUnmount,
		onMounted,
		ref
		}						from '@vue/runtime-core';
import { IPCCCConfigurator }	from '../../ipccc/js/configurator';

const   store				= useStore(),
		showLoader			= inject<Function>('showLoader'),
		selectedCustomerId	= ref(-1),
		customerListObj		= ref({}),
		sentMessageIds		= ref([]),
        datePicker			= ref(null),
        fromDate			= ref(new Date()),
        tillDate			= ref(new Date()),
        selectedDate		= ref(null),
		selectedSentMessageId = ref(null),
        todayDate			= ref(null),
        headerlabels		= ref([]),
        timeIntervals		= ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00' ],
        rawData				= ref(null),
        logData				= ref([]),
        levels				= ref([]),
        messages			= ref([]),
        ipAddresses			= ref([]),
        servers				= ref([]),
        additionalInfos		= ref([]),
        receivedMessageId	= ref([]),
        filterObj			= ref(
		{
			dateTime			: '',
			level				: '',
			message				: '',
			ipAddress			: '',
			server				: '',
			additionalInfo		: '',
			sentMessageId		: '',
			receivedMessageId	: ''
		}),
        showMessage			= ref(false),
        messageHeader		= ref(null),
        messageBody			= ref(null),
        messageBodyHeader	= ref(null),
        isLoaded			= ref(false),
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

const resetSearchSentMessage = () => {
	let _searchSentMessage = {
		fromDate : '',
		tillDate : '',
		selectedSentMessageId : null
	}
	store.commit('SET_SEARCHSENTMESSAGE', _searchSentMessage);
}

const setDatePicker = () => {
	datePicker.value = new PikaDay({
		field    : document.getElementById('datepicker'),
		// format   : (store.state.browserLanguage == 'nl') ? 'DD-MM-YYYY' : 'MM-DD-YYYY',
		format: 'DD-MM-YYYY',
		maxDate  : new Date(),
		i18n     : store.state.settings.datepicker,
		defaultDate: fromDate.value,
      	setDefaultDate: true,
		onSelect : () => {
			selectedDate.value = pikaDayToDDMMYYYY(datePicker.value.getDate());
			fromDate.value     = new Date(datePicker.value.getDate());
			if(isLoaded.value) {
				// showLoader(true);
				updateDate();
			}
		},
	});
};

const clearFilters = () => {
		filterObj.value = {
			dateTime		: '',
			level			: '',
			message		: '',
			ipAddress			: '',
			server			: '',
			additionalInfo		: '',
			sentMessageId    : '',
			receivedMessageId	    : '',
		};
		levels.value		= [];
		messages.value	= [];
		ipAddresses.value	= [];
		servers.value		= [];
		additionalInfos.value		= [];
		sentMessageIds.value = [];
		receivedMessageId.value = [];
};

const updateDate = () => {
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
	IPCCCLogClient.MessagingAPI_Log(fromDate.value, tillDate.value, null, selectedSentMessageId.value)
	.then(success => {
		if(!success.Exception && success.StatusCode == 200) {
			let _data		= JSON.parse(success.Data.Json),
				_isSucces	= _data.isSuccess;
			if(_isSucces) {
				rawData.value = [..._data.data];
				rawData.value.map(log => {
					log.dateTime = timestampToHHMM(new Date(log.dateTime));
				});
				levels.value = rawData.value.reduce((acc, cur) => {
					if(acc.indexOf(cur.level) === -1) acc.push(cur.level);

					if(messages.value.indexOf(cur.message) === -1)
						messages.value.push(cur.message);

					if(ipAddresses.value.indexOf(cur.ipAddress) === -1)
						ipAddresses.value.push(cur.ipAddress);

					if(servers.value.indexOf(cur.server) === -1)
						servers.value.push(cur.server);

					return acc;
				}, []);

				levels.value.sort();
				messages.value.sort();
				ipAddresses.value.sort();
				servers.value.sort();
				filterList(() => showLoader(false));
				resetSearchSentMessage();
				selectedDate.value = pikaDayToDDMMYYYY(datePicker.value.getDate());
				selectedSentMessageId.value = null;
				showLoader(false);
			}
		} else {
			console.error(success.ErrorMessage);
			showLoader(false);
		}
	}).catch(error => {
        console.error(error);
        showLoader(false);
	});
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
		if(
			(_getHour(log.dateTime)	== _getHour(filterObj.value['dateTime'])|| filterObj.value['dateTime']			== '') &&
			(log.level				== filterObj.value['level']			    || filterObj.value['level']		        == '') &&
			(log.message			== filterObj.value['message']			|| filterObj.value['message']		    == '') &&
			(log.ipAddress			== filterObj.value['ipAddress']			|| filterObj.value['ipAddress']			== '') &&
			(log.server				== filterObj.value['server']			|| filterObj.value['server']		    == '')
		)
		return log;
	});
	if(typeof callback === 'function') callback();
};

const showDescription = (r) => {
	const _labels     = store.state.settings.messaginglog.messagelabels;
	const _bodyHeader = `
		<h2>${_labels[0]}</h2>
	`;
	const _body = `
		<div><span>${_labels[1]}: </span><span>${r.dateTime}</span></div>
		<div><span>${_labels[2]}: </span><span>${r.level}</span></div>
		<div><span>${_labels[3]}: </span><span>${r.message}</span></div>
		<div><span>${_labels[4]}: </span><span>${r.ipAddress}</span></div>
		<div><span>${_labels[5]}: </span><span>${r.server}</span></div>
		<div><span>${_labels[6]}: </span><span>${r.additionalInfo}</span></div>
		<div><span>${_labels[7]}: </span><span>${r.sentMessageId}</span></div>
		<div><span>${_labels[8]}: </span><span>${r.receivedMessageId}</span></div>
	`;
	messageBodyHeader.value.innerHTML = _bodyHeader;
	messageBody.value.innerHTML = _body;
	showMessage.value = true;
};

const hideDescription = () => {
	messageBody.value.innerHTML       = '';
	messageBodyHeader.value.innerHTML = '';
	showMessage.value                 = false;
};


onMounted(() => {
	selectedCustomerId.value     = store.getters.getCustomerInfo().selectedCustomerId;
	todayDate.value      = selectedDate.value = (store.state.browserLanguage == 'nl') ? todayNL() : todayUK();
	headerlabels.value   = store.state.settings.messaginglog.columnlabels;
	showLoader(true);


	if(store.getters.getSearchSentMessage().selectedSentMessageId) {
		selectedSentMessageId.value = store.getters.getSearchSentMessage().selectedSentMessageId;
		fromDate.value.setDate(store.getters.getSearchSentMessage().fromDate.getDate());
		fromDate.value.setHours(0);
		fromDate.value.setMinutes(0);
		fromDate.value.setSeconds(0);
	} else {
		let _today         = new Date();
		fromDate.value.setDate(_today.getDate());
		fromDate.value.setHours(0);
		fromDate.value.setMinutes(0);
		fromDate.value.setSeconds(0);
	}

	setDatePicker();
	isLoaded.value      = true;

	if(selectedCustomerId.value !== -1) {
		IPCCCConfigurator.Request(selectedCustomerId.value, 'customers', 'list')
		.then(response => {
			customerListObj.value = response.reduce((obj, item) => (obj[item.CustomerId] = item.Name, obj) ,{});
			updateDate();
		}).catch(e => console.error(e));
	}

	messageBodyHeader.value = document.getElementById('LOGHeader');
	messageBody.value = document.getElementById('LOGBody');

	unSubscribe = store.watch(() => store.getters.getCustomerInfo(), cObj => {
		if(cObj.selectedCustomerId != -1) {
			showLoader(true);
			selectedCustomerId.value = cObj.selectedCustomerId;
			IPCCCConfigurator.Request(selectedCustomerId.value, 'customers', 'list')
        	.then(response => {
				customerListObj.value = response.reduce((obj, item) => (obj[item.CustomerId] = item.Name, obj) ,{});
				updateDate();
			}).catch(e => console.error(e));
		}
	});
});

onBeforeUnmount(() => {
	resetSearchSentMessage();
    unSubscribe();
    isLoaded.value = false;
});

</script>

<template>
	<div data-e2e="messaginglog">
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
                                <select @change="addFilter($event, 'dateTime')">
                                    <option value="" selected>{{ headerlabels[0] }}</option>
                                    <option v-for="time in timeIntervals" :value="time">{{ time }}</option>
                                </select>
                                </div>
                            </span>
                            <span class="list-content__row-cell list-content__row-cell--10">
                                <div class="form-selectfield form-selectfield--listheader">
                                <select @change="addFilter($event, 'level')">
                                    <option value="" selected>{{ headerlabels[1] }}</option>
                                    <option v-for="level in levels" :value="level">{{ level }}</option>
                                </select>
                                </div>
                            </span>
                            <span class="list-content__row-cell list-content__row-cell--55">
                                <div class="form-selectfield form-selectfield--listheader">
                                <select @change="addFilter($event, 'message')">
                                    <option value="" selected>{{ headerlabels[2] }}</option>
                                    <option v-for="message in messages" :value="message">{{ message }}</option>-->
                                </select>
                                </div>
                            </span>
                            <span class="list-content__row-cell list-content__row-cell--15">
                                <div class="form-selectfield form-selectfield--listheader">
                                <select @change="addFilter($event, 'ipAddress')">
                                    <option value="" selected>{{ headerlabels[3] }}</option>
                                    <option v-for="ipAddress in ipAddresses" :value="ipAddress">{{ ipAddress }}</option>
                                </select>
                                </div>
                            </span>
                            <span class="list-content__row-cell list-content__row-cell--10">
                                <div class="form-selectfield form-selectfield--listheader">
                                <select @change="addFilter($event, 'server')">
                                    <option value="" selected>{{ headerlabels[4] }}</option>
                                    <option v-for="server in servers" :value="server">{{ server }}</option>
                                </select>
                                </div>
                            </span>
						</div>
					</div>
					<VirtualListViewer v-if="logData.length > 0" class="list-content"
						:data      = "logData"
						rowClasses = "list-content__row--virtual list-content__row--clickable"
					>
						<template v-slot="{ row, index }">
							<div :class="['list__row', {'list__row--zebra' : index % 2 == 0}]" @click="showDescription(row)">
								<span class="list-content__row-cell list-content__row-cell--10" v-html="row.dateTime"></span>
								<span class="list-content__row-cell list-content__row-cell--10" v-html="row.level"></span>
								<span class="list-content__row-cell list-content__row-cell--55" v-html="row.message"></span>
								<span class="list-content__row-cell list-content__row-cell--15" v-html="row.ipAddress"></span>
								<span class="list-content__row-cell list-content__row-cell--10" v-html="row.server"></span>
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
			:cancelLabel   = "store.state.settings.messaginglog.detailcloselbl"
			@canceled      = "hideDescription"
		/>
	</div>
</template>

<style lang="scss" scoped>

.dialog__window .dialog__window--w500 .dialog__window--open {
	max-width: 828px;
}

</style>
