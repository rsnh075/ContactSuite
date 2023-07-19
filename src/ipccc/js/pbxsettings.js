import { IPCCCManager, IPCCCMessageTypes } from './manager.js';

class IPCCCPBXSettings {
    static Get = () => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.GetPBXSettings);
    }

    static Save = (settings) => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.SavePBXSettings, settings);
    }
}

export { IPCCCPBXSettings };