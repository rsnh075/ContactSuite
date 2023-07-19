<script lang="ts">
export default {
    name: 'BulkLoader',
}
</script>

<script setup lang="ts">
import { ref } from '@vue/reactivity';
import { watch } from '@vue/runtime-core';
import { computed } from '@vue/runtime-core';
import { useStore } from 'vuex';

const props = defineProps({
    visibility : {
        type : Boolean,
        default : false
    },
    header : {
        type : String,
        default : ''
    },
    message : {
        type : String,
        default : ''
    },
    currentcount : {
        type : Number,
        default : 0
    },
    maxcount : {
        type : Number,
        default : 0
    }
});

const   store = useStore(),
        theBar = ref(null),
        barwidth = ref('right:0%');

watch(() => props.currentcount, (newVal, oldVal) => {
    barwidth.value = `right:${(props.maxcount > 0 ? (100 - ((newVal/props.maxcount) * 100)) : 100)}%`;
});

const cancelImport = () => {
    store.commit('SET_BULKIMPORT', false);
};

</script>

<template>
    <div>
        <div :class="['modal', {'modal--visable' : visibility}]"></div>
        <div :class="['panel', {'panel--visable' : visibility}]">
            <header class="panel__header"><span class="panel__header-icon">&#xF010;</span>{{ header }}</header>
            <div class="panel__body">
                {{ store.state.settings.usermanagement.loadingmsg[0] }}
                <a @click="cancelImport()">
                {{ store.state.settings.usermanagement.loadingmsg[1] }}
                </a>
                {{ store.state.settings.usermanagement.loadingmsg[2] }}
                <div class="processBarBack">
                    <div class="processBar" ref="bar" :style="barwidth"></div>
                </div>
                <span>{{ store.state.settings.usermanagement.countlbl[0] }} {{ currentcount }} {{ store.state.settings.usermanagement.countlbl[1] }} {{ maxcount }}</span>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>

@use "@/scss/includes/functions";
@use "@/scss/includes/globals";

.modal {
    position: absolute;
    top: -20px;
    right: 0;
    bottom: calc(100% + 20px);
    left: 0;
    background-color: rgba(255, 255, 255, 0.85);
    display: none;
    z-index: 900000000;
    &--visable {
        top: 0;
        bottom: 0;
        display: block;
    }
}

.panel {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 520px;
    min-height: 300px;
    //background-color: globals.$color-white;
    //box-shadow: 0 0 20px 0 rgba(0,0,0,.3);
    //border-radius: 3px;
    display: none;
    z-index: 900000100;
    &--visable {
        display: block;
    }
}

.panel__header {
    position: relative;
    padding: 0 15px;
    height: 45px;
    line-height: 45px;
    color: globals.$color-gray80;
    //background-color: globals.$color-gray2;
    font-size: 1.4em;
    &:after {
        content: '';
        position: absolute;
        left: 15px;
        right: 15px;
        bottom: 0;
        height: 1px;
        background-color: globals.$color-gray40;
    }
}

.panel__header-icon {
    float: left;
    display: block;
    height: 45px;
    line-height: 45px;
    font-family: 'Material Design Icons';
    font-size: 1.6em;
    margin-right: 10px;
    margin-left: 5px;
    color: globals.$color-settings;
}

.panel__body {
    padding: 30px 25px;
    width: 100%;
    font-size: 1em;
    line-height: 1.5;
    a {
        text-decoration: underline;
        color: globals.$color-unavailable;
        cursor: pointer;
    }
}

.panel__body span {
    text-align: center;
    margin: 0 auto;
}

.processBarBack {
    position: relative;
    height: 6px;
    border-radius: 3px;
    background-color: globals.$color-gray10;
    margin: 35px -5px 10px -5px;
    box-shadow: inset 0 1px 1px 0 rgba(0,0,0,.3);
}

.processBar {
    position: absolute;
    top: 0;
    left: 0;
    height: 6px;
    border-radius: 3px;
    background-color: globals.$color-settings;
    transition: right .5s ease-out;
    box-shadow: inset 0 -1px 2px 0 rgba(0,0,0,.4),
                inset 0 2px 2px 0 rgba(255,255,255,.5),
                0 2px 4px 0 rgba(0,0,0,.4);
}

</style>
