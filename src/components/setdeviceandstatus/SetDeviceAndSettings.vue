<template>
    <div>
        <div class="app-wrapper__login" data-e2e="set-device-and-settings">
            <div class="app-wrapper__login-left" :style="store.state.backgroundStyle">
                <div class="app-wrapper__login-quote" v-html="store.state.quote"></div>
            </div>
            <div class="app-wrapper__login-right">
                <h2 class="typo--h2-as-h1">{{ title }}</h2>
                <form action="" onsubmit="return false;">
                    <legend>Locatie</legend>
                    <fieldset>
                        <div class="form-errorbox" v-bind:class="{'form-errorbox--show' : showBox, 'form-errorbox--as-message' : !isError}" v-html="msg"></div>
                        <div v-if="!pincode">
                            <InputSelect v-if="askfornr && !workplace"
                                :inputselectfield="selDevInputSelect"
                                @changevalue="defaultSelectedDeviceChanged"
                                @inputfocus="resetMsg"
                            />
                            <SelectField v-else
                                v-model="defaultSelectedDevice"
                                :list="deviceList" keyprop="Name" valprop="Name" lblprop="Name" :defaultlbl="store.getters.getLangLabel('defaultlbldevicelist')"
                                @focus="resetMsg"
                            />
                            <SelectField v-if="isMounted"
                                v-model.number="status"
                                :list="statusList" keyprop="Label" valprop="StatusId" data-e2e="userstatus" lblprop="Label" :defaultlbl="store.getters.getLangLabel('defaultlblstatuslist')" valdefaultlbl="-1"
                                @focus="resetMsg"
                            />
                            <InputSelect v-if="isMounted"
                                data-e2e="personalstatustext"
                                :inputselectfield="persStatusTxtInputSelect"
                                @changevalue="personalMessageChanged"
                                @inputfocus="resetMsg"
                            />
                            <div :class="['form-button form-button--green form-button--login', {'form-button--disabled' : !isValid}]" >
                                <button id="deviceBtn" ref="deviceBtn" @click="setDevice">{{ store.getters.getLangLabel('devicebtnlabel') }}</button>
                            </div>
                            <div class="form-radiobar">
                                <input type="radio" id="lang_nl" name="lang" v-model="selectedLang" value="nl">
                                <label for="lang_nl">{{ store.getters.getLangLabel('lang.nl') }}</label>
                                <input type="radio" id="lang_en" name="lang" v-model="selectedLang" value="en">
                                <label for="lang_en">{{ store.getters.getLangLabel('lang.en') }}</label>
                                <input type="radio" id="lang_de" name="lang" v-model="selectedLang" value="de" disabled>
                                <label for="lang_de" style="cursor:not-allowed;">{{ store.getters.getLangLabel('lang.de') }}</label>
                            </div>
                        </div>
                        <div class="app-pincode" v-else>{{ pincodeNr }}</div>
                    </fieldset>
                </form>
            </div>

        </div>
        <div class="app-wrapper__background">
            <div :style="store.state.backgroundStyle"></div>
        </div>
    </div>
</template>

<script lang="ts">

const UNSAVEDNOTE_STATUSID   = 3; //only StateId to choose when there is an unsavedNote

import { ref, watch, inject, computed, onUpdated, onMounted, defineComponent, watchEffect, onUnmounted, nextTick } from 'vue';
import { useStore }                 from 'vuex';
import { useRouter }                from 'vue-router';
import InputSelect                  from '../uielements/InputSelect.vue';
import InputSelectProps             from '../../types/InputSelectProps';
import SelectField                  from '../uielements/SelectField.vue';
import { Device, MappedDeviceOptions } from './../../types/Device';
import UserStatus                   from '../../types/UserStatus';
import { Support }                  from '../../ipccc/lib/support.js';
import { IPCCC }                    from '../../ipccc/js/ipccc';
import { IPCCCStatus }              from '../../ipccc/js/status.js';
import { IPCCCData }                from '../../ipccc/js/data';
import { IPCCCContacts }            from '../../ipccc/js/contacts.js';
import { IPCCCConfigurator }        from '../../ipccc/js/configurator.js';
import { IPCCCCallControl, UnknownDeviceResult } from '../../ipccc/js/callcontrol.js';
import { deepCopy }                 from '../../use/helperFunctions';
import { useDeviceRequirements }    from '../../use/useDeviceRequirements';
import { IPCCCPush }                from '../../ipccc/serviceworker/push.js';

export default defineComponent({
    name: 'SetDeviceAndSettings',
    components: {
      InputSelect,
      SelectField
    },
    setup() {
		const showLoader:Function        = inject('showLoader'),
			switchLang:Function        = inject('switchLang'),
			setSoftPhone:Function      = inject('setSoftPhone'),
			store:object | any         = useStore(),
			router                     = useRouter(),
			defaulttitle               = ref(''),
			title                      = ref(''),
			defaultmsg                 = ref(''),
			msg                        = ref(''),
			deviceBtn                  = ref(null),
			selectedLang               = ref(<string>store.getters.getLang()),
            askfornr                   = IPCCC.LoginSession.Details.AskForPhoneNumber as Boolean,
            workplace                  = IPCCC.LoginSession.Details.WorkplaceLogin as Boolean,
            unsavedNote                = IPCCC.LoginSession.Note as Object,
            unsavedNoteStatusId        = UNSAVEDNOTE_STATUSID,
            pincodeNr                  = ref(''),
            pincode                    = ref(false),
            showBox                    = ref(true),
            isError                    = ref(false),
            isMounted                  = ref(false),
            isValid                    = ref(false),
            mappedDeviceOptions        = ref<MappedDeviceOptions[]>([]),
            defaultSelectedDevice      = ref(''),
            selDevInputSelect          = computed(() => new InputSelectProps(mappedDeviceOptions.value, defaultSelectedDevice.value, 'Address', true)),
			deviceList                 = computed(() => <Device[]>store.getters.getDeviceList()),
			mappedMessageOptions       = ref([]),
			userStatusTextList         = ref(store.state.settings.statusmessage.predefinedmsg),
            personalMessage            = ref(''),
            persStatusTxtInputSelect   = computed(() => new InputSelectProps(mappedMessageOptions.value, personalMessage.value)),
			status                     = ref(-1),
			statusList                 = ref<UserStatus[]>([]),
			useDeviceRequirementsFn    = useDeviceRequirements();

		let sipCall:object | any       = inject('sipCall'),
            cachedPersonalMessage      = '';

		watchEffect(() => mappedDeviceOptions.value = deviceList.value.map(d => ({'label' : d.Name, 'value' : d.Name, 'Address' : d.Address}) ) );
		watchEffect(() => mappedMessageOptions.value = userStatusTextList.value.map(d => ({'label' : d, 'value' : d}) ) );

		watch(selectedLang, (newVal, oldVal) => {
			if(oldVal !== newVal) {
				switchLang(newVal);
				msg.value = store.getters.getLangLabel('devicedefaultmsg');
				store.dispatch('UPDATE_DEVICELIST_WEBRTCLBLS', deviceList.value).then(() => {
					if(newVal == 'nl')
						defaultSelectedDevice.value = defaultSelectedDevice.value.replace('Browserphone', store.getters.getLangLabel('voipaccounts.webrtcuiname'));
					else
						defaultSelectedDevice.value = defaultSelectedDevice.value.replace('Browsertelefoon', store.getters.getLangLabel('voipaccounts.webrtcuiname'));
				});
			}
		});

		const setDefaultDevice = () => {
			let defaultObject = deviceList.value.filter( ( obj:Device ) => {
				return obj.IsDefault == true;
			});
			if(defaultObject && defaultObject.length != 0) {
				defaultSelectedDevice.value = defaultObject[0].Name;
			} else {
				defaultSelectedDevice.value = 'Geen toestel';
			}
		};

		const setDefaultStatus = (statusid = null) => {
			if(statusList.value.length > 0) {
				status.value         = statusid ? statusid : statusList.value[0].StatusId;
				store.state.statusId = status.value;
				checkForm();
				if(isValid.value) {
					deviceBtn.value.focus();
				}
			}
		};

		const setDevice = (evt:Event):void => {
			if(isValid.value && defaultSelectedDevice.value !== 'Geen toestel') {
				showLoader(true);

				let _selObj = deviceList.value.filter(obj => {
					if(obj) {
						if(obj.MACAddress.toUpperCase().startsWith("WEBRTC")) {
							return `${store.state.settings.voipaccounts.webrtcuiname} (${obj.Address})` === defaultSelectedDevice.value;
						} else {
							return obj.Name == defaultSelectedDevice.value;
						}
					} else {
						return;
					}
				});

				//Check selected device for requirements
				if(_selObj && _selObj.length > 0) {
					useDeviceRequirementsFn.validateDevice(_selObj[0]).then((enabled) => {
						if(enabled) {
							handleDevice(_selObj);
						} else {
							showLoader(false);
							return;
						}
					});
				} else {
					handleDevice(_selObj);
				}
			} else {
				store.commit('SET_CURRENT_DEVICENAME', 'Geen toestel');
				store.commit('SET_CURRENT_SELECTED_DEVICE', deviceList.value[0]);
				store.commit('SET_CURRENT_SELECTED_WEBRTC_DEVICE', {});
				store.commit('SET_PREVIOUS_DEVICENAME', 'Geen toestel');
				setDeviceSucces();
			}
		}

		const handleDevice = (_selObj) => {
			const toBit = boul => {
				return boul ? 1 : 0;
			}

			const _setPhone = () => {

				if(_selObj.length > 0 && _selObj[0].MACAddress.toUpperCase().startsWith("WEBRTC")) {
					const setThePhone = () => {
						let _sipaddress     = _selObj[0].SIPAddress,
							_username       = _selObj[0].Username,
							_name           = _selObj[0].Name,
							_password       = _selObj[0].Password,
							_registar       = 'sip:' + _selObj[0].Registrar;

                        const registerThePhone = () => {
                            sipCall.value.registerSip(_registar, _sipaddress, _username, _name, _password, () => {
                                store.commit('SET_CURRENT_SELECTED_WEBRTC_DEVICE', _selObj[0]);
                                IPCCCCallControl.SetDevice(_selObj[0].Address, toBit(_selObj[0].IsWorkplace))
                                .then(succes => {
                                    store.commit('SET_CURRENT_SELECTED_DEVICE', _selObj[0]);
                                    store.commit('SET_CURRENT_DEVICENAME', _selObj[0].Name);
                                    store.commit('SET_PREVIOUS_DEVICENAME', _selObj[0].Name);
                                    setDeviceSucces(succes);
                                })
                                .catch(error => {
                                    console.error(error);
                                    setDeviceError(error);
                                });
                            }, error => {
                                console.error(error);
                                setDeviceError(error);
                            });
                        }

                        sipCall.value.unregisterSip(_registar, _sipaddress, _username, _name, _password, (result) => {
                            registerThePhone();
                        }, error => {
                            registerThePhone();
                        });
					};

					if(sipCall.value) {
						setThePhone();
					} else {
						setSoftPhone(() => {
							setThePhone();
						}, error => {
							console.error('Error: initSoftPhone failed', error);
						}, _selObj[0].Config);
					}

				} else {
					store.commit('SET_CURRENT_SELECTED_WEBRTC_DEVICE', {});
					if(_selObj && _selObj.length > 0) {
						IPCCCCallControl.SetDevice(_selObj[0].Address, toBit(_selObj[0].IsWorkplace))
						.then(succes => {
							store.commit('SET_CURRENT_SELECTED_DEVICE', _selObj[0]);
							store.commit('SET_CURRENT_DEVICENAME', _selObj[0].Name);
							store.commit('SET_PREVIOUS_DEVICENAME', _selObj[0].Name);
							setDeviceSucces(succes);
						})
						.catch(error => {
							console.error(error);
							setDeviceError(error);
						});
					} else {
						//PINCODE
						IPCCCCallControl.SetDevice(defaultSelectedDevice.value, false)
						.then(succes => {
							store.commit('SET_CURRENT_DEVICENAME', defaultSelectedDevice.value);
							store.commit('SET_PREVIOUS_DEVICENAME', defaultSelectedDevice.value);
							if(typeof succes !== 'undefined' && succes.Pincode === '') {//NUMMER WAT AL BESTAAT INGEVULD
								//HAAL DEVICE OP EN STEL HEM IN ALS CURRENT SELECTED
								let _selObj = deviceList.value.filter(device => device.Address == defaultSelectedDevice.value);
								store.commit('SET_CURRENT_SELECTED_DEVICE', _selObj[0]);
								store.commit('SET_CURRENT_DEVICENAME', _selObj[0].Name);
								store.commit('SET_PREVIOUS_DEVICENAME', _selObj[0].Name);
								setDeviceSucces(succes);
							} else if(String(defaultSelectedDevice.value).indexOf('Browser') !== -1) {//BROWSERPHONE GEEN PINCODE AUB
								setDeviceSucces(succes);
							} else {
								setDeviceSucces(succes);
							}
						})
						.catch(error => {
							console.error(error);
							setDeviceError(error);
						});
					}
				};
			}

			if(Object.keys(store.getters.getCurrentSelWebRTCDevice()).length > 0) {
                let _storedObj     = store.getters.getCurrentSelWebRTCDevice(),
					__sipaddress   = _storedObj.SIPAddress,
					__username     = _storedObj.Username,
					__name         = _storedObj.Name,
					__password     = _storedObj.Password,
					__registar     = 'sip:' + _storedObj.Registrar;

                setSoftPhone(() => {
                    _setPhone();
                }, error => {
                    console.error('Error: initSoftPhone failed [', error, ']');
                }, _storedObj.Config);

			} else {
				_setPhone();
			};
		};

        const isWin11 = ():boolean => {
            const userAgent = navigator.userAgent;
            const isWindows10 = userAgent.indexOf("Windows NT 10.0") > -1;
            const isWindows11 = userAgent.indexOf("Win64; x64") > -1;
            return isWindows10 && isWindows11;
        };

        const isWebRTC = ():boolean => {
            return store.getters.getCurrentSelDevice()?.BrandType.toLowerCase() == 'webrtc';
        };

        const notInCall = ():boolean => {
            return !store.state.commands.Hangup;
        };

        const getTestCallOutDependencies = ():boolean => {
            return isWin11() && isWebRTC() && notInCall();
        };

		const setDeviceSucces = (response = undefined) => {
			if (response && response.Pincode != '') {
				showLoader(false);
				store.commit('SET_PINCODE_STATUS', -1);
				pincode.value   = true;
				pincodeNr.value = response.Pincode;

				title.value     = store.state.settings.devicepincodetitle;
				msg.value       = store.state.settings.devicepincodemsg;
				showBox.value   = true;

				const checkPincodeEvent = () => {
					if(store.getters.getPincodeStatus() == -1) {
						setTimeout(checkPincodeEvent, 500);
					} else {
						switch(store.getters.getPincodeStatus()) {
							case UnknownDeviceResult.DeviceNoReply:
								setMessage(store.state.settings.devicenoreplytext, "Error", true, true);
								pincode.value = false;
								break;
							case UnknownDeviceResult.IncorrectPincode:
								setMessage(store.state.settings.incorrectpincodetext, "Error", true, true);
								pincode.value = false;
								break;
							case UnknownDeviceResult.IncorrectPhonenumber:
								setMessage(store.state.settings.incorrectphonenumbertext, "Error", true, true);
								pincode.value = false;
								break;
							case UnknownDeviceResult.DeviceAssociated:
								store.dispatch('ADD_FREEDEVICE', defaultSelectedDevice.value)
								.then((freedevice):void => {
									store.commit('SET_CURRENT_SELECTED_DEVICE', freedevice);
									store.commit('SET_CURRENT_DEVICENAME', freedevice.Name);
									store.commit('SET_PREVIOUS_DEVICENAME', freedevice.Name);
									setMessage(defaultmsg.value, defaulttitle.value, false, false);
									pincode.value   = false;
									pincodeNr.value = '';
                                    saveStatusMessage().then(() => {
                                        IPCCCStatus.Set(status.value)
                                        .then(() => {
                                            IPCCC.SetDisconnectedGUI(true); //////POC
                                            router.push({path : '/home/'});
                                        })
                                        .catch(error => {
                                            showLoader(false);
                                            setMessage(store.state.settings.deviceerrortext, 'Locatie', true, true);
                                        });
                                    })
                                    .catch(error => {
                                        showLoader(false);
                                        setMessage(store.state.settings.statusmessage.notchangedmsg, 'Persoonlijke melding', true, true);
                                    });
								}).catch(error => {
									console.error(error);
								});
								break;
						}
					}
				};

				checkPincodeEvent();

			} else {
                saveStatusMessage().then(() => {
                    IPCCCStatus.Set(status.value)
                    .then(() => {
                        IPCCC.SetDisconnectedGUI(true); //////POC
                        router.push({path : '/home/'});
                        if (getTestCallOutDependencies()) {
                            sipCall.value.testCallOut(store.state.settings.webrtcinitialisation);
                        }
                    })
                    .catch(error => {
                        showLoader(false);
                        setMessage(store.state.settings.deviceerrortext, 'Locatie', true, true);
                    });
                })
                .catch(error => {
                    showLoader(false);
                    setMessage(store.state.settings.statusmessage.notchangedmsg, 'Persoonlijke melding', true, true);
                });
			}
		}

		const setDeviceError = (error:object | any):void => {
			if(error.NotificationCodeTypeName === 'DeviceInUse') {
				setMessage(store.state.settings.deviceinusetext, 'Locatie', true, true);
			} else {
				setMessage(store.state.settings.deviceerrortext, 'Locatie', true, true);
			}
			showLoader(false);
		}

		const defaultSelectedDeviceChanged = (val:string) => {
			defaultSelectedDevice.value = val;
			checkForm();
		}

        //Start UserStatusText

        const getStatusMessage = () => {
            IPCCCData.RequestData('userstatustext', { UserId: store.state.loginSession.Details.UserId, Action : 'list' })
            .then(list => {
                if(list && list.length > 0) {
                    userStatusTextList.value = JSON.parse(list);
                }
                setTimeout(() => {
                    IPCCCContacts.GetMe()
                    .then(me => {
                        cachedPersonalMessage = me.StatusText;
                        personalMessage.value = me.StatusText;
                    })
                    .catch(e => console.log(e));
                }, 250); //BE should give the selected text for the user in the userstatustext list so FE can discard the timeout.
            })
            .catch((e) => console.log(e));
        }

        const saveStatusMessage = () => {
            return new Promise((resolve, reject) => {
                store.commit('SET_STATUS_TEXT_LIST', userStatusTextList.value);

                if(cachedPersonalMessage === personalMessage.value) {
                    store.commit('SET_STATUS_MESSAGE', preventHTMLInjection(personalMessage.value));
                    resolve(true);
                } else {
                    IPCCCData.RequestData('userstatustext', { UserId : store.state.loginSession.Details.UserId, StatusText : preventHTMLInjection(personalMessage.value) })
                    .then(result => {
                        store.commit('SET_STATUS_MESSAGE', preventHTMLInjection(personalMessage.value));
                        resolve(true);
                    })
                    .catch(error => {
                        console.log(error);
                        reject();
                    });
                }
            })
        };

        const personalMessageChanged = (val:string) => {
            personalMessage.value = val;
        }

        const preventHTMLInjection = (msg) => {
            return msg.replace(/>/g, "");
        }

        //End StatusMessage

		const checkForm = () => {
			if(defaultSelectedDevice.value == 'Geen toestel' && isMounted.value) {
				status.value = 5;
			}

			isValid.value = (status.value != -1 &&
							(status.value != -1 && defaultSelectedDevice.value != '') &&
							!(status.value == 2 && defaultSelectedDevice.value == 'Geen toestel'));
		}

		const makeLabel = (device: any) => {
			return device.MACAddress.toUpperCase().startsWith('WEBRTC') ? `${store.getters.getLangLabel('voipaccounts.webrtcuiname')} (${device.Address})` : `${device.Name}`;
		}

		const resetMsg = () => {
			setMessage(defaultmsg.value, defaulttitle.value, true, false);
		}

		const setMessage = (m:string, t:string, s:boolean, e:boolean) => {
			msg.value     = m;
			title.value   = t;
			showBox.value = s;
			isError.value = e;
		}

		onUpdated(() => {
			defaultmsg.value   = store.getters.getLangLabel('devicedefaultmsg');
			title.value        = store.getters.getLangLabel('devicedefaulttitle');
			defaulttitle.value = store.getters.getLangLabel('devicedefaulttitle');
		});

		onMounted(() => {
            Support.SetLocation("CS: 2nd page");
			msg.value              = store.getters.getLangLabel('devicedefaultmsg');
			setDefaultDevice();
            getStatusMessage();
			IPCCCStatus.GetSelectableList()
			.then(list => {
				isMounted.value = true;
                if(unsavedNote.NoteId > -1) {
                    //this route for unsaved note has been discarded (not 100% sure, delete if your 100% sure)
					statusList.value = deepCopy(list);
					statusList.value.forEach(obj => {
					obj.isdisabled = obj.StatusId !== unsavedNoteStatusId
					});
					store.commit('SET_UNSAVEDNOTE', unsavedNote); //
					setDefaultStatus(unsavedNoteStatusId);
				} else {
					statusList.value = list;
					setDefaultStatus();
				}
				showLoader(false);
			})
			.catch(error => {
				console.error('statusList failed to load: ', error);
				setMessage(`StatusList failed to load: ${error}`, "Error", true, true);
				showLoader(false);
			});
		});

        onUnmounted(() => {
            nextTick(() => {
                showLoader(false);
            });
        })

		return {
			store,
			showBox, title, msg,
			defaultSelectedDevice,
			deviceBtn,
			status, statusList,
			isMounted,
            selDevInputSelect, persStatusTxtInputSelect,
			deviceList, mappedDeviceOptions, defaultSelectedDeviceChanged,
			personalMessage, userStatusTextList, mappedMessageOptions, personalMessageChanged,
			selectedLang,
			isError,
			pincode, pincodeNr, askfornr, workplace,
			isValid,
			resetMsg, setDevice,
		}
	}
});

</script>

<style lang="scss" scoped>

@use "@/scss/includes/font";
@use "@/scss/includes/globals";
@use "@/scss/includes/functions";

.app-wrapper__login,
.app-wrapper__background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.app-wrapper__background {
    overflow: hidden;
    div {
        content: "";
        position: absolute;
        top: -50px;
        left: -50px;
        width: calc(100% + 100px);
        height: calc(100% + 100px);
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        filter: blur(10px);
    }
}

.app-wrapper__login {
    display: block;
    width: min(64ch, 100% - 4rem);
    margin: auto;
    @media #{globals.$media_M} {
        width: 600px;
        margin: initial;
    }
    height: auto;
    min-height: 365px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 3px;
    background-color: globals.$color-white;
    box-shadow: 0 3px 16px 0 rgba(0,0,0,.4);
    z-index: 10;
    &--none-branded {
        width: 320px;
        min-height: auto;
    }
}

.app-wrapper__login-left,
.app-wrapper__login-right {
    position: absolute;
    top: 0;
    bottom: 0;
    color: globals.$color-white;
    min-height: 320px;
}

.app-wrapper__login-left {
    display: none;
    @media #{globals.$media_M} {
        display: block;
    }
    position: absolute;
    right: 42%;
    left: 0;
    padding: 1rem 1rem 1.5rem 1rem;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    border-radius: 3px 0 0 3px;
    .app-wrapper__login-quote {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: calc(100% - 2rem);
        text-align: center;
        font-size: 2.8rem;
        line-height: 1.2;
        @include font.font-medium();
        letter-spacing: -1px;
        text-shadow: 0 1px 6px rgba(0,0,0,.4);
    }
}

.app-wrapper__login-right {
    display: block;
    position: relative;
    width: min(64ch, 100% - 4rem);
    margin: auto;
    @media #{globals.$media_M} {
        float: right;
        width: 252px;
        margin: initial;
    }
    padding: 1rem 0.8rem 1.5rem 0.8rem;
    color: functions.shade(globals.$color-primary, 20%);
    h2 {
        @include font.font-bold();
        letter-spacing: -1px;
        font-size: 1.5rem;
        line-height: 1.4;
    }
}

.app-wrapper__login-center {
    position: relative;
    width: 100%;
    min-height: 320px;
    box-shadow: none;
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    color: globals.$color-white;
    top: auto;
    left: auto;
    transform: translate(0, 0);
    h2 {
        @include font.font-bold();
        font-size: 2.6rem;
        line-height: 1.4;
        color: globals.$color-primary;
    }
}

.form-errorbox {
    position: relative;
    min-height: 42px;
    font-size: .7rem;
    padding: 6px 10px;
    margin-top: 5px;
    border-radius: 3px;
    color: functions.shade(globals.$color-secondary, 20%);
    background-color: functions.tint(globals.$color-secondary, 80%);
    -webkit-font-smoothing: subpixel-antialiased;
    -moz-osx-font-smoothing: grayscale;
    opacity: 0;
    transition: opacity .2s ease-in;
    min-height: 53px;
    &:after {
        content: "";
        position: absolute;
        display: block;
        width: 0;
        height: 0;
        top: calc(100% - 7px);
        left: calc(50% - 15px);
        border: 15px solid transparent;
        border-top-color: functions.tint(globals.$color-secondary, 80%);
    }
    &--show {
        opacity: 1;
    }
    &--as-message {
        background-color: transparent;
        padding-left: 0;
        padding-right: 0;
        color: globals.$color-gray50;
        &:after {
            border-top-color: transparent;
        }
    }
    &--warning {
        color: functions.shade(globals.$color-unavailable, 20%);
        background-color: functions.tint(globals.$color-unavailable, 80%);
        &:after {
            border-top-color: functions.tint(globals.$color-unavailable, 80%);
        }
    }
}

.form-button {
    position: relative;
    margin-top: 1.2rem;
    &.form-button--disabled button {
        background-color: globals.$color-gray15;
        box-shadow: none;
        &:hover {
        cursor: default;
        background-color: globals.$color-gray15;
        }
    }
}

.form-button--green button {
    background-color: globals.$color-secondary;
    &:hover {
        background-color: functions.tint(globals.$color-secondary, 10%);
    }
}

.form-button--login button {
    float: left;
    width: 100%;
    border-radius: 20px;
    width: calc(100% + 6px);
    margin-left: -3px;
    margin-top: 0;
    &:hover {
        background-color: functions.tint(globals.$color-secondary, 10%);
    }
    &:focus {
        background-color: functions.shade(globals.$color-secondary, 10%);
    }
    &:after {
        content: "";
        position: absolute;
        top: 50%;
        right: 7px;
        transform: translateY(-50%);
        width: 30px;
        height: 30px;
        display: block;
        background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMzJweCIgaGVpZ2h0PSIzMnB4IiB2aWV3Qm94PSIwIDAgMzIgMzIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDMyIDMyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHN0eWxlIHR5cGU9InRleHQvY3NzIj4uc3Qwe2ZpbGw6I0ZGRkZGRjt9PC9zdHlsZT48cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTQuOSwzMC41bDEzLjItMTMuMmMwLjctMC43LDAuNy0xLjksMC0yLjZMMTQuOSwxLjVjLTAuNy0wLjctMS45LTAuNy0yLjYsMGMtMC43LDAuNy0wLjcsMS45LDAsMi42bDEwLDkuOUg1LjJjLTEsMC0xLjgsMC45LTEuOCwxLjlTNC4yLDE4LDUuMiwxOGgxNy4ybC0xMCw5LjdjLTAuNCwwLjQtMC41LDAuOC0wLjUsMS4zczAuMiwwLjksMC41LDEuM0MxMywzMS4yLDE0LjIsMzEuMiwxNC45LDMwLjV6Ii8+PC9zdmc+);
        background-position: center center;
        background-repeat: no-repeat;
        background-size: 80%;
    }
}

.form-radiobar {
    display: block;
    float: left;
    padding: 0;
    margin: 20px 0 -10px 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    font-size: 0;
    label {
        display: inline-block;
        height: 30px;
        line-height: 30px;
        padding: 0 6px;
        margin: 0;
        color: globals.$color-gray25;
        font-size: 11px;
        cursor: pointer;
        &:first-of-type {
            padding: 0 6px 0 14px;
        }
        &:last-of-type {
            padding: 0 14px 0 6px;
        }
    }
    input[type='radio'] {
        position: absolute;
        opacity: 0;
        height: 0;
        width: 0;
        &:checked + label {
            color: globals.$color-gray50;
            @include font.font-medium();
        }
    }
}

.app-pincode {
    width: 100%;
    font-size: 3rem;
    @include font.font-bold();
    color: globals.$color-gray50;
    text-align: center;
    letter-spacing: 3px;
    padding-top: 2rem;
}

</style>

<style lang="scss">

.app-wrapper__login .inputselectfield input[type='text'],
.app-wrapper__login .inputselectfield .optionrow,
.app-wrapper__login .selectfield select,
.app-wrapper__login .selectfield select option {
    font-size: 0.9rem;
}

</style>