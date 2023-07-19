const VERSION = '1.0.1';
const LOCATION = location.href.substr(0, location.href.lastIndexOf('/'));
const APPURL = `https://${location.hostname}`;

// console.log(`Loading PushService, version: ${VERSION}`);
// Change Version to reregister. only for debugging perposes.

EventType = {
    ContactSuite: 0,
    ShowMessage: 1,
    NewVersion: 2,
    CloseMessage: 3
}

self.addEventListener('install', event => {
    console.log("...Install...");

    //Explicitely let the ServiceWorker be updated!
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log("...Activate...");

    //Close notifications which should have been closed or are "interactive"
    closeAllCloseable();
});

addEventListener('message', event => {
    var data = event.data;

    // console.log(`[SERVICEWORKER] [${VERSION}] Received a message from the application!`, data);

    switch (data.type) {
        case "started":
        case "activated":
            closeAllCloseable();
            break;
    }
});

self.addEventListener('push', async event => {
    var defaultMessage = {
        Title: "ContactSuite",
        Text: "We need your attention..."
    };

    event.waitUntil(new Promise(async (resolve) => {
        var data = await decodeMessage(event);

        // console.log(`[SERVICEWORKER] [${VERSION}]Received push notification!`, data);

        var options = {
            icon: LOCATION + '/Images/push.png',
            body: data.Message && data.Message.Text ? data.Message.Text : "We need your attention...",
            data: data,
            /*actions: [
                {
                    action: 'show', title: 'Show',
                },
                {
                    action: 'cancel', title: 'Cancel',
                },
            ],*/
            //requireInteraction: true,
        };

        switch (data.Type) {
            case EventType.ContactSuite:
                var eventData = {
                    event: data.Event,
                    data: data.EventData
                };

                getWindow().then(currentWindow => {
                    if (currentWindow) {
                        sendToApp(eventData);

                        if (data.Message.AlwaysShow || currentWindow.visibilityState === "hidden") {
                            showNotification(data.Message && data.Message.Title ? data.Message.Title : defaultMessage.Title, options, data.Message.CloseAfter, data.Message.CloseOnActivate, data.Message.Name);
                        }
                    }
                });

                break;
            case EventType.ShowMessage:
                showNotification(data.Message && data.Message.Title ? data.Message.Title : defaultMessage.Title, options, data.Message.CloseAfter, data.Message.CloseOnActivate, data.Message.Name);
                break;
            case EventType.CloseMessage:
                if (data.Message.Name) {
                    getNotifications().then(notifications => {
                        if (notifications && notifications.length > 0) {
                            var notification = notifications.find(n => n.tag.indexOf(data.Message.Name) > -1);

                            if (notification) {
                                notification.close();
                            }
                        }
                    });
                }
                break;
        }

        resolve();
    }));
});

async function decodeMessage(event) {
    try {
        var data = event.data.text();
        data = await decrypt(data);
        data = data ? JSON.parse(data) : {};

        return data;
    } catch (err) {
        throw new Error("Failed decoding message!", err);
    }
}

function closeAllCloseable() {
    getNotifications().then(notifications => {
        if (notifications && notifications.length > 0) {
            notifications.filter(n => n.tag.startsWith("close_")).map(n => n.close());
        }
    });
}

function showNotification(title, options, closeAfterSeconds, closeOnActivate, name) {
    if (!name) {
        name = '';
    }

    if (closeOnActivate || (closeAfterSeconds && closeAfterSeconds > -1)) {
        name = `close_${Date.now().toString()}` + name;

        if (closeAfterSeconds && closeAfterSeconds > -1) {
            setTimeout(() => {
                getNotifications(name).then(notifications => {
                    if (notifications && notifications.length > 0) {
                        notifications[0].close();
                    }
                });

            }, closeAfterSeconds * 1000);
        }
    }

    options.tag = name;

    self.registration.showNotification(title, options);
}

function openApp(event, openNew) {
    if (typeof (openNew) === "undefined") {
        openNew = false;
    }

    event.waitUntil(
        getWindow().then(currentWindow => {
            if (currentWindow) {
                currentWindow.focus();
            } else if (openNew) {
                clients.openWindow(APPURL);
            }
        }));
}

function sendToApp(data) {
    getWindow().then(currentWindow => {
        if (currentWindow) {
            currentWindow.postMessage(data);
        }
    });
}

function getWindow() {
    return clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then(windowClients => {
        let matchingClient = null;

        for (let i = 0; i < windowClients.length; i++) {
            const windowClient = windowClients[i];
            if (windowClient.url.toString().toLowerCase().startsWith(APPURL)) {
                matchingClient = windowClient;
                break;
            }
        }

        return matchingClient;
    });
}

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    var data = event.notification.data;

    // console.log("Notification clicked, data", data);

    switch (event.action) {
        default:
            if (data && data.URL) {
                clients.openWindow(data.URL);
            } else {
                openApp(event, !data || data.Type === EventType.ShowMessage);
            }
            break;
        /*case "show":
        case "cancel":
            break;*/
    }

}, false);

function getNotifications(tag) {
    return new Promise(resolve => {
        self.registration
            .getNotifications({ tag: tag })
            .then(
                notifications => {
                    resolve(notifications);
                });
    });
}

async function decrypt(encrypted) {
    var KEY = "NygiNqgRq5cBAzaaB7zmCphs2rfEYZ1XC07lK5gQ9Bk=";
    var IV_LENGTH_BITS = 128;

    const base64ToBuffer = (base64) => {
        const binary_string = self.atob(base64);
        const len = binary_string.length;
        let bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }

        return bytes.buffer;
    }

    const decryptData = async (key, iv, encryptedText) => {
        var key = await crypto.subtle.importKey(
            "raw",
            key,
            { name: "AES-GCM" },
            true,
            ["decrypt", "encrypt"]
        );

        try {
            var decrypted = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv: iv },
                key,
                encryptedText
            );

            return new TextDecoder().decode(decrypted);
        } catch (ex) {
            console.error("Error: Name: ", ex.name, ", Message: ", ex.message);
        }
    }

    var data = base64ToBuffer(encrypted);
    var iv = data.slice(0, IV_LENGTH_BITS / 8);
    var encryptedText = data.slice(IV_LENGTH_BITS / 8);
    var key = base64ToBuffer(KEY);

    return await decryptData(key, iv, encryptedText);
}