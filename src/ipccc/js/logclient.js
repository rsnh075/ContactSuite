import { IPCCCManager, IPCCCMessageTypes } from './manager.js';
import { IPCCC } from './ipccc.js';

class LogRequest {
    QueryName = "";
    FromDT = null;
    TillDT = null;
    Size = -1;
    StartFrom = -1;
    Realtime = false;
    CustomerId = IPCCC.LoginSession.Details.CustomerId;
    AdditionalParameters = null;

    constructor(queryName, customerId, realtime, from, till, size, startFrom,  additionalParameters) {
        this.QueryName = queryName;
        if (customerId) { this.CustomerId = customerId; }
        if (realtime) { this.Realtime = true; }
        this.FromDT = from;
        this.TillDT = till;      
        if (size) { this.Size = size; }
        if (startFrom) { this.StartFrom = startFrom; }      
        if (additionalParameters) { this.AdditionalParameters = additionalParameters; }
    }
}

class IPCCCLogClient {
    static AuditLog = (from, till, customerId, size, startFrom) => {
        return IPCCCLogClient.Send(
            new LogRequest("auditlog", customerId, false, from, till, size, startFrom), "timestamp");
    }

    static SecurityLog = (from, till, customerId, realtime, size, startFrom) => {
        return IPCCCLogClient.Send(
            new LogRequest("securitylog", customerId, realtime, from, till, size, startFrom), "timestamp");
    }

    static UnknownCustomerLog = (from, till, realtime, size, startFrom) => {
        return IPCCCLogClient.Send(
            new LogRequest("unknowncustomer", -1, realtime, from, till, size, startFrom), "timestamp");
    }

    static BE_IncomingCalls = (from, till, phoneNumber, size, startFrom) => {
        return IPCCCLogClient.Send(
            new LogRequest("be_incomingcalls", -1, false, from, till, size, startFrom, [ phoneNumber ]), "@timestamp", "timestamp");
    }

    static BE_ReceivedFaxes = (from, till, size, startFrom) => {
        return IPCCCLogClient.Send(
            new LogRequest("be_receivedfaxes", -1, false, from, till, size, startFrom), "@timestamp", "timestamp");
    }

    static WFM_UnconfiguredNumbers = (from, till, size, startFrom) => {
        return IPCCCLogClient.Send(
            new LogRequest("wfm_unconfigurednumbers", -1, false, from, till, size, startFrom), "datum");
    }

    static WFM_UnconfiguredNumbersCount = (from, till, size, startFrom) => {
        return IPCCCLogClient.Send(
            new LogRequest("wfm_count_unconfigurednumbers", -1, false, from, till, size, startFrom));
    }

    static WFM_FaxReceived = (from, till, size, startFrom) => {
        return IPCCCLogClient.Send(
            new LogRequest("wfm_faxreceived", -1, false, from, till, size, startFrom), "datum");
    }

    static Switch_UnconfiguredNumbers = (from, till, size, startFrom) => {
        return IPCCCLogClient.Send(
            new LogRequest("switch_unknownnumbers", -1, false, from, till, size, startFrom), "timestamp");
    }

    static Switch_UnconfiguredNumbersCount = (from, till, size, startFrom) => {
        return IPCCCLogClient.Send(
            new LogRequest("switch_count_unknownnumbers", -1, false, from, till, size, startFrom));
    }

    static WFM_KilledByWatchdog = (from, till, size, startFrom) => {
        return IPCCCLogClient.Send(
            new LogRequest("wfm_killedbywatchdog", -1, false, from, till, size, startFrom), "datum");
    }

    static MessagingAPI_Log = (from, till, received_id, sent_id) => {
        if (!received_id) { received_id = -1; }
        if (!sent_id) { sent_id = -1; }

        return IPCCCManager.SendMessage(IPCCCMessageTypes.LogRequestData,
            new LogRequest("messagingapi_log", -1, false, from, till, -1, -1, [ received_id, sent_id ]));
    }

    static MessagingAPI_Sent = (from, till, customerId) => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.LogRequestData,
            new LogRequest("messagingapi_sent", customerId, false, from, till));
    }

    static MessagingAPI_Received = (from, till, customerId) => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.LogRequestData,
            new LogRequest("messagingapi_received", customerId, false, from, till));
    }

    static SessionLog = (sessionId) => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.LogRequestData,
            new LogRequest("sessionlog", -1, false, undefined, undefined, -1, -1, [ sessionId ] ));
    }

    static Send(logRequest, dtField, dtDestinationField) {
        return new Promise((resolve, reject) => {
                IPCCCManager.SendMessage(IPCCCMessageTypes.LogRequestData, logRequest)
                    .then(response => {
                        response.Records = JSON.parse(response.Records);

                        if (dtField) {
                            if (!dtDestinationField) {
                                dtDestinationField = dtField;
                            }

                            response.Records.map(record => {
                                record[dtDestinationField] = new Date(record[dtField]);
                            });
                        }

                        resolve(response);
                    }).catch(err => reject(err));
            });
    }
}

export { IPCCCLogClient }