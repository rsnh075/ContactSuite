import { IPCCCManager, IPCCCMessageTypes } from './manager.js';
import { EventDispatcher } from '../lib/eventdispatcher.js';

class RequestObject {
    Number;
    Memo;

    constructor(number, memo) {
        this.Number = number;
        this.Memo = memo || "";
    }
}

class IPCCCWaitingRooms {
    static Update = new EventDispatcher();

    static GetRooms = () => {
        return IPCCCManager.SendMessage(IPCCCManager.GetWaitingRooms);
    }

    static SetCaller = (number, memo) => {
        return IPCCCManager.SetCallerInWaitingRoom(IPCCCMessageTypes.SetCallerInWaitingRoom, new RequestObject(number, memo));
    }

    static GetCaller = (number) => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.GetCallerFromWaitingRoom, new RequestObject(number));
    }

    static Init = debug => {
        if (debug) {
            window.IPCCCWaitingRooms = IPCCCWaitingRooms;
        }
        IPCCCWaitingRooms.MessageReceived.addHandler(IPCCCConfigurator.ProcessReceived)
    }

    static ProcessReceived = message => {
        if (message.Type === IPCCCMessageTypes.WaitingRoomUpdate) {
            IPCCCWaitingRooms.Update.invoke(message.Data);
        }
    }
}

IPCCCWaitingRooms.Init(typeof window.IPCCCDebug !== "undefined" && window.IPCCCDebug);

export { IPCCCWaitingRooms }