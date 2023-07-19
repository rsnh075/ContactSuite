import { IPCCCManager, IPCCCMessageTypes } from './manager.js';
import { EventDispatcher } from '../lib/eventdispatcher.js';
import { Lines } from './linedata.js';
import { IPCCC } from './ipccc.js';

class DeviceAddressType {
    static PhoneNumber = 0;
    static WorkPlace = 1;
}

class UnknownDeviceResult {
    static DeviceNoReply = 0;
    static IncorrectPincode = 1;
    static DeviceAssociated = 2;
    static IncorrectPhonenumber = 3;
}

class CallOutResult {
    static Answered = 0;
    static Ringing = 1;
    static NumberBusy = 2;
    static NoAnswer = 3;
    static RefusedByUser = 4;
    static NumberUnknown = 5;
    static SessionNotFound = 6;
    static WrongParameters = 7;
    static UnexpectedError = 8;
    static Hangup = 9;
}

class IPCCCCallControl {
    static UnknownDeviceResult = new EventDispatcher(null, false);
    static CallOutResponse = new EventDispatcher(null, false);
    static IncomingCallDetails = new EventDispatcher();
    static LineDetails = new EventDispatcher();
    static AgentEvent = new EventDispatcher(null, false);

    static Init = debug => {
        if (debug) {
            window.IPCCCCallControl = IPCCCCallControl;
        }
        IPCCCManager.MessageReceived.addHandler(IPCCCCallControl.ProcessReceived)
    }

    static SetDevice = (address, deviceAddressType) => {
        var device = new Object({ AddressType: deviceAddressType, Address: address });

        return new Promise((resolve, reject) => {
            IPCCCManager.SendMessage(IPCCCMessageTypes.SetDevice, device)
                .then(result => {
                    if (result.Pincode === "") {
                        IPCCCCallControl.ProcessSetDeviceResult(address);
                    }

                    resolve(result);
                }).catch(err => reject(err));
        });
    }

    static ProcessSetDeviceResult = (address) => {
        IPCCC.LoginSession.PhoneNumber = address;
    }

    static GetCallOutProfiles = () => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.GetCallOutProfiles);
    }

    static SetOutboundIdentity = (outboundIdentityId) => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.SetOutboundIdentity, outboundIdentityId);
    }

    static ServiceCall = (number, profile) => {
        return IPCCC.CallOut(number, -1, profile);
    }

    static Call = (number, contactId, profile, timeout) => {
        var call = {
            Number: number,
            ContactId: contactId || -1,
            Profile: profile || "",
            Timeout: timeout || -1
        };

        return IPCCCManager.SendMessage(IPCCCMessageTypes.CallOut, call);
    }

    static ColdTransfer = (numberToTransferTo) => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.ColdTransfer, numberToTransferTo);
    }

    static Transfer = () => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.Transfer);
    }

    static CallWait = () => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.CallWait);
    }

    static Join = () => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.Join);
    }

    static Mute = () => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.Mute);
    }

    static Unmute = () => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.Unmute);
    }

    static Hold = () => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.Hold);
    }

    static Unhold = () => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.Unhold);
    }

    static Hangup = () => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.Hangup);
    }

    static BlockSessions = () => {
        IPCCCManager.SendMessage(IPCCCMessageTypes.BlockSessions);
    }

    static UnBlockSessions = () => {
        IPCCCManager.SendMessage(IPCCCMessageTypes.UnBlockSessions);
    }

    static ProcessReceived = message => {
        switch (message.Type) {
            case IPCCCMessageTypes.UnknownDeviceResult:
                if (message.Data.Result === UnknownDeviceResult.DeviceAssociated) {
                    IPCCCCallControl.ProcessSetDeviceResult(message.Data.Device);
                }
                IPCCCCallControl.UnknownDeviceResult.invoke(message.Data.Result, message.Data.Device);
                break;
            case IPCCCMessageTypes.CallOutResponse:
                IPCCCCallControl.CallOutResponse.invoke(message.Data);
                break;
            case IPCCCMessageTypes.IncomingCallDetails:
                IPCCCCallControl.IncomingCallDetails.invoke(message.Data);
                break;
            case IPCCCMessageTypes.LineDetails:
                var lineData = new Lines(message.Data);
                IPCCCCallControl.LineDetails.invoke(lineData);
                break;
            case IPCCCMessageTypes.AgentEvent:
                IPCCCCallControl.AgentEvent.invoke(message.Data);
                break;
        }
    }
}

IPCCCCallControl.Init(typeof window.IPCCCDebug !== "undefined" && window.IPCCCDebug);

export { IPCCCCallControl, DeviceAddressType, UnknownDeviceResult, CallOutResult }