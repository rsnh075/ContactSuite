<template>
    <div class="inbox-wrapper">
      <div class="inbox-novoicemails" v-if="groupedByDayRecordingList.length == 0">{{ store.state.settings.voicemailinbox.novoicemails }}</div>
      <VirtualListViewer v-if="groupedByDayRecordingList.length > 0" class="inbox-list__wrapper" :data="groupedByDayRecordingList" rowClasses="inbox-list__content" data-e2e="voicemail-inbox">
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

  <script lang="ts">

    import { useStore }             from 'vuex';
    import {
             onMounted,
             inject,
             computed,
             ref,
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

    export default defineComponent({
      name: 'VoiceMailInbox',
      components: {
        Voicemail,
        ChevronRight,
        Close,
        VirtualListViewer
      },
      props: {
        isactive : {
          type : Boolean,
          default : false
        }
      },
      setup(props) {
        const store:object | any                = useStore(),
              selectedRecording:Object          = inject('selectedRecording'),
              setSelectedRecording:Function     = inject('setSelectedRecording'),
              setActiveBaseComponent:Function   = inject('setActiveBaseComponent'),
              groupedByDayRecordingList         = inject('groupedByDayRecordingList'),
              toggleLoader:Function             = inject('toggleLoader'),
              activeId                          = ref(<String>'');

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

        watch(() => props.isactive, (newVal, oldVal) => {
          toggleLoader(false);
        });

        onMounted(() => {
          toggleLoader(false);
        })

        return {
          store,
          toggleLoader,
          groupedByDayRecordingList,
          activeId, dateToTime,
          stripNumber,  capitalizeFirstLetter, cardClass,
          showRecording
        }
      }
    });

  </script>

  <style lang="scss">

    @use "@/scss/includes/font";
    @use "@/scss/includes/globals";
    @use "@/scss/includes/functions";
    @use "@/scss/includes/mixins";

  .inbox-wrapper {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }

  .inbox-novoicemails {
    position: absolute;
    top: 80px;
    width: 100%;
    color: globals.$color-gray20;
    font-size: .8rem;
    text-align: center;
  }

  .inbox-list__wrapper {
    position: absolute;
    top: 0;
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
    user-select: none !important;
  }

  .inbox-list__header {
    position: relative;
    width: calc(100% - 16px);
    display: block;
    padding: 35px 20px 20px 5px;
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
    border-bottom: 1px solid globals.$color-gray10;
    user-select: none !important;
    cursor: pointer;
    text-decoration: none;
    .voicemail-icon,
    .chevron-right-icon {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      transform: translate(-50%, -50%);
      // @include font.font-icon();
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
      box-shadow: inset -350px 0 0 0 functions.tint(globals.$color-interaction, 80%);
      border-bottom: 1px solid globals.$color-gray10;
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