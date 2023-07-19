<script lang="ts">
export default {
    name: 'TabBarRight'
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
 * setActiveRightTab once per inbound call case
 * Priority: Gespreksnotities, CloudApp URL, Call Reasons(CDC), Case Management(outbound sales)
 *
 * @todo
 *
*/

import { computed, inject, nextTick, reactive, ref, watch }   from "vue";
import { useStore }	from 'vuex';
import {
        AlertCircle,
        Circle,
        ChevronLeft,
        ChevronRight
        } from 'mdue';
import { LineInfo } from "../../../types/LineInfo";

//index is used as tabidentifier, change when tab order changes!!
const tabPrios = {
	'Cm' : 0, //Casemanagement
	'Cdc' : 1, //Call Reasons (Call Disposition Codes)
	'Notes' : 3, //Gespreksnotities
	'Cloudapp' : 2 //CloudApp URL
};

const	props 				= defineProps(['righttabs', 'activerighttab', 'disabledrighttabs']),
		store				= useStore(),
        setFrame:Function   = inject('setFrame'),
        getFrameClass       = inject('getFrameClass') as Function,
		activeTab			= computed(() => props.activerighttab),
		setActiveRightTab	= inject<Function>('setActiveRightTab'),
		lastInboundLineInfo	= inject('lastInboundLineInfo') as LineInfo,
		lastInboundCaseId	= ref(-1),

		indicatorNote       = computed(() => store.state.unsavedNote.NoteId > 0),
		activeIndicators	= ref([]),
		indicatorCm			= computed(() => activeIndicators.value.includes(0)),
		indicatorCdc		= computed(() => activeIndicators.value.includes(1)),
		indicatorPushUrl	= computed(() => activeIndicators.value.includes(3)),
		higestTabPrio       = ref(-1);

const resetTabs = () => {
	higestTabPrio.value = -1;
	activeIndicators.value = [];
	lastInboundCaseId.value = lastInboundLineInfo.value.caseId;
}

watch(() => lastInboundLineInfo.value, (newVal, oldVal) => {
	if(lastInboundLineInfo.value.index > -1) {
		if(newVal.caseId !== lastInboundCaseId.value) {
			//new inbound call detected
			resetTabs();
		}
		setHigestTabPrio();
		setActiveIndicators();
	}
});

watch(() => activeTab.value, (newVal, oldVal) => {
	if(activeIndicators.value.includes(newVal)) {
		let _indx = activeIndicators.value.indexOf(newVal);
		if (_indx !== -1) {
			activeIndicators.value.splice(_indx, 1);
		}
	}
});

const setHigestTabPrio = () => {
	let _tabIndex = -1,
		_highestTabPrio = -1,
		_tabPrios = Object.keys(tabPrios);

	_tabPrios.forEach((tab, index) => {
		switch(tab) {
			case 'Cdc':
				if(tabPrios.Cdc > _highestTabPrio && lastInboundLineInfo.value.useCDC) {
					_highestTabPrio = tabPrios.Cdc;
					_tabIndex = index;
				}
				break;
			case 'Cloudapp':
				if(tabPrios.Cloudapp > _highestTabPrio && lastInboundLineInfo.value.pushUrl !== 'about:blank') {
					_highestTabPrio = tabPrios.Cloudapp;
					_tabIndex = index;
				}
				break;
			case 'Notes':
				if(tabPrios.Notes > _highestTabPrio && lastInboundLineInfo.value.showConversationNote) {
					_highestTabPrio = tabPrios.Notes;
					_tabIndex = index;
				}
				break;
		}
	});

	if(_highestTabPrio !== -1 && _highestTabPrio > higestTabPrio.value) {
		higestTabPrio.value = _highestTabPrio;
		setActiveRightTab(_tabIndex);
		//fix for tab that was active and should have an indicator after the setActiveRightTab() to new tab
		nextTick(() => {
			setActiveIndicators();
		})
	}
};

const setActiveIndicators = () => {
	//ONLY FOR CDC AND CLOUDAPP, showConversationNote has its own meganism
	if(lastInboundLineInfo.value.useCDC && !activeIndicators.value.includes(1) && activeTab.value !== 1) {
		activeIndicators.value.push(1);
	}

	if(lastInboundLineInfo.value.pushUrl !== 'about:blank' && !activeIndicators.value.includes(3) && activeTab.value !== 3) {
		activeIndicators.value.push(3);
	}
};

const handleTabClick = (index) => {
    if (index == activeTab.value) {
        if (getFrameClass().indexOf('RC') !== -1) {
            setFrame('R', 'L');
        }
    } else {
        setActiveRightTab(index)
    }
};

</script>

<template>
	<div v-for="(tab, index) in righttabs" :key="index"
		:data-e2e="tab.datae2e"
		:class="[tab.tabClass, activeTab === index && tab.activeClass, disabledrighttabs[index][tab.permission].disabled && tab.disabledClass]"
		v-show="
			(tab.permission !== 'CloudApp' && !disabledrighttabs[index][tab.permission].disabled) ||
			(tab.permission == 'CloudApp' && lastInboundLineInfo.pushUrl !== 'about:blank')
		"
		@click="handleTabClick(index)
	">
		<component :is="tab.icon" />
		<AlertCircle
			v-if="
				(indicatorNote && index == 2) ||
				(indicatorPushUrl && index == 3) ||
				(indicatorCdc && index == 1)
			"
			class="indicator" />
	</div>
    <div class="righttab-toggler">
        <button class="righttab-toggler__left" :disabled="getFrameClass().indexOf('RM') !== -1" data-e2e="arrow-button-left">
            <ChevronLeft @click="setFrame('R', 'L');" />
        </button>
        <button class="righttab-toggler__right" :disabled="getFrameClass().indexOf('RC') !== -1" data-e2e="arrow-button-right">
            <ChevronRight @click="setFrame('R', 'R');" />
        </button>
    </div>
</template>


<style lang="scss" scoped>

@use "@/scss/includes/font";
@use "@/scss/includes/globals";

svg.indicator {
	left: 28px;
	top: 8px;
	fill: globals.$color-reporting !important;
	margin: 0;
	width: 22px;
	height: 22px;
}

.righttab-toggler {
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