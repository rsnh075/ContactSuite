<script lang="ts">
export default {
    name: 'WavesurferPlayer',
}
</script>

<script setup lang="ts">

/**
 *
 * @author Erik Rosenhart
 *
 * @example
 * see RecordingMonitorPlayer
 * wavesurfer keeps track of the selectedRegionId on its own accord
 *
 */

import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions';
import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline';
// import MediaSessionPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.mediasession';
import { Play, Pause } from 'mdue';

const props = defineProps({
    source : {
        type     : String,
        default  : '',
        required : true
    },
    useregions : {
        type     : Boolean,
        default  : false,
        required : false
    }
});

const emits = defineEmits([
    'onaudioready',
    'onwaveformready',
    'onfinish',
    'onplayererror',
    'onclickednoregion',
    'onregionselected',
    'onregionupdated',
    'ondeleteregion',
    'onzoom'
]);

const waveformRef = ref(null),
    timelineRef = ref(null),
    wavesurfer = ref(null),
    playerIsFocused = ref(false),
    audioIsLoaded = ref(false),
    waveFormIsLoaded = ref(false),
    playbuttonIcon = computed(() => (audioIsLoaded.value) ? (wavesurfer.value?.isPlaying() ? 'Pause' : 'Play') : 'Play'),
    showTime = ref(false),
    currentTime = ref('00:00'),
    selectedRegionId = ref(-1),
    isPlayingRegion = ref(false),
    lastRegionClick = ref(new Date().getTime());

//----------------------------- WAVEFORM

function initWavesurfer() {

    if (props.useregions) {
        wavesurfer.value = WaveSurfer.create({
            container: waveformRef.value,
            backend: 'MediaElement',
            pixelRatio: 1,
            waveColor: '#D9D9D9',
            progressColor: '#333333',
            barWidth: 5,
            barRadius: 3,
            responsive: true,
            // scrollParent: true, // turn on when zooming comes in to play
            plugins: [
                RegionsPlugin.create({
                    regionsMinLength: .5,
                    dragSelection: {
                        slop: 3
                    }
                }),
                TimelinePlugin.create({
                    container: timelineRef.value
                })
            ]
        });
    } else {
        wavesurfer.value = WaveSurfer.create({
            container: waveformRef.value,
            backend: 'MediaElement',
            pixelRatio: 1,
            waveColor: '#D9D9D9',
            progressColor: '#333333',
            barWidth: 5,
            barRadius: 3,
            responsive: true,
            // scrollParent: true,  // turn on when zooming comes in to play
            plugins: [
                TimelinePlugin.create({
                    container: timelineRef.value
                })
            ]
        });
    }

    wavesurfer.value.crossOrigin = "anonymous";
    wavesurfer.value.setHeight(40);

    setWavesurferEvents();
}

function setWavesurferEvents() {

    wavesurfer.value.on('ready', () => {
        audioIsLoaded.value = true;
        emits('onaudioready');
    }, { passive: true });
    wavesurfer.value.on('interaction', () => {
        if (props.useregions && new Date().getTime() - lastRegionClick.value > 200) {
            selectedRegionId.value = -1;
            emits('onclickednoregion');
        }
    }, { passive: true });
    wavesurfer.value.on('waveform-ready', () => {
        waveFormIsLoaded.value = true;
        emits('onwaveformready');
    }, { passive: true });
    wavesurfer.value.on('finish', () => {
        emits('onfinish');
    }, { passive: true });
    wavesurfer.value.on('audioprocess', (event) => {
        updateTimers(event);
    }, { passive: true });
    wavesurfer.value.on('pause', function () {
        setAllRegionPlayButtonsToPlay();
        isPlayingRegion.value = false;
    }, { passive: true });
    wavesurfer.value.on('zoom', () => {
        emits('onzoom');
    }, { passive: true });
    wavesurfer.value.on('error', (error) => {
        emits('onplayererror', error);
    }, { passive: true });
    wavesurfer.value.on('region-click', emitRegionSelected, { passive: true });
    wavesurfer.value.on('region-update-end', onRegionUpdateEnd, { passive: true }); // When dragging or resizing is finished (also fires after adding region)
    // wavesurfer.value.on('region-removed', onRegionDeleted, { passive: true });

    window.addEventListener('keyup', handleKeyUp, { passive: true });

    loadAudio();
}

function reset() {
    selectedRegionId.value = -1;
    audioIsLoaded.value = false;
    waveFormIsLoaded.value = false;
    showTime.value = false;
    currentTime.value = '00:00';
    isPlayingRegion.value = false;
}

function loadAudio() {
    reset();
    wavesurfer.value.load(props.source);
}

onMounted(() => {
    initWavesurfer();
});

onBeforeUnmount(() => {
    wavesurfer.value?.destroy();
    window.removeEventListener('keyup', handleKeyUp);
});

watch(() => props.source, (newSource) => {
    wavesurfer.value?.load(newSource)
});

function playPlayer() {
    wavesurfer.value?.play();
}

function pausePlayer() {
    wavesurfer.value?.pause();
}

function stopPlayer() {
    wavesurfer.value?.stop();
}

//-------TIME

let lastKeypressTime = 0;

function handleKeyUp(event) {
    if (playerIsFocused.value) {
        switch(event.key) {
            case " ":
                let thisKeypressTime = new Date().getTime();
                if ( thisKeypressTime - lastKeypressTime <= 500 ) {
                    handleDoubleSpaceBar();
                    thisKeypressTime = 0;
                } else {
                    wavesurfer.value?.isPlaying() ? pausePlayer() : playPlayer();
                }
                lastKeypressTime = thisKeypressTime;
                break;

        }
    }
}

function handleDoubleSpaceBar() {
    stopPlayer();
}

function setFocusToPlayer() {
    waveformRef.value.focus();
}

function updateTimers(currenttime) {
    if (wavesurfer.value.isPlaying()) {
        const currentTimeInSeconds = Math.floor(currenttime);
        const minutes = Math.max(0, Math.floor(currentTimeInSeconds / 60));
        const seconds = String(currentTimeInSeconds % 60).padStart(2, '0');
        currentTime.value = `${minutes}:${seconds}`;
    }
}

function updateCurrentTime(event) {
    if (!wavesurfer.value.isPlaying()) {
        const waveformElement = event.currentTarget;
        const rect = waveformElement.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const duration = wavesurfer.value.getDuration();
        const _currentTime = Math.max(0, duration * offsetX / waveformElement.clientWidth);
        const minutes = Math.floor(_currentTime / 60);
        const seconds = String(Math.floor(_currentTime % 60)).padStart(2, '0');
        currentTime.value = `${minutes}:${seconds}`;
    }
}

function handleMouseMove(event) {
    updateCurrentTime(event);
}

//-----------------REGIONS

function emitRegionSelected(region) {
    lastRegionClick.value = new Date().getTime();
    // selectedRegionId.value = region.id;
    emits('onregionselected', region);
}

function onRegionUpdateEnd(region) {
    emits('onregionupdated', region);
}

function addRegion(options, addbtns = false) {
    options.color = `${options.color}99`;
    const region = wavesurfer.value.addRegion(options, { fireEvent : false });

    if (addbtns) {
        addRegionBtns(region);
    }
}

function clearRegions() {
    wavesurfer.value.clearRegions();
}

function togglePlayingRegion(region, btn) {
    removeHiglitedRegions();
    highliteRegion(region.id);
    isPlayingRegion.value = !isPlayingRegion.value;
    btn.innerHTML = isPlayingRegion.value ? '&#xF3E4' : '&#xF40A';
    isPlayingRegion.value ? region.play() : wavesurfer.value.pause();
}

function setRegionColor(regionid, color) {
    wavesurfer.value.regions.list[regionid].update({
        color: color + '99'
    });
}

function addRegionBtns(region) {
    if (!region.hasPlayButton) {
        const regionEl = region.element;
        const playButton = document.createElement('button');
        playButton.setAttribute('class', 'playregionbtn');
        playButton.setAttribute('type', 'button');
        playButton.innerHTML = '&#xF40A';
        playButton.addEventListener('click', () => {
            togglePlayingRegion(region, playButton);
        }, { passive: true });
        region.on('out', () => {
            togglePlayingRegion(region, playButton);
        }, { passive: true });
        regionEl.appendChild(playButton);
        regionEl.hasPlayButton = true;
    }
    if (!region.hasDeleteButton) {
        const regionEl = region.element;
        const deleteButton = document.createElement('button');
        deleteButton.setAttribute('type', 'button');
        deleteButton.setAttribute('class', 'deleteregionbtn');
        deleteButton.innerHTML = '&#xF1C0';
        deleteButton.addEventListener('click', onDeleteBtn, { passive: true });
        regionEl.appendChild(deleteButton);
        regionEl.hasDeleteButton = true;
    }
}

function onDeleteBtn(event) {
    event.stopPropagation();
    let _target     = event.target,
        _parent     = _target.parentElement,
        _regionid   = _parent.dataset.id;
    const _regionToBeDeleted = wavesurfer.value.regions.list[_regionid];
    emits('ondeleteregion', _regionToBeDeleted);
}

function deleteRegion(region) {
    wavesurfer.value.regions.list[region.id].remove();
    selectedRegionId.value = -1;
}

function setAllRegionPlayButtonsToPlay() {
    for (const regionid in wavesurfer.value.regions.list) {
        document.querySelector(`[data-id="${regionid}"] button.playregionbtn`).innerHTML = '&#xF40A';
    }
}

function removeHiglitedRegions() {
    for (const regionid in wavesurfer.value.regions.list) {
        wavesurfer.value.regions.list[regionid].update({
            color: wavesurfer.value.regions.list[regionid].color.slice(0, -2) + '99'
        })
    }
    selectedRegionId.value = -1;
};

function highliteRegion(regionid) {
    let _region = wavesurfer.value.regions.list[regionid];
    if (_region.color.slice(-2) == 'CC') return;
    _region.update({
        color: _region.color.slice(0, -2) + 'CC'
    });
    selectedRegionId.value = _region.id;
}

function zoomInOut(val) {
    wavesurfer.value.zoom(val);
}

defineExpose({
    playPlayer,
    pausePlayer,
    stopPlayer,
    setFocusToPlayer,
    addRegion,
    setRegionColor,
    clearRegions,
    deleteRegion,
    removeHiglitedRegions,
    highliteRegion,
    zoomInOut,
});

</script>

<template>
    <div class="wavesurferplayer" data-e2e="wavesurfer-player">
        <div class="wavesurferplayer__statetxt" v-if="!waveFormIsLoaded">Analyzing audio...</div>
        <div class="wavesurferplayer__playbtn">
            <Pause v-if="wavesurfer?.isPlaying()" @click="pausePlayer" />
            <Play v-else @click="playPlayer" />
            <div class="wavesurferplayer__time" v-if="audioIsLoaded && showTime">{{ currentTime }}</div>
        </div>
        <div class="wavesurferplayer__waveform"
        ref="waveformRef"
        @focus="playerIsFocused = true"
        @blur="playerIsFocused = false"
        tabindex="-1"
        @mousemove="handleMouseMove"
        @mouseover="showTime = true"
        @mouseout="showTime = false"
        >
            <div class="wavesurferplayer__timeline" ref="timelineRef"></div>
        </div>
    </div>
</template>

<style lang="scss">

@use "@/scss/includes/globals";
@use "@/scss/includes/functions";

.wavesurferplayer {
    display: flex;
    &__statetxt {
        position: absolute;
        font-size: 0.8rem;
        inset: 0 0 40px 0;
        line-height: 40px;
        color: globals.$color-gray40;
        text-align: center;
    }
    &__playbtn {
        display: relative;
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
        .wavesurferplayer__time {
            position: absolute;
            width: 50px;
            inset: 0 0 0 0;
            padding: 2px 4px;
            font-size: 12px;
            color: globals.$color-gray60;
            background-color: white;
            z-index: 1;
            user-select: none;
            pointer-events: none;
        }
    }
    &__waveform {
        flex: 1;
        position: relative;
        z-index: 1;
        .deleteregionbtn,
        .playregionbtn {
            position: absolute;
            top: 5px;
            left: 6px;
            width: 30px;
            height: 30px;
            text-decoration: none;
            text-align: center;
            font-family: 'Material Design Icons';
            font-size: 1.2em;
            color: globals.$color-gray30;
            cursor: pointer;
            background-color: transparent;
            border-radius: 3px;
            user-select: none;
            &:hover {
                color: globals.$color-white;
                background-color: globals.$color-secondary;
            }
        }
        .deleteregionbtn {
            color: functions.tint(globals.$color-unavailable, 30%);
            right: 6px;
            left: initial;
            &:hover {
                color: globals.$color-unavailable;
                background-color: globals.$color-gray5;
            }
        }
    }
    &__timeline {
        position: absolute;
        bottom: 0;
        width: 100%;
        z-index: 0;
        opacity: 0;
    }
}

</style>