<script lang="ts">
export default {
    name: 'CloudApp'
}
</script>
<script setup lang="ts">

/**
 *
 * Contact
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

import { useStore }             from 'vuex';
import { IPCCCCallControl }     from '../../../ipccc/js/callcontrol.js';
import { currentLocalDateTimeISO }  from '../../../use/dateFunctions';
import {
          inject,
          computed,
          ref,
onBeforeUnmount
       }                        from 'vue';

const store:object | any	= useStore(),
	toggleLoader:Function	= inject('toggleLoader'),
	pushURL	= computed(() => store.getters.getPushUrl()),
    cloudAppSrc = computed(() => pushURL.value && pushURL.value !== 'about:blank' ? pushURL.value : 'about:blank'),
	cloudAppIsLoaded = ref(false);

const cloudAppSetLoaded = _url => {
	if(_url !== 'about:blank') {
		cloudAppIsLoaded.value = true;
	} else {
		cloudAppIsLoaded.value = false;
	}
}

const coldTransferServiceNrCoin = (copiedphonenumber:string):void => {
    if(store.state.commands.TransferISN) {
        IPCCCCallControl.ColdTransfer(`*24*000#|${copiedphonenumber}`)
        .catch(error => console.error(error));
    }
};

const cloudAppMessage = (evt) => {
    if (evt.data && evt.data == "unchanged") {
        return;
    }
    else {
        // !evt.origin.startsWith('https://mxs-62.ipccc.nl') ||
        // !evt.origin.startsWith('https://coininfo.test.ipccc.nl') ||
        // !evt.origin.startsWith('https://coininfo.contactsuite.nl')
        if ( !evt.origin.startsWith(store.state.settings.coinlocation) ) {
            return;
        } else {
            const data = evt.data;
            const decoded = JSON.parse(data);
            if (decoded.channel == 'FROM_FRAME_CLOUDAPP_TRANSFERNR') {
                coldTransferServiceNrCoin(decoded.message);
                if (window.debugState) console.log('[' + currentLocalDateTimeISO() + '] transfernr', decoded.message);
            }
            if (decoded.channel == 'FROM_FRAME_CLOUDAPP_REDIRECTURL') {
                store.commit('SET_PUSH_URL', 'about:blank');
                setTimeout(() => {
                    store.commit('SET_PUSH_URL', decoded.message)
                    if (window.debugState) console.log('[' + currentLocalDateTimeISO() + '] cloudappurl', decoded.message);
                }, 200);
            }
        }
    }
}

window.addEventListener('message', cloudAppMessage, false);

onBeforeUnmount(() => {
    window.removeEventListener('message', cloudAppMessage, false);
});

toggleLoader(false);

</script>

<template>
	<section class="cloud-app-wrapper" data-e2e="cloud-app-detail">

        <header v-if="!cloudAppIsLoaded" class="cloud-app-header">
			<div class="cloud-app-header__titlebar">
				<div class="cloud-app-header__titlebar__title">{{ store.state.settings.cloudapp.title }}</div>
			</div>
		</header>

        <div :class="['cloud-app-content', { 'cloud-app-content--noheader' : cloudAppIsLoaded }]">
			<iframe id="IFrameCloudApp" ref="cloudApp" allow="clipboard-write" :src="cloudAppSrc" @load="cloudAppSetLoaded(cloudAppSrc)" v-show="cloudAppIsLoaded"></iframe>
		</div>
		<div v-if="!cloudAppIsLoaded" class="cloud-app-nocloudappcontentavailable">
			{{ store.state.settings.cloudapp.nocloudappcontentavailable }}
		</div>
	</section>
</template>

<style lang="scss" scoped>
@use "@/scss/includes/font";
@use "@/scss/includes/globals";
@use "@/scss/includes/functions" as fn;

.cloud-app-wrapper {
    width: 100%;
    padding : .5rem .5rem;
}

.cloud-app-header {
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

.cloud-app-header__titlebar {
  border-bottom: 1px solid globals.$color-gray15;
	display: flex;
	align-items: center;
}

.cloud-app-content {
    max-width: 1280px;
    margin: 0 auto;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    padding-top: calc(51px + 1rem);
    &--noheader {
        padding-top: 0;
    }
    iframe {
        width: 100%;
        height: 100%;
        border: none;
    }
  }
  .cloud-app-nocloudappcontentavailable {
    position: absolute;
    top: 131px;
    width: 100%;
    color: globals.$color-gray20;
    font-size: .8rem;
    text-align: center;
  }

</style>