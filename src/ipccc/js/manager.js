import { Notification } from './notification.js';
import { Connection } from '../lib/connection.js';
import { AsyncPromise } from '../lib/asyncpromise.js';
import { EventDispatcher } from '../lib/eventdispatcher.js';
import { IPCCC } from './ipccc.js';
import { Logging } from '../lib/logging.js';
import { currentLocalDateTimeISO } from '../../use/dateFunctions';

class IPCCCMessageTypes {
    static SessionLoggedOut = 0;
    static SessionId = 1;
    static Login = 2;
    static Logout = 3;
    static Result = 4;
    static Status = 5;
    static IncomingCallDetails = 6;
    static SetDevice = 7;
    static UnknownDeviceResult = 8;
    static CallOut = 9;
    static Hangup = 10;
    static Mute = 11;
    static Unmute = 12;
    static Hold = 13;
    static Unhold = 14;
    static GetStatusList = 15;
    static ColdTransfer = 16;
    static LineDetails = 17;
    static GetContactList = 18;
    static ContactUpdate = 19;
    static InterfaceControl = 20;
    static Transfer = 21;
    static CallWait = 22;
    static Join = 23;
    static PushUrl = 24;
    static GetUserList = 25;
    static SetOutboundIdentity = 26;
    static SetSupervisedAgent = 27;
    static SupervisorListen = 28;
    static SupervisorCoach = 29;
    static SupervisorJoin = 30;
    static SupervisorMuteAgent = 31;
    static SupervisorHangupAgent = 32;
    static SupervisorSetUserStatus = 33;
    static SupervisorLogoutUser = 34;
    static SubscribeToAgentInformation = 35;
    static AgentInformation = 36;
    static DeSubscribeFromAgentInformation = 37;
    static SetWebcamAddress = 38;
    static GetPBXSettings = 39;
    static SavePBXSettings = 40;
    static ChangePassword = 41;
    static BlockSessions = 42;
    static UnBlockSessions = 43;
    static PostMessage = 44;
    static ReceivedMessage = 45;
    static CallOutResponse = 46;
    static GetCallOutProfiles = 47;
    static GetWaitingRooms = 48;
    static SetCallerInWaitingRoom = 49;
    static GetCallerFromWaitingRoom = 50;
    static WaitingRoomUpdate = 51;
    static AgentEvent = 52;
    static GetContactReasons = 53;
    static SetCDC = 54;
    static IsUserLoggedIn = 55;
    static GetCompanyStatusList = 56;
    static LogMessage = 57;
    static TakeOverPriorityLine = 58;
    static InternalChat = 59;
    static GetUserSettings = 60;
    static SaveUserSetting = 61;
    static SetDisconnectedGUI = 62;

    //CHAT-ControlMessages(UserAPI)
    static ChatCallout = 200;

    //SUBSCRIPTIONS
    static EnableContactUpdates = 1000;
    static DisableContactUpdates = 1001;

    //CHAT
    static ChatRegister = 10000;
    static ChatReceived = 10001;
    static AcceptChat = 10002;
    static RejectChat = 10003;
    static EndChat = 10004;
    static ChatTransfer = 10005;
    static IncomingChatCancelled = 10006;

    //Configurator
    static GetCustomers = 20000;
    static ConfiguratorData = 20001;

    //Dashboards
    static DashboardSubscribe = 30000;
    static DashboardUpdate = 30001;

    //IDenityServer
    static LoginIDS = 40000;

    //DATA
    static RequestData = 50000;
    static DataReceived = 50001;

    //LOGGING
    static LogRequestData = 60000;

    //DEVICE
    static DeviceLogin = 70000;
    static DeviceCommandRequest = 70001;

    //PUSH subscription
    static PushSubscription = 80000;

    //COMMANDREQUEST
    static CommandRequest = 90000;
}

class IPCCCMessage {
    Type = -1;
    Data = null;
    RequestId = -1;
    Successfull = true;

    constructor(type, data, requestId) {
        this.Type = type;
        this.Data = data;

        if (requestId) {
            this.RequestId = requestId;
        }
    }
}

class IPCCCManager {
    static connection = null;
    static requestId = 0;

    static THROTTLEVALUE = 200;
    static lastMessageType = -1;
    static lastMessageSent = new Date();

    static ConnectionReconnected = new EventDispatcher(null, false);
    static ConnectionDisconnected = new EventDispatcher(null, false);
    static ConnectionStatusChanged = new EventDispatcher(null, false);
    static ConnectionFailed = new EventDispatcher(null, false);

    static MessageReceived = new EventDispatcher(null, false);

    static getConnection = () => {
        var connected = false;

        return new Promise((resolve, reject) => {
            if (IPCCCManager.connection) {
                resolve(IPCCCManager.connection);
            }
            else {
                IPCCCManager.connection = new Connection(true, IPCCC.Settings.Server, IPCCC.Settings.Port);

                IPCCCManager.connection.Connected.addHandler(() => {
                    if (!connected) {
                        connected = true;
                        resolve(IPCCCManager.connection);
                    } else {
                        IPCCCManager.ConnectionReconnected.invoke();
                    }
                });
                IPCCCManager.connection.Received.addHandler(IPCCCManager.ProcessReceived);
                IPCCCManager.connection.Disconnected.addHandler(error => {
                    IPCCCManager.ConnectionDisconnected.invoke(error);
                });
                IPCCCManager.connection.ConnectionError.addHandler(() => {
                    if (!IPCCCManager.connected) {
                        reject("Failed to connect...");
                    } else {
                        IPCCCManager.ConnectionFailed.invoke();
                    }

                    connected = false;
                });
                IPCCCManager.connection.StatusChanged.addHandler(status => {
                    IPCCCManager.ConnectionStatusChanged.invoke(status);
                });

                IPCCCManager.connection.Connect();
            }
        });
    }

    static CreateCallback = (timeout) => {
        IPCCCManager.requestId++;

        return {
            Promise: AsyncPromise.create(IPCCCManager.requestId, timeout),
            Id: IPCCCManager.requestId
        }
    }

    static SendMessage = (type, data, promise, timeout, throttle) => {
        throttle = typeof throttle === "undefined" ? true : throttle;
        if (window.debugState) Logging.Console().Info("[" + currentLocalDateTimeISO() + "] [SendMessage params]", type, data, promise, timeout, throttle);

        if (throttle && IPCCCManager.lastMessageType === type && (new Date() - IPCCCManager.lastMessageSent < IPCCCManager.THROTTLEVALUE)) {
            if (typeof window.IPCCCDebug !== "undefined" && window.IPCCCDebug) {
                console.warn(`Message discarded called too soon, messageType: ${type} ${data ? "see object for data:" : ""}`, data);
            }

            return new Promise((_, reject) => reject(new Notification("Framework called to much for the same function!.")));
        }

        if (!(typeof promise === "boolean" && !promise) && !promise) {
            promise = IPCCCManager.CreateCallback(timeout);
        }
        else {
            promise = null;
        }

        IPCCCManager.getConnection()
            .then(connection => {
                IPCCCManager.lastMessageType = type;
                IPCCCManager.lastMessageSent = new Date();

                if (data instanceof Object) {
                    data = JSON.stringify(data);
                }

                var message = new IPCCCMessage(type, data, promise !== null ? promise.Id : -1);

                try {
                    connection.send(message);
                }
                catch {
                    console.error('Failed to send...');
                }
            }).catch(err => {
                promise.catch(`Failed to connect to server, error: ${err}`);
            });

        if (promise !== null) {
            return promise.Promise;
        }
    };

    static ProcessReceived = message => {
        switch (message.Type) {
            case IPCCCMessageTypes.Result:
                IPCCCManager.ProcessResult(message);
                break;
            default:
                IPCCCManager.MessageReceived.invoke(message);
                break;
        }
        if (window.debugState) Logging.Console().Info(`${currentLocalDateTimeISO()}] [ResultMessage data]: `, message);
    };

    static ProcessResult = (message) => {
        var data = message.Data;

        var promise = AsyncPromise.retrieve(message.RequestId);

        if (message.Successfull) {

            promise.then(data.Data || data);

        }
        else {
            var notification = new Notification("An error/unsuccesfull request done, without a notification ?!?!");

            if (data.Notification && data.Notification.length > 0) {
                notification = data.Notification[0];
            }

            promise.catch(notification);
        }
    }

    static makeDataReadable = message => {
        if (message && message.Data && message.Data.Data) {
            try {
                return JSON.parse(message.Data.Data);
            } catch {
                return message.Data.Data;
            }
        } else {
            return message.Data;
        }
    };
}

export { IPCCCManager, IPCCCMessageTypes };