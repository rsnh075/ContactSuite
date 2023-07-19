<script lang="ts">

import { mapGetters, useStore }             from 'vuex';
import {
        inject,
        ref,
        computed,
        watch,
        onMounted,
        defineComponent,
        Ref,
        nextTick
    }                        from 'vue';

import { IPCCCCallControl } from '../../../ipccc/js/callcontrol';
import { formatPhoneNumber } from '../../../use/formatPhoneNumber';
import { isNumber } from '../../../use/validationFunctions';
import { useHelperFunctions }       from '../../../use/useHelperFunctions';
import { currentLocalDateTimeISO }  from '../../../use/dateFunctions';
import BoxProps, { ModalType }      from '../../../types/BoxProps';

import {
        BackspaceOutline,
        ContentPaste
    } from 'mdue';
import PbxSettings              from './PbxSettings.vue';
import { LineInfo } from '../../../types/LineInfo';

export default defineComponent({
    name: 'Dialer',
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
    components: {
        BackspaceOutline,
        ContentPaste,
        PbxSettings
    },
    setup(props) {
        const store:object | any               = useStore(),
            useHelperFn                        = useHelperFunctions(),
            toggleLoader:Function              = inject('toggleLoader'),
            callOut:Function                   = inject('callOut'),
            sendDTMFKey:Function               = inject('sendDTMFKey'),
            setIsCallingVoicemail:Function     = inject('setIsCallingVoicemail'),
            lineinfoList: Ref<LineInfo[]>      = inject('lineinfoList'),
            lineActive: Ref<boolean>           = inject('lineActive'),
            lineStatus: Ref<object[]>          = inject('lineStatus'),
            addCall: Ref<boolean>              = inject('addCall'),
            addingSecondCall: Ref<boolean>     = inject('addingSecondCall'),
            isCallingVoicemail: Ref<boolean>   = inject('isCallingVoicemail'),
            phoneNumber                        = ref<string>(''),
            dtmfStr                            = ref<string>(''),
            numberField                        = ref<HTMLInputElement>(null),
            hasWebPhone                        = computed(() => Object.keys(store.getters.getCurrentSelWebRTCDevice()).length > 0),
            activeline                         = computed(() => lineStatus.value.findIndex(item => item)),
            backspaceStatus                    = computed(() => (phoneNumber.value.length < 1) ? 'dialpad-display__backspace dialpad-display__backspace--hidden' : 'dialpad-display__backspace'),
            iconPasteStatus                    = computed(() => (phoneNumber.value.length > 0) ? 'dialpad-display__iconpaste dialpad-display__iconpaste--hidden' : 'dialpad-display__iconpaste'),
            tabisactive                        = computed(() => props.isactive);

        let   sipCall:object | any             = inject('sipCall');

        const numberIsValid = computed(() => {
            let _stripedNr = phoneNumber.value.replace("+", "").replace("*", ""),
                        _l = _stripedNr.length;

            if(_l >= 2 && isNumber(_stripedNr)) {
                return true;
            }
            else {
                //   numberField.value.focus();
                return false;
            }
        });

        const showModalDialog:Function = inject('showModalDialog');

        const pasteClipboard = async () => {
            let text = await useHelperFn.pasteClicpBoardText('');
            formatPhoneNumber(text, (nr:string) => {
                phoneNumber.value = nr;
                // validateNumber();
            });
        };

        const numberInput = (evt:KeyboardEvent):void => {
            let _evt        = evt || window.event as KeyboardEvent,
                _key        = _evt.keyCode || _evt.which,
                _keystr      = String.fromCharCode( _key ),
                _regex      = /[0-9#+]/,
                _ctrlDown   = _evt.ctrlKey || _evt.metaKey,
                _shiftDown  = _evt.shiftKey;


            if(_ctrlDown && _key == 86 || _ctrlDown && _key == 65  || _ctrlDown && _key == 67) {
                // pasteNumber();
            } else {
            if( (!_regex.test(_keystr) && _key != 8 && _key != 46 && _key != 37 && _key != 39 &&
            _key != 9 && _key != 96 && _key != 97 && _key != 98 && _key != 99 &&
            _key != 100 && _key != 101 && _key != 102 && _key != 103 && _key != 104 &&
            _key != 105 && _key != 107 && !(_key == 187 && _shiftDown)) ||
            ( (_key != 51 && _key != 56 && _key != 187) && _shiftDown) ) {

                _evt.returnValue = false;
                if(_evt.preventDefault) _evt.preventDefault();
            }
            }

            if (lineActive.value && checkDTMFChar(_evt.key) && hasWebPhone.value && !addCall.value) {
            _evt.returnValue = false;
            if(_evt.preventDefault) _evt.preventDefault();
            sendDTMFKey(_evt.key);
            dtmfStr.value += _evt.key;
            }
        };

        const checkDTMFChar = (k:string) => (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '#', '*'].indexOf(k) !== -1);

        // const pasteNumber = ():void => {
        //     setTimeout(() => {
        //         formatPhoneNumber(phoneNumber.value, (nr:string) => {
        //             console.log('pasteNumber', nr);
        //             phoneNumber.value = nr;
        //             // validateNumber();
        //         });
        //     });
        // };

        const addNumber = (evt:Event):void => {
            let _target = evt.target as HTMLElement,
                _digit  = _target.getAttribute('data-value');
            if(!isCallingVoicemail.value && (!lineActive.value || !hasWebPhone.value || addCall.value)) {
                phoneNumber.value += _digit;
                //   validateNumber();
            } else if(hasWebPhone.value && !addCall.value) {
                sendDTMFKey(_digit);
                dtmfStr.value += _digit;
            }
        };

        const doBackspace = () => {
            phoneNumber.value = phoneNumber.value.slice(0, -1);
            // validateNumber();
        }

        const callinfo_number = computed(() => {
            if(lineinfoList.value.length > 0 && lineinfoList.value[activeline.value] && activeline.value !== -1) {
                return lineinfoList.value[activeline.value].isOutbound ? lineinfoList.value[activeline.value].dnis : lineinfoList.value[activeline.value].name;
            } else {
                return isCallingVoicemail.value ? '1233' : '-';
            }
        });

        const callinfo_name   = computed(() => {
            if(lineinfoList.value.length > 0 && lineinfoList.value[activeline.value] && activeline.value !== -1) {
                return lineinfoList.value[activeline.value].number;
            } else {
                return '-';
            }
        });

        const callinfo_time   = computed(() => {
            if(lineinfoList.value.length > 0 && lineinfoList.value[activeline.value] && activeline.value !== -1) {
                return lineinfoList.value[activeline.value].time;
            } else {
                return '-';
            }
        });

        const callOnEnter = (evt:KeyboardEvent):void => {
            evt.preventDefault();
            let _evt       = evt || window.event as KeyboardEvent,
                _key       = _evt.keyCode || _evt.which;

            if(_key == 13 ) dailNumber();
        };

        const dailNumber = () => {
            if(numberIsValid.value) {
                if(hasWebPhone.value && phoneNumber.value == '1233') {
                    setIsCallingVoicemail(true);
                }
                callOut(phoneNumber.value);
                phoneNumber.value   = '';
                dtmfStr.value       = '';
                //   numberIsValid.value = false;
            }
        };

        const hangUpActiveLine = () => {
            if (window.debugState) console.log('[' + currentLocalDateTimeISO() + '] hangUpActiveLine');
            IPCCCCallControl.Hangup()
            .then(() => {
                if (window.debugState) console.log('[' + currentLocalDateTimeISO() + '] hangUpActiveLine: ok');
                setIsCallingVoicemail(false);
                if(hasWebPhone.value) sipCall.value.handleIncommingCall(false);
            })
            .catch(error => {
                console.error(error.Message);
            });
        };

        const handleCallEnter = (evt: KeyboardEvent) => {
            if(addCall.value && tabisactive.value) {
                callOnEnter(evt);
            }
        }

        const handleNumberFieldFocus = () => {
            nextTick(() => {
                if (numberField.value && props.isactive && (addCall.value || addingSecondCall.value)) {
                    numberField.value.focus();
                }
            })
        }

        watch(() => tabisactive.value, (newStatus, oldStatus) => {
            toggleLoader(false);
        });

        onMounted(() => {
            toggleLoader(false);

            watch(() => addCall.value, (newVal) => {
                if (newVal) {
                    handleNumberFieldFocus();
                }
            }, {immediate:true});
        });

        return {
            store,
            phoneNumber, numberIsValid,
            numberInput, numberField,
            addNumber, doBackspace, backspaceStatus, iconPasteStatus, pasteClipboard,
            addCall, addingSecondCall, isCallingVoicemail, dtmfStr, handleCallEnter,
            callinfo_number, callinfo_name, callinfo_time,
            dailNumber,
            // validateNumber,
            hangUpActiveLine
        }
    }
});

</script>

<template>
	<div class="dialpad-wrapper" data-e2e="dialer">
		<div class="dialpad-display">
			<div v-if="addCall" class="form-textfield">
                <a :class="iconPasteStatus" @click="pasteClipboard">
                    <ContentPaste />
                </a>
				<a :class="backspaceStatus" @click="doBackspace">
					<BackspaceOutline />
				</a>
				<input type="text" ref="numberField" data-e2e="dialer-input"
                    v-model="phoneNumber"
                    @keyup.enter="handleCallEnter($event)"
                    @keydown="numberInput($event)"
                    @paste.prevent="pasteClipboard()"
                    :placeholder="store.state.settings.agentPanel.phonenumbertext"
                >
			</div>
			<div v-else class="dialpad-currentcall-info">
				<div class="dialpad-currentcall-info__number">{{ callinfo_number }}
					<span v-if="dtmfStr.length > 0"> &nbsp;{{ dtmfStr }}</span>
				</div>
				<div v-if="!isCallingVoicemail" class="dialpad-currentcall-info__name">{{ callinfo_name }}</div>
				<div v-if="!isCallingVoicemail" class="dialpad-currentcall-info__time">{{ callinfo_time }}</div>
			</div>
		</div>
		<div class="dialpad-pad">
			<div class="dialpad-pad__key" data-e2e="dialer-one"><a @click="addNumber($event)" data-value="1">1</a></div>
			<div class="dialpad-pad__key" data-e2e="dialer-two"><a @click="addNumber($event)" data-value="2">2</a></div>
			<div class="dialpad-pad__key" data-e2e="dialer-three"><a @click="addNumber($event)" data-value="3">3</a></div>

			<div class="dialpad-pad__key" data-e2e="dialer-four"><a @click="addNumber($event)" data-value="4">4</a></div>
			<div class="dialpad-pad__key" data-e2e="dialer-five"><a @click="addNumber($event)" data-value="5">5</a></div>
			<div class="dialpad-pad__key" data-e2e="dialer-six"><a @click="addNumber($event)" data-value="6">6</a></div>

			<div class="dialpad-pad__key" data-e2e="dialer-seven"><a @click="addNumber($event)" data-value="7">7</a></div>
			<div class="dialpad-pad__key" data-e2e="dialer-eight"><a @click="addNumber($event)" data-value="8">8</a></div>
			<div class="dialpad-pad__key" data-e2e="dialer-nine"><a @click="addNumber($event)" data-value="9">9</a></div>

			<div class="dialpad-pad__key dialpad-pad__key--star" data-e2e="dialer-star"><a @click="addNumber($event)" data-value="*">*</a></div>
			<div class="dialpad-pad__key" data-e2e="dialer-zero"><a @click="addNumber($event)" data-value="0">0</a></div>
			<div class="dialpad-pad__key" data-e2e="dialer-hash"><a @click="addNumber($event)" data-value="#">#</a></div>

			<div class="form-button">
				<button v-if="addCall" @click="dailNumber" :disabled="!numberIsValid" data-e2e="dialer-call-btn">{{ store.state.settings.agentPanel.callbtnlabel }}</button>
				<button v-else class="dialpad-hangupbtn" @click="hangUpActiveLine" data-e2e="dialer-hangup-btn">{{ store.state.settings.agentPanel.hangupbtnlabel }}</button>
			</div>
		</div>
	</div>
	<PbxSettings />
</template>

<style lang="scss" scoped>

  @use "@/scss/includes/font";
  @use "@/scss/includes/globals";
  @use "@/scss/includes/functions" as fn;

  .dialpad-wrapper {
    max-width: 356px;
    padding : .5rem .5rem;
  }

  .dialpad-display {
    position: relative;
    width: 100%;
    padding: 10px;
    .form-textfield {
      background-color: globals.$color-white;
      width: 80%;
      margin: 0 auto;
    }
  }

  .dialpad-display__paste {
    position: absolute;
    display: block;
    top: 17px;
    right: 0;
    width: 40px;
    height: 40px;
    z-index: 10;
    cursor: pointer;
    &--hidden {
      display: none;
    }
    svg {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: globals.$color-gray30;
      &:hover {
        color: globals.$color-gray40;
      }
    }
  }

  .dialpad-display__backspace,
  .dialpad-display__iconpaste {
    position: absolute;
    display: block;
    top: 17px;
    right: 0;
    width: 40px;
    height: 40px;
    // z-index: 10;
    cursor: pointer;
    &--hidden {
      display: none;
    }
    svg {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: globals.$color-gray30;
      &:hover {
        color: globals.$color-gray40;
      }
    }
  }

  .dialpad-pad {
    width: 70%;
    margin: 0 auto;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    padding: 10px 30px;
    user-select: none;
    .form-button {
      width: 100%;
      input[type='button'],
      input[type='submit'],
      button {
        background-color: globals.$color-secondary;
        font-size: 1rem;
        width: 100%;
        &:disabled {
          background-color: globals.$color-gray20;
        }
      }
    }
  }

  .dialpad-pad__key {
    width: 33.333%;
    height: 55px;
    padding: 7px;
    a {
      width: 43px;
      height: 43px;
      line-height: 40px;
      text-align: center;
      color: globals.$color-gray40;
      display: block;
      margin: 0 auto;
      border-radius: 50%;
      border: 2px solid globals.$color-gray20;
      cursor: pointer;
      @include font.font-medium();
      font-size: 1.2rem;
      &:hover {
        border-color: globals.$color-secondary;
      }
    }
    &--star a {
      padding-top: 3px;
    }
  }


  .dialpad-currentcall-info {
    display: block;
    padding: 5px 0;
    text-align: center;
    &__number {
      font-weight: bold;
      font-size: 1.2em;
    }
    &__name {
      font-size: .85em;
      color: globals.$color-gray40;
    }
    &__time {
      font-size: 1em;
      color: globals.$color-gray40;
    }
  }

  .dialpad-hangupbtn {
    background-color: globals.$color-unavailable !important;
  }
</style>