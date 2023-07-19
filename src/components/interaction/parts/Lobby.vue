<script lang="ts">
export default {
    inheritAttrs: false,
    customOptions: {
        name: "Lobby"
    },
}
</script>
<script setup lang="ts">

/**
 *
 * @note
 * @todo
 *
 */


import { onBeforeUnmount, ref } from "vue";
import { useStore } from "vuex";
import { LobbyCase } from "../../../types/lobby";
import { deepCopy } from '../../../use/helperFunctions';
import { AccountCircle } from "mdue";
import { IPCCCCommand } from "../../../ipccc/js/command";
import { currentLocalDateTimeISO }  from '../../../use/dateFunctions';

const store: object | any = useStore(),
    lobbyInfoList = ref<LobbyCase[]>([]),
    timerId = ref(null);

const processLobbyInfo = (lobbyinfolist:LobbyCase[]) => {

    if(timerId.value) {
		clearTimeout(timerId.value);
		timerId.value = null;
	}

    if (lobbyinfolist && lobbyinfolist.length > 0) {

        lobbyinfolist.forEach((lobbycase:LobbyCase) => {
            return lobbycase = LobbyCase.CalcLobbyWaitingTime(lobbycase);
        });
    }

    lobbyInfoList.value = deepCopy(lobbyinfolist);

    if(lobbyInfoList.value.length > 0) {
        timerId.value = setTimeout(() => { processLobbyInfo(lobbyinfolist); }, 1000); //Loop for timer update
    }
};

const checkEmpty = (str) => {
    if(str) {
        str = str.trim();
        return (str == '') ? '-' : str;
    } else {
        return '-';
    }
}

const handleLobbyClick = (wfmcaseid) => {
    IPCCCCommand.Request("getfromlobby", wfmcaseid)
    .catch((error) => {
        console.error("Error: ", error);
    });
}

const unSubscribe = store.watch(() => store.getters.getLobbyInfo(), (list:LobbyCase[]) => {
    if (window.debugState) console.log(`[${currentLocalDateTimeISO()}] LobbyInfo: ${list}`);
    processLobbyInfo(list);
}, {immediate:true});


onBeforeUnmount(() => {
    unSubscribe();
});


</script>

<template>
    <div data-e2e="lobby" class="lobby-wrapper">
        <div
            v-for="lobbycard in lobbyInfoList"
            :key="lobbycard.WFMcaseId"
            @click="handleLobbyClick(lobbycard.WFMcaseId)"
            data-e2e="lobby-card"
            class="lobby-card"
            >
            <div class="loby-card-iconcontainer">
                <AccountCircle class="lobby-card-icon" />
            </div>
            <div class="loby-card-bodycontainer">
                <span class="lobby-card-username" data-e2e="lobby-card-username">
                    <span>{{ store.state.settings.lobby.lobbylabel }}</span>
                    <span>&nbsp;</span>
                    <span>({{ checkEmpty(lobbycard.UserName) }})</span>
                </span>
                <span class="lobby-card-ani" data-e2e="lobby-card-ani">{{ lobbycard.ANI }}</span>
                <span class="lobby-card-routinggroupname" data-e2e="lobby-card-routinggroupname">{{ checkEmpty(lobbycard.RoutinggroupName) }}</span>
                <span class="lobby-card-note" data-e2e="lobby-card-note">{{ checkEmpty(lobbycard.Note) }}</span>
            </div>
            <div class="loby-card-timecontainer">
                <span class="lobby-card-time" data-e2e="lobby-card-time">{{ checkEmpty(lobbycard.LobbyWaitingTime) }}</span>
            </div>
        </div>
        <!-- <button type="button" @click="processLobbyInfo([new LobbyCase()])">processLobbyInfo([new LobbyCase()])</button>
        <button type="button" @click="processLobbyInfo([])">processLobbyInfo([])</button> -->

        <div v-if="lobbyInfoList.length == 0" class="lobby-waiting">{{ store.state.settings.lobby.waitforlobbyinfo }}</div>
    </div>

  </template>

<style lang="scss" scoped>
@use "@/scss/includes/font";
@use "@/scss/includes/mixins";
@use "@/scss/includes/globals";
@use "@/scss/includes/functions";

button {
    display: block;
}
.lobby-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column-reverse;
    flex: 1;
}

.lobby-waiting {
    position: absolute;
    bottom: 130px;
    width: 100%;
    color: globals.$color-gray20;
    font-size: .8rem;
    text-align: center;
}

.lobby-card {
    height: 80px;
    width: 100%;
    border-bottom: 1px solid globals.$color-gray20;
    background-color: globals.$color-gray10;
    cursor: pointer;
    display: flex;

    .loby-card-iconcontainer {
        width: 50px;
        height: 100%;
        text-align: center;
    }
    .loby-card-bodycontainer {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding-top: 5px;
        max-width: 240px;
    }
    .loby-card-timecontainer {
        width: 60px;
        margin-right: 10px;
        text-align: right;
        line-height: 80px;
    }

    .lobby-card-username,
    .lobby-card-ani,
    .lobby-card-routinggroupname,
    .lobby-card-note {
        flex: 1;
        color: globals.$color-gray35;
        // @include font.font-bold();
        // @include font.font-medium();
        @include font.font-normal();
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }
    .lobby-card-icon {
        transform: translateY(50%);
        color: globals.$color-gray60;
        width: 40px;
        height: 40px;
    }
    .lobby-card-username {
        @include font.font-medium();
        color: globals.$color-gray80;
        font-size: .8rem;
        line-height: 1rem;
    }
    .lobby-card-ani {
        @include font.font-medium();
        color: globals.$color-gray80;
        font-size: .8rem;
        line-height: 0.9rem;
    }
    .lobby-card-routinggroupname {
        display: block;
        color: globals.$color-gray60;
        font-size: 0.8rem;
        line-height: 0.9rem;
    }
    .lobby-card-note {
        display: block;
        color: globals.$color-gray60;
        font-size: 0.7rem;
        line-height: 0.6rem;
    }
    .lobby-card-time {
        @include font.font-bold();
        font-size: .8rem;
        color: globals.$color-gray60;
    }
}

</style>
