<script setup lang="ts">

import { useStore }             from 'vuex';
import { inject,
        ref
        }                        from 'vue';
import { IPCCCData }            from '../../ipccc/js/data';

const props = defineProps({
    payload : {
        type     : Object,
        default  : {
            boxShow      : false,
            userId       : -1,
            msg          : ''
        },
        required : false
    }
});

const store:object | any       = useStore(),
    showLoader:Function        = inject('showLoader'),
    userStatusTextList         = store.getters.getUserStatusTextList();

let showError                  = ref<Boolean>(false);

const setPredefinedMsg = (evt:Event):void => {
    showError.value = false;
    props.payload.msg = (evt.target as HTMLLIElement).getAttribute('data-msg');
};

const cancel = (evt:Event):void => {
    showError.value = false;
    props.payload.boxShow = !props.payload.boxShow;
};

const preventHTMLInjection = (msg) => {
    return msg.replace(/>/g, "");
}

const save = (evt:Event):void => {
    showLoader(true);
    IPCCCData.RequestData('userstatustext', {UserId : props.payload.userId, StatusText : preventHTMLInjection(props.payload.msg) })
    .then(() => {
        store.commit('SET_STATUS_MESSAGE', preventHTMLInjection(props.payload.msg));
        showLoader(false);
        showError.value = false;
        props.payload.boxShow = !props.payload.boxShow;
    })
    .catch(error => {
        showLoader(false);
        showError.value = true;
        console.log(error);
    });
};

</script>

<template>
    <teleport to="#modalbox" :disabled="!payload.boxShow" v-if="payload.boxShow">
        <div class="modal" data-e2e="personal-status-box">
            <div class="statusmessage-pannel">
                <header class="statusmessage-header">{{ store.state.settings.statusmessage.header }}</header>
                <article class="statusmessage-body">
                    <div class="form-textfield form-textfield--bground">
                        <label for="msg" class="form-label form-label--hidden">{{ store.state.settings.statusmessage.messagelbl }}</label>
                        <input type="text" name="msg" v-model="payload.msg" :placeholder="store.state.settings.statusmenu.defaultmsg" @paste.prevent>
                    </div>
                    <div class="statusmessage-predefined">
                        <label>{{ store.state.settings.statusmessage.predefinedlbl }}</label>
                        <ol @click="setPredefinedMsg">
                            <li v-for="lbl in userStatusTextList" :data-msg="lbl" :key="lbl">{{ lbl }}</li>
                        </ol>
                    </div>
                    <div v-if="showError" class="statusmessage-error">{{ store.state.settings.statusmessage.notchangedmsg }}</div>
                </article>
                <footer class="statusmessage-footer">
                    <button class="statusmessage-footer__button" @click="cancel">{{ store.state.settings.statusmessage.cancellbl }}</button>
                    <button class="statusmessage-footer__button statusmessage-footer__button--primary" @click="save">{{ store.state.settings.statusmessage.savelbl }}</button>
                </footer>
            </div>
        </div>
    </teleport>
</template>

<style lang="scss" scoped>

@use "@/scss/includes/globals";
@use "@/scss/includes/font";
@use "@/scss/includes/functions";

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
}

.statusmessage-pannel {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: globals.$color-white;
    border-radius: 3px;
    box-shadow: 0 0 20px 0 rgba(0, 0, 0,.3);
    width: 520px;
    max-height:90vh;
    overflow: auto;
    padding: 30px;
    z-index: 10100;
}

.statusmessage-header {
    position: relative;
    display: block;
    height: 36px;
    line-height: 36px;
    padding: 0;
    border-radius: 3px 3px 0 0;
    color: globals.$color-gray60;
    font-size: 1.25em;
    border-bottom: 1px solid globals.$color-gray20;
}

.statusmessage-body {
    position: relative;
    display: block;
    color: globals.$color-gray80;
    padding: 25px 0;
}

.statusmessage-footer {
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    padding: 0;
    height: 40px;
    line-height: 40px;
}

.statusmessage-footer__button {
    position: relative;
    padding: 5px 20px;
    background-color: globals.$color-gray5;
    color: globals.$color-gray40;
    box-shadow: none;
    border-radius: 3px;
    box-shadow: 0 1px 1px 0 rgba(0,0,0,.2);
    cursor: pointer;
    user-select: none;
    text-decoration: none;
    transition: box-shadow .2s;
    min-width: 100px;
    margin-left: 10px;
    font-size: 16px;
    &--primary {
        background-color: globals.$color-green;
        color: globals.$color-white;
        &:hover {
            box-shadow: 0 2px 5px 0 rgba(0,0,0,.2);
            background-color: functions.tint(globals.$color-green, 5%);
        }
    }

}

.statusmessage-predefined {
    margin-top: 20px;
    label {
        width: 100%;
        display: block;
        color: globals.$color-gray35;
        font-family: 'Open Sans SemiBold', sans-serif;
        font-size: .8em;
        padding-bottom: 10px;
    }
    ol {
        font-size: 1rem;
        li {
            display: block;
            color: globals.$color-help;
            height: 35px;
            line-height: 35px;
            cursor: pointer;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            &:before {
                content: '- ';
            }
            &:hover {
                text-decoration: underline;
            }
        }
    }
}

.statusmessage-error {
    width: 100%;
    height: auto;
    padding: 10px;
    border-radius: 3px;
    font-size: .9em;
    margin: 20px 0;
    background-color: functions.tint(globals.$color-warmyellow, 70%);
    color: globals.$color-unavailable;
}

.form-label {
    width: 100%;
    display: block;
    color: globals.$color-gray35;
    @include font.font-medium();
    font-size: .8em;
}

.form-textfield {
    position: relative;
    width: 100%;
    padding-bottom: 13px;
    input[type='text'] {
        @include font.font-normal();
        height: 40px;
        line-height: 40px;
        width: 100%;
        border: none;
        border-bottom: 1px solid globals.$color-gray35;
        box-shadow: inset 0 -30px 0px 0px rgba(0,0,0,.025);
        padding-left: 3px;
        padding-top: 10px;
        resize:none;
        color: globals.$color-gray60;
        font-size: 1rem;
        &:focus {
            background-color: transparent;
            & + label {
                top: 2px;
                opacity: 1;
                height: auto;
            }
        }
    }
}

</style>