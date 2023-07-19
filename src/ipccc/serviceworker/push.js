import { IPCCC } from '../js/ipccc.js';
import { EventDispatcher } from '../lib/eventdispatcher.js';
import lifecycle from 'page-lifecycle';

class IPCCCPush {
    static NotificationReceived = new EventDispatcher();
    static _serviceWorker = null;

    static Enabled = false;

    static PermissionGranted = false;

    static Available = () => {
        return 'serviceWorker' in navigator && 'PushManager' in window;
    }

    static Enable = async () => {
        if (!IPCCCPush.Enabled && IPCCCPush.PushEnabled() && IPCCCPush.Available()) {
            try {
                await IPCCCPush.AskPermission();

                var reg = await navigator.serviceWorker.register(window.siteroot + 'assets/serviceworker/push-service.js');

                var sub = await IPCCCPush.WaitForSWPushRegistration(reg);

                IPCCC.SendPushSubscription(sub);

                IPCCCPush.Enabled = true;

                //Also needs the library lifecycle.js
                IPCCCPush.DetectLifeCycleEvents();

                IPCCCPush.ReceiveEvents();

                IPCCCPush.SendMessage2ServiceWorker("started");

                //Check force update check of the service-worker
                reg.update();
            }
            catch (err){
                console.warn(err);
            }
        }
    }

    static PushEnabled = () => {
        return true; //typeof (IPCCCSettings.PushEnabled) !== "undefined" && IPCCCSettings.PushEnabled;
    }

    static ReceiveEvents = event => {
        navigator.serviceWorker.onmessage = event => {
            var evt = event.data;

            console.log("[PUSH] EVENT received!", evt);

            // IPCCCManager.UpdateWidgets("PushNotificationEvent", evt);
            IPCCCPush.NotificationReceived.invoke(evt);
        };
    }

    static DetectLifeCycleEvents = () => {
        lifecycle.addEventListener('statechange', function (event) {
            //console.log(event.oldState, event.newState);
            if (event.newState === "active") {
                IPCCCPush.SendMessage2ServiceWorker("activated");
            }
        });
    }

    static SendMessage2ServiceWorker = async (type, data) => {
        //TODO: Optimize when needed don't need the register...
        var serviceWorker = await navigator.serviceWorker.register(window.siteroot + 'assets/serviceworker/push-service.js');

        if (serviceWorker.active) {
            serviceWorker.active.postMessage({
                type: type,
                data: data
            });
        } else {
            console.error("Cannot send message to serviceWorker!");
        }
    }

    /*
     * TODO: When to call reject?
    */
    static WaitForSWPushRegistration = async reg => {
        return new Promise((resolve, reject) => {
            var serviceWorker = reg.installing || reg.waiting || reg.active;

            if (serviceWorker) {
                if (serviceWorker.state === "activated") {
                    resolve(IPCCCPush.SubscribeToPushService(reg));
                } else {
                    serviceWorker.addEventListener("statechange",
                        async e => {
                            if (e.target.state === "activated") {
                                resolve(IPCCCPush.SubscribeToPushService(reg));
                            }
                        });
                }
            } else {
                reject();
            }
        });
    }

    /*
     * TODO: ServerKey in a configuration and/or retrieve from server!
     */
    static SubscribeToPushService = reg => {
        const subscribeOptions = {
            userVisibleOnly: true,
            applicationServerKey: IPCCCPush.urlBase64ToUint8Array(
                'BL1YdpyHGoyb7V0KpQH6n8P4IK83rdUxbUyKkRGXJuYVDuwPF_grbOxL0uKMsdRxwYN1Xv5gxFcP1lyh83EpmVg'
            )
        };

        return reg.pushManager.subscribe(subscribeOptions);
    }

    // Web-Push
    // Public base64 to Uint
    static urlBase64ToUint8Array = base64String => {
        var padding = '='.repeat((4 - base64String.length % 4) % 4);
        var base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        var rawData = window.atob(base64);
        var outputArray = new Uint8Array(rawData.length);

        for (var i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    }

    static AskPermission = () => {
        return new Promise((resolve, reject) => {
            const permissionResult = Notification.requestPermission(function (result) {
                resolve(result);
            });

            if (permissionResult) {
                permissionResult.then(resolve, reject);
            }
        }).then(result => {
            IPCCCPush.PermissionGranted = result === "granted";

            if (result !== 'granted') {
                throw new Error('Notification permission not granted!');
            }
        });
    }
}

export { IPCCCPush }