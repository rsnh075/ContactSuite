<script lang="ts">
export default {
    name: 'RecordingMonitorPlayer',
    components: {
        WavesurferPlayer,
        Close,
        Play,
        Pause,
        Download,
        ContentCopy,
        ContentSave,
        Delete
    }
}
</script>

<script setup lang="ts">
/**
 *
 *
 */

import { useStore } from 'vuex';
import {
        onBeforeUnmount,
        ref,
        inject,
        watch,
        computed,
        nextTick,
        } from 'vue';
import {
        Close,
        Play,
        Pause,
        Download,
        ContentCopy,
        ContentSave,
        Delete
        } from 'mdue';
import { IPCCCData } from '../../ipccc/js/data';
import WavesurferPlayer from '../uielements/WavesurferPlayer.vue';
import BoxProps, { ModalType } from '../../types/BoxProps';
import { EnumNoteColors, EnumPRRequestType, RecordingFragment } from '../../types/RecordingMonitor';
import { convertISOToDateTime } from './../../use/dateFunctions';
import CachedData from './../../types/CachedData';

const props = defineProps({
    selectedRecordingId : {
        default : ''
    },
    selectedRecordingCaseId : {
        default : ''
    },
    selectedRecordingScript : {
        default : ''
    },
    selectedRecordingNote : {
        default : ''
    },
    selectedRecordingColor : {
        default : ''
    },
    autoPlay : {
        default : false
    }
})

const emits = defineEmits(['setRecordingNoteColor', 'setAutoPlay']);
const store:object | any     = useStore(),
    showLoader:Function      = inject('showLoader'),
    showModalDialog:Function = inject('showModalDialog'),
    canDownload              = computed(() => store.getters.getPermission('OpnamenDownloaden')),
    audioIsLoaded            = ref(false),
    isPlaying                = ref(false),
    wsplayer                 = ref(null),
    selectedFragment         = ref(new RecordingFragment()),
    recordingFragments       = ref([]),
    isMassxess               = computed(() => store.getters.getCustomerInfo().customerId === 1);

watch(() => props.selectedRecordingId, (newVal, oldVal) => {
    if(newVal != oldVal) {
        resetAudioPlayer();
    }
});

const recordingNoteDummy = ref('');
const recordingColors = Object.assign({}, EnumNoteColors);
const recordingColorDummy = ref('');

const resetAudioPlayer = () => {
    wsplayer.value?.pausePlayer();
    wsplayer.value?.clearRegions();
    isPlaying.value           = false;
    audioIsLoaded.value       = false;
    sourceUrl.value           = '';
    recordingNoteDummy.value  = '';
    recordingColorDummy.value = '';
    selectedFragment.value    = new RecordingFragment();
    recordingFragments.value  = [];
    getAudioFile();
    // getTestAudioFile();
    getNoteColor();
}

const getNoteColor = () => {
    recordingNoteDummy.value  = props.selectedRecordingNote;
    recordingColorDummy.value  = props.selectedRecordingColor !== '' ? props.selectedRecordingColor : recordingColors.Blue;
}

const sourceUrl = ref('');

const getTestAudioFile = () => {
    sourceUrl.value = './assets/sounds/ringtone02.mp3';
    getFragments();
}

function getAudioFile() {
    showLoader(true);
    IPCCCData.RequestData('PlayRecording', { Id: props.selectedRecordingId, LoadFile : true })
    .then(url => {
        sourceUrl.value = (JSON.parse(url));
        // needed to prevent: Framework called to much for the same function!. - Take up with Rolf van der Vooren
        setTimeout(() => {
            getFragments();
        }, 250)
    })
    .catch(error => {
        console.error(error);
        showLoader(false);
        showModalDialog(new BoxProps(ModalType.Alert, 'Error', store.state.settings.unexpectederrortxt));
    });
}

//------------Recording fragments

function getFragments() {
    IPCCCData.RequestData('PerformanceRecordings', {
        Id: props.selectedRecordingId,
        Type: EnumPRRequestType.GetFragments
    })
    .then(fragments => {
        showLoader(false);
        const _fragments = JSON.parse(fragments)
        if (fragments.length == 0) {

        } else {
            drawRequestedFragments(_fragments);
        }
    })
    .catch(error => {
        console.error(error);
        showLoader(false);
        showModalDialog(new BoxProps(ModalType.Alert, 'Error', store.state.settings.unexpectederrortxt));
    });
}

function drawRequestedFragments(fragments) {
    fragments.forEach((region, index) => {
        wsplayer.value.addRegion({
            id : region.PartId,
            start : region.Start,
            end : region.End,
            color : region.Color !== '' ? region.Color : recordingColorDummy.value
        }, true);
    });
    nextTick(() => {
        recordingFragments.value = fragments;

    })
}

function selectFragment(id) {
    //get selected fragment to set note and color
    if (recordingFragments.value.find(fragment => fragment.PartId == id)) {
        selectedFragment.value = recordingFragments.value.find(fragment => fragment.PartId == id);
    }
    wsplayer.value.removeHiglitedRegions();
    wsplayer.value.highliteRegion(id);
}

function getNewFragmentId(region) {
    return new Promise((resolve, reject) => {
        //save region as fragment
        let _fragment = new RecordingFragment();
        _fragment.PartId = -1;
        _fragment.CustomerId = isMassxess ? store.getters.getCustomerInfo().selectedCustomerId : store.getters.getCustomerInfo().customerId;
        _fragment.Id = props.selectedRecordingId;
        _fragment.Start = Math.round(region.start);
        _fragment.End = Math.round(region.end),
        _fragment.Color = getFragmentColor(region.color);
        _fragment.Note = '';
        showLoader(true);
        IPCCCData.RequestData('PerformanceRecordings', _fragment)
        .then((fragments) => {
            showLoader(false);
            const _fragments = JSON.parse(fragments)
            //get added fragment
            const newFragmentId = _fragments.reduce((acc, fragment) => {
                // check if region.PartId is in recordingFragments.value
                if (recordingFragments.value.findIndex(el => el.PartId == fragment.PartId) == -1) {
                    return acc = fragment.PartId;
                }
            }, -1);
            recordingFragments.value = _fragments;
            resolve(newFragmentId);
        })
        .catch(error => {
            showLoader(false);
            reject();
            console.error(error);
            // showModalDialog(new BoxProps(ModalType.Alert, 'Error', store.state.settings.unexpectederrortxt));
            showModalDialog(new BoxProps(ModalType.Alert, 'Error!', `${error.Message ? error.Message : error}`));
        });
    });
}

function saveFragmentStartEnd(region) {
    // get saved fragment and update fragment
    let _fragmentIndex = recordingFragments.value.findIndex(fragment => fragment.PartId == region.id);
    if (_fragmentIndex > -1) {
        recordingFragments.value[_fragmentIndex].Start = Math.round(region.start);
        recordingFragments.value[_fragmentIndex].End = Math.round(region.end);
        selectedFragment.value = recordingFragments.value[_fragmentIndex];
        saveFragmentNoteColor();
    }
}

function saveFragmentNoteColor() {
    // get saved fragment and update fragment
    let _fragment = selectedFragment.value;
    _fragment.Start = Math.round(_fragment.Start);
    _fragment.End = Math.round(_fragment.End);
    _fragment.Note = _fragment.Note;
    _fragment.Color = _fragment.Color;
    _fragment.Type = EnumPRRequestType.SetFragmentProperties;
    showLoader(true);
    console.log('saveFragment', _fragment);
    IPCCCData.RequestData('PerformanceRecordings', _fragment)
    .then(fragments => {
        showLoader(false);
        recordingFragments.value = JSON.parse(fragments);
        wsplayer.value.setRegionColor(selectedFragment.value.PartId, selectedFragment.value.Color);
    })
    .catch(error => {
        showLoader(false);
        console.error(error);
        // showModalDialog(new BoxProps(ModalType.Alert, 'Error', store.state.settings.unexpectederrortxt));
        showModalDialog(new BoxProps(ModalType.Alert, 'Error!', `${error.Message ? error.Message : error}`));
    });
}

async function deleteFragment(id) {
    try {
        showLoader(true);
        const fragments = await IPCCCData.RequestData('PerformanceRecordings', {
            Id: props.selectedRecordingId,
            Type: EnumPRRequestType.SetFragmentProperties,
            Delete: true,
            PartId: id,
        });
        showLoader(false);
        recordingFragments.value = JSON.parse(fragments);
        selectedFragment.value = new RecordingFragment();
    } catch (error) {
        showLoader(false);
        console.error(error);
        showModalDialog(new BoxProps(ModalType.Alert, 'Error', store.state.settings.unexpectederrortxt));
    }
}

//------------Recording INFO

function getFragmentColor(color) {
    if (
        color && color !== '' &&
        !color.startsWith('wavesurfer') &&
        (color.slice(-2) == 'CC' || color.slice(-2) == '99')
    ) {
        return color.slice(0, -2);
    } else {
        return recordingColorDummy.value;
    }
}

function copyId(id) {
    navigator.clipboard.writeText(id);
};

function showRecordingNoteColor() {
    selectedFragment.value = new RecordingFragment();
}

function setRecordingNoteColor() {
    if (selectedFragment.value.PartId > -1) {
        saveFragmentNoteColor();
        return;
    }
    let setObj = {};
    setObj = {
        Type : EnumPRRequestType.SetProperties,
        Note: recordingNoteDummy.value !== '' ? recordingNoteDummy.value : ' ',
        Color: recordingColorDummy.value,
        Id: props.selectedRecordingId
    }
    emits('setRecordingNoteColor', setObj);
};

function setAutoPlay() {
    emits('setAutoPlay');
}

function handleDownload() {
    const url = sourceUrl.value + '?action=download';
    const filename = `${convertISOToDateTime(new Date().toISOString(), store.getters.getLang())} ${store.state.loginSession.Details.FullName}`;
    showLoader(true);
    fetch(url)
    .then(response => response.blob())
    .then(blob => {
        showLoader(false);
        // Create a download link with the file object
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    })
    .catch(error => {
        showLoader(false);
        // console.error(`Error occurred while downloading ${url}: ${error}`);
        showModalDialog(new BoxProps(ModalType.Alert, 'Error', store.state.settings.unexpectederrortxt));
    });
}

function onAudioReady() {
    if (props.autoPlay) {
        wsplayer.value.playPlayer();
    }
    wsplayer.value.setFocusToPlayer();
}

function onWaveFormReady() {
    //
}

function onPlayerFinish() {
    wsplayer.value.stopPlayer();
}

function onPlayerError(error) {
    showModalDialog(new BoxProps(ModalType.Message, 'Warning', error ? error : store.state.settings.audiogeterrormsg));
}

function onClickedNoRegion() {
    showRecordingNoteColor();
    wsplayer.value.removeHiglitedRegions();
}

function onRegionSelected(region) {
    selectFragment(region.id);
}

function onRegionUpdated(region) {
    console.log('onRegionUpdated', );
    // fires when dragging or resizing is finished (also fires after adding region)
    // if region id is string then create new fragment, remove region, add region and highlite else save fragment

    if (isNaN(region.id)) {
        getNewFragmentId(region)
        .then((id) => {
            // add region
            wsplayer.value.addRegion({
                id: id,
                start: region.start,
                end: region.end,
                color: getFragmentColor(region.color),
            }, true);
            // remove region
            wsplayer.value.deleteRegion(region);
            selectFragment(id);
        })
        .catch(() => {
            wsplayer.value.deleteRegion(region);
        });
    } else {
        saveFragmentStartEnd(region);
        selectFragment(region.id);
    }
}

function onDeleteRegion(region) {
    deleteFragment(region.id)
    .then(() => {
        wsplayer.value?.deleteRegion(region);
    })
}

function zoomInOut(event) {
    let _target = event.target,
        _val = _target.value;
    wsplayer.value?.zoomInOut(Number(_val));
}

const minZoomSlider = ref(20);
function setMinZoomSlider(minPxPerSec) {
    minZoomSlider.value = minPxPerSec;
}

onBeforeUnmount(() => {
    wsplayer.value?.pausePlayer();
});

</script>

<template>
    <div data-e2e="recording-monitor-player">
        <div class="recording-monitor-player-wrapper">
            <div class="recording__player">
                <WavesurferPlayer ref="wsplayer"
                v-if="sourceUrl && sourceUrl.length > 0"
                :useregions="true"
                :source="sourceUrl"
                @onaudioready="onAudioReady"
                @onwaveformready="onWaveFormReady"
                @onfinish="onPlayerFinish"
                @onplayererror="onPlayerError"
                @onclickednoregion="onClickedNoRegion"
                @onregionselected="onRegionSelected"
                @onregionupdated="onRegionUpdated"
                @ondeleteregion="onDeleteRegion"
                @onzoom="setMinZoomSlider"
                />
            </div>

            <div class="recording__player-info">
                <div v-if="selectedRecordingId.length > 0" class="recording__player-info__notecolor">
                    <div v-if="selectedFragment.PartId > -1" class="recording__player-info__notecolor-note">
                        <textarea v-model="selectedFragment.Note" @blur="setRecordingNoteColor" :placeholder="store.state.settings.recordingmonitor.defaultanswertext" cols="auto"></textarea>
                    </div>
                    <div v-else class="recording__player-info__notecolor-note">
                        <textarea v-model="recordingNoteDummy" @blur="setRecordingNoteColor" :placeholder="store.state.settings.recordingmonitor.defaultanswertext" cols="auto"></textarea>
                    </div>
                    <div class="recording__player-info__notecolor-color">
                        <select v-if="selectedFragment.PartId > -1" v-model="selectedFragment.Color" @change="setRecordingNoteColor" :style="`background-color:${selectedFragment.Color}`">
                            <option v-for="option in recordingColors" :style="`background-color:${option}`" :value="option"></option>
                        </select>
                        <select v-else v-model="recordingColorDummy" @change="setRecordingNoteColor" :style="`background-color:${recordingColorDummy}`">
                            <option v-for="option in recordingColors" :style="`background-color:${option}`" :value="option"></option>
                        </select>
                    </div>
                </div>
                <div class="recording__player-info__body">
                    <!-- <div class="recording__player-info__zoom" v-if="selectedRecordingCaseId.length > 0">
                        <label for="zoomslider">Zoom</label>
                        <input name="zoomslider" data-action="zoom" @change="zoomInOut" type="range" :min="minZoomSlider" max="500" value="0">
                    </div> -->

                    <div class="recording__player-info__id" v-if="selectedRecordingId.length > 0" @click="copyId(selectedRecordingId)">
                        <label>{{ store.state.settings.recordingmonitor.recordingidlabel }}</label>
                        <span>{{ selectedRecordingId }}</span>
                        <ContentCopy class="recording__player-info__copy" />
                    </div>
                    <div class="recording__player-info__caseid" v-if="selectedRecordingCaseId.length > 0" @click="copyId(selectedRecordingCaseId)">
                        <label>{{ store.state.settings.recordingmonitor.recordingcaseidlabel }}</label>
                        <span>{{ selectedRecordingCaseId }}</span>
                        <ContentCopy class="recording__player-info__copy" />
                    </div>
                    <div class="recording__player-info__script" v-if="selectedRecordingScript.length > 0" @click="copyId(selectedRecordingScript)">
                        <label>{{ store.state.settings.recordingmonitor.recordingscriptlabel }}</label>
                        <span>{{ selectedRecordingScript }}</span>
                        <ContentCopy class="recording__player-info__copy" />
                    </div>
                    <div v-if="selectedRecordingId.length == 0" class="recording-welkom-message">
                        {{ store.state.settings.recordingmonitor.selectrecording }}
                    </div>
                </div>
                <div v-if="selectedRecordingId.length > 0" class="recording__player-info__buttons">
                    <div class="form-checkbox form-checkbox--large form-checkbox--no-margin">
                        <input type="checkbox" name="autoplay" id="autoplay" :checked="props.autoPlay" @change="setAutoPlay()">
                        <label for="autoplay">{{ store.state.settings.recordingmonitor.autoplaylabel }}</label>
                    </div>
                    <button v-if="canDownload" type="button" title="download" @click="handleDownload">
                        <Download />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>

@use "@/scss/includes/font";
@use "@/scss/includes/globals";
@use "@/scss/includes/functions";
@use "@/scss/includes/mixins";

.recording-monitor-player-wrapper {
    position: relative;
    overflow-x: auto;
    width: 100%;
    height: 100%;
}
.recording-welkom-message {
    position: absolute;
    top: 35%;
    left: 50%;
    width: auto;
    transform: translate(-50%,-50%);
    @include font.font-light();
    color: globals.$color-gray60;
    font-size: 0.9rem;
    z-index: 1;
}

.recording__player {
    position: absolute;
    //min-width: 640px;
    width: 100%;
    min-height: 40px;
    padding: 0;
    border: 1px solid globals.$color-gray15;
    background-color: globals.$color-white;
    .recording__player-playbtn {
        position: relative;
        // float: left;
        display: block;
        width: 50px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        cursor: pointer;
        svg {
            vertical-align: middle;
            color: globals.$chat-header;
            font-size: 1.8rem;
            line-height: 40px;
        }
        &:hover {
            background-color: globals.$color-gray5;
        }
    }

    .recording__player-track-wrapper {
        position: relative;
        float: left;
        display: block;
        width: calc(100% - 180px);
        margin: 0 10px;
        height: 40px;
        &:after {
            content: '';
            position: absolute;
            top: 17px;
            right: 0;
            bottom: 17px;
            left: 0;
            background-color: globals.$color-gray10;
        }
        &__canvas {
            position: relative;
            width: 100%;
            height: 100%;
            canvas {
                position: relative;
                width: 100%;
                height: 100%;
                z-index: 1;
            }

        }
    }

    .recording__player-track-playhead {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 14px;
        background-color: globals.$chat-header;
        display: block;
        z-index: 100;
        cursor: pointer;
        &:after {
            content: '';
            position: absolute;
            top: -10px;
            right: -15px;
            bottom: -10px;
            left: -15px;
            border-radius: 50%;
        }
    }

    .recording__player-track-time,
    .recording__player-track-time-total {
        position: relative;
        float: left;
        display: block;
        width: 50px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        color: globals.$color-gray60;
        font-size: .8rem;
        white-space: nowrap;
        @include font.font-menu();
    }

}
.recording__player-info {
    position: absolute;
    display: flex;
    overflow: auto;
    top: 45px;
    bottom: 0;
    width: 100%;
    border: 1px solid globals.$color-gray15;
    background-color: globals.$color-white;
    padding: 6px 1rem;
    justify-content: space-between;
    gap: 1rem;
    line-height: 1rem;

    &__notecolor {
        display: flex;
        align-self: center;
        flex: 1;
        height: 100%;
        &-note {
            width: 100%;
            textarea {
                box-sizing: border-box;
                height: 100%;
                width: 100%;
                padding: 5px 10px;
                background-color: globals.$color-white;
                border: 1px solid globals.$color-gray30;
                font-size: 0.8rem;
                resize: none;
                @include font.font-normal();
                border-radius: 3px;
                overflow: auto;
            }
        }
        &-color {
            margin: 0 0 0 1rem;
            position: relative;
            width: 40px;
            &:before {
                content: "";
                position: absolute;
                width: 0;
                height: 0;
                top: 13px;
                left: 24px;
                border: 6px solid transparent;
                border-top-color: #a6a6a6;
                border-top-color: globals.$color-gray35;
                z-index: 2;
                pointer-events: none;
                user-select: none;
            }
            select {
                appearance: none;
                width: 40px;
                height: 30px;
                border: none;
                border-bottom: 1px solid #a6a6a6;
                text-indent: -10px;
                text-align: left;
                color: globals.$color-gray60;
                option {
                    text-align: center;
                }
            }
        }
        &-sendbtn,
        &-deletebtn {
            width: 40px;
            height: 32px;
            line-height: 36px;
            margin: 6px 0 0 auto;
            color: globals.$color-gray30;
            font-size: 1.1rem;
            text-align: center;
            cursor: pointer;
            border-radius: 3px;
            &--hidden {
                display: none;
            }
            &:hover {
                color: globals.$color-white;
                background-color: globals.$color-green;
                box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.1);
            }
        }
        &-sendbtn {
            color: globals.$color-white;
            background-color: functions.tint(globals.$color-green, 10%);
        }
        &-deletebtn {
            color: functions.tint(globals.$color-unavailable, 30%);
            right: 6px;
            left: initial;
            &:hover {
                color: globals.$color-unavailable;
                background-color: globals.$color-gray5;
            }
        }
    }
    &__body {
        flex: 1;
        // align-self: center;
        color: globals.$color-gray60;
        font-size: .8rem;
        @include font.font-normal();
        border: none;
        line-height: 1.3rem;
        label {
            @include font.font-bold();
            // width: 150px;
            padding: 0 5px 0 0;
        }
        span {
            // width: 230px;
            border: 0;
            cursor: pointer;
            &:active {
                color: globals.$color-gray20;
            }
        }
        .recording__player-info__copy {
            margin: 0 3px 0 3px;
            width: 20px;
            cursor: pointer;
            &:active {
                color: globals.$color-gray20;
            }
        }
    }
    &__zoom {
        display: flex;
        font-size: 1.6rem;
        gap: 10px;
        height: 2rem;
        label {
            font-size: 0.9rem;
            align-self: center;
        }
        /*********** Baseline, reset styles ***********/
        input[type="range"] {
            -webkit-appearance: none;
            appearance: none;
            background: transparent;
            cursor: pointer;
            width: 300px;
        }

        /******** Chrome, Safari, Opera and Edge Chromium styles ********/
        /* slider track */
        input[type="range"]::-webkit-slider-runnable-track {
            background-color: globals.$color-home;
            border-radius: 0px;
            height: 1px;
        }

        /* slider thumb */
        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none; /* Override default look */
            appearance: none;
            margin-top: -7.5px; /* Centers thumb on the track */
            background-color: globals.$color-home;
            border-radius: 50%;
            height: 1rem;
            width: 1rem;
        }

        /*********** Firefox styles ***********/
        /* slider track */
        input[type="range"]::-moz-range-track {
            background-color: globals.$color-home;
            border-radius: 0px;
            height: 1px;
        }

        /* slider thumb */
        input[type="range"]::-moz-range-thumb {
            background-color: globals.$color-home;
            border: none; /*Removes extra border that FF applies*/
            border-radius: 0px;
            height: 1rem;
            width: 1rem;
        }
    }
    &__buttons {
        // align-self: center;
        text-align: right;
        .form-checkbox.form-checkbox--no-margin {
            margin: 0;
            label {
                font-size: .8rem;
            }
        }
        button {
            width: 31px;
            height: 31px;
            line-height: 31px;
            text-align: center;
            font-size: 1.1rem;
            line-height: 37px;
            color: globals.$color-gray30;
            border-radius: 3px;
            cursor: pointer;
            user-select: none;
            &:hover {
                color: globals.$color-white;
                background-color: globals.$color-green;
            }
        }
    }
}

</style>