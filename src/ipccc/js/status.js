import { IPCCCManager, IPCCCMessageTypes } from './manager.js';
import { EventDispatcher } from '../lib/eventdispatcher.js';

//Status for the agent

class EnumUserStatus {
    static Unknown = -1;
    static LoggedIn = 1;
    static Available = 2;
    static Wrapup = 3;
    static Busy = 4;
    static Unavailable = 5;
    static AvailableWithoutScreen = 6;
    static Email = 7;
    static Break = 8
    static Chat = 9;
    static LoggedOut = 10;
    static AvailablePBX = 11;
    static Chatting = 12;
}

class IPCCCStatus {
    static Changed = new EventDispatcher();
    static Current;
    static List = null;

    static Init = debug => {
        if (debug) {
            window.IPCCCStatus = IPCCCStatus;
        }
        IPCCCManager.MessageReceived.addHandler(IPCCCStatus.ProcessReceived);
    }

    static Set = (status) => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.Status, status);
    }

    static GetStatusList = (targetUserId) => {
        return new Promise(
            (resolve, reject) => {
                if(IPCCCStatus.List == null || typeof targetUserId === undefined) {
                    IPCCCManager.SendMessage(IPCCCMessageTypes.GetStatusList, targetUserId || -1)
                    .then(list => {
                        if(!targetUserId) {
                            IPCCCStatus.List = list;
                        }
                        resolve(list);
                    })
                    .catch(err => reject(err));
                } else {
                    resolve(IPCCCStatus.List);
                }
            }
        )
    }

    static GetStatus = (statusid) => {
        return new Promise(
            (resolve, reject) => {
                IPCCCStatus.GetStatusList()
                .then(statusList => {
                    var status = statusList.find(s => s.StatusId === statusid);
                    if (typeof status === 'undefined') {
                        status = {
                            Color: "",
                            CustomStatus: false,
                            Label: "",
                            Selectable: false,
                            SortValue: -1,
                            StatusId: -1
                        }
                    }
                    resolve(status);
                })
                .catch(err => reject(err));
            }
        );
    }

    static GetSelectableList = () => {
        return new Promise(
            (resolve, reject) => {
                IPCCCStatus.GetStatusList()
                .then(statusList => {
                    let selectableList = statusList.filter(status => status.Selectable);
                    resolve(selectableList)
                })
                .catch(err => reject(err));
        })
    }

    static GetCompanyStatusList = () => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.GetCompanyStatusList);
    }

    static ProcessNewStatus = (status) => {
        IPCCCStatus.Current = {
            Changed: new Date(),
            StatusId: status.Status,
            Timeout: status.StatusTimeout || 0
        }
        IPCCCStatus.Changed.invoke(IPCCCStatus.Current.StatusId, IPCCCStatus.Current.Timeout, IPCCCStatus.Current.Changed);
    }

    static ProcessReceived = message => {
        if (message.Type === IPCCCMessageTypes.Status) {
            IPCCCStatus.ProcessNewStatus(message.Data);
        }
    }
}

IPCCCStatus.Init(typeof window.IPCCCDebug !== "undefined" && window.IPCCCDebug);

export { IPCCCStatus, EnumUserStatus }