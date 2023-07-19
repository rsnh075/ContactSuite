import { IPCCCManager, IPCCCMessageTypes } from './manager.js';
import { EventDispatcher }                 from '../lib/eventdispatcher.js';

class IPCCCPriorityLine {
    static PriorityLine = new EventDispatcher(null, false);

    static Last = () => IPCCCPriorityLine.PriorityLine.LastData ? IPCCCPriorityLine.PriorityLine.LastData[0] : null;

    static Init = debug => {
        if (debug) {
            window.IPCCCPriorityLine = IPCCCPriorityLine;
        }
        IPCCCManager.MessageReceived.addHandler(IPCCCPriorityLine.ProcessReceived)
    }

    static ProcessReceived = message => {
        if (message.Type === IPCCCMessageTypes.InterfaceControl) {
            IPCCCPriorityLine.ProcessInterfaceControl(message.Data);
        }
    }

    static TakeOverPriorityLine = () => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.TakeOverPriorityLine);
    }

    static ProcessInterfaceControl = (interfaceControl) => {
        //PriorityLine
        if (interfaceControl.PriorityLine && ((interfaceControl.Commands == null || interfaceControl.Commands.length == 0) && !interfaceControl.Message)) {
            //Getting the last data from the priorityline
            // var last = IPCCCPriorityLine.Last();

            // if ((last === null && interfaceControl.PriorityLine.Active) ||
            //     (last !== null && (last.Active !== interfaceControl.PriorityLine.Active ||
            //         last.IsNew !== interfaceControl.PriorityLine.IsNew))) {

            //     //Calling the eventhandler which also saves the lastdata
            // }
            IPCCCPriorityLine.PriorityLine.invoke(interfaceControl.PriorityLine);
        }
    }
}

IPCCCPriorityLine.Init(typeof window.IPCCCDebug !== "undefined" && window.IPCCCDebug);

export { IPCCCPriorityLine }