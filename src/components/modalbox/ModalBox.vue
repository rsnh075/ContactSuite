<script lang="ts">
export default {
    name: 'ModalBox'
}
</script>

<script setup lang="ts">
import { AlertOctagon, HelpCircle } from 'mdue';
import BoxProps, { ModalType } from '../../types/BoxProps';

const props = defineProps({
    boxProps : {
        type     : BoxProps,
        default  : new BoxProps(),
        required : false
    },
    itemNr: {
        type: Number,
        default: 0
    }
});

const emit = defineEmits<{
    (e: 'onConfirm', Fn : Function, uniqueid : String): void;
    (e: 'onCancel', Fn : Function, uniqueid : String): void;
}>();

const handleOK = (evt:Event):void => {
    emit('onConfirm', props.boxProps.confirmFn, props.boxProps.uniqueid);
}

const handleCancel = (evt:Event):void => {
    emit('onCancel', props.boxProps.cancelFn, props.boxProps.uniqueid);
}
</script>

<template>
    <teleport to="#modalbox" v-if="boxProps.show">
        <div :class="['modal', {'modal--nobg' : boxProps.hideBg}]">
            <div class="modal__window" data-e2e="modal-box" :style="{ left: `${50 + props.itemNr}%`, top: `${50 + props.itemNr}%`}">
                <header class="modal__window-header">
                    <span v-html="boxProps.header"></span>
                </header>
                <section class="modal__window-body">

                    <AlertOctagon v-if="boxProps.type === ModalType.Alert" class="modal__window-body-icon modal__window-body-icon--alert" />
                    <HelpCircle v-if="boxProps.type === ModalType.Message" class="modal__window-body-icon modal__window-body-icon--confirm" />

                    <div :class="['modal__window-body-message', {'modal__window-body-message--iconwidth' : boxProps.type === ModalType.Alert || boxProps.type === ModalType.Message}]">
                        <span v-html="boxProps.message" data-e2e="modal-box-message"></span>
                    </div>
                </section>
                <footer class="modal__window-footer">
                    <button v-if="boxProps.type !== ModalType.Alert && boxProps.buttonLabels.cancelLabel !== ''"
                        data-e2e="modal-box-cancel-btn"
                        class="modal__window-button"
                        @click="handleCancel">
                            {{ boxProps.buttonLabels.cancelLabel }}
                    </button>
                    <button class="modal__window-button modal__window-button--primary"
                        data-e2e="modal-box-ok-btn"
                        @click="handleOK">
                            {{ boxProps.buttonLabels.okLabel }}
                    </button>
                </footer>
            </div>
        </div>
    </teleport>
</template>

<style lang="scss" scoped>

  @use "@/scss/includes/globals";
  @use "@/scss/includes/font";

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: rgba(255, 255, 255, .4);
    opacity: 1;
    transform: opacity .4s ease-in;
    z-index: 10000;
    &--nobg {
      background-color: transparent;
      pointer-events: none;
    }
  }

    .modal__window {
        position: relative;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: auto;
        max-width: 480px;
        min-width: 340px;
        height: auto;
        min-height: 240px;
        max-height: 400px;
        background-color: globals.$color-white;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0,.3);
        border-radius: 3px;
        z-index: 10100;
        pointer-events: all;
    }

  .modal__window-header {
    position: relative;
    width: 100%;
    height: 40px;
    line-height: 40px;
    background-color: globals.$color-gray10;
    color: globals.$color-gray60;
    @include font.font-medium();
    padding: 0 20px;
    border-radius: 3px 3px 0 0;
  }

  .modal__window-body {
    position: relative;
    width: 100%;
    line-height: 1;
    background-color: globals.$color-white;
    color: globals.$color-gray60;
    @include font.font-normal();
    padding: 25px 20px 75px 20px;
    overflow-y: auto;
  }

  .modal__window-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 50px;
    line-height: 50px;
    color: globals.$color-gray60;
    @include font.font-medium();
    padding: 0;
    border-radius: 0 0 3px 3px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    flex-wrap: nowrap;
    align-items: stretch;
    align-content: stretch;
    .modal__window-button {
      text-align: center;
      width: 100%;
      background-color: globals.$color-gray3;
      border-radius: 0 0 3px 3px;
      font-size: 1.1em;
      color: globals.$color-gray60;
      cursor: pointer;
      &:hover {
        background-color: globals.$color-gray5;
      }
      &--primary:hover {
        background-color: globals.$color-gray5;
      }
    }
  }

  .modal__window-body-icon {
    float: left;
    margin-right: 15px;
    width: 80px;
    height: 80px;
    &--alert {
      fill: globals.$color-alert;
    }
    &--confirm {
      fill: globals.$color-warmyellow;
    }
  }

  .modal__window-body-message {
    float: left;
    width: 100%;
    max-height: 260px;
    overflow-y: auto;
    line-height: 1.4;
    margin-right: -20px;
    padding-right: 10px;
    &--iconwidth {
        width: calc(100% - 75px);
    }
  }

</style>