import { IPCCCManager, IPCCCMessageTypes } from './manager.js';

class IPCCCUserSettings {
    static Get = (appId) => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.GetUserSettings, appId, undefined, undefined, false);
    }

    static Delete = (appId, name) => {
        return IPCCCUserSettings.Save(appId, name, null);
    }

    static Save = (appId, name, data) => {
        var userSetting =
        {
            AppId: appId,
            Name: name,
            Data: data
        };

        return IPCCCManager.SendMessage(IPCCCMessageTypes.SaveUserSetting, userSetting, undefined, undefined, false);
    }
}

export { IPCCCUserSettings }