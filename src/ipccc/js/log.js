import { IPCCCManager, IPCCCMessageTypes } from './manager.js';

class LogType {
    static Debug = 0;
    static Info = 1;
    static Warning = 2;
    static Error = 3;
    static Fatal = 99;
}

class LogMessage {
    LogType = -1;
    Message = "";
    Location = "";
    ProgId = "";
    Machine = "";

    constructor(message, logType, location, progId, machine) {
        this.Message = message;
        this.LogType = logType || LogType.Debug;
        this.Location = location || "IPCCC JavaScript F/W";
        this.ProgId = progId || "";
        this.Machine = machine || "";
    }
}

class IPCCCLog {
    static Write = (message, logType, location, progId, machine) => {
        return IPCCCLog.WriteLog(new LogMessage(message, logType, location, progId, machine));
    }

    static WriteLog = (logMessage) => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.LogMessage, logMessage, undefined, undefined, false);
    }
}

export { IPCCCLog, LogType, LogMessage }