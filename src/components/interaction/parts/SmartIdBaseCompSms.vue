<script lang="ts">
export default {
    name: 'SmartIdBaseCompSms'
}
</script>
<script setup lang="ts">

/**
 *
 * Smart id sms: sms popup *
 *
 * @project ContactSuite
 * @version 1.0
 * @author Erik Rosenhart
 * @copyright 2017
 * @licence MIT
 *
 * @date 14-09-2022
 * @modified
 *
 * @todo
 *
 */

import { useStore } from 'vuex';
import { computed, inject, ref } from 'vue';
import { IPCCCCommand } from "../../../ipccc/js/command";
import {
          Close,
          Send
        } from "mdue";
import BoxProps, { ModalType } from '../../../types/BoxProps';

const props = defineProps(['visible', 'number', 'contactid']);
const emits = defineEmits(['showSms']);

const store:object | any			= useStore(),
	showLoader:Function			    = inject('showLoader'),
	showModalDialog:Function	    = inject('showModalDialog'),
    smsText                         = ref(""),
    isVisible                       = computed(() => props.visible);

const reset = () => {
    smsText.value = "";
}
const close= () => {
    emits('showSms', false)
}

const sendSms = () => {
    showLoader(true);
    IPCCCCommand.Request("sms", { Message : smsText.value, Phonenumber : props.number, ContactId : props.contactid })
    .then(result => {
        close();
        reset()
        showLoader(false);
    })
    .catch((error) => {
        console.error("Error: ", error);
        showModalDialog(new BoxProps(ModalType.Alert, 'Error!', `${error.Message ? error.Message : error} ${error.CodeNr ? error.CodeNr : ''}`));
        showLoader(false);
    });
}

showLoader(false);

</script>

<template>
    <teleport to="#sms" data-e2e="smart-id-sms">
        <section v-show="isVisible" class="smart-id-sms-wrapper">
            <header class="smart-id-sms-header">
                <div class="smart-id-sms-header__number">{{ props.number }}</div>
                <div class="smart-id-sms-header__closebtn" @click="close"><Close /></div>
            </header>

            <div class="smart-id-sms-body">
                <textarea v-model="smsText" :placeholder="store.state.settings.smartid.defaultanswertext" maxlength="300"></textarea>
                <div :class="['smart-id-sms-body__sendbtn', {'smart-id-sms-body__sendbtn--hidden' : smsText.length == 0}]" @click="sendSms"><Send /></div>
            </div>

        </section>
    </teleport>
</template>

<style lang="scss" scoped>

@use "@/scss/includes/font";
@use "@/scss/includes/globals";
@use "@/scss/includes/functions" as fn;

.smart-id-sms-wrapper {
    z-index: 9000;
    position: fixed;
    right: 50px;
    height: 340px;
    top: calc(100% - 40px);
    width: 260px;
    background-color: globals.$color-white;
    overflow: hidden;
    box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.2);
    border-radius: 3px 3px 0 0;
    top: 20vh;
    left: 40vw;
}

.smart-id-sms-header {
    height: 40px;
    display: flex;
    align-items: flex-start;
    border-radius: 3px 3px 0 0;
    background-color: globals.$color-green;
    box-shadow: 0 1px 2px 0 rgba(0,0,0,.2);
    line-height: 40px;
    &__number {
        color: globals.$color-white;
        margin-right: auto;
        padding-left: 15px;
    }
    &__closebtn {
        width: 40px;
        height: 40px;
        color: globals.$color-white;
        line-height: 40px;
        text-align: center;
        cursor: pointer;
    }
}

.smart-id-sms-body {
    padding: 20px;

    textarea {
        height: 220px;
        width: 100%;
        //box-shadow: inset 0 -240px 0px 0px rgb(0 0 0 / 3%);
        padding-left: 10px;
        padding-right: 10px;
        padding: 5px 10px;
        background-color: globals.$color-white;
        border: 1px solid globals.$color-gray10;
        font-size: 11px;
        resize: none;
        @include font.font-light();
        border-radius: 3px;
        overflow: hidden;
    }
    &__sendbtn {
        width: 40px;
        height: 32px;
        line-height: 36px;
        margin: 6px 0 0 auto;
        color: globals.$color-white;
        text-align: center;
        cursor: pointer;
        border-radius: 3px;
        background-color: globals.$color-green;
        &--hidden {
            display: none;
        }
    }
}

</style>