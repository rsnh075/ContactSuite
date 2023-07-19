import { IPCCCManager, IPCCCMessageTypes } from './manager.js';
import { EventDispatcher } from '../lib/eventdispatcher.js';

class IPCCCMessaging {
    static Received = new EventDispatcher();

    static Init = debug => {
        if (debug) {
            window.IPCCCMessaging = IPCCCMessaging;
        }
        IPCCCManager.MessageReceived.addHandler(IPCCCMessaging.ProcessReceived)
    }

    //toSessionId get from IPCCCContacts.CachedContactList
    static Post = (toSessionId, type, data) => {
        var message =
        {
            ToSessionIds: [toSessionId],
            Type: type,
            Data: JSON.stringify(data)
        };

        return IPCCCManager.SendMessage(IPCCCMessageTypes.PostMessage, message);
    }

    static ProcessReceived = message => {
        if (message.Type === IPCCCMessageTypes.ReceivedMessage) {
            IPCCCMessaging.Received.invoke(message.Data.Type, message.Data.Data);
        }
    }
}

IPCCCMessaging.Init(typeof window.IPCCCDebug !== "undefined" && window.IPCCCDebug);

export { IPCCCMessaging }