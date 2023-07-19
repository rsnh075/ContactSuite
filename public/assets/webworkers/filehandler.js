const VERSION = '1.2';
const HEADERNAME = 'Authorization';

var AuthorizationToken = null;
var MediaStreamingURL = null;

self.addEventListener('install',
    _ => {
        //Explicitely let the ServiceWorker be updated!
        return self.skipWaiting();
    });

self.addEventListener('activate',
    _ => {
        //Directly use this service-worker
        return self.clients.claim();
    });

self.addEventListener('message',
    evt => {
        var msg = evt.data;
        switch (msg.type) {
            case 'AuthorizationToken':
                AuthorizationToken = msg.token;
                break;
            case 'MediaStreamingURL':
                MediaStreamingURL = msg.url;
                break;
        }
    });

self.addEventListener('fetch',
    evt => {
        if (AuthorizationToken != null && MediaStreamingURL != null && evt.request.url.toLowerCase().startsWith(MediaStreamingURL.toLowerCase())) {
            var req = evt.request;

            //recreating the headers-object, because inmuteable
            var headers = new Headers();
            if (req.headers != null) {
                for (const pair of req.headers.entries()) {
                    if (pair[0] !== HEADERNAME) { //don't add the header if already set, must be overwritten!
                        headers.append(pair[0], pair[1]);
                    }
                }
            }
            headers.append(HEADERNAME, `Bearer ${AuthorizationToken}`);

            evt.respondWith(fetch(req.url, {
                credentials: req.credentials,
                mode: "cors", //hardcoded to cors, so the additional header can be added
                method: req.method,
                headers: headers,
                redirect: req.redirect,
                referrerPolicy: req.referrerPolicy,
                body: req.body
            }));
        }
    });