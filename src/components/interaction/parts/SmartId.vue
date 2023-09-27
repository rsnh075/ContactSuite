<script lang="ts">
export default {
    name: 'SmartId'
}
</script>
<script setup lang="ts">

/**
 * Discarded!!! Is now transfered to LeftLane
 * Keep in repo, it might come back
 *
 * Smart id: call info for agent
 * Contains inbound call data, Asr-data, Call-me-now-data
 *
 *
 * @project ContactSuite
 * @version 1.0
 * @author Erik Rosenhart
 * @copyright 2017
 * @licence MIT
 *
 * @date 10-12-2021
 * @modified
 *
 * @todo
 *
 */

import { useStore } from 'vuex';
import { inject, computed, ref, watch, Ref } from 'vue';
import { ISOdateTimetoTime, ISOdateTimetoDate } from '../../../use/dateFunctions';
import { LineInfo } from '../../../types/LineInfo';

const store:object | any                    = useStore(),
	toggleLoader:Function                   = inject('toggleLoader'),
	lastInboundLineInfo:Ref<LineInfo>       = inject('lastInboundLineInfo'),
	nvpData					                = computed(() => lastInboundLineInfo.value.nvpData),
	hasNvpData                              = computed(() => nvpData.value.length > 0),
	hasLastInboundLineInfo                  = computed(() => lastInboundLineInfo.value.index > -1),
	startAgentCall                          = ref('');

watch(() => hasNvpData.value, (newVal:boolean, oldVal) => {
	if(newVal) {
		setStartAgentCall();
	}
});

const testIsValueUrl = val => {
	return val.startsWith('https');
}

const openUrl = url => {
	window.open(url);
}

const setStartAgentCall = () => {
	let _dateISO = new Date(),
		_date,
		_time;
	_date = ISOdateTimetoDate(_dateISO);
	_time = ISOdateTimetoTime(_dateISO);
	startAgentCall.value = _date + ' ' + store.state.settings.smartid.datetimedivider + ' ' + _time;
}

toggleLoader(false);

</script>

<template>
	<section class="smart-id-wrapper" data-e2e="smart-id">

		<header v-if="hasLastInboundLineInfo" class="smart-id-header">
			<div class="smart-id-header__icon">&#xF120;</div>
			<div class="smart-id-header__number">{{ lastInboundLineInfo.number }}</div>
			<div v-show="lastInboundLineInfo.name !== ''" class="smart-id-header__callgroup">{{ lastInboundLineInfo.name }}</div>
			<div v-if="hasNvpData" class="smart-id-inforow">
				<span class="smart-id-inforow__label">{{ store.state.settings.smartid.date }}</span>
				<span class="smart-id-inforow__text">{{ startAgentCall }}</span>
			</div>
		</header>

		<div v-if="hasNvpData" class="smart-id__title">{{ store.state.settings.smartid.headerbodylabel }}</div>

		<section v-if="hasNvpData" class="grid-row">
			<div v-for="listitem in nvpData" class="smart-id-inforow" :key="listitem.Index">
				<span class="smart-id-inforow__header">{{ listitem.Name }}</span>
				<span v-for="(tuple, index) in listitem.Tuples" class="smart-id-inforow__tuple" :key="index">
					<span class="smart-id-inforow__label">{{ tuple.Name }}</span>
					<span v-if="testIsValueUrl(tuple.Value)" class="smart-id-inforow__text smart-id-inforow__text--link" @click.stop="openUrl(tuple.Value)">{{ tuple.Value }}</span>
					<span v-else class="smart-id-inforow__text">{{ tuple.Value }}</span>
				</span>
			</div>
		</section>

		<div v-if="lastInboundLineInfo.index == -1" class="smart-id-nocalldataavailable">
			{{ store.state.settings.smartid.nocalldataavailable }}
		</div>
	</section>
</template>

<style lang="scss" scoped>
@use "@/scss/includes/font";
@use "@/scss/includes/globals";
@use "@/scss/includes/functions" as fn;

.smart-id-wrapper {
    width: 100%;
    padding : .5rem .5rem;
	overflow-y: auto;
	height: 100%;
}

.smart-id-header {
    padding-bottom: 10px;
    text-align: center;
    font-family: 'Open Sans SemiBold', sans-serif;
    overflow: hidden;
    min-width: 400px;
    &__icon {
		padding: 20px 0 10px 0;
		font-size: 4rem;
		color: globals.$color-gray30;
		font-family: 'Material Design Icons';
		font-weight: normal;
		font-style: normal;
    }
    &__number {
		padding: 0 0 5px 0;
		font-size: 1.1rem;
		color: globals.$color-gray75;
		font-family: 'Open Sans Bold', sans-serif;
    }
    &__callgroup {
		color: globals.$color-gray75;
		&:before {
			content: '\F2CE';
			padding: 0 5px 0 0;
			font-size: 1rem;
			color: globals.$color-gray20;
			font-family: 'Material Design Icons';
			font-weight: normal;
			font-style: normal;
		}
    }
}

.smart-id__title {
    margin-bottom: 15px;
    padding: 10px 0 0 3px;
    font-family: 'Open Sans SemiBold', sans-serif;
    line-height: 30px;
    font-size: 1rem;
    color: globals.$color-gray75;
    border-bottom: 1px solid globals.$color-gray15;
}

.smart-id-inforow {
    display: flex;
    flex-wrap: wrap;
    padding: 0 0 7px 0;
    min-height: 25px;
    line-height: 25px;
    font-size: .9rem;
    word-break: break-word;
	&__header {
		flex: 1 0 100%;
		padding: 0 12px;
		font-family: 'Open Sans Bold', sans-serif;
		color: globals.$color-gray80;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
    }
    &__tuple {
		display: flex;
		flex: 1 0 100%;
		max-width: 100%;
    }
    &__label {
		width: 30%;
		padding: 0 12px;
		font-family: 'Open Sans SemiBold', sans-serif;
		color: globals.$color-gray80;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		flex: 1 0 auto;
    }
    &__text {
		width: 70%;
		padding: 0 12px;
		color: globals.$color-gray60;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		flex: 1 0 auto;
      	&--link {
			cursor: pointer;
			text-decoration: underline;
			color: globals.$color-blue;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			flex: 1 0 auto;
      	}
  	}
}

.smart-id-nocalldataavailable {
	position: absolute;
    top: 80px;
    width: 100%;
    color: globals.$color-gray20;
    font-size: .8rem;
    text-align: center;
}

</style>