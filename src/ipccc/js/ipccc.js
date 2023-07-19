import { EventDispatcher } from '../lib/eventdispatcher.js';
import { LoadScripts } from '../lib/scriptsloader.js';
import { Utils } from '../lib/utils.js';
import { IPCCCManager, IPCCCMessageTypes } from './manager.js';
import { Logging, LoggingLevel } from '../lib/logging.js';
import { IPCCCLog, LogType } from './log.js';

class IPCCC {
    static _userManager = null;

    static LoginSession = null;

    static SessionId = null;
    static LoggedIn = false;
    static ActiveSession = false;
    static ServiceName = "";

    static Reconnecting        = new EventDispatcher();
    static Reconnected         = new EventDispatcher();
    static Disconnected        = new EventDispatcher();

    static SessionDisconnected = new EventDispatcher();

    static Settings;
    static IDServerConfig;

    static SetConfig = (ipcccConfig, idserverConfig) => {
        IPCCC.Settings = ipcccConfig;
        IPCCC.IDServerConfig = idserverConfig;
    }

    static LoadSettings = () => {

        return new Promise(
            (resolve, reject) => {
                if (!IPCCC.Settings || !IPCCC.IDServerConfig) {
                    reject('set configuration first');
                }
                else {
                    resolve();
                }
            });
    };

    static User = (config) => {
        return new Promise(
            (resolve, reject) => {
                if (config) {
                    //Make config complete with the settings retrieved
                    Utils.Combine(config, IPCCC.IDServerConfig);

                    LoadScripts([import.meta.env.BASE_URL + 'assets/ipcccLib/oidc-client.js'], true, true)
                        .then(_ => {
                            IPCCC._userManager = new Oidc.UserManager(config);
                            IPCCC._userManager.getUser()
                                .then(user => resolve(user))
                                .catch(_ => reject("Failed to retrieve user from IdentityServer!"));
                        }).catch(_ => reject("Failed to load IdentityServer files!"));
                } else {
                    if (!IPCCC._userManager) {
                        reject("Not logged in!");
                    } else {
                        IPCCC._userManager.getUser()
                            .then(user => resolve(user))
                            .catch(err => reject(err));
                    }
                }
            });
    }

    static IsUserLoggedIn = (companycode, username) => {
        return new Promise((resolve, reject) => {
            IPCCC.LoadSettings().then(() => {
                var isUserLoggedInObject = {
                    CompanyCode: companycode,
                    UserName: username
                };

                IPCCCManager.SendMessage(IPCCCMessageTypes.IsUserLoggedIn, isUserLoggedInObject)
                    .then(result => resolve(result !== "", result))
                    .catch(err => reject(err));
            }).catch(err => reject(err));
        });
    }

    static DeviceLogin = (companycode, deviceAddress) => {
        return new Promise((resolve, reject) => {
            IPCCC.LoadSettings()
                .then(() => {
                    var loginObject = {
                        CompanyCode: companycode,
                        DeviceAddress: deviceAddress,
                        URL: window.location.origin + window.location.pathname,
                        UserAgent: navigator.userAgent
                    };

                    IPCCCManager.SendMessage(IPCCCMessageTypes.DeviceLogin, loginObject)
                        .then(loginSession => {
                            IPCCC.LoginSession = loginSession;
                            IPCCC.SessionId = loginSession.SessionId;
                            IPCCC.ActiveSession = true;
                            IPCCC.LoggedIn = true;

                            resolve(loginSession);
                        }).catch(err => reject(err));

                }).catch(err => reject(err));
            });
    }

    static LoginIDS = (companycode, config) => {
        //TODO: Enable the next 2 lines on deployment of the new IdentityServer
        // config.resource = "company_code=massxess"; //Deze alleen aanzetten voor acc
        // config.acr_values = `tenant:${companycode}`;
        return new Promise(
            (resolve, reject) => {
                IPCCC.LoadSettings()
                .then(() => {
                    IPCCC.User(config)
                    .then(user => {
                        if (user && user.expired === false) {
                            var loginObject = new Object({
                                CompanyCode: user.profile.custname,
                                Username: user.profile.loginname,
                                AccessToken: user.access_token,
                                URL: window.location.origin + window.location.pathname,
                                Active: true,
                                UserAgent: navigator.userAgent
                            });

                            IPCCCManager.SendMessage(IPCCCMessageTypes.LoginIDS, loginObject)
                                .then(loginSession => {
                                        loginSession.CompanyCode = user.profile.custname;
                                        IPCCC.LoginSession = loginSession;
                                        IPCCC.SessionId = loginSession.SessionId;
                                    IPCCC.ActiveSession = true;
                                    IPCCC.LoggedIn = true;

                                        resolve(loginSession);
                                }).catch(err => reject(err));
                        } else {
                            //Saving url for callback.html
                            sessionStorage["ipccc_url"] = window.location;

                            //not loggedIn
                            IPCCC._userManager.signinRedirect();
                        }
                    }).catch(err => reject(err));
                }).catch(err => reject(err));
            });
    }

    // static SetSessionId = (reconnect, sessionId, service) => {
    static SetSessionId = (sessionId, service) => {
        IPCCC.SessionId = sessionId ? sessionId : IPCCC.SessionId;
        IPCCC.Service   = service ? service : IPCCC.Service;
        return new Promise((resolve, reject) => {
            IPCCC.LoadSettings()
            .then(() => {
                // return IPCCC._SendSessionId(typeof reconnect === "boolean" ? reconnect : false);
                IPCCC._SendSessionId(false).then(loginSession => {
                    resolve(loginSession)
                });
            }).catch(err => reject(err));
        })

    }

    static _SendSessionId = (reconnect) => {
        var setSessionIdObject =
        {
            SessionId: IPCCC.SessionId,
            ServiceName: IPCCC.Service,
            Reconnect: reconnect
        };

        return new Promise((resolve, reject) => {
            IPCCCManager.SendMessage(IPCCCMessageTypes.SessionId, setSessionIdObject)
                .then(loginSession => {
                    IPCCC.LoginSession = loginSession;

                    if (!reconnect) {
                        IPCCC.ActiveSession = false;
                    }

                    resolve(IPCCC.LoginSession);
                }).catch(err => reject(err));
        });
    }

    static SetDisconnectedGUI = (enabled) => {
        IPCCCManager.SendMessage(IPCCCMessageTypes.SetDisconnectedGUI, JSON.stringify(enabled), true);
    }

    static SendPushSubscription = (sub) => {
        IPCCCManager.SendMessage(IPCCCMessageTypes.PushSubscription, sub);
    }

    static Logout = () => {
        return new Promise(
            (resolve, reject) => {
                if (IPCCC.SessionId !== "") {
                    IPCCCManager.SendMessage(IPCCCMessageTypes.Logout)
                        .then(_ => { resolve(); })
                        .catch(_ => { resolve(); });
                }
                else {
                    reject("Cannot logout when not loggedin!");
                }
            });
    }

    static Init = debug => {
        if (debug) {
            window.IPCCC = IPCCC;
        }

        IPCCCManager.ConnectionStatusChanged.addHandler(status => {
            status ? IPCCC.HandleConnectionReconnected(false) : IPCCC.HandleConnectionDown();
        });
        IPCCCManager.ConnectionDisconnected.addHandler(IPCCC.HandleConnectionDown);
        IPCCCManager.ConnectionReconnected.addHandler(() => IPCCC.HandleConnectionReconnected(true));
        IPCCCManager.ConnectionFailed.addHandler(IPCCC.HandleConnectionFailed);

        IPCCCManager.MessageReceived.addHandler(IPCCC.ProcessReceived);
        Logging.Written.addHandler(IPCCC.HandleConsoleLogMessages);
    }

    static HandleConsoleLogMessages = (level, values) => {
        if (IPCCC.LoggedIn) {
            var message = values[0];
            var logLevel;

            switch (level) {
                case LoggingLevel.Debug:
                    logLevel = LogType.Debug;
                    break;
                case LoggingLevel.Info:
                    logLevel = LogType.Info;
                    break;
                case LoggingLevel.Warn:
                    logLevel = LogType.Warning;
                    break;
                case LoggingLevel.Error:
                    logLevel = LogType.Error;
                    break;
            }

            if (message && logLevel) {
                IPCCCLog.Write(message, logLevel);
            }
        }
    }


    static HandleConnectionDown = () => {
        IPCCC.Reconnecting.invoke();
    }

    static HandleConnectionReconnected = (newConnection) => {
        if (newConnection) {
            if (IPCCC.LoggedIn && IPCCC.ActiveSession) {
                // IPCCC.SetSessionId(true).then(() => {
                IPCCC._SendSessionId(true).then(() => {
                    IPCCC.Reconnected.invoke();
                }).catch(err => {
                    IPCCC.Disconnected.invoke("Failed to re-establish connection with the session!");
                });
            } else {
                IPCCC.Disconnected.invoke();
            }
        } else {
            IPCCC.Reconnected.invoke();
        }
    }

    static HandleConnectionFailed = () => {
        IPCCC.Disconnected.invoke("Failed to reconnect!");
    }

    static ProcessReceived = message => {
        switch (message.Type) {
            case IPCCCMessageTypes.SessionLoggedOut:
                IPCCC.LoginSession = null;
                IPCCC.ActiveSession = false;
                IPCCC.LoggedIn = false;
                if (IPCCC._userManager) {
                    IPCCC._userManager.signoutRedirect();
                } else {
                    IPCCC.SessionDisconnected.invoke();
                }
                break;
        }
    }
}

IPCCC.Init(typeof window.IPCCCDebug !== "undefined" && window.IPCCCDebug);

export { IPCCC };