<script lang="ts">
export default {
    name: 'MainScreen'
}
</script>
<script setup lang="ts">

import { useStore }           from 'vuex';
import { useRouter }          from 'vue-router';
import AppHeader              from "./AppHeader.vue";
import AppAside               from "./AppAside.vue";
import AppBody                from "./AppBody.vue";
import Home                   from "./../home/Home.vue";
import { onMounted,
        ref,
        provide,
        inject,
        watch }              from "vue";
import BoxProps, { ModalType } from '../../types/BoxProps';
import { IPCCCCallControl } from '../../ipccc/js/callcontrol';
import { IPCCCUserSettings } from '../../ipccc/js/usersettings';
import { computed } from '@vue/reactivity';


const store:object | any   = useStore(),
    router                 = useRouter(),
    menuOpen               = ref<boolean>(true),
    mainmenuIndex          = ref(),
    sidemenuIndex          = ref(-1),
    sidesubmenuIndex       = ref(-1),
    sidemenuIndexObj       = computed(() => {
        return {'sideMenuIx': sidemenuIndex.value, 'sideSubmenuIx': sidesubmenuIndex.value}
    }),
    asideVisible           = ref<boolean>(true),
    path                   = ref({
                                start     : [0,0],
                                controls  : [0,0,0,0],
                                end       : [0,0]
                            }),
    showModalDialog:Function    = inject('showModalDialog');

// watch(() => sidemenuIndexObj.value, (newVal, oldVal) => console.log('newVal, oldVal', newVal, oldVal));

const versionBody = ref(store.state.loginSession.Versions.reduce((string, version) => {
    return string += `<div class="home-version__list">${version.Component}<span class="">${version.Version}</span></div>`;
}, ''));
const boxProps = new BoxProps(ModalType.Generic, store.state.settings.versions.versionheader,versionBody.value);
boxProps.buttonLabels.cancelLabel = '';
const showVersionInfo = () => {
    boxProps.hideBg = true;
    showModalDialog(boxProps);
}
const setMenuStatus = evt => {
    menuOpen.value = evt.status;
    //save settings
    saveSettings();
}

//CHECK IF THERE IS A SIDEMENU
const setSelectedMainMenuItem = (index:number):void => {
    mainmenuIndex.value = index;
    asideVisible.value  = store.state.navigation.menuItems[index].appMenu.length > 0;
};
provide('setSelectedMainMenuItem', setSelectedMainMenuItem);

const setSelectedSideMenuItem = (index: number, subindex: number): void => {
    sidemenuIndex.value = index;
    sidesubmenuIndex.value = subindex;
}
provide('setSelectedSideMenuItem', setSelectedSideMenuItem);

const createPath = (params) => params !== null ? `M ${params.start} C ${params.controls} ${params.end}` : '';
watch(() => store.getters.getArrowPath(), (newVal, oldVal) => path.value = newVal);

const getSettings = () => {
    IPCCCUserSettings.Get('SideMenuOpenSettings')
    .then(result => {
        if(result.length > 0 && result[0].Name == 'SideMenuOpenUserSettings') {
        let _data = JSON.parse(result[0].Data);
        menuOpen.value     = _data.menuOpen;
        } else {
        //NO SETTINGS FOUND ALL DEFAULT;
        }
    })
    .catch(error => {
        console.error(error);
    });
};

const saveSettings = () => {
    let _sideMenuOpenSettings = {
        menuOpen       : menuOpen.value,
    };

    IPCCCUserSettings.Save('SideMenuOpenSettings', 'SideMenuOpenUserSettings', JSON.stringify(_sideMenuOpenSettings)).catch(error => {
        console.error(error);
    })
}

onMounted(() => {
    getSettings();

    if(store.getters.getPermission('ModuleInteractie')) {
        if (store.getters.getUnsavedNote().NoteId > -1) {
            store.state.navigation.requestNavigation = '/interaction/';
        }
    }

    const browserPrefixes       = ['moz', 'ms', 'o', 'webkit'];
    const getHiddenPropertyName = prefix => prefix ? prefix + 'Hidden' : 'hidden';
    const getVisibilityEvent    = prefix => (prefix ? prefix : '') + 'visibilitychange';
    let   isVisible             = true;

    const getBrowserPrefix = ()=> {
        for (let i = 0; i < browserPrefixes.length; i++) {
        if(getHiddenPropertyName(browserPrefixes[i]) in document) {
            return browserPrefixes[i];
        }
        }
        return null;
    }

    let browserPrefix       = getBrowserPrefix(),
        hiddenPropertyName  = getHiddenPropertyName(browserPrefix),
        visibilityEventName = getVisibilityEvent(browserPrefix);

    const onVisible = () => {
        if(isVisible) {
            return;
        }
        isVisible = true;
        beep();
        console.log('CS focus:', isVisible);
    }

    const onHidden = () => {
        if(!isVisible) {
        return;
        }
        isVisible = false;
        beep();
        console.log('CS focus:', isVisible);
    }

    const handleVisibilityChange = forcedFlag => {
        if(typeof forcedFlag === "boolean") {
        if(forcedFlag) {
            return onVisible();
        }
        return onHidden();
        }

        if(document[hiddenPropertyName]) {
        return onHidden();
        }

        return onVisible();
    }

    // document.addEventListener(visibilityEventName, handleVisibilityChange, false);
    // document.addEventListener('focus', () => handleVisibilityChange(true), false);
    // document.addEventListener('blur', () => handleVisibilityChange(false), false);
    // window.addEventListener('focus', () =>handleVisibilityChange(true), false);
    // window.addEventListener('blur', () =>handleVisibilityChange(false), false);

    const beep = () => {
        const snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
        // snd.play();
    }
});

</script>

<template>
    <div>
        <!-- SCRIPT BUILDER REDIRECT ARROW -->
        <div class="scriptmodule__arrow" id="redirectArrow" data-e2e="main-screen">
            <svg width="100%" height="100%">
                <path fill="none" stroke-dasharray="10,5" stroke="#406191" stroke-width="3" stroke-linecap="round" :d="createPath(path)"/>
            </svg>
        </div>
        <!-- SCRIPT BUILDER REDIRECT ARROW -->

        <AppHeader />
        <Home />
        <AppAside
            :menuopen="menuOpen"
            :selectedmainmenuitem="mainmenuIndex"
            :selectedsidemenuitem="sidemenuIndexObj"
            @statuschange="setMenuStatus"
        />
        <AppBody
            :menuopen="menuOpen"
            :asidevisible="asideVisible"
        />

        <div class="appgrid-versioninfo" @click="showVersionInfo()">{{ store.state.loginSession.Details.FullName }}&nbsp;|&nbsp;{{ store.state.loginSession.Version }}</div>
    </div>
</template>

<style lang="scss">
  @use "@/scss/includes/font";
  @use "@/scss/includes/globals";
  @use "@/scss/includes/functions";

 .appgrid-versioninfo {
  position: absolute;
  width: 250px;
  height: 16px;
  line-height: 16px;
  font-size: 10px;
  font-family: sans-serif;
  left: calc(100% - 5px);
  bottom: 20px;
  color: globals.$color-gray60;
  transform-origin: left bottom;
  transform: rotate(-90deg);
  z-index: #{globals.$level-app + 150};
  text-shadow: 0 0 4px globals.$color-gray2;
  display: block;
  cursor: pointer;
  user-select: none;
}

.home-version__list {
  height: 30px;
  line-height: 30px;
  span {
    float: right;
    color: globals.$color-blue;
  }
}
</style>
