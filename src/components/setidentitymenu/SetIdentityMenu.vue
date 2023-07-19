<script lang="ts">
export default {
    name: 'SetIdentityMenu'
}
</script>
<script setup lang="ts">

import { useStore }             from 'vuex';
import { ref, inject }          from 'vue';
import { IPCCCCallControl }     from '../../ipccc/js/callcontrol';

const store:object | any		= useStore(),
    menuoptions					= ref(null),
    closeAllSubs:Function		= inject('closeAllSubs');

const openMenu = ():void => {
    closeAllSubs();
    menuoptions.value.classList.toggle('menu-options--open');
}

const closeOptions = ():void => {
    menuoptions.value.classList.remove('menu-options--open');
}

defineExpose({closeOptions});
      
const setIdentity = (evt:{target: Element}):void => {
	let currentIdentityId = parseInt(evt.target.getAttribute('data-value'));

    IPCCCCallControl.SetOutboundIdentity(currentIdentityId)
    .then(_ => {
        store.commit('SET_CURRENT_IDENTITY', currentIdentityId);
    })
    .catch(error => {
        console.error(error);
    });
}
</script>

<template>
	<div class="menu-label" @click.stop="openMenu($event)" data-e2e="identity-open">{{ store.state.currentIdentity }}</div>
	<div class="menu-options" @click="setIdentity($event)" ref="menuoptions" data-e2e="identity-options">
		<div v-for="identity in store.state.loginSession.Details.OutboundIdentities" class="menu__item" :key="identity.Id" :data-value="identity.Id">
			{{ identity.Name }}
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
    width: 240px;
    min-width: 200px;
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
    cursor: default;
    user-select: none;
    color: globals.$color-gray50;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    &:hover {
    	background-color: globals.$color-gray5;
    }
}

</style>