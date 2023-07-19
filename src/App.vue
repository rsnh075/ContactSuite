<script lang="ts">

import { IPCCC }                    from './ipccc/js/ipccc.js';
import { IPCCCDataSubscriber }      from './ipccc/js/datasubscriber.js';
import { Support }                  from './ipccc/lib/support.js';
import { IPCCCConfigurator }        from './ipccc/js/configurator.js';
import { IPCCCPush }                from './ipccc/serviceworker/push.js';
import { IPCCCInterface }           from './ipccc/js/interface.js';
import { IPCCCPriorityLine }        from './ipccc/js/priorityline.js';
import { IPCCCStatus, EnumUserStatus } from './ipccc/js/status.js';
import { IPCCCCallControl }         from './ipccc/js/callcontrol.js';
import { IPCCCMessaging }           from './ipccc/js/messaging.js';
import { LoginSession }             from './types/UserLogin';

import { ref,
          onMounted,
          provide,
          inject,
          defineComponent,
          watch,
          nextTick,
        }                           from 'vue';

import { useStore }                 from 'vuex';
import { useRouter }                from 'vue-router';
import Axios                        from 'axios';
import { getLangSettings,
          switchTheLang
        }                           from './helpers/languageLib';
import MessageBox                   from './components/dialogs/Message-box.vue';
import Preloader                    from './components/preloader/Preloader.vue';
import ModalBox                     from './components/modalbox/ModalBox.vue';
import BoxProps, { ModalType }      from './types/BoxProps';
import { WebRTCPhoneInfo }          from './types/Phone';
import { LobbyCase }                from './types/lobby';
import { PriorityLine }             from './types/Priority';
import { currentLocalDateTimeISO }  from './use/dateFunctions';
import { isJsonString }             from './use/helperFunctions';
import WebRtcConstraintsBox         from './components/dialogs/WebRtcConstraintsBox.vue';

import { LANGUAGE }                 from './settings/langlabels';
import { MENU }                     from './settings/menu';
import { Logging, LoggingLevel }    from './ipccc/lib/logging.js';

declare global {
    interface Window {
        siteroot: string;
        debugState: boolean;
        IPCCCDebug: boolean;
        testCallOutTransactionId: string;
        resetBrowserPhone: Function;
        dashboardWinRef: object | any;
        bLoad: Function;
        uLoad: Function;
    }
}

window.debugState = window.debugState || false;
window.siteroot = window.location .protocol + "//" + window.location.host + import.meta.env.BASE_URL || import.meta.env.BASE_URL;

const handleLevelCasing = (str:string) => {
    let _str = str.toLowerCase().charAt(0).toUpperCase() + str.slice(1);
    return _str;
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
urlParams.forEach(string => string.toLocaleLowerCase());

if (urlParams.has('logginglevel')) {
    if (urlParams.get('logginglevel') && urlParams.get('logginglevel') !== '') {
        Logging.Level = LoggingLevel[handleLevelCasing(urlParams.get('logginglevel'))];
    }
}

export default defineComponent({
name: 'App',
components: {
    MessageBox,
    Preloader,
    ModalBox,
    WebRtcConstraintsBox
},
setup() {
    Support.SetLocation("CS: Loading...");
    const store:object | any          = useStore(),
          router                      = useRouter(),
          url:string                  = window.siteroot + 'assets/settings/custom_settings.json',
          showPreloader               = ref<boolean>(false),
          preloaderMessage            = ref<string>('Loading'),
          isLoggedIn                  = ref<boolean>(false),
          constrainsboxvisible        = ref(false),
          boxPropsList                = ref<BoxProps[]>([]),
          initSoftPhone               = inject<any>('initSoftPhone');

    let customdata:object | any         = ref({}),
        sipCall:object | any            = ref(),
        prioritylinePlayer:any          = document.createElement('audio'),
        showPrioritylineAlert:Function  = () => {},
        customerId:number               = -1,
        customerName:string             = '',
        customerList                    = [];

    provide('sipCall', sipCall);

    //KEEP TRACK OF LAST ROUTE
    router.afterEach(to => {
        if(String(to.name).toLocaleLowerCase() !== 'logout') {
            localStorage.setItem('LS_ROUTE_KEY', String(to.name));
            localStorage.setItem('LS_ROUTE_PATH', to.path);
            localStorage.setItem('LS_LAST_ACTIVITY_AT_KEY', String(Date.now()));
        }
    });

    //CONNECTION SHIZZLE
    const showDialog = ref(false),
        messageBody = ref(''),
        acceptLabel = ref(''),
        cancelLabel = ref(''),
        homeActive  = ref<boolean>(true);

    const showHome = (status:boolean):void => {
        store.commit('SET_HOME_STATE', status);
    };

    provide('showHome', showHome);

    const showInteraction = (status:boolean, size:string = 'maximized'):void => {
        store.commit('SET_INTERACTION_STATE', status);
        store.commit('SET_INTERACTION_MINIMIZED', size !== 'maximized');
        //store.commit('SET_INTERACTION_HISTORY', );
    };

    provide('showInteraction', showInteraction);

    const hideMessage = () => {
        showDialog.value = false;
        messageBody.value = '';
    }
    const callAccepted = () => {
        //callAccepted function call via message-box is suspended!!
        hideMessage();
        if(router.currentRoute.value.path === '/interaction/') {
            showHome(false);
            showInteraction(true, 'maximized');
            router.push({path: '/interaction/'});
        }
    }
    const callDenied = () => {
        IPCCCCallControl.Hangup();
        hideMessage();
    }

    const isReloadCS = ref(false),
        csIsOnline = ref(true);

    const reloadCS = () => {
        // TEST REMOVE
        console.log('reloadCS', );
        window.location.reload();
    }

    const tryReconnect = () => {
        console.log('tryReconnect');
        isReloadCS.value = true;

        if(csIsOnline.value) {
            acceptLabel.value = store.state.settings.internetcondialog.btnacceptlabel;
        } else {
            console.log('connection lost');
        }
    }

    const acceptedFunctionCall = () => {
        console.log('acceptedFunctionCall: ', isReloadCS.value);
        if(isReloadCS.value)
            reloadCS();
        else
            return callAccepted;
    }

    watch(() => store.getters.getInteractionState(), (newVal, oldVal) => {
        if(newVal) {
            hideMessage();
        }
    });

    store.watch(store.getters.getInternetConStatus, status => {
        let p = router.currentRoute.value.path;
        switch(status) {
            case 'Connected':
                break;
            case 'Reconnecting':
                messageBody.value = `<div class="dialog__window-body--message">
                                        <span>${store.state.settings.internetcondialog.messagelostconnection}</span>
                                    </div>`;
                acceptLabel.value = '';
                cancelLabel.value = '';
                showDialog.value = true;
                break;
            case 'Disconnected':
                messageBody.value = `<div class="dialog__window-body--message">
                                        <span>${store.state.settings.internetcondialog.messagereloadcs}</span>
                                    </div>`;
                showDialog.value = true;
                tryReconnect();
                break;
            case 'Reconnected':
                if(p !== '/setdevice-and-status/') {
                    router.push('/reconnectscreen/').catch((e) => {console.error(e)});
                    setTimeout(() => {
                        router.push(p);
                        showDialog.value = false;
                    }, 500);
                } else {
                    showDialog.value = false;
                }
                break;
        }
    });

    //END CONNECTION SHIZZLE

    //PRELOADER GLOBAL FN
    const showLoader = (status:boolean, message:string = ''):void => {
        showPreloader.value = status;
        if(message !== '') {
            preloaderMessage.value = message;
        } else {
            preloaderMessage.value = 'Loading...';
        }
    };
    provide('showLoader', showLoader);

    //WEBRTC CONSTRAINS BOX
    const showWebRtcConstraintsBox = (bool):void => {
        constrainsboxvisible.value = bool;
    };
    provide('showWebRtcConstraintsBox', showWebRtcConstraintsBox);

    const onConfirmWebRtcConstraintsBox = (bool) => {
        constrainsboxvisible.value = bool;
    }

    //MODAL CONFIRM GLOBAL FN
    const showModalDialog = (options: BoxProps | any):void => {
        boxPropsList.value.push(options);
    };
    provide('showModalDialog', showModalDialog);

    const onConfirmModalDialog = (evt, uniqueid:string) => {
        if(typeof evt === 'function') evt();

        let _selectedindex = boxPropsList.value.findIndex(modalbox => modalbox.uniqueid == uniqueid);
        if (_selectedindex !== -1) {
            boxPropsList.value.splice(_selectedindex, 1);
        } else {
            console.warn('On Confirm: Modal Id not found');
            // boxPropsList.value.pop(); //fallback
        }
    }

    provide('onConfirmModalDialog', onConfirmModalDialog)

    const onCancelModalDialog = (evt, uniqueid:string) => {
        if(typeof evt === 'function') evt();

        let _selectedindex = boxPropsList.value.findIndex(modalbox => modalbox.uniqueid == uniqueid);
        if (_selectedindex !== -1) {
            boxPropsList.value.splice(_selectedindex, 1);
        } else {
            console.error('On Cancel: Modal Id not found');
            // boxPropsList.value.pop(); //fallback
        }
    }

    //SWITCHLANG GLOBAL FN
    const switchLang = (lang:string):void => {
        store.commit('SET_LANG', lang);
        store.commit('SET_SETTINGS_UPDATE', { data: Object.assign({}, switchTheLang(lang, LANGUAGE), customdata.value) });
    }
    provide('switchLang', switchLang);

    const renameUrlInICEServers = (iceServers) => {
        return iceServers.reduce((acc, obj) => {
            if (obj['url']) {
                obj['urls'] = obj['url'];
                delete obj['url'];
            }
            acc.push(obj);
            return acc;
        },[]);
    }

    //INIT WEBRTC/JANUS
    const setSoftPhone = (resolve, reject, config) => {
        let _config = JSON.parse(config);
        const serverAddress = _config.Gateways;
        const iceServers    = renameUrlInICEServers(_config.ICEServers);

        initSoftPhone(serverAddress, iceServers).then(result => {
            if(typeof resolve == 'function') {
                sipCall.value = result;
                resolve();
            }
        }).catch(error => {
            if(typeof reject == 'function') {
                sipCall.value = undefined;
            }
            reject(error);
        });
    };
    provide('setSoftPhone', setSoftPhone);

    const setBrowserPhone = (savedAddress, succes, error) => {
        let _address   = savedAddress.indexOf('@') !== -1 ? savedAddress.substr(0, savedAddress.indexOf('@')) : savedAddress,
            _selDevice = store.getters.getDeviceList().find(device => device.Address === _address);

        const setThePhone = () => {
            if(_selDevice && _selDevice.MACAddress.toUpperCase().startsWith("WEBRTC")) {
                let _sipaddress     = _selDevice.SIPAddress,
                    _username       = _selDevice.Username,
                    _name           = _selDevice.Name,
                    _password       = _selDevice.Password,
                    _registar       = 'sip:' + _selDevice.Registrar;

                const registerThePhone = () => {
                    sipCall.value.registerSip(_registar, _sipaddress, _username, _name, _password, () => {
                        store.commit('SET_CURRENT_SELECTED_WEBRTC_DEVICE', _selDevice);
                        if(typeof succes === 'function') {
                            succes();
                        }
                    }, januserror => {
                        store.commit('SET_CURRENT_SELECTED_WEBRTC_DEVICE', {});
                        if (typeof error == 'function') {
                            error(januserror);
                        }
                    });
                }

                sipCall.value.unregisterSip(_registar, _sipaddress, _username, _name, _password, () => {
                    registerThePhone();
                }, error => {
                    registerThePhone();
                });
            } else {
                if(typeof succes === 'function') {
                    succes();
                }
            }
        }

        if(!sipCall.value && _selDevice && _selDevice.MACAddress.toUpperCase().startsWith("WEBRTC")) {
            setSoftPhone(() => {
                setThePhone();
            }, error => {
                console.error(`Error: initSoftPhone failed [${error.stack}]`);
            }, _selDevice.Config);
        } else {
            setThePhone();
        }
    }

    provide('setBrowserPhone', setBrowserPhone);

    const resetBrowserPhone = () => {
        console.log('resetBrowserPhone: initialization');
        sipCall.value = undefined;
        setBrowserPhone(
            store.getters.getCurrentSelWebRTCDevice().Address,
            () => {
                store.commit('SET_INITIALIZE_PICKUPBUTTON', true);
                console.log('resetBrowserPhone: succes');
            },
            (error) => {
                showModalDialog(new BoxProps(ModalType.Alert, store.state.settings.dialog.dialogalertheader, `Browserphone not registred!! ${error}`));
                console.log('resetBrowserPhone: failed');
            }
        );
    }

    window.resetBrowserPhone = resetBrowserPhone;

    //CLOSE WINDOW HANDLING
    const addWindowCloseEvents = ():void => {
        localStorage.setItem('LS_ROUTE_KEY', '');
        localStorage.setItem('LS_ROUTE_PATH', '');

        //LOGOUT
        window.addEventListener('unload', window.uLoad = function(evt) {
            if (store && Object.keys(store.getters.getCurrentSelWebRTCDevice()).length > 0) {
                let _storedObj     = store.state.currentWebRTCPhone,
                    __sipaddress   = _storedObj.SIPAddress,
                    __username     = _storedObj.Username,
                    __name         = _storedObj.Name,
                    __password     = _storedObj.Password,
                    __registar     = 'sip:' + _storedObj.Registrar;

                sipCall.value.unregisterSip(__registar, __sipaddress, __username, __name, __password, () => {
                    store.commit('SET_CURRENT_SELECTED_WEBRTC_DEVICE', {});
                    IPCCC.Logout().catch((e) => console.warn(e));
                }, error => {
                    console.error(error);
                });
            } else {
                IPCCC.Logout();
            }
        });
    }

    const addWindowBeforeUnloadEvent = ():void => {
        window.addEventListener('beforeunload', function(event) {
            if (store && Object.keys(store.getters.getCurrentSelWebRTCDevice()).length > 0) {
                let _storedObj     = store.state.currentWebRTCPhone,
                    __sipaddress   = _storedObj.SIPAddress,
                    __username     = _storedObj.Username,
                    __name         = _storedObj.Name,
                    __password     = _storedObj.Password,
                    __registar     = 'sip:' + _storedObj.Registrar;

                sipCall.value.unregisterSip(__registar, __sipaddress, __username, __name, __password, () => {
                }, error => {
                    console.error(error);
                });
            }
        });
    }

    const setSelectedCustomerId = (selId, selName, selUsesCasa) => {
        let _cData = {
            customerId               : customerId,
            customerName             : customerName,
            selectedCustomerId       : selId,
            selectedCustomerName     : selName,
            selectedCustomerUsesCasa : selUsesCasa,
        }
        store.commit('SET_CUSTOMER_INFO', _cData);
    };

    const getCustomers = () => {
        return new Promise((resolve, reject) => {
            IPCCCConfigurator.Request(customerId, 'customers', 'list')
            .then(response => {
                //Remove loggedin customer from list
                let _index           = response.findIndex(cust => parseInt(cust.CustomerId) === parseInt(customerId as any));
                if(_index != -1) {
                    customerName    = response[_index].Name;
                    response.splice(_index, 1);
                }
                // If Massxess than all customers else only customers you are reseller from.
                if (store.state.clientCode == 'massxess') {
                    customerList  = response;
                } else {
                    customerList  = response.filter(cust => parseInt(cust.ResellerId) == parseInt(customerId as any));
                }
                setSelectedCustomerId(customerId, customerName, true);
                resolve(true);
            })
            .catch(err => {
                console.error('Error: ' + err);
                reject();
            });
        })
    }

    interface OptionsIDServerV4 {
      client_id: number,
      resource: string
    }

    interface OptionsIDServerV5 {
      client_id: number,
      acr_values: string
    }

    function getLoginIDSOptions(idsversion): OptionsIDServerV4 | OptionsIDServerV5 {
      return {
        client_id: customdata.value.clientid,
        ...(idsversion >= 5 ?
          { acr_values : `tenant:${customdata.value.companycode}` } : { resource : `company_code=${customdata.value.companycode}` })
      }
    };

    const toBit = (boul: Boolean) => {
        return boul ? 1 : 0;
    };

    const setDeviceAndPush = (_logindevice, _device, _path) => {
        let _nr     = _logindevice.length > 0 ? _logindevice[0].Address : _device[0].Address,
            _selObj = _logindevice.length > 0 ? _logindevice[0] : _device[0];
        setBrowserPhone(
            _nr,
            () => {
                IPCCCCallControl.SetDevice(_nr, toBit(_selObj.IsWorkplace))
                .then(succes => {
                    store.commit('SET_CURRENT_SELECTED_DEVICE', _selObj);
                    store.commit('SET_CURRENT_DEVICENAME', _selObj.Name);
                    store.commit('SET_PREVIOUS_DEVICENAME', _selObj.Name);
                    router.push({path: _path});
                })
                .catch(e => {
                    console.error(e);
                    router.push({path: _path});
                })
            },
            (error) => {
                showModalDialog(new BoxProps(ModalType.Alert, store.state.settings.dialog.dialogalertheader, `Browserphone not registred!! ${error}`));
                router.push({path: _path});
            }
        );
    };

    const handleRouting = (_statusId, _defaultPhone, _loginPhone) => {
        let _path = handelRefresh(); //always returns home

        if(_statusId <= EnumUserStatus.LoggedIn) {
            if (store.getters.getPermission('Rapportage2.0')) {
                store.commit('SET_REPORTS_URL', customdata.value.reportsloginidsurl); //For historical reports
            }
            if (store.getters.getPermission('ModuleInteractie')) {
                router.push({path: '/setdevice-and-status/'});
            } else {
                setStatusId();
                IPCCC.SetDisconnectedGUI(true);
                if ((_loginPhone && _loginPhone[0]) || (_defaultPhone && _defaultPhone[0])) {
                    setDeviceAndPush(_loginPhone, _defaultPhone, _path);
                } else {
                    router.push({path: _path});
                }
            }
        } else {
            if (!store.getters.getPermission('ModuleInteractie')) {
                setStatusId();
            }
            IPCCC.SetDisconnectedGUI(true);
            if ((_loginPhone && _loginPhone[0]) || (_defaultPhone && _defaultPhone[0])) {
                setDeviceAndPush(_loginPhone, _defaultPhone, _path);
            } else {
                router.push({path: _path});
            }
        }

    }

    const stripSip = (rawNr) => {
        return rawNr?.indexOf('@') ? rawNr.split('@')[0] : rawNr;
    }

    const handleDevice = (list, _statusId) => {
        let _defaultPhone = null,
            _loginPhone = null;

        if (store.getters.getPermission('ModuleInteractie')) {

            if (list && list.length > 0 ) {

                if (IPCCC.LoginSession.PhoneNumber !== '') {
                    let _address = stripSip(IPCCC.LoginSession.PhoneNumber);
                    _loginPhone = list.filter(device => device.Address == _address);
                }
                _defaultPhone = list.filter(device => device.IsDefault);
                if (_defaultPhone.length === 0) {
                    _defaultPhone = [list[0]];
                    _defaultPhone[0].IsDefault = true;
                }
                if (!_loginPhone) {
                    _loginPhone = _defaultPhone;
                }
                store.commit('SET_DEVICE_LIST', list);
                store.commit('SET_CURRENT_SELECTED_DEVICE', _defaultPhone[0]);
                store.commit('SET_CURRENT_DEVICENAME', _defaultPhone[0].Name);

                if (_defaultPhone[0].MACAddress.toUpperCase().startsWith("WEBRTC")) {
                    store.commit('SET_CURRENT_SELECTED_WEBRTC_DEVICE', _defaultPhone[0]);
                }
                else {
                    store.commit('SET_CURRENT_SELECTED_WEBRTC_DEVICE', {});
                }

            }

        } else if (list && list.length > 0) {
            store.commit('SET_CURRENT_DEVICENAME', 'Geen toestel');
            store.commit('SET_CURRENT_SELECTED_DEVICE', list[0]);
            store.commit('SET_CURRENT_SELECTED_WEBRTC_DEVICE', list[0]);
            store.commit('SET_PREVIOUS_DEVICENAME', 'Geen toestel');
            _loginPhone = list[0];
            _defaultPhone = list[0];
        }
        handleRouting(_statusId, _defaultPhone, _loginPhone);
    }

    const listenToInteractionSubscriptions = () => {
        Logging.WriteAlways(`[${currentLocalDateTimeISO()}] listen to: PHONEINFO, LOBBYINFO, Priority`);
        IPCCCDataSubscriber.Subscribe("PHONEINFO", (msg:WebRTCPhoneInfo) => {
            Logging.WriteAlways(`[${currentLocalDateTimeISO()}] PHONEINFO Activated: ${msg.Activated} Registered: ${msg.Registered} ${msg.PhoneNumber} ${msg.SipAddress}`);
            store.commit('SET_WEBRTC_PHONEINFO', msg);
        });
        IPCCCDataSubscriber.Subscribe("LOBBYINFO", (lobbyinfolist:LobbyCase[]) => {
            Logging.WriteAlways(`[${currentLocalDateTimeISO()}] LOBBYINFO ${lobbyinfolist.length} ${lobbyinfolist}`);
            store.commit('SET_LOBBYINFO', lobbyinfolist);
        });
        IPCCCDataSubscriber.Subscribe("Priority", (priorityobj:PriorityLine) => {
            // store.commit('SET_PRIORITYLINE', priorityobj);
            Logging.WriteAlways(`[${currentLocalDateTimeISO()}] PriorityLine Active: ${(priorityobj.PriorityLine ? 'Y' : 'N')} IsNew: ${(priorityobj.NewPriorityLine ? 'Y' : 'N')} Remove: ${(priorityobj.Remove ? 'Y' : 'N')} Message: ${priorityobj.Message}`);
            prioritylinePlayer.pause();
            if (!priorityobj.Remove && priorityobj.PriorityLine && priorityobj.NewPriorityLine) {
                showPrioritylineAlert('hide');
                prioritylinePlayer.pause();
                nextTick(() => {
                    showPrioritylineAlert('show', priorityobj.Message);
                    prioritylinePlayer.play();
                });
            }
            if (!priorityobj.Remove && priorityobj.PriorityLine && !priorityobj.NewPriorityLine) {
                showPrioritylineAlert('hide');
                prioritylinePlayer.pause();
                nextTick(() => {
                    showPrioritylineAlert('update', priorityobj.Message);
                    prioritylinePlayer.pause();
                });
            }
            if (priorityobj.Remove) {
                nextTick(() => {
                    showPrioritylineAlert('hide');
                    prioritylinePlayer.pause();
                });
            }
        });
    }


    const handlePriorityLinePlayer = () => {
        prioritylinePlayer           = document.createElement('audio');
        prioritylinePlayer.controls  = 'controls';
        prioritylinePlayer.loop      = 'loop';
        prioritylinePlayer.type      = 'audio/mpeg';
        prioritylinePlayer.volume    = 1;
        prioritylinePlayer.src       = `${window.siteroot}/assets/sounds/${store.state.settings.sounds.priorityline}`;

        let stateBoxPropIds = [];

        showPrioritylineAlert = (state, message) => {
            if(state == 'show') {
                let _boxProps = new BoxProps(ModalType.Alert, store.state.settings.prioritylinenotification.prioritylineheader, message);
                _boxProps.hideBg = true;
                _boxProps.buttonLabels.okLabel = store.state.settings.prioritylinenotification.confirmBtnLabel;
                _boxProps.confirmFn = () => {
                    //On DEV this function always evaluates to catch
                    prioritylinePlayer.pause();
                    IPCCCPriorityLine.TakeOverPriorityLine()
                    .then(() => {
                        if(store.state.statusId !== EnumUserStatus.Busy) {
                            IPCCCStatus.Set(EnumUserStatus.Available);
                        }
                    })
                    .catch(error => {
                        if(store.state.statusId !== EnumUserStatus.Busy) {
                            IPCCCStatus.Set(EnumUserStatus.Available);
                        }
                        console.error(error);
                    });
                };
                stateBoxPropIds.push(_boxProps.uniqueid);
                showModalDialog(_boxProps);
            }
            if(state == 'update') {
                let _updatedBoxProps = new BoxProps(ModalType.Alert, store.state.settings.prioritylinenotification.prioritylineheader, message);
                _updatedBoxProps.hideBg = true;
                _updatedBoxProps.confirmFn = () => {
                    prioritylinePlayer.pause();
                }
                stateBoxPropIds.push(_updatedBoxProps.uniqueid);
                showModalDialog(_updatedBoxProps);
            }
            if(state == 'hide') {
                prioritylinePlayer.pause();
                if (stateBoxPropIds.length > 0) {
                    stateBoxPropIds.forEach((uid) => {
                        onConfirmModalDialog(null, uid);
                    });
                }
            }
        }
    };

    const handelRefresh = ():string => {
        let _storedPath:string = localStorage.getItem('LS_ROUTE_PATH');

        if(_storedPath && _storedPath !== '/logout/' && _storedPath !== '/home/' && _storedPath !== '/') {
            // return _storedPath;
            return '/home/'; //temp solution till we know precisely what the specs are!!!
        } else {
            return '/home/';
        }
    };

    const setStatusId = () => {
        IPCCCStatus.Set(EnumUserStatus.Unavailable)
        .then(() => {
            store.state.statusId    = EnumUserStatus.Unavailable;
            store.state.statusColor = '#F83A22';
            store.state.statusLbl   = 'Unavailable';
            setTimeout(showLoader, 500, false);
        })
        .catch(error => {
            const boxProps = new BoxProps(ModalType.Alert, store.state.settings.alertheader, store.state.settings.statusseterror)
            showModalDialog(boxProps);
            console.error(error);
            showLoader(false);
        });
    }

    const setDeviceEtcAndRouting = (_statusId) => {
        Support.SetInformation("PhoneNumber", IPCCC.LoginSession.PhoneNumber);

        store.dispatch('GET_PHONELIST')
        .then((list) => {
            handlePriorityLinePlayer();
            listenToInteractionSubscriptions();

            handleDevice(list, _statusId);

            if (IPCCC.LoginSession.Note.NoteId > -1) {
                store.commit('SET_UNSAVEDNOTE', IPCCC.LoginSession.Note);
            }
        })
        .catch((error) => {
            console.error(error);
            // showModalDialog(new BoxProps(ModalType.Alert, store.state.settings.dialog.dialogalertheader, 'Phones for login failed!!'));
            router.push({path: '/home/'});
        });
    }

    const waitForSettings = ():void => {
        if(customdata.value !== null) {
            IPCCC.SetConfig(customdata.value.ipcccConfig, customdata.value.idserverConfig);
            store.commit('SET_HELPCENTER_URL', customdata.value.helpcentreurl);
            store.commit('SET_ENV_IS_DEV', customdata.value.envisdev);
            store.commit('SET_ENV_IS_TEST', customdata.value.envistest);
            store.commit('SET_ENV_IS_LIVE', customdata.value.envislive);
            IPCCC.LoginIDS(customdata.value.companycode, getLoginIDSOptions(customdata.value.ipcccConfig.IdentityServerVersion))
            .then((response: LoginSession) => {

                Logging.WriteAlways(response.SessionId);
                Support.SetInformation("SessionId", response.SessionId);

                store.dispatch('SET_LOGIN_SESSION', response)
                .then(() => {
                    isLoggedIn.value      = true;
                    customerId = response.Details.CustomerId;
                    let _statusId: number = Number(response.StatusId);
                    getCustomers()
                    .then(() => {
                        store.commit('SET_MENU', MENU);
                        store.dispatch('CHANGE_PERMISSIONS');

                        //START WINDOW DIMENTIONS FOR DRAGGING
                        store.dispatch('CALC_WINDOW_SIZE');
                        window.addEventListener('resize', () => {
                            store.dispatch('CALC_WINDOW_SIZE')
                        }, false);

                        if(response.ShowLogoutWarning) {
                            addWindowCloseEvents();
                        }
                        window.addEventListener('unload', () => {
                            if(window.dashboardWinRef) {
                                window.dashboardWinRef.close();
                            }
                        });
                        addWindowBeforeUnloadEvent();

                        getLangSettings().then(lang => {
                            switchLang(lang);
                            setDeviceEtcAndRouting(_statusId);
                        })
                        .catch(error =>{
                            console.error(error);
                        });
                    })
                    .catch(error =>{
                        console.error(error);
                    });
                })
                .catch(error =>{
                    console.error(error);
                });
            })
            .catch((error):void => {
                console.error('Login failed: ', error);
                router.push('/LoginFailed/');
                showLoader(false);
            });
        } else {
            setTimeout(waitForSettings, 50);
        }
    };

    const setIPCCCLoadedEvent = ():void => {
        IPCCCCallControl.UnknownDeviceResult.addHandler((result: number) => {
            store.commit('SET_PINCODE_STATUS', result);
        });

        IPCCCInterface.Control.addHandler((commands: object | any) => {
            store.commit('SET_INTERFACE_STATUS', commands); //Commands
            console.log(`[${currentLocalDateTimeISO()}] Commands: ${JSON.stringify(commands)}`);
        });

        IPCCCStatus.Changed.addHandler((statusId: number) => {
            if (statusId !== EnumUserStatus.Unknown) {
                IPCCCStatus.GetStatus(statusId)
                .then(status => {
                    store.commit('SET_USER_STATUS', status);
                    setTimeout(() => showLoader(false), 1000);
                })
                .catch((e) => {console.warn(e)})
            }
        });

        IPCCC.SessionDisconnected.addHandler(():void => {
            console.error('SessionDisconnected');
            router.push({path: '/logout/'});
            showLoader(false);
        });

        IPCCC.Reconnecting.addHandler(():void => {
            console.error('Reconnecting');
            store.commit('SET_INTERNETCON_STATUS', 'Reconnecting');
        });

        IPCCC.Reconnected.addHandler(():void => {
            console.error('Reconnected');
            store.commit('SET_INTERNETCON_STATUS', 'Reconnected');
            showLoader(false);
        });

        IPCCC.Disconnected.addHandler(():void => {
            console.error('Disconnected');
            store.commit('SET_INTERNETCON_STATUS', 'Disconnected');
            showLoader(false);
        });

        IPCCCPush.NotificationReceived.addHandler((notification):void => {
            store.commit('SET_PUSHNOTIFICATION_MESSAGE', notification.event);
            showLoader(false);
        });

        IPCCCCallControl.AgentEvent.addHandler((evt: Event):void => {
            store.commit('SET_AGENT_EVENT', evt);
        });

        IPCCCInterface.PushURL.addHandler((url: string) => {
            store.commit('SET_PUSH_URL', 'about:blank');
            setTimeout(() => {
                store.commit('SET_PUSH_URL', url)
            }, 200);
        });

        IPCCCMessaging.Received.addHandler((type:string, data:any) => {
            const _messagingData = {
                type : type, data : (data && isJsonString(data)) ? JSON.parse(data) : data
            }
            store.commit('SET_MESSAGING_EVENT', _messagingData);
            nextTick(() => store.commit('SET_MESSAGING_EVENT', null));
        })

        // IPCCCPriorityLine.PriorityLine.addHandler((priorityline: object | any):void => {
        //     Logging.WriteAlways('[' + currentLocalDateTimeISO() + '] PriorityLine Active: ' + (priorityline.Active ? 'Y' : 'N') + ' IsNew: ' + (priorityline.IsNew ? 'Y' : 'N'));
        //     if (priorityline && priorityline.Active && priorityline.IsNew) {
        //         showPrioritylineAlert('show');
        //         prioritylinePlayer.play();
        //     } else {
        //         showPrioritylineAlert('hide');
        //         prioritylinePlayer.pause();
        //     }
        // });
        waitForSettings();
    };

    const manipulateCustomData = () => {
        const _currentDay = new Date(Date.now()).getDate(),
            _currentMonth = new Date(Date.now()).getMonth();
        if (
            (_currentMonth === 12 && _currentDay >= 7) ||
            (_currentMonth === 0 && _currentDay <= 6)
        ) {
            customdata.value.ischristmas = true;
        } else {
            customdata.value.ischristmas = false;
        }
        setIPCCCLoadedEvent();
    }

    onMounted((): void => {
        // console.log('App mounted');
        showLoader(true, 'ContactSuite is loading')
        Axios.get(url).then(response => {
            customdata.value = response.data;
            manipulateCustomData();
        }).catch(error => {
            console.error('Error: ' , error);
        });

        window.addEventListener("offline", (e) => {
            console.log("offline");
            csIsOnline.value = false;
        }, false);

        window.addEventListener("online", (e) => {
            console.log("online");
            csIsOnline.value = true;
            tryReconnect();
        }, false);

    });

    return {
      store,
      isLoggedIn, showPreloader, preloaderMessage,
      boxPropsList, onConfirmModalDialog, onCancelModalDialog,
      customerList, constrainsboxvisible, onConfirmWebRtcConstraintsBox,
      showDialog, messageBody, acceptLabel, cancelLabel, acceptedFunctionCall, callDenied
    }
  }
});

</script>

<template>
    <div>
        <div :class="['app-wrapper', {'app-wrapper--hidden' : !isLoggedIn}]" data-e2e="main-app-wrapper">
            <router-view></router-view>
        </div>

        <router-view
            name="interaction"
            :class="['appgrid-interaction-wrapper',
                {'appgrid-interaction-wrapper--active' : store.state.navigation.interactionStatus,
                    'appgrid-interaction-wrapper--minimized' : store.state.navigation.interactionMinimized,
                    'appgrid-interaction-wrapper--minimized-webphone' : (store.state.navigation.interactionMinimized && store.state.navigation.hasWebPhone)
                }]"
        >
        </router-view>
        <!-- CONNECTION DIALOG MESSAGE -->
        <MessageBox
            :status       = "showDialog"
            :bodyContent  = "messageBody"
            :acceptLabel  = "acceptLabel"
            :cancelLabel  = "cancelLabel"
            @accepted     = "acceptedFunctionCall"
            @canceled     = "callDenied"
        />
        <!-- CONNECTION DIALOG MESSAGE -->
        <WebRtcConstraintsBox
            :visible="constrainsboxvisible"
            @onConfirm="onConfirmWebRtcConstraintsBox"
        />
        <Preloader
            :isvisible="showPreloader"
            :message="preloaderMessage"
        />
        <ModalBox v-for="(boxProps, index) in boxPropsList"
            :key="index"
            :itemNr="index"
            :boxProps="boxProps"
            @onConfirm="onConfirmModalDialog"
            @onCancel="onCancelModalDialog">
        </ModalBox>
    </div>
</template>

<style lang="scss" scoped>
@use "@/scss/includes/globals" as g;

.app-wrapper {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	overflow: hidden;
	opacity: 1;
	transition: all 1.5s ease-in;
	&--hidden {
		opacity: 0;
	}
}

.appgrid-interaction-wrapper {
	position: absolute;
	top: 100%;
	right: 0;
	bottom: 0;
	left: 0;
	overflow: hidden;
	// transition: left .2s ease-in-out;
	z-index: g.$level-interaction;
	&--active {
		top: 80px;
	}
	&--minimized {
		right: 100%;
		bottom: 100%;
		overflow: visible;
		//SORRY ITS A LITTLE MIXED WITH INTERACTION.SCSS AND AGENTCONTROLS.SCSS
		.interaction-outer-wrapper {
			position: fixed;
			width: #{(g.$agentpanel-height * 3) + 30px};
			height: g.$agentpanel-height;
			box-shadow: 0 2px 4px 0px rgba(0,0,0,.25);
			overflow: hidden;
			top: calc(100% - 210px);
			left: 75%;
			transform: translateX(-50%);
			.interaction-wrapper {
				top: 0;
				left: -330px;
			}
			.agentcontrols-wrapper {
				display: block;
				border-bottom: none;
			}
			.agentcontrols-checkboxbar__back,
			.interaction__toolbar--wide {
				left: 360px !important;
			}
		}
	}
	&--minimized-webphone .interaction-outer-wrapper {
		width: #{(g.$agentpanel-height * 2) + 30px};
		.interaction-wrapper {
			left: -690px;
		}
	}
}

</style>
