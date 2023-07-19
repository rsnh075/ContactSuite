<script lang="ts">
export default {
    name: 'RecordingPlayer',
    components: {
        Close,
        Account,
        AccountGroup,
        PhoneInTalk,
        Archive,
        Flag,
        Play,
        Pause,
        CloudDownload
    }
}
</script>

<script setup lang="ts">
/**
 * BE sets recording IsRead to true when recording is read, no signal from gui needed
 *
 *
 */

import { useStore } from 'vuex';
import {
        onMounted,
        ref,
        inject,
        watch,
        computed
        } from 'vue';
import {
        Close,
        Account,
        AccountGroup,
        PhoneInTalk,
        Archive,
        Flag,
        Play,
        Pause,
        CloudDownload,
		CloseCircle
        } from 'mdue';
import { IPCCCData } from '../../../ipccc/js/data';
import { durationTime } from './../../../use/dateFunctions';


const props = defineProps({
    tabprops : {
        type    : Object,
        default : {}
    },
    isactive : {
        type : Boolean,
        default : false
    }
});

const store:object | any                = useStore(),
        selectedRecording               = inject('selectedRecording'),
        setSelectedRecording            = inject<Function>('setSelectedRecording'),
        markSelectedRecordingUnread     = inject('markSelectedRecordingUnread'),
        markSelectedRecordingRead       = inject<Function>('markSelectedRecordingRead'),
        archiveSelectedRecording        = inject('archiveSelectedRecording'),
        toggleLoader:Function           = inject('toggleLoader'),
        setActiveBaseComponent:Function = inject('setActiveBaseComponent'),
        audioIsLoaded                   = ref(false),
        isPlaying                       = ref(false),
        audioDuration                   = ref('00:00'),
        audioPosition                   = ref('00:00'),
        ticker                          = ref(-1),
        track                           = ref(null),
        loadingTxt                      = ref(''),
        msgTxt                          = ref(''),
        hasRecordingObj                 = computed(() => Object.keys(selectedRecording.value).length > 0),
        playhead                        = ref(null);

let   audioPlayer                       = ref(null);

watch(() => props.isactive, (newVal, oldVal) => {
    toggleLoader(false);
});

watch(() => selectedRecording.value?.Id, (newVal, oldVal) => {
    if(newVal != oldVal) {
        resetAudioPlayer();
    }
});

watch(() => selectedRecording.value.IsRead, (newVal, oldVal) => {
    if(newVal && newVal == false) {
        msgTxt.value           = '';
        audioIsLoaded.value    = false;
    }
}, {immediate:true});

watch(playhead, (newVal, oldVal) => {
    if(newVal !== null) dragPlayHead(playhead);
});

const getAudioFile = (id, loadfile) => {
    msgTxt.value = loadingTxt.value;
    IPCCCData.RequestData('PlayRecording', { Id: id, LoadFile : loadfile })
    .then(soundUrl => {
        if(loadfile) {
            loadAudio(JSON.parse(soundUrl));
        } else {
            audioPlayer.value.play();
            startTicker();
            isPlaying.value = true;
        }
    })
    .catch(err => console.warn(err));
}

const resetAudioPlayer = () => {
    isPlaying.value           = false;
    audioIsLoaded.value       = false;
    audioDuration.value       = '00:00';
    audioPosition.value       = '00:00';
    if(playhead.value) playhead.value.style.left = 0;
    audioPlayer.value.pause();
    audioPlayer.value.src     = '';
    msgTxt.value              = '';
    stopTicker();
}

const playSoundOnPhone = () => {
    msgTxt.value = store.state.settings.voicemailinbox.playonphone;
    IPCCCData.RequestData('PlayRecording', { Id: selectedRecording.value.Id, PlayByPhone: true })
    .catch(err => console.log(err));
}

const playSound = () => {
    if(!audioIsLoaded.value) {
        getAudioFile(selectedRecording.value.Id, true)
    } else {
        if(!selectedRecording.value.IsRead) {
            markSelectedRecordingUnread();
        }

        if(isPlaying.value) {
            audioPlayer.value.pause();
            stopTicker();
            isPlaying.value = false;
        } else {
            // getAudioFile(selectedRecording.value.Id, false);
            audioPlayer.value.play();
            startTicker();
            isPlaying.value = true;
        }
    }
}

const startTicker = () => {
    if(ticker.value == -1) {
        ticker.value = setInterval(() => {
            updatePlayer();
        })
    }
}

const stopTicker = () => {
    clearInterval(ticker.value);
    ticker.value  = -1;
}

const loadAudio = (aFile) => {
    if(typeof aFile !== 'undefined') {
        audioPlayer.value.addEventListener('loadeddata', () => {
            audioIsLoaded.value = true;
            audioDuration.value = durationTime(audioPlayer.value.duration, 'mm:ss');
            audioPlayer.value.play();
            startTicker();
            isPlaying.value     = true;
        });
        audioPlayer.value.addEventListener('error', (error) => {
            isPlaying.value               = false;
            console.log('Error: ', error);
        });
        audioPlayer.value.addEventListener('ended', () => {
            isPlaying.value               = false;
            audioPlayer.value.currentTime       = 0;
            if(!selectedRecording.value.IsRead) {
                markSelectedRecordingRead();
            }
        });
        audioPlayer.value.src = aFile;
    } else {
        msgTxt.value = 'File not found';
    }
}

const updatePlayer = () => {
    audioPosition.value       = durationTime(audioPlayer.value.currentTime, "mm:ss");
    playhead.value.style.left = ((audioPlayer.value.currentTime / audioPlayer.value.duration)* 100) + '%';
}

const gotoTimeAndPlay = (evt) => {
    if(evt.target != playhead.value) {
        let _evt  = evt || window.event;
            _evt.preventDefault();
        let _posX  = _evt.clientX - _evt.target.getBoundingClientRect().left,
            _perc  = (_posX/_evt.target.getBoundingClientRect().width);

        audioPlayer.value.currentTime = (audioPlayer.value.duration * _perc);
        if(isPlaying.value) isPlaying.value = false;
        playSound();
    }
}

const dragPlayHead = (head) => {
    let _pos1     = 0,
        _pos2     = 0,
        _trackEnd = 0;

    const dragMouseDown = (evt) => {
        evt = evt || window.event;
        evt.preventDefault();
        //GET CURSOR POSITION AT START
        _pos2     = evt.clientX;
        _trackEnd = track.value.getBoundingClientRect().width;
        document.onmouseup = stopDragElement;
        //CALL FUNCTION IF CURSOR MOVES
        document.onmousemove = elementDrag;
        //STOP AUDIO
        playSound();
    }

    const elementDrag = (evt) => {
        let _nwPos;
        evt = evt || window.event;
        evt.preventDefault();
        //CALCULATE NEW CURSOR POSITION
        _pos1 = _pos2 - evt.clientX;
        _pos2 = evt.clientX;
        //SET NEW POSITION AND CHECK IF ITS IN BOUNDERIES
        _nwPos = head.value.offsetLeft - _pos1;
        if(_nwPos >= 0 && _nwPos <= _trackEnd)
        head.value.style.left = (head.value.offsetLeft - _pos1) + "px";
        else
        stopDragElement();
        //RESTART AUDIO
        audioPlayer.value.currentTime = audioPlayer.value.duration * (_nwPos/_trackEnd);
        audioPlayer.value.play();
    }

    const stopDragElement = () => {
        //STOP DRAGGING WHEN RELEASED
        document.onmouseup   = null;
        document.onmousemove = null;

        if(isPlaying.value)
        isPlaying.value = false;

        playSound();
    }
    head.value.onmousedown = dragMouseDown;
};

const windowStatus = computed(() => {
    let _class = 'recording-detail';
    _class += hasRecordingObj.value ? ' recording-detail--visable' : '';
    return _class;
});

const playbuttonIcon = computed(() => {
    return (audioIsLoaded.value) ? (isPlaying.value ? 'Pause' : 'Play') : 'CloudDownload';
});

const iconType = computed(() => {
    if(hasRecordingObj.value && selectedRecording.value.ItemType == 2) return 'AccountGroup';
    else return 'Account';
});

const closeRecording = () => {
    setActiveBaseComponent(0);
    setSelectedRecording(-1);
};

onMounted(() => {
    loadingTxt.value = store.state.settings.voicemailinbox.loadingtext;
    audioPlayer.value = new Audio();
    toggleLoader(false);
})

</script>

<template>
    <div class="recording-player-wrapper" data-e2e="recording-player">
        <button v-if="hasRecordingObj" type="button" class="recording__closebtn" @click="closeRecording()">
            <Close class="recording__closebtn__icon" />
        </button>
        <div v-if="hasRecordingObj" :class="windowStatus">
            <div class="grid-row">
                <div class="recording__icon-wrapper">
                    <div class="recording__icon" :class="[{'recording__icon__account' : iconType == 'Account'}, {'recording__icon__accountgroup' : iconType == 'AccountGroup'}]">
                        <component :is="iconType" />
                    </div>
                </div>
                <div class="recording__info-top">
                    <div class="recording__info-top-row--100">{{ selectedRecording.fullName }}</div>
                    <div class="recording__info-top-row--100">{{ selectedRecording.dateTime }}</div>
                </div>
                <div class="recording__cta-wrapper">
                    <div class="recording__cta--playphone" @click="playSoundOnPhone">
                        <span class="recording__cta--circle"><PhoneInTalk /></span>
                        <span class="recording__cta--txt">{{ store.state.settings.voicemailinbox.playphone }}</span>
                    </div>
                    <div :class="['recording__cta--unread', {'recording__cta--unread-isoff' : !selectedRecording.IsRead}]" @click="markSelectedRecordingUnread()">
                        <span class="recording__cta--circle"><Flag /></span>
                        <span class="recording__cta--txt">{{ store.state.settings.voicemailinbox.markunread }}</span>
                    </div>
                    <div :class="['recording__cta--archive', {'recording__cta--archive-isoff' : !selectedRecording.IsRead}]" @click="archiveSelectedRecording()">
                        <span class="recording__cta--circle"><Archive /></span>
                        <span class="recording__cta--txt">{{ store.state.settings.voicemailinbox.archivelabel }}</span>
                    </div>
                </div>
            </div>
            <div class="grid-row">
                <div class="recording__info-bottom">
                    <div class="recording__info-bottom-row--25">{{ store.state.settings.voicemailinbox.tolabel }}</div>
                    <div class="recording__info-bottom-row--75">{{ $store.state.loginSession.Details.FullName}}</div>
                    <div v-if="selectedRecording.ItemType == 2" class="recording__info-bottom-row--25">{{ store.state.settings.voicemailinbox.groeplabel }}</div>
                    <div v-if="selectedRecording.ItemType == 2" class="recording__info-bottom-row--75">{{ selectedRecording.RoutinggroupName }}</div>
                </div>
            </div>
            <div class="recording-footer">
                <div class="recording__player">
                    <div class="recording__player-playbtn" @click="playSound">
                        <component :is="playbuttonIcon" />
                    </div>
                    <div v-if="audioIsLoaded" class="recording__player-track-time">{{ audioPosition }}</div>
                    <div v-show="audioIsLoaded" class="recording__player-track-wrapper" ref="track" @mouseup="gotoTimeAndPlay($event)">
                        <div class="recording__player-track-playhead" ref="playhead"></div>
                    </div>
                    <div v-if="audioIsLoaded" class="recording__player-track-time">{{ audioDuration }}</div>
                    <div v-else class="recording__player-track-time-total">{{ msgTxt }}</div>
                </div>
            </div>
        </div>
        <div v-else class="recording-welkom-message">
            {{ store.state.settings.voicemailinbox.selectrecording }}
        </div>
    </div>
</template>

<style lang="scss" scoped>

@use "@/scss/includes/font";
@use "@/scss/includes/globals";
@use "@/scss/includes/functions";
@use "@/scss/includes/mixins";

.recording-player-wrapper {
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
    font-size: 1rem;
    z-index: 1;
}

.recording-detail {
    position: absolute;
    top: 4rem;
    left: 50%;
    min-width: 640px;
    width: 800px;
    min-height: 100px;
    transform: translateX(-50%)
                scale(.8);
    opacity: 0;
    transition: all .2s ease-in;
    background-color: globals.$color-white;
    padding: 1rem;
    box-shadow: 0 2px 3px 0 rgba(0,0,0,.15);
    margin-bottom: 20px;
    &--footer {
      top: .5rem;
    }
    .ruler--bottom {
        &:after{
            left: -1rem;
            right: -1rem;
        }
    }

    &--visable {
        opacity: 1;
        transform: translateX(-50%)
                    scale(1);
    }
}

.recording__closebtn {
    width: 40px;
    height: 40px;
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
    &__icon {
        width: 40px;
        height: 40px;
        padding: 10px;
        color: globals.$color-gray30;
    }
}

.recording__icon-wrapper {
    float: left;
    width: 140px;
    height: 130px;
    min-height: 130px;
}

.recording__icon {
    position: relative;
    margin: 0 20px;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    text-align: center;
    &__account {
        border: 5px solid globals.$color-gray15;
        background-color: globals.$color-gray30;
        svg {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: globals.$color-white;
            font-size: 5.4rem;
            clip-path: circle(29px at center);
        }
    }
    &__accountgroup {
        background-color: functions.tint(globals.$color-interaction, 50%);
        svg {
            width: 90px;
            height: 90px;
            color: globals.$color-white;
            font-size: 4.8rem;
            clip-path: circle(43px at center);
        }
    }
}

.recording__info-top {
    float: left;
    width: 400px;
    height: 130px;
    min-height: 130px;
    color: globals.$color-gray60;
    padding: 35px 0 0 10px;
    .recording__info-top-row--100 {
        float: left;
        width: 100%;
        @include font.font-medium();
        font-size: 1.1rem;
        text-align: left;
    }
    div:nth-child(2) {
        font-size: .8rem;
        color: globals.$color-gray60;
        @include font.font-light();
        padding-top: .3rem;
    }
}

.recording__cta-wrapper {
    float: left;
    width: 220px;
    height: 130px;
    min-height: 130px;
    div {
        position: relative;
        width: 33.333%;
        height: 140px;
        min-height: 140px;
        display: inline-block;
        cursor: pointer;
    }
    .recording__cta--circle {
        display: block;
        position: absolute;
        top: 35px;
        left: 50%;
        width: 35px;
        height: 35px;
        line-height: 35px;
        text-align: center;
        border-radius: 50%;
        transform: translateX(-50%);
        background-color: globals.$color-interaction;
    }
    .recording__cta--txt {
        position: absolute;
        left: 50%;
        bottom: 50px;
        transform: translateX(-50%);
        display: block;
        color: globals.$color-interaction;
        @include font.font-menu();
        font-size: .7rem;
        @include mixins.chopToLongText(100%);
        text-align: center;
    }
    a:hover:not(.recording__cta--unread-isoff, .recording__cta--archive-isoff) .recording__cta--circle {
        background-color: functions.tint(globals.$color-interaction, 20%);
    }
    .recording__cta--unread svg,
    .recording__cta--archive svg,
    .recording__cta--playphone svg {
        color: globals.$color-white;
        font-size: 1.2rem;
        vertical-align: middle;
    }
    .recording__cta--unread-isoff,
    .recording__cta--archive-isoff {
        cursor: default;
        .recording__cta--circle {
            background-color: globals.$color-gray20;
        }
        .recording__cta--txt {
            color: globals.$color-gray20;
        }
    }
}

.recording__info-bottom {
    float: left;
    width: 100%;
    height: 80px;
    min-height: 80px;
    color: globals.$color-gray60;
    padding: 0 0 0 150px;
    .recording__info-bottom-row--25,
    .recording__info-bottom-row--75 {
        float: left;
        width: 25%;
        height: 35px;
        line-height: 35px;
        @include font.font-medium();
        font-size: .9rem;
    }
    .recording__info-bottom-row--75 {
        width: 75%;
        @include font.font-light();
    }
}

.recording-footer {
    position: absolute;
    top: calc(100% + .5rem);
    left: 0;
    min-width: 640px;
    width: 800px;
    min-height: 40px;
    background-color: globals.$color-white;
    padding: 0;
    box-shadow: 0 2px 3px 0 rgba(0,0,0,.15);
}

.recording__player-playbtn,
.recording__player-playphonebtn {
    position: relative;
    float: left;
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

</style>