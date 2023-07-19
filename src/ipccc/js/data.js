//TODO return new promise with JSON parsed result of the returned send message promise.
//TODO then remove the JSON parse everywhere IPCCCData.RequestData is resolved

import { IPCCCManager, IPCCCMessageTypes } from './manager.js';

class IPCCCData {
    static Init = debug => {
        if (debug) {
            window.IPCCCData = IPCCCData;
        }
    }

    static RequestData = (dataItem, parameters) => {
        var request = {
            DataItem: dataItem,
            Data: JSON.stringify(parameters)
        };

        return IPCCCManager.SendMessage(IPCCCMessageTypes.RequestData, request);
    };
}

IPCCCData.Init(typeof window.IPCCCDebug !== "undefined" && window.IPCCCDebug);

export { IPCCCData }