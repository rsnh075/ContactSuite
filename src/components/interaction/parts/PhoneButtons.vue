<script lang="ts">
export default {
    inheritAttrs: false,
    customOptions: {
        name: "PhoneButtons"
    },
}
</script>
<script setup lang="ts">

/**
 *
 * @note
 * IsRecordingVisible = true; recording is available
 * IsRecording = true recording is running
 * setRecordingToConsent() start recording by passing: RecordingConsent + StartRecording
 * setRecordingToNoPermission() prevent recording by passing: RecordingConsent + StartRecording
 *
 * @todo
 *
 */


import { onMounted, ref, reactive, inject, watch, computed, watchEffect } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import {
    Microphone,
    MicrophoneOff,
    Pause,
    ShuffleVariant,
    CallMerge,
    Redo,
    PhoneHangup,
    Phone,
    UndoVariant,
    Record,
    ArrowCollapseLeft,
    AccountClock,
} from "mdue";
import { IPCCCCallControl } from "../../../ipccc/js/callcontrol";
import { IPCCCCommand } from "../../../ipccc/js/command";
import { IPCCCUserSettings } from "../../../ipccc/js/usersettings";
import { NvpContact } from '../../../types/NvpContact';
import { PutInLobbyData } from "../../../types/lobby";
import { currentLocalDateTimeISO }  from '../../../use/dateFunctions';
import { Logging } from "../../../ipccc/lib/logging";

const store: object | any = useStore(),
    router = useRouter(),
    lineinfoList = inject('lineinfoList'),
    lineStatus = inject('lineStatus'),
    activeline = computed(() => lineStatus.value.findIndex(item => item == true)),
    activeLinedata = computed(() => activeline.value !== -1 ? lineinfoList.value[activeline.value] : null),
    activeNvpData = computed(() => activeLinedata.value?.nvpData),
    enablePickUp = ref<boolean>(false),
    hasWebPhone = ref<boolean>(false),
    currentSelDevice = computed(() => store.getters.getCurrentSelDevice()),
    initializePickupButton = computed(() => store.getters.getInitializePickupButton()),
    onInteractionTab = computed(() => store.state.navigation.interactionStatus),
    hasActiveLine = computed(() => store.state.navigation.hasActiveLine);

const activeContactData = ref<NvpContact>(null);
watchEffect(() => {
    activeContactData.value = activeNvpData.value?.reduce((acc, el) => {
        if(el.Name == '!CONTACT') {
            let _contact = {};
            el.Tuples.forEach(tuple => {
                _contact[tuple.Name] = tuple.Value;
            });
            acc = _contact;
        }
        return acc;
    }, {});
});
const hasActiveContactData = computed(() => activeContactData.value && activeLinedata.value && !activeLinedata.value.isOutbound ? Object.entries(activeContactData.value).length > 0 : false);

const showMicrophone = computed(
    () =>
        onInteractionTab.value ||
        hasActiveLine ||
        store.state.commands.Mute ||
        store.state.commands.UnMute
);

const showPause = computed(
    () =>
        onInteractionTab.value ||
        hasActiveLine ||
        store.state.commands.Hold ||
        store.state.commands.UnHold
);

const lineActive = ref<boolean>(inject('lineActive'));

const showHangup = computed(
    () => onInteractionTab.value || hasActiveLine || (hasWebPhone.value && enablePickUp.value)
);

const showPickup = computed(
    () => onInteractionTab.value || hasActiveLine || (hasWebPhone.value && enablePickUp.value)
);

const showFloatingButtons = computed(
    () =>
        (
            !onInteractionTab.value &&
            (
            showPickup.value ||
            showMicrophone.value ||
            showPause.value
            ) &&
            lineActive.value //causes problem for coaching but is fix for hiding when no call. Better solution to be found...
        ) ||
        (
            !onInteractionTab.value &&
            store.state.commands.Hangup
        ) ||
        (
            !onInteractionTab.value &&
            enablePickUp.value
        )
);

let sipCall: object | any = inject("sipCall");

let isMoving = false;

const   defaultInteractionStyle = "left: calc(50% - 340px); bottom: 20%",
        interactionstyle = ref(defaultInteractionStyle),
        dockPhonebuttons = ref(false);

const phoneButtonsAreMinimized = computed(
    () => onInteractionTab.value && dockPhonebuttons.value
);

const enableDockedPickUp = computed(
    () => enablePickUp.value && dockPhonebuttons.value
);

const enableDockedHangup = computed(
    () => showHangup.value && store.state.commands.Hangup
);

const dockThePhoneButtons = () => {
    dockPhonebuttons.value = true;
    setDockSettings();
}

const undocThePhoneButtons = () => {
    dockPhonebuttons.value = false;
    setDockSettings();
}

const movePhoneButtons = (e: MouseEvent) => {
    interactionstyle.value = `left: ${e.clientX - 100}px; top: ${e.clientY - 30}px`;
};

const checkEmpty = (str:string) => {
    if(str) {
        str = str.trim();
        return (str == '') ? '-' : str;
    }
    else {
        return '-';
    }
}

const mousedown = (e: MouseEvent) => {
    isMoving = true;
};

const mousemove = (e: MouseEvent) => {
    document.body.style.userSelect = 'initial';
    if (!isMoving) return;
    document.body.style.userSelect = 'none';
    movePhoneButtons(e);
};

const mouseup = (e: MouseEvent) => {
    if (e.clientY < 20 || (e.clientY > window.innerHeight) || e.clientX < 0 || e.clientX > window.innerWidth) {
        interactionstyle.value = defaultInteractionStyle;
    }
    if (isMoving) setSettings(e.clientX, e.clientY);
    isMoving = false;
};

store.watch(store.getters.getWindowSize, screenSize => {
    interactionstyle.value = defaultInteractionStyle;
})

//---------------------------------------------------------- START USERSETTINGS
const USERSETTINGS = {
    clientX : 0,
    clientY : 0,
    dockPhonebuttons: dockPhonebuttons.value
}

const setDockSettings = () => {
    USERSETTINGS.dockPhonebuttons = dockPhonebuttons.value;
    IPCCCUserSettings.Save('PhoneButtonsSettings', 'PhoneButtonsUserSettings', JSON.stringify(USERSETTINGS))
    .catch(_ => console.error('PhoneButtonsUserSettings not saved'));
};

const setSettings = (x, y) => {
    USERSETTINGS.clientX = x;
    USERSETTINGS.clientY = y;
    IPCCCUserSettings.Save('PhoneButtonsSettings', 'PhoneButtonsUserSettings', JSON.stringify(USERSETTINGS))
    .catch(_ => console.error('PhoneButtonsUserSettings not saved'));
};

const getSettings = () => {
    IPCCCUserSettings.Get('PhoneButtonsSettings')
    .then(result => {
        result.forEach(setting => {
            if(setting.Name === 'PhoneButtonsUserSettings') {
                let _data = JSON.parse(setting.Data);
                if ( _data.clientX && _data.clientY && _data.clientY < 20 || _data.clientY > window.innerHeight || _data.clientX < 0 || _data.clientX > window.innerWidth) {
                    interactionstyle.value = defaultInteractionStyle;
                } else if ( _data.clientX && _data.clientY ) {
                    interactionstyle.value = `left: ${_data.clientX - 100}px; top: ${_data.clientY - 30}px`;
                    USERSETTINGS.clientX = _data.clientX;
                    USERSETTINGS.clientY = _data.clientY;
                } else {
                    interactionstyle.value = defaultInteractionStyle;
                }
                if (_data.dockPhonebuttons) {
                    dockPhonebuttons.value = _data.dockPhonebuttons;
                    USERSETTINGS.dockPhonebuttons = _data.dockPhonebuttons;
                }
            }
        });
    })
    .catch(error => {
        console.error('Settings not loaded or not set ', error);
    });
};

getSettings();
//----------------------------------------------------------END USERSETTINGS

const mutePhone = (): void => {
    if (store.state.commands.Mute) {
        IPCCCCallControl.Mute().then().catch(e => console.error(e));
    } else {
        IPCCCCallControl.Unmute().then().catch(e => console.error(e));
    }
};

const pausePhone = (): void => {
    if(store.state.commands.Hold) {
        IPCCCCallControl.Hold().then().catch(e => console.error(e));
    } else {
        IPCCCCallControl.Unhold().then().catch(e => console.error(e));
    }
};

const switchLine = (evt: Event): void => {
    IPCCCCallControl.CallWait();
};

const maximize = (): void => {
    store.state.navigation.requestNavigation = '/interaction/';
};

const mergeLines = (): void => {
    IPCCCCallControl.Join();
};

const transferLine = (): void => {
    IPCCCCallControl.Transfer();
};

const showLobby = ref<boolean>(false);
const showLobbyVisible = computed<boolean>(() => showLobby.value && store.state.commands.Lobby);
watch(() => showLobbyVisible.value, newVal => {
    if (!newVal) showLobby.value = false;
});
const toggleLobbyPanel = (): void => {
    showLobby.value = !showLobby.value;
};

const lobbyNote = ref<PutInLobbyData>(new PutInLobbyData(""));
const sendToLobby = (): void => {
    IPCCCCommand.Request("putinlobby", lobbyNote.value)
    .then(() => {
        lobbyNote.value = new PutInLobbyData("");
    })
    .catch((error) => {
        console.error("Error: ", error);
    });
};

const pickUpActiveCall = (): void => {
    if (hasWebPhone.value) sipCall.value.pickUpIncommingCall(true);
};

const hangUpActiveLine = (): void => {
    IPCCCCallControl.Hangup()
    .then(() => {
        if(hasWebPhone.value) sipCall.value.handleIncommingCall(false);
    })
    .catch(error => {
        console.error(error.Message);
    });
};

const setRecordingDialogState: Function = inject("setRecordingDialogState");

const openRecordingMessage = () => {
    if (store.state.commands.IsRecording) return;
    startBtnConfirmTimer();
};

const acceptCounter = ref(3);
const setAcceptRecordCounter: Function = inject("setAcceptRecordCounter");

const startBtnConfirmTimer = () => {
    acceptCounter.value = 3;
    setRecordingDialogState(true);
    const timer = setInterval(() => {
        setAcceptRecordCounter(acceptCounter.value);
        acceptCounter.value -= 1;
        if (acceptCounter.value < 0) clearTimeout(timer);
    }, 1000);
};

const recordingState = reactive({
    RecordingConsent: false,
    StartRecording: false,
});

const setRecordingToConsent = () => {
    if (acceptCounter.value > 0) return;

    recordingState.RecordingConsent = true;
    recordingState.StartRecording = true;
    setRecordingDialogState(false);
    sendRecordingState();
};

const setRecordingToNoPermission = () => {
    if (acceptCounter.value > 0) return;

    recordingState.RecordingConsent = false;
    recordingState.StartRecording = false;
    setRecordingDialogState(false);
    sendRecordingState();
};

const sendRecordingState = () => {
    IPCCCCommand.Request("record", recordingState)
    .catch((error) => {
        console.error("Error: ", error);
    });
};

const activatePickUpButton = () => {
    store.commit('SET_INITIALIZE_PICKUPBUTTON', false);
    if (sipCall.value && hasWebPhone.value) {
        sipCall.value.on("message", (message) => {
            if (message._plainMessage.plugindata) {
                let _result = message._plainMessage.plugindata.data.result;
                enablePickUp.value =
                    _result.event == "incomingcall" ||
                    (_result.event == "registered" && enablePickUp.value);
                store.commit("SET_RINGING", enablePickUp.value);
            }
        });
    }
};

store.watch(store.getters.getPickupActiveCall, state => {
    if (state) {
        // console.log('pickUpActiveCall');
        pickUpActiveCall()
        //reset signal
        store.commit('PICKUP_ACTIVE_CALL', false);
    }
});

store.watch(store.getters.getHangupActiveCall, state => {
    if (state) {
        // console.log('hangupActiveCall');
        hangUpActiveLine();
        //reset signal
        store.commit('HANGUP_ACTIVE_CALL', false);
    }
});

watch(enablePickUp, state => {
    store.commit('WEBRTC_IS_RINGING', state);
    Logging.WriteAlways(`[${currentLocalDateTimeISO()}] enablePickUp: ${state ? 'Y' : 'N'}, showPickup: ${showPickup.value ? 'Y' : 'N'}`);
});

watch(initializePickupButton, (newStatus, oldStatus) => {
	if(newStatus) {
        activatePickUpButton();
    }
});

watch(currentSelDevice, (newDevice, oldeDevice) => {
    hasWebPhone.value = newDevice.MACAddress.toUpperCase().startsWith("WEBRTC");
    store.commit("SET_HAS_WEBPHONE", hasWebPhone.value);
    activatePickUpButton();
},{immediate:true});

onMounted(() => {
    hasWebPhone.value = Object.keys(store.getters.getCurrentSelWebRTCDevice()).length > 0;
    store.commit("SET_HAS_WEBPHONE", hasWebPhone.value);
    activatePickUpButton();
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);
});

defineExpose({
    setRecordingToConsent,
    setRecordingToNoPermission,
    undocThePhoneButtons,
    dockPhonebuttons,
    enableDockedPickUp,
    pickUpActiveCall,
    hangUpActiveLine,
    enableDockedHangup,
});

</script>

<template>
    <teleport to="#phonebuttons">
        <div
            :style="interactionstyle"
            class="button-wrapper"
            :class="[{'button-wrapper--lobby-open' : showLobbyVisible}]"
            v-show="((onInteractionTab || showFloatingButtons) && !phoneButtonsAreMinimized)"
            data-e2e="phone-buttons"
        >
            <div class="interaction-drawhandle" @mousedown="mousedown">
                <div v-if="activeline !== -1" class="interaction-drawhandle__content">
                    <span v-if="hasActiveContactData && activeContactData.Fullname.length > 0" class="activeline-number" data-e2e="phone-buttons-dnis">{{ checkEmpty(activeContactData.Fullname) }}</span>
                    <span v-else-if="activeLinedata?.isOutbound" class="activeline-number" data-e2e="phone-buttons-dnis">{{ checkEmpty(activeLinedata?.dnis) }}</span>
                    <span v-else class="activeline-number" data-e2e="phone-buttons-number">{{ checkEmpty(activeLinedata?.number) }}</span>
                    <span v-if="hasActiveContactData && activeContactData.Company.length > 0" class="activeline-name" data-e2e="phone-buttons-activeline-name">{{ checkEmpty(activeContactData.Company) }}</span>
                    <span v-else class="activeline-name" data-e2e="phone-buttons-activeline-name">{{ checkEmpty(activeLinedata?.name) }}</span>
                </div>
            </div>
            <button
                data-e2e="btn-mute"
                v-show="showMicrophone"
                type="button"
                class="button-btn__mute"
                :disabled="
                    !store.state.commands.Mute && !store.state.commands.UnMute
                "
                @click="mutePhone"
                :data-label="store.state.settings.agentPanel.mutelabel"
            >
                <Microphone
                    v-show="store.state.commands.Mute || (!store.state.commands.Mute && !store.state.commands.UnMute)"
                    class="button-icon"
                />
                <MicrophoneOff
                    v-show="store.state.commands.UnMute"
                    class="button-icon muted"
                />
                {{store.state.commands.UnMute ? 'active' : 'not-active'}}
            </button>
            <button
                data-e2e="btn-pause"
                v-show="showPause"
                type="button"
                class="button-btn__pause"
                :disabled="
                    !store.state.commands.Hold && !store.state.commands.UnHold
                "
                @click="pausePhone"
                :data-label="store.state.settings.agentPanel.holdlabel"
            >
                <Pause :class="['button-icon', {'held': store.state.commands.UnHold }]" />
                {{store.state.commands.UnHold ? 'active' : 'not-active'}}
            </button>
            <span v-show="onInteractionTab || showFloatingButtons" class="button-span-wrapper">
                <button
                    data-e2e="btn-switch"
                    type="button"
                    class="button-btn__switch"
                    :disabled="!store.state.commands.Wissel"
                    @click="switchLine"
                    :data-label="store.state.settings.agentPanel.switchlabel"
                >
                    <ShuffleVariant class="button-icon" />
                </button>
                <button
                    data-e2e="btn-merge"
                    type="button"
                    class="button-btn__merge"
                    :disabled="!store.state.commands.Join"
                    @click="mergeLines"
                    :data-label="store.state.settings.agentPanel.joinlabel"
                >
                    <CallMerge class="button-icon" />
                </button>
                <button
                    data-e2e="btn-transfer"
                    type="button"
                    class="button-btn__transfer"
                    :disabled="!store.state.commands.Transfer"
                    @click="transferLine"
                    :data-label="store.state.settings.agentPanel.transferlabel"
                >
                    <Redo class="button-icon" />
                </button>
                <button
                    data-e2e="btn-lobby"
                    type="button"
                    class="button-btn__lobby"
                    :disabled="!store.state.commands.Lobby"
                    @click="toggleLobbyPanel"
                    :data-label="store.state.settings.agentPanel.lobbylabel"
                >
                    <AccountClock class="button-icon" />
                </button>
                <button
                    v-if="store.getters.getPermission('GesprekOpnemen')"
                    data-e2e="btn-recording"
                    type="button"
                    :class="[
                        'button-btn__recording',
                        {
                            'button-btn__recording--active':
                                store.state.commands.IsRecording,
                        },
                    ]"
                    :disabled="!store.state.commands.IsRecordingVisible"
                    @click="openRecordingMessage"
                    :data-label="store.state.settings.agentPanel.recordinglabel"
                >
                    <Record class="button-icon" />
                    {{store.state.commands.IsRecording ? 'active' : 'not-active'}}
                </button>
            </span>
            <button
                v-show="showHangup"
                data-e2e="btn-earpiece"
                type="button"
                class="button-btn__earpiece"
                :disabled="!store.state.commands.Hangup"
                @click="hangUpActiveLine()"
            >
                <PhoneHangup class="button-icon" />
            </button>
            <button
                v-if="hasWebPhone"
                v-show="showPickup"
                data-e2e="btn-pickup"
                type="button"
                class="button-btn__pickup"
                :disabled="!enablePickUp"
                @click="pickUpActiveCall()"
            >
                <Phone class="button-icon" />
            </button>
            <button
                data-e2e="btn-back"
                v-show="!onInteractionTab"
                type="button"
                class="button-btn__back"
                @click="maximize"
                :data-label="store.state.settings.agentPanel.backlabel"
            >
                <UndoVariant class="button-icon" />
            </button>
            <button
                data-e2e="btn-minimise"
                v-show="onInteractionTab"
                type="button"
                class="button-btn__back"
                @click="dockThePhoneButtons"
                :data-label="store.state.settings.agentPanel.minimiselabel"
            >
                <ArrowCollapseLeft class="button-icon" />
            </button>
            <div v-if="showLobbyVisible" class="button-wrapper__lobbypanel">
                <input @keyup.enter="sendToLobby()" data-e2e="lobbynote-input" type="text" v-model="lobbyNote.Note" :placeholder="store.state.settings.agentPanel.lobbynoteplaceholder">
                <button type="button" class="button-primary" @click="sendToLobby" data-e2e="lobbynote-input-send-btn">
                    {{ store.state.settings.agentPanel.savelobbynotelabel }}
                </button>
            </div>
        </div>
    </teleport>
</template>

<style lang="scss" scoped>
@use "@/scss/includes/font";
@use "@/scss/includes/globals";
@use "@/scss/includes/functions";

.button-wrapper button {
    font-size: 0;
}
.interaction-drawhandle {
    width: 200px;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    height: 60px;
    line-height: 1.2rem;
    padding: 0 20px;
    background-color: globals.$color-sonicsilver;
    border-right: 3px solid globals.$color-gray80;
    cursor: move;
    &__content {
        display: flex;
        flex-direction: column;
        .activeline-number {
            @include font.font-medium();
            font-size: 0.9em;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            color: globals.$color-white;
        }
        .activeline-name {
            @include font.font-light();
            font-size: 0.8em;
            color: globals.$color-gray15;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    }
}

.button-wrapper {
    background-color: globals.$color-sonicsilver;
    overflow: hidden;
    z-index: globals.$level-phonebuttons;
    position: fixed;
    display: flex;
    justify-content: center;
    flex-direction: row;
    height: 60px;
    transition: height .1s ease-in;
    border-radius: 3px;
    box-shadow: 0 2px 3px 0 rgb(0 0 0 / 35%);
    & * {
        z-index: 1;
    }
    &--lobby-open {
        height: 100px;
    }
    &__lobbypanel {
        position: absolute;
        display: flex;
        bottom: 0;
        width: 100%;
        height: 40px;
        line-height: 40px;
        background-color: globals.$color-sonicsilver;
        z-index: 0;
        justify-content: flex-start;
        gap: 5px;
        padding: 6px 6px 3px 5px;
        input {
            flex: 1;
            height: 28px;
            text-indent: 3px;
            color: globals.$color-gray60;
            font-size: 1rem;
            line-height: 30px;
            margin-top: 1px;
        }
        button {
            height: 29px;
            font-size: 1rem;
            line-height: 1.25;
        }
    }
    .button-span-wrapper {
        display: flex;
        height: 40px;
    }
    input[type="checkbox"] {
        position: absolute;
        top: -2000px;
    }
    [class^="button-chk"],
    [class^="button-btn"] {
        position: relative;
        cursor: pointer;
        width: 60px;
        height: 60px;
        user-select: none;
        // border-right: 1px solid globals.$color-gray5;
        // background-color: globals.$color-gray2;
        background-color: globals.$color-sonicsilver;
        &:after {
            content: attr(data-label);
            position: absolute;
            right: 0;
            bottom: 3px;
            left: 0;
            height: 16px;
            line-height: 14px;
            text-align: center;
            @include font.font-menu();
            font-size: 0.7rem;
            color: globals.$color-gray10;
            z-index: 100;
        }
        &:hover {
            background-color: functions.shade(globals.$color-sonicsilver, 20%);
        }
    }
    .button-icon {
        position: absolute;
        top: calc(50% - 5px);
        left: 50%;
        width: 28px;
        height: 28px;
        transform: translate(-50%, -50%);
        color: globals.$color-white;
        background-color: transparent;
        &svg {
            // fill: globals.$color-gray80;
        }
    }
}

.button-btn__mute:hover {
    background-color: functions.shade(globals.$color-sonicsilver, 20%);
}
.button-btn__mute:hover .button-icon,
.button-btn__mute .muted {
    color: globals.$color-interaction;
}

.button-btn__pause:hover {
    background-color: functions.shade(globals.$color-sonicsilver, 20%);
}
.button-btn__pause:hover .button-icon,
.button-btn__pause .held {
    color: globals.$color-orange;
}
.button-btn__back {
    .button-icon {
        color: globals.$color-interaction;
    }
    &:hover {
        background-color: functions.shade(globals.$color-sonicsilver, 20%);
    }
}
.button-btn__switch:hover .button-icon {
    color: globals.$color-interaction;
}

.button-btn__merge:hover .button-icon {
    color: globals.$color-interaction;
}
.button-btn__transfer:hover .button-icon {
    color: globals.$color-interaction;
}
.button-btn__btn__lobby:hover .button-icon {
    color: globals.$color-interaction;
}
.button-btn__recording:hover .button-icon {
    color: globals.$color-unavailable;
}

.button-wrapper > span button:disabled.button-btn__recording--active {
    background-color: globals.$color-sonicsilver;
    color: globals.$color-white;
}
.button-wrapper > span button:disabled.button-btn__recording--active .button-icon {
    color: globals.$color-unavailable;
    background-color: globals.$color-sonicsilver;
    border: 4px dashed globals.$color-white;
    height: 27px;
    width: 27px;
    border-radius: 4px;
    font-size: 1.3rem;
    text-indent: -2px;
}

.button-wrapper .button-btn__pickup {
    background-color: globals.$color-green;
    .button-icon {
        top: 50%;
        color: globals.$color-white;
    }
    &:hover {
        background-color: functions.shade(globals.$color-green, 20%);
    }
}
.button-wrapper .button-btn__earpiece {
    background-color: globals.$color-unavailable;
    .button-icon {
        top: 50%;
        color: globals.$color-white;
    }
    &:hover {
        background-color: functions.shade(globals.$color-unavailable, 20%);
    }
}
.button-wrapper > button:disabled,
.button-wrapper > span button:disabled {
    // background-color: globals.$color-gray10;
    background-color: globals.$color-sonicsilver;
    cursor: default;
    pointer-events: none;
    .button-icon {
        // color: globals.$color-gray30;
        color: globals.$color-gray15;
        // background-color: globals.$color-gray10;
        background-color: globals.$color-sonicsilver;
    }
    &:hover .button-icon {
        color: globals.$color-gray30;
    }
}
</style>
