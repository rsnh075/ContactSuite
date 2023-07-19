import { IPCCCManager, IPCCCMessageTypes } from './manager.js';
import { EventDispatcher } from '../lib/eventdispatcher.js';
import { Lines } from './linedata.js';

class SupervisorStatus {
    static NoSupervisor = 'NoSupervisor';
    static Idle = 'Idle';
    static Listen = 'Listen';
    static Coaching = 'Coaching';
    static Joined = 'Joined';
}

class IPCCCSupervisor {
    static AgentEvent = new EventDispatcher();

    static SetSupervisedAgent = (userId) => {
        return new Promise((resolve, reject) => {
            IPCCCManager.SendMessage(IPCCCMessageTypes.SetSupervisedAgent, userId, null, 30, false)
            .then(response => {
                if (response.Notification && response.Notification.length > 0) {
                    var notification = response.Notification[0];

                    resolve(notification.Message);
                }
            })
            .catch(err => {
                if (err.Message) {
                    reject(err.Message);
                }
                else {
                    reject(err);
                }
            });
        })
    }

    static Listen = () => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.SupervisorListen);
    }

    static Coach = () => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.SupervisorCoach);
    }

    static Join = () => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.SupervisorJoin);
    }

    static MuteAgent = () => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.MuteAgent);
    }

    static HangupAgent = () => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.SupervisorHangupAgent);
    }

    static SetUserStatus = (userId, statusId, message) => {
        var setUserStatusObject = {
            UserId: userId,
            StatusId: statusId,
            Message: message || ""
        };

        return IPCCCManager.SendMessage(IPCCCMessageTypes.SupervisorSetUserStatus, setUserStatusObject);
    }

    static LogoutUser = (userId) => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.SupervisorLogoutUser, userId);
    }

    static SubscribeToAgentInformation = (userId) => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.SubscribeToAgentInformation, userId);
    }

    static DeSubscribeFromAgentInformation = (userId) => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.DeSubscribeFromAgentInformation, userId);
    }

    static Init = debug => {
        if (debug) {
            window.IPCCCSupervisor = IPCCCSupervisor;
        }
        IPCCCManager.MessageReceived.addHandler(IPCCCSupervisor.ProcessReceived)
    }

    static ProcessReceived = message => {
        if (message.Type === IPCCCMessageTypes.AgentInformation) {
            var agentInfo = new Lines(message.Data);
            IPCCCSupervisor.AgentEvent.invoke(agentInfo);
        }
    }
}

IPCCCSupervisor.Init(typeof window.IPCCCDebug !== "undefined" && window.IPCCCDebug);

export { IPCCCSupervisor, SupervisorStatus }