/**
 *
 * @todo
 * Let 2nd page use the setDevice function (already tried, it's a nightmare)
 * @info
 * 2nd page doesn't use the setDevice function
 *
 */

import { inject, watch } from 'vue';
import { useStore } from 'vuex';
import type { Device } from './../types/Device';
import BoxProps, { ModalType } from './../types/BoxProps';
import { IPCCCCallControl } from './../ipccc/js/callcontrol.js';
import { IPCCC } from '../ipccc/js/ipccc';
import { currentLocalDateTimeISO } from '../use/dateFunctions';

export function useSetDevice() {
    const store: object | any = useStore(),
        showLoader: Function = inject('showLoader'),
        setBrowserPhone: Function = inject('setBrowserPhone'),
        setSoftPhone: Function = inject('setSoftPhone'),
        showModalDialog: Function = inject('showModalDialog'),
        onConfirmModalDialog:Function = inject('onConfirmModalDialog');

    let sipCall: object | any = inject('sipCall');

    const toBit = (boul: Boolean) => {
        return boul ? 1 : 0;
    };

    const getDeviceArgs = (device: Device) => {
        return ['sip:' + device.Registrar, device.SIPAddress, device.Username, device.Name, device.Password];
    };

    const reSetBrowserPhone = () => {
        return new Promise((resolve, reject) => {
            if(IPCCC.LoginSession.PhoneNumber !== '') {
                setBrowserPhone(IPCCC.LoginSession.PhoneNumber, (succes) => {
                    store.commit('SET_INITIALIZE_PICKUPBUTTON', true);
                    resolve(succes);
                }, (error) => {
                    console.error('[' + currentLocalDateTimeISO() + '] WebPhone init has failed');
                    reject(error);
                    showModalDialog(new BoxProps(ModalType.Alert, store.state.settings.dialog.dialogalertheader, 'Browserphone not registred!!'));
                });
            }
        });
    };

    const registerWebPhone = (device: Device) => {
        return new Promise((resolve, reject) => {
            //In need for re-evaluattion
            if(sipCall.value?._session) {
                sipCall.value.registerSip(
                    ...getDeviceArgs(device),
                    response => {
                        resolve(response);
                    },
                    error => {
                        console.error('[' + currentLocalDateTimeISO() + '] RegisterWebPhone (webphone has session) -> register webphone failed');
                        reject(error);
                    }
                );
            } else {
                console.error('[' + currentLocalDateTimeISO() + '] No session or sipcall: reregister webphone skipped -> reset browserPhone');
                reSetBrowserPhone()
                .then((succes) => resolve(succes))
                .catch((error) => reject(error));
            }
        });
    };

    const unRegisterWebPhone = (device: Device) => {
        return new Promise<void>((resolve, reject) => {
            sipCall.value.unregisterSip(
                ...getDeviceArgs(device),
                () => {
                    resolve();
                },
                (error) => {
                    reject(error);
                }
            );
        });
    };

    const destroyWebPhoneSession = () => {
        return new Promise<void>((resolve, reject) => {
            sipCall.value.destroyWebPhoneSession()
            .then(() => resolve())
            .catch(() => reject())
        });
    };

    const handleNewCurrentDevice = (device: Device) => {
        store.commit('SET_CURRENT_SELECTED_DEVICE', device);
        store.commit('SET_CURRENT_DEVICENAME', device.Name);
        store.commit('SET_PREVIOUS_DEVICENAME', device.Name);
        if (device.MACAddress.toUpperCase().startsWith('WEBRTC')) store.commit('SET_CURRENT_SELECTED_WEBRTC_DEVICE', device);
        else store.commit('SET_CURRENT_SELECTED_WEBRTC_DEVICE', {});
    };

    const setNewDevice = (device: Device) => {
        return new Promise((resolve, reject) => {
            IPCCCCallControl.SetDevice(device.Address, toBit(device.IsWorkplace))
                .then(() => {
                    resolve(device);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    const webRTCdeviceNotSet = (error) => {
        //IN NEED FOR REVIEW!!! (...)
        //SET DEVICE TO PREVIOUS!!!
        console.error(error);
        store.commit('SET_CURRENT_DEVICENAME', store.getters.getPreviousDeviceName());
        store.commit('SET_CURRENT_SELECTED_WEBRTC_DEVICE', {});
    };

    const setDeviceError = (error) => {
        if (error.NotificationCodeTypeName === 'DeviceInUse') {
            showModalDialog(new BoxProps(ModalType.Alert, store.state.settings.dialog.dialogalertheader, store.state.settings.deviceinusetext));
        } else {
            showModalDialog(new BoxProps(ModalType.Alert, store.state.settings.dialog.dialogalertheader, store.state.settings.deviceerrortext));
        }
        store.commit('SET_CURRENT_DEVICENAME', store.getters.getPreviousDeviceName());
    };

    const setDevice = (selectedDevice) => {
        //TODO scenario where you've got 2 or more webphones
        let _previousIsWebPhone = store.getters.getPreviousDeviceName()?.startsWith('Browserphone') || store.getters.getPreviousDeviceName()?.startsWith('Browsertelefoon');
        if (_previousIsWebPhone) {
            unRegisterWebPhone(store.getters.getCurrentSelWebRTCDevice())
            .catch((error) => console.log('Unregister for previous webrtc device failed'));
        }

        const _setPhone = () => {
            if (selectedDevice.MACAddress.toUpperCase().startsWith('WEBRTC') && _previousIsWebPhone) {
                //console.log('WebPhone WebPhone');//CURRENTPHONE IS WEBPHONE NEW PHONE IS WEBPHONE
                registerWebPhone(selectedDevice)
                .then(() => {
                    setNewDevice(selectedDevice)
                    .then((d:Device) => {
                        handleNewCurrentDevice(d);
                    })
                    .catch((error) => {
                        webRTCdeviceNotSet(error);
                    });
                })
                .catch((error) => {
                    webRTCdeviceNotSet(error);
                });
            } else if (selectedDevice.MACAddress.toUpperCase().startsWith('WEBRTC') && !_previousIsWebPhone) {
                //console.log('Normalphone WebPhone');//CURRENTPHONE IS NORMALPHONE WEBPHONE SELECTED REGISTER IT
                store.commit('SET_CURRENT_SELECTED_DEVICE', selectedDevice);
                store.commit('SET_CURRENT_DEVICENAME', selectedDevice.Name);
                registerWebPhone(selectedDevice)
                .then(() => {
                    setNewDevice(selectedDevice)
                    .then((d:Device) => {
                        handleNewCurrentDevice(d);
                    })
                    .catch((error) => {
                        webRTCdeviceNotSet(error);
                    });
                })
                .catch((error) => {
                    webRTCdeviceNotSet(error);
                })
                .catch((error) => {
                    webRTCdeviceNotSet(error);
                });
            } else {
                if (Object.keys(store.getters.getCurrentSelWebRTCDevice()).length > 0) {
                    //console.log('WebPhone or Normalphone Normalphone'); //CURRENTPHONE IS (WEB)PHONE NEW PHONE IS STANDARD FIRST DEREGISTER THEN SETPHONE
                    if (selectedDevice) {
                        setNewDevice(selectedDevice)
                        .then((d:Device) => {
                            handleNewCurrentDevice(d);
                        })
                        .catch((error) => {
                            webRTCdeviceNotSet(error);
                        });
                    }
                } else {
                    //console.log('Normal phone Normal phone'); //CURRENTPHONE IS NORMALPHONE AND NORMALPHONE SELECTED
                    if (selectedDevice) {
                        setNewDevice(selectedDevice)
                        .then((d:Device) => {
                            handleNewCurrentDevice(d);
                        })
                        .catch((error) => {
                            setDeviceError(error);
                        });
                    }
                }
            }
        };

        if (selectedDevice.MACAddress.toUpperCase().startsWith('WEBRTC') && (!sipCall.value || sipCall.value === null)) {
            //initialize webrtc plugin
            setSoftPhone(
                () => {
                    _setPhone();
                },
                (error) => {
                    showLoader(true, 'init softphone failed');
                    console.error('Error: initSoftPhone failed [', error, ']');
                },
                selectedDevice.Config
            );
        } else {
            _setPhone();
        }
    };

    let webRTCErrorStateIds = [];

    const handleWebRTCErrorState = () => {
        const _isConnected = store.getters.getInternetConStatus() == 'Connected' || store.getters.getInternetConStatus() == 'Reconnected',
              _webPhoneIsRegistered = store.getters.getWebRTCPhoneInfo().Registered && store.getters.getWebRTCPhoneInfo().Activated;

        if (!_isConnected || !_webPhoneIsRegistered) {
            let _boxProps = new BoxProps(ModalType.Generic, store.state.settings.dialog.dialogalertheader, (
                `${store.state.settings.webrtcerrorstatedialog.line1} <br /> ${store.state.settings.webrtcerrorstatedialog.line2}`
            ))
            _boxProps.buttonLabels.cancelLabel = '';
            webRTCErrorStateIds.push(_boxProps.uniqueid);
            showModalDialog(_boxProps);
        }
    };

    watch([store.getters.getInternetConStatus, store.getters.getWebRTCPhoneInfo], ([newValCon, newValInfo]) => {
        const _isConnected = newValCon == 'Connected' || newValCon == 'Reconnected',
              _webPhoneIsRegistered = newValInfo.Registered;

        if (store.getters.getHasWebPhone() && _isConnected && _webPhoneIsRegistered) {
            webRTCErrorStateIds.forEach((uid) => {
                onConfirmModalDialog(null, uid);
            });
        }
    });

    return {
        'setDevice' : setDevice,
        'registerWebPhone' : registerWebPhone,
        'unRegisterWebPhone' : unRegisterWebPhone,
        'destroyWebPhoneSession' : destroyWebPhoneSession,
        'handleWebRTCErrorState' : handleWebRTCErrorState
    };
}
