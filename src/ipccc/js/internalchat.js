import { IPCCCManager, IPCCCMessageTypes } from './manager.js';
import { EventDispatcher } from '../lib/eventdispatcher.js';

class IPCCCInternalChat {
    static Received = new EventDispatcher();

    static Init = debug => {
        if (debug) {
            window.IPCCCInternalChat = IPCCCInternalChat;
        }
        IPCCCManager.MessageReceived.addHandler(IPCCCInternalChat.ProcessReceived)
    }

    static Send = (request) => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.InternalChat, request);
    }

    static ProcessReceived = (message) => {
        if (message.Type === IPCCCMessageTypes.InternalChat) {
            // IPCCCInternalChat.Received.invoke(message.Data.Type, JSON.parse(message.Data.Data));
            IPCCCInternalChat.Received.invoke(JSON.parse(message.Data));
        }
    }
}

IPCCCInternalChat.Init(typeof window.IPCCCDebug !== "undefined" && window.IPCCCDebug);

export { IPCCCInternalChat }
