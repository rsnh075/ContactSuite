<script lang="ts">
export default {
    name: 'DeviceWidget'
}
</script>
<script setup lang="ts">

/**
 *
 * Device switch
 *
 *
 * @project ContactSuite
 * @version 1.0
 * @author Erik Rosenhart
 * @copyright 2017
 * @licence MIT
 *
 * @date 06-12-2021
 * @modified
 *
 * @todo
 *
 */

import { ref, inject, defineComponent, computed, onMounted, watch }	from 'vue';
import { useStore }					from 'vuex';
import { useSetDevice }				from '../../../use/setDeviceFunction';
import { useDeviceRequirements }	from '../../../use/useDeviceRequirements';

const store:object | any		= useStore(),
	setDeviceFn					= useSetDevice(),
	useDeviceRequirementsFn		= useDeviceRequirements(),
	selectedDeviceName			= ref(''),
	currentSelectedDeviceName	= computed(() => store.state.currentDeviceName);

watch(() => currentSelectedDeviceName.value, (newVal, oldVal) => {
	selectedDeviceName.value = newVal;
})

const changeDevice = (evt:Event):void => {
	let _deviceName = evt.target.value,
		_selObj = store.getters.getDeviceList().filter(device => device.Name === _deviceName);

	if(_selObj.length > 0) {
		//Check selected device for requirements
		useDeviceRequirementsFn.validateDevice(_selObj[0])
		.then((enabled) => {
			if(enabled) {
				setDeviceFn.setDevice(_selObj[0]);
			} else {
				//setPreviousdeviceName
				selectedDeviceName.value = currentSelectedDeviceName.value;
				return;
			}
		});
	} else {
		console.error('Error: unknown device: ', _deviceName);
	}
};

onMounted(() => {
	selectedDeviceName.value = currentSelectedDeviceName.value;
})

</script>

<template>
	<div class="widget widget--settings widget__identity form-selectfield" data-e2e="widget-device">
		<label>{{ store.state.settings.settingsPannel.phonenumberlabel }}</label>
		<select v-model="selectedDeviceName" @change="changeDevice($event)" data-e2e="widget-device-select">
			<option v-for="device in store.getters.getDeviceList()"
				:key="device.Name" :value="device.Name"
				:disabled="device.Name === 'Geen toestel' || device.Address === 'free'"
			>{{ device.Name }}</option>
		</select>
	</div>
</template>

<style lang="scss" scoped>

  @use "@/scss/includes/font";
  @use "@/scss/includes/globals";
  @use "@/scss/includes/functions";

  .widget {
    width: 100%;
    label {
      width: 100%;
      padding-left: 3px;
      font-size: .85em;
      color: globals.$color-gray40;
    }
    select {
      width: 100%;
      margin-top: 0;
      border: none;
    }
    &:before {
      top: calc(50% + 12px);
      left: calc(100% - 34px);
    }
  }

</style>
