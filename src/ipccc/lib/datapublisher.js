import { Logging, LoggingLevel } from '../lib/logging.js';

class DataPublisher {
    Subscriptions = new Map();

    GetSubscription = (name, create) => {
        var subscription = this.Subscriptions.get(name);

        if (!subscription && create) {
            subscription = new SubscriptionData(name);
            this.Subscriptions.set(name, subscription);
        }

        return subscription;
    }

    UpdateListeners = (name, ...args) => {
        var subscription = this.GetSubscription(name, false);

        if (subscription) {
            subscription.LastData = args;

            subscription.Callbacks.map(cb => {
                try {
                    cb(...args);
                } catch(err) {
                    console.error(`An unknown error occurred on a DataPublisher: ${name}' ${err.stack}`);
                }
            });
        }
        else {
            Logging.WriteMessageConditional(LoggingLevel.Warn, `[datapublisher.js] Data received unknown publisher: '${name}'`, args);
        }
    }

    Subscribe = (name, callback, sendLastData) => {
        if (typeof sendLastData === "undefined") {
            sendLastData = true;
        }

        var subscription = this.GetSubscription(name, true);

        if (subscription.Add(callback)) {
            if (subscription.Callbacks.length > 1 && sendLastData) {
                callback(...subscription.LastData);
            }

            return subscription.Callbacks.length === 1;
        }

        return false;
    }

    Desubscribe = (name, callback) => {
        var subscription = this.GetSubscription(name, true);

        return subscription && subscription.Remove(callback) && subscription.Callbacks.length === 0;
    }
}

class SubscriptionData {
    Callbacks = new Array();

    Name = "";

    LastData = null;

    constructor(name) {
        this.Name = name;
    }

    Add = callback => {
        if (this.Callbacks.findIndex(cb => cb === callback) === -1) {
            this.Callbacks.push(callback);
            return true;
        }

        return false;
    }

    Remove = callback => {
        var idx = this.Callbacks.findIndex(cb => cb === callback);

        if (idx > -1) {
            this.Callbacks.splice(idx, 1);
            return true;
        }

        return false;
    }
}

export { DataPublisher }