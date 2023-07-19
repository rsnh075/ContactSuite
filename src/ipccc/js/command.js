import { IPCCCManager, IPCCCMessageTypes } from './manager.js';

class IPCCCCommand {
    static Init = debug => {
        if (debug) {
            window.IPCCCCommand = IPCCCCommand;
        }

    }

    static Request = (command, data) => {
        var request = {
            Command: command,
            Data: JSON.stringify(data)
        };

        return IPCCCManager.SendMessage(IPCCCMessageTypes.CommandRequest, request);
    };
}

IPCCCCommand.Init(typeof window.IPCCCDebug !== "undefined" && window.IPCCCDebug);

export { IPCCCCommand }