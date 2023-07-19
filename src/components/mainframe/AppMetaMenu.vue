<script lang="ts">
export default {
    name: "AppMetaMenu"
}
</script>

<script setup lang="ts">
import { useStore }             from 'vuex';
import {
		onMounted,
		onUnmounted,
		ref,
		inject,
		provide,
		watch,
		computed
		}                        from 'vue';

import {
		PencilCircleOutline,
        PhoneCheckOutline,
		Power,
		ChevronLeft,
        Deskphone,
        MinusCircle,
		}  from 'mdue';

import { IPCCCConfigurator }    from './../../ipccc/js/configurator.js';
import { IPCCCStatus, EnumUserStatus } from './../../ipccc/js/status.js';

import PersonalStatusBox        from './../personalstatusbox/PersonalStatusBox.vue';
import SetIdentityMenu          from './../setidentitymenu/SetIdentityMenu.vue';
import SetDeviceMenu            from './../setdevicemenu/SetDeviceMenu.vue';
import OnOffQueue               from './../onoffqueue/OnOffQueue.vue';
import BrowserPhone             from './BrowserPhone.vue';
import MoreOptionsMenu			from './MoreOptionsMenu.vue';
import CustomerList				from './Customer-list.vue';
import { timeToClockHHMMSS }	from './../../use/dateFunctions';
import BoxProps, { ModalType }	from '../../types/BoxProps';

const showLoader                = <Function>inject('showLoader'),
	store                       = <object | any>useStore(),
	identityMenu                = ref(null),
	deviceMenu                  = ref(null),
	initials                    = ref<string>(''),
	statusList                  = ref<Array<object | any>>([]),
	identityList                = ref<Array<object | any>>([]),
	menuOpen                    = ref<boolean>(false),
	personalMessage             = ref<string>(''),
	personalStatusProps         = ref<object>({}),
	hasInteraction              = ref(computed(() => store.getters.getPermission('ModuleInteractie'))),
	hasOnoffQueue               = ref(computed(() => store.getters.getPermission('OnoffQueue'))),
	hasWebPhone                 = ref(computed(() => store.getters.getCurrentSelDevice().MACAddress.toUpperCase().startsWith("WEBRTC"))),
	hasWorkPlace                = ref(computed(() => store.getters.getCurrentSelDevice().IsWorkplace)),
	hasResellerRights           = ref(computed(() => store.getters.getPermission('Reseller'))),
	statusCustomerList          = ref<boolean>(false),
	customerList                = ref<Array<object | any>>([]),
	customerName                = ref<string>(''),
	showModalDialog             = <Function>inject('showModalDialog'),
	hasActiveLine               = computed(() => store.state.navigation.hasActiveLine),
    currentSelDeviceNumber      = computed(() => store.getters.getCurrentSelDevice().Address !== 'free' ? store.getters.getCurrentSelDevice().Address : store.getters.getCurrentSelDevice().Name),
    discardDoNotDisturb         = ref(false),
    doNotDisturb                = computed(() => store.getters.getCurrentSelDeviceDND() ? store.getters.getCurrentSelDeviceDND() ? store.getters.getCurrentSelDeviceDND() : false : false);

const actorIsMe = ref(<boolean>false),
	startTime   = ref(<number>null),
	statusTimer = ref(null);

const closeAllSubs = () => {
    if (hasInteraction.value) {
        identityMenu.value?.closeOptions();
        deviceMenu.value?.closeOptions();
    }
}

provide('closeAllSubs', closeAllSubs);

const menuHandling = ():void => {
	menuOpen.value = !menuOpen.value;
	closeAllSubs();
}

const toggleCustomerList = ():void => {
	getCustomers(() => {
		statusCustomerList.value = !statusCustomerList.value;
	});
}

const clickHandler = (evt:MouseEvent):void => {
	if(!(evt.target as HTMLElement).classList.contains('menu-toggle--js')) {
		menuOpen.value = (evt.target as HTMLElement).classList.contains('menu--js');
	}
	closeAllSubs();
};

const getCustomers = (ready):void => {

	let _clientCode = store.state.clientCode,
		_customerId = store.state.loginSession.Details.CustomerId;

	IPCCCConfigurator.Request(store.state.loginSession.Details.CustomerId, 'customers', 'list', null, -1)
	.then(response => {
		//Remove loggedin customer from list
		let _index           = response.findIndex(cust => parseInt(cust.CustomerId) == parseInt(_customerId));
		if(_index != -1) {
			customerName.value    = response[_index].Name;
		}
		if(_index != -1) {
			response.splice(_index, 1);
		}

		// If Massxess than all customers else only customers you are reseller from.
		if (_clientCode == 'massxess') {
			customerList.value  = response;
		} else {
			customerList.value  = response.filter(cust => parseInt(cust.ResellerId) == parseInt(_customerId));
		}

		if(typeof ready === 'function') {
			ready();
		}
	})
	.catch(error => {
		console.error(error);
	});
}

const resizeHandler = ():void => {
	menuOpen.value = false;
	closeAllSubs();
};

const setUserStatus = (evt:MouseEvent):void => {
	let _target:HTMLElement      = evt.target as HTMLElement,
		_statusId:number         = parseInt(_target.classList.contains('statusmenu__statuslist-dot') ? (_target.parentNode as HTMLElement).getAttribute('data-statusid') : (_target as HTMLElement).getAttribute('data-statusid')),
		_statusObj:object | any  = statusList.value.find(s => s.StatusId === _statusId);

	if(!_statusObj || _statusObj?.Label === store.state.statusLbl && _statusId !== EnumUserStatus.Wrapup) return;

	actorIsMe.value = true;
	showLoader(true, store.state.settings.agentPanel.statuschange);

	IPCCCStatus.Set(_statusId)
	.then(() => {
		if(_statusId !== EnumUserStatus.Wrapup) {
		  store.state.statusId    = _statusObj.StatusId;
		  store.state.statusColor = _statusObj.Color;
		  store.state.statusLbl   = _statusObj.Label;
		}
		setTimeout(showLoader, 500, false);
	})
	.catch(error => {
		const boxProps = new BoxProps(ModalType.Alert, store.state.settings.alertheader, store.state.settings.statusseterror)
		showModalDialog(boxProps);
		console.error(error);
		showLoader(false);
	});
};

//--------------------------- STATUS TAB TIMER + MESSAGE
const openStatusMessage = (statusid) => {
	const messageBody = statusid == 5 ? store.state.settings.statusmsg5 : store.state.settings.statusmsg8;
	const messageHeader = store.state.settings.alertheader;
	const boxProps = new BoxProps(ModalType.Alert, messageHeader, messageBody)
	boxProps.confirmFn = () => { actorIsMe.value = false };
	showModalDialog(boxProps);
}

const startStatusTime = () => {
	startTime.value = Date.now();
	statusTimer.value = setInterval(() => {
	setStatusTimer();
	}, 1000);
}

const setStatusTimer = ():void => {
	let _now       = Date.now(),
		_deltaSec  = _now - startTime.value,
		_time      = timeToClockHHMMSS(_deltaSec);

	document.title = store.state.statusLbl + ' : ' + _time;
	store.commit('SET_CURRENT_STATUS_TIME', {
		time : _time,
		mSec : _deltaSec
	});
}

const coachIsUnavailableTimer = ref<object | any>(null);

const invokeOpenStatusMessage = (statusid) => {
	store.commit('RESET_INBOUNDLINE_INFO', true);
	openStatusMessage(statusid);
}

watch(() => store.getters.statusChanged(), (status, oldstatus) => {
	//fix 23081 - dont show status alert when supervisor invokes IPCCCSupervisor.Listen but supervisor didnt pick up.
    //fix 24786 - dont show status alert when you don't have ModuleInteractie.
    if (!store.getters.getPermission('ModuleInteractie')) return;
	if(oldstatus.StatusId == EnumUserStatus.Unavailable && store.getters.getSupervisorIsListening()) {
		store.commit('SET_SUPERVISOR_ISLISTENING', false);
		clearTimeout(coachIsUnavailableTimer.value);
	}
	if((status.StatusId == EnumUserStatus.Unavailable || status.StatusId == EnumUserStatus.Break) && !actorIsMe.value) {
		if(store.getters.getSupervisorIsListening()) {
			coachIsUnavailableTimer.value = setTimeout(invokeOpenStatusMessage, 300, status.statusId);
		} else {
			invokeOpenStatusMessage(status.StatusId);
		}
	} else {
		actorIsMe.value  = false;
	}
	clearInterval(statusTimer.value);
	startStatusTime();
});

const setSelectedCustomerId = (selId: string, selName: string, selUsesCasa: string):void => {
	let _cData = {
		customerId               : store.state.loginSession.Details.CustomerId,
		customerName             : customerName.value,
		selectedCustomerId       : selId,
		selectedCustomerName     : selName,
		selectedCustomerUsesCasa : selUsesCasa,
	}

	store.commit('SET_CUSTOMER_INFO', _cData);
};

const editPersonalMessage = ():void => {
	personalStatusProps.value = {
		boxShow      : true,
		userId       : store.state.loginSession.Details.UserId,
		msg          : personalMessage.value
	};
}

function setDND(pbxsettings) {
    //Check DND status on current selected device
    let _selectedPbxSettings = pbxsettings.find(pbx => pbx.VoIPAccountNumber == store.getters.getCurrentSelDevice().Address);
    if (_selectedPbxSettings == undefined) {
        store.commit('SET_CURRENT_SELECTED_DEVICE_DND', false);
        discardDoNotDisturb.value = true;
    } else {
        store.commit('SET_CURRENT_SELECTED_DEVICE_DND', _selectedPbxSettings.DND ?? false);
        discardDoNotDisturb.value = false;
    }
}

watch(() => store.getters.getStatusMessage(), (newVal) => {
	personalMessage.value = newVal?.length > 0 ? newVal : store.state.settings.statusmenu.defaultmsg;
},{immediate : true});

onMounted(() => {
	initials.value        = store.state.loginSession.Details.FullName.split(" ").map((name, index, array)=> index === 0 || index + 1 === array.length ? name[0] : null).join("");
	identityList.value    = store.state.loginSession.Details.OutboundIdentities;
	IPCCCStatus.GetSelectableList()
	.then(selectableList => statusList.value = selectableList)
	.catch(e => console.error(e));
	startStatusTime();
	// getCustomers(() => {
	//   setSelectedCustomerId(customerId.value, customerName.value, true);
	// });
	window.addEventListener("click", clickHandler);
	window.addEventListener("resize", resizeHandler);
    store.dispatch('GET_PBXSETTINGS')
    .then((pbxsettings) => {
        store.commit('SET_PBXSETTINGS', pbxsettings);
        setDND(pbxsettings);
    })
    .catch(error => {
        console.error(error);
    })
    store.watch(store.getters.getPbxSettings, pbxsettings => {
        setDND(pbxsettings);
    }, {deep:true});

    store.watch(store.getters.getCurrentSelDevice, currentDevice => {
        if (currentDevice.Address !== '' && currentDevice.Address !== 'Geen toestel') {
            setDND(store.getters.getPbxSettings());
        }
    });
});

onUnmounted(() => {
	window.removeEventListener("click", clickHandler);
	window.removeEventListener("resize", resizeHandler);
});

</script>

<template>
	<PersonalStatusBox :payload="personalStatusProps" />
	<div class="header-navigation__right-menu" data-e2e="meta-menu-right">
        <div class="status-dnd" v-if="!hasWebPhone && !hasWorkPlace && currentSelDeviceNumber.length > 0">
            <PhoneCheckOutline title="currentSelDeviceNumber" :class="['status-dnd__icon-device', {'status-dnd__icon-device--alert' : doNotDisturb}]" />
            <label v-if="doNotDisturb" title="Do not disturb" class="status-dnd__label status-dnd__label--warn">DND</label>
            <label v-if="!doNotDisturb" :title="currentSelDeviceNumber" class="status-dnd__label">{{ currentSelDeviceNumber }}</label>
        </div>
        <div class="status-dnd" v-if="!hasWebPhone && hasWorkPlace">
            <PhoneCheckOutline class="status-dnd__icon-device" />
            <label v-if="discardDoNotDisturb" :title="store.state.currentSelDevice.Name" class="status-dnd__label">{{ store.state.currentSelDevice.Name }}</label>
        </div>
		<BrowserPhone v-if="hasWebPhone" :doNotDisturb="doNotDisturb" />
		<OnOffQueue v-if="hasOnoffQueue" />
		<button
            class="status-button menu-toggle--js"
            :disabled="hasActiveLine || !store.state.statusSelectable"
            data-e2e="app-meta-menu-toggle-btn"
            @click="menuHandling">
			<div class="status-initials menu-toggle--js">
				{{ initials }}
				<div class="status-colordot menu-toggle--js" :style="{backgroundColor : store.state.statusColor}"></div>
			</div>
			<div class="status-status menu-toggle--js">{{ store.state.statusLbl }}</div>
		</button>
		<MoreOptionsMenu
			v-if="hasResellerRights"
			@toggleCList="toggleCustomerList"
			:statusCList="statusCustomerList"
		/>
	</div>
	<div v-if="statusCustomerList" data-e2e="status-customer-list">
		<CustomerList v-if="statusCustomerList"
			@toggleCList    = "toggleCustomerList"
			@customerChange = "setSelectedCustomerId"
			:clist          = "customerList"
		/>
	</div>
	<div :class="['statusmenu-wrapper menu--js', {'statusmenu-wrapper--open' : menuOpen}]" data-e2e="status-menu">
		<div v-if="hasInteraction" class="statusmenu__status-message" @click="editPersonalMessage">
			{{ personalMessage }}<PencilCircleOutline />
		</div>
		<div v-if="hasInteraction" class="statusmenu__statuslist" @click="setUserStatus">
			<div v-for="status in statusList" class="statusmenu__statuslist-item" :key="status.StatusId" :data-statusid="status.StatusId">
				<div class="statusmenu__statuslist-dot" :style="'background-color:#' + status.Color"></div>{{ status.Label }}
			</div>
		</div>
		<div v-if="hasInteraction" class="statusmenu-identity">
			<ChevronLeft />
			<SetIdentityMenu ref="identityMenu"/>
		</div>
		<div v-if="hasInteraction" class="statusmenu-number">
			<ChevronLeft />
			<SetDeviceMenu ref="deviceMenu"/>
		</div>
		<div class="statusmenu-logout">
			<router-link to="/logout/" class="">{{ store.state.settings.statusmenu.logoutlabel }}</router-link>
			<Power />
		</div>
	</div>
</template>

<style lang="scss" scoped>

@use "@/scss/includes/font";
@use "@/scss/includes/globals";

.header-navigation__right-menu {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 200;
    width: auto;
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
}

.status-dnd {
    display: block;
    position: relative;
    width: 90px;
    height: 80px;
    float: left;
    background-color: globals.$color-white;
    color: globals.$color-home;
    font-size: .67em;
    letter-spacing: -0.1px;
    text-align: center;
    white-space: nowrap;
    font-family: 'Abel', sans-serif;
    text-decoration: none;
    &__icon-device {
        position: absolute;
        top: 32px;
        left: 50%;
        -webkit-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        font-size: 1.6rem;
        z-index: 1;
        &--alert {
            color: globals.$color-unavailable;
        }
    }
    &__icon-dnd {
        position: absolute;
        fill: globals.$color-unavailable;
        font-size: 1rem;
        inset: 36px 0 0 27px;
        z-index: 1;
    }
    &__label {
        position: relative;
        display: block;
        width: 100%;
        height: 80px;
        background-color: globals.$color-white;
        padding-top: 54px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        &--warn {
            color: globals.$color-unavailable;
            font-weight: bold;
        }
    }
}

.status-button {
    position: relative;
    float: right;
    height: 80px;
    width: 80px;
    background-color: globals.$color-white;
    cursor: pointer;
    &:hover {
      background-color: globals.$color-gray2;
    }
}
.status-button:disabled {
      cursor: not-allowed;
}
.status-initials {
    display: block;
    width: 40px;
    height: 40px;
    line-height: 40px;
    color: globals.$color-white;
    font-size: 1.5em;
    margin: 3px 20px 35px;
    background-color: globals.$color-gray30;
    text-align: center;
    border-radius: 50%;
    @include font.font-menu();
}

.status-colordot {
    position: absolute;
    top: 39px;
    left: 48px;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background-color: #E9E9E9;
    border: 2px solid globals.$color-white;
    z-index: 10;
}

.status-status {
    margin-top: -33px;
    color: globals.$color-gray40;
    @include font.font-menu();
    font-size: 1em;
    text-overflow: ellipsis;
    overflow: hidden;
    width: 100%;
    white-space: nowrap;
}

.statusmenu-wrapper {
    display: none;
    position: absolute;
    top: 80px;
    right: 0;
    width: 260px;
    min-height: 40px;
    background-color: globals.$color-white;
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.15);
    &--open {
      display: block;
    }
}

.statusmenu__status-message,
.statusmenu__statuslist,
.statusmenu-identity,
.statusmenu-number,
.statusmenu-logout {
    position: relative;
    height: 40px;
    line-height: 40px;
    padding: 0 10px;
    font-size: 14px;
    border-bottom: 1px solid globals.$color-gray10;
}
.statusmenu__statuslist {
    height: auto;
    max-height: calc(70vh - 160px);
    overflow-x: hidden;
    overflow-y: auto;
    padding: 0;
    .statusmenu__statuslist-item {
		float: left;
		width: 100%;
		user-select: none;
		color: globals.$color-gray50;
		@include font.font-medium();
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		&:hover {
			background-color: globals.$color-gray5;
		}
		.statusmenu__statuslist-dot {
			float: left;
			width: 12px;
			height: 12px;
			border-radius: 50%;
			margin: 14px 8px 14px 10px;
		}
    }
}

.statusmenu__status-message {
    text-overflow: ellipsis;
    overflow: hidden;
    width: 100%;
    padding-right: 40px;
    white-space: nowrap;
    user-select: none;
    cursor: pointer;
    color: globals.$color-help;
    svg {
		// float: right;
        position: absolute;
        right: 0px;
        top: 0px;
		width: 22px;
		height: 22px;
		margin: 9px;
		fill: globals.$color-help;
    }
}

.statusmenu-identity,
.statusmenu-number {
    svg {
      float: left;
      width: 26px;
      height: 26px;
      margin: 7px 5px 0 -7px;
      color: globals.$color-gray30;
    }
}

.statusmenu-logout {
    &:hover {
		background-color: globals.$color-gray5;
    }
    a,
    a:visited,
    a:active {
		color: globals.$color-unavailable;
		text-decoration: none;
		font-size: 1.1em;
		cursor: pointer;
		display: block;
    }
    svg {
		position: absolute;
		right: 10px;
		top: 0;
		pointer-events: none;
		fill: globals.$color-unavailable;
		width: 26px;
		height: 26px;
		margin-top: 8px;
    }
}

</style>