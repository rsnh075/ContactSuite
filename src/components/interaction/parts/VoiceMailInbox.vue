<script lang="ts">

import { useStore }             from 'vuex';
import {
            onMounted,
            inject,
            computed,
            ref,
            Ref,
            watch,
            defineComponent
        }                        from 'vue';
import {
            Voicemail,
            ChevronRight,
            Close
        }                        from 'mdue';
import { dateToTime }           from './../../../use/dateFunctions';
import VirtualListViewer        from './../../uielements/VirtualListViewer.vue';
import MultiSelectSearchFlyOut  from './../../uielements/MultiSelectSearchFlyOut.vue';

export default defineComponent({
    name: 'VoiceMailInbox',
    components: {
        Voicemail,
        ChevronRight,
        Close,
        VirtualListViewer,
        MultiSelectSearchFlyOut
    },
    props: {
        isactive : {
        type : Boolean,
        default : false
        }
    },
    setup(props) {
        const   store:object | any                      = useStore(),
                uniqueRoutinggroupsList:Ref             = inject('uniqueRoutinggroupsList'),
                selectedRoutinggroupsList:Ref           = inject('selectedRoutinggroupsList'),
                uniqueRoutinggroupsListMapped           = computed(() => {
                    return uniqueRoutinggroupsList.value.map((name) => {
                        return {
                            RoutinggroupName: name,
                            selected: selectedRoutinggroupsList.value.includes(name)
                        }
                    })
                }),
                setSelectedRoutinggroupsList:Function   = inject('setSelectedRoutinggroupsList'),
                selectedRecording:Object                = inject('selectedRecording'),
                setSelectedRecording:Function           = inject('setSelectedRecording'),
                setActiveBaseComponent:Function         = inject('setActiveBaseComponent'),
                groupedByDayRecordingList               = inject<[]>('groupedByDayRecordingList'),
                toggleLoader:Function                   = inject('toggleLoader'),
                activeId                                = ref(<String>'');

        const showRecording = (recordingId:string):void => {
            activeId.value = recordingId;
            setSelectedRecording(recordingId);
            setActiveBaseComponent(3);
        }

        watch(selectedRecording, (newVal, oldVal) => {
            if (newVal && Object.keys(newVal).length == 0 && activeId.value.length > 0) {
                activeId.value = '';
            }
        })

        //======================HELPERS

        const stripNumber = (nr) => {
            let _nr = nr;
            if(nr.indexOf('@') != -1) {
                _nr = nr.split('@')[0];
            }
            return _nr;
        }

        const capitalizeFirstLetter = (str:string):string => {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        const cardClass = computed(() => {
            return function(isRead, Id) {
                let _class = 'inbox-list__line';
                _class += isRead ? ' inbox-list__line--handled' : '';
                _class += Id == activeId.value ? ' inbox-list__line--active' : '';
                return _class;
            }
        });

        const handleChangedOptions = (option) => {
            const index = selectedRoutinggroupsList.value.indexOf(option.RoutinggroupName);
            if (index > -1) { // remove
                setSelectedRoutinggroupsList(selectedRoutinggroupsList.value.toSpliced(index, 1));
            } else { // add
                setSelectedRoutinggroupsList(selectedRoutinggroupsList.value.toSpliced(index, 0, option.RoutinggroupName));
            }
        }

        const resetSelectedRoutinggroupList = () => {
            setSelectedRoutinggroupsList([]);
        }

        watch(() => props.isactive, (newVal, oldVal) => {
            toggleLoader(false);
        });

        onMounted(() => {
            toggleLoader(false);
        })

        return {
            store,
            toggleLoader,
            handleChangedOptions,
            uniqueRoutinggroupsListMapped,
            resetSelectedRoutinggroupList,
            groupedByDayRecordingList,
            activeId, dateToTime,
            stripNumber, capitalizeFirstLetter, cardClass,
            showRecording
        }
    }
});

</script>

<template>
    <div class="inbox-wrapper" data-e2e="voicemail-inbox-wrapper">
        <div class="inbox-header">
            <div class="typo-input-label top15">{{ store.state.settings.voicemailinbox.defaultSelectedRG }}</div>
            <MultiSelectSearchFlyOut
                :options="uniqueRoutinggroupsListMapped"
                :defaultlabel="store.state.settings.voicemailinbox.defaultselectedRG"
                labelproperty="RoutinggroupName"
                valueproperty="RoutinggroupName"
                @changed="handleChangedOptions($event)"
                @resetselected="resetSelectedRoutinggroupList()"
            />
        </div>
        <div class="inbox-novoicemails" v-if="groupedByDayRecordingList.length == 0">{{ store.state.settings.voicemailinbox.novoicemails }}</div>
        <VirtualListViewer v-if="groupedByDayRecordingList.length > 0" class="inbox-list__wrapper"
            :data="groupedByDayRecordingList"
            rowClasses="inbox-list__content"
            data-e2e="voicemail-inbox"
        >
            <template v-slot="{ row }">
                <a v-if="row.Id" :class="cardClass(row.IsRead, row.Id)" :key="row.Id" :data-id="row.Id" @click="showRecording(row.Id)">
                    <voicemail class="voicemail-icon" />
                    <span>{{ stripNumber(row.FullName) }}</span>
                    <span>{{ dateToTime(row.DateTime) }}</span>
                    <chevron-right class="chevron-right-icon" />
                </a>
                <span v-else class="inbox-list__header">{{ capitalizeFirstLetter(row.date) }}</span>

            </template>
        </VirtualListViewer>
    </div>
</template>

<style lang="scss">

@use "@/scss/includes/font";
@use "@/scss/includes/globals";
@use "@/scss/includes/functions";
@use "@/scss/includes/mixins";

.more-top-margin {
    margin-top: 10px;
}
.top15 {
    top: 15px;
}

.inbox-wrapper {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    .inbox-header {
        position: relative;
        padding: 18px 12px 0 12px;
        height: 80px;
        border-bottom: 1px solid globals.$color-gray10;
        .select-search-fly-out__wrapper {
            max-width: 400px;
        }
    }
}

.inbox-novoicemails {
    position: absolute;
    top: 80px;
    width: 100%;
    bottom: 0;
    padding-top: 2rem;
    background-color: globals.$color-gray5;
    color: globals.$color-gray40;
    font-size: .8rem;
    text-align: center;
}

.inbox-list__wrapper {
    background-color: globals.$color-gray5;
    position: absolute;
    top: 80px;
    right: 0;
    bottom: 0;
    left: 0;
    overflow-y: scroll;
}

.inbox-list__content {
    // position: absolute;
    width: 100%;
    top: 0;
    left: 0;
    height: 60px; //to ensure that the height of the row is always the same
    user-select: none !important;
}

.inbox-list__header {
    position: relative;
    width: calc(100% - 16px);
    display: block;
    padding: 28px 20px 10px 5px;
    margin: 0 8px;
    font-size: 1rem;
    @include font.font-bold();
    color: globals.$color-gray60;
}

.inbox-list__line {
    position: relative;
    width: calc(100% - 16px);
    display: block;
    padding: 10px 20px 10px 40px;
    margin: 0 8px;
    border-radius: 3px;
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, .1);
    background-color: globals.$color-white;
    user-select: none !important;
    cursor: pointer;
    text-decoration: none;
    .voicemail-icon,
    .chevron-right-icon {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
    }
    .voicemail-icon {
        content: '\F57D';
        font-size: 1.5rem;
        left: 15px;
        color: globals.$color-interaction;
    }
    .chevron-right-icon {
        right: -10px;
        font-size: 1.2rem;
        color: globals.$color-gray60;
    }
    span {
        width: 100%;
        display: block;
        font-size: .7rem;
        color: globals.$color-gray60;
        line-height: 1.2;
        padding-top: 4px;
        @include mixins.chopToLongText(100%);
    }
    span:nth-child(1) {
        @include font.font-medium();
        padding-top: 0;
        font-size: .8rem;
    }
    &:hover {
        //box-shadow: inset -350px 0 0 0 ;
        background-color: functions.tint(globals.$color-interaction, 80%);
        .chevron-right-icon {
            color: globals.$color-interaction;
            right: -12px;
        }
    }
    &--handled .voicemail-icon {
        color: globals.$color-gray15;
    }
    &--active {
        span {
            color: globals.$color-black;
        }
        .chevron-right-icon {
            color: globals.$color-interaction;
        }
        &:hover .chevron-right-icon {
            right: -10px;
        }
        box-shadow: inset -350px 0 0 0 functions.tint(globals.$color-interaction, 90%);
    }
}

</style>