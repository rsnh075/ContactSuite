class EventDispatcher {
    _handlers = new Array();
    _changedHandler = null;
    _invokeAdded;

    LastData = null;

    constructor(changedHandler, _invokeAdded) {
        this._invokeAdded = typeof _invokeAdded === "undefined" ? true : _invokeAdded;

        this._changedHandler = changedHandler;
    }

    addHandler = handler => {
        if (this._findHandler(handler) === -1) {
            this._handlers.push(handler);

            if (this._invokeAdded && this.LastData !== null) {
                handler(...this.LastData);
            }

            this.callChanged(true, handler);
        }
    }

    removeHandler = handler => {
        var idx = this._findHandler(handler);
        if (idx > -1) {
            this._handlers.splice(idx, 1);

            this.callChanged(false, handler);
        }
    }

    callChanged = (added, handler) => {
        if (this._changedHandler) {
            this._changedHandler(this, added, handler);
        }
    }

    count = () => {
        return this._handlers.length;
    }

    _findHandler = handler => {
        var idx = -1;

        this._handlers.find((h, i) => {
            if (handler === h) {
                idx = i;
                return true;
            }
        });

        return idx;
    }

    invoke = (...args) => {
        this.LastData = args;

        this._handlers.forEach(h => {
            try {
                h(...args);
            }
            catch (err) {
                console.error(`An unknown error occurred on a EventDispatcher: ${err.stack}`);
            }
        });
    }
}

export { EventDispatcher };