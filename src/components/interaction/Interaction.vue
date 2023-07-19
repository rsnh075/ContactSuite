<template>
  	<div :class="frameClass" data-e2e="interaction">
        <PhoneButtons ref="phonebuttons" />
		<!-- <header class="baseframe-header">
		</header> -->
		<section class="baseframe-body">
			<div class="baseframe-body__lefttabs">
				<TabBarLeft :lefttabs="leftTabs" :activelefttab="activeLeftTab"/>
                <button
                    v-show="phonebuttons?.dockPhonebuttons && !(phonebuttons?.enableDockedPickUp && phonebuttons?.enableDockedHangup)"
                    data-e2e="btn-docked-phonebuttons-undock"
                    class="minimized-phonebuttons-btn"
                    @click="phonebuttons?.undocThePhoneButtons()"
                >
                    <ArrowCollapseRight />
                </button>
                <button
                    v-show="phonebuttons?.dockPhonebuttons && phonebuttons?.enableDockedHangup"
                    data-e2e="btn-docked-phonebuttons-hangup"
                    class="minimized-phonebuttons-btn-hangup"
                    @click="phonebuttons?.hangUpActiveLine()"
                >
                    <PhoneHangup />
                </button>
                <button
                    v-show="phonebuttons?.dockPhonebuttons && phonebuttons?.enableDockedPickUp"
                    data-e2e="btn-docked-phonebuttons-pickup"
                    class="minimized-phonebuttons-btn-pickup"
                    @click="phonebuttons?.pickUpActiveCall()"
                >
                    <Phone />
                </button>
			</div>
			<div class="baseframe-body__leftlane">
				<TabContentWrapper :tabComponents="leftLaneComponents" :activeIndex="activeLeftTabComp" />
			</div>
			<!-- CONTENT AREA -->
			<div class="baseframe-body__content">
				<TabContentWrapper :tabComponents="baseComponents" :activeIndex="activeBaseComp" />
			</div>
			<div class="baseframe-body__righttabs">
				<TabBarRight :righttabs="rightTabs" :activerighttab="activeRightTab" :disabledrighttabs="disabledRightTabs"/>
			</div>
			<div class="baseframe-body__rightlane">
				<div v-if="activeRightTabComp == -1" class="baseframe-body__rightlane--noagenttooling">{{ store.state.settings.interaction.noagenttooling }}</div>
				<TabContentWrapper :tabComponents="rightLaneComponents" :activeIndex="activeRightTabComp" />
			</div>
		</section>
		<ConfirmBox
			:status="showRecordingStateDialog"
			:header="headerDialog"
			:bodyContent="bodyContentDialog"
			:acceptLabel="acceptRecordCounter + acceptLabelDialog"
			:cancelLabel="cancelLabelDialog"
			@accepted="handleAccepted"
			@canceled="handleCanceled"
		/>
		<Chat-screen v-for="(chatWindowData, index) in chatData"
			:key		     = "index"
			:chatdata	     = "chatWindowData"
			:status		     = "chatWindowStatus[index]"
			:styleMe	     = "'z-index:' + chatWindowStackorder[index]"
			:chatwindowindex = "index"
			:canAnswer	     = "userCanChat"
			:dockCount	     = "chatDockCount"
			@isDragged	     = "reOrderChatWindows"
			@isDocked	     = "setDockList"
			@isClosed	     = "setWindowStatusProperty"
		/>
  	</div>
</template>

<script lang="ts">

const CHAT_WINDOW_START_ZINDEX = 9000;

const LEFT_NAV_TABS = [
	{
		label       : '',
		icon        : Cached,
		tabClass    : 'leftTabs',
		activeClass : 'leftTabs--active',
		datae2e     : 'active-lines-tab',
	}, {
		label       : '',
		icon        : Contacts,
		tabClass    : 'leftTabs',
		activeClass : 'leftTabs--active',
		datae2e     : 'address-book-tab',
	}, {
		label       : '',
		icon        : Dialpad,
		tabClass    : 'leftTabs',
		activeClass : 'leftTabs--active',
		datae2e     : 'dialer-tab',
	}, {
		label       : '',
		icon        : Inbox,
		tabClass    : 'leftTabs',
		activeClass : 'leftTabs--active',
		datae2e     : 'recording-player-tab',
	}
];

const LEFT_TAB_COMPONENTS = [
	{
		name        : 'ActiveLines',
		component   : ActiveLines,
		props       : {}
	}, {
		name        : 'AddressBook',
		component   : AddressBook,
		props       : {}
	}, {
		name        : 'Dialpad',
		component   : Dialer,
		props       : {}
	}, {
		name        : 'VoiceMailInbox',
		component   : VoiceMailInbox,
		props       : {}
	}
];

const LEFTTABCOMPINDEX = {
    ACTIVELINES : 0,
    ADDRESSBOOK : 1,
    DIALER : 2,
    VOICEMAILINBOX : 3
}

const RIGHT_NAV_TABS = [
	{
		icon          : Airballoon,
		tabClass      : 'rightTabs',
		activeClass   : 'rightTabs--active',
		datae2e       : 'case-management-tab',
		disabledClass : 'rightTabs--disabled',
		permission    : 'CM',
	}, {
		icon          : ViewGrid,
		tabClass      : 'rightTabs',
		activeClass   : 'rightTabs--active',
		datae2e       : 'cdc-tab',
		disabledClass : 'rightTabs--disabled',
		permission    : 'CDC',
	}, {
		icon          : Text,
		tabClass      : 'rightTabs',
		activeClass   : 'rightTabs--active',
		datae2e       : 'notes-tab',
		disabledClass : 'rightTabs--disabled',
		permission    : 'GespreksNotities',
	}, {
		icon          : Cloud,
		tabClass      : 'rightTabs',
		activeClass   : 'rightTabs--active',
		datae2e       : 'cloud-app-tab',
		disabledClass : 'rightTabs--disabled',
		permission    : 'CloudApp',
	}
	// }, {
	// 	icon          : AccountBoxOutline,
	// 	tabClass      : 'rightTabs',
	// 	activeClass   : 'rightTabs--active',
	// 	datae2e       : 'smart-id-tab',
	// 	disabledClass : 'rightTabs--disabled',
	// 	permission    : 'SmartId',
	// }
];

const RIGHT_TAB_COMPONENTS = [
	{
		name        : 'CaseManagement',
		component   : CaseManagement,
		props       : {}
	}, {
		name        : 'Cdc',
		component   : Cdc,
		props       : {}
	}, {
		name        : 'Notes',
		component   : Notes,
		props       : {}
	}, {
		name        : 'CloudApp',
		component   : CloudApp,
		props       : {}
	}
	// }, {
	// 	name        : 'SmartId',
	// 	component   : SmartId,
	// 	props       : {}
	// }
];

const BASE_COMPONENTS = [
	{
		name        : 'SmartIdBaseComp', //smartid
		component   : SmartIdBaseComp,
		props       : {}
	}, {
		name        : 'CallHistory', //smartid
		component   : CallHistory,
		props       : {}
	}, {
		name        : 'ContactDetail',
		component   : ContactDetail,
		props       : {}
	}, {
		name        : 'RecordingPlayer',
		component   : RecordingPlayer,
		props       : {}
	}
];

const BASECOMPINDEX = {
    SMARTID : 0,
    CALLHISTORY : 1,
    CONTACTDETAIL : 2,
    RECORDINGPLAYER : 3
}



import {
        defineComponent,
        provide,
		inject,
		ref,
		markRaw,
		watch,
		readonly,
		computed,
	}							from 'vue';

import { useStore }				from 'vuex';
import { useSetDevice }         from '../../use/setDeviceFunction';
import TabBarLeft				from './parts/TabBarLeft.vue';
import PhoneButtons				from './parts/PhoneButtons.vue';
import TabBarRight				from './parts/TabBarRight.vue';
import TabContentWrapper		from './../uielements/TabContentWrapper.vue';
import ChatScreen				from './parts/ChatScreen.vue';
import ActiveLines				from './parts/ActiveLines.vue';
import AddressBook				from './parts/Addressbook.vue';
import Dialer					from './parts/Dialer.vue';
import VoiceMailInbox			from './parts/VoiceMailInbox.vue';
import RecordingPlayer			from './parts/RecordingPlayer.vue';
import CallHistory				from './parts/CallHistory.vue';
import SmartIdBaseComp			from './parts/SmartIdBaseComp.vue';
import ContactDetail			from './parts/ContactDetail.vue';
// import SmartId					from './parts/SmartId.vue';
import CloudApp					from './parts/CloudApp.vue';
import CaseManagement			from './parts/CaseManagement.vue';
import Cdc						from './parts/Cdc.vue';
import Notes					from './parts/Notes.vue';
import ConfirmBox				from '../dialogs/Confirm-box.vue';
import { useLineinfoData }		from '../../use/lineinfoDataFunctions';
import { useVoicemailData }		from '../../use/voicemailDataFunctions';
import {
		Cached,
		Contacts,
		Dialpad,
		Inbox,
		Text,
		ViewGrid,
		Airballoon,
		Cloud,
		AccountBoxOutline,
        Phone,
        PhoneHangup,
        ArrowCollapseRight,
		}						from 'mdue';
import { IPCCCCallControl }		from '../../ipccc/js/callcontrol';
import { IPCCCInternalChat }	from '../../ipccc/js/internalchat';
import { IPCCCUserSettings }    from '../../ipccc/js/usersettings.js';

export default defineComponent({
	name: 'Interaction',
	components: {
        TabBarLeft,
        PhoneButtons,
        TabBarRight,
        TabContentWrapper,
        ConfirmBox,
        ChatScreen,
        Cached,
        Contacts,
        Dialpad,
        Inbox,
        Text,
        Cloud,
        AccountBoxOutline,
        Phone,
        PhoneHangup,
        ArrowCollapseRight
    },
	setup() {
		let leftLane:string                 = 'LO', //LC: LeftLaneClosed, LO: LeftLaneOpen, LM: LeftLaneMedium, LL: LeftLaneLarge
			rightLane:string                = 'RO', //RC: RightLaneClosed, RO: RightLaneOpen, RM: RightLaneMedium, RL: RightLaneLarge
			sipCall:object | any            = inject('sipCall');

		const store:object | any			= useStore(),
                setDeviceFn					= useSetDevice(),
				frameClass					= ref<string>(`baseframe baseframe--${leftLane}-${rightLane}`),
				leftTabs                  	= ref(markRaw(LEFT_NAV_TABS)),
				leftLaneComponents			= ref(markRaw(LEFT_TAB_COMPONENTS)),
				rightTabs					= ref(markRaw(RIGHT_NAV_TABS)),
				rightLaneComponents			= ref(markRaw(RIGHT_TAB_COMPONENTS)),
				baseComponents				= ref(markRaw(BASE_COMPONENTS)),
				activeLeftTabComp			= ref<number>(LEFTTABCOMPINDEX.ADDRESSBOOK),
				activeLeftTab				= ref<number>(1),
				activeBaseComp				= ref<number>(BASECOMPINDEX.SMARTID);

        //----------------------------------------------------------USERSETTINGS
        const setSettings = () => {
            let _filterSettings = {
                leftLane : leftLane,
                rightLane : rightLane
            };
            IPCCCUserSettings.Save('InteractionSettings', 'InteractionUserSettings', JSON.stringify(_filterSettings)).catch(_ => console.error('InteractionUserSettings not saved'));
        };

        const getSettings = () => {
            IPCCCUserSettings.Get('InteractionSettings')
            .then(result => {
                result.forEach(setting => {
                    if(setting.Name === 'InteractionUserSettings') {
                        let _data = JSON.parse(setting.Data);
                        if(_data.leftLane) {
                            leftLane = _data.leftLane;
                            rightLane = _data.rightLane;
                            frameClass.value  = `baseframe baseframe--${leftLane}-${rightLane}`;
                        }
                    } else {
                        //NO SETTINGS FOUND ALL DEFAULT;
                    }
                });
            })
            .catch(error => {
                console.error('Settings not loaded or not set ', error);
            });
        };

        getSettings();

		//------------------------------------------------------ HANDELING RIGHTTABS DISABLED /INIT NOTE-,CDC-COMP ---------------------------------------------//

		//disabled tabs are hidden with v-show, not disabled
		const getDisabledRightTabs = permission => {
			switch(permission) {
				case 'CM':
					return {'CM' : {'disabled' : !store.getters.getPermission('CaseManagement')}};
				case 'CDC':
					return {'CDC' : {'disabled' : !store.getters.contactReasonsAvailable()}};
				case 'GespreksNotities':
					return {'GespreksNotities' : {'disabled' : !store.getters.getPermission('GespreksNotities')}};
				case 'CloudApp':
					return {'CloudApp' : {'disabled' : false}}; //no permission needed, depends on whether pushUrl is sent.
				// case 'SmartId':
				// 	return {'disabled' : false}; //no permission needed
				default:
					return {'disabled' : true}; //no permission needed
			}
		};

		const disabledRightTabs = ref(rightTabs.value.map(element => getDisabledRightTabs(element.permission)));
		const getFirstTabToInit = () => {
			// if(store.getters.getPermission('CaseManagement')) return 0;
			if(store.getters.contactReasonsAvailable()) return 1;
			if(store.getters.getPermission('GespreksNotities')) return 2;
			return -1;
		}

		//Cdc inits and refers to Notes. (init watchers in these components)
		const activeRightTabComp = ref<number>(getFirstTabToInit());
		const activeRightTab = ref<Number>(activeRightTabComp.value);

		//------------------------------------------------------ HANDELING LINEINFO ---------------------------------------------//

		const {
			lineinfoList,
			requiredNote,
			lastInboundLineInfo,
			lineStatus,
			lineActive,
			addCall,
            addingSecondCall,
			isCallingVoicemail,
			supervisor,
			supervisorLbl,
			supervisorIdle,
			supervisorListens,
			supervisorCoaching,
			supervisorJoined
		} = useLineinfoData();

		provide('lineinfoList', readonly(lineinfoList));
		provide('lastInboundLineInfo', readonly(lastInboundLineInfo));
		provide('requiredNote', readonly(requiredNote));
		provide('lineStatus', readonly(lineStatus));
		provide('lineActive', readonly(lineActive));
		provide('addCall', readonly(addCall));
		provide('addingSecondCall', readonly(addingSecondCall));
		provide('isCallingVoicemail', readonly(isCallingVoicemail));
		provide('supervisor', readonly(supervisor));
		provide('supervisorLbl', readonly(supervisorLbl));
		provide('supervisorIdle', readonly(supervisorIdle));
		provide('supervisorListens', readonly(supervisorListens));
		provide('supervisorCoaching', readonly(supervisorCoaching));
		provide('supervisorJoined', readonly(supervisorJoined));

		//------------------------------------------------------ HANDELING FRAMECLASS ---------------------------------------------//

		const setFrame = (frame:String, direction:String):void => {
			switch(frame) {
                case 'L':
                    switch(direction) {
                        case 'R':
                            leftLane = leftLane === 'LC' ? 'LO' : leftLane === 'LO' ? 'LM' : 'LC';
                            if(leftLane === 'LM' && rightLane === 'RM')
                                rightLane = 'RO';
                            break;
                        case 'L':
                            leftLane = leftLane === 'LM' ? 'LO' : leftLane === 'LO' ? 'LC' : 'LM';
                            break;
                    }
                    break;
                case 'R':
                    switch(direction) {
                        case 'L':
                            rightLane = rightLane === 'RC' ? 'RO' : rightLane === 'RO' ? 'RM' : 'RC';
                            if(leftLane === 'LM' && rightLane === 'RM')
                                leftLane = 'LO';
                            break;
                        case 'R':
                            rightLane = rightLane === 'RM' ? 'RO' : rightLane === 'RO' ? 'RC' : 'RM';
                            break;
                    }
                    break;
			}
            if (frameClass.value == `baseframe baseframe--${leftLane}-${rightLane}`) {
                //donothing
            } else {
                //set usersettings
                frameClass.value  = `baseframe baseframe--${leftLane}-${rightLane}`;
                setSettings();
            }
		}

		provide('setFrame', setFrame);

        //Set the activeLeftTabComp to Open instead of Maximized or Closed
		watch(activeLeftTabComp, (newActiveTab, oldActiveTab) => {
			if(newActiveTab !== LEFTTABCOMPINDEX.ADDRESSBOOK && leftLane === 'LM') {
				setFrame('L', 'L');
            }
            if(leftLane === 'LC') {
                setFrame('L', 'R');
            }
		});

        //
        //Set the activeRightTabComp to Open instead of Maximized or Closed
        // watch(activeRightTabComp, (newActiveTab, oldActiveTab) => {
        //     if(rightLane === 'RC') {
        //         setFrame('R', 'L');
        //     }
		// });

		const getFrameClass = ():String => {
			return frameClass.value
		};

		provide('getFrameClass', getFrameClass);

		const setActiveBaseComponent = (index: number):void => {
            if (activeBaseComp.value !== index) {
			    activeBaseComp.value = index;
            }
            //23930
            if (index == BASECOMPINDEX.CONTACTDETAIL && leftLane == 'LM') {
                setFrame('L', 'L');
            }
            if (index == BASECOMPINDEX.CONTACTDETAIL && rightLane == 'RM') {
                setFrame('R', 'R');
            }
		};
		provide('setActiveBaseComponent', setActiveBaseComponent);

		const setActiveLeftTab = (index:number):void => {
			activeLeftTab.value = index;
			activeLeftTabComp.value = index;
			switch(index) {
                case LEFTTABCOMPINDEX.ACTIVELINES :
                    activeBaseComp.value = BASECOMPINDEX.SMARTID;
                    break
                case LEFTTABCOMPINDEX.ADDRESSBOOK:
                    if(store.getters.getSelectedContact()) {
                        activeBaseComp.value = BASECOMPINDEX.CONTACTDETAIL;
                    } else {
                        activeBaseComp.value = BASECOMPINDEX.SMARTID;
                    }
                    break
                case LEFTTABCOMPINDEX.DIALER :
                    activeBaseComp.value = BASECOMPINDEX.SMARTID;
                    break
                case LEFTTABCOMPINDEX.VOICEMAILINBOX :
                    if(hasRecordingObj.value) {
                        activeBaseComp.value = BASECOMPINDEX.RECORDINGPLAYER;
                    } else {
                        activeBaseComp.value = BASECOMPINDEX.SMARTID;
                    }
                    break
                }
		};

		provide('setActiveLeftTab', setActiveLeftTab)

		const setActiveRightTab = (index:number):void => {
			activeRightTab.value = index;
			activeRightTabComp.value = index;
            if(rightLane === 'RC') {
                setFrame('R', 'L');
            }
		};

		provide('setActiveRightTab', setActiveRightTab);

		//------------------------------------------------------ HANDELING PHONE CALLS ---------------------------------------------//

		const callOut = (nr, contactid = -1):void => {
			IPCCCCallControl.Call(nr, contactid)
			.then(() => {
				if(!isCallingVoicemail.value) setActiveLeftTab(LEFTTABCOMPINDEX.ACTIVELINES);
				// store.commit('SET_AGENTCONTROLS', true);
			})
			.catch(error => {
				console.error(error.Message);
                if (store.getters.getHasWebPhone() && error.Message == "Uw telefoontoestel is geblokkeerd") {
                    setDeviceFn.handleWebRTCErrorState();
                }
			});
		};

		provide('callOut', callOut);

		const sendDTMFKey = (key):void => {
			sipCall.value.sendDtmf(key);
		};

		provide('sendDTMFKey', sendDTMFKey);

		//------------------------------------------------------ HANDELING RECORDING ---------------------------------------------//

		const 	phonebuttons                = ref(null),
				showRecordingStateDialog 	= ref(false),
				acceptRecordCounter			= ref('[3]'),
				headerDialog                = store.state.settings.agentPanel.dialogtorecordheader,
				bodyContentDialog           = '<p>' + store.state.settings.agentPanel.dialogtorecordbody + '<br>' + '<p>',
				acceptLabelDialog           = store.state.settings.agentPanel.dialogtorecordbtns[0],
				cancelLabelDialog           = store.state.settings.agentPanel.dialogtorecordbtns[1];

		const setRecordingDialogState = state => {
			showRecordingStateDialog.value = state;
		}

		provide('setRecordingDialogState', setRecordingDialogState);

		const setAcceptRecordCounter = state => {
			if(state == 0) acceptRecordCounter.value = '';
			else acceptRecordCounter.value = '[' + state + ']';
		}

		provide('setAcceptRecordCounter', setAcceptRecordCounter);

		const handleAccepted = () => {
			phonebuttons.value.setRecordingToConsent();
		}

		const handleCanceled = () => {
			phonebuttons.value.setRecordingToNoPermission();
		}

		//------------------------------------------------------ HANDELING INBOX ---------------------------------------------//

		const {
			groupedByDayRecordingList,
			selectedRecording,
            unreadVoicemailCounter
		} = useVoicemailData(),
        hasRecordingObj = computed(() => Object.keys(selectedRecording.value).length > 0);

        // //When voicemail inbox is clicked change to recordingplayer
        // watch(() => hasRecordingObj.value, (newVal, oldVal) => {
        //     if (newVal && activeBaseComp.value !== BASECOMPINDEX.RECORDINGPLAYER) {
        //         setActiveBaseComponent(BASECOMPINDEX.RECORDINGPLAYER);
        //     }
        // })

		provide('groupedByDayRecordingList', readonly(groupedByDayRecordingList));
		provide('selectedRecording', readonly(selectedRecording));
		provide('unreadVoicemailCounter', readonly(unreadVoicemailCounter));

		//----------------------------------------------------- HANDLING CHAT ------------------------------------------//

		const	chatData = ref([]),
				chatWindowStatus = ref([]),
				chatWindowStackorder = ref([]),
				chatDockCount = ref(0),
				userCanChat = store.getters.getPermission('InterneChat'),
				myUserId    = store.state.loginSession.Details.UserId;

		const getNextZindex = () => {
			let _zIndex = CHAT_WINDOW_START_ZINDEX;

			if(chatWindowStackorder.value.length > 0)
			_zIndex = Math.max(...chatWindowStackorder.value) + 1;

			return _zIndex
		}

		const InternalChat = data => {
			let _index  = -1,
				_chatId = (data.SenderUserId == myUserId) ? data.RecipientUserId : data.SenderUserId;

                chatData.value.forEach((chat, index) => {
					if(chat.SenderUserId == _chatId || chat.RecipientUserId == _chatId)	_index = index;
				});

			if(_index == -1) {
				chatData.value.push(data);
				chatWindowStatus.value.push(true);
				chatWindowStackorder.value.push(getNextZindex());
			} else {
				chatWindowStatus.value[_index] = true;
				chatData.value[_index] = data;
			}
		}

		IPCCCInternalChat.Received.addHandler(InternalChat);

		const reOrderChatWindows = index => {
			if(chatWindowStackorder.value.length > 1) {
				let _topZIndex         = Math.max(...chatWindowStackorder.value),
					_currentMaxIndex   = chatWindowStackorder.value.indexOf(_topZIndex),
					_currentZIndex     = chatWindowStackorder.value[index];

				chatWindowStackorder[_currentMaxIndex] = _currentZIndex;
				chatWindowStackorder.value[index] = _topZIndex;
			} else {
				chatWindowStackorder.value[index] = CHAT_WINDOW_START_ZINDEX;
			}
      	}

		const setDockList = status => {
			if(status)
				chatDockCount.value++;
			else
				chatDockCount.value--;

			if(chatDockCount.value < 0)
				chatDockCount.value = 0;
      	}

      	const setWindowStatusProperty = index => {
        	chatWindowStatus.value[index] = false;
      	}

		const startChat = toUid => {
			let _data = {
				Message          : '',
				MessageType      : 1,
				MessageVersion   : 1,
				CustomerId       : store.state.loginSession.Details.CustomerId,
				RecipientUserId  : store.state.loginSession.Details.UserId,
				RecipientGroupId : -1,
				SenderUserId     : toUid,
				Id               : -1
			};
			//CHECK IF THERE IS A SESSION
			let _index  = -1;

			chatData.value.forEach((chat, index) => {
                if(chat.SenderUserId == toUid || chat.RecipientUserId == toUid) _index = index;
            });

			if(_index == -1) {
				chatData.value.push(_data);
				chatWindowStatus.value.push(true);
				chatWindowStackorder.value.push(getNextZindex());
			} else {
				chatWindowStatus.value[_index] = true;
				chatData.value[Math.max(...chatData.value)] = _data;
			}
      	}

		store.watch(store.getters.getChatNewWindowUserId, uId => {
			if(uId != -1) {
				let _index = -1;

				chatData.value.forEach((chat, index) => {
					if(chat.SenderUserId == uId) _index = index;
				});

				if (_index != -1) {
					chatWindowStatus.value[_index] = true;
					reOrderChatWindows(_index);
				} else {
					startChat(uId);
				}
			}
        });


		//----------------------------------------------------- END HANDLING CHAT ------------------------------------------//

		return {
			store,
			setFrame, frameClass,
			leftTabs,  activeLeftTabComp, activeLeftTab, setActiveLeftTab, leftLaneComponents,
			rightTabs, activeRightTabComp, activeRightTab,
			disabledRightTabs,
			rightLaneComponents,
			baseComponents, activeBaseComp,
			chatData, chatWindowStatus, chatWindowStackorder, userCanChat, chatDockCount,
			showRecordingStateDialog, acceptRecordCounter,
			reOrderChatWindows, setDockList, setWindowStatusProperty,
			headerDialog, bodyContentDialog, acceptLabelDialog, cancelLabelDialog,
			handleAccepted, handleCanceled, phonebuttons,
		}

	}
});

</script>

<style lang="scss" scoped>

@use "@/scss/includes/font";
@use "@/scss/includes/globals";
@use "@/scss/includes/functions";

.baseframe {
    header div,
    section div {
      overflow: hidden;
    }
}

.appgrid-interaction-wrapper--active {
    background-color: globals.$color-white;
}

.baseframe-body__lefttabs,
.baseframe-body__leftlane,
.baseframe-body__content,
.baseframe-body__righttabs,
.baseframe-body__rightlane {
    transition: max-width .2s ease-in-out,
                min-width .2s ease-in-out,
                width .2s ease-in-out;
}


.baseframe-body {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: stretch;
    .baseframe-body__lefttabs {
        background-color: globals.$color-gray5;
        position: relative;
        width: 60px;
        border-right: 1px solid globals.$color-gray10;
    }
    .baseframe-body__righttabs {
        background-color: globals.$color-gray5;
        position: relative;
        width: 60px;
        border-left: 1px solid globals.$color-gray10;
    }
    .baseframe-body__leftlane {
		position: relative;
		border-right: 1px solid globals.$color-gray10;
		background-color: globals.$color-white;
		width: 356px;
		min-width: 356px;
		max-width: 356px;
    }
    .baseframe-body__content {
		position: relative;
		width: calc(100% - (356px + 459px + 60px + 60px));
		min-width: calc(100% - (356px + 459px + 60px + 60px));
		max-width: calc(100% - (356px + 459px + 60px + 60px));
    }
    .baseframe-body__rightlane {
		border-left: 1px solid globals.$color-gray20;
		background-color: globals.$color-white;
		position: relative;
		width: 459px;
		min-width: 459px;
		max-width: 459px;
		&--noagenttooling {
			position: absolute;
			top: 131px;
			width: 100%;
			color: globals.$color-gray20;
			font-size: .8rem;
			text-align: center;
		}
    }
}

.baseframe--LO-RO .baseframe-body { //LEFTLANE OPEN RIGHTLANE OPEN
    .baseframe-body__leftlane {
      width: 356px;
      min-width: 356px;
      max-width: 356px;
    }
    .baseframe-body__content {
      width: calc(100% - (356px + 459px + 60px + 60px));
      min-width: calc(100% - (356px + 459px + 60px + 60px));
      max-width: calc(100% - (356px + 459px + 60px + 60px));
    }
    .baseframe-body__rightlane {
      width: 459px;
      min-width: 459px;
      max-width: 459px;
    }
}

.baseframe--LO-RC .baseframe-body { //LEFTLANE OPEN RIGHTLANE CLOSED
    .baseframe-body__leftlane {
      width: 356px;
      min-width: 356px;
      max-width: 356px;
    }
    .baseframe-body__content {
      width: calc(100% - 356px - 60px - 60px);
      min-width: calc(100% - 356px - 60px - 60px);
      max-width: calc(100% - 356px - 60px - 60px);
    }
    .baseframe-body__rightlane {
      width: 0;
      min-width: 0;
      max-width: 0;
    }
}

.baseframe--LO-RM .baseframe-body { //LEFTLANE OPEN RIGHTLANE MAXIMIZED
    .baseframe-body__leftlane {
      width: 356px;
      min-width: 356px;
      max-width: 356px;
    }
    .baseframe-body__rightlane {
      width: calc(100% - 356px - 60px - 60px);
      min-width: calc(100% - 356px - 60px - 60px);
      max-width: calc(100% - 356px - 60px - 60px);
    }
    .baseframe-body__content {
      width: 0;
      min-width: 0;
      max-width: 0;
    }
  }

.baseframe--LC-RO .baseframe-body { //LEFTLANE CLOSED RIGHTLANE OPEN
    .baseframe-body__leftlane {
      width: 0;
      min-width: 0;
      max-width: 0;
    }
    .baseframe-body__content {
      width: calc(100% - (60px + 60px + 459px));
      min-width: calc(100% - (60px + 60px + 459px));
      max-width: calc(100% - (60px + 60px + 459px));
    }
    .baseframe-body__rightlane {
      width: 459px;
      min-width: 459px;
      max-width: 459px;
    }
}

.baseframe--LC-RC .baseframe-body { //LEFTLANE CLOSED RIGHTLANE CLOSED
    .baseframe-body__leftlane {
      width: 0;
      min-width: 0;
      max-width: 0;
    }
    .baseframe-body__content {
      width: calc(100% - 60px - 60px);
      min-width: calc(100% - 60px - 60px);
      max-width: calc(100% - 60px - 60px);
    }
    .baseframe-body__rightlane {
      width: 0;
      min-width: 0;
      max-width: 0;
    }
}

.baseframe--LC-RM .baseframe-body { //LEFTLANE CLOSED RIGHTLANE MAXIMIZED
    .baseframe-body__leftlane {
      width: 0;
      min-width: 0;
      max-width: 0;
    }
    .baseframe-body__rightlane {
      width: calc(100% - 60px - 60px);
      min-width: calc(100% - 60px - 60px);
      max-width: calc(100% - 60px - 60px);
    }
    .baseframe-body__content {
      width: 0;
      min-width: 0;
      max-width: 0;
    }
}

.baseframe--LM-RO .baseframe-body { //LEFTLANE MAXIMIZED RIGHTLANE OPEN
    .baseframe-body__leftlane {
      width: calc(100% - 459px - 60px - 60px);
      min-width: calc(100% - 459px - 60px - 60px);
      max-width: calc(100% - 459px - 60px - 60px);
    }
    .baseframe-body__content {
      width: 0;
      min-width: 0;
      max-width: 0;
    }
    .baseframe-body__rightlane {
      width: 459px;
      min-width: 459px;
      max-width: 459px;
    }
}

.baseframe--LM-RC .baseframe-body { //LEFTLANE MAX RIGHTLANE CLOSED
    .baseframe-body__leftlane {
      width: calc(100% - 60px - 60px);
      min-width: calc(100% - 60px - 60px);
      max-width: calc(100% - 60px - 60px);
    }
    .baseframe-body__content {
      width: 0;
      min-width: 0;
      max-width: 0;
    }
    .baseframe-body__rightlane {
      width: 0;
      min-width: 0;
      max-width: 0;
    }
}

</style>

<style lang="scss">
@use "@/scss/includes/globals";
@use "@/scss/includes/functions";

.baseframe-body__leftlane--whitespace-for-filters .content-wrapper {
    top: 60px;
}

.leftTabs, .rightTabs,
.minimized-phonebuttons-btn,
.minimized-phonebuttons-btn-hangup,
.minimized-phonebuttons-btn-pickup {
    position: relative;
    width: 60px;
    height: 60px;
    background-color: globals.$color-gray5;
    color: globals.$color-gray20;
    border-width: 0 0 1px 0;
    border-style: solid;
    border-color: globals.$color-gray20;
    cursor: pointer;
    svg {
      width: 45%;
      height: 45%;
      margin: 50% 50%;
      transform: translate(-50%, -50%);
    }
    & svg {
      transform: rotate(0deg);
      position: absolute;
      top: -12px;
      left: -12px;
    }
	&:hover {
		background-color: globals.$color-white;
		svg {
			fill: globals.$color-interaction;
		}
	}
    &--active {
      background-color: globals.$color-white;
      svg {
        fill: globals.$color-interaction;
      }
    }
    &--disabled {
      pointer-events: none;
      svg {
        fill: globals.$color-gray10;
      }
    }
    .js-rotating {
      animation: rotate 2.5s linear infinite;
    }
}

.minimized-phonebuttons-btn {
    background-color: globals.$color-sonicsilver;
    color: globals.$color-interaction;
    &:hover {
        background-color: functions.shade(globals.$color-sonicsilver, 20%);
    }
}

.minimized-phonebuttons-btn-pickup {
    background-color: globals.$color-green;
    color: globals.$color-white;
    &:hover {
        background-color: functions.shade(globals.$color-green, 20%);
    }
}

.minimized-phonebuttons-btn-hangup {
    background-color: globals.$color-unavailable;
    color: globals.$color-white;
    &:hover {
        background-color: functions.shade(globals.$color-unavailable, 20%);
    }
}

.rightTabs {
	border-width: 0 0 1px 0;
    border-color: globals.$color-gray20;
}

@keyframes rotate {
    to {
      transform: rotate(-360deg);
    }
}

</style>