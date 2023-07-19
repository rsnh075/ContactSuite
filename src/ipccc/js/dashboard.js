import { IPCCCManager, IPCCCMessageTypes } from './manager.js';
import { DataPublisher } from '../lib/datapublisher.js';

class IPCCCDashboard {
    static Enums =
    {
        CallTypes : {
            PBXInbound: 1,
            PBXOutbound: 2,
            OutboundCampaign: 3,
            IncomingServiceNumber: 4
        }
    }

    static Publisher = new DataPublisher();

    static Init = debug => {
        if (debug) {
            window.IPCCCDashboard = IPCCCDashboard;
        }
        IPCCCManager.MessageReceived.addHandler(IPCCCDashboard.ProcessReceived)
    }

    static ProcessReceived = message => {
        if (message.Type === IPCCCMessageTypes.DashboardUpdate) {
            IPCCCDashboard.Update(message.Data);
        }
    }

    static CorrectSubscriptionName = subscriptionName => {
        return subscriptionName.toUpperCase();
    }

    static Update(update) {
        update.SubscriptionName = IPCCCDashboard.CorrectSubscriptionName(update.SubscriptionName);
        var data = JSON.parse(update.Data);

        IPCCCDashboard.Publisher.UpdateListeners(update.SubscriptionName, data);
    }

    static Subscribe(dashboardName, callback) {
        return new Promise((resolve, reject) => {
            dashboardName = IPCCCDashboard.CorrectSubscriptionName(dashboardName);

            if (IPCCCDashboard.Publisher.Subscribe(dashboardName, callback)) {
                IPCCCDashboard.SendSubscription(dashboardName, true)
                    .then(config => resolve(config))
                    .catch(err => {
                        IPCCCDashboard.Publisher.Desubscribe(dashboardName, callback);

                        reject(err);
                    });

                return;
            }

            resolve();
        });

    }

    static Desubscribe(dashboardName, callback) {
        dashboardName = IPCCCDashboard.CorrectSubscriptionName(dashboardName);

        if (IPCCCDashboard.Publisher.Desubscribe(dashboardName, callback)) {
            IPCCCDashboard.SendSubscription(dashboardName, false);
        }
    }

    static SendSubscription(dashboardName, subscribe) {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.DashboardSubscribe,
            {
                Subscriptions: [ dashboardName ],
                Subscribe: subscribe
            }, null, null, false);
    }
}

IPCCCDashboard.Init(typeof window.IPCCCDebug !== "undefined" && window.IPCCCDebug);

export { IPCCCDashboard };
