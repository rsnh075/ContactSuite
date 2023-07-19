<script lang="ts">
export default {
    name: 'MessagingSent'
}
</script>
<script setup lang="ts">

import MessageBox				from './../dialogs/Message-box.vue';
import VirtualListViewer		from './../uielements/VirtualListViewer.vue';
import ExportListToXLSX         from '../uielements/ExportListToXLSX.vue';
import {
		pikaDayToDDMMYYYY,
		timestampToHHMM,
		todayNL,
		todayUK,
		convertISOToDateTime
		}						from './../../use/dateFunctions';
import { dynamicSort }			from './../../use/sortFunctions';
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
import router from '../../router';

const   store				= useStore(),
		showLoader			= inject<Function>('showLoader'),
		selectedCustomerId	= ref(-1),
		customerListObj		= ref({}),
		customernames		= ref([]),
        datePicker			= ref(null),
        fromDate			= ref(new Date()),
        tillDate			= ref(new Date()),
        selectedDate		= ref(null),
        todayDate			= ref(null),
        headerlabels		= ref([]),
        timeIntervals		= ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00' ],
        rawData				= ref(null),
        logData				= ref([]),
        senders				= ref([]),
        recipients			= ref([]),
        currentstates		= ref([]),
        sources				= ref([]),
        providers			= ref([]),
        operators			= ref([]),
        filterObj			= ref(
		{
			sent			: '',
			sender			: '',
			recipient		: '',
			state			: '',
			source			: '',
			provider		: '',
			customername	: '',
			operator		: '',
		}),
        showMessage        = ref(false),
        messageHeader      = ref(null),
        messageBody        = ref(null),
        messageBodyHeader  = ref(null),
        isLoaded           = ref(false),
		isMassxess			= computed(() => store.getters.getCustomerInfo().customerId == 1),
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
					// showLoader(true);
					updateDate(selectedCustomerId.value);
				}
			},
        });
    };
const clearFilters = () => {
		filterObj.value = {
			sent			: '',
			sender			: '',
			recipient		: '',
			state			: '',
			source			: '',
			provider		: '',
			customername    : '',
			operator	    : '',
		};
		senders.value		= [];
		recipients.value	= [];
		currentstates.value	= [];
		sources.value		= [];
		providers.value		= [];
		customernames.value = [];
		operators.value = [];
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
	IPCCCLogClient.MessagingAPI_Sent(fromDate.value, tillDate.value, cusId)
	.then(success => {
		if(!success.Exception && success.StatusCode == 200) {
			let _data		= JSON.parse(success.Data.Json),
				_isSucces	= _data.isSuccess;
			if(_isSucces) {
				rawData.value = [..._data.data];
				rawData.value.map(log => {
					log.sent = timestampToHHMM(new Date(log.sent));
					if(isMassxess.value) log.customername = customerListObj.value[log.customerId];
				});
				rawData.value.sort(dynamicSort('-' + 'sent'));
				senders.value = rawData.value.reduce((acc, cur) => {
					if(acc.indexOf(cur.sender) === -1) acc.push(cur.sender);

					if(recipients.value.indexOf(cur.recipient) === -1)
						recipients.value.push(cur.recipient);

					if(currentstates.value.indexOf(cur.state) === -1)
						currentstates.value.push(cur.state);

					if(sources.value.indexOf(cur.source) === -1)
						sources.value.push(cur.source);

					if(isMassxess.value && providers.value.indexOf(cur.provider) === -1)
						providers.value.push(cur.provider);

					if(isMassxess.value && customernames.value.indexOf(cur.customername) === -1)
						customernames.value.push(cur.customername);

					if(isMassxess.value && operators.value.indexOf(cur.operator) === -1)
						operators.value.push(cur.operator);

					return acc;
				}, []);

				senders.value.sort();
				recipients.value.sort();
				currentstates.value.sort();
				sources.value.sort();
				if(isMassxess.value) providers.value.sort();
				if(isMassxess.value) customernames.value.sort();
				if(isMassxess.value) operators.value.sort();
				filterList(() => showLoader(false));
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
			(_getHour(log.sent)		== _getHour(filterObj.value['sent'])	|| filterObj.value['sent']			== '') &&
			(log.sender				== filterObj.value['sender']			|| filterObj.value['sender']		== '') &&
			(log.recipient			== filterObj.value['recipient']			|| filterObj.value['recipient']		== '') &&
			(log.state				== filterObj.value['state']				|| filterObj.value['state']			== '') &&
			(log.source				== filterObj.value['source']			|| filterObj.value['source']		== '') &&
			(log.provider			== filterObj.value['provider']			|| filterObj.value['provider']		== '') &&
			(log.customername		== filterObj.value['customername']		|| filterObj.value['customername']	== '') &&
			(log.operator			== filterObj.value['operator']			|| filterObj.value['operator']		== '')
		)
		return log;
	});
	if(typeof callback === 'function') callback();
};

const checkIsEMail = (body, type) => {
    if (body && type == 'EMail')
        return "Email";
    else {
        return body;
    }
}

const showDescription = (r) => {
	const _labels     = store.state.settings.messagingsent.messagelabels;
	const _bodyHeader = `
		<h2>${_labels[0]}: ${r.customername}</h2>
		<div><span>${_labels[1]}: </span><span>${r.sent}</span></div>
		<div><span>${_labels[2]}: </span><span>${r.sender}</span></div>
		<div><span>${_labels[3]}: </span><span>${r.recipient}</span></div>
		<div><span>${_labels[4]}: </span><span>${r.state}</span></div>
		<div><span>${_labels[5]}: </span><span>${r.source}</span></div>
		<div><span>${_labels[6]}: </span><span>${r.provider}</span></div>
		<div><span>${_labels[7]}: </span><span>${r.customername}</span></div>
		<div><span>${_labels[8]}: </span><span>${r.operator}</span></div>
		<div><span>${_labels[9]}: </span><span>${r.region}</span></div>
		<div><span>${_labels[10]}: </span><span>${convertISOToDateTime(r.stateUpdate, store.getters.getLang())}</span></div>
		<div><span>${_labels[11]}: </span><span>${checkIsEMail(r.body, r.channel)}</span></div>
		<div><span>${_labels[12]}: </span><span>${r.parts}</span></div>
		${isMassxess ? '<div><span>' + _labels[13] + ': </span><span>' + r.providerId + '</span></div>' : ''}
		${isMassxess ? '<div><span>' + _labels[14] + ': </span><span>' + r.wfmCaseId + '</span></div>' : ''}
	`;
	messageBodyHeader.value.innerHTML = _bodyHeader;
	if(isMassxess.value && r.id.toString().length > 0) {
		let mloglink		= document.createElement('button');
		mloglink.innerHTML	= _labels[15];
		mloglink.onclick = () => goToMessagingLog(r.id);
		mloglink.setAttribute('class', 'mloglink')
		messageBodyHeader.value.appendChild(mloglink);
		showMessage.value = true;
	} else {
		showMessage.value = true;
	}
	showMessage.value = true;
};

const hideDescription = () => {
	messageBody.value.innerHTML       = '';
	messageBodyHeader.value.innerHTML = '';
	showMessage.value                 = false;
};

const goToMessagingLog = (id) => {
	let _searchSentMessage = {
		fromDate : fromDate.value,
		tillDate : tillDate.value,
		selectedSentMessageId : id
	}
	store.commit('SET_SEARCHSENTMESSAGE', _searchSentMessage);

    store.state.navigation.requestNavigation = '/management/monitoring/messaging-log/';
}


onMounted(() => {
	selectedCustomerId.value 	= store.getters.getCustomerInfo().selectedCustomerId;
	todayDate.value      		= selectedDate.value = (store.state.browserLanguage == 'nl') ? todayNL() : todayUK();
	headerlabels.value   		= store.state.settings.messagingsent.columnlabels;
	showLoader(true);

	setDatePicker();
	isLoaded.value      = true;
	let _today         	= new Date();
	fromDate.value.setDate(_today.getDate());
	fromDate.value.setHours(0);
	fromDate.value.setMinutes(0);
	fromDate.value.setSeconds(0);

	if(selectedCustomerId.value !== -1) {
		IPCCCConfigurator.Request(selectedCustomerId.value, 'customers', 'list')
		.then(response => {
			customerListObj.value = response.reduce((obj, item) => (obj[item.CustomerId] = item.Name, obj) ,{});
			updateDate(selectedCustomerId.value);
		}).catch(e => console.error(e));
	}

	messageBody.value = document.getElementById('LOGBody');
	messageBodyHeader.value = document.getElementById('LOGHeader');

	unSubscribe = store.watch(() => store.getters.getCustomerInfo(), cObj => {
		if(cObj.selectedCustomerId != -1) {
			showLoader(true);
			selectedCustomerId.value = cObj.selectedCustomerId;
			IPCCCConfigurator.Request(selectedCustomerId.value, 'customers', 'list')
        	.then(response => {
				customerListObj.value = response.reduce((obj, item) => (obj[item.CustomerId] = item.Name, obj) ,{});
				updateDate(cObj.selectedCustomerId);
			}).catch(e => console.error(e));
		}
	});
});

onBeforeUnmount(() => {
    unSubscribe();
    isLoaded.value = false;
});

</script>

<template>
	<div data-e2e="messagingsent">
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
								<select @change="addFilter($event, 'sent')">
									<option value="" selected>{{ headerlabels[0] }}</option>
									<option v-for="time in timeIntervals" :value="time">{{ time }}</option>
								</select>
								</div>
							</span>
							<span class="list-content__row-cell list-content__row-cell--15">
								<div class="form-selectfield form-selectfield--listheader">
								<select @change="addFilter($event, 'sender')">
									<option value="" selected>{{ headerlabels[1] }}</option>
									<option v-for="sender in senders" :value="sender">{{ sender }}</option>
								</select>
								</div>
							</span>
							<span class="list-content__row-cell list-content__row-cell--15">
								<div class="form-selectfield form-selectfield--listheader">
								<select @change="addFilter($event, 'recipient')">
									<option value="" selected>{{ headerlabels[2] }}</option>
									<option v-for="recipient in recipients" :value="recipient">{{ recipient }}</option>-->
								</select>
								</div>
							</span>
							<span class="list-content__row-cell list-content__row-cell--10">
								<div class="form-selectfield form-selectfield--listheader">
								<select @change="addFilter($event, 'currentstate')">
									<option value="" selected>{{ headerlabels[3] }}</option>
									<option v-for="currentstate in currentstates" :value="currentstate">{{ currentstate }}</option>
								</select>
								</div>
							</span>
							<span class="list-content__row-cell list-content__row-cell--10">
								<div class="form-selectfield form-selectfield--listheader">
								<select @change="addFilter($event, 'source')">
									<option value="" selected>{{ headerlabels[4] }}</option>
									<option v-for="source in sources" :value="source">{{ source }}</option>
								</select>
								</div>
							</span>
							<span v-if="isMassxess" class="list-content__row-cell list-content__row-cell--15">
								<div class="form-selectfield form-selectfield--listheader">
								<select @change="addFilter($event, 'provider')">
									<option value="" selected>{{ headerlabels[5] }}</option>
									<option v-for="provider in providers" :value="provider">{{ provider }}</option>
								</select>
								</div>
							</span>
							<span v-if="isMassxess" class="list-content__row-cell list-content__row-cell--15">
								<div class="form-selectfield form-selectfield--listheader">
								<select @change="addFilter($event, 'customername')">
									<option value="" selected>{{ headerlabels[6] }}</option>
									<option v-for="customername in customernames" :value="customername">{{ customername }}</option>
								</select>
								</div>
							</span>
							<span v-if="isMassxess" class="list-content__row-cell list-content__row-cell--10">
								<div class="form-selectfield form-selectfield--listheader">
								<select @change="addFilter($event, 'operator')">
									<option value="" selected>{{ headerlabels[7] }}</option>
									<option v-for="operator in operators" :value="operator">{{ operator }}</option>
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
								<span class="list-content__row-cell list-content__row-cell--10" v-html="row.sent"></span>
								<span class="list-content__row-cell list-content__row-cell--15" v-html="row.sender"></span>
								<span class="list-content__row-cell list-content__row-cell--15" v-html="row.recipient"></span>
								<span class="list-content__row-cell list-content__row-cell--10" v-html="row.state"></span>
								<span class="list-content__row-cell list-content__row-cell--10" v-html="row.source"></span>
								<span v-if="isMassxess" class="list-content__row-cell list-content__row-cell--15" v-html="row.provider"></span>
								<span v-if="isMassxess" class="list-content__row-cell list-content__row-cell--15" v-html="row.customername"></span>
								<span v-if="isMassxess" class="list-content__row-cell list-content__row-cell--10" v-html="row.operator"></span>
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
			:cancelLabel   = "store.state.settings.messagingsent.detailcloselbl"
			@canceled      = "hideDescription"
		/>
	</div>
</template>


<style lang="scss">

@use "@/scss/includes/functions";
@use "@/scss/includes/globals";

.mloglink {
	margin-top: 5px;
	padding: 5px 22px;
	color: globals.$color-gray60;
	cursor: pointer;
}

</style>