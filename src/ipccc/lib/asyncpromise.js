class Request {
    id = -1;
    resolve = null;
    reject = null;
    expires = null;

    constructor(id, timeout) {
        this.id = id;

        if (timeout > 0) {
            this.expires = new Date();
            this.expires.setSeconds(this.expires.getSeconds() + timeout);
        }
    }

    then = (...data) => {
        if (this.resolve) {
            this.resolve(...data);
        }
    }

    catch = (error) => {
        if (this.reject) {
            this.reject(error);
        }
    }
}

class AsyncPromise {
    static DEFAULTTIMEOUT = 30;

    static _timeoutId = -1;

    static requests = new Array();

    static create = (id, timeout) => {
        var apromise = new Request(id, timeout || AsyncPromise.DEFAULTTIMEOUT);

        AsyncPromise.requests.push(apromise);

        AsyncPromise.startstopTimeouts();

        var p = new Promise((res, rej) => {
            apromise.resolve = res;
            apromise.reject = rej;
        });

        return p;
    };

    static retrieve = (id) => {
        var p = -1;

        var request = AsyncPromise.requests.find((req, idx) => {
            if (req.id === id) {
                p = idx;
                return true;
            }

            return false;
        });

        if (request) {
            AsyncPromise.requests.splice(p, 1);

            AsyncPromise.startstopTimeouts();
        }

        return request;
    }

    static startstopTimeouts = () => {
        switch (AsyncPromise.requests.length) {
            case 1:
                if (AsyncPromise._timeoutId === -1) {
                    AsyncPromise._timeoutId = setInterval(AsyncPromise.checkTimeouts, 1000);
                }
                break;
            case 0:
                if (AsyncPromise._timeoutId !== -1) {
                    clearInterval(AsyncPromise._timeoutId);
                    AsyncPromise._timeoutId = -1;
                }
        }
        
    }

    static checkTimeouts = () => {
        var timedOut = new Array();

        AsyncPromise.requests.forEach((request, idx) => {
            if (request.expires && request.expires < new Date()) {
                request.catch("Request timed out!");
                timedOut.push(idx);
            }
        });

        if (timedOut.length > 0) {
            timedOut.forEach(index => {
                AsyncPromise.requests.splice(index, 1);
            });

            AsyncPromise.startstopTimeouts();
        }
    }
}

export { AsyncPromise };