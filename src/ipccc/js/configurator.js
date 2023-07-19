import { AsyncPromise } from '../lib/asyncpromise.js';
import { IPCCCManager, IPCCCMessageTypes } from './manager.js';

class ConfiguratorMessage {
    CustomerId;
    DataItem;
    DataOperation;
    DataValue;
    Id;
    RequestId;

    constructor(customerId, dataItem, dataOperation, dataValue, id, requestId) {
        if (!customerId) { customerId = -1; }
        if (!dataItem) { dataItem = ""; }
        if (!dataOperation) { dataOperation = ""; }
        if (!dataValue) { dataValue = ""; }
        if (!id) { id = ""; }
        if (!requestId) { requestId = ""; }

        this.CustomerId = customerId;
        this.DataItem = dataItem;
        this.DataOperation = dataOperation;
        this.DataValue = dataValue;
        this.Id = id;
        this.RequestId = requestId;
    }
}

class IPCCCConfigurator {
    static Init = debug => {
        if (debug) {
            window.IPCCCConfigurator = IPCCCConfigurator;
        }
        IPCCCManager.MessageReceived.addHandler(IPCCCConfigurator.ProcessReceived)
    };

    static GetCustomers = () => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.GetCustomers);
    }

    static FunctionList = (customerId) => {
        return IPCCCConfigurator.Request(customerId, "functionlist", "readall");
    }

    static Request = (customerId, dataItem, dataOperation, dataValue, id, timeout) => {
        if (dataValue) {
            dataValue = JSON.stringify(dataValue);
        }

        var promise = IPCCCManager.CreateCallback(timeout);

        IPCCCManager.SendMessage(
            IPCCCMessageTypes.ConfiguratorData,
            new ConfiguratorMessage(customerId, dataItem, dataOperation, dataValue, id, promise.Id), null, null, false);

        return promise.Promise;
    }

    static ProcessReceived = message => {
        if (message.Type === IPCCCMessageTypes.ConfiguratorData) {
            var data = message.Data;

            var promise = AsyncPromise.retrieve(parseInt(data.RequestId))

            if (data.Result) {
                var object = JSON.parse(data.DataValue);
                if (data.DataOperation === "readone" && Array.isArray(object) && object.length === 1) {
                    object = object[0];
                }

                promise.then(object);
            }
            else {
                promise.catch(data.ResultDescription);
            }
        }
    };
}

IPCCCConfigurator.Init(typeof window.IPCCCDebug !== "undefined" && window.IPCCCDebug);

export { IPCCCConfigurator };

