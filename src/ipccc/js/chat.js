import { IPCCCManager, IPCCCMessageTypes } from './manager.js';
import { EventDispatcher } from '../lib/eventdispatcher.js';

class IPCCCChat {
    _registerInProgress = false;
    Isregistered = true;

    static ChatReceived = new EventDispatcher(null, false);
    static IncomingChatCancelled = new EventDispatcher(null, false);

    static Init = debug => {
        if (debug) {
            window.IPCCCChat = IPCCCChat;
        }
        IPCCCManager.MessageReceived.addHandler(IPCCCChat.ProcessReceived)
    }

    static Register = (chatAddress) => {
        return new Promise((resolve, reject) => {
            if (IPCCCChat._registerInProgress) {
                reject("Register in progress!");
                return;
            }

            IPCCCChat._registerInProgress = true;

            IPCCCManager.SendMessage(IPCCCMessageTypes.ChatRegister, chatAddress)
                .then(result => {
                    IPCCCChat._registerInProgress = false;
                    resolve(result);
                }).catch(err => {
                    IPCCCChat._registerInProgress = false;
                    reject(err);
                });
        });
    }

    static Accept = () => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.AcceptChat);
    }

    static Reject = () => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.RejectChat);
    }

    static Chat = (chatId) => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.EndChat, chatId);
    }

    static Transfer = (chatId, toChatId) => {
        var transferRequest = {
            ChatId: chatId,
            ToChatId: toChatId
        };

        return IPCCCManager.SendMessage(IPCCCMessageTypes.ChatTransfer, transferRequest);
    }

    static Callout = userId => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.ChatCallout, userId);
    }

    static ProcessReceived = message => {
        switch (message.Type) {
            case IPCCCMessageTypes.ChatReceived:
                IPCCCChat.ChatReceived.invoke(message.Data);
                break;
            case IPCCCMessageTypes.IncomingChatCancelled:
                IPCCCChat.IncomingChatCancelled.invoke();
                break;
        }
    }
}

IPCCCChat.Init(typeof window.IPCCCDebug !== "undefined" && window.IPCCCDebug);

export { IPCCCChat }