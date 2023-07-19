<script lang="ts">
export default {
    name: 'TabBarLeft'
}
</script>
<script setup lang="ts">
/**
 * Tab bar with icons
 * @param {Array.<{icon:String, tabClass:String, activeClass:String, datae2e:String, disabledClass:String}>}
 *
 * @version 0.1
 * @author Erik Rosenhart
 *
 * @Note
 *
 *
 * @todo
 *
*/

import { computed, inject }   from "vue";
import {
        ChevronLeft,
        ChevronRight
        } from 'mdue';

interface Props {
  lefttabs?: object[],
  activelefttab? : number
}

const props 					= withDefaults(defineProps<Props>(), {
									lefttabs: () => [],
									activelefttab: 0
								}),
	activeTab					= computed(() => props.activelefttab),
    lineStatus					= inject('lineStatus'),
    unreadVoicemailCounter      = inject('unreadVoicemailCounter'),
	setActiveLeftTab            = inject<Function>('setActiveLeftTab'),
    setFrame:Function           = inject('setFrame'),
    getFrameClass               = inject('getFrameClass') as Function;

const handleTabClick = (index) => {
    if (index == activeTab.value) {
        if (getFrameClass().indexOf('LC') !== -1) {
            setFrame('L', 'R');
        }
    } else {
        setActiveLeftTab(index)
    }
};

</script>

<template>
  	<div v-for="(tab, index) in lefttabs" :key="index" :class="[tab.tabClass, activeTab === index && tab.activeClass]" :data-e2e="tab.datae2e" @click="handleTabClick(index)">
    	<div v-if="index == 3 && unreadVoicemailCounter > 0" class="tab-count">{{ unreadVoicemailCounter }}</div>
      	<component :is="tab.icon" :class="[{'js-rotating' : index === 0 && (lineStatus[0] || lineStatus[1])}]" />
  	</div>
    <div class="leftttab-toggler">
        <button class="leftttab-toggler__left" :disabled="getFrameClass().indexOf('LC') !== -1" data-e2e="arrow-button-left">
            <ChevronLeft @click="setFrame('L', 'L');" />
        </button>
        <button class="leftttab-toggler__right" :disabled="getFrameClass().indexOf('LM') !== -1" data-e2e="arrow-button-right">
            <ChevronRight @click="setFrame('L', 'R');" />
        </button>
    </div>
</template>

<style lang="scss" scoped>
@use "@/scss/includes/font";
@use "@/scss/includes/globals";

.tab-count {
    position: absolute;
    width: auto;
    min-width: 17px;
    height: 17px;
    line-height: 11px;
    padding: 3px;
    right: 10px;
    top: 10px;
    background-color: globals.$color-reporting;
    text-align: center;
    color: globals.$color-white;
    @include font.font-medium();
    font-size: .7rem;
    border-radius: 12px;
    z-index: 10;
}

.leftttab-toggler {
    position: absolute;
	left: 10px;
	bottom: 10px;
	z-index: 10;
}

.leftttab-toggler {
    display: flex;
    position: absolute;
	left: -1px;
	bottom: 10px;
	z-index: 10;
    width: 60px;
    justify-content: center;

    &__left,
    &__right {
        svg {
            width: 26px;
            height: 40px;
            fill: globals.$color-gray40;
            cursor: pointer;
        }
        &:disabled {
            svg {
                pointer-events: none;
                fill: globals.$color-gray20;
            }
        }
    }
    &__left svg {
        margin-right: 1px;
        border-right: 1px solid globals.$color-gray20;
    }
}

</style>