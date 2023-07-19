<template>
  <div data-e2e="on-off-queue">
    <!-- DIALOG MESSAGE -->
    <Alert-Box
      :status        = "showDialog"
      :headercontent = "$store.state.settings.alertheader"
      :bodycontent   = "messageBody"
      :acceptlabel   = "$store.state.settings.acceptlabel"
      @accepted      = "closeMessage"
    />
    <div class="onoffqueue__togglefield">
      <ToggleFieldAsync v-model="onOffQueueState"
        datae2e="on-off-queue-input"
        @togglefieldClicked="toggleOnOff"
        :label="onOffQueueState ? $store.state.settings.onoffqueue.onqueuestatuslabel : $store.state.settings.onoffqueue.offqueuestatuslabel"
      />
    </div>

    <!-- <div class="onoffqueue__togglefield">
      <input type="checkbox" name="toggle_onoffque" id="toggle_onoffque" v-model="onOffQueueState" @change="toggleOnOff">
      <label for="toggle_onoffque">{{ onOffQueueState ? $store.state.settings.onoffqueue.onqueuestatuslabel : $store.state.settings.onoffqueue.offqueuestatuslabel }}</label>
    </div> -->
  </div>
</template>

<script>
  import { IPCCCCallControl }    from './../../ipccc/js/callcontrol.js';
  import AlertBox                from './../dialogs/Alert-box.vue';
  import ToggleFieldAsync        from './../uielements/ToggleFieldAsync.vue';

  export default {
    name: 'OnOffQueue',
    props: [],
    data: () => {
      return {
        // onOffQueueState       : true, //default for customers without onoffqueue
        showDialog            : false,
        messageBody           : '',

      }
    },
    components: {
      'Alert-Box' : AlertBox,
      ToggleFieldAsync
    },
    computed: {
        onOffQueueState() {
            return this.$store.state.commands.OnQueue;
        }
    },
    methods: {
      toggleOnOff() {
        // this.$store.state.commands.OnQueue = false;
        this.onOffQueueState ? IPCCCCallControl.UnBlockSessions() : IPCCCCallControl.BlockSessions();
        // this.$store.commit('SET_QUEUE_STATUS', this.onOffQueueState);
      },
      openMessage() {
        this.messageBody = this.$store.state.settings.onoffqueue.statusmessage + this.$store.state.statusLbl;
        this.showDialog  = true;
      },
      closeMessage() {
        this.messageBody = '';
        this.showDialog = false;
      }
    },
    mounted() {
    //   this.onOffQueueState = this.$store.state.commands.OnQueue;
      // this.$store.commit('SET_QUEUE_STATUS', this.onOffQueueState);
      // Nog een keer checken wanneer BE onqueue default op true heeft staan.
      // Refresh slaat tweede scherm over waar onoffqueue op off gezet wordt.
    }
  }
</script>

<style lang="scss">

  @use "@/scss/includes/globals";
  @use "@/scss/includes/functions";
  @use "@/scss/includes/font";

  .onoffqueue__togglefield {
    width: 90px;
    height: 80px;
    float: left;
    background-color: globals.$color-white;
    text-align: center;
    div.togglefield-button {
      label {
        margin-top: 26px;
        margin-bottom: 7px;
      }
      span {
        width: 100%;
        @include font.font-menu();
        margin-left: 0;
      }
    }
    // label {
    //   position: relative;
    //   display: block;
    //   width: 100%;
    //   height: 80px;
    //   background-color: globals.$color-white;
    //   cursor: pointer;
    //   font-family: 'Abel', sans-serif;
    //   color: #999999;
    //   font-size: .67em;
    //   text-align: center;
    //   white-space: nowrap;
    //   overflow: hidden;
    //   text-overflow: ellipsis;
    //   padding-top: 54px;
    //   &:before {
    //     content: "";
    //     position: absolute;
    //     top: calc(50% - 7px);
    //     left: 50%;
    //     width: 30px;
    //     height: 16px;
    //     transform: translate(-50%, -50%);
    //     border-radius: 8px;
    //     background-color: globals.$color-gray20;
    //     z-index: 10;
    //   }
    //   &:after {
    //     content: "";
    //     position: absolute;
    //     display: block;
    //     z-index: 20;
    //     width: 12px;
    //     height: 12px;
    //     border-radius: 50%;
    //     background-color: globals.$color-white;
    //     left: calc(50% - 12px);
    //     top: calc(50% - 7px);
    //     transform: translateY(-50%);
    //     transition: left .3s ease-in-out;
    //   }
    // }
    // input[type='checkbox'] {
    //   position: absolute;
    //   left: -10000px;
    //   z-index: 10;
    //   &:checked + label:before {
    //     background-color: globals.$color-secondary;
    //   }
    //   &:checked + label:after {
    //     left: 50%;
    //   }
    // }
  }

</style>
