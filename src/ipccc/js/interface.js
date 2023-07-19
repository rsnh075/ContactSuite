import { IPCCCManager, IPCCCMessageTypes } from './manager.js';
import { EventDispatcher } from '../lib/eventdispatcher.js';

class IPCCCInterface {
    static Control = new EventDispatcher();
    static PushURL = new EventDispatcher(null, false);
    static ShowMessage = new EventDispatcher(null, false);
   
    static Init = debug => {
            if (debug) {
                window.IPCCCInterface = IPCCCInterface;
            }
        IPCCCManager.MessageReceived.addHandler(IPCCCInterface.ProcessReceived)
    }

    static SetWebcamAddress = (webcamAddress) => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.SetWebcamAddress, webcamAddress);
    }

    static ProcessReceived = message => {
        switch (message.Type) {
            case IPCCCMessageTypes.InterfaceControl:
                IPCCCInterface.ProcessInterfaceControl(message.Data);
                break;
            case IPCCCMessageTypes.PushUrl:
                IPCCCInterface.PushURL.invoke(message.Data);
                break;
        }
    }

    static ProcessInterfaceControl = (interfaceControl) => {
        //Message
        if (interfaceControl.Message) {
            IPCCCInterface.ShowMessage.invoke(interfaceControl.Message.Text, interfaceControl.Message.Caption, interfaceControl.Message.UserCanDiscard);
        }

        //Commands
        if (interfaceControl.Commands && interfaceControl.Commands.length > 0) {
            var commands = {};

            interfaceControl.Commands.map(c => {
                if (c.Name.toLowerCase() === "record") {

                    commands.IsRecording = false;
                    commands.IsRecordingVisible = false;

                    switch (c.Value) {
                        case "0":
                            commands.IsRecordingVisible = true;
                            break;
                        case "1":
                            commands.IsRecording = true;
                            break;
                    }
                } else {
                    commands[c.Name] = c.Value && c.Value !== "" &&
                        (c.Value.toLowerCase() !== "true" && c.Value.toLowerCase() !== "false") ? c.Value : c.Enabled;
                }
            });

            IPCCCInterface.Control.invoke(commands);
        }
    }
}

IPCCCInterface.Init(typeof window.IPCCCDebug !== "undefined" && window.IPCCCDebug);

export { IPCCCInterface }