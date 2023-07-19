<script lang="ts">

  const RINGTONES = [
    {
      name      : 'Welcome',
      filename  : 'ringtone01.mp3',
    }, {
      name      : 'Neighbour',
      filename  : 'ringtone02.mp3',
    }, {
      name      : 'Attention',
      filename  : 'ringtone03.mp3',
    }, {
      name      : 'Hey there',
      filename  : 'ringtone04.mp3',
    }, {
      name      : 'Gallop',
      filename  : 'ringtone05.mp3',
    }, {
      name      : 'Answer',
      filename  : 'ringtone06.mp3',
    },
  ]

  import { useStore }            from 'vuex';
  import { useSetDevice }        from '../../use/setDeviceFunction';
  import { IPCCCUserSettings }   from '../../ipccc/js/usersettings.js';
  import VolumeSlider            from '../uielements/VolumeSlider.vue';
  import PlayButton              from '../uielements/PlayButtonMp3.vue';
//   import BoxProps, { ModalType } from '../../types/BoxProps';
  import { WebRTCPhoneInfo }     from '../../types/Phone';
  import { useJabraWebHID }      from '../../use/useJabraWebHID';

  import {
          onUnmounted,
          ref,
          inject,
          watch,
          computed,
          onMounted,
          defineComponent,
         }                       from 'vue';
  import {
          MinusCircle,
          PhoneCheckOutline,
          PhoneAlertOutline,
          Headphones,
          Refresh,
          Lock,
          Cancel,
          LanConnect,
          LanDisconnect,
         }             from 'mdue';
import { Logging } from '../../ipccc/lib/logging';
import { currentLocalDateTimeISO } from '../../use/dateFunctions';

  export default defineComponent({
    name: 'BrowserPhone',
    components: {
      VolumeSlider,
      PlayButton,
      MinusCircle,
      PhoneCheckOutline,
      PhoneAlertOutline,
      Headphones,
      Refresh,
      Lock,
      Cancel,
      LanConnect,
      LanDisconnect
    },
    props: {
      doNotDisturb : {
        type    : Boolean,
        default : false
      }
    },
    setup() {
		const store:object | any           = useStore(),
			setDeviceFn                    = useSetDevice(),
			number                         = ref<string>('-'),
			settingsOpen                   = ref<boolean>(false),
			outputVolume                   = ref<number>(100),
			outputDevice                   = ref<string>('default'),
			outputDeviceList               = ref<Array<object | any>>([]),
			inputDevice                    = ref<string>('default'),
			inputDeviceList                = ref<Array<object | any>>([]),
			ringtoneDevice                 = ref<string>(''),
			selectedRingtone               = ref<string>(RINGTONES[3].filename),
			ringtoneList                   = ref<Array<object | any>>(RINGTONES),
			soundPath                      = ref<string>(window.siteroot + '/assets/sounds/'),
			saveTimer                      = ref<object | any>(null),
			registeredState                = ref<boolean>(false),
			activatedState                 = ref<boolean>(false),
			rotateIcon                     = ref<boolean>(false),
			ringtonePlayer                 = ref(null),
			outputVolumeSlider             = ref(null),
			createSoundUrl                 = computed(() => window.siteroot + '/assets/sounds/' + selectedRingtone.value),
			activatedIcon                  = computed(() => activatedState.value ? null : 'Cancel'), //deactivatedbyblocking is omitted since 24362
			registeredIcon                 = computed(() => registeredState.value ? 'LanConnect' : 'LanDisconnect'),
			txtActivatedIcon               = computed(() => !activatedState.value ? store.state.settings.browserphone.deactivatedlbl : ''),
			txtRegisteredIcon              = computed(() => registeredState.value ? store.state.settings.browserphone.registeredlbl : store.state.settings.browserphone.notregisteredlbl),
			browserphoneStatus             = computed(() => activatedState.value && registeredState.value),
			filteredOutputDevices          = computed(() => outputDeviceList.value.filter(device => device.deviceId !== outputDevice)),
            hasJabraDevice                 = ref(false),
            useJabraWebHIDFn               = useJabraWebHID();

		let sipCall:object | any       = inject('sipCall');

		watch(settingsOpen, (newStatus, oldStatus) => {
			if(newStatus != oldStatus && !store.state.commands.Hangup)
				getDevices();
			if(!newStatus)
				stopPlayingAll();
		});

		const setTestRingtoneDevice = () => {
			let _deviceIds = [];
			if(ringtoneDevice.value !== '')
			_deviceIds.push(outputDevice.value);

			if(ringtoneDevice.value !== '')
			_deviceIds.push(ringtoneDevice.value);

			ringtonePlayer.value.setOutPutDevice([outputDevice.value, ringtoneDevice.value]);
			outputVolumeSlider.value.setOutPutDevice([outputDevice.value, ringtoneDevice.value]);
		}

		const updateOutputValue = (value) => {
			clearTimeout(saveTimer.value);
			outputVolume.value = value;
			ringtonePlayer.value.stopPlaying();
			ringtonePlayer.value.setVolume(outputVolume.value);
			sipCall.value.setOutputVolume(outputVolume.value);
			saveTimer.value = setTimeout(() => {
			clearTimeout(saveTimer.value);
				saveSettings();
			}, 1000);
		}

		const setOutputDevice = () => {
			setTestRingtoneDevice();
			sipCall.value.setVoiceOutput(outputDevice.value);
			saveSettings();
		}

		const setInputDevice = () => {
			sipCall.value.setVoiceInput(inputDevice.value);
			saveSettings();
		}

		const setRingtoneDevice = () => {
			setTestRingtoneDevice();
			sipCall.value.setExtraRingtoneOutput(ringtoneDevice.value);
			saveSettings();
		}

		const setRingtone = () => {
			outputVolumeSlider.value.hardStopPlaying();
			ringtonePlayer.value.stopPlaying();
			sipCall.value.setRingtone(selectedRingtone.value);
			setTestRingtoneDevice();
			saveSettings();
			setTimeout(_ => {
			ringtonePlayer.value.playAudio();
			}, 100)
		}

		const stopVolumeTest = () => {
			outputVolumeSlider.value.hardStopPlaying();
		}

		const stopPlayingAll = () => {
			stopVolumeTest();
			ringtonePlayer.value.stopPlaying();
		}

		const checkSavedSettings = () => {
			outputDevice.value    = outputDeviceList.value.find(device => device.deviceId === outputDevice.value)   ? outputDevice.value   : "default";
			inputDevice.value     = inputDeviceList.value.find( device => device.deviceId === inputDevice.value)    ? inputDevice.value    : "default";

			ringtoneDevice.value  = ringtoneDevice.value === "" ? "" : outputDeviceList.value.find(device => device.deviceId === ringtoneDevice.value) ? ringtoneDevice.value : "default";

			sipCall.value.setRingtone(selectedRingtone.value);
			sipCall.value.setExtraRingtoneOutput(ringtoneDevice.value);
			sipCall.value.setVoiceOutput(outputDevice.value);
			sipCall.value.setVoiceInput(inputDevice.value);

			updateOutputValue(outputVolume.value);

			setTestRingtoneDevice();
		}

		const getDevices = () => {
			return new Promise<void>((resolve, reject) => {
				navigator.mediaDevices.getUserMedia({audio: true})
				.then(succes => {
					navigator.mediaDevices.enumerateDevices()
					.then(list => {
						outputDeviceList.value = [];
						inputDeviceList.value  = [];

						list.forEach(device => {
							if(device.kind === 'audiooutput') {
                                outputDeviceList.value.push({
                                    deviceId : device.deviceId,
                                    groupId  : device.groupId,
                                    label    : device.deviceId === 'default' ? store.state.settings.browserphone.defaultdevicelbl : device.label,
                                });
                            } else {
                                inputDeviceList.value.push({
                                    deviceId : device.deviceId,
                                    groupId  : device.groupId,
                                    label    : device.deviceId === 'default' ? store.state.settings.browserphone.defaultdevicelbl : device.label,
                                });
                            }
						});

						let _listOutput = outputDeviceList.value.reduceRight((cum, device, index, self) => {
							let __isThere = cum.findIndex(d => d.groupId === device.groupId) !== -1;
							if(device.deviceId === 'default' || !__isThere)
							cum = [...cum, device];
							return cum;
						}, []);
						outputDeviceList.value = _listOutput.reverse();
						let _listInput = inputDeviceList.value.reduceRight((cum, device, index, self) => {
							let __isThere = cum.findIndex(d => d.groupId === device.groupId) !== -1;
							if((device.deviceId === 'default' || !__isThere) && device.deviceId !== '' )
							cum = [...cum, device];
							return cum;
						}, []);

						inputDeviceList.value = _listInput.reverse();
						checkSavedSettings();
						resolve();
					});
				})
				.catch(error => {
					reject(error);
					// console.error(error);
					//showModalDialog(new BoxProps(ModalType.Alert, store.state.settings.dialog.dialogalertheader, store.state.settings.browserphone.noaudioerror));
				});
			});
		}

		// ========================== REGISTERED EVENT HANDLERS =========================== //

		const unsubscribe = store.watch(store.getters.getPushNotificationMsg, message => {
			if(message == 'webrtc_register') {
				//reset pushnotification: ready for new webrtc_register via pushnotification
                Logging.WriteAlways(`[${currentLocalDateTimeISO()}] webrtc_register: received, going to unregister then register`);
				store.commit('SET_PUSHNOTIFICATION_MESSAGE', '');
                //23399 - First unRegister then register (don't wait for the unregister or the register will not be invoked)
                setDeviceFn.unRegisterWebPhone(store.getters.getCurrentSelWebRTCDevice())
                .then(() => {
                    setDeviceFn.registerWebPhone(store.getters.getCurrentSelWebRTCDevice())
                })
                .catch((e) => {
                    setDeviceFn.registerWebPhone(store.getters.getCurrentSelWebRTCDevice())
                    console.error(e);
                });
                if (store.getters.getHasWebPhone()) {
                    setDeviceFn.handleWebRTCErrorState();
                }
			}
		});

		const pannelHandler = (evt) => {
			const _checkPannel = (elm, pannelClass, checkBoxClass, status) => {
                let _isThere = elm.classList.contains(pannelClass);
                if(elm.classList.contains(checkBoxClass) && status) {
                    _isThere = true;
                    return _isThere;
                }
                if(_isThere && !elm.classList.contains(checkBoxClass)) {
                    return _isThere;
                } else {
                    if(elm.parentElement && elm.parentElement.tagName.toUpperCase() !== 'BODY') {
                        return _checkPannel(elm.parentElement, pannelClass, checkBoxClass, status);
                    } else {
                        return _isThere;
                    }
                }
            }

			settingsOpen.value = (_checkPannel(evt.target, 'browserphone-settings-pannel', 'toggle_browserphone__label', settingsOpen.value));
		}

		//For debugging purposes
		const testWebPhoneHandler = evt => {
			if (evt.shiftKey && evt.ctrlKey && evt.altKey && evt.key === 'ArrowLeft') {
				setDeviceFn.unRegisterWebPhone(store.getters.getCurrentSelWebRTCDevice()).catch((e) => console.error(e));
			}
			if (evt.shiftKey && evt.ctrlKey && evt.altKey && evt.key === 'ArrowRight') {
                setDeviceFn.registerWebPhone(store.getters.getCurrentSelWebRTCDevice()).catch((e) => console.error(e));
			}
            if (evt.shiftKey && evt.ctrlKey && evt.altKey && evt.key === 'ArrowDown') {
                setDeviceFn.destroyWebPhoneSession().catch((e) => console.error(e));
            }
		}

		const addListeners = () => {
			document.addEventListener('click', pannelHandler, false);
			[...document.querySelectorAll('iframe')].forEach(_iframe => {
				if (_iframe.contentDocument)
					_iframe.contentDocument.body.addEventListener('click', () => {settingsOpen.value = false}, false);
			});
			//For debugging purposes
			document.addEventListener('keydown', testWebPhoneHandler, false);
		}

		const saveSettings = () => {
			let _audioSettings = {
			outputVolume       : outputVolume.value,
			outputDevice       : outputDevice.value,
			inputDevice        : inputDevice.value,
			ringtoneDevice     : ringtoneDevice.value,
			selectedRingtone   : selectedRingtone.value,
			};

			IPCCCUserSettings.Save('AudioSettings', 'AudioUserSettings', JSON.stringify(_audioSettings)).catch(error => {
			console.error(error);
			})
		}

		const getAndSetSettings = () => {
			return new Promise<void>((resolve, reject) => {
                IPCCCUserSettings.Get('AudioSettings')
                .then(result => {
                    if(result.length > 0 && result[0].Name == 'AudioUserSettings') {
                        let _data = JSON.parse(result[0].Data);
                        outputVolume.value     = _data.outputVolume;
                        outputDevice.value     = _data.outputDevice;
                        inputDevice.value      = _data.inputDevice;
                        ringtoneDevice.value   = _data.ringtoneDevice;
                        selectedRingtone.value = _data.selectedRingtone;
                    } else {
                    //NO SETTINGS FOUND ALL DEFAULT;
                    }
                    resolve();
                })
                .catch(error => {
                    console.error(error);
                });
			});
		}

		const registerWebPhone = () => {
			rotateIcon.value = true;
			setDeviceFn.registerWebPhone(store.getters.getCurrentSelWebRTCDevice())
			.then(() => {
					rotateIcon.value = false;
			})
			.catch(e => {
                setTimeout(() => { rotateIcon.value = false }, 200);
				console.error(e);
			})
		}

        const handleJabraWebHID = () => {
            //init Jabra
            useJabraWebHIDFn.initJabraWebHID()
            .then(() => {})
            .catch((e) => console.error(e));
        }


        watch(store.getters.getHasHIDCallControle, (newState, oldState) => {
            // console.log('getHasHIDCallControle', newState);
            if(newState && newState !== oldState) {
                useJabraWebHIDFn.callLock().then(() => {
                    // console.log('callLock');
                })
                .catch((err) => console.error(err))
            }
        });

        watch(store.getters.getWebRTCPhoneInfo, (newState:WebRTCPhoneInfo) => {
                registeredState.value = newState.Registered;
                activatedState.value = newState.Activated;
            }, { immediate:true, deep:true }
        );

		onMounted(() => {
			getDevices()
			.then(succes => {
				getAndSetSettings().then(() => {
					number.value = store.getters.getCurrentSelDevice().Address;
					checkSavedSettings();

                    //init Jabra if Jabra is an inputdevice
                    hasJabraDevice.value = inputDeviceList.value.findIndex(el => {
                        if(el.label.includes('Jabra')) return el;
                    }) !== -1;
                    if (hasJabraDevice.value) {
                        handleJabraWebHID();
                    }

					store.watch(store.getters.getCurrentSelDevice, device => {
                        if(device.MACAddress.toUpperCase().startsWith("WEBRTC")) {
                            number.value = device.Address;
                        }
					});

					addListeners();
				});
			})
			.catch(e => console.error(e));
		});

		onUnmounted(() => {
			unsubscribe();
			document.removeEventListener('click', pannelHandler, false);
			document.removeEventListener('keydown', testWebPhoneHandler, false);
		});

		return {
			store,
			updateOutputValue, setOutputDevice, setInputDevice, inputDevice,
			setRingtoneDevice, setRingtone, stopVolumeTest, selectedRingtone,
			registerWebPhone, soundPath, ringtoneDevice,
			ringtonePlayer, outputVolume, outputVolumeSlider, ringtoneList,
			outputDeviceList, inputDeviceList, outputDevice,
			createSoundUrl, activatedIcon, activatedState, registeredIcon,
			txtActivatedIcon, txtRegisteredIcon, registeredState,
			browserphoneStatus, settingsOpen, number, filteredOutputDevices,
			rotateIcon, hasJabraDevice
		}
    }
})
</script>

<template>
    <div class="browserphone-menu" data-e2e="browser-phone">
		<input type="checkbox" name="toggle_browserphone-menu" id="toggle_browserphone-menu" v-model="settingsOpen">
        <label v-if="doNotDisturb" title="Do not disturb" class="toggle_browserphone__label toggle_browserphone__label--warn" for="toggle_browserphone-menu">DND</label>
        <label v-else :class="['toggle_browserphone__label', {'toggle_browserphone__label--alert' : !browserphoneStatus}]" for="toggle_browserphone-menu">{{ number }}</label>
        <PhoneCheckOutline v-if="browserphoneStatus && !doNotDisturb" class="toggle_browserphone__icon" />
        <PhoneAlertOutline v-else class="toggle_browserphone__icon toggle_browserphone__icon--alert" />
		<!-- <span :class="['toggle_browserphone__statusicon', {'toggle_browserphone__statusicon--registered' : browserphoneStatus}]"></span> -->

		<div :class="['browserphone-settings-pannel', {'browserphone-settings-pannel--open' : settingsOpen}]">
			<div class="grid-row">
                <div class="grid-unit--gamma--double detailscreen-wrapper__title">
                    <span class="detailscreen__title detailscreen__title--underline">{{ store.state.settings.browserphone.settingstitle }}</span>
                </div>
                <div class="grid-unit--gamma">
                    <Headphones v-show="hasJabraDevice" id="jabra-webhid-consent-button" />
                </div>
			</div>
			<div class="grid-row">
                <div class="grid-unit--beta">
                    <VolumeSlider
                    :label        = store.state.settings.browserphone.outputvolume
                    :min          = "0"
                    :max          = "100"
                    :step         = "1"
                    :value        = outputVolume
                    :sound        = createSoundUrl
                    :iscalling    = store.state.commands.Hangup
                    @update       = updateOutputValue
                    ref           = "outputVolumeSlider"
                    />
                </div>
                <div class="grid-unit--beta">
                    <div class="form-textfield form-textfield--bground" v-if="!activatedState">
                        <span v-if="activatedIcon" :class="['fonticon', activatedIcon]"><component :is="activatedIcon" /></span>
                        <input type="text" name="activatedicon" id="activatedicon" v-model="txtActivatedIcon" disabled>
                        <label for="activatedicon" class="form-label form-label--hidden">{{ store.state.settings.browserphone.voipstatelbl }}</label>
                    </div>

                    <div class="form-textfield form-textfield--bground" v-if="activatedState">
                        <span :class="['fonticon', registeredIcon]"><component :is="registeredIcon" /></span>
                        <input type="text" name="registeredicon" id="registeredicon" v-model="txtRegisteredIcon" disabled>
                        <label for="activatedicon" class="form-label form-label--hidden">{{ store.state.settings.browserphone.voipstatelbl }}</label>
                        <label for="voipdetail-refreshicon" class="form-label form-label--hidden"></label>
                        <span v-if="!registeredState || rotateIcon" @click="registerWebPhone()" :class="['voipdetail-refreshicon', {'voipdetail-refreshicon--rotate' : rotateIcon }]"><Refresh /></span>
                    </div>


                </div>
			</div>
			<div class="grid-row">
                <div class="grid-unit--beta">
                    <div class="form-selectfield form-selectfield--inline-bground">
                    <label class="form-label form-label--hidden form-label--lowered">{{ store.state.settings.browserphone.outputdevice }}</label>
                    <select v-model="outputDevice" @change="setOutputDevice" :disabled="store.state.commands.Hangup">
                        <option v-for="device in outputDeviceList" :value="device.deviceId">{{ device.label }}</option>
                    </select>
                    </div>
                </div>
                <div class="grid-unit--beta">
                    <div class="form-selectfield form-selectfield--inline-bground">
                    <label class="form-label form-label--hidden form-label--lowered">{{ store.state.settings.browserphone.inputdevice }}</label>
                    <select v-model="inputDevice" @change="setInputDevice" :disabled="store.state.commands.Hangup">
                        <option v-for="device in inputDeviceList" :value="device.deviceId">{{ device.label }}</option>
                    </select>
                    </div>
                </div>
			</div>
			<div class="grid-row">
                <div class="grid-unit--beta">
                    <div class="form-selectfield form-selectfield--inline-bground ">
                        <label class="form-label form-label--hidden form-label--lowered">{{ store.state.settings.browserphone.ringtone }}</label>
                        <div class="ringtone-select">
                            <Play-button
                            :soundUrl     = "soundPath + selectedRingtone"
                            :volume       = "outputVolume"
                            :disabled     = "store.state.commands.Hangup"
                            @playPressed  = "stopVolumeTest"
                            ref           = "ringtonePlayer"
                            />
                            <select v-model="selectedRingtone" @change="setRingtone" :disabled="store.state.commands.Hangup">
                                <option v-for="ringtone in ringtoneList" :value="ringtone.filename">{{ ringtone.name }}</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="grid-unit--beta">
                    <div class="form-selectfield form-selectfield--inline-bground">
                        <label class="form-label form-label--hidden form-label--lowered">{{ store.state.settings.browserphone.ringtonedevice }}</label>
                        <select v-model="ringtoneDevice" @change="setRingtoneDevice" :disabled="store.state.commands.Hangup">
                            <option value="">{{ store.state.settings.browserphone.noextraringtonedevice }}</option>
                            <option v-for="device in filteredOutputDevices" :key="device.deviceId" :value="device.deviceId">{{ device.label }}</option>
                        </select>
                    </div>
                </div>
			</div>
		</div>
    </div>
</template>

<style lang="scss" scoped>

@use "@/scss/includes/functions";
@use "@/scss/includes/globals";

.browserphone-menu {
    display: block;
    position: relative;
    width: 90px;
    height: 80px;
    float: left;
    background-color: globals.$color-white;
    color: globals.$color-home;
    font-size: .67em;
    letter-spacing: -0.1px;
    text-align: center;
    white-space: nowrap;
    font-family: 'Abel', sans-serif;
    cursor: pointer;
    text-decoration: none;
    .toggle_browserphone__icon-dnd {
        position: absolute;
        fill: globals.$color-unavailable;
        font-size: 1rem;
        inset: 36px 0 0 27px;
        z-index: 1;
    }
    .toggle_browserphone__icon,
    .webhid__connect__icon {
        position: absolute;
        top: 32px;
        left: 50%;
        -webkit-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        font-size: 1.6rem;
        pointer-events: none;
    }
    .toggle_browserphone__icon,
    .toggle_browserphone__label {
        &--alert {
            color: globals.$color-unavailable;
        }
    }
    .toggle_browserphone__label {
        position: relative;
        display: block;
        width: 100%;
        height: 80px;
        background-color: globals.$color-white;
        padding-top: 54px;
        cursor: pointer;
        &--warn {
            color: globals.$color-unavailable;
            font-weight: bold;
        }
    }
    input[type='checkbox'] {
        position: absolute;
        left: -10000px;
        z-index: 10;
        &:checked + .toggle_browserphone__label {
            background-color: globals.$color-gray5;
            &:before {
                color: globals.$color-home;
            }
        }
    }
    [class*="grid-unit"] {
        padding: .5rem 1rem;
    }
    &--disabled {
        background-color: globals.$color-gray2;
        color: globals.$color-gray20;
    }
    // .toggle_browserphone__statusicon {
    //     display: block;
    //     position: absolute;
    //     width: 12px;
    //     height: 12px;
    //     left: 47px;
    //     top: 33px;
    //     background-color: globals.$color-reporting;
    //     border: 2px solid globals.$color-white;
    //     border-radius: 6px;
    //     z-index: 10;
    //     &--registered {
    //         display: none;
    //     }
    // }
}

.browserphone-settings-pannel {
    position: absolute;
    right: 0;
    top: -2000px;
    min-width: 500px;
    width: 600px;
    min-height: 100px;
    padding: 0 1rem;
    box-shadow: 0 2px 3px 0 rgba(0,0,0,.2);
    border-radius: 0 0 2px 2px;
    border-top: 1px solid globals.$color-gray20;
    background-color: globals.$color-white;
    cursor: default;
    &--open {
        top: 100%;
    }
}

.detailscreen__title--underline {
    border-bottom: 1px solid globals.$color-gray10;
}

.ringtone-select {
    select {
    width: calc(100% - 25px);
    }
    [class^="button__icon"] {
        margin-top: 12px;
        margin-right: 5px;
        margin-left: -2px;
        width: 25px;
        height: 25px;
        line-height: 25px;
        span {
            width: 24px;
        }
    }
}

.browserphone-menu .form-textfield.form-textfield--bground {
    margin-top: 0;
}

.fonticon {
    display: inline-block;
    font-size: 1.5rem;
    &.LanConnect {
        color: globals.$color-secondary;
    }
    &.Cancel,
    &.LanDisconnect,
    &.Lock {
        color: globals.$color-unavailable;
    }
}
.voipdetail-refreshicon {
    font-size: 1.5rem;
    color: globals.$color-gray40;
    cursor: pointer;
    &.voipdetail-refreshicon--rotate svg {
        animation: rotate .5s linear infinite;
    }
}
@keyframes rotate {
    100% {
        transform: rotate(360deg);
    }
}
input#activatedicon, input#registeredicon {
    margin-right: -65px;
}

#jabra-webhid-consent-button {
    display: block;;
    color: green;
    font-size: 1.6rem;
    margin: 0 0 0 auto;
    cursor: pointer;
    padding: 10px;
    width: 40px;
    height: 40px;
}

</style>