import { IPCCC }                from './../ipccc/js/ipccc.js'; //Init IPCCC !!IMPORTANT
import { checkMenuPermissions,
         collectPropValues }    from './cmHelpers';
import { IPCCCData }            from './../ipccc/js/data.js';
import { IPCCCCallControl }     from './../ipccc/js/callcontrol.js';
import { IPCCCConfigurator }     from './../ipccc/js/configurator.js';

export default {
    CHANGE_PERMISSIONS : (context, payload) => {
        context.state.loginSession.Details.Permissions.push("Home");
        let _menuList                      = checkMenuPermissions(context.state.navigation.menuItems, context.state.loginSession.Details.Permissions);
        context.state.navigation.menuItems = _menuList;
        context.state.navigation.menuUrls  = collectPropValues(_menuList, ['appMenu', 'subMenu']);
    },
    CALC_WINDOW_SIZE: (context, payload) => {
        context.state.windowSize = {
            _maxX : document.documentElement.clientWidth,
            _maxY : document.documentElement.clientHeight
        }
    },
    GET_PHONELIST: (context) => {
        return new Promise((resolve, reject) => {
            IPCCCData.RequestData("getPhonesForLogin")
            .then(list => {
                let _list = JSON.parse(list);
                _list?.forEach(device => {
                    if(device.MACAddress.toUpperCase().startsWith("WEBRTC")) {
                        device.Name = `${context.state.settings.voipaccounts.webrtcuiname} (${device.Address})`;
                    }
                });

                _list?.unshift({
                    Name        : 'Geen toestel',
                    Address     : '',
                    BrandType   : '-',
                    Priority    : 0,
                    Username    : '',
                    Password    : '',
                    SIPAddress  : '',
                    Registrar   : '',
                    MACAddress  : '',
                    IsDefault   : false,
                    IsWorkplace : false
                });
                resolve(_list);
            })
            .catch(error => {
                reject(error);
            });
        });
    },
    GET_PBXSETTINGS: (context) => {
        return new Promise((resolve, reject) => {
            IPCCCConfigurator.Request(context.getters.getCustomerInfo().customerId, 'PBXsettings', 'readall', {UserId : context.getters.getUserId()}, -1)
            .then(result => {
                resolve(result);
            })
            .catch(error => {
                reject(error);
            });
        });
    },
    ADD_FREEDEVICE: (context, payload) => {
        let _freeDevice = {
            Name        : payload,
            Address     : 'free',
            BrandType   : '-',
            Priority    : 0,
            Username    : '',
            Password    : '',
            SIPAddress  : '',
            Registrar   : '',
            MACAddress  : '',
            IsDefault   : false,
            IsWorkplace : false
        };
        context.state.deviceList.splice(1, 0, _freeDevice);
        return _freeDevice;
    },
    UPDATE_DEVICELIST_WEBRTCLBLS: (context, list) => {
        list.forEach(device => {
            if(device.MACAddress.toUpperCase().startsWith("WEBRTC")) {
                device.Name = `${context.state.settings.voipaccounts.webrtcuiname} (${device.Address})`;
            }
        });
    },
    SET_LOGIN_SESSION: (context, session) => {
        return new Promise((resolve, reject) => {
            context.state.loginSession         = session;
            context.state.clientCode           = session.CompanyCode;
            context.state.loginSession.Details.Devices.push({
                Address     : 'Geen Toestel',
                AddressType : 0,
                Default     : false,
                Label       : 'Geen Toestel',
                Priority    : 1,
                RegType     : 0,
            });
            context.state.currentIdentityId    = context.state.loginSession.Details.CurrentOutboundIdentityId;
            let _currentIdentity       = context.state.loginSession.Details.OutboundIdentities.find(i => i.Id === context.state.loginSession.Details.CurrentOutboundIdentityId);
            if ( _currentIdentity && _currentIdentity.Name ) {
                context.state.currentIdentity = _currentIdentity.Name;
                resolve();
            } else {
                IPCCCCallControl.SetOutboundIdentity(-1)  // set to default because
                .then(() => {
                    context.commit('SET_CURRENT_IDENTITY', -1)
                    resolve();
                })
                .catch(error => {
                    console.log(error);
                    reject();
                });
            }
        });
    },
}