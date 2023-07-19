import { IPCCCManager, IPCCCMessageTypes } from './manager.js';
import { DataPublisher } from '../lib/datapublisher.js';
import { Logging } from '../lib/logging.js';

class IPCCCDataSubscriber {
    static Publisher = new DataPublisher();

    static Init = debug => {
        if (debug) {
            window.IPCCCDataSubscriber = IPCCCDataSubscriber;
        }
        IPCCCManager.MessageReceived.addHandler(IPCCCDataSubscriber.ProcessReceived)
    }

    static ProcessReceived = message => {
        if (message.Type === IPCCCMessageTypes.DataReceived) {
            IPCCCDataSubscriber.Update(message.Data.DataItem, message.Data.Data);
        }
    }

    static Update(dataItem, data) {
        try {
            IPCCCDataSubscriber.Publisher.UpdateListeners(dataItem, JSON.parse(data));
        }
        catch(err) {
            console.error(`An unknown error occurred on a DataSubscriber: ${dataItem}' ${err.stack}`);
        }
    }

    static Subscribe(dataItem, callback) {
        IPCCCDataSubscriber.Publisher.Subscribe(dataItem, callback, false);
    }

    static Desubscribe(dataItem, callback) {
        IPCCCDataSubscriber.Publisher.Desubscribe(dataItem, callback)
    }
}

IPCCCDataSubscriber.Init(typeof window.IPCCCDebug !== "undefined" && window.IPCCCDebug);

export { IPCCCDataSubscriber };