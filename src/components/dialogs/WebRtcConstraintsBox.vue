<script lang="ts">
export default {
    name: 'WebRtcConstraintsBox'
}
</script>
<script setup lang="ts">
/**
 * 
 * webphone requirements dialog
 * 
 */

import { useStore } from 'vuex';
import { Lock, Microphone, Bell } from 'mdue';
import { ref } from '@vue/reactivity';
import { watch } from '@vue/runtime-core';
import ToggleField from '../uielements/ToggleField.vue';

const store = useStore();
const props = defineProps(['visible']);
const emits = defineEmits(['onConfirm']);

const isVisible = ref(false);

const hidebox = () => {
    isVisible.value = false;
    emits('onConfirm', false);
}

watch(() => props.visible, (newVal, oldVal) => {
    if(newVal) {
        isVisible.value = newVal
    } 
}, {immediate:true})

</script>

<template >
    <teleport to="#webrtcconstraintsbox" v-if="isVisible">
        <section class="webrtc-constraints-wrapper" data-e2e="web-rtcconstraints-box">
            <h2>{{ store.state.settings.webrtcconstraintsbox.headertxt }}</h2>
            <div class="webrtc-constraints-body">{{ store.state.settings.webrtcconstraintsbox.bodytxt }}</div>
            <div class="webrtc-constraints-step">
                <span>{{ store.state.settings.webrtcconstraintsbox.step[0] }}</span>
                <Lock class="webrtc-constraints-lock" />
            </div>
            <div class="webrtc-constraints-step">
                <span>{{ store.state.settings.webrtcconstraintsbox.step[1] }}</span>
                <ToggleField :modelValue="true" class="webrtc-constraints-togglefield" />
                <Microphone class="webrtc-constraints-microphone" />
            </div>
            <div class="webrtc-constraints-step">
                <span>{{ store.state.settings.webrtcconstraintsbox.step[2] }}</span>
                <ToggleField :modelValue="true" class="webrtc-constraints-togglefield" />
                <Bell class="webrtc-constraints-bell" />
            </div>
            <button type="button" class="webrtc-constraints-okaybtn" @click="hidebox()">{{ store.state.settings.webrtcconstraintsbox.okaybtnlbl }}</button>
        </section>
    </teleport>    
</template>

<style scoped lang="scss">

@use "@/scss/includes/globals";
@use "@/scss/includes/font";
.webrtc-constraints-wrapper {
    position: fixed;
    top: 10px;
    left: 110px;
    width: 250px;
    height: auto;
    z-index: 10000;
    background-color: globals.$color-white;
    box-shadow: 0 0 20px 0 rgba(0, 0, 0,.3);
    border-radius: 10px;
    padding: 15px 10px;
    &:before {
        position: absolute;
        left: 20px;
        bottom: 100%;
        border: 10px solid transparent;
        border-bottom-color: globals.$color-white;
        border-top-color: transparent;
        content: "";
        width: 0;
        height: 0;
        pointer-events: none;
        z-index: 1;

    }
    h2 {
        padding-bottom: 8px;
        margin-bottom: 8px;
        border-bottom: 1px solid globals.$color-gray20;
        color: globals.$color-gray80;
        font-size: 1.2rem;
    }
    .webrtc-constraints-body {
        color: globals.$color-gray80;
        @include font.font-normal();
        font-size: 0.9rem;
        line-height: initial;
    }
    .webrtc-constraints-step {
        background-color: globals.$color-gray7;
        border-radius: 20px;
        width: 100%;
        padding: 0 15px;
        height: 34px;
        margin-top: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        @include font.font-normal();
        font-size: 0.85rem;
        overflow: hidden;
    }
    .webrtc-constraints-lock,
    .webrtc-constraints-microphone,
    .webrtc-constraints-bell {
        width: 18px;
        height: 18px;
    }

    .webrtc-constraints-okaybtn {
        display: block;
        margin: 20px auto 5px;
        background-color: globals.$color-gray3;
        border-radius: 5px;
        padding: 5px 20px;
        width: 100px;
        @include font.font-normal();
        font-size: 1rem;
        cursor: pointer;
        &:hover {
            background-color: globals.$color-gray5;
        }
    }
}

</style>
