<template>
    <div class="active-lines-wrapper">

        <div class="active-lines" data-e2e="active-lines">
            <div class="active-lines--waiting" v-if="lineinfoList.length == 0">{{ store.state.settings.activelines.waitforinteraction }}</div>

            <div v-if="supervisor" :class="['status-supervisor-wrapper', {'status-supervisor--idle' : supervisorIdle,
                                                                        'status-supervisor--listens' : supervisorListens,
                                                                        'status-supervisor--coaching' : supervisorCoaching,
                                                                        'status-supervisor--joined' : supervisorJoined,
                                                                        'status-supervisor' : supervisor
                                                                        }]">{{ store.state.settings.activelines.coachingstatus[supervisorLbl] }}</div>
            <div v-if="lineinfoList.length > 0">
                <InteractionCard v-for="line, index in lineinfoList" :key="index"
                    :linedata="line"
                    :hide="line.hideInfoPanel"
                />
            </div>

            <a v-if="lineinfoList.length == 1" class="interaction-secondline" @click="addSecondCall()"><PhonePlus /> {{ store.state.settings.activelines.addlinelbl }}</a>
        </div>

        <Lobby class="active-lines__lobby" />

        <QueuePanel class="active-lines__queuepanel" />

    </div>
</template>

<script lang="ts">

import { useStore }             from 'vuex';
import {
        defineComponent,
        inject
        }                        from 'vue';

import { PhonePlus }            from 'mdue';

import InteractionCard         from './InteractionCard.vue';
import QueuePanel              from './Queue-panel.vue';
import Lobby                   from './Lobby.vue';


export default defineComponent({
    name: 'ActiveLines',
    components: {
        PhonePlus,
        InteractionCard,
        Lobby,
        QueuePanel,
    },
    props: {
        tabprops : {
            type    : Object,
            default : {}
        },
        isactive : {
            type : Boolean,
            default : false
        }
    },
    setup() {
        const store:object | any           = useStore(),
                toggleLoader:Function        = inject('toggleLoader'),
                setActiveLeftTab:Function    = inject('setActiveLeftTab'),
                setSecondCallActive:Function = inject('setSecondCallActive'),
                lineinfoList                 = inject('lineinfoList'),
                lineStatus                   = inject('lineStatus'),
                supervisorLbl                = inject('supervisorLbl'),
                supervisorIdle               = inject('supervisorIdle'),
                supervisorListens            = inject('supervisorListens'),
                supervisorCoaching           = inject('supervisorCoaching'),
                supervisorJoined             = inject('supervisorJoined'),
                supervisor                   = inject('supervisor');

        const addSecondCall = () => {
            setSecondCallActive();
            setActiveLeftTab(2);
        }

        toggleLoader(false);

        return {
            store,
            setActiveLeftTab,
            lineinfoList, lineStatus, supervisorLbl, supervisorIdle, supervisorListens, supervisorCoaching, supervisorJoined, supervisor,
            addSecondCall
        }

    }
});

</script>

<style lang="scss" scoped>

  @use "@/scss/includes/font";
  @use "@/scss/includes/globals";


.active-lines-wrapper {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;

    .active-lines {
        height: 240px;
    }
    .active-lines__queuepanel {
        height: 62px;
    }
}

.active-lines--waiting {
  position: absolute;
  top: 80px;
  width: 100%;
  color: globals.$color-gray20;
  font-size: .8rem;
  text-align: center;
}

.status-supervisor-wrapper {
  position: relative;
  height: 20px;
  background-color: globals.$color-blue;
  color: globals.$color-white;
  @include font.font-menu();
  font-size: 0.8rem;
  line-height: 1.2rem;
  text-align: center;
  &--minimized {
    display: none;
    text-align: right;
    padding-right: 6px;
    font-size: 0.7rem;
  }
}

.status-supervisor {
  background-color: globals.$color-supervisor;
}

.status-supervisor--idle {
  background-color: globals.$supervisor-idle;
}

.status-supervisor--listens {
  background-color: globals.$supervisor-listens;
}

.status-supervisor--coaching {
  background-color: globals.$supervisor-coaching;
}

.status-supervisor--joined {
  background-color: globals.$supervisor-joined;
}

.interaction-secondline {
    display: block;
    height: 60px;
    line-height: 60px;
    text-align: center;
    color: globals.$color-gray40;
    padding-top: 10px;
    cursor: pointer;
    text-decoration: none;
    font-size: .85em;
    &:hover {
        color: globals.$color-availability;
        i {
            color: globals.$color-availability;
        }
    }
}


</style>