<script lang="ts">
export default {
    name: 'SetDeviceMenu'
}
</script>
<script setup lang="ts">

import { useStore }                 from 'vuex';
import { ref, inject }              from 'vue';
import { useSetDevice }             from '../../use/setDeviceFunction';
import { useDeviceRequirements }	from '../../use/useDeviceRequirements';

const store:object | any		= useStore(),
	menuoptions					= ref(null),
	setDeviceFn					= useSetDevice(),
	useDeviceRequirementsFn		= useDeviceRequirements(),
	closeAllSubs:Function		= inject('closeAllSubs');

const openMenu = ():void => {
	closeAllSubs();
	menuoptions.value.classList.toggle('menu-options--open');
}

const closeOptions = ():void => {
	menuoptions.value.classList.remove('menu-options--open');
}

defineExpose({closeOptions});

const changeDevice = (evt:Event):void => {
	let _deviceName = evt.target.getAttribute('data-value');
	let _selObj = store.getters.getDeviceList().filter(obj => obj.Name === _deviceName);

	if(_selObj.length > 0) {
		//Check selected device for requirements
		useDeviceRequirementsFn.validateDevice(_selObj[0])
		.then((enabled) => {
			if(enabled) {
				setDeviceFn.setDevice(_selObj[0]);
			} else {
				return;
			}
		});
	} else {
		if(_deviceName) console.error('Error: unknown device: ', _deviceName);
	}
}

</script>

<template>
	<div class="menu-label" @click.stop="openMenu()" data-e2e="device-open">{{ store.getters.getCurrentDeviceName() }}</div>
	<div class="menu-options" @click="changeDevice($event)" ref="menuoptions" data-e2e="device-menu-options">
		<div v-for="device in store.getters.getDeviceList()"
            :class="['menu__item', {'menu__item--disabled' : (device.Name == 'Geen toestel' || device.Address === 'free')}]"
            :key="device.Name"
            :data-value="device.Name"
        >
			{{ device.Name }}
		</div>
	</div>
</template>

<style lang="scss" scoped>

@use "@/scss/includes/globals";
@use "@/scss/includes/font";
@use "@/scss/includes/functions";

.menu-label {
    @include font.font-medium();
    user-select: none;
    cursor: default;
    margin: 0 0 0 -10px;
    width: calc(100% + 20px);
    color: globals.$color-gray90;
    &:hover {
    	background-color: globals.$color-gray5;
    }
}
.menu-options {
    position: absolute;
    right: 100%;
    top: 0;
    width: auto;
    min-width: 180px;
    height: calc(25vh - 20px);
    overflow-y: auto;
    overflow-x: hidden;
    background-color: globals.$color-white;
    box-shadow: 0 0 14px 0 rgba(0,0,0,.3);
    display : none;
    &--open {
    	display: block;
    }
}

.menu__item {
    width: 240px;
    padding: 0 15px;
    color: globals.$color-gray50;
    cursor: default;
    user-select: none;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    &--disabled {
        pointer-events: none;
        color: globals.$color-gray35;
        background-color: globals.$color-gray10;
    }
    &:hover {
    	background-color: globals.$color-gray5;
    }
}

</style>