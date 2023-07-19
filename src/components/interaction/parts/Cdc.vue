<script lang="ts">
export default {
    name: 'Cdc'
}
</script>
<script setup lang="ts">
/**
 *
 * Call Disposition Codes / Call reasons
 *
 *
 * @project ContactSuite
 * @version 1.0
 * @author Eric Vergunst
 * @copyright 2021
 * @licence MIT
 *
 * @date 10-12-2021
 * @modified 23-12-2021
 *
 * @todo
 *
 */

import { computed, inject, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { CDC }   from '../../../ipccc/js/cdc.js';
import { LineInfo } from '../../../types/LineInfo';

const toggleLoader = inject('toggleLoader') as Function,
	setActiveRightTab = inject('setActiveRightTab') as Function,
    lastInboundLineInfo	= inject('lastInboundLineInfo') as any,
	store:object | any = useStore(),
	reasons = ref(null),
	categoryIx = ref(-1),
	subCategoryIx = ref(-1),
	reasonIx = ref(-1),
	cdcEnabled = computed(() => lastInboundLineInfo.value.useCDC),
    recordingId = ref(''),
    cdcData = ref({});

toggleLoader(false);

const cancelFn = () => {
    console.log('pressed cancel');
    save();
}

const okFn = () => {
    console.log('pressed OK');
}

const resetCdc = () => {
    reasons.value = null;
    categoryIx.value = -1;
    subCategoryIx.value = -1;
    reasonIx.value = -1;
    recordingId.value = '';
    cdcData.value = {};
    toggleLoader(false);
}

const save = () => {
    toggleLoader(true);
    if (window.debugState) console.log('cdc recordingId:', recordingId.value);
    CDC.SetCDC(recordingId.value,
                    reasons.value[categoryIx.value],
                    reasons.value[categoryIx.value].SubCategories[subCategoryIx.value],
                    reasons.value[categoryIx.value].SubCategories[subCategoryIx.value].Reasons[reasonIx.value])
    //Don't wait for result, just go on with it
    resetCdc();
}

const choices = computed(() => {
    if(reasonIx.value > -1 || reasons.value === null) {
        // we're done, don't show anything at all
        return;
    }

    if(subCategoryIx.value > -1) {
        return reasons.value[categoryIx.value].SubCategories[subCategoryIx.value].Reasons.map(r => r.Description);
    }

    if(categoryIx.value > -1) {
        return reasons.value[categoryIx.value].SubCategories.map(s => s.Name);
    }

    // Categories
    return reasons.value.map(c => c.Name);
});

function setChoice(ix: number) {
    if(subCategoryIx.value > -1) {
        reasonIx.value = ix;
    } else if (categoryIx.value > -1) {
        subCategoryIx.value = ix;
    } else {
        categoryIx.value = ix;
    }
}

function back() {
    if (reasonIx.value > -1) {
        reasonIx.value = -1;
    } else if (subCategoryIx.value > -1) {
        subCategoryIx.value = -1;
    } else if (categoryIx.value > -1) {
        categoryIx.value = -1;
    }
}

const noRecording = "00000000-0000-0000-0000-000000000000";
const AgentEventType =
{
    None: 0,
    Answer: 1,
    Hangup: 2,
};
const CallType =
{
    Unknown: 0,
    PBX: 1,
    ServiceNumber: 2,
};

const getReasons = () => {
    toggleLoader(false);
    CDC.GetContactReasons()
    .then(r => {
        cdcData.value = r;
        reasons.value = r;
        toggleLoader(false);
    })
    .catch(error => {
        console.error('Error: ', error);
        toggleLoader(false);
    });
}

watch(store.getters.getAgentEvent, evt => {
    switch(evt.EventType) {
        case AgentEventType.Answer:
            if(evt.CallType === CallType.ServiceNumber && evt.RecordingId !== noRecording) {
                resetCdc();
                recordingId.value = evt.RecordingId;
                getReasons();
            }
            break;
        case AgentEventType.Hangup:
            Object.keys(cdcData.value).length > 0 ? cdcEnabled.value = true : cdcEnabled.value = false;
            break;
        default:
            break;
    }
});

const getNextTabToInit = () => {
    if(store.getters.getPermission('GespreksNotities')) return 2;
    return -1;
}

onMounted(() => {
    if(getNextTabToInit() !== -1) {
        setActiveRightTab(getNextTabToInit());
    }
    toggleLoader(false);
});

</script>

<template>
	<section class="cdc-wrapper" data-e2e="cdc">

        <header class="cdc-header">
            <div class="cdc-header__titlebar">
                <div class="cdc-header__titlebar__title">{{ store.state.settings.cdc.title }}</div>
            </div>
        </header>

		<div v-show="cdcEnabled" class="button-wrapper">
			<div class="choice-wrapper" v-if="subCategoryIx === -1">
				<a v-for="(choice, index) in choices" :key="index" class="choice" @click="setChoice(index)">
					<span>{{choice}}</span>
				</a>
			</div>
			<ul v-if="subCategoryIx > -1" class="reasons">
				<li v-for="(choice, index) in choices" :key="index" class="reason choice" @click="setChoice(index)">{{choice}}</li>
			</ul>
		</div>
		<div class="result-wrapper" v-if="Object.keys(cdcData).length > 0">
			<button type="button" class="button-primary button-primary--gray back" @click="back">{{store.state.settings.cdc.back}}</button>
			<div v-if="categoryIx > -1">1. {{reasons[categoryIx].Name}}</div>
			<div v-if="subCategoryIx > -1">2. {{reasons[categoryIx].SubCategories[subCategoryIx].Name}}</div>
			<div v-if="reasonIx > -1">{{reasons[categoryIx].SubCategories[subCategoryIx].Reasons[reasonIx].Description}}</div><br>
			<button type="button" class="button-primary" v-if="reasonIx > -1" @click="save">save</button>
		</div>
		<div v-if="Object.keys(cdcData).length == 0" class="cdc-noagenteventavailable">
		{{ store.state.settings.cdc.noagenteventavailable }}
		</div>
	</section>
</template>

<style lang="scss" scoped>
@use "@/scss/includes/font";
@use "@/scss/includes/globals";
@use "@/scss/includes/mixins";

.cdc-wrapper {
    width: 100%;
    padding : .5rem;
    font-size: 0.9rem;
}

.cdc-header {
    line-height: 50px;
    font-size: 1.1rem;
    font-family: 'Open Sans SemiBold', sans-serif;
    // overflow: hidden;
    min-width: 400px;
    max-width: 1280px;
    margin: 0 auto;
    color: globals.$color-gray60;
    position: relative;
}

.cdc-header__titlebar {
    border-bottom: 1px solid globals.$color-gray15;
	display: flex;
	align-items: center;
}

.button-wrapper {
    margin: 0 auto;
    padding: 20px 0 0 0;
    min-width: 400px;
    max-width: 1280px;
}

.choice-wrapper,
.reasons {
	max-width: 1280px;
	margin: 0 auto;
	display: grid;
    grid-template-columns: repeat(1, 1fr);
	@media #{globals.$media_XL} {
		grid-template-columns: repeat(2, 1fr);
	}
	grid-auto-rows: auto;
	gap: 1rem;
    .choice {
        padding: 10px 20px 10px 20px;
        line-height: 25px;
        background-color: #FFF;
        border-radius: 3px;
        box-shadow: 0 0 3px 0 rgb(0 0 0 / 6%);
        border: 1px solid globals.$color-gray5;
        // max-width: 450px;
        min-width: 200px;
        overflow: hidden;
		text-overflow: ellipsis;
        cursor: pointer;
}
    .choice:hover {
        border-color: #e2e2e2;
        background: #f2f2f2;
    }
}
.result-wrapper {
    margin: 0 auto;
    min-width: 400px;
    max-width: 1280px;
    .back {
        display: inline-block;
    }
    & > div,
    & > button {
        margin-top: 15px;
    }
}

.nav-back {
    height: 40px;
}
.result-wrapper {
    margin-top: 10px;
    padding-left: 10px;
}
.result-wrapper div {
    font-weight: 500;
}
.cdc-noagenteventavailable {
    position: absolute;
    top: 131px;
    width: 100%;
    color: globals.$color-gray20;
    font-size: .8rem;
    text-align: center;
}

</style>